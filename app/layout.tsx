import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import { MotionProvider } from '@/components/motion-provider'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const SITE_URL = 'https://hoteltukuchepeak.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hotel Tukuche Peak — Luxury Himalayan Retreat in Mustang, Nepal',
    template: '%s · Hotel Tukuche Peak',
  },
  description:
    'A boutique luxury mountain hotel in Tukuche, Mustang. Cinematic Himalayan views, refined rooms, authentic Thakali cuisine, curated experiences, and effortless online booking.',
  keywords: [
    'Hotel Tukuche Peak',
    'Tukuche hotel',
    'Mustang luxury hotel',
    'Himalayan boutique hotel',
    'Dhaulagiri accommodation',
    'Thakali restaurant',
  ],
  authors: [{ name: 'Hotel Tukuche Peak' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Hotel Tukuche Peak',
    title: 'Hotel Tukuche Peak — Luxury Himalayan Retreat',
    description:
      'Boutique luxury in the heart of the Himalayas. Book refined rooms, dine on authentic Thakali cuisine, and explore Mustang.',
    images: [{ url: '/images/hero-himalaya.png', width: 1200, height: 630, alt: 'Hotel Tukuche Peak at golden hour' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Tukuche Peak — Luxury Himalayan Retreat',
    description: 'Boutique luxury in the heart of the Himalayas, Mustang, Nepal.',
    images: ['/images/hero-himalaya.png'],
  },
  robots: { index: true, follow: true },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f1' },
    { media: '(prefers-color-scheme: dark)', color: '#12201b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
