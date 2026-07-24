import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'La Red Solidaria — Portal Público',
  description:
    'Conoce el impacto de las donaciones: solicitudes activas, viajes en curso y centros de acopio de La Red Solidaria en Venezuela.',
  alternates: {
    canonical: '/publico',
  },
  openGraph: {
    title: 'La Red Solidaria - Portal Público',
    description:
      'Conoce el impacto de las donaciones: solicitudes activas, viajes en curso y centros de acopio.',
    url: 'https://laredsolidaria.org/publico',
  },
}

export default function PublicoLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${dmSerif.variable} ${dmSans.variable}`}>
      <style>{`
        :root {
          --font-display: 'DM Serif Display', serif;
          --font-body: 'DM Sans', sans-serif;
        }
        .publico-page {
          font-family: var(--font-body);
        }
        .publico-page h1, .publico-page h2, .publico-page h3,
        .publico-page .heading {
          font-family: var(--font-display);
          font-weight: 400;
        }
      `}</style>
      {children}
    </div>
  )
}
