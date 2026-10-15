(() => {
  const mount = document.querySelector('[data-planne-builder-mount]');
  const frame = document.querySelector('[data-builder-preview]');
  if (!mount || !frame) return;
  const pt = mount.dataset.locale === 'pt';
  const t = (br, en) => pt ? br : en;
  const playUrl = 'https://play.google.com/store/apps/details?id=com.planne.planne';
  const palettes = [
    ['dourado', t('Dourado', 'Gold'), '#b08d3e'], ['grafite', t('Grafite', 'Graphite'), '#2b2f36'],
    ['framboesa', t('Framboesa', 'Raspberry'), '#e23d5b'], ['ameixa', t('Ameixa', 'Plum'), '#7a4b5e'],
    ['indigo', t('Índigo', 'Indigo'), '#2e3b52'], ['coral-tropical', t('Coral tropical', 'Tropical coral'), '#e8623a'],
  ];
  const styles = [['foto-editorial', 'Editorial'], ['ilustrado', t('Ilustrado', 'Illustrated')], ['gravado', t('Gravado', 'Engraved')]];
  const fonts = [['', t('Padrão do estilo', 'Style default')], ['script-dourado', t('Clássica', 'Classic')], ['suico', t('Moderna', 'Modern')], ['divertido', t('Divertida', 'Playful')], ['postal', t('Postal', 'Postcard')], ['literario', t('Literária', 'Literary')], ['tecnico', t('Técnica', 'Technical')]];
  const sections = [['summary', t('Resumo', 'Summary')], ['schedule', t('Programação', 'Schedule')], ['info', t('Orientações', 'Guidance')], ['location', t('Mapa', 'Map')], ['faq', t('Dúvidas', 'Questions')]];
  const tools = [['style', t('Estilos', 'Styles')], ['cover', t('Capa', 'Cover')], ['colors', t('Cores', 'Colors')], ['typography', t('Fontes', 'Fonts')], ['entrance', t('Entrada', 'Entrance')], ['texts', t('Textos', 'Words')], ['details', t('Detalhes', 'Details')], ['sections', t('Seções', 'Sections')]];
  const iconPaths = {
    style: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    cover: '<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m3 17 6-5 4 3 3-2 5 4"/>',
    colors: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="17" cy="10" r="1"/><path d="M12 21c1.6-1.5 1-3.5 3-4.4"/>',
    typography: '<path d="M3 6V4h18v2M12 4v16m-4 0h8"/>',
    entrance: '<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2ZM4 18l.6 1.4L6 20l-1.4.6L4 22l-.6-1.4L2 20l1.4-.6L4 18Z"/>',
    texts: '<path d="M4 5h16M4 10h16M4 15h13M4 20h9"/>',
    details: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    sections: '<rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="5" rx="1"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
  const state = {
    eventTitle: t('30 anos da Marina', "Ethan's 30th"), eventDate: '2026-11-21T18:00',
    rsvpEnabled: true, rsvpMode: 'publico', rsvpAllowCompanions: true, rsvpMaxCompanions: 1, rsvpAskMeals: false, rsvpRequireApproval: false, rsvpCustomLinkEnabled: false, rsvpCustomSlug: '', rsvpTemplateId: 'foto-editorial', rsvpPaletteId: 'coral-tropical',
    rsvpAccentColor: '', rsvpFontPairId: '', rsvpCoverImageUrl: '',
    rsvpLocationInfo: t('Museu do Amanhã, Praça Mauá, 1, Centro, Rio de Janeiro - RJ, 20081-240', 'Lady Bird Johnson Wildflower Center, 4801 La Crosse Avenue, Austin, TX 78739'),
    rsvpSignature: t('Marina', 'Ethan'), rsvpThankYouMessage: t('Obrigado por fazer parte deste momento.', 'Thank you for being part of this moment.'),
    rsvpOrganizerMessage: t('Esperamos você para celebrar este momento especial.', 'We hope you can join us for this special celebration.'),
    rsvpDressCode: t('Esporte fino', 'Dressy casual'), rsvpFaq: '',
    schedule: [{time: t('18h00', '6:00 PM'), title: t('Recepção', 'Welcome'), description: ''}],
    infoItems: [], faqItems: [], rsvpHiddenBlocks: [],
    rsvpBlockOrder: ['hero', 'summary', 'schedule', 'info', 'location', 'faq', 'rsvp'], rsvpRevealStyle: 'none',
  };
  let stage = 'setup', tool = 'style', textTab = 'welcome', detailsTab = 'location';
  const body = mount.querySelector('.m-builder-slot-body');
  const disclaimer = body.querySelector('p')?.textContent || '';
  const field = (name, label, value, kind = 'text', extra = '') => `<label class="ib-field"><span>${label}</span>${kind === 'textarea' ? `<textarea name="${name}" rows="3" maxlength="500" ${extra}></textarea>` : `<input name="${name}" type="${kind}" ${kind === 'date' ? '' : 'maxlength="180"'} ${extra}>`}</label>`;
  const choices = (name, items, selected) => `<div class="ib-choices" role="group">${items.map(([value, label, color]) => `<button type="button" class="ib-choice${selected === value ? ' is-selected' : ''}" data-choice="${name}" data-value="${value}" aria-pressed="${selected === value}">${color ? `<i style="background:${color}" aria-hidden="true"></i>` : ''}${label}</button>`).join('')}</div>`;
  const styleChoices = () => `<div class="ib-style-choices" role="group" aria-label="${t('Estilos de convite', 'Invitation styles')}">${styles.map(([value, label], index) => `<button type="button" class="ib-style-choice${state.rsvpTemplateId === value ? ' is-selected' : ''}" data-choice="rsvpTemplateId" data-value="${value}" aria-pressed="${state.rsvpTemplateId === value}"><span class="ib-style-preview"><iframe src="/rsvp-v2.html?landing-preview=birthday&amp;lang=${pt ? 'pt' : 'en'}&amp;style=${value}&amp;no-cover=1" loading="lazy" tabindex="-1" aria-hidden="true"></iframe></span><span class="ib-style-copy"><strong>${label}</strong><small>${[t('Composição e respiro', 'Space and composition'), t('Leveza em cada traço', 'Lightness in every line'), t('O cuidado da papelaria', 'The care of stationery')][index]}</small></span></button>`).join('')}</div>`;
  const subTabs = (group, items, selected) => `<div class="ib-subtabs" role="tablist">${items.map(([id,label]) => `<button type="button" role="tab" data-subtab="${group}" data-value="${id}" aria-selected="${selected === id}" class="${selected === id ? 'is-selected' : ''}">${label}</button>`).join('')}</div>`;
  const heading = (title, description) => `<div class="ib-heading"><h3>${title}</h3><p>${description}</p></div>`;
  const toggle = (name, title, description, premium = false) => `<label class="ib-toggle"><span><strong>${title}</strong><small>${description}</small>${premium ? '<em>✧ Premium</em>' : ''}</span><input type="checkbox" name="${name}" ${state[name] ? 'checked' : ''}></label>`;
  function setup() {
    return heading(t('Crie seu convite', 'Create your invitation'), t('Escolha o acesso e o RSVP.', 'Choose access and RSVP.')) +
      toggle('rsvpEnabled', t('Convite ativo', 'Invitation active'), t('Ative o link do convite.', 'Turn on the invitation link.')) +
      `<div class="ib-access"><strong>${t('Quem pode acessar?', 'Who can access it?')}</strong><div class="ib-access-choices"><button type="button" class="ib-access-choice${state.rsvpMode === 'publico' ? ' is-selected' : ''}" data-choice="rsvpMode" data-value="publico" aria-pressed="${state.rsvpMode === 'publico'}"><span class="ib-access-icon" aria-hidden="true">◎</span><strong>${t('Público', 'Public')}</strong><small>${t('Qualquer pessoa com o link pode confirmar.', 'Anyone with the link can RSVP.')}</small></button><button type="button" class="ib-access-choice${state.rsvpMode === 'privado' ? ' is-selected' : ''}" data-choice="rsvpMode" data-value="privado" aria-pressed="${state.rsvpMode === 'privado'}"><span class="ib-access-icon" aria-hidden="true">✉</span><strong>${t('Privado', 'Private')}</strong><small>${t('Apenas quem está na sua lista de convidados.', 'Only people on your guest list.')}</small><em>✧ Premium</em></button></div></div>` +
      toggle('rsvpAllowCompanions', t('Permitir acompanhantes', 'Allow companions'), t('Convidados podem incluir acompanhantes.', 'Guests can add companions.')) +
      (state.rsvpAllowCompanions ? `<div class="ib-counter"><span>${t('Máximo por confirmação', 'Maximum per response')}</span><div><button type="button" data-action="decrease-companions" aria-label="${t('Diminuir', 'Decrease')}" ${state.rsvpMaxCompanions <= 1 ? 'disabled' : ''}>−</button><output>${state.rsvpMaxCompanions}</output><button type="button" data-action="increase-companions" aria-label="${t('Aumentar', 'Increase')}" ${state.rsvpMaxCompanions >= 5 ? 'disabled' : ''}>+</button></div></div>` : '') +
      toggle('rsvpAskMeals', t('Refeição por pessoa', 'Meal choice per person'), t('Cada pessoa escolhe sua refeição.', 'Each person chooses a meal.')) +
      toggle('rsvpRequireApproval', t('Aprovar confirmações', 'Approve responses'), t('Revise respostas do convite público.', 'Review public invitation responses.'), true) +
      toggle('rsvpCustomLinkEnabled', t('Link personalizado', 'Custom link'), t('Crie um endereço curto para compartilhar o convite.', 'Create a short address to share your invitation.'), true) +
      (state.rsvpCustomLinkEnabled ? `<div class="ib-custom-link"><p>${t('Ativo enquanto seu Premium estiver vigente.', 'Active while your Premium plan is current.')}</p>${field('rsvpCustomSlug', 'planneapp.com/', state.rsvpCustomSlug)}</div>` : '') +
      `<p class="ib-help">${t('Teste as opções aqui. Para publicar, use o app.', 'Try options here. Publish in the app.')}</p>`;
  }
  function design() {
    const nav = `<div class="ib-tools" role="tablist" aria-label="${t('Ferramentas de design', 'Design tools')}">${tools.map(([id, label]) => `<button type="button" role="tab" aria-selected="${tool === id}" class="${tool === id ? 'is-selected' : ''}" data-tool="${id}">${icon(id)}<span>${label}</span></button>`).join('')}</div>`;
    let content = '';
    if (tool === 'style') content = heading(t('Escolha o primeiro olhar', 'Choose the first impression'), t('Os três estilos do app, renderizados na prévia real.', 'The three app styles, rendered in the real preview.')) + styleChoices();
    if (tool === 'cover') content = heading(t('Uma foto, uma lembrança', 'A photo, a memory'), t('Escolha uma imagem que conte um pouco desse momento.', 'Choose an image that tells a little of this moment.')) + `<label class="ib-cover-card"><span aria-hidden="true">▧</span><strong>${state.rsvpCoverImageUrl ? t('Trocar foto', 'Change photo') : t('Adicionar foto de capa', 'Add a cover photo')}</strong><small>${t('Um retrato da sua celebração', 'A portrait of your celebration')}</small><input type="file" name="cover" accept="image/jpeg,image/png,image/webp"></label>${state.rsvpCoverImageUrl ? `<button type="button" class="ib-text-button" data-action="remove-cover">${t('Remover', 'Remove')}</button>` : ''}<p class="ib-help" data-file-status>${t('A foto fica somente nesta demonstração.', 'The photo stays only in this demo.')}</p>`;
    if (tool === 'colors') content = heading(t('Cores que combinam', 'Colors that belong together'), t('Cada paleta cuida dos fundos, textos e detalhes.', 'Each palette brings together backgrounds, text and details.')) + `<p class="ib-tool-label">${t('Veja as cores no convite', 'See the colors on the invitation')}</p>` + `<button type="button" class="ib-reset" data-choice="rsvpPaletteId" data-value="">${t('Usar as cores do estilo', 'Use the style colors')}</button>` + `<div class="ib-palette-list">${palettes.map(([id,label,color]) => `<button type="button" class="ib-palette-choice${state.rsvpPaletteId === id ? ' is-selected' : ''}" data-choice="rsvpPaletteId" data-value="${id}" aria-pressed="${state.rsvpPaletteId === id}"><span class="ib-palette-swatch" style="--swatch:${color}" aria-hidden="true"></span><span>${label}</span>${state.rsvpPaletteId === id ? '<b aria-hidden="true">✓</b>' : ''}</button>`).join('')}</div>` + `<label class="ib-field ib-color"><span>${t('Cor personalizada', 'Custom color')}</span><input name="rsvpAccentColor" type="color" value="${state.rsvpAccentColor || '#13b8a7'}"></label>`;
    if (tool === 'typography') content = heading(t('O tom das suas palavras', 'The tone of your words'), t('Veja como cada letra muda o convite.', 'See how every letter changes the invitation.')) + `<div class="ib-font-list">${fonts.map(([id,label]) => `<button type="button" class="ib-font-choice${state.rsvpFontPairId === id ? ' is-selected' : ''}" data-choice="rsvpFontPairId" data-value="${id}" aria-pressed="${state.rsvpFontPairId === id}"><span class="ib-font-sample" data-font="${id || 'default'}">${t('Vamos celebrar', 'Let’s celebrate')}</span><strong>${label}</strong>${state.rsvpFontPairId === id ? '<b aria-hidden="true">✓</b>' : ''}</button>`).join('')}</div>`;
    if (tool === 'entrance') content = heading(t('O convite se revela', 'Your invitation unfolds'), t('Uma entrada sutil para esse primeiro encontro.', 'A subtle entrance for this first encounter.')) + `<p class="ib-help ib-center">${t('A prévia reproduz a entrada escolhida.', 'The preview plays the selected entrance.')}</p><button type="button" class="ib-reset" data-action="replay">${t('Repetir entrada', 'Replay entrance')}</button>` + choices('rsvpRevealStyle', [['envelope', 'Envelope'], ['fade', t('Suave', 'Soft fade')], ['none', t('Direto ao convite', 'Straight to the invitation')]], state.rsvpRevealStyle);
    if (tool === 'texts') content = heading(t('Palavras que acolhem', 'Words that welcome'), t('Escreva como você receberia seus convidados.', 'Write as you would welcome your guests.')) + subTabs('texts', [['welcome', t('Boas-vindas', 'Welcome')], ['thanks', t('Agradecimento', 'Thank you')], ['signature', t('Assinatura', 'Signature')]], textTab) + (textTab === 'welcome' ? field('rsvpOrganizerMessage', t('Mensagem de boas-vindas', 'Welcome message'), state.rsvpOrganizerMessage, 'textarea') : textTab === 'thanks' ? field('rsvpThankYouMessage', t('Depois da confirmação', 'After the RSVP'), state.rsvpThankYouMessage, 'textarea') : field('rsvpSignature', t('Assinatura no topo', 'Signature at the top'), state.rsvpSignature));
    if (tool === 'details') content = heading(t('Cuide de cada chegada', 'Care for every arrival'), t('O que seus convidados precisam para se planejar.', 'What your guests need to plan their day.')) + subTabs('details', [['location', t('Local', 'Location')], ['schedule', t('Programação', 'Schedule')], ['info', t('Orientações', 'Guidance')], ['faq', t('Dúvidas', 'Questions')]], detailsTab) + (detailsTab === 'location' ? field('rsvpLocationInfo', t('Local do evento', 'Event location'), state.rsvpLocationInfo) : detailsTab === 'schedule' ? field('scheduleTime', t('Horário', 'Time'), state.schedule[0].time) + field('scheduleTitle', t('O que acontece', 'What happens'), state.schedule[0].title) : detailsTab === 'info' ? field('rsvpDressCode', 'Dress code', state.rsvpDressCode) : field('rsvpFaq', t('Informação adicional', 'Additional information'), state.rsvpFaq, 'textarea'));
    if (tool === 'sections') content = heading(t('A ordem da sua história', 'Your story, in order'), t('Reorganize as seções. Blocos sem conteúdo não aparecem no convite.', 'Reorder the sections. Empty blocks stay out of the invitation.')) + `<button type="button" class="ib-reset" data-action="restore-order">${t('Restaurar ordem original', 'Restore original order')}</button><div class="ib-section-list">${state.rsvpBlockOrder.map((id,index) => { const labels = {hero:t('Capa','Cover'),summary:t('Data e local','Date and location'),schedule:t('Programação','Schedule'),info:t('Informações práticas','Useful details'),location:t('Mapa e endereço','Map and address'),faq:t('Dúvidas dos convidados','Guest questions'),rsvp:'RSVP'}; const required = id === 'hero' || id === 'rsvp'; return `<div class="ib-section-row" draggable="true" data-section-row="${id}"><span class="ib-drag" aria-hidden="true">☷</span><span>${labels[id]}</span>${required ? `<small>${t('Essencial','Essential')}</small>` : `<button type="button" data-action="toggle-section" data-value="${id}" aria-label="${state.rsvpHiddenBlocks.includes(id) ? t('Mostrar','Show') : t('Ocultar','Hide')} ${labels[id]}">${state.rsvpHiddenBlocks.includes(id) ? '◌' : '◉'}</button>`}<button type="button" data-action="move-up" data-value="${id}" aria-label="${t('Mover para cima','Move up')} ${labels[id]}" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-action="move-down" data-value="${id}" aria-label="${t('Mover para baixo','Move down')} ${labels[id]}" ${index === state.rsvpBlockOrder.length - 1 ? 'disabled' : ''}>↓</button></div>` }).join('')}</div>`;
    return heading(t('Personalização Premium', 'Premium design'), t('Teste as ferramentas na prévia.', 'Try the tools in the preview.')) + nav + `<div class="ib-tool-content" role="tabpanel">${content}</div>`;
  }
  function publish() {
    return heading(t('Seu convite está quase lá', 'Your invitation is almost ready'), t('Confira os detalhes e publique para compartilhar com seus convidados.', 'Review the details and publish to share with your guests.')) +
      `<div class="ib-publish"><strong>${t('Prévia do convite', 'Invitation preview')}</strong><p>${t('Confira os detalhes. Este exemplo não cria um link nem recebe confirmações.', 'Review the details. This example does not create a link or receive responses.')}</p><a class="m-button" href="${playUrl}" data-cta-location="invitation_builder">${t('Criar no app Android', 'Create in the Android app')} <span aria-hidden="true">↗</span></a></div>`;
  }
  function render() {
    const tabs = [['setup', t('Configuração', 'Setup'), t('Config.', 'Setup')], ['design', 'Design', 'Design'], ['publish', t('Publicar', 'Publish'), t('Publicar', 'Publish')]];
    body.innerHTML = `<p class="ib-disclaimer"></p><div class="ib-stages" role="tablist" aria-label="${t('Etapas do convite', 'Invitation stages')}">${tabs.map(([id, label, short], index) => `<button type="button" role="tab" data-stage="${id}" aria-label="${label}" aria-selected="${stage === id}" class="${stage === id ? 'is-selected' : ''}"><span class="ib-stage-label">${label}</span><span class="ib-stage-label-short" aria-hidden="true">${short}</span></button>`).join('')}</div>${stage === 'setup' ? setup() : stage === 'design' ? design() : publish()}${stage !== 'publish' ? `<button class="ib-next" type="button" data-action="next">${stage === 'setup' ? t('Personalizar convite', 'Design invitation') : t('Revisar convite', 'Review invitation')} <span aria-hidden="true">→</span></button>` : ''}`;
    body.querySelector('.ib-disclaimer').textContent = disclaimer;
    body.querySelectorAll('input:not([type=file]):not([type=checkbox]):not([type=color]),textarea').forEach(input => {
      const value = input.name === 'scheduleTime' ? state.schedule[0].time : input.name === 'scheduleTitle' ? state.schedule[0].title : state[input.name];
      input.value = value ?? '';
    });
  }
  function updatePreview(replay = false) {
    frame.contentWindow?.postMessage({type: 'planne-builder-preview', event: state, replay}, location.origin);
  }
  frame.addEventListener('load', () => updatePreview());
  mount.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    let focus = '';
    if (button.dataset.stage) stage = button.dataset.stage;
    else if (button.dataset.tool) tool = button.dataset.tool;
    else if (button.dataset.subtab) { if (button.dataset.subtab === 'texts') textTab = button.dataset.value; else detailsTab = button.dataset.value; }
    else if (button.dataset.choice) {
      state[button.dataset.choice] = button.dataset.value;
      if (button.dataset.choice === 'rsvpPaletteId') state.rsvpAccentColor = '';
    } else if (button.dataset.action === 'next') stage = stage === 'setup' ? 'design' : 'publish';
    else if (button.dataset.action === 'remove-cover') state.rsvpCoverImageUrl = '';
    else if (button.dataset.action === 'increase-companions' || button.dataset.action === 'decrease-companions') state.rsvpMaxCompanions = Math.max(1, Math.min(5, state.rsvpMaxCompanions + (button.dataset.action === 'increase-companions' ? 1 : -1)));
    else if (button.dataset.action === 'replay') { updatePreview(true); return; }
    else if (button.dataset.action === 'restore-order') state.rsvpBlockOrder = ['hero', 'summary', 'schedule', 'info', 'location', 'faq', 'rsvp'];
    else if (button.dataset.action === 'toggle-section') state.rsvpHiddenBlocks = state.rsvpHiddenBlocks.includes(button.dataset.value) ? state.rsvpHiddenBlocks.filter(id => id !== button.dataset.value) : [...state.rsvpHiddenBlocks, button.dataset.value];
    else if (['move-up','move-down'].includes(button.dataset.action)) { const from = state.rsvpBlockOrder.indexOf(button.dataset.value), to = from + (button.dataset.action === 'move-up' ? -1 : 1); if(to >= 0 && to < state.rsvpBlockOrder.length) [state.rsvpBlockOrder[from],state.rsvpBlockOrder[to]] = [state.rsvpBlockOrder[to],state.rsvpBlockOrder[from]]; }
    else return;
    if (button.dataset.stage) focus = `[data-stage="${stage}"]`;
    else if (button.dataset.tool) focus = `[data-tool="${tool}"]`;
    else if (button.dataset.subtab) focus = `[data-subtab="${button.dataset.subtab}"][data-value="${button.dataset.value}"]`;
    else if (button.dataset.choice) focus = `[data-choice="${button.dataset.choice}"][data-value="${button.dataset.value}"]`;
    else if (button.dataset.action === 'next') focus = `[data-stage="${stage}"]`;
    else if (button.dataset.action === 'remove-cover') focus = '[data-action="remove-cover"]';
    render(); updatePreview();
    if (focus) body.querySelector(focus)?.focus({preventScroll: true});
  });
  mount.addEventListener('keydown', event => {
    const current = event.target.closest('[role="tab"]');
    if (!current || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...current.parentElement.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(current);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault(); tabs[next].click();
  });
  mount.addEventListener('input', event => {
    const input = event.target;
    if (input.type === 'file') return;
    if (input.dataset.section) {
      state.rsvpHiddenBlocks = sections.map(([id]) => id).filter(id => !body.querySelector(`[data-section="${id}"]`).checked);
    } else if (input.name === 'scheduleTime') state.schedule[0].time = input.value;
    else if (input.name === 'scheduleTitle') state.schedule[0].title = input.value;
    else if (['rsvpEnabled', 'rsvpAllowCompanions', 'rsvpAskMeals', 'rsvpRequireApproval', 'rsvpCustomLinkEnabled'].includes(input.name)) { state[input.name] = input.checked; if (['rsvpAllowCompanions', 'rsvpCustomLinkEnabled'].includes(input.name)) { const active = input.name; render(); body.querySelector(`[name="${active}"]`)?.focus({preventScroll:true}); } }
    else if (input.name === 'rsvpAccentColor') { state.rsvpAccentColor = input.value; state.rsvpPaletteId = ''; }
    else if (Object.hasOwn(state, input.name)) state[input.name] = input.value;
    updatePreview();
  });
  mount.addEventListener('change', event => {
    const input = event.target;
    if (input.name !== 'cover' || !input.files?.[0]) return;
    const file = input.files[0], status = body.querySelector('[data-file-status]');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3_000_000) {
      status.textContent = t('Use JPG, PNG ou WebP de até 3 MB.', 'Use a JPG, PNG or WebP image up to 3 MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => { state.rsvpCoverImageUrl = reader.result; status.textContent = file.name; updatePreview(); };
    reader.readAsDataURL(file);
  });
  let draggedSection = '';
  mount.addEventListener('dragstart', event => {
    const row = event.target.closest('[data-section-row]');
    if (!row) return;
    draggedSection = row.dataset.sectionRow;
    row.classList.add('is-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedSection);
  });
  mount.addEventListener('dragover', event => {
    const row = event.target.closest('[data-section-row]');
    if (!row || !draggedSection || row.dataset.sectionRow === draggedSection) return;
    event.preventDefault();
    body.querySelectorAll('.is-drop-target').forEach(item => item.classList.remove('is-drop-target'));
    row.classList.add('is-drop-target');
  });
  mount.addEventListener('drop', event => {
    const row = event.target.closest('[data-section-row]');
    if (!row || !draggedSection) return;
    event.preventDefault();
    const from = state.rsvpBlockOrder.indexOf(draggedSection);
    const to = state.rsvpBlockOrder.indexOf(row.dataset.sectionRow);
    if (from !== -1 && to !== -1) {
      state.rsvpBlockOrder.splice(to, 0, state.rsvpBlockOrder.splice(from, 1)[0]);
      render(); updatePreview();
    }
    draggedSection = '';
  });
  mount.addEventListener('dragend', () => {
    draggedSection = '';
    body.querySelectorAll('.is-dragging,.is-drop-target').forEach(item => item.classList.remove('is-dragging','is-drop-target'));
  });
  render();
})();
