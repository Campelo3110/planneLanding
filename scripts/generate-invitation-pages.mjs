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
    eyebrow: 'THE INVITATION, BEFORE THE FIRST HELLO',
    h1: 'An invitation that feels like your event.',
    lead: 'Create an invitation, share one link and collect RSVPs.',
    primary: 'Create your invitation on Android', secondary: 'See invitation examples',
    imageCaption: 'A real invitation, seen by your guests.',
    builderEye: 'TRY THE EDITOR', builderTitle: 'See your invitation take shape.',
    builderLead: 'Change the details and watch the preview.',
    builderSlotTitle: 'Invitation demo', builderSlotText: 'Demo only. Nothing is saved or published.',
    editableTitle: 'What you can change', editable: ['Event name, date and place', 'A message for guests', 'Photo, colors and type with Premium'],
    previewTitle: 'Guest preview', builderLink: 'Open this invitation',
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
      ['Disposable camera', 'With the Premium event album, guests open a camera from your QR code or link and send photos. You see them in the app.'],
    ],
    examplesTitle: 'Choose your style.',
    examplesLead: 'See three invitation styles.',
    previewLabel: 'See a', previewEnd: 'invitation preview',
    previewNames: ['editorial', 'illustrated', 'engraved'],
    faqTitle: 'Good to know',
    faqs: [
      ['Do guests need the app?', 'No. They open the link and RSVP in a browser.'],
      ['Who shares the invitation?', 'You share the link through your preferred channel.'],
    ],
    plansEye: 'FREE AND PREMIUM', plansTitle: 'Start free. Make it yours with Premium.',
    freeTitle: 'Public invitation', freeText: 'A public link with RSVP, free to use.',
    premiumTitle: 'Private and personal', premiumText: 'Private access, photos, colors, fonts and custom messages.',
    plansNote: 'See current Premium prices in the app. Guests do not need the app.',
    navHome: 'Event planning', navInvite: 'Digital invitations', navOccasions: 'Occasions',
    navLabel: 'Main navigation', skip: 'Skip to content', legalLabel: 'Support and legal information',
    contact: 'Contact Planne', privacy: 'Privacy', terms: 'Terms', footerText: 'The care behind every celebration.',
    closeEye: 'PLAN. INVITE. BE THERE.', closeTitle: 'Make room for the people who matter.',
    small: 'Public invitation is free. Private invitations and design tools are Premium.',
    imageAlt: 'Preview of a Planne digital invitation',
  },
  pt: {
    lang: 'pt-BR', path: ptPath, other: enPath, otherLang: 'en-US', otherLabel: 'EN',
    title: 'Convite digital para evento com RSVP | Planne',
    description: 'Crie um convite para evento com data, local e confirmação de presença online. Compartilhe um link; convidados respondem pelo navegador e você planeja no app Android.',
    eyebrow: 'O CONVITE ANTES DO PRIMEIRO OLÁ',
    h1: 'Um convite com a cara da sua celebração.',
    lead: 'Crie o convite, compartilhe um link e receba confirmações.',
    primary: 'Criar convite no Android', secondary: 'Ver exemplos de convite',
    imageCaption: 'O convite como seus convidados vão ver.',
    builderEye: 'TESTE O EDITOR', builderTitle: 'Veja seu convite ganhar forma.',
    builderLead: 'Mude os detalhes e acompanhe a prévia.',
    builderSlotTitle: 'Demonstração do convite', builderSlotText: 'Exemplo apenas. Nada é salvo ou publicado.',
    editableTitle: 'O que você pode alterar', editable: ['Nome, data e local do evento', 'Mensagem para os convidados', 'Foto, cores e fontes com o Premium'],
    previewTitle: 'Prévia para convidados', builderLink: 'Abrir este convite',
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
      ['Câmera descartável', 'Com o álbum Premium, convidados abrem a câmera por QR code ou link e enviam fotos. Você vê tudo no app.'],
    ],
    examplesTitle: 'Escolha seu estilo.',
    examplesLead: 'Veja três estilos de convite.',
    previewLabel: 'Ver prévia de convite', previewEnd: 'no estilo',
    previewNames: ['editorial', 'ilustrado', 'gravado'],
    faqTitle: 'Bom saber',
    faqs: [
      ['Convidados precisam do app?', 'Não. Eles abrem o link e confirmam pelo navegador.'],
      ['Quem compartilha o convite?', 'Você envia o link pelo canal que preferir.'],
    ],
    plansEye: 'GRÁTIS E PREMIUM', plansTitle: 'Comece grátis. Personalize com o Premium.',
    freeTitle: 'Convite público', freeText: 'Link público com RSVP, sem custo.',
    premiumTitle: 'Privado e personalizado', premiumText: 'Acesso privado, fotos, cores, fontes e mensagens próprias.',
    plansNote: 'Preços atuais do Premium no app. Convidados não precisam instalar.',
    navHome: 'Planejador de eventos', navInvite: 'Convite digital', navOccasions: 'Ocasiões',
    navLabel: 'Navegação principal', skip: 'Pular para o conteúdo', legalLabel: 'Informações de suporte e legais',
    contact: 'Fale com a Planne', privacy: 'Privacidade', terms: 'Termos', footerText: 'O cuidado por trás de cada celebração.',
    closeEye: 'PLANEJE. CONVIDE. VIVA.', closeTitle: 'Abra espaço para as pessoas que importam.',
    small: 'Convite público grátis. Convite privado e personalização no Premium.',
    imageAlt: 'Prévia de um convite digital da Planne',
  },
};

