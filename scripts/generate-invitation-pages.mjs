import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const base = 'https://planneapp.com';
const enPath = '/digital-invitations';
const ptPath = '/pt-br/convite-digital';
const occasions = [
  ['/wedding', '/pt-br/casamento', 'Weddings', 'Casamentos'],
  ['/birthday', '/pt-br/aniversario', 'Birthdays', 'Aniversários'],
  ['/baby-shower', '/pt-br/cha-de-bebe', 'Baby showers', 'Chás de bebê'],
  ['/quinceanera', '/pt-br/debutante', 'Quinceañeras', '15 anos'],
  ['/graduation', '/pt-br/formatura', 'Graduations', 'Formaturas'],
];
const copy = {
  en: {
    lang: 'en-US', path: enPath, other: ptPath, otherLang: 'pt-BR', otherLabel: 'PT',
    title: 'Digital event invitations with RSVP | Planne',
    description: 'Create a digital invitation for your event with date, location and online RSVP. Share one link; guests reply in their browser while you plan in the Android app.',
    eyebrow: 'AN INVITATION THAT BEGINS THE CELEBRATION',
    h1: 'Digital event invitations with RSVP',
    lead: 'A beautiful invitation should help people feel welcome and make it easy to answer. Create your event in the Planne Android app, share its invitation link, and follow replies alongside your guest list.',
    primary: 'Create your invitation on Android', secondary: 'See invitation examples',
    imageCaption: 'One link. All the details your guests need.',
    introEye: 'FROM FIRST HELLO TO FINAL REPLY', introTitle: 'How a Planne invitation works',
    introText: 'The organizer uses Planne on Android to prepare the event. Guests open the invitation in a browser, see the details, and RSVP without installing the app. Their responses belong with the plan, so your next decision starts with a clearer guest count.',
    steps: [
      ['Plan the essentials', 'Add the date, time, location, and guests in the app before sending the link.'],
      ['Share one invitation link', 'Send it in the channel you choose. Guests can open it on their phone or computer.'],
      ['Follow the replies', 'RSVP responses help you plan food, seating, and the practical details.'],
    ],
    detailEye: 'MADE FOR REAL GATHERINGS', detailTitle: 'An invitation with a plan behind it',
    detailLead: 'Planne connects the guest-facing event page to the planning work you do before the day. A basic public invitation with RSVP is free; current Premium options and prices are shown in the app.',
    features: [
      ['Clear event details', 'Give guests one place for the date, address, and the message you want to share.'],
      ['Online RSVP', 'Guests reply in their browser; the organizer follows their answers in Planne.'],
      ['A look that feels yours', 'Premium adds photo, color, font, and message customization as well as private invitations.'],
    ],
    examplesTitle: 'Find an invitation for your occasion',
    examplesLead: 'Explore how Planne presents weddings, birthdays, baby showers, quinceañeras, and graduations. The invitation styles below are working previews; each opens in a new tab.',
    previewLabel: 'See a', previewEnd: 'invitation preview',
    previewNames: ['editorial', 'illustrated', 'engraved'],
    faqTitle: 'Before you share the link',
    faqs: [
      ['Do guests need the Planne app?', 'No. Guests open the invitation and RSVP in a browser. The organizer plans the event in the Android app.'],
      ['Can I create an invitation for free?', 'Yes. Planne includes a basic public invitation with RSVP. Premium features and current prices are available in the app.'],
      ['Can I change the invitation design?', 'Premium lets you customize photos, colors, fonts, and messages. You can preview the available styles before creating your own.'],
      ['Does Planne send the invitation for me?', 'You share the invitation link using the messaging or communication channel you choose.'],
    ],
    navHome: 'Event planning', navInvite: 'Digital invitations', navOccasions: 'Occasions',
    navLabel: 'Main navigation', skip: 'Skip to content', legalLabel: 'Support and legal information',
    contact: 'Contact Planne', privacy: 'Privacy', terms: 'Terms', footerText: 'The care behind every celebration.',
    closeEye: 'PLAN. INVITE. BE THERE.', closeTitle: 'Make room for the people who matter.',
    small: 'Start for free on Android. Premium features in the app.',
    imageAlt: 'Friends celebrating a birthday together',
  },
  pt: {
    lang: 'pt-BR', path: ptPath, other: enPath, otherLang: 'en-US', otherLabel: 'EN',
    title: 'Convite digital para evento com RSVP | Planne',
    description: 'Crie um convite para evento com data, local e confirmação de presença online. Compartilhe um link; convidados respondem pelo navegador e você planeja no app Android.',
    eyebrow: 'O CONVITE QUE COMEÇA A CELEBRAÇÃO',
    h1: 'Convite digital para evento com RSVP',
    lead: 'Um convite bonito acolhe as pessoas e facilita a resposta. Crie seu evento no app Android da Planne, compartilhe o link do convite e acompanhe as confirmações junto da lista de convidados.',
    primary: 'Criar convite no Android', secondary: 'Ver exemplos de convite',
    imageCaption: 'Um link. Tudo o que seus convidados precisam saber.',
    introEye: 'DO PRIMEIRO OLÁ À ÚLTIMA RESPOSTA', introTitle: 'Como funciona o convite da Planne',
    introText: 'Quem organiza usa a Planne no Android para preparar o evento. Os convidados abrem o convite no navegador, veem os detalhes e confirmam presença sem baixar o app. As respostas ficam junto do planejamento para ajudar nas próximas decisões.',
    steps: [
      ['Prepare o essencial', 'Defina data, horário, local e convidados no app antes de enviar o link.'],
      ['Compartilhe um link', 'Envie pelo canal que preferir. Os convidados podem abrir no celular ou computador.'],
      ['Acompanhe as respostas', 'As confirmações ajudam a planejar comida, mesas e os detalhes práticos.'],
    ],
    detailEye: 'FEITO PARA ENCONTROS REAIS', detailTitle: 'Um convite com planejamento por trás',
    detailLead: 'A Planne conecta a página do evento para convidados ao planejamento que você faz antes da celebração. O convite público básico com RSVP é gratuito; opções Premium e preços atuais ficam no app.',
    features: [
      ['Detalhes claros', 'Dê aos convidados um lugar para encontrar data, endereço e a mensagem que deseja compartilhar.'],
      ['Confirmação online', 'Os convidados respondem pelo navegador; quem organiza acompanha no app.'],
      ['Do seu jeito', 'O Premium permite personalizar foto, cores, fontes e mensagens, além de criar convites privados.'],
    ],
    examplesTitle: 'Encontre o convite da sua ocasião',
    examplesLead: 'Veja como a Planne apresenta casamentos, aniversários, chás de bebê, festas de 15 anos e formaturas. Os estilos abaixo são prévias funcionais; cada um abre em nova aba.',
    previewLabel: 'Ver prévia de convite', previewEnd: 'no estilo',
    previewNames: ['editorial', 'ilustrado', 'gravado'],
    faqTitle: 'Antes de compartilhar o link',
    faqs: [
      ['Os convidados precisam do app da Planne?', 'Não. Eles abrem o convite e confirmam presença pelo navegador. Quem organiza usa o app Android para planejar o evento.'],
      ['Posso criar um convite grátis?', 'Sim. A Planne inclui um convite público básico com RSVP. Os recursos Premium e preços atuais estão no app.'],
      ['Posso mudar o visual do convite?', 'No Premium, você personaliza fotos, cores, fontes e mensagens. É possível ver os estilos disponíveis antes de criar o seu.'],
      ['A Planne envia o convite por mim?', 'Você compartilha o link do convite pelo aplicativo de mensagens ou canal de comunicação que preferir.'],
    ],
    navHome: 'Planejador de eventos', navInvite: 'Convite digital', navOccasions: 'Ocasiões',
    navLabel: 'Navegação principal', skip: 'Pular para o conteúdo', legalLabel: 'Informações de suporte e legais',
    contact: 'Fale com a Planne', privacy: 'Privacidade', terms: 'Termos', footerText: 'O cuidado por trás de cada celebração.',
    closeEye: 'PLANEJE. CONVIDE. VIVA.', closeTitle: 'Abra espaço para as pessoas que importam.',
    small: 'Comece gratuitamente no Android. Recursos Premium no app.',
    imageAlt: 'Amigos celebrando um aniversário',
  },
};

