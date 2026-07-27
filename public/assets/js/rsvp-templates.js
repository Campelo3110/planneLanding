// rsvp.html — sistema de templates visuais (rsvpTemplateId) + reveal
// animation (rsvpRevealStyle). Ver /assets/css/rsvp-templates.css pra
// paleta/tipografia/motivo-assinatura de cada um dos 6 templates.
//
// `showState`/`window.__rsvpToken` são globais definidos no <script>
// inline de rsvp.html — seguro referenciar aqui porque só são chamados
// dentro de `autoOpenReveal()`/`openReveal()`, disparados depois de
// DOMContentLoaded, quando ambos os scripts já terminaram de rodar.
(() => {
  // Cada família tem um papel de "objeto físico" (papelaria gravada,
  // placa de galeria, ticket de parquinho, selo de correio aéreo,
  // etiqueta de sementes, crachá de conferência) — nada de fonte-reflexo
  // repetida entre templates (ver nota da skill de design sobre
  // monocultura tipográfica).
  const TEMPLATE_FONTS = {
    elegante: ["Bonheur+Royale", "Italiana", "Jost:wght@400;500;600"],
    minimalista: ["Familjen+Grotesk:wght@500;600", "Archivo:wght@400;500;600"],
    infantil: ["Fredoka:wght@500;600;700", "Quicksand:wght@500;600;700", "Shantell+Sans:wght@600"],
    tropical: ["Unbounded:wght@500;600;700", "Karla:wght@400;500;600"],
    rustico: ["Vollkorn:ital,wght@0,500;1,500;0,600", "Caveat:wght@600", "Nunito+Sans:wght@400;500;600"],
    corporate: ["Martian+Mono:wght@400;500;600", "Work+Sans:wght@400;500;600"],
  };
  const loadedFonts = new Set();

  function loadTemplateFont(templateId) {
    const families = TEMPLATE_FONTS[templateId];
    if (!families || loadedFonts.has(templateId)) return;
    loadedFonts.add(templateId);
    const href = 'https://fonts.googleapis.com/css2?' +
      families.map((f) => `family=${f}`).join('&') + '&display=swap';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // Ícone do selo no envelope de abertura (só decorativo — a tela de
  // sucesso continua com check/x/relógio funcionais e NÃO varia por
  // template, pra nunca confundir "confirmei ou não" com estilo visual).
  const SEAL_ICONS = {
    elegante: '<path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.7C12 6.2 13.5 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z"/>',
    minimalista: '<circle cx="12" cy="12" r="3.2"/>',
    infantil: '<ellipse cx="12" cy="9.5" rx="5.5" ry="6.5"/><path d="M12 16v5M10.3 21h3.4"/>',
    tropical: '<path d="M4 20c8-1 14-7 15-15C11 6 5 12 4 20z"/><path d="M6.5 17.5c3-3.5 6.5-7.5 10-10.5"/>',
    rustico: '<circle cx="12" cy="12" r="1.6"/><path d="M12 5.3c1.6 0 2.7 1.5 2.7 3S13.6 11 12 11s-2.7-.9-2.7-2.7 1.1-3 2.7-3zM12 18.7c1.6 0 2.7-1.5 2.7-3S13.6 13 12 13s-2.7.9-2.7 2.7 1.1 3 2.7 3zM4.7 12c0-1.6 1.5-2.7 3-2.7S10.7 10.9 10.7 12s-.9 2.7-2.7 2.7S4.7 13.6 4.7 12zM19.3 12c0-1.6-1.5-2.7-3-2.7S13.3 10.9 13.3 12s.9 2.7 3 2.7 3-1.1 3-2.7z"/>',
    corporate: '<path d="M5 13l4 4L19 7"/>',
  };

  function applyInviteTemplate(templateId) {
    const id = SEAL_ICONS[templateId] ? templateId : 'elegante';
    document.documentElement.dataset.inviteTemplate = id;
    loadTemplateFont(id);

    // corporate troca o texto da tag decorativa ("RSVP" → "CONFIRMAÇÃO") —
    // único template sem selo/tab lúdico, mantém o tom formal também no texto.
    const tab = document.querySelector('.rsvp-tab');
    if (tab) tab.textContent = id === 'corporate' ? 'CONFIRMAÇÃO' : 'RSVP';

    const sealIcon = document.querySelector('.reveal-envelope-seal svg');
    if (sealIcon) sealIcon.innerHTML = SEAL_ICONS[id];
  }

  function applyRevealStyle(style) {
    const id = ['envelope', 'dobradura', 'confete'].includes(style) ? style : 'envelope';
    document.documentElement.dataset.revealStyle = id;
  }

  // ═══════════════════════════════════════════════════════
  //  CATÁLOGO CURADO — paletas e pares de fonte que o
  //  construtor de convite (app) deixa o organizador escolher
  //  livremente, independente de qual dos 6 templates acima foi
  //  o ponto de partida. Curado de propósito (não um color-picker
  //  arbitrário): cada entrada é literalmente a paleta/par já
  //  validado de um dos 6 templates, então qualquer combinação
  //  template-estrutura × paleta/fonte continua com contraste e
  //  bom gosto garantidos — só a identidade de cor/tipo muda,
  //  não a geometria/motivo do template escolhido.
  const PALETTES = {
    dourado: {
      light: { teal: '#b08d3e', tealDark: '#16213e', shadowTint: '#16213e', mist: '#f6efdd', paper: '#fbf7ee', onTeal: '#16213e' },
      dark:  { teal: '#d9bd74', tealDark: '#e7ecf7', shadowTint: '#16213e', mist: '#241f14', paper: '#14100c', onTeal: '#16213e' },
    },
    grafite: {
      light: { teal: '#2b2f36', tealDark: '#0a0a0a', shadowTint: '#0a0a0a', mist: '#f2f3f5', paper: '#ffffff', onTeal: '#ffffff' },
      dark:  { teal: '#d4d8de', tealDark: '#f4f5f7', shadowTint: '#0a0a0a', mist: '#17181a', paper: '#0a0a0a', onTeal: '#0a0a0a' },
    },
    framboesa: {
      light: { teal: '#e23d5b', tealDark: '#7c1d3e', shadowTint: '#7c1d3e', mist: '#fff6da', paper: '#fffdf6', onTeal: '#ffffff' },
      dark:  { teal: '#fb7185', tealDark: '#ffe4e8', shadowTint: '#7c1d3e', mist: '#3f1725', paper: '#22101a', onTeal: '#3f1725' },
    },
    'coral-tropical': {
      light: { teal: '#e8623a', tealDark: '#7a2e17', shadowTint: '#7a2e17', mist: '#e4f5ee', paper: '#fbf3e7', onTeal: '#fbf3e7' },
      dark:  { teal: '#2dd4bf', tealDark: '#d1fdf6', shadowTint: '#7a2e17', mist: '#122420', paper: '#121b18', onTeal: '#0d211d' },
    },
    ameixa: {
      light: { teal: '#7a4b5e', tealDark: '#40273c', shadowTint: '#40273c', mist: '#eef0e4', paper: '#f7f3e9', onTeal: '#ffffff' },
      dark:  { teal: '#c98aa3', tealDark: '#f3dbe6', shadowTint: '#40273c', mist: '#1b1f16', paper: '#1c1720', onTeal: '#40273c' },
    },
    indigo: {
      light: { teal: '#2e3b52', tealDark: '#131a26', shadowTint: '#131a26', mist: '#eef1f5', paper: '#ffffff', onTeal: '#ffffff' },
      dark:  { teal: '#7fa8d9', tealDark: '#dce8fb', shadowTint: '#131a26', mist: '#111c2e', paper: '#0a0e16', onTeal: '#0a0e16' },
    },
  };

  const FONT_PAIRS = {
    'script-dourado': {
      display: '"Bonheur Royale", cursive', body: '"Jost", "Planne Inter", sans-serif',
      families: ['Bonheur+Royale', 'Jost:wght@400;500;600'],
    },
    suico: {
      display: '"Familjen Grotesk", "Planne Inter", sans-serif', body: '"Archivo", "Planne Inter", sans-serif',
      families: ['Familjen+Grotesk:wght@500;600', 'Archivo:wght@400;500;600'],
    },
    divertido: {
      display: '"Fredoka", "Planne Inter", sans-serif', body: '"Quicksand", "Planne Inter", sans-serif',
      families: ['Fredoka:wght@500;600;700', 'Quicksand:wght@500;600;700'],
    },
    postal: {
      display: '"Unbounded", "Planne Inter", sans-serif', body: '"Karla", "Planne Inter", sans-serif',
      families: ['Unbounded:wght@500;600;700', 'Karla:wght@400;500;600'],
    },
    literario: {
      display: '"Vollkorn", Georgia, serif', body: '"Nunito Sans", "Planne Inter", sans-serif',
      families: ['Vollkorn:ital,wght@0,500;1,500;0,600', 'Nunito+Sans:wght@400;500;600'],
    },
    tecnico: {
      display: '"Martian Mono", ui-monospace, monospace', body: '"Work Sans", "Planne Inter", sans-serif',
      families: ['Martian+Mono:wght@400;500;600', 'Work+Sans:wght@400;500;600'],
    },
  };

  const PALETTE_PROPS = ['teal', 'tealDark', 'shadowTint', 'mist', 'paper', 'onTeal'];
  const CSS_VAR_NAME = {
    teal: '--teal', tealDark: '--teal-dark', shadowTint: '--shadow-tint',
    mist: '--mist', paper: '--paper', onTeal: '--on-teal',
  };

  let currentPaletteId = null;

  function applyPaletteForCurrentTheme() {
    if (!currentPaletteId) return;
    const isDark = document.documentElement.dataset.theme === 'dark';
    const vals = PALETTES[currentPaletteId][isDark ? 'dark' : 'light'];
    PALETTE_PROPS.forEach((p) => document.documentElement.style.setProperty(CSS_VAR_NAME[p], vals[p]));
  }

  // Chamado pelo construtor (app) quando o organizador escolhe uma
  // paleta curada independente do template-base. `paletteId` nulo/
  // desconhecido remove o override e volta pra paleta nativa do
  // template. Reaplica automaticamente se o visitante trocar de tema
  // (ver reapplyForThemeChange, chamado por toggleTheme() em rsvp.html).
  function applyPaletteOverride(paletteId) {
    currentPaletteId = PALETTES[paletteId] ? paletteId : null;
    if (!currentPaletteId) {
      PALETTE_PROPS.forEach((p) => document.documentElement.style.removeProperty(CSS_VAR_NAME[p]));
      return;
    }
    applyPaletteForCurrentTheme();
  }

  // Chamado pelo construtor quando o organizador escolhe um par de
  // fonte curado independente do template-base. Mesma regra: nulo/
  // desconhecido remove o override e volta pro par nativo do template.
  function applyFontPairOverride(fontPairId) {
    const pair = FONT_PAIRS[fontPairId];
    if (!pair) {
      document.documentElement.style.removeProperty('--display-font');
      document.documentElement.style.removeProperty('--body-font');
      return;
    }
    const key = 'pair:' + fontPairId;
    if (!loadedFonts.has(key)) {
      loadedFonts.add(key);
      const href = 'https://fonts.googleapis.com/css2?' +
        pair.families.map((f) => `family=${f}`).join('&') + '&display=swap';
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = href;
      document.head.appendChild(link);
    }
    document.documentElement.style.setProperty('--display-font', pair.display);
    document.documentElement.style.setProperty('--body-font', pair.body);
  }

  // rsvp.html:toggleTheme() chama isso depois de trocar data-theme,
  // pra um override de paleta ativo (que tem valores claro/escuro
  // próprios) trocar de variante junto com o tema. Fonte não precisa
  // (não varia por tema).
  function reapplyForThemeChange() {
    applyPaletteForCurrentTheme();
  }

  // ═══════════════════════════════════════════════════════
  //  BLOCOS OPCIONAIS — visibilidade + ordem
  // ═══════════════════════════════════════════════════════
  // Cada bloco opcional do cartão (countdown, dress code, local, FAQ...)
  // tem um wrapper com [data-block-id] em rsvp.html. `hiddenIds` é a
  // lista de blocos que o organizador desligou (rsvpHiddenBlocks);
  // `orderIds` é a ordem desejada (rsvpBlockOrder) — os blocos não
  // citados mantêm a ordem nativa do documento, no final. Isso só
  // reordena visualmente (CSS `order`, container já é flex/grid),
  // nunca move nós no DOM.
  function applyBlockConfig(hiddenIds, orderIds) {
    const blocks = [...document.querySelectorAll('[data-block-id]')];
    const hidden = new Set(Array.isArray(hiddenIds) ? hiddenIds : []);
    // Só esconde (nunca reexibe) — a visibilidade base de cada bloco já
    // foi decidida por conteúdo (ex.: renderEventExtras só mostra
    // dressCode/local/FAQ se o organizador preencheu). O construtor só
    // pode restringir ainda mais, nunca forçar algo vazio a aparecer.
    blocks.forEach((el) => {
      if (hidden.has(el.dataset.blockId)) el.hidden = true;
    });
    // Se todos os sub-itens de "detalhes do evento" acabaram ocultos
    // (por conteúdo vazio ou pelo construtor), some com a seção inteira
    // em vez de deixar um accordion vazio.
    const eventDetails = document.getElementById('eventDetails');
    if (eventDetails && !eventDetails.hidden) {
      const anyVisible = [...eventDetails.querySelectorAll('[data-block-id]')].some((el) => !el.hidden);
      if (!anyVisible) eventDetails.hidden = true;
    }
    const order = Array.isArray(orderIds) ? orderIds : [];
    if (!order.length) return;
    blocks.forEach((el) => {
      const idx = order.indexOf(el.dataset.blockId);
      el.style.order = idx === -1 ? String(order.length + 1) : String(idx);
    });
  }

  let pendingTarget = null;
  let autoOpenTimer = null;

  function setPendingRevealTarget(target) {
    pendingTarget = target;
  }

  function openReveal() {
    if (!pendingTarget) return;
    if (autoOpenTimer) { clearTimeout(autoOpenTimer); autoOpenTimer = null; }
    const target = pendingTarget;
    pendingTarget = null;

    const btn = document.getElementById('revealBtn');
    if (btn) btn.disabled = true;
    if (window.__rsvpToken) {
      try { sessionStorage.setItem(`planne-invite-opened-${window.__rsvpToken}`, '1'); } catch (_) {}
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showState(target);
      return;
    }
    document.getElementById('revealVisual').classList.add('opening');
    setTimeout(() => showState(target), 700);
  }

  // O reveal é o primeiro momento do convite, não um portão — abre
  // sozinho assim que a página carrega. `delayMs` dá um instante pro
  // olho registrar o envelope/selo fechado antes da abertura (sem essa
  // pausa a animação parece um glitch, não uma cerimônia). O botão
  // (`revealBtn`) continua existindo como atalho pra "pular", pra quem
  // já viu a animação antes ou prefere ir direto ao formulário.
  function autoOpenReveal(delayMs) {
    const wait = matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : (delayMs ?? 900);
    autoOpenTimer = setTimeout(openReveal, wait);
  }

  window.rsvpTemplates = {
    applyInviteTemplate,
    applyRevealStyle,
    openReveal,
    autoOpenReveal,
    setPendingRevealTarget,
    applyPaletteOverride,
    applyFontPairOverride,
    reapplyForThemeChange,
    applyBlockConfig,
    PALETTES,
    FONT_PAIRS,
  };
})();
