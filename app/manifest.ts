import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Planne',
    short_name: 'Planne',
    description: 'Planejamento de eventos com clareza.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFCF9',
    theme_color: '#13B8A7',
    lang: 'pt-BR',
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
