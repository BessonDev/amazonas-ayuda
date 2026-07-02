'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Search, ArrowLeft, Route } from 'lucide-react'

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`

export default function LoteTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const codigo = params.codigo as string
  const [lote, setLote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchLote = async () => {
      try {
        const res = await fetch(`${API_BASE}/publico/lotes/${codigo.trim().toUpperCase()}`)
        if (!res.ok) {
          setNotFound(true)
          return
        }
        const data = await res.json()
        setLote(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (codigo) fetchLote()
  }, [codigo])

  const tipoLabel: Record<string, string> = {
    ENTRADA: 'Registrado',
    ENVIO: 'Despachado',
    RECEPCION: 'Recibido',
    RESERVA: 'Reservado',
    TRANSFERENCIA: 'Transferido',
    AJUSTE: 'Ajustado',
    DISTRIBUCION: 'Distribuido',
    CONSUMO: 'Consumido',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFCF3] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="size-12 rounded-xl bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-4">
            <Package className="size-6 text-[#1B4332]" />
          </div>
          <p className="text-[#5c4f3d]">Buscando lote...</p>
        </div>
      </div>
    )
  }

  if (notFound || !lote) {
    return (
      <div className="min-h-screen bg-[#FEFCF3] flex items-center justify-center px-6">
        <div className="max-w-lg text-center bg-white rounded-2xl p-12 border border-[#e8e0d0] shadow-sm">
          <Link
            href="/lotes"
            className="absolute top-4 left-4 text-[#a09585] hover:text-[#1B4332] transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="size-16 rounded-2xl bg-[#D4A373]/10 flex items-center justify-center mx-auto mb-5">
            <Search className="size-7 text-[#D4A373]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B4332] mb-2">Lote no encontrado</h1>
          <p className="text-[#5c4f3d] mb-6">
            No existe ningún lote con el código <code className="font-mono bg-[#e8e0d0] px-1.5 py-0.5 rounded">{codigo.toUpperCase()}</code>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4332] text-white rounded-xl font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FEFCF3] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#a09585] hover:text-[#1B4332] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>

        <div className="bg-white rounded-2xl p-8 border border-[#e8e0d0] shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-[#1B4332] flex items-center justify-center">
                <Package className="size-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#a09585] uppercase tracking-wider mb-1">Código de lote</p>
                <h1 className="text-2xl font-bold text-[#1B4332] font-mono tracking-wider">{lote.codigo}</h1>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-[#2D6A4F]" />
              {lote.estado}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[#e8e0d0]">
            {[
              { label: 'Producto', value: lote.producto?.nombre ?? '-' },
              { label: 'Cantidad', value: `${lote.cantidad} ${lote.producto?.unidad?.toLowerCase() ?? 'u'}` },
              { label: 'Donante', value: lote.donante?.nombre ?? 'Anónimo' },
              { label: 'Campaña', value: lote.campania?.nombre ?? '-' },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[#a09585] text-xs mb-1">{f.label}</p>
                <p className="font-semibold text-[#1B4332] text-sm">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {lote.movimientos?.length > 0 && (
          <div className="bg-white rounded-2xl p-8 border border-[#e8e0d0] shadow-sm">
            <h2 className="text-lg font-bold text-[#1B4332] mb-8 flex items-center gap-2">
              <Route className="size-5 text-[#D4A373]" />
              Recorrido del lote
            </h2>
            <div className="space-y-0">
              {lote.movimientos.map((mov: any, i: number) => {
                const isLast = i === lote.movimientos.length - 1
                return (
                  <div key={mov.id} className="relative flex gap-6 pb-10 last:pb-0">
                    {!isLast && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-[#D4A373]/30 to-[#D4A373]/5" />
                    )}
                    <div className={`relative shrink-0 size-8 rounded-full border-[3px] flex items-center justify-center ${
                      isLast
                        ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white'
                        : 'border-[#D4A373] bg-white'
                    }`}>
                      {isLast ? '✓' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className={`text-sm font-bold ${isLast ? 'text-[#2D6A4F]' : 'text-[#1B4332]'}`}>
                          {tipoLabel[mov.tipo] ?? mov.tipo}
                        </span>
                        <span className="text-xs text-[#a09585]">
                          {new Date(mov.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                      </div>
                      {mov.observaciones && (
                        <p className="text-sm text-[#5c4f3d]">{mov.observaciones}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}