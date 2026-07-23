import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal Público — La Red Solidaria',
  description:
    'Conoce el impacto de las donaciones: solicitudes activas, viajes en curso y centros de acopio de La Red Solidaria en Venezuela.',
  alternates: {
    canonical: '/publico',
  },
  openGraph: {
    title: 'Portal Público — La Red Solidaria',
    description:
      'Conoce el impacto de las donaciones: solicitudes activas, viajes en curso y centros de acopio.',
    url: 'https://laredsolidaria.org/publico',
  },
}

export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