function render(locale) {
  const c = copy[locale];
  const pt = locale === 'pt';
  const home = pt ? '/pt-br' : '/';
  const legal = ['/privacy', '/terms'];
  const pageUrl = base + c.path;
  const image = base + '/assets/brand/graphic_feature.png';
  const schema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebPage', '@id': pageUrl + '#webpage',
    url: pageUrl, name: c.title, description: c.description, inLanguage: c.lang,
    isPartOf: {'@id': base + '/#website'}, about: {'@id': base + '/#app'},
    publisher: {'@id': base + '/#organization'},
  });
  const faq = c.faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  const links = occasions.map(([en, br, enText, brText]) => `<a href="${pt ? br : en}">${pt ? brText : enText} <span aria-hidden="true">↗</span></a>`).join('');
  const menu = occasions.map(([en, br, enText, brText]) => `<a href="${pt ? br : en}"><span>${pt ? brText : enText}</span><span aria-hidden="true">↗</span></a>`).join('');
  const styleNames = ['foto-editorial', 'ilustrado', 'gravado'];
  const previewUrl = style => `/rsvp-v2.html?landing-preview=birthday&amp;lang=${locale}&amp;style=${style}&amp;no-cover=1`;
  const previews = styleNames.map((style, i) => {
    return `<figure class="m-topic-style"><div class="m-invite-frame"><div class="m-invite-placeholder"><span>Planne</span><span>${c.previewNames[i]}</span></div><iframe src="${previewUrl(style)}" loading="lazy" tabindex="-1" title="${c.imageAlt}: ${c.previewNames[i]}"></iframe></div><figcaption><span>${c.previewNames[i]}</span><a href="${previewUrl(style)}" target="_blank" rel="noopener" aria-label="${pt ? `${c.previewLabel} ${c.previewEnd} ${c.previewNames[i]}` : `${c.previewLabel} ${c.previewNames[i]} ${c.previewEnd}`}">↗</a></figcaption></figure>`;
  }).join('');
  return `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${c.title}</title><meta name="description" content="${c.description}"><meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${pageUrl}"><link rel="alternate" hreflang="en-US" href="${base + enPath}"><link rel="alternate" hreflang="pt-BR" href="${base + ptPath}"><link rel="alternate" hreflang="x-default" href="${base + enPath}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Planne"><meta property="og:locale" content="${pt ? 'pt_BR' : 'en_US'}"><meta property="og:locale:alternate" content="${pt ? 'en_US' : 'pt_BR'}"><meta property="og:url" content="${pageUrl}"><meta property="og:title" content="${c.title}"><meta property="og:description" content="${c.description}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${c.title}"><meta name="twitter:description" content="${c.description}"><meta name="twitter:image" content="${image}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32x32.png"><link rel="preload" href="/assets/marketing/poppins-medium.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/marketing/institutional.css?v=20261014-editor"><link rel="stylesheet" href="/assets/marketing/topics.css?v=20261015-invite"><script src="/assets/marketing/institutional.js?v=20261015-language" defer></script><script src="/assets/marketing/invitation-builder.js?v=20261015-invite" defer></script>
<script type="application/ld+json">${schema}</script>
</head>
<body class="planne-institutional m-topic">
<a class="m-skip" href="#content">${c.skip}</a>
<nav class="m-event-top" aria-label="${c.navOccasions}"><div class="m-event-top-inner">${menu}</div></nav>
<header class="m-header m-wrap"><a class="m-brand" href="${home}" aria-label="Planne"><img src="/assets/brand/logo-64x64.png" width="36" height="36" alt=""><span>Planne</span></a><button class="m-menu" aria-expanded="false" aria-controls="navigation" hidden>Menu <span aria-hidden="true">+</span></button><nav id="navigation" aria-label="${c.navLabel}"><a href="${home}">${c.navHome}</a><a href="${c.path}" aria-current="page">${c.navInvite}</a><a href="#premium">Premium</a><a href="#occasions">${c.navOccasions}</a><a class="m-language" href="${c.other}" lang="${c.otherLang}" hreflang="${c.otherLang}" aria-label="${pt ? 'Read this page in English' : 'Ler esta página em português'}">${c.otherLabel}</a></nav></header>
<main id="content">
<section class="m-topic-hero m-wrap"><div class="m-topic-hero-copy"><p class="m-eyebrow">${c.eyebrow}</p><h1>${c.h1}</h1><p class="m-lead">${c.lead}</p><div class="m-hero-actions"><a class="m-button" data-cta-location="invitation_hero" href="https://play.google.com/store/apps/details?id=com.planne.planne">${c.primary}<span aria-hidden="true">↗</span></a><a class="m-button m-button-secondary" href="#examples">${c.secondary}<span aria-hidden="true">↓</span></a></div><p class="m-small">${c.small}</p></div><figure class="m-topic-hero-invite"><div class="m-invite-frame"><div class="m-invite-placeholder"><span>Planne</span><span>${c.previewTitle}</span></div><iframe src="${previewUrl('ilustrado')}" loading="eager" tabindex="-1" title="${c.imageAlt}"></iframe></div><figcaption>${c.imageCaption}</figcaption></figure></section>
<section class="m-topic-plans m-wrap" id="premium"><div class="m-topic-section-head"><p class="m-eyebrow">${c.plansEye}</p><h2>${c.plansTitle}</h2></div><div class="m-topic-plan-grid"><article><span>${pt ? 'Grátis' : 'Free'}</span><h3>${c.freeTitle}</h3><p>${c.freeText}</p></article><article class="is-premium"><span>Premium</span><h3>${c.premiumTitle}</h3><p>${c.premiumText}</p></article></div><p class="m-topic-plan-note">${c.plansNote}</p></section>
<section class="m-topic-builder" id="builder"><div class="m-wrap"><div class="m-topic-section-head"><p class="m-eyebrow">${c.builderEye}</p><h2>${c.builderTitle}</h2><p>${c.builderLead}</p></div><div class="m-topic-builder-grid"><div class="m-builder-slot" data-planne-builder-mount data-locale="${locale}"><div class="m-builder-slot-head"><span aria-hidden="true">✦</span><span>${c.builderSlotTitle}</span></div><div class="m-builder-slot-body"><p>${c.builderSlotText}</p></div></div><div class="m-builder-result"><p class="m-builder-preview-label">${c.previewTitle}</p><div class="m-invite-frame"><div class="m-invite-placeholder"><span>Planne</span><span>${c.previewTitle}</span></div><iframe data-builder-preview src="${previewUrl('foto-editorial')}&amp;builder-demo=1" loading="lazy" title="${c.imageAlt}"></iframe></div><p class="m-builder-preview-note">${pt ? 'RSVP desativado no exemplo.' : 'RSVP is off in this demo.'}</p></div></div></div></section>
<section class="m-topic-examples m-wrap" id="examples"><p class="m-eyebrow">${c.navInvite}</p><h2>${c.examplesTitle}</h2><p>${c.examplesLead}</p><div class="m-topic-preview">${previews}</div><nav id="occasions" aria-label="${c.navOccasions}">${links}</nav></section>
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
