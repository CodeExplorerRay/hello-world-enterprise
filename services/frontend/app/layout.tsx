import type { Metadata } from 'next'

const faviconVersion = '20260407'

export const metadata: Metadata = {
  title: 'HelloWorld Enterprise',
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
      <body>{children}</body>
    </html>
  )
}
