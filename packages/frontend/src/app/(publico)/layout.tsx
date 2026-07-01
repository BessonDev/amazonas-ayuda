import type { ReactNode } from 'react'
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
