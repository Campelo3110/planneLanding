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
    elegante: ["Italiana", "Jost:wght@400;500;600"],
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
  };
})();
