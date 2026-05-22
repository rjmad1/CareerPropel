import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CareerPropel: AI-Native Career Management',
  description: 'Intelligent job application automation and career orchestration platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {/* Skip navigation link for keyboard users (WCAG 2.4.1) */}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <Providers>
          <main id="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
