import '@fontsource-variable/noto-sans/wght.css'
import '@fontsource-variable/sora/wght.css'
import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import React from 'react'

import './styles.css'

export const metadata: Metadata = {
  title: { default: 'Mi ci metto', template: '%s · Mi ci metto' },
  description: 'Ricette di famiglia da cucinare con il telefono sul piano di lavoro.',
  ...(process.env.NEXT_PUBLIC_SERVER_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL) }
    : {}),
}

export const viewport: Viewport = {
  themeColor: '#77002e',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="it">
      <body>
        <header className="mcm-testata">
          <Link href="/" className="mcm-logo">
            Mi ci metto
          </Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
