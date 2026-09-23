import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(import.meta.dirname, '..', 'public/pt-br/index.html');
let html = readFileSync(file, 'utf8');
const title = 'Planne | App para organizar eventos, sites e convites';
const description = 'Crie o site do seu evento com RSVP e organize convidados, mesas, orçamento e tarefas na Planne. Comece grátis no Android.';
const metadata = `<title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="https://planneapp.com/pt-br/"><link rel="alternate" hreflang="en" href="https://planneapp.com/"><link rel="alternate" hreflang="pt-BR" href="https://planneapp.com/pt-br/"><link rel="alternate" hreflang="x-default" href="https://planneapp.com/"><meta property="og:type" content="website"><meta property="og:site_name" content="Planne"><meta property="og:locale" content="pt_BR"><meta property="og:locale:alternate" content="en_US"><meta property="og:url" content="https://planneapp.com/pt-br/"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="https://planneapp.com/assets/brand/graphic_feature.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="https://planneapp.com/assets/brand/graphic_feature.png"><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","url":"https://planneapp.com/pt-br/","name":"${title}","description":"${description}","inLanguage":"pt-BR"}</script></head>`;
html = html.replace(/<title>Planne \| App para organizar eventos, sites e convites<\/title>[\s\S]*?<\/script><\/head>/, metadata);
html = html
  .replaceAll('aria-label="Enlarge: Seu evento inteiro (opens a new tab)"', 'aria-label="Ampliar: Seu evento inteiro (abre em nova aba)"')
  .replaceAll('aria-label="Enlarge: Cada pessoa no plano (opens a new tab)"', 'aria-label="Ampliar: Cada pessoa no plano (abre em nova aba)"')
  .replaceAll('aria-label="Enlarge: Cada escolha no orçamento (opens a new tab)"', 'aria-label="Ampliar: Cada escolha no orçamento (abre em nova aba)"')
  .replaceAll('aria-label="Enlarge: Um próximo passo claro (opens a new tab)"', 'aria-label="Ampliar: Um próximo passo claro (abre em nova aba)"');
writeFileSync(file, html);
console.log('Normalized Portuguese home metadata and accessible labels.');
