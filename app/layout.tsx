import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Acoustic Ranging System',
  description: 'Passive acoustic distance measurement using DSP',
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