function render(locale) {
  const c = copy[locale];
  const pt = locale === 'pt';
  const home = pt ? '/pt-br' : '/';
  const legal = pt ? ['/pt-br/privacidade', '/pt-br/termos'] : ['/privacy', '/terms'];
  const pageUrl = base + c.path;
  const image = base + '/assets/brand/graphic_feature.png';
  const schema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebPage', '@id': pageUrl + '#webpage',
    url: pageUrl, name: c.title, description: c.description, inLanguage: c.lang,
    isPartOf: {'@id': base + '/#website'}, about: {'@id': base + '/#app'},
    publisher: {'@id': base + '/#organization'},
  });
  const steps = c.steps.map(([title, text], i) => `<li><span>0${i + 1}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join('');
  const features = c.features.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join('');
  const faq = c.faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  const links = occasions.map(([en, br, enText, brText]) => `<a href="${pt ? br : en}">${pt ? brText : enText} <span aria-hidden="true">↗</span></a>`).join('');
  const styleNames = ['foto-editorial', 'ilustrado', 'gravado'];
  const previews = styleNames.map((style, i) => {
    const url = `/rsvp-v2?landing-preview=birthday&amp;lang=${locale}&amp;style=${style}`;
    return `<a href="${url}" target="_blank" rel="noopener">${pt ? `${c.previewLabel} ${c.previewEnd} ${c.previewNames[i]}` : `${c.previewLabel} ${c.previewNames[i]} ${c.previewEnd}`} ↗</a>`;
  }).join('');
  return `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${c.title}</title><meta name="description" content="${c.description}"><meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${pageUrl}"><link rel="alternate" hreflang="en-US" href="${base + enPath}"><link rel="alternate" hreflang="pt-BR" href="${base + ptPath}"><link rel="alternate" hreflang="x-default" href="${base + enPath}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Planne"><meta property="og:locale" content="${pt ? 'pt_BR' : 'en_US'}"><meta property="og:locale:alternate" content="${pt ? 'en_US' : 'pt_BR'}"><meta property="og:url" content="${pageUrl}"><meta property="og:title" content="${c.title}"><meta property="og:description" content="${c.description}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${c.title}"><meta name="twitter:description" content="${c.description}"><meta name="twitter:image" content="${image}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32x32.png"><link rel="preload" href="/assets/marketing/poppins-medium.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/marketing/institutional.css"><link rel="stylesheet" href="/assets/marketing/topics.css"><script src="/assets/marketing/institutional.js" defer></script>
<script type="application/ld+json">${schema}</script>
</head>
<body class="planne-institutional m-topic">
<a class="m-skip" href="#content">${c.skip}</a>
<header class="m-header m-wrap"><a class="m-brand" href="${home}" aria-label="Planne"><img src="/assets/brand/logo-64x64.png" width="36" height="36" alt=""><span>Planne</span></a><button class="m-menu" aria-expanded="false" aria-controls="navigation" hidden>Menu <span aria-hidden="true">+</span></button><nav id="navigation" aria-label="${c.navLabel}"><a href="${home}">${c.navHome}</a><a href="${c.path}" aria-current="page">${c.navInvite}</a><a href="#occasions">${c.navOccasions}</a><a class="m-language" href="${c.other}" lang="${c.otherLang}" hreflang="${c.otherLang}" aria-label="${pt ? 'Read this page in English' : 'Ler esta página em português'}">${c.otherLabel}</a></nav></header>
<main id="content">
<section class="m-topic-hero m-wrap"><div><p class="m-eyebrow">${c.eyebrow}</p><h1>${c.h1}</h1><p class="m-lead">${c.lead}</p><div class="m-hero-actions"><a class="m-button" data-cta-location="invitation_hero" href="https://play.google.com/store/apps/details?id=com.planne.planne">${c.primary}<span aria-hidden="true">↗</span></a><a class="m-button m-button-secondary" href="#examples">${c.secondary}<span aria-hidden="true">↓</span></a></div><p class="m-small">${c.small}</p></div><figure class="m-topic-photo"><img src="/assets/video/birthday-poster.webp" srcset="/assets/video/birthday-poster-800.webp 800w, /assets/video/birthday-poster.webp 1600w" sizes="(max-width: 900px) 100vw, 42vw" width="1600" height="900" alt="${c.imageAlt}" fetchpriority="high"><figcaption>${c.imageCaption}</figcaption></figure></section>
<section class="m-topic-intro m-wrap" id="how-it-works"><div><p class="m-eyebrow">${c.introEye}</p><h2>${c.introTitle}</h2><p>${c.introText}</p></div><ol class="m-topic-steps">${steps}</ol></section>
<section class="m-topic-detail"><div class="m-wrap"><p class="m-eyebrow">${c.detailEye}</p><h2>${c.detailTitle}</h2><p>${c.detailLead}</p><div class="m-topic-grid">${features}</div></div></section>
<section class="m-topic-examples m-wrap" id="examples"><p class="m-eyebrow">${c.navOccasions}</p><h2>${c.examplesTitle}</h2><p>${c.examplesLead}</p><nav id="occasions" aria-label="${c.navOccasions}">${links}</nav><div class="m-topic-preview">${previews}</div></section>
<section class="m-topic-faq m-wrap"><div><p class="m-eyebrow">FAQ</p><h2>${c.faqTitle}</h2></div><div>${faq}</div></section>
<section class="m-close"><div class="m-wrap"><p class="m-eyebrow">${c.closeEye}</p><h2>${c.closeTitle}</h2><a class="m-button" data-cta-location="invitation_footer" href="https://play.google.com/store/apps/details?id=com.planne.planne">${c.primary}<span aria-hidden="true">↗</span></a></div></section>
</main>
<footer class="m-footer m-wrap"><div><a class="m-brand" href="${home}" aria-label="Planne"><img src="/assets/brand/logo-64x64.png" width="36" height="36" alt=""><span>Planne</span></a><p>${c.footerText}</p></div><nav aria-label="${c.legalLabel}"><a href="mailto:spestech01@gmail.com">${c.contact}</a><a href="${legal[0]}">${c.privacy}</a><a href="${legal[1]}">${c.terms}</a></nav><p class="m-copyright">© 2026 Planne</p></footer>
</body></html>
`;
}

for (const locale of ['en', 'pt']) {
  const path = resolve(root, 'public', copy[locale].path.slice(1), 'index.html');
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, render(locale));
}
console.log('Generated English and Portuguese digital invitation pages.');
