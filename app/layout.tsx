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
  title: {
    default: 'Synchronicity Tracker',
    template: '%s | Synchronicity Tracker'
  },
  description: 'Track synchronicities, health metrics, and life patterns to discover cosmic connections and personal insights.',
  keywords: [
    'synchronicity',
    'life tracking',
    'personal analytics',
    'consciousness',
    'patterns',
    'cosmic awareness',
    'health metrics',
    'mood tracking',
    'productivity tracking'
  ],
  authors: [{ name: 'Cosmic Developer' }],
  creator: 'Synchronicity Tracker Team',
  publisher: 'Synchronicity Tracker',
  robots: {
    index: false, // Since this is a personal tracking app
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
    description: 'Track synchronicities, health metrics, and life patterns to discover cosmic connections.',
    siteName: 'Synchronicity Tracker',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Synchronicity Tracker - Discover Cosmic Patterns'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synchronicity Tracker',
    description: 'Track synchronicities and discover cosmic patterns in your life.',
    images: ['/og-image.jpg']
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#0ea5e9' }
    ]
  },
  manifest: '/site.webmanifest',
  category: 'lifestyle'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
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
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Synchronicity Tracker",
              "description": "Track synchronicities, health metrics, and life patterns to discover cosmic connections.",
              "url": "https://synchronicity-tracker.app",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          {/* Skip to main content for accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-cosmic-600 text-white px-4 py-2 rounded-lg z-50"
          >
            Skip to main content
          </a>
          
          {/* Main application wrapper */}
          <div className="min-h-screen bg-gradient-to-br from-cosmic-50 via-white to-synchro-50">
            {/* Background pattern overlay */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-cosmic-100/20 to-synchro-100/20" />
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), 
                                   radial-gradient(circle at 75% 75%, rgba(217, 70, 239, 0.1) 0%, transparent 50%)`
                }}
              />
            </div>
            
            {/* Main content */}
            <main id="main-content" className="relative z-10">
              {children}
            </main>
            
            {/* Accessibility improvements */}
            <div className="sr-only" role="status" aria-live="polite" id="status-announcements" />
          </div>
        </ErrorBoundary>
        
        {/* Performance monitoring script (placeholder) */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Performance monitoring
                if ('performance' in window) {
                  window.addEventListener('load', function() {
                    const timing = performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    console.log('Page load time:', loadTime + 'ms');
                  });
                }
                
                // Report critical errors
                window.addEventListener('error', function(e) {
                  console.error('Uncaught error:', e.error);
                });
                
                window.addEventListener('unhandledrejection', function(e) {
                  console.error('Unhandled promise rejection:', e.reason);
                });
              `
            }}
          />
        )}
      </body>
    </html>
  )
}