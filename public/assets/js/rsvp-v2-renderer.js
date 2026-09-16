/* Renderer compartilhado pelo site publicado e pelo asset local do editor. */
(() => {
  const root = document.documentElement;
  const byId = id => document.getElementById(id);
  const node = (tag, text, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; el.textContent = text || ''; return el; };
    const PALETTES = {
      dourado: { accent: '#b08d3e', dark: '#16213e', soft: '#f6efdd', paper: '#fbf7ee' },
      grafite: { accent: '#2b2f36', dark: '#0a0a0a', soft: '#f2f3f5', paper: '#ffffff' },
      framboesa: { accent: '#e23d5b', dark: '#7c1d3e', soft: '#fff6da', paper: '#fffdf6' },
      'coral-tropical': { accent: '#e8623a', dark: '#7a2e17', soft: '#e4f5ee', paper: '#fbf3e7' },
      ameixa: { accent: '#7a4b5e', dark: '#40273c', soft: '#eef0e4', paper: '#f7f3e9' },
      indigo: { accent: '#2e3b52', dark: '#131a26', soft: '#eef1f5', paper: '#ffffff' },
    };
    const FONT_PAIRS = {
      'script-dourado': { display: '"Bonheur Royale", cursive', body: '"Jost", sans-serif', query: 'Bonheur+Royale&family=Jost:wght@400;500;600' },
      suico: { display: '"Familjen Grotesk", sans-serif', body: '"Archivo", sans-serif', query: 'Familjen+Grotesk:wght@500;600&family=Archivo:wght@400;500;600' },
      divertido: { display: '"Fredoka", sans-serif', body: '"Quicksand", sans-serif', query: 'Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700' },
      postal: { display: '"Unbounded", sans-serif', body: '"Karla", sans-serif', query: 'Unbounded:wght@500;600;700&family=Karla:wght@400;500;600' },
      literario: { display: '"Vollkorn", Georgia, serif', body: '"Nunito Sans", sans-serif', query: 'Vollkorn:ital,wght@0,500;1,500;0,600&family=Nunito+Sans:wght@400;500;600' },
      tecnico: { display: '"Martian Mono", monospace', body: '"Work Sans", sans-serif', query: 'Martian+Mono:wght@400;500;600&family=Work+Sans:wght@400;500;600' },
    };

    // SVGs decorativos não recebem foco e nunca interceptam os campos do RSVP.
    document.querySelectorAll('main > section:not(.event-summary)').forEach(section => {
      const ornament = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      ornament.setAttribute('class', 'page-ornament');
      ornament.setAttribute('viewBox', '0 0 180 240');
      ornament.setAttribute('aria-hidden', 'true');
      ornament.setAttribute('focusable', 'false');
      ['editorial', 'illustrated', 'engraved'].forEach((style, index) => {
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', '#ornament-' + ['editorial', 'illustrated', 'engraved'][index]);
        use.setAttribute('class', 'ornament-' + style);
        ornament.appendChild(use);
      });
      section.prepend(ornament);
      if (section.classList.contains('section')) {
        const divider = document.createElement('div');
        divider.className = 'section-divider';
        divider.setAttribute('aria-hidden', 'true');
        divider.innerHTML = '<svg viewBox="0 0 80 32" focusable="false"><use href="#ornament-divider"/></svg>';
        section.appendChild(divider);
      }
    });

  let lastCover = null, lastMap = null, lastFont = null, lastReveal = null;
  let mapTimer;
  let entranceAnimations = [], envelopeLayer = null;
  const entranceCSS = document.createElement('style');
  entranceCSS.textContent = `
    .invite-envelope-stage { position:fixed; inset:0; z-index:20; display:grid; place-items:center; background:var(--paper); pointer-events:none; overflow:hidden; }
    .invite-envelope { position:relative; width:min(76vw,420px); aspect-ratio:1.5; perspective:1000px; }
    .invite-envelope-back { position:absolute; inset:0; background:var(--accent-soft); box-shadow:0 18px 48px #0002; border:1px solid var(--line); }
    .invite-envelope-card { position:absolute; inset:7% 7% 4%; display:grid; place-content:center; gap:12px; text-align:center; padding:20px; background:var(--surface); border:1px solid var(--line); color:var(--accent-dark); }
    .invite-envelope-card strong { font:400 clamp(26px,7vw,52px)/1.1 var(--display); }
    .invite-envelope-card span { font:400 13px/1.4 var(--body); }
    .invite-envelope-front { position:absolute; inset:0; background:var(--accent-soft); clip-path:polygon(0 0,50% 52%,100% 0,100% 100%,0 100%); }
    .invite-envelope-fold { position:absolute; inset:0; background:var(--paper); clip-path:polygon(0 100%,50% 43%,100% 100%); }
    .invite-envelope-flap { position:absolute; inset:0; background:var(--accent-soft); clip-path:polygon(0 0,100% 0,50% 55%); transform-origin:top; backface-visibility:hidden; filter:drop-shadow(0 2px 1px #0002); }
    .invite-envelope-seal { position:absolute; left:50%; top:48%; width:54px; height:54px; margin:-27px; border-radius:50%; display:grid; place-items:center; background:var(--accent-dark); color:var(--paper); border:3px double var(--accent); font:400 18px/1 var(--display); box-shadow:0 3px 8px #0002; }
  `;
  document.head.append(entranceCSS);
  function playEntrance(reveal, event) {
    entranceAnimations.forEach(animation => animation.cancel());
    entranceAnimations = [];
    envelopeLayer?.remove(); envelopeLayer = null;
    if (!['fade','envelope'].includes(reveal) || typeof sectionNodes.hero.animate !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animate = (element, frames, timing) => {
      const animation = element.animate(frames, {fill:'both', easing:'cubic-bezier(.22,1,.36,1)', ...timing});
      entranceAnimations.push(animation);
      return animation;
    };
    if (reveal === 'fade') {
      animate(sectionNodes.hero, [{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}], {duration:800});
      return;
    }
    const layer = node('div','','invite-envelope-stage');
    if (event.previewThumbnail) layer.style.bottom = '42%';
    layer.setAttribute('aria-hidden','true');
    const envelope = node('div','','invite-envelope');
    const card = node('div','','invite-envelope-card');
    card.append(node('strong',byId('eventMonogram').textContent),node('span',event.eventTitle));
    const flap = node('div','','invite-envelope-flap');
    const seal = node('div',byId('eventMonogram').textContent,'invite-envelope-seal');
    envelope.append(node('div','','invite-envelope-back'),card,node('div','','invite-envelope-front'),node('div','','invite-envelope-fold'),flap,seal);
    layer.append(envelope); document.body.append(layer); envelopeLayer = layer;
    animate(envelope,[{opacity:0,transform:'translateY(24px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:500});
    animate(seal,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.15) translateY(-12px)'}],{delay:400,duration:300});
    animate(flap,[{transform:'rotateX(0deg)'},{transform:'rotateX(-180deg)'}],{delay:550,duration:700});
    animate(card,[{transform:'translateY(0)'},{transform:'translateY(-48%)'}],{delay:950,duration:850});
    animate(envelope,[{transform:'translateY(0)'},{transform:'translateY(100px)'}],{delay:1700,duration:650,fill:'forwards'});
    const exit = animate(layer,[{opacity:1},{opacity:0}],{delay:1750,duration:650});
    animate(sectionNodes.hero,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{delay:1750,duration:800});
    exit.finished.then(() => { layer.remove(); if (envelopeLayer === layer) envelopeLayer = null; }).catch(() => {});
  }
  const sectionNodes = {hero: document.querySelector('.hero'), summary: document.querySelector('.event-summary'), schedule: byId('cronograma'), info: byId('detalhes'), location: byId('local'), faq: byId('faqSection'), rsvp: byId('rsvp')};
  const defaultOrder = Object.keys(sectionNodes);
  const list = raw => { try { const items = typeof raw === 'string' ? JSON.parse(raw) : raw; return Array.isArray(items) ? items : []; } catch (_) { return []; } };
  function applyAppearance(event) {
    root.dataset.inviteStyle = ['foto-editorial','ilustrado','gravado'].includes(event.rsvpTemplateId) ? event.rsvpTemplateId : 'foto-editorial';
    ['--accent','--accent-dark','--accent-soft','--paper','--surface','--display','--body'].forEach(key => root.style.removeProperty(key));
    const palette = PALETTES[event.rsvpPaletteId];
    if (palette) {
      Object.entries({'--accent':palette.accent,'--accent-dark':palette.dark,'--accent-soft':palette.soft,'--paper':palette.paper,'--surface':palette.paper}).forEach(([key,value]) => root.style.setProperty(key,value));
    } else if (/^#[0-9a-f]{6}$/i.test(event.rsvpAccentColor || '')) {
      root.style.setProperty('--accent', event.rsvpAccentColor);
      root.style.setProperty('--accent-dark', `color-mix(in oklch, ${event.rsvpAccentColor} 68%, black)`);
      root.style.setProperty('--accent-soft', `color-mix(in oklch, ${event.rsvpAccentColor} 14%, white)`);
    }
    const pair = FONT_PAIRS[event.rsvpFontPairId];
    root.toggleAttribute('data-custom-font', !!pair);
    if (pair) {
      root.style.setProperty('--display', pair.display); root.style.setProperty('--body', pair.body);
    }
    if (lastFont !== (pair?.query || '')) {
      lastFont = pair?.query || '';
      byId('invite-font-override')?.remove();
      if (pair) { const link = document.createElement('link'); link.id = 'invite-font-override'; link.rel = 'stylesheet'; link.href = `https://fonts.googleapis.com/css2?family=${pair.query}&display=swap`; document.head.append(link); }
    }
  }
  function setCover(url) {
    const safe = typeof url === 'string' && /^(https:\/\/|data:image\/)/i.test(url) ? url : '';
    const hero = sectionNodes.hero, frame = document.querySelector('.hero-photo'), img = frame.querySelector('img');
    hero.classList.toggle('no-cover', !safe); frame.hidden = !safe;
    if (lastCover !== safe) { lastCover = safe; if (safe) img.src = safe; else img.removeAttribute('src'); }
    img.onerror = () => { hero.classList.add('no-cover'); frame.hidden = true; };
  }
  function translate(en) {
    const tr = (pt, english) => en ? english : pt;
    const strings = {
      eventKicker: tr('Você é nosso convidado','You are invited'), 'schedule-title':tr('Programação do dia','Day schedule'),
      'details-title':tr('Antes de sair de casa','Before you go'), 'venue-title':tr('Local do evento','Event location'),
      'faq-title':tr('Perguntas frequentes','Frequently asked questions'), 'rsvp-title':tr('Vamos celebrar juntos?','Shall we celebrate together?'),
      nameError:tr('Digite seu nome completo.','Enter your full name.'), attendanceError:tr('Escolha se você poderá comparecer.','Let us know if you can attend.'),
      mapLink:tr('Abrir rota no mapa','Open directions'),
    };
    Object.entries(strings).forEach(([id,value]) => { if (byId(id)) byId(id).textContent = value; });
    const set = (selector,value) => document.querySelectorAll(selector).forEach(el => el.textContent = value);
    set('a[href="#rsvp"]:not(.skip-link)',tr('Confirmar presença','RSVP'));
    set('a[href="#local"]:not(.button)',tr('Local','Location'));
    set('.hero-actions a[href="#local"]',tr('Como chegar','Getting there'));
    set('a[href="#cronograma"]',tr('Programação','Schedule'));
    set('.summary-item:nth-child(1) dt',tr('Quando','When')); set('.summary-item:nth-child(2) dt',tr('Onde','Where'));
    set('#cronograma .eyebrow',tr('O dia da celebração','The celebration'));
    set('#detalhes .eyebrow',tr('Para aproveitar sem preocupação','Enjoy every moment'));
    set('#local .eyebrow',tr('Como chegar','Getting there')); set('#faqSection .eyebrow',tr('Bom saber','Good to know'));
    set('label[for="guestName"]',tr('Seu nome completo','Your full name')); set('label[for="guestPhone"]',tr('Seu telefone','Your phone'));
    set('label[for="phoneCountry"]',tr('País do telefone','Phone country'));
    set('#publicRsvp legend',tr('Você vai comparecer?','Will you attend?'));
    set('label[for="yes"]',tr('Vou comparecer','I will attend')); set('label[for="no"]',tr('Não poderei ir','I cannot attend'));
    set('label[for="guestCount"]',tr('Acompanhantes','Companions')); set('#publicRsvp button',tr('Confirmar resposta','Send RSVP'));
    set('[data-brand-made]',tr('Feito com','Made with'));
    set('[data-brand-by]',tr('pela','by'));
    set('[data-brand-invitation]',tr('Gostou deste convite? Crie o seu com a Planne também.','Love this invitation? Create your own with Planne.'));
    set('[data-brand-cta]',tr('Criar meu convite','Create my invitation'));
    set('[data-brand-terms]',tr('Termos de Uso','Terms of Use'));
    set('[data-brand-privacy]',tr('Política de Privacidade','Privacy Policy'));
    document.querySelectorAll('[data-planne-home]').forEach(link => { link.href = en ? '/' : '/pt-br/'; });
    document.querySelector('.brand-heart')?.setAttribute('aria-label',tr('amor','love'));
    document.querySelector('.footer-legal')?.setAttribute('aria-label',tr('Informações legais','Legal information'));
    set('.skip-link',tr('Ir para o conteúdo','Skip to content'));
    document.querySelector('.site-nav').setAttribute('aria-label',tr('Navegação do evento','Event navigation'));
    byId('venueMap').title = tr('Mapa do local do evento','Event location map');
    document.querySelector('.hero-photo img').alt = tr('Foto de capa do evento','Event cover photo');
  }
  function render(event, options = {}) {
    const preview = !!options.preview, en = event.language === 'en';
    const tr = (pt, english) => en ? english : pt;
    root.lang = en ? 'en' : 'pt-BR';
    applyAppearance(event); translate(en);
    const title = event.eventTitle || tr('Seu evento','Your event');
    document.title = title + ' | Planne'; byId('event-title').textContent = title;
    const names = title.split(/\s+(?:&|e|and)\s+/i).filter(Boolean);
    byId('eventMonogram').textContent = (event.rsvpSignature || '').trim() || (names.length > 1 ? names.slice(0,2).map(name => name.trim()[0].toUpperCase()).join(' & ') : title.trim().slice(0,1).toUpperCase());
    const date = event.eventDate ? new Date(event.eventDate) : null;
    const dateText = date && !Number.isNaN(date.valueOf()) ? new Intl.DateTimeFormat(en ? 'en-US' : 'pt-BR',{dateStyle:'long',timeStyle:'short'}).format(date) : tr('Data a definir','Date to be announced');
    byId('eventDate').textContent = dateText; byId('summaryDate').textContent = dateText;
    const location = (event.rsvpLocationInfo || '').trim();
    byId('eventLocation').textContent = location; byId('summaryLocation').textContent = location || tr('Local a definir','Location to be announced');
    byId('organizerMessage').textContent = event.rsvpOrganizerMessage || ''; byId('organizerMessage').hidden = !event.rsvpOrganizerMessage;
    setCover(event.rsvpCoverImageUrl || '');
    const timeline = document.querySelector('#cronograma .timeline'); timeline.replaceChildren();
    list(event.schedule).slice(0,20).forEach(item => {
      if (!item.time && !item.title && !item.description) return;
      const article = node('article','','timeline-item'), copy = node('div','');
      copy.append(node('h3',item.title || item.time),node('p',item.description));
      article.append(node('time',item.time,'timeline-time'),copy); timeline.append(article);
    });
    sectionNodes.schedule.hidden = !timeline.children.length;
    const details = document.querySelector('#detalhes .details-grid'); details.replaceChildren();
    const info = [...(event.rsvpDressCode ? [{title:'Dress code',description:event.rsvpDressCode}] : []), ...list(event.infoItems).slice(0,20)];
    info.forEach(item => { if (!item.title && !item.description) return; const article = node('article','','detail'); article.append(node('h3',item.title),node('p',item.description)); details.append(article); });
    sectionNodes.info.hidden = !details.children.length;
    const faq = byId('faqList'); faq.replaceChildren();
    const questions = [...(event.rsvpFaq ? [{question:tr('Informações adicionais','Additional information'),answer:event.rsvpFaq}] : []),...list(event.faqItems).slice(0,20)];
    questions.forEach(item => { if (!item.question && !item.answer) return; const d = node('details',''), answer = node('div','','faq-answer'); answer.append(node('p',item.answer)); d.append(node('summary',item.question),answer); if (preview) d.open = true; faq.append(d); });
    sectionNodes.faq.hidden = !faq.children.length;
    byId('venueAddress').textContent = location;
    sectionNodes.location.hidden = !location;
    byId('mapLink').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(location);
    if (options.loadMap !== false && lastMap !== location) {
      lastMap = location; clearTimeout(mapTimer);
      const updateMap = () => { const frame = byId('venueMap'); if (location) frame.src = 'https://www.google.com/maps?q=' + encodeURIComponent(location) + '&output=embed'; else frame.removeAttribute('src'); };
      if (preview) mapTimer = setTimeout(updateMap, 700); else updateMap();
    }
    sectionNodes.hero.hidden = false; sectionNodes.summary.hidden = false; sectionNodes.rsvp.hidden = false;
    const hidden = new Set(list(event.rsvpHiddenBlocks));
    for (const [id,element] of Object.entries(sectionNodes)) if (id !== 'hero' && id !== 'rsvp' && hidden.has(id)) element.hidden = true;
    const order = [...new Set([...list(event.rsvpBlockOrder).filter(id => sectionNodes[id]),...defaultOrder])];
    const main = byId('conteudo');
    // Não mover iframes estáveis: só reorganiza quando a ordem mudou.
    if (main.dataset.sectionOrder !== order.join(',')) { order.forEach(id => main.append(sectionNodes[id])); main.dataset.sectionOrder = order.join(','); }
    document.querySelectorAll('.site-nav a, .hero-actions a').forEach(link => { const target = document.querySelector(link.getAttribute('href')); link.hidden = !target || target.hidden; });
    const enabled = event.rsvpEnabled === true;
    byId('summaryRsvp').textContent = enabled ? tr('Confirme sua presença','RSVP') : tr('Confirmação indisponível','RSVP unavailable');
    byId('rsvpIntroText').textContent = !enabled ? tr('A confirmação está pausada neste momento.','RSVP is paused at the moment.') : event.rsvpRequireApproval && event.rsvpMode !== 'privado' ? tr('Sua resposta será enviada para aprovação.','Your response will be sent for approval.') : tr('Responda por aqui. Se não puder vir, avise também.','Reply here. If you cannot attend, please let us know too.');
    const reveal = ['envelope','fade','none'].includes(event.rsvpRevealStyle) ? event.rsvpRevealStyle : 'none';
    if (options.animateEntrance !== false && lastReveal !== reveal) {
      lastReveal = reveal;
      playEntrance(reveal, event);
    }
    if (!options.keepLoading) byId('inviteStatus').hidden = true;
    if (preview) {
      document.body.classList.remove('invite-loading');
      document.querySelectorAll('[data-loading-inert]').forEach(element => { element.inert = false; element.removeAttribute('data-loading-inert'); });
    }
    return {enabled,en};
  }
  window.PlanneInvite = {render, applyAppearance, setCover, playEntrance};
})();
