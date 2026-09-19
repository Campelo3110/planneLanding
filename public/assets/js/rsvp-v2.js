const runtimeScript = document.currentScript;
window.__RSVP_ENDPOINT = runtimeScript?.dataset.endpoint || '';
window.__rsvpToken = new URLSearchParams(window.location.search).get('token');
const pathSlug = decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g, '');
window.__rsvpSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathSlug) ? pathSlug : '';
window.__getAppCheckToken = async () => null;
let currentEvent = {};
const byId = id => document.getElementById(id);
const tr = (pt, en) => (currentEvent.language || (navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en')) === 'en' ? en : pt;
byId('inviteStatus').querySelector('.loading-copy').textContent = tr('Preparando seu convite','Preparing your invitation');
async function callRsvpApi(payload) {
  const token = await window.__getAppCheckToken();
  const headers = {'Content-Type':'application/json'};
  if (token) headers['X-Firebase-AppCheck'] = token;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(),20000);
  try {
  const response = await fetch(window.__RSVP_ENDPOINT,{method:'POST',headers,signal:controller.signal,body:JSON.stringify({publicToken:window.__rsvpToken,customSlug:window.__rsvpSlug,...payload})});
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error || (payload.action !== 'resolveEvent' && data.ok !== true)) throw new Error(data.error || 'request_failed');
    return data;
  } finally { clearTimeout(timeout); }
}
function companionOptions(max) {
  return Array.from({length:Math.max(0,Math.min(20,max || 0))+1},(_,value) => `<option value="${value}">${value === 0 ? tr('Somente eu','Just me') : value + ' ' + tr(value === 1 ? 'acompanhante' : 'acompanhantes',value === 1 ? 'companion' : 'companions')}</option>`).join('');
}
function feedback(form, text, success) {
  const message = form.querySelector('.form-message');
  message.textContent = text; message.style.borderColor = success ? 'var(--success)' : 'var(--danger)';
  message.classList.add('show'); message.focus();
}
function responseText(result, attending) {
  if (!attending) return tr('Obrigado por avisar. Sua resposta foi registrada.','Thank you for letting us know. Your response was recorded.');
  if (result.pendingApproval) return tr('Sua resposta foi enviada para aprovação.','Your response was sent for approval.');
  return currentEvent.rsvpThankYouMessage || tr('Tudo certo. Sua presença foi confirmada!','All set. Your attendance is confirmed!');
}
// Keep the legacy key so confirmations made before v2 remain recognized.
const completionKey = () => `planne_rsvp_${window.__rsvpSlug || window.__rsvpToken}`;
let submitting = false, completion = null;
function readCompletion() {
  try {
    const value = JSON.parse(localStorage.getItem(completionKey()));
    return value && typeof value.attending === 'boolean' ? value : null;
  } catch (_) { return null; }
}
function showCompletion(target, value, focus = false) {
  completion = value;
  target.querySelectorAll('input,select,button').forEach(control => control.disabled = true);
  target.classList.add('is-complete');
  let card = target.querySelector('.rsvp-completion');
  if (!card) {
    card = document.createElement('div'); card.className = 'rsvp-completion';
    card.setAttribute('role','status'); card.tabIndex = -1;
    target.append(card);
  }
  const heading = document.createElement('h3');
  heading.textContent = !value.attending ? tr('Resposta registrada','Response recorded') : value.pendingApproval
    ? tr('Resposta enviada','Response sent') : tr('Presença já confirmada','Attendance confirmed');
  const message = document.createElement('p');
  message.textContent = responseText(value,value.attending);
  const ornament = document.createElement('div'); ornament.className = 'completion-ornament';
  ornament.setAttribute('aria-hidden','true');
  ornament.innerHTML = '<svg viewBox="0 0 80 32"><use href="#ornament-divider"/></svg>';
  card.replaceChildren(ornament,heading,message);
  if (focus) card.focus();
  document.querySelector('.mobile-rsvp').hidden = true;
}
function renderCompanionNames(target, count) {
  let list = target.querySelector('.companion-names');
  if (!list) {
    list = document.createElement('div'); list.className = 'companion-names';
    target.querySelector('button[type="submit"]').before(list);
  }
  const names = [...list.querySelectorAll('input')].map(input => input.value);
  const types = [...list.querySelectorAll('select')].map(input => input.value);
  list.replaceChildren();
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div'); row.className = 'field';
    const label = document.createElement('label'), input = document.createElement('input');
    input.id = `${target.id}-companion-${i}`; input.maxLength = 120; input.required = true;
    input.autocomplete = 'off'; input.value = names[i] || '';
    label.htmlFor = input.id; label.textContent = tr('Nome do acompanhante','Companion name') + ' ' + (i + 1);
    const typeLabel = document.createElement('label'), type = document.createElement('select');
    type.id = input.id + '-type'; typeLabel.htmlFor = type.id; typeLabel.textContent = tr('Tipo de convidado','Guest type');
    [['companion',tr('Acompanhante','Companion')],['child',tr('Criança','Child')]].forEach(([value,text]) => type.add(new Option(text,value)));
    type.value = types[i] || 'companion';
    row.append(label,input,typeLabel,type); list.append(row);
  }
  list.hidden = count === 0;
}
function companionData(target) {
  const inputs = [...target.querySelectorAll('.companion-names input')];
  const missing = inputs.find(input => !input.value.trim());
  if (missing) {
    feedback(target,tr('Preencha o nome de cada acompanhante.','Enter each companion’s name.'),false);
    missing.focus(); return null;
  }
  return { companions: inputs.length, companionNames: inputs.map(input => input.value.trim()),
    companionTypes: [...target.querySelectorAll('.companion-names select')].map(input => input.value) };
}
async function sendResponse(target, payload) {
  if (submitting || completion) return;
  const cached = readCompletion();
  if (cached) { showCompletion(target,cached,true); return; }
  // Set before the first await, including App Check and network access.
  submitting = true;
  target.querySelector('.form-message').classList.remove('show');
  target.setAttribute('aria-busy','true');
  const controls = [...target.querySelectorAll('input,select,button')];
  const disabled = controls.map(control => control.disabled);
  controls.forEach(control => control.disabled = true);
  const button = target.querySelector('button[type="submit"]'), label = button.textContent;
  button.textContent = tr('Enviando resposta…','Sending RSVP…');
  try {
    const result = await callRsvpApi(payload);
    const value = { attending: (result.confirmationStatus ?? payload.confirmationStatus) === 1,
      pendingApproval: result.pendingApproval === true, ts: Date.now() };
    try { localStorage.setItem(completionKey(),JSON.stringify(value)); } catch (_) { /* Server still prevents repeated writes. */ }
    showCompletion(target,value,true);
  } catch (error) {
    feedback(target, error.message === 'not_found'
      ? tr('Confira o nome e os últimos 4 números do telefone.','Check your name and the last 4 phone digits.')
      : tr('Não foi possível registrar sua resposta agora. Tente novamente.','Could not record your response right now. Please try again.'),false);
  } finally {
    submitting = false; target.removeAttribute('aria-busy'); button.textContent = label;
    if (!completion) controls.forEach((control,i) => control.disabled = disabled[i]);
  }
}
window.addEventListener('storage', event => {
  if (event.key !== completionKey()) return;
  const value = readCompletion();
  if (value) showCompletion(byId('privateRsvp') || byId('publicRsvp'),value);
});
function configureRsvpForm(event, enabled) {
  const max = Number.isInteger(event.rsvpMaxCompanions) ? event.rsvpMaxCompanions : 0;
  const publicForm = byId('publicRsvp');
  publicForm.hidden = event.rsvpMode === 'privado';
  byId('privateRsvp')?.remove();
  if (event.rsvpMode !== 'privado') {
    byId('guestCount').innerHTML = companionOptions(max);
    publicForm.querySelectorAll('input,select,button').forEach(control => control.disabled = !enabled);
    byId('guestCount').disabled = true; byId('companionsField').hidden = true;
    const country = byId('phoneCountry');
    country.value = [...country.options].some(option => option.value === event.rsvpDefaultCountry) ? event.rsvpDefaultCountry : 'BR';
    return;
  }
  const form = document.createElement('form'); form.className = 'rsvp-form'; form.id = 'privateRsvp'; form.noValidate = true;
  form.innerHTML = `
    <div class="field"><label for="privateName">${tr('Seu nome completo','Your full name')}</label><input id="privateName" autocomplete="name" maxlength="120" required></div>
    <div class="field"><label for="privateLast4">${tr('Últimos 4 números do seu telefone','Last 4 digits of your phone')}</label><input id="privateLast4" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required></div>
    <fieldset><legend>${tr('Você vai comparecer?','Will you attend?')}</legend><div class="attendance-options"><input id="privateYes" type="radio" name="privateAttendance" value="yes"><label for="privateYes">${tr('Vou comparecer','I will attend')}</label><input id="privateNo" type="radio" name="privateAttendance" value="no"><label for="privateNo">${tr('Não poderei ir','I cannot attend')}</label></div></fieldset>
    ${event.rsvpAllowCompanions ? `<div class="field" id="privateCompanions" hidden><label for="privateGuests">${tr('Acompanhantes','Companions')}</label><select id="privateGuests">${companionOptions(max)}</select></div>` : ''}
    <button class="button" type="submit">${tr('Confirmar resposta','Send RSVP')}</button><p class="form-message" role="status" tabindex="-1"></p>`;
  document.querySelector('.rsvp-wrap').append(form);
  form.querySelectorAll('input,select,button').forEach(control => control.disabled = !enabled);
  form.querySelectorAll('[name="privateAttendance"]').forEach(input => input.addEventListener('change', () => {
    const attending = form.querySelector('[name="privateAttendance"]:checked')?.value === 'yes';
    if (byId('privateCompanions')) byId('privateCompanions').hidden = !attending;
    if (!attending && byId('privateGuests')) byId('privateGuests').value = '0';
    renderCompanionNames(form,attending ? Number(byId('privateGuests')?.value || 0) : 0);
  }));
  byId('privateGuests')?.addEventListener('change', () => renderCompanionNames(form,Number(byId('privateGuests').value)));
  form.addEventListener('submit', async submitEvent => {
    submitEvent.preventDefault();
    if (!enabled || submitting || completion) return;
    const name = byId('privateName').value.trim(), last4 = byId('privateLast4').value.replace(/\D/g,'');
    const attendance = form.querySelector('[name="privateAttendance"]:checked')?.value;
    if (!name || last4.length !== 4 || !attendance) {
      feedback(form,tr('Preencha seu nome, os 4 números do telefone e a sua resposta.','Enter your name, the last 4 phone digits and your response.'),false); return;
    }
    const companions = companionData(form); if (!companions) return;
    await sendResponse(form,{action:'verifyAndSubmitPrivate',name,phoneLast4:last4,confirmationStatus:attendance === 'yes' ? 1 : 0,menu:1,...companions});
  });
}
const form = byId('publicRsvp');
form.querySelectorAll('[name="attendance"]').forEach(radio => {
  radio.setAttribute('aria-describedby','attendanceError');
  radio.addEventListener('change', () => {
    const companions = currentEvent.rsvpAllowCompanions === true && form.elements.attendance.value === 'yes';
    byId('companionsField').hidden = !companions; byId('guestCount').disabled = !companions;
    if (!companions) byId('guestCount').value = '0';
    renderCompanionNames(form,companions ? Number(byId('guestCount').value) : 0);
    byId('attendanceError').hidden = true;
  });
});
byId('guestCount').addEventListener('change', () => renderCompanionNames(form,Number(byId('guestCount').value)));
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentEvent.rsvpEnabled || currentEvent.rsvpMode === 'privado' || submitting || completion) return;
  const name = form.elements.name.value.trim(), attendance = form.elements.attendance.value;
  byId('nameError').hidden = !!name; byId('attendanceError').hidden = !!attendance;
  byId('guestName').setAttribute('aria-invalid',String(!name));
  if (!name || !attendance) { (name ? byId('yes') : byId('guestName')).focus(); return; }
  const phone = byId('guestPhone').value.trim();
  if (!phone) { byId('guestPhone').setAttribute('aria-invalid','true'); byId('guestPhone').focus(); return; }
  byId('guestPhone').removeAttribute('aria-invalid');
  const companions = companionData(form); if (!companions) return;
  await sendResponse(form,{action:'submitPublic',name,phone,phoneCountry:byId('phoneCountry').value,confirmationStatus:attendance === 'yes' ? 1 : 0,menu:1,...companions});
});
const floatingLink = document.querySelector('.mobile-rsvp');
if ('IntersectionObserver' in window) {
  let heroVisible = true, formVisible = false, footerVisible = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.target.classList.contains('hero')) heroVisible = entry.isIntersecting; else if (entry.target.classList.contains('site-footer')) footerVisible = entry.isIntersecting; else formVisible = entry.isIntersecting; });
    floatingLink.hidden = heroVisible || formVisible || footerVisible || !currentEvent.rsvpEnabled || !!completion;
  });
  observer.observe(document.querySelector('.hero')); observer.observe(byId('rsvp'));
  observer.observe(document.querySelector('.site-footer'));
}
function loadingError(message) {
  const status = byId('inviteStatus'); status.hidden = false;
  status.classList.add('has-error'); status.querySelector('.loading-copy').textContent = message;
  const retry = document.createElement('button'); retry.className = 'button secondary';
  retry.textContent = tr('Tentar novamente','Try again'); retry.onclick = () => location.reload(); status.append(retry);
}
(async () => {
  if (!window.__rsvpToken && !window.__rsvpSlug) { loadingError(tr('Convite não encontrado','Invitation not found')); return; }
  try {
    currentEvent = await callRsvpApi({action:'resolveEvent'});
    if (!currentEvent.rsvpEnabled && !currentEvent.eventTitle) throw new Error('invalid_token');
    const {enabled} = window.PlanneInvite.render(currentEvent, {animateEntrance:false,keepLoading:true});
    configureRsvpForm(currentEvent,enabled);
    const cached = readCompletion();
    if (cached) showCompletion(byId('privateRsvp') || form,cached);
    const status = byId('inviteStatus');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && status.animate) {
      await status.animate([{opacity:1},{opacity:0}],{duration:220,easing:'cubic-bezier(.25,1,.5,1)',fill:'forwards'}).finished;
    }
    status.hidden = true;
    document.body.classList.remove('invite-loading');
    document.querySelectorAll('[data-loading-inert]').forEach(element => { element.inert = false; element.removeAttribute('data-loading-inert'); });
    window.PlanneInvite.playEntrance(currentEvent.rsvpRevealStyle, currentEvent);
  } catch (_) { loadingError(tr('Este convite não está disponível.','This invitation is unavailable.')); }
})();
