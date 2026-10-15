/* Marketing-only progressive enhancement. Does not touch shared preferences or event data. */
(() => {
  const root = document.querySelector('.planne-institutional');
  if (!root) return;
  const currentLanguage = document.documentElement.lang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  let savedLanguage = null;
  try { savedLanguage = localStorage.getItem('planne-language'); } catch (_) {}
  const browserLanguage = (navigator.languages?.[0] || navigator.language || '').toLowerCase();
  const preferredLanguage = savedLanguage
    ? (savedLanguage.toLowerCase().startsWith('pt') ? 'pt' : 'en')
    : (browserLanguage.startsWith('pt') ? 'pt' : 'en');
  if (preferredLanguage !== currentLanguage) {
    const alternate = document.querySelector(`link[rel="alternate"][hreflang="${preferredLanguage === 'pt' ? 'pt-BR' : 'en-US'}"]`);
    if (alternate) {
      const alternateUrl = new URL(alternate.href, location.href);
      const destination = new URL(alternateUrl.pathname, location.origin);
      destination.search = location.search;
      destination.hash = location.hash;
      location.replace(destination.href);
      return;
    }
  }
  const preferenceKey = 'planne-site-theme';
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const portuguese = document.documentElement.lang.startsWith('pt');
  root.querySelectorAll('.m-language').forEach(link => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('planne-language', link.lang.toLowerCase().startsWith('pt') ? 'pt' : 'en'); } catch (_) {}
    });
  });
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
  const mobile = matchMedia('(max-width: 980px)');
  const scrim = document.createElement('button');
  scrim.className = 'm-menu-scrim';
  scrim.type = 'button';
  scrim.tabIndex = -1;
  scrim.setAttribute('aria-label', portuguese ? 'Fechar navegação' : 'Close navigation');
  let menuReturnFocus = null;
  function closeMenu(returnFocus = false) {
    if (!menu || !navigation) return;
    const focusWasInside = navigation.contains(document.activeElement);
    navigation.removeAttribute('data-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', portuguese ? 'Abrir menu' : 'Open menu');
    menu.firstChild.textContent = 'Menu ';
    root.classList.remove('m-menu-open');
    scrim.classList.remove('is-visible');
    navigation.setAttribute('aria-hidden', mobile.matches ? 'true' : 'false');
    if (returnFocus || focusWasInside) (menuReturnFocus || menu).focus();
  }
  if (menu && navigation) {
    root.classList.add('m-enhanced');
    root.append(scrim);
    scrim.addEventListener('click', () => closeMenu(true));
    menu.querySelector('span').textContent = '';
    const primary = document.createElement('div');
    primary.className = 'm-nav-links';
    [...navigation.querySelectorAll(':scope > a:not(.m-language)')].forEach(link => primary.append(link));
    navigation.prepend(primary);
    const tools = document.createElement('div');
    tools.className = 'm-nav-tools';
    [navigation.querySelector('.m-theme-toggle'), navigation.querySelector('.m-language')].forEach(item => {
      if (item) tools.append(item);
    });
    navigation.append(tools);
    const kicker = document.createElement('p');
    kicker.className = 'm-menu-kicker';
    kicker.textContent = portuguese ? 'Explore a Planne' : 'Explore Planne';
    navigation.prepend(kicker);
    const originalOccasions = [...root.querySelectorAll('.m-event-top-inner a')];
    const occasionLinks = originalOccasions.length ? originalOccasions : [
      ['wedding', 'casamento', portuguese ? 'Casamentos' : 'Weddings'],
      ['birthday', 'aniversario', portuguese ? 'Aniversários' : 'Birthdays'],
      ['baby-shower', 'cha-de-bebe', portuguese ? 'Chás de bebê' : 'Baby showers'],
      ['quinceanera', 'debutante', portuguese ? '15 anos' : 'Quinceañeras'],
      ['graduation', 'formatura', portuguese ? 'Formaturas' : 'Graduations']
    ].map(([en, pt, label]) => {
      const link = document.createElement('a');
      link.href = portuguese ? `/pt-br/${pt}` : `/${en}`;
      link.textContent = label;
      return link;
    });
    const occasions = document.createElement('div');
    occasions.className = 'm-menu-occasions';
    const caption = document.createElement('p');
    caption.textContent = portuguese ? 'Escolha a celebração' : 'Choose the celebration';
    occasions.append(caption);
    const occasionGrid = document.createElement('div');
    originalOccasions.length
      ? originalOccasions.forEach(link => occasionGrid.append(link.cloneNode(true)))
      : occasionLinks.forEach(link => occasionGrid.append(link));
    occasions.append(occasionGrid);
    navigation.append(occasions);
    const heroAction = root.querySelector('main .m-hero-actions .m-button:not(.m-button-secondary)');
    if (heroAction) {
      const cta = document.createElement('a');
      cta.className = 'm-nav-cta';
      cta.href = heroAction.href;
      cta.dataset.ctaLocation = 'navigation';
      cta.innerHTML = `<span>${portuguese ? 'Comece grátis' : 'Start free'}</span><span aria-hidden="true">↗</span>`;
      navigation.append(cta);
    }
    const syncMenu = () => { menu.hidden = !mobile.matches; closeMenu(); };
    syncMenu();
    mobile.addEventListener('change', syncMenu);
    menu.addEventListener('click', event => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      if (open) menuReturnFocus = document.activeElement;
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? (portuguese ? 'Fechar menu' : 'Close menu') : (portuguese ? 'Abrir menu' : 'Open menu'));
      menu.firstChild.textContent = open ? (portuguese ? 'Fechar ' : 'Close ') : 'Menu ';
      navigation.toggleAttribute('data-open', open);
      navigation.setAttribute('aria-hidden', String(!open));
      root.classList.toggle('m-menu-open', open);
      scrim.classList.toggle('is-visible', open);
      if (open && event.detail === 0) primary.querySelector('a')?.focus();
      else menu.focus();
    });
    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    root.addEventListener('keydown', event => {
      if (menu.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') { closeMenu(true); return; }
      if (event.key !== 'Tab') return;
      const focusable = [menu, ...navigation.querySelectorAll('a, button')].filter(item => item.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
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

/* The occasion rail makes room while reading and returns on upward scroll. */
(() => {
  const root = document.querySelector('.planne-institutional');
  const rail = root?.querySelector('.m-event-top');
  if (!rail) return;
  let lastY = Math.max(0, scrollY);
  let travel = 0;
  let queued = false;
  const update = () => {
    queued = false;
    const y = Math.max(0, scrollY);
    const delta = y - lastY;
    if (delta * travel < 0) travel = 0;
    travel += delta;
    if (y < 100 || travel < -16) {
      root.classList.remove('m-eventbar-hidden');
      travel = 0;
    } else if (travel > 16 && !root.classList.contains('m-menu-open')) {
      root.classList.add('m-eventbar-hidden');
      travel = 0;
    }
    lastY = y;
  };
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, {passive:true});
  root.querySelector('.m-menu')?.addEventListener('click', () => root.classList.remove('m-eventbar-hidden'));
  update();
})();

/* Shared navigation feedback across the public marketing pages. */
(() => {
  const root = document.querySelector('.planne-institutional');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const heroAction = root.querySelector('main .m-hero-actions .m-button:not(.m-button-secondary)');
  const finalSection = root.querySelector('.m-close');
  if (heroAction && finalSection) {
    const floating = document.createElement('a');
    floating.className = 'm-floating-cta';
    floating.href = heroAction.href;
    floating.dataset.ctaLocation = 'floating';
    floating.innerHTML = `<span>${document.documentElement.lang.startsWith('pt') ? 'Comece grátis no Android' : 'Start free on Android'}</span><span aria-hidden="true">↗</span>`;
    const playUrl = new URL(floating.href);
    if (playUrl.hostname === 'play.google.com') {
      const campaign = `utm_source=planneapp&utm_medium=organic&utm_campaign=floating&utm_content=floating&utm_term=${encodeURIComponent(document.documentElement.lang)}`;
      playUrl.searchParams.set('referrer', campaign);
      floating.href = playUrl.href;
    }
    floating.addEventListener('click', () => {
      const language = document.documentElement.lang;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'google_play_click', cta_location: 'floating', page_language: language});
      window.dispatchEvent(new CustomEvent('planne:conversion', {detail: {location: 'floating', language}}));
    });
    root.append(floating);
    const builder = root.querySelector('.m-topic-builder');
    const sync = () => {
      const heroAbove = heroAction.getBoundingClientRect().bottom < 0;
      const finalVisible = finalSection.getBoundingClientRect().top < innerHeight;
      const builderBounds = builder?.getBoundingClientRect();
      const builderVisible = builderBounds && builderBounds.top < innerHeight && builderBounds.bottom > 0;
      floating.classList.toggle('is-visible', heroAbove && !finalVisible && !builderVisible && !root.classList.contains('m-menu-open'));
    };
    addEventListener('scroll', sync, {passive: true});
    addEventListener('resize', sync, {passive: true});
    root.querySelector('.m-menu')?.addEventListener('click', () => requestAnimationFrame(sync));
    sync();
  }

  if (root.classList.contains('m-home') || !('IntersectionObserver' in window)) return;
  const selector = [
    'main > section:not(:first-child) h2', '.m-topic-examples nav a', '.m-faq details',
    '.m-topic-faq details', '.m-occasions nav a'
  ].join(',');
  const items = [...new Set(root.querySelectorAll(selector))];
  if (!items.length) return;
  let observer;
  const clear = () => {
    observer?.disconnect();
    observer = undefined;
    root.classList.remove('m-story-ready');
    items.forEach(item => item.classList.remove('m-story-reveal', 'is-visible'));
  };
  const start = () => {
    if (reduced.matches || observer) return;
    const fold = innerHeight * .9;
    items.forEach(item => {
      item.classList.add('m-story-reveal');
      item.style.setProperty('--m-story-delay', `${Math.min([...item.parentElement.children].indexOf(item), 3) * 75}ms`);
      if (item.getBoundingClientRect().top < fold) item.classList.add('is-visible');
    });
    root.classList.add('m-story-ready');
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {rootMargin: '0px 0px -8% 0px', threshold: .06});
    items.filter(item => !item.classList.contains('is-visible')).forEach(item => observer.observe(item));
  };
  reduced.addEventListener('change', () => reduced.matches ? clear() : start());
  start();
})();

