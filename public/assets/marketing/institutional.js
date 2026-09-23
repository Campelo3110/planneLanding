/* Marketing-only progressive enhancement. Does not touch shared preferences or event data. */
(() => {
  const root = document.querySelector('.planne-institutional');
  if (!root) return;
  const preferenceKey = 'planne-site-theme';
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const portuguese = document.documentElement.lang.startsWith('pt');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(preferenceKey); } catch (_) {}
  const applyTheme = dark => {
    root.classList.toggle('m-dark', dark);
    root.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  };
  applyTheme(savedTheme ? savedTheme === 'dark' : systemDark.matches);
  const headerNavigation = root.querySelector('.m-header nav');
  if (headerNavigation) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'm-theme-toggle';
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path data-theme-icon></path></svg><span data-theme-label></span>';
    const label = toggle.querySelector('[data-theme-label]');
    const icon = toggle.querySelector('[data-theme-icon]');
    const updateToggle = () => {
      const dark = root.classList.contains('m-dark');
      const text = portuguese ? (dark ? 'Usar modo claro' : 'Usar modo escuro') : (dark ? 'Use light mode' : 'Use dark mode');
      label.textContent = text;
      toggle.setAttribute('aria-label', text);
      toggle.setAttribute('aria-pressed', String(dark));
      icon.setAttribute('d', dark ? 'M12 3v2m0 14v2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M3 12h2m14 0h2M5.64 18.36l1.42-1.42m9.88-9.88 1.42-1.42M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' : 'M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z');
    };
    updateToggle();
    toggle.addEventListener('click', () => {
      const dark = !root.classList.contains('m-dark');
      applyTheme(dark);
      try { localStorage.setItem(preferenceKey, dark ? 'dark' : 'light'); } catch (_) {}
      updateToggle();
    });
    headerNavigation.querySelector('.m-language')?.before(toggle);
    systemDark.addEventListener('change', event => {
      if (savedTheme) return;
      applyTheme(event.matches);
      updateToggle();
    });
  }
  const menu = root.querySelector('.m-menu');
  const navigation = root.querySelector('#navigation');
  const mobile = matchMedia('(max-width: 760px)');
  function closeMenu(returnFocus = false) {
    navigation.removeAttribute('data-open');
    menu.setAttribute('aria-expanded', 'false');
    if (returnFocus) menu.focus();
  }
  if (menu && navigation) {
    root.classList.add('m-enhanced');
    const syncMenu = () => { menu.hidden = !mobile.matches; closeMenu(); };
    syncMenu();
    mobile.addEventListener('change', syncMenu);
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      navigation.toggleAttribute('data-open', open);
    });
    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.m-header')) closeMenu();
    });
  }
  // Retain the existing conversion event contract without loading the shared script.
  // The Play Install Referrer identifies the public page and CTA without adding a
  // third-party analytics script or changing the native application.
  root.querySelectorAll('[data-cta-location]').forEach(link => {
    const playUrl = new URL(link.href);
    if (playUrl.hostname === 'play.google.com') {
      const location = link.dataset.ctaLocation || 'unlabeled';
      const campaign = `utm_source=planneapp&utm_medium=organic&utm_campaign=${encodeURIComponent(location)}&utm_content=${encodeURIComponent(location)}&utm_term=${encodeURIComponent(document.documentElement.lang)}`;
      playUrl.searchParams.set('referrer', campaign);
      link.href = playUrl.href;
    }
    link.addEventListener('click', () => {
      const location = link.dataset.ctaLocation;
      const language = document.documentElement.lang;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'google_play_click', cta_location: location, page_language: language});
      window.dispatchEvent(new CustomEvent('planne:conversion', {detail: {location, language}}));
    });
  });
})();

/* On phones, invitation previews stay swipeable while discreet controls make the
   next card discoverable without exposing a browser scrollbar. */
