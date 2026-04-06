import type { Metadata } from 'next'
import { Fraunces, IBM_Plex_Mono, Manrope } from 'next/font/google'
import './globals.css'

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
})

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
})

const faviconVersion = '20260407'

export const metadata: Metadata = {
  title: {
    default: 'HelloWorld Enterprise',
    template: '%s | HelloWorld Enterprise',
  },
  description: 'The world\'s most over-engineered greeting platform.',
  icons: {
    icon: [
      { url: `/favicon.ico?v=${faviconVersion}`, sizes: 'any' },
      { url: `/icon.svg?v=${faviconVersion}`, type: 'image/svg+xml' },
    ],
    shortcut: [`/favicon.ico?v=${faviconVersion}`],
    apple: [{ url: `/favicon.ico?v=${faviconVersion}` }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} ${display.variable}`}>{children}</body>
    </html>
  )
}
