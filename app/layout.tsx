import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planneapp.com')
const title = 'Planne - Planeje com clareza'
const description =
  'Plataforma premium de planejamento de eventos. Transforme o caos em controle com organizacao, inteligencia e design sofisticado.'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
      en: '/en',
    },
  },
  openGraph: {
    title,
    description: 'Organize eventos, convidados, tarefas e orcamento em um so lugar.',
    url: '/',
    siteName: 'Planne',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1024,
        height: 1024,
        alt: 'Planne - planejamento de eventos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: 'Organize eventos, convidados, tarefas e orcamento em um so lugar.',
    images: ['/images/hero-bg.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-40x40.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-40x40.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var stored = localStorage.getItem('theme');
                var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = stored || (systemDark ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.style.colorScheme = theme;
              } catch (error) {}
            })();
          `,
        }}
      />
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
