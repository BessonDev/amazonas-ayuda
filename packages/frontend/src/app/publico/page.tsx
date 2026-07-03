'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, Truck, Heart, Package, ChevronRight, AlertTriangle, Clock, ArrowRight, Users, Route, CheckCircle2, HandHeart } from 'lucide-react'
import Link from 'next/link'
import { useCountUp, useFotosRecepciones, type FotoRecepcion } from '@/lib/hooks'
import { UNIDAD_MEDIDA_ABREV } from '@/lib/enums'

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PublicoPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [statsLoaded, setStatsLoaded] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [lote, setLote] = useState<any>(null)
  const [busy, setBusy] = useState(false)
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
    setBusy(true)
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
      setBusy(false)
    }
  }

  const tipoLabel: Record<string, string> = {
    ENTRADA: 'Registrado', ENVIO: 'Despachado', RECEPCION: 'Recibido',
    TRANSFERENCIA: 'Transferido',
    AJUSTE: 'Ajustado',
  }

  return (
    <div className="publico-page min-h-screen bg-[#FEFCF3] overflow-x-hidden">
      <style>{`
        @keyframes progress-stripe {
          0% { background-position: 40px 0, 0 0; }
          100% { background-position: 0 0, 0 0; }
        }
      `}</style>
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[90vh] flex flex-col bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M50 50v-4h-4v4h-4v4h4v4h4v-4h4v-4h-4zm0-40v-4h-4v4h-4v4h4v4h4v-4h4v-4h-4zM10 50v-4H6v4H2v4h4v4h4v-4h4v-4h-4zM10 10V6H6v4H2v4h4v4h4v-4h4v-4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Heart className="size-5 text-[#D4A373]" />
            </div>
            <span className="text-sm font-semibold tracking-wide">Amazonas Ayuda</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#impact" className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block">
              Impacto
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              Admin <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </nav>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-16 max-w-6xl mx-auto w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/8 backdrop-blur-sm text-xs font-semibold tracking-wider uppercase mb-8 border border-white/10">
              <span className="size-2 rounded-full bg-[#D4A373] animate-pulse" />
              Transparencia y trazabilidad
            </div>

            <h1 className="heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.08] mb-6 tracking-tight">
              Cada donación
              <br />
              <span className="text-[#D4A373]">llega a su destino</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-xl mb-10 leading-relaxed">
              Gestionamos la logística humanitaria en el Estado Amazonas con trazabilidad completa.
              Cada lote, cada viaje, cada entrega — todo transparente.
            </p>

            <div className="flex flex-wrap gap-4">
              {/* disabled: se activará cuando el tracking público esté listo
              <a
                href="#track"
                className="group inline-flex items-center gap-2.5 bg-[#D4A373] text-[#1B4332] font-semibold px-8 py-4 rounded-2xl hover:bg-[#c4955f] transition-all hover:shadow-xl hover:shadow-[#D4A373]/25 active:scale-[0.98]"
              >
                <Search className="size-4.5" />
                Rastrear donación
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              */}
              <a
                href="#solicitudes"
                className="inline-flex items-center gap-2.5 bg-white/8 backdrop-blur-sm text-white font-medium px-8 py-4 rounded-2xl hover:bg-white/15 transition-all border border-white/10 active:scale-[0.98]"
              >
                <HandHeart className="size-4.5" />
                Ver necesidades
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 pb-8 sm:pb-16 px-6 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={Package} value={stats?.unidadesDonadas ?? 0} label="Unidades donadas"
              loading={!stats} accent="from-[#D4A373] to-[#c4955f]"
            />
            <StatCard
              icon={Heart} value={stats?.donantes ?? 0} label="Donantes"
              loading={!stats} accent="from-[#e5989b] to-[#d47a7e]"
            />
            <StatCard
              icon={Truck} value={stats?.viajesCompletados ?? 0} label="Viajes realizados"
              loading={!stats} accent="from-[#52B788] to-[#40916C]"
            />
            <StatCard
              icon={MapPin} value={stats?.ubicaciones ?? 0} label="Centros activos"
              loading={!stats} accent="from-[#7ec8e3] to-[#5ab0d4]"
            />
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="relative py-24 sm:py-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,163,115,0.04)_0%,transparent_70%)]" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A373] mb-4 bg-[#D4A373]/8 px-4 py-1.5 rounded-full">
              Cómo funciona
            </span>
            <h2 className="heading text-4xl sm:text-5xl text-[#1B4332] mb-4">El ciclo de una donación</h2>
            <p className="text-[#5c4f3d] max-w-xl mx-auto">
              Desde que un donante entrega hasta que la comunidad recibe — cada paso queda registrado.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-1/2 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-[#D4A373]/0 via-[#D4A373]/30 to-[#D4A373]/0 -translate-y-1/2" />

            {[
              { step: '01', icon: Package, title: 'Registro', desc: 'Donantes entregan alimentos, medicinas e insumos. Cada lote recibe un código único trazable.' },
              { step: '02', icon: Route, title: 'Transporte', desc: 'Coordinamos viajes desde centros de acopio hasta las comunidades que más lo necesitan.' },
              { step: '03', icon: CheckCircle2, title: 'Entrega', desc: 'Las donaciones llegan a su destino. Cada recepción se registra con total transparencia.' },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.step} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#D4A373]/8 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white rounded-2xl p-8 border border-[#e8e0d0] shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="size-14 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center mb-6 shadow-md">
                      <Icon className="size-6 text-white" />
                    </div>
                    <div className="heading text-6xl text-[#D4A373]/15 absolute top-6 right-6 leading-none">{s.step}</div>
                    <h3 className="heading text-2xl text-[#1B4332] mb-3 relative">{s.title}</h3>
                    <p className="text-[#5c4f3d] text-sm leading-relaxed relative">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ SOLICITUDES ══════════ */}
      <SolicitudesVisual API_BASE={API_BASE} />

      {/* ══════════ VIAJES ══════════ */}
      <ViajesActivos API_BASE={API_BASE} />

      {/* ══════════ TRACKING (oculto) ══════════ */}
      {
      /* disabled: se activará cuando el tracking público esté listo
      <section id="track" className="relative py-24 sm:py-32 px-6 bg-white">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A373]/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45,106,79,0.03)_0%,transparent_60%)]" />

        <div className="relative max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A373] mb-4 bg-[#D4A373]/8 px-4 py-1.5 rounded-full">
            Rastreo
          </span>
          <h2 className="heading text-4xl sm:text-5xl text-[#1B4332] mb-4">¿Dónde está tu donación?</h2>
          <p className="text-[#5c4f3d] max-w-xl mx-auto">
            Ingresa el código único de tu lote para conocer su recorrido completo, desde que salió hasta que llegó.
          </p>
        </div>

        <BuscarLote API_BASE={API_BASE} />
      </section>
      */
      }

      {/* ══════════ IMPACTO - GALERÍA DE ENTREGAS ══════════ */}
      <section id="impact" className="relative py-24 sm:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332]/5 via-transparent to-[#D4A373]/8" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A373]/20 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A373] mb-4 bg-[#D4A373]/8 px-4 py-1.5 rounded-full">
              Impacto
            </span>
            <h2 className="heading text-4xl sm:text-5xl text-[#1B4332] mb-4">Juntos hacemos la diferencia</h2>
            <p className="text-[#5c4f3d] max-w-xl mx-auto">
              Cada donación representa una familia atendida. La transparencia no es solo un valor — es nuestro compromiso.
            </p>
          </div>

          <FotosCarrusel />
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A373]/40 to-transparent" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="heading text-4xl sm:text-5xl mb-6">¿Eres una organización?</h2>
          <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
            Forma parte de la red de ayuda humanitaria en el Estado Amazonas. Coordinamos donaciones con trazabilidad completa.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2.5 bg-[#D4A373] text-[#1B4332] font-semibold px-8 py-4 rounded-2xl hover:bg-[#c4955f] transition-all hover:shadow-xl hover:shadow-[#D4A373]/25 active:scale-[0.98]"
          >
            Ir al portal administrativo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#1B4332]/95 text-white/50 py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Heart className="size-4 text-[#D4A373]/70" />
            </div>
            <span className="text-sm font-medium text-white/60">Amazonas Ayuda</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <span>© {new Date().getFullYear()}</span>
            <span className="text-white/20">·</span>
            <span>Transparencia y trazabilidad</span>
            <span className="text-white/20">·</span>
            <span>Estado Amazonas, Venezuela</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ═══════════ STAT CARD ═══════════

function StatCard({ icon: Icon, value, label, loading, accent }: {
  icon: any; value: number; label: string; loading: boolean; accent: string
}) {
  const animated = useCountUp(value)
  return (
    <div className="group relative bg-white/6 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/8 hover:bg-white/10 transition-all duration-300">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className={`size-10 rounded-xl bg-gradient-to-br ${accent} bg-opacity-20 flex items-center justify-center mb-3 shadow-sm`}>
          <Icon className="size-5 text-white" />
        </div>
        <p className="heading text-2xl sm:text-3xl text-white mb-1 tabular-nums">
          {loading ? (
            <span className="inline-block h-8 w-16 rounded bg-white/8 animate-pulse align-middle" />
          ) : animated}
        </p>
<p className="text-[11px] text-white/50 uppercase tracking-wider font-medium">{label}</p>
        </div>
      </div>
  )
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ═══════════ FOTOS CARRUSEL ═══════════
function FotosCarrusel() {
  const { data: fotos = [], isLoading, error } = useFotosRecepciones(15)
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const startAutoplay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % fotos.length)
    }, 4000)
  }, [fotos.length])

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (fotos.length <= 1) return
    startAutoplay()
    const container = containerRef.current
    container?.addEventListener('mouseenter', stopAutoplay)
    container?.addEventListener('mouseleave', startAutoplay)
    return () => {
      stopAutoplay()
      container?.removeEventListener('mouseenter', stopAutoplay)
      container?.removeEventListener('mouseleave', startAutoplay)
    }
  }, [fotos.length, startAutoplay, stopAutoplay])

  if (isLoading) {
    return (
      <div className="flex justify-center gap-4" role="region" aria-label="Galería de entregas">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-full sm:w-[340px] animate-pulse flex-shrink-0">
            <div className="aspect-[4/3] bg-[#e8e0d0] rounded-2xl" />
            <div className="mt-3 h-4 bg-[#e8e0d0] rounded w-3/4" />
            <div className="h-3 bg-[#e8e0d0] rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error || fotos.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto size-16 text-[#c4b8a3]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 17" />
        </svg>
        <p className="mt-4 text-[#5c4f3d] text-lg">Aún no hay fotos de entregas</p>
        <p className="mt-1 text-[#8b7d6b] text-sm">Las fotos aparecerán aquí cuando los coordinadores las suban al registrar recepciones</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden" role="region" aria-label="Galería de entregas realizadas">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {fotos.map((foto: FotoRecepcion) => (
          <article key={foto.id} className="min-w-0 w-full shrink-0 flex justify-center">
            <div className="relative group w-full sm:w-[340px]">
              <img
                src={foto.url}
                alt={foto.nombre}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium truncate">
                  Recepción — {foto.viajeCodigo ?? `Viaje #${foto.recepcionId}`}
                </p>
                <p className="text-xs text-white/70 mt-0.5">{formatFecha(foto.createdAt)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Dots */}
      {fotos.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {fotos.map((_, i) => (
            <button
              key={i}
              onClick={() => { stopAutoplay(); setCurrent(i) }}
              className={`size-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-[#2d4a2d]'
                  : 'bg-[#c4b8a3] hover:bg-[#8b7d6b]'
              }`}
              aria-label={`Ir a foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════ PRIORIDAD ═══════════

const prioridadConfig: Record<string, { label: string; classes: string }> = {
  URGENTE: { label: 'Urgente', classes: 'bg-red-50 text-red-600 border-red-200' },
  ALTA: { label: 'Alta', classes: 'bg-orange-50 text-orange-600 border-orange-200' },
  MEDIA: { label: 'Media', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  BAJA: { label: 'Baja', classes: 'bg-gray-50 text-gray-500 border-gray-200' },
}

const prioridadIcon: Record<string, any> = {
  URGENTE: AlertTriangle, ALTA: AlertTriangle, MEDIA: Clock, BAJA: Clock,
}

// ═══════════ SOLICITUDES ═══════════

function SolicitudesVisual({ API_BASE }: { API_BASE: string }) {
  const [data, setData] = useState<any[] | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/publico/solicitudes`)
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
  }, [API_BASE])

  if (data === null) {
    return <SectionSkeleton id="solicitudes" label="Necesidades activas" title="Lo que están solicitando las comunidades" cols={2} />
  }

  if (!data.length) return null

  return (
    <section id="solicitudes" className="relative py-24 sm:py-32 px-6 bg-[#FEFCF3]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A373]/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,163,115,0.04)_0%,transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A373] mb-4 bg-[#D4A373]/8 px-4 py-1.5 rounded-full">
            Necesidades activas
          </span>
          <h2 className="heading text-4xl sm:text-5xl text-[#1B4332] mb-4">Lo que están solicitando</h2>
          <p className="text-[#5c4f3d] max-w-xl mx-auto">
            Cada solicitud muestra los productos necesarios y cuánto se ha recolectado hasta ahora.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {data.map((s: any) => {
            const pc = prioridadConfig[s.prioridad]
            const PI = prioridadIcon[s.prioridad] ?? Clock
            const pct = s.productos?.length
              ? Math.round(s.productos.reduce((a: number, p: any) => a + (p.pct ?? 0), 0) / s.productos.length)
              : 0

            return (
              <div key={s.id} className="group bg-white rounded-2xl border border-[#e8e0d0] hover:shadow-lg hover:border-[#D4A373]/20 transition-all duration-300 overflow-hidden">
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="heading text-xl text-[#1B4332] truncate">{s.titulo}</h3>
                        {pc && (
                          <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${pc.classes}`}>
                            <PI className="size-3" />
                            {pc.label}
                          </span>
                        )}
                      </div>
                      {s.descripcion && (
                        <p className="text-sm text-[#5c4f3d] line-clamp-2">{s.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 text-xs mb-5">
                    <span className="inline-flex items-center gap-1.5 bg-[#D4A373]/8 px-3 py-1.5 rounded-lg font-medium text-[#5c4f3d]">
                      <MapPin className="size-3.5" />
                      {s.ubicacion}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-[#2D6A4F]/8 px-3 py-1.5 rounded-lg font-medium text-[#2D6A4F]">
                      <Heart className="size-3.5" />
                      {s.campania}
                    </span>
                  </div>

                    {/* Overall progress */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#5c4f3d] font-medium">Progreso general</span>
                      <span className="text-[#1B4332] font-bold">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-[#e8e0d0] rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: `repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.18) 10px, rgba(255,255,255,0.18) 20px), ${pct >= 100 ? 'linear-gradient(90deg, #2D6A4F, #52B788)' : 'linear-gradient(90deg, #D4A373, #c4955f)'}`,
                          backgroundSize: '40px 40px, 100% 100%',
                          animation: 'progress-stripe 1.2s linear infinite',
                          boxShadow: pct >= 100
                            ? '0 0 12px rgba(45,106,79,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                            : '0 0 10px rgba(212,163,115,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {s.productos?.map((p: any) => (
                      <div key={p.id} className="bg-[#FEFCF3] rounded-xl p-3.5 border border-[#e8e0d0] group-hover:border-[#D4A373]/10 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-sm text-[#1B4332]">{p.producto}</span>
                          <span className="text-xs font-medium text-[#5c4f3d] tabular-nums">
                            <span className="text-[#1B4332] font-bold">{p.recibido}</span>
                            <span className="text-[#a09585]">/{p.meta} {UNIDAD_MEDIDA_ABREV[p.unidad] ?? p.unidad.toLowerCase()}</span>
                          </span>
                        </div>
                        <div className="h-2 bg-[#e8e0d0] rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(p.pct, 100)}%`,
                              background: 'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.18) 10px, rgba(255,255,255,0.18) 20px), linear-gradient(90deg, #2D6A4F, #52B788)',
                              backgroundSize: '40px 40px, 100% 100%',
                              boxShadow: '0 0 8px rgba(45,106,79,0.4)',
                            }}
                          />
                        </div>
                        {p.descripcion && (
                          <p className="text-[11px] text-[#a09585] mt-1.5">{p.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════ VIAJES ═══════════

const estadoViajeCfg: Record<string, { label: string; color: string; dot: string; cardBg: string; border: string }> = {
  PLANIFICADO: { label: 'Planificado', color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500', cardBg: 'bg-blue-50/40', border: 'border-blue-200/50' },
  EN_TRANSITO: { label: 'En tránsito', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', cardBg: 'bg-emerald-50/40', border: 'border-emerald-200/50' },
  RECEPCION_PARCIAL: { label: 'Recepción parcial', color: 'text-purple-600 bg-purple-50 border-purple-200', dot: 'bg-purple-500', cardBg: 'bg-purple-50/40', border: 'border-purple-200/50' },
}

function ViajesActivos({ API_BASE }: { API_BASE: string }) {
  const [data, setData] = useState<any[] | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/publico/viajes`)
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
  }, [API_BASE])

  if (data === null) {
    return <SectionSkeleton label="En movimiento" title="Viajes activos y programados" cols={2} />
  }

  if (!data.length) return null

  return (
    <section className="relative py-24 sm:py-32 px-6 bg-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A373]/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45,106,79,0.03)_0%,transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A373] mb-4 bg-[#D4A373]/8 px-4 py-1.5 rounded-full">
            En movimiento
          </span>
          <h2 className="heading text-4xl sm:text-5xl text-[#1B4332] mb-4">Viajes activos y programados</h2>
          <p className="text-[#5c4f3d] max-w-xl mx-auto">
            Conoce las rutas de distribución hacia las comunidades del Estado Amazonas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {data.map((v: any) => {
            const cfg = estadoViajeCfg[v.estado]
            return (
              <div key={v.id} className={`group rounded-2xl border ${cfg?.cardBg || 'bg-[#FEFCF3]'} ${cfg?.border || 'border-[#e8e0d0]'} hover:shadow-lg transition-all duration-300 p-5 sm:p-6`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#a09585] font-mono mb-1">{v.codigo}</p>
                    <div className="text-[#1B4332]">
                      <p className="heading text-lg truncate">{v.origen}</p>
                      <p className="heading text-lg truncate flex items-center gap-1.5">
                        <ArrowRight className="size-4 text-[#D4A373] shrink-0" />
                        <span>{v.destino}</span>
                      </p>
                    </div>
                  </div>
                  {cfg && (
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
                      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#5c4f3d] pt-4 border-t border-[#e8e0d0]/60">
                  {v.vehiculo && (
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="size-3.5 text-[#a09585]" />
                      {v.vehiculo}
                    </span>
                  )}
                  {v.conductor && (
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="size-3.5 text-[#a09585]" />
                      Conductor: {v.conductor}
                    </span>
                  )}
                  {v.fechaSalida && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#2D6A4F]" />
                      Sale: {new Date(v.fechaSalida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  {v.fechaEstimada && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#D4A373]" />
                      Llega: {new Date(v.fechaEstimada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════ SKELETON ═══════════

function SectionSkeleton({ id, label, title, cols = 2 }: { id?: string; label: string; title: string; cols?: number }) {
  return (
    <section id={id} className="py-24 sm:py-32 px-6 bg-[#FEFCF3]">
      <div className="max-w-6xl mx-auto text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#e8e0d0] rounded-full w-40 mx-auto" />
          <div className="h-9 bg-[#e8e0d0] rounded-full w-80 mx-auto" />
          <div className={`grid md:grid-cols-${cols} gap-6 mt-12`}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e0d0] p-6 sm:p-7">
                <div className="space-y-4">
                  <div className="h-5 bg-[#e8e0d0] rounded w-3/4" />
                  <div className="h-3 bg-[#e8e0d0] rounded w-full" />
                  <div className="h-3 bg-[#e8e0d0] rounded w-5/6" />
                  <div className="h-10 bg-[#e8e0d0] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
