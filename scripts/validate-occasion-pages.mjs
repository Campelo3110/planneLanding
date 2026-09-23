import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const hosting = JSON.parse(readFileSync(resolve(root, 'firebase.json'), 'utf8')).hosting;
const pairs = [
  ['wedding', 'casamento'], ['birthday', 'aniversario'], ['baby-shower', 'cha-de-bebe'], ['quinceanera', 'debutante'], ['graduation', 'formatura'],
];
const requiredSections = ['m-film-hero', 'm-statement', 'm-occasion-focus', 'm-invitation', 'm-invite-showcase', 'm-app-showcase', 'm-planning', 'm-guide', 'm-premium', 'm-faq', 'm-occasions', 'm-close'];
const errors = [];
const commonHeaders = hosting.headers.find(({ source }) => source === '**')?.headers ?? [];
const previewHeaders = hosting.headers.find(({ source }) => source === '/rsvp-v2.html')?.headers ?? [];
const previewCleanUrlHeaders = hosting.headers.find(({ source }) => source === '/rsvp-v2')?.headers ?? [];
const commonCsp = commonHeaders.find(({ key }) => key === 'Content-Security-Policy')?.value ?? '';
const previewCsp = previewHeaders.find(({ key }) => key === 'Content-Security-Policy')?.value ?? '';
const rewrites = hosting.rewrites ?? [];
const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
const rsvp = readFileSync(resolve(root, 'public/rsvp-v2.html'), 'utf8');
const rsvpScript = readFileSync(resolve(root, 'public/assets/js/rsvp-v2.js'), 'utf8');
if (!commonCsp.includes("frame-src 'self'")) errors.push('hosting: pages cannot load same-origin invitation previews');
if (!previewCsp.includes("frame-ancestors 'self'")) errors.push('hosting: invitation previews cannot be embedded by Planne');
if (!previewHeaders.some(({ key, value }) => key === 'X-Frame-Options' && value === 'SAMEORIGIN')) errors.push('hosting: invitation previews need SAMEORIGIN framing');
if (!previewCleanUrlHeaders.some(({ key, value }) => key === 'X-Frame-Options' && value === 'SAMEORIGIN')) errors.push('hosting: clean invitation preview URL needs SAMEORIGIN framing');
if (!(previewCleanUrlHeaders.find(({ key }) => key === 'Content-Security-Policy')?.value ?? '').includes("frame-ancestors 'self'")) errors.push('hosting: clean invitation preview URL cannot be embedded by Planne');
if (!rewrites.some(({ source, destination }) => source === '/*' && destination === '/rsvp-v2.html')) errors.push('hosting: custom invitation slugs must be limited to one path segment');
if (rewrites.some(({ source }) => source === '**')) errors.push('hosting: universal rewrite causes soft 404s');
if (!rsvp.includes('name="robots" content="noindex, nofollow, noarchive"')) errors.push('rsvp: public invitations must not be indexed');
if (!rsvpScript.includes("!window.__rsvpToken &&") || !rsvpScript.includes("pathSlug !== 'rsvp-v2'")) errors.push('rsvp: token URLs must not resolve the renderer route as a custom slug');
if (!existsSync(resolve(root, 'public/llms.txt'))) errors.push('geo: missing llms.txt');
if (!sitemap.includes('<loc>https://planneapp.com/pt-br/</loc>') || !sitemap.includes('hreflang="pt-br" href="https://planneapp.com/pt-br/"')) errors.push('sitemap: Portuguese home URL must match its canonical URL');
for (const [en, pt] of pairs) {
  for (const [locale, route, otherRoute] of [['en', en, `pt-br/${pt}`], ['pt', `pt-br/${pt}`, en]]) {
    const file = resolve(root, 'public', route, 'index.html');
    const html = readFileSync(file, 'utf8');
    const language = locale === 'pt' ? 'pt-BR' : 'en';
    if (!html.includes(`<html lang="${language}">`)) errors.push(`${route}: incorrect document language`);
    if (!html.includes(`hreflang="${locale === 'pt' ? 'en' : 'pt-BR'}"`) || !html.includes(`href="/${otherRoute}"`)) errors.push(`${route}: language switch does not target its counterpart`);
    if (!html.includes(`<link rel="alternate" hreflang="en" href="https://planneapp.com/${en}">`) || !html.includes(`<link rel="alternate" hreflang="pt-BR" href="https://planneapp.com/pt-br/${pt}">`)) errors.push(`${route}: invalid hreflang pair`);
    if (!html.includes('poppins-medium.woff2') || !html.includes('poppins-regular.woff2')) errors.push(`${route}: missing critical WOFF2 font preload`);
    for (const section of requiredSections) if (!html.includes(section)) errors.push(`${route}: missing shared section ${section}`);
    const previewPrefix = `/rsvp-v2?landing-preview=${en}&amp;lang=${locale}&amp;style=`;
    if (!html.includes(previewPrefix) || (html.match(/\/rsvp-v2\?landing-preview=/g) ?? []).length !== 6) errors.push(`${route}: previews do not use the Planne invitation renderer for this occasion`);
    if (!html.includes('data-cta-location="hero_preview"')) errors.push(`${route}: missing invitation-preview CTA in hero`);
    for (const href of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const url = href[1].split(/[?#]/)[0];
      if (!url || url.startsWith('//')) continue;
      const candidate = resolve(root, 'public', `.${url}`);
      if (!existsSync(candidate) && !existsSync(`${candidate}.html`) && !existsSync(resolve(candidate, 'index.html'))) errors.push(`${route}: broken local asset or route ${url}`);
    }
  }
}
const ptHome = readFileSync(resolve(root, 'public/pt-br/index.html'), 'utf8');
if (!ptHome.includes('hreflang="en" href="https://planneapp.com/"')) errors.push('pt-br home: English hreflang is incorrect');
if (!ptHome.includes('property="og:locale" content="pt_BR"')) errors.push('pt-br home: Open Graph locale is incorrect');
if (/website with RSVP|opens a new tab|Event planning app/.test(ptHome)) errors.push('pt-br home: English metadata or accessible labels remain');
if (errors.length) {
  console.error(errors.map(error => `FAIL: ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Validated ${pairs.length * 2} localized occasion pages and Portuguese home metadata.`);