(() => {
  const root = document.querySelector('.planne-institutional');
  if (!root) return;
  const mobile = matchMedia('(max-width: 760px)');
  const portuguese = document.documentElement.lang.startsWith('pt');
  root.querySelectorAll('.m-invite-shots').forEach(shots => {
    const cards = [...shots.querySelectorAll(':scope > figure')];
    if (cards.length < 2) return;
    const controls = document.createElement('div');
    controls.className = 'm-invite-controls';
    controls.setAttribute('aria-label', portuguese ? 'Navegação entre estilos de convite' : 'Invitation style navigation');
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.innerHTML = `<span aria-hidden="true">←</span>${portuguese ? 'Anterior' : 'Previous'}`;
    const position = document.createElement('output');
    position.className = 'm-invite-position';
    position.setAttribute('aria-live', 'polite');
    const next = document.createElement('button');
    next.type = 'button';
    next.innerHTML = `${portuguese ? 'Próximo' : 'Next'}<span aria-hidden="true">→</span>`;
    controls.append(previous, position, next);
    shots.after(controls);
    let active = 0;
    const update = () => {
      if (!mobile.matches) return;
      const midpoint = shots.scrollLeft + shots.clientWidth / 2;
      active = cards.reduce((closest, card, index) => Math.abs(card.offsetLeft + card.offsetWidth / 2 - midpoint) < Math.abs(cards[closest].offsetLeft + cards[closest].offsetWidth / 2 - midpoint) ? index : closest, active);
      position.value = `${active + 1} / ${cards.length}`;
      position.textContent = `${active + 1} / ${cards.length}`;
      previous.disabled = active === 0;
      next.disabled = active === cards.length - 1;
    };
    const go = index => cards[Math.max(0, Math.min(cards.length - 1, index))].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
    previous.addEventListener('click', () => go(active - 1));
    next.addEventListener('click', () => go(active + 1));
    shots.addEventListener('scroll', () => requestAnimationFrame(update), {passive: true});
    mobile.addEventListener('change', update);
    update();
  });
})();

/* Existing celebration films: optional motion, explicit pause, poster fallback. */
(() => {
  const root = document.querySelector('.planne-institutional');
  const video = root?.querySelector('.m-film');
  const button = root?.querySelector('.m-film-control');
  if (!video || !button) return;
  const pt = document.documentElement.lang.startsWith('pt');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let inView = true, wanted = false;
  const label = button.querySelector('[data-film-label]');
  function update() {
    const playing = !video.paused && !video.ended;
    label.textContent = playing ? (pt ? 'Pausar vídeo' : 'Pause video') : (pt ? 'Reproduzir vídeo' : 'Play video');
    button.firstElementChild.textContent = playing ? 'Ⅱ' : '▷';
    button.setAttribute('aria-label', label.textContent);
  }
  async function play() {
    if (!video.src) { video.src = video.dataset.videoSrc; video.load(); }
    try { await video.play(); } catch (_) { wanted = false; update(); }
  }
  button.hidden = false;
  update();
  button.addEventListener('click', () => {
    wanted = video.paused;
    if (wanted) play(); else video.pause();
  });
  video.addEventListener('playing', () => { video.classList.add('is-playing'); update(); });
  video.addEventListener('pause', update);
  video.addEventListener('error', () => { video.classList.remove('is-playing'); wanted = false; update(); });
  reduced.addEventListener('change', event => { if (event.matches) { wanted = false; video.pause(); } });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause(); else if (wanted && inView) play();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) video.pause(); else if (wanted && !document.hidden) play();
    }, {threshold:.1}).observe(video.parentElement);
  }
  const start = () => {
    const saveData = connection && (connection.saveData || /(^|-)2g$|3g/.test(connection.effectiveType || ''));
    if (reduced.matches || saveData || !matchMedia('(min-width: 768px)').matches || !inView || document.hidden) return;
    wanted = true; play();
  };
  if (document.readyState === 'complete') setTimeout(start, 900);
  else window.addEventListener('load', () => setTimeout(start, 900), {once:true});
})();
