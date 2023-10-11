import { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

import '@/app/globals.css'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: {
    default: 'Medi Bot',
    template: `%s - Medi Bot`
  },
  description:
    'An AI-powered medical chatbot built with Next.js and Vercel powered by GPT-4',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medi Bot',
    description:
      'An AI-powered medical chatbot built with Next.js and Vercel powered by GPT-4',
    creator: '@garmeeh',
    images: [
      {
        url: 'https://www.medibot.chat/opengraph-image.png',
        alt: 'Medical Bot',
        width: 1200,
        height: 675
      }
    ]
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <ClerkProvider>
            <div className="flex min-h-screen flex-col">
              {/* @ts-ignore */}
              <Header />
              <main className="flex flex-1 flex-col bg-muted/50">
                {children}
              </main>
            </div>
            <Analytics />
            <TailwindIndicator />
          </ClerkProvider>
        </Providers>
      </body>
    </html>
  )
}
