/* Marketing-only progressive enhancement. Does not touch shared preferences or event data. */
(() => {
  const root = document.querySelector('.planne-institutional');
  if (!root) return;
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
  root.querySelectorAll('[data-cta-location]').forEach(link => {
    link.addEventListener('click', () => {
      const location = link.dataset.ctaLocation;
      const language = document.documentElement.lang;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'google_play_click', cta_location: location, page_language: language});
      window.dispatchEvent(new CustomEvent('planne:conversion', {detail: {location, language}}));
    });
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
