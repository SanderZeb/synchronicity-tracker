import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import ErrorBoundary from '../components/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  
  title: {
    default: 'Synchronicity Tracker',
    template: '%s | Synchronicity Tracker'
  },
  description: 'Personal synchronicity and life metrics tracking dashboard.',
  keywords: [
    'synchronicity',
    'tracking',
    'dashboard',
    'analytics',
    'personal metrics'
  ],
  authors: [{ name: 'Tracker Team' }],
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Synchronicity Tracker',
    description: 'Personal synchronicity and life metrics tracking dashboard.',
    siteName: 'Synchronicity Tracker'
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a202c' }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Synchronicity Tracker",
              "description": "Personal synchronicity and life metrics tracking dashboard.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser"
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          {/* Skip to main content for accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50"
          >
            Skip to main content
          </a>
          
          {/* Main application wrapper */}
          <div className="min-h-screen bg-background">
            {/* Main content */}
            <main id="main-content" className="relative">
              {children}
            </main>
            
            {/* Accessibility improvements */}
            <div className="sr-only" role="status" aria-live="polite" id="status-announcements" />
          </div>
        </ErrorBoundary>
        
        {/* Performance monitoring script */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('performance' in window) {
                  window.addEventListener('load', function() {
                    const timing = performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    console.log('Load time:', loadTime + 'ms');
                  });
                }
              `
            }}
          />
        )}
      </body>
    </html>
  )
}