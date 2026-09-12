const runtimeScript = document.currentScript;
window.__RSVP_ENDPOINT = runtimeScript?.dataset.endpoint || '';
window.__rsvpToken = new URLSearchParams(window.location.search).get('token');
window.__getAppCheckToken = async () => null;

    const root = document.documentElement;
    const hero = document.querySelector('.hero');
    const coverFrame = document.querySelector('.hero-photo');
    const coverPhoto = coverFrame.querySelector('img');
    function setCover(url) {
      const hasCover = typeof url === 'string' && url.trim().length > 0;
      hero.classList.toggle('no-cover', !hasCover);
      coverFrame.hidden = !hasCover;
      if (hasCover) coverPhoto.src = url;
    }
    // O endpoint final chama setCover(event.rsvpCoverImageUrl). A URL abaixo
    // permite revisar esse estado sem foto com ?semFoto=1.
    if (new URLSearchParams(window.location.search).has('semFoto')) {
      setCover('');
    } else {
      coverPhoto.addEventListener('error', () => setCover(''));
    }
    window.setDemoCover = setCover;
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
    function applyAppearance(event) {
      root.dataset.inviteStyle = ['foto-editorial', 'ilustrado', 'gravado'].includes(event.rsvpTemplateId) ? event.rsvpTemplateId : 'foto-editorial';
      const palette = PALETTES[event.rsvpPaletteId];
      if (palette) {
        root.style.setProperty('--accent', palette.accent);
        root.style.setProperty('--accent-dark', palette.dark);
        root.style.setProperty('--accent-soft', palette.soft);
        root.style.setProperty('--paper', palette.paper);
        root.style.setProperty('--surface', palette.paper);
      } else if (/^#[0-9a-f]{6}$/i.test(event.rsvpAccentColor || '')) {
        root.style.setProperty('--accent', event.rsvpAccentColor);
        root.style.setProperty('--accent-dark', `color-mix(in oklch, ${event.rsvpAccentColor} 68%, black)`);
        root.style.setProperty('--accent-soft', `color-mix(in oklch, ${event.rsvpAccentColor} 14%, white)`);
      }
      const pair = FONT_PAIRS[event.rsvpFontPairId];
      if (!pair) return;
      root.style.setProperty('--display', pair.display);
      root.style.setProperty('--body', pair.body);
      const font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href = `https://fonts.googleapis.com/css2?family=${pair.query}&display=swap`;
      document.head.appendChild(font);
    }
    async function callRsvpApi(payload) {
      const token = await window.__getAppCheckToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['X-Firebase-AppCheck'] = token;
      const response = await fetch(window.__RSVP_ENDPOINT, { method: 'POST', headers, body: JSON.stringify({ publicToken: window.__rsvpToken, ...payload }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) throw new Error(data.error || 'request_failed');
      return data;
    }
    function renderEvent(event) {
      document.documentElement.lang = event.language === 'en' ? 'en' : 'pt-BR';
      document.title = `${event.eventTitle || 'Convite'} | Planne`;
      document.getElementById('event-title').textContent = event.eventTitle || 'Seu evento';
      document.getElementById('eventMonogram').textContent = (event.eventTitle || 'P').trim().slice(0, 1).toUpperCase();
      const date = event.eventDate ? new Date(event.eventDate) : null;
      const dateText = date && !Number.isNaN(date) ? new Intl.DateTimeFormat(event.language === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(date) : 'Data a definir';
      document.getElementById('eventDate').textContent = dateText;
      document.getElementById('summaryDate').textContent = dateText;
      const location = (event.rsvpLocationInfo || '').trim();
      document.getElementById('eventLocation').textContent = location;
      document.getElementById('summaryLocation').textContent = location || 'Local a definir';
      if (event.rsvpOrganizerMessage) {
        const message = document.getElementById('organizerMessage');
        message.textContent = event.rsvpOrganizerMessage;
        message.hidden = false;
      }
      setCover(event.rsvpCoverImageUrl || '');
      if (event.rsvpDressCode) {
        document.getElementById('dressCode').textContent = event.rsvpDressCode;
        document.getElementById('detalhes').hidden = false;
      }
      if (location) {
        document.getElementById('venueAddress').textContent = location;
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        document.getElementById('mapLink').href = mapUrl;
        document.getElementById('venueMap').src = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
        document.getElementById('local').hidden = false;
      }
      if (event.rsvpFaq) {
        const details = document.createElement('details');
        details.innerHTML = '<summary>Informações adicionais</summary><div class="faq-answer"><p></p></div>';
        details.querySelector('p').textContent = event.rsvpFaq;
        document.getElementById('faqList').appendChild(details);
        document.getElementById('faqSection').hidden = false;
      }
      const schedule = Array.isArray(event.schedule) ? event.schedule : [];
      if (schedule.length) {
        const timeline = document.querySelector('#cronograma .timeline');
        timeline.replaceChildren();
        schedule.forEach(item => {
          if (!item.time && !item.title && !item.description) return;
          const article = document.createElement('article');
          article.className = 'timeline-item';
          const time = document.createElement('time'); time.className = 'timeline-time'; time.textContent = item.time || '';
          const copy = document.createElement('div');
          const title = document.createElement('h3'); title.textContent = item.title || item.time || '';
          const description = document.createElement('p'); description.textContent = item.description || '';
          copy.append(title, description); article.append(time, copy); timeline.appendChild(article);
        });
        document.getElementById('cronograma').hidden = false;
      }
      const faqItems = Array.isArray(event.faqItems) ? event.faqItems : [];
      if (faqItems.length) {
        faqItems.forEach(item => {
          if (!item.question && !item.answer) return;
          const details = document.createElement('details');
          const summary = document.createElement('summary'); summary.textContent = item.question || 'Mais informações';
          const answer = document.createElement('div'); answer.className = 'faq-answer';
          const paragraph = document.createElement('p'); paragraph.textContent = item.answer || '';
          answer.appendChild(paragraph); details.append(summary, answer);
          document.getElementById('faqList').appendChild(details);
        });
        document.getElementById('faqSection').hidden = false;
      }
      const infoItems = Array.isArray(event.infoItems) ? event.infoItems : [];
      if (infoItems.length) {
        const grid = document.querySelector('#detalhes .details-grid'); grid.replaceChildren();
        infoItems.forEach(item => {
          if (!item.title && !item.description) return;
          const article = document.createElement('article'); article.className = 'detail';
          const title = document.createElement('h3'); title.textContent = item.title || 'Detalhe do evento';
          const description = document.createElement('p'); description.textContent = item.description || '';
          article.append(title, description); grid.appendChild(article);
        });
        document.getElementById('detalhes').hidden = false;
      }
      document.getElementById('summaryRsvp').textContent = event.rsvpEnabled ? 'Confirme sua presença' : 'Confirmação indisponível';
      const enabled = event.rsvpEnabled === true;
      document.querySelectorAll('#rsvp input, #rsvp select, #rsvp button').forEach(control => control.disabled = !enabled);
      document.getElementById('rsvpIntroText').textContent = enabled ? 'Responda por aqui. Se não puder vir, avise também.' : 'A confirmação de presença não está disponível neste momento.';
      configureRsvpForm(event, enabled);
    }

    function companionOptions(max) {
      return Array.from({ length: Math.max(0, max) + 1 }, (_, value) => `<option value="${value}">${value === 0 ? 'Somente eu' : `${value} acompanhante${value > 1 ? 's' : ''}`}</option>`).join('');
    }
    function configureRsvpForm(event, enabled) {
      const max = Number.isInteger(event.rsvpMaxCompanions) ? Math.max(0, event.rsvpMaxCompanions) : 2;
      if (event.rsvpMode !== 'privado') {
        document.getElementById('guestCount').innerHTML = companionOptions(max);
        if (!event.rsvpAllowCompanions) document.getElementById('companionsField').hidden = true;
        return;
      }
      document.getElementById('publicRsvp').hidden = true;
      const form = document.createElement('form');
      form.className = 'rsvp-form';
      form.id = 'privateRsvp';
      form.noValidate = true;
      form.innerHTML = `
        <div class="field"><label for="privateName">Seu nome completo</label><input id="privateName" autocomplete="name" maxlength="120" required></div>
        <div class="field"><label for="privateLast4">Últimos 4 números do seu telefone</label><input id="privateLast4" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required></div>
        <fieldset><legend>Você vai comparecer?</legend><div class="attendance-options"><input id="privateYes" type="radio" name="privateAttendance" value="yes"><label for="privateYes">Vou comparecer</label><input id="privateNo" type="radio" name="privateAttendance" value="no"><label for="privateNo">Não poderei ir</label></div></fieldset>
        ${event.rsvpAllowCompanions ? `<div class="field"><label for="privateGuests">Acompanhantes</label><select id="privateGuests">${companionOptions(max)}</select></div>` : ''}
        <button class="button" type="submit">Confirmar resposta</button><p class="form-message" role="status" tabindex="-1"></p>`;
      document.querySelector('.rsvp-wrap').appendChild(form);
      if (!enabled) form.querySelectorAll('input, select, button').forEach(control => control.disabled = true);
      form.addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();
        const name = form.querySelector('#privateName').value.trim();
        const last4 = form.querySelector('#privateLast4').value.replace(/\D/g, '');
        const attendance = form.querySelector('[name="privateAttendance"]:checked')?.value;
        const message = form.querySelector('.form-message');
        if (!name || last4.length !== 4 || !attendance) { message.textContent = 'Preencha seu nome, os 4 números do telefone e a sua resposta.'; message.classList.add('show'); return; }
        const button = form.querySelector('button'); button.disabled = true;
        try {
          const lookup = await callRsvpApi({ action: 'lookup', name });
          if (!lookup.found) throw new Error('not_found');
          await callRsvpApi({ action: 'verifyAndSubmitPrivate', name, phoneLast4: last4, confirmationStatus: attendance === 'yes' ? 1 : 0, menu: 1, companions: Number(form.querySelector('#privateGuests')?.value || 0), companionNames: [], companionTypes: [] });
          message.textContent = attendance === 'yes' ? `Tudo certo, ${name}. Sua presença foi confirmada.` : `Obrigado por avisar, ${name}. Sua resposta foi registrada.`;
          message.style.borderColor = 'var(--success)';
        } catch (_) {
          message.textContent = 'Não encontramos esses dados. Confira o nome e os últimos 4 números do telefone.';
          message.style.borderColor = 'var(--danger)';
        } finally { button.disabled = false; message.classList.add('show'); message.focus(); }
      });
    }

    const demoForm = document.getElementById('publicRsvp');
    const nameInput = document.getElementById('guestName');
    const radios = [...demoForm.querySelectorAll('[name="attendance"]')];
    radios.forEach(radio => radio.setAttribute('aria-describedby', 'attendanceError'));
    function clearFeedback() {
      document.getElementById('formMessage').classList.remove('show');
    }
    nameInput.addEventListener('input', () => {
      clearFeedback();
      if (nameInput.value.trim()) {
        nameInput.removeAttribute('aria-invalid');
        document.getElementById('nameError').hidden = true;
      }
    });
    radios.forEach(radio => radio.addEventListener('change', () => {
      clearFeedback();
      const attending = demoForm.elements.attendance.value === 'yes';
      document.getElementById('companionsField').hidden = !attending;
      demoForm.elements.guests.disabled = !attending;
      if (!attending) demoForm.elements.guests.value = '0';
      document.getElementById('attendanceError').hidden = true;
      radios.forEach(input => input.removeAttribute('aria-invalid'));
    }));
    const floatingLink = document.querySelector('.mobile-rsvp');
    if ('IntersectionObserver' in window) {
      let heroVisible = true, formVisible = false;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target.classList.contains('hero')) heroVisible = entry.isIntersecting;
          else formVisible = entry.isIntersecting;
        });
        floatingLink.hidden = heroVisible || formVisible;
      });
      observer.observe(document.querySelector('.hero'));
      observer.observe(document.getElementById('rsvp'));
    }

    document.getElementById('publicRsvp').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const name = form.elements.name.value.trim();
      const attendance = form.elements.attendance.value;
      const message = document.getElementById('formMessage');
      document.getElementById('nameError').hidden = Boolean(name);
      document.getElementById('attendanceError').hidden = Boolean(attendance);
      nameInput.setAttribute('aria-invalid', String(!name));
      radios.forEach(input => input.setAttribute('aria-invalid', String(!attendance)));
      if (!name || !attendance) {
        message.classList.remove('show');
        (name ? radios[0] : nameInput).focus();
        return;
      }
      const phone = document.getElementById('guestPhone').value.trim();
      if (!phone) { document.getElementById('guestPhone').focus(); return; }
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        await callRsvpApi({ action: 'submitPublic', name, phone, phoneCountry: 'BR', confirmationStatus: attendance === 'yes' ? 1 : 0, menu: 1, companions: Number(form.elements.guests.value || 0), companionNames: [], companionTypes: [] });
        message.textContent = attendance === 'yes' ? `Tudo certo, ${name}. Sua presença foi confirmada.` : `Obrigado por avisar, ${name}. Sua resposta foi registrada.`;
        message.style.borderColor = 'var(--success)';
      } catch (_) {
        message.textContent = 'Não foi possível registrar sua resposta agora. Tente novamente.';
        message.style.borderColor = 'var(--danger)';
      } finally {
        submit.disabled = false;
        message.classList.add('show');
        message.focus();
      }
    });
    (async () => {
      const status = document.getElementById('inviteStatus');
      if (!window.__rsvpToken) { status.textContent = 'Convite não encontrado'; return; }
      try {
        const event = await callRsvpApi({ action: 'resolveEvent' });
        if (!event.rsvpEnabled && !event.eventTitle) throw new Error('invalid_token');
        applyAppearance(event);
        renderEvent(event);
        status.hidden = true;
      } catch (_) {
        status.textContent = 'Este convite não está disponível.';
      }
    })();
