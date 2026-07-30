(() => {
  const root = document.documentElement;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('has-motion');
  const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101715' : '#f8fafc');
    document.querySelectorAll('[data-theme-image]').forEach((image) => {
      const source = theme === 'dark' ? image.dataset.darkSrc : image.dataset.lightSrc;
      if (source && image.getAttribute('src') !== source) image.setAttribute('src', source);
    });
  };

  applyTheme(storage.get('planne-theme') || (themeMedia.matches ? 'dark' : 'light'));
  const followSystemTheme = (event) => {
    if (!storage.get('planne-theme')) applyTheme(event.matches ? 'dark' : 'light');
  };
  if (themeMedia.addEventListener) themeMedia.addEventListener('change', followSystemTheme);
  else if (themeMedia.addListener) themeMedia.addListener(followSystemTheme);

  document.addEventListener('DOMContentLoaded', () => {
    window.lucide?.createIcons();
    const isPortuguese = root.lang.toLowerCase().startsWith('pt');
    const toggle = document.querySelector('.theme-toggle');
    applyTheme(root.dataset.theme);
    const updateToggle = () => {
      const dark = root.dataset.theme === 'dark';
      const label = dark ? (isPortuguese ? 'Usar tema claro' : 'Use light theme') : (isPortuguese ? 'Usar tema escuro' : 'Use dark theme');
      toggle?.setAttribute('aria-label', label);
      toggle?.setAttribute('title', label);
      if (toggle) toggle.innerHTML = dark
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';
    };

    toggle?.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      storage.set('planne-theme', nextTheme);
      applyTheme(nextTheme);
      updateToggle();
    });
    document.querySelectorAll('[data-language]').forEach((link) => link.addEventListener('click', () => storage.set('planne-language', link.dataset.language)));
    document.querySelectorAll('[data-cta-location]').forEach((link) => link.addEventListener('click', () => {
      const location = link.dataset.ctaLocation;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'google_play_click', cta_location: location, page_language: root.lang });
      window.dispatchEvent(new CustomEvent('planne:conversion', { detail: { location, language: root.lang } }));
    }));
    const menu = document.querySelector('.menu-button');
    const links = document.querySelector('.nav-links');
    menu?.addEventListener('click', () => { const open = links.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
    document.querySelectorAll('.faq-question').forEach((button) => button.addEventListener('click', () => button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true'))));
    const revealItems = document.querySelectorAll('.problem-intro, .problem-item, .problem-bridge, .section-heading, .chapter, .process-intro, .step, .privacy-copy, .privacy-item, .benefit-item, .event-showcase-card, .event-showcase-soon, .faq-grid, .final-cta');
    revealItems.forEach((item) => item.classList.add('motion-reveal'));
    if ('IntersectionObserver' in window && root.classList.contains('has-motion')) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      revealItems.forEach((item) => revealObserver.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    // Event-cover background video: markup only ever carries data-src on the
    // <source> tags, so nothing is fetched until we decide it's worth it —
    // skips entirely on reduced motion, narrow viewports (mobile bandwidth
    // is exactly what this is guarding against) and slow/save-data
    // connections, and even then waits until after load so it never
    // competes with the page's own critical assets.
    document.querySelectorAll('.event-cover-video').forEach((video) => {
      const activate = () => {
        if (!root.classList.contains('has-motion')) return;
        if (!window.matchMedia('(min-width: 700px)').matches) return;
        const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
        if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
        video.querySelectorAll('source[data-src]').forEach((source) => { source.src = source.dataset.src; });
        video.load();
        video.play().catch(() => {});
      };
      const schedule = () => {
        if ('requestIdleCallback' in window) requestIdleCallback(activate, { timeout: 2500 });
        else setTimeout(activate, 800);
      };
      if (document.readyState === 'complete') schedule();
      else window.addEventListener('load', schedule, { once: true });
      document.addEventListener('visibilitychange', () => {
        if (!video.currentSrc) return;
        if (document.hidden) video.pause();
        else video.play().catch(() => {});
      });
    });

    updateToggle();
  });
})();
