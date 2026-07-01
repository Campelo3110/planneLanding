(() => {
  const root = document.documentElement;
  const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101715' : '#f8fafc');
  };

  applyTheme(localStorage.getItem('planne-theme') || (themeMedia.matches ? 'dark' : 'light'));
  themeMedia.addEventListener('change', (event) => {
    if (!localStorage.getItem('planne-theme')) applyTheme(event.matches ? 'dark' : 'light');
  });

  document.addEventListener('DOMContentLoaded', () => {
    const isPortuguese = root.lang.toLowerCase().startsWith('pt');
    const toggle = document.querySelector('.theme-toggle');
    const updateToggle = () => {
      const dark = root.dataset.theme === 'dark';
      const label = dark ? (isPortuguese ? 'Usar tema claro' : 'Use light theme') : (isPortuguese ? 'Usar tema escuro' : 'Use dark theme');
      toggle?.setAttribute('aria-label', label);
      toggle?.setAttribute('title', label);
      if (toggle) toggle.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}"></i>`;
      if (window.lucide) lucide.createIcons();
    };

    toggle?.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('planne-theme', nextTheme);
      applyTheme(nextTheme);
      updateToggle();
    });
    document.querySelectorAll('[data-language]').forEach((link) => link.addEventListener('click', () => localStorage.setItem('planne-language', link.dataset.language)));
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
    updateToggle();
  });
})();
