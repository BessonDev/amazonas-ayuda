'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Truck, Heart, Package, ChevronRight, Target, AlertTriangle, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCountUp } from '@/lib/hooks'

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`

// ─── page ────────────────────────────────────────────────

export default function PublicoPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [statsLoaded, setStatsLoaded] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [lote, setLote] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (statsLoaded) return
    setStatsLoaded(true)
    fetch(`${API_BASE}/publico/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => setStats(null))
  }, [statsLoaded])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim()) return
    setLoading(true)
    setLote(null)
    setNotFound(false)
    try {
      const res = await fetch(`${API_BASE}/publico/lotes/${codigo.trim().toUpperCase()}`)
      if (!res.ok) { setNotFound(true); return }
      const data = await res.json()
      setLote(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const tipoLabel: Record<string, string> = {
    ENTRADA: 'Ingreso',
    ENVIO: 'Envío',
    RECEPCION: 'Recepción',
    RESERVA: 'Reserva',
    TRANSFERENCIA: 'Transferencia',
    AJUSTE: 'Ajuste',
    DISTRIBUCION: 'Distribución',
    CONSUMO: 'Consumo',
  }

  const movIcon: Record<string, string> = {
    ENTRADA: '📥',
    ENVIO: '🚚',
    RECEPCION: '📋',
  }

  const statsData = stats
    ? [
        { label: 'Unidades donadas', value: stats.unidadesDonadas ?? 0, icon: Package },
        { label: 'Donantes registrados', value: stats.donantes ?? 0, icon: Heart },
        { label: 'Viajes completados', value: stats.viajesCompletados ?? 0, icon: Truck },
        { label: 'Centros de acopio', value: stats.ubicaciones ?? 0, icon: MapPin },
      ]
    : [
        { label: 'Unidades donadas', value: 0, icon: Package },
        { label: 'Donantes registrados', value: 0, icon: Heart },
        { label: 'Viajes completados', value: 0, icon: Truck },
        { label: 'Centros de acopio', value: 0, icon: MapPin },
      ]

  const loadingStats = !statsLoaded || !stats

  return (
    <div className="publico-page min-h-screen bg-[#FEFCF3]">
      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,#fff_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg brightness-0 invert" />
            <span className="hidden sm:inline text-sm font-medium tracking-wide uppercase opacity-80">Donaciones Amazonas</span>
          </div>
          <Link
            href="/admin"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1"
          >
            Portal Admin <ChevronRight className="size-3" />
          </Link>
        </nav>

        <div className="relative z-10 px-6 py-24 sm:py-32 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium tracking-wide uppercase mb-8">
            <span className="size-2 rounded-full bg-[#D4A373] animate-pulse" />
            Transparencia y trazabilidad
          </div>

          <h1 className="heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
            Cada donación
            <br />
            <span className="text-[#D4A373]">llega a su destino</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma de gestión logística para donaciones humanitarias en el Estado Amazonas, Venezuela.
            Conectamos donantes con comunidades, con total transparencia.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#track"
              className="inline-flex items-center gap-2 bg-[#D4A373] text-[#1B4332] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#c4955f] transition-all hover:shadow-lg hover:shadow-[#D4A373]/30"
            >
              <Search className="size-4" />
              Rastrear donación
            </a>
            <a
              href="#solicitudes"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all border border-white/10"
            >
              Ver necesidades
            </a>
          </div>
        </div>

        <div className="relative z-10 pb-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statsData.map((s) => (
                <StatCard key={s.label} icon={s.icon} value={loadingStats ? 0 : s.value} label={s.label} loading={loadingStats} />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FEFCF3] to-transparent" />
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4A373] mb-3">Cómo funciona</p>
          <h2 className="heading text-3xl sm:text-4xl text-[#1B4332]">El ciclo de una donación</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Registro', desc: 'Donantes registran alimentos, medicinas e insumos. Cada lote recibe un código único.', color: '#2D6A4F' },
            { step: '02', title: 'Transporte', desc: 'Coordinamos viajes desde centros de acopio hasta las comunidades que más lo necesitan.', color: '#40916C' },
            { step: '03', title: 'Entrega', desc: 'Las donaciones llegan a su destino y se registra cada recepción con total transparencia.', color: '#52B788' },
          ].map((step) => (
            <div key={step.step} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#2D6A4F]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white rounded-2xl p-8 border border-[#e8e0d0] shadow-sm hover:shadow-md transition-shadow">
                <div className="heading text-5xl text-[#D4A373]/30 mb-4">{step.step}</div>
                <h3 className="heading text-xl text-[#1B4332] mb-3">{step.title}</h3>
                <p className="text-[#5c4f3d] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solicitudes activas ─────────────────── */}
      <SolicitudesVisual API_BASE={API_BASE} />

      {/* ── Viajes activos ───────────────────────── */}
      <ViajesActivos API_BASE={API_BASE} />

      {/* ── Track ──────────────────────────────────── */}
      <section id="track" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4A373] mb-3">Rastreo</p>
          <h2 className="heading text-3xl sm:text-4xl text-[#1B4332] mb-4">¿Dónde está tu donación?</h2>
          <p className="text-[#5c4f3d]">Ingresa el código del lote que recibiste al donar para conocer su recorrido completo.</p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="relative flex items-center gap-2 bg-[#FEFCF3] rounded-2xl border-2 border-[#e8e0d0] has-[input:focus]:border-[#D4A373] transition-colors p-1.5 shadow-sm">
            <Search className="size-5 text-[#D4A373] ml-4 shrink-0" />
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: LOTE-250701-A3B2"
              className="flex-1 bg-transparent border-0 outline-none text-sm py-3 text-[#1B4332] placeholder:text-[#a09585]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1B4332] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {notFound && (
          <div className="max-w-lg mx-auto text-center bg-[#FEFCF3] rounded-2xl p-10 border border-[#e8e0d0]">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="heading text-xl text-[#1B4332] mb-2">Lote no encontrado</h3>
            <p className="text-sm text-[#5c4f3d]">
              Verifica el código ingresado. Si donaste recientemente, el lote puede estar todavía en proceso de registro.
            </p>
          </div>
        )}

        {lote && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-[#FEFCF3] rounded-2xl p-8 border border-[#e8e0d0] shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs text-[#a09585] uppercase tracking-wider mb-1">Lote</p>
                  <h3 className="heading text-2xl text-[#1B4332] font-mono">{lote.codigo}</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-semibold">
                  <span className="size-1.5 rounded-full bg-[#2D6A4F]" />
                  {lote.estado}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[#a09585] text-xs">Producto</p>
                  <p className="font-medium text-[#1B4332]">{lote.producto?.nombre ?? '-'}</p>
                </div>
                <div>
                  <p className="text-[#a09585] text-xs">Cantidad</p>
                  <p className="font-medium text-[#1B4332]">{lote.cantidad} {lote.producto?.unidad?.toLowerCase() ?? 'u'}</p>
                </div>
                <div>
                  <p className="text-[#a09585] text-xs">Donante</p>
                  <p className="font-medium text-[#1B4332]">{lote.donante?.nombre ?? 'Anónimo'}</p>
                </div>
                <div>
                  <p className="text-[#a09585] text-xs">Campaña</p>
                  <p className="font-medium text-[#1B4332]">{lote.campania?.nombre ?? '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[#e8e0d0] shadow-sm">
              <h4 className="heading text-lg text-[#1B4332] mb-6">Recorrido</h4>
              <div className="space-y-0">
                {lote.movimientos?.map((mov: any, i: number) => (
                  <div key={mov.id} className="relative flex gap-5 pb-8 last:pb-0">
                    {i < (lote.movimientos?.length ?? 0) - 1 && (
                      <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-gradient-to-b from-[#D4A373]/40 to-transparent" />
                    )}
                    <div className="relative shrink-0 size-6 rounded-full border-2 border-[#D4A373] bg-white flex items-center justify-center text-xs">
                      {movIcon[mov.tipo] ?? '📦'}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#1B4332]">{tipoLabel[mov.tipo] ?? mov.tipo}</span>
                        <span className="text-xs text-[#a09585]">{new Date(mov.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      {mov.observaciones && (
                        <p className="text-xs text-[#5c4f3d]">{mov.observaciones}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Impact ─────────────────────────────────── */}
      <section id="impact" className="py-20 px-6 bg-gradient-to-br from-[#1B4332]/5 via-transparent to-[#D4A373]/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4A373] mb-3">Impacto</p>
          <h2 className="heading text-3xl sm:text-4xl text-[#1B4332] mb-6">Juntos hacemos la diferencia</h2>
          <p className="text-[#5c4f3d] max-w-2xl mx-auto mb-12">
            Cada donación representa una familia atendida, una comunidad abastecida. 
            La transparencia no es solo un valor — es nuestro compromiso.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '15+', label: 'Comunidades alcanzadas' },
              { num: '4', label: 'Centros de acopio activos' },
              { num: '100%', label: 'Trazabilidad garantizada' },
              { num: '2', label: 'Años de operación' },
            ].map((item) => (
              <div key={item.label} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#e8e0d0]">
                <p className="heading text-3xl text-[#1B4332] mb-1">{item.num}</p>
                <p className="text-xs text-[#5c4f3d]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="bg-[#1B4332] text-white/60 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded brightness-0 invert opacity-60" />
            <span className="text-sm">Donaciones Amazonas</span>
          </div>
          <p className="text-xs text-center sm:text-right">
            © {new Date().getFullYear()} · Transparencia y trazabilidad en cada donación
          </p>
        </div>
      </footer>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────

function StatCard({ icon: Icon, value, label, loading }: { icon: any; value: number; label: string; loading: boolean }) {
  const animated = useCountUp(value)
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/5">
      <Icon className="size-5 mx-auto mb-2 text-[#D4A373]" />
      <p className="heading text-2xl sm:text-3xl text-white">
        {loading ? (
          <span className="inline-block animate-pulse bg-white/10 rounded h-8 w-20 mx-auto" />
        ) : (
          animated
        )}
      </p>
      <p className="text-xs text-white/60 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ─── Prioridad badge ─────────────────────────────────

const prioridadConfig: Record<string, { label: string; classes: string; icon: any }> = {
  URGENTE: { label: 'Urgente', classes: 'bg-red-100 text-red-700', icon: AlertTriangle },
  ALTA: { label: 'Alta', classes: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  MEDIA: { label: 'Media', classes: 'bg-blue-100 text-blue-700', icon: Clock },
  BAJA: { label: 'Baja', classes: 'bg-gray-100 text-gray-600', icon: Clock },
}

// ─── Solicitudes visual ────────────────────────────────

function SolicitudesVisual({ API_BASE }: { API_BASE: string }) {
  const [data, setData] = useState<any[] | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/publico/solicitudes`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setData(d) })
      .catch(() => setData([]))
  }, [API_BASE])

  if (data === null) {
    return (
      <section id="solicitudes" className="py-20 px-6 bg-[#FEFCF3]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#e8e0d0] rounded w-48 mx-auto" />
            <div className="h-8 bg-[#e8e0d0] rounded w-96 mx-auto" />
            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#e8e0d0] p-6 h-64" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!data.length) return null

  return (
    <section id="solicitudes" className="py-20 px-6 bg-[#FEFCF3]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4A373] mb-3">Necesidades activas</p>
          <h2 className="heading text-3xl sm:text-4xl text-[#1B4332]">Lo que están solicitando las comunidades</h2>
          <p className="text-[#5c4f3d] mt-4 max-w-2xl mx-auto">
            Cada solicitud muestra los productos necesarios y cuánto se ha recolectado hasta ahora.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {data.map((s: any) => {
            const pc = prioridadConfig[s.prioridad]
            const PriorityIcon = pc?.icon ?? Clock
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-[#e8e0d0] p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="heading text-xl text-[#1B4332]">{s.titulo}</h3>
                  {pc && (
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${pc.classes}`}>
                      <PriorityIcon className="size-3" />
                      {pc.label}
                    </span>
                  )}
                </div>
                {s.descripcion && <p className="text-sm text-[#5c4f3d] mb-4">{s.descripcion}</p>}

                <div className="flex flex-wrap gap-3 text-xs text-[#5c4f3d] mb-5">
                  <span className="inline-flex items-center gap-1.5 bg-[#D4A373]/10 px-3 py-1.5 rounded-full font-medium">
                    <MapPin className="size-3.5" />
                    {s.ubicacion}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-[#2D6A4F]/10 px-3 py-1.5 rounded-full font-medium text-[#2D6A4F]">
                    <Heart className="size-3.5" />
                    {s.campania}
                  </span>
                </div>

                <div className="space-y-3">
                  {s.productos.map((p: any) => (
                    <div key={p.id} className="bg-[#FEFCF3] rounded-xl p-4 border border-[#e8e0d0]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-[#1B4332]">{p.producto}</span>
                        <span className="text-xs font-medium text-[#5c4f3d]">
                          {p.recibido}/{p.meta} {p.unidad.toLowerCase()}
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#e8e0d0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4A373] to-[#c4955f] rounded-full transition-all"
                          style={{ width: `${Math.min(p.pct, 100)}%` }}
                        />
                      </div>
                      {p.descripcion && (
                        <p className="text-xs text-[#a09585] mt-1.5">{p.descripcion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Viajes activos ────────────────────────────────────

const estadoViajeLabel: Record<string, string> = {
  PLANIFICADO: 'Planificado',
  PREPARANDO_CARGA: 'Preparando carga',
  EN_TRANSITO: 'En tránsito',
  LLEGO: 'Llegó',
  RECEPCION_PARCIAL: 'Recepción parcial',
}

const estadoViajeColor: Record<string, string> = {
  PLANIFICADO: 'bg-blue-100 text-blue-700',
  PREPARANDO_CARGA: 'bg-amber-100 text-amber-700',
  EN_TRANSITO: 'bg-[#2D6A4F]/10 text-[#2D6A4F]',
  LLEGO: 'bg-[#D4A373]/10 text-[#D4A373]',
  RECEPCION_PARCIAL: 'bg-purple-100 text-purple-700',
}

function ViajesActivos({ API_BASE }: { API_BASE: string }) {
  const [data, setData] = useState<any[] | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/publico/viajes`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setData(d) })
      .catch(() => setData([]))
  }, [API_BASE])

  if (data === null) {
    return (
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#e8e0d0] rounded w-32 mx-auto" />
            <div className="h-8 bg-[#e8e0d0] rounded w-72 mx-auto" />
            <div className="grid md:grid-cols-2 gap-5 mt-10">
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#FEFCF3] rounded-2xl border border-[#e8e0d0] p-5 h-28" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!data.length) return null

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4A373] mb-3">En movimiento</p>
          <h2 className="heading text-3xl sm:text-4xl text-[#1B4332]">Viajes activos y programados</h2>
          <p className="text-[#5c4f3d] mt-4 max-w-2xl mx-auto">
            Conoce las rutas activas de distribución hacia las comunidades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {data.map((v: any) => (
            <div key={v.id} className="bg-[#FEFCF3] rounded-2xl border border-[#e8e0d0] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-[#a09585] font-mono mb-0.5">{v.codigo}</p>
                  <h3 className="heading text-lg text-[#1B4332]">
                    {v.origen} → {v.destino}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoViajeColor[v.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                  {estadoViajeLabel[v.estado] ?? v.estado}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#5c4f3d]">
                {v.vehiculo && <span>🚛 {v.vehiculo}</span>}
                {v.conductor && <span>👤 {v.conductor}</span>}
                {v.fechaSalida && (
                  <span>📅 Sale: {new Date(v.fechaSalida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                )}
                {v.fechaEstimada && (
                  <span>📅 Llega: {new Date(v.fechaEstimada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
