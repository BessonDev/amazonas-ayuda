import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/contexts/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://laredsolidaria.org"

export const metadata: Metadata = {
  title: { default: "La Red Solidaria", template: "%s | La Red Solidaria" },
  description:
    "Plataforma de gestión logística para donaciones humanitarias — conectando donantes con comunidades que más lo necesitan en Venezuela.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: "La Red Solidaria",
    title: "La Red Solidaria — Donaciones Humanitarias Venezuela",
    description:
      "Plataforma de gestión logística para donaciones humanitarias. Trazabilidad completa desde la recepción hasta la entrega.",
    url: SITE_URL,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "La Red Solidaria — Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Red Solidaria — Donaciones Humanitarias Venezuela",
    description:
      "Plataforma de gestión logística para donaciones humanitarias. Trazabilidad completa desde la recepción hasta la entrega.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "La Red Solidaria",
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description:
                "Plataforma de gestión logística para donaciones humanitarias en Venezuela.",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: "Spanish",
              },
            }),
          }}
        />
        <Script
          id="ld-json-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "La Red Solidaria",
              url: SITE_URL,
              description:
                "Plataforma de gestión logística para donaciones humanitarias.",
              inLanguage: "es",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster richColors closeButton position="bottom-right" />
      </body>
    </html>
  );
}