/* The browser loads previews lazily; show each card as soon as its iframe is ready. */
(() => {
  document.querySelectorAll('.m-invite-frame iframe').forEach(frame => {
    const ready = () => frame.closest('.m-invite-frame')?.classList.add('is-loaded');
    frame.addEventListener('load', ready, {once: true});
    if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument?.URL !== 'about:blank') ready();
  });
})();

/* Home page storytelling: reveal each group only when it reaches the viewport.
   Content remains visible without JavaScript, IntersectionObserver, or when the
   visitor prefers less motion. */
(() => {
  const home = document.querySelector('.planne-institutional.m-home');
  if (!home || !('IntersectionObserver' in window)) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;

  function stop() {
    observer?.disconnect();
    observer = undefined;
    home.classList.remove('m-motion-ready');
    home.querySelectorAll('.m-reveal').forEach(item => {
      item.classList.remove('m-reveal', 'is-visible');
      item.style.removeProperty('--m-reveal-delay');
    });
  }

  function start() {
    if (reducedMotion.matches || observer) return;
    const groups = [
      '.m-photo-heading', '.m-photo-links', '.m-app-shots',
      '.m-statement', '.m-invitation-copy', '.m-invitation-flow ol',
      '.m-feature-list', '.m-guide ol',
      '.m-premium', '.m-occasions nav', '.m-close .m-wrap'
    ];
    const items = groups.flatMap(selector => {
      return [...home.querySelectorAll(selector)].flatMap(group =>
        [...group.children]
          .filter(child => child.matches('div, p, h2, h3, figure, article, li, a'))
          .map((item, index) => ({item, index})));
    });
    if (!items.length) return;

    // Give the first visible content its final state before the enhancement
    // class is applied, so the page never flashes hidden during startup.
    const fold = innerHeight * 0.9;
    items.forEach(({item, index}) => {
      item.classList.add('m-reveal');
      item.style.setProperty('--m-reveal-delay', `${Math.min(index, 3) * 85}ms`);
      if (item.getBoundingClientRect().top < fold) item.classList.add('is-visible');
    });
    home.classList.add('m-motion-ready');
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
    items.map(({item}) => item).filter(item => !item.classList.contains('is-visible')).forEach(item => observer.observe(item));
  }

  reducedMotion.addEventListener('change', () => reducedMotion.matches ? stop() : start());
  start();
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
