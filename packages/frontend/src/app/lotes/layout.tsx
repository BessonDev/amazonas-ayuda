import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rastrear Lote — La Red Solidaria',
  description:
    'Consulta el recorrido y estado de un lote de donación de La Red Solidaria. Trazabilidad completa desde la recepción hasta la entrega.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function LotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
