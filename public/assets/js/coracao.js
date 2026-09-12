// ═══════════════════════════════════════════════════════
//  DADOS DO EVENTO — página estática: tudo fica fixo aqui, sem token
//  nem chamada de API. Editar diretamente pra mudar título, data,
//  endereço, foto de capa etc.
// ═══════════════════════════════════════════════════════
const EVENT = {
    title: 'Casamento Guilherme & Yasmin',
    // ISO com horário — ajuste o horário quando ele for definido.
    date: '2028-08-15T16:00:00-03:00',
    coverImageUrl: '/assets/images/coracao-capa.jpg',
    locationInfo: 'R. Nossa Sra. de Nazaré, 101 - Cidade Dutra, São Paulo - SP, 04805-100',
    dressCode: '',
    faq: '',
    organizerMessage: '',
    thankYouMessage: '',
};

// ═══════════════════════════════════════════════════════
//  i18n
// ═══════════════════════════════════════════════════════
const STRINGS = {
    en: {
        invitedEyebrow: "You're invited",
        publicSubtitle: "Fill in your details to confirm your presence.",

        labelBride: "Who's going to be the bride?",
        brideChoose: "Choose an option",
        brideOpt1: "Yasmin, obviously",
        brideOpt2: "Yasmin herself",
        brideOpt3: "It can only be Yasmin",

        labelName: "Full name",
        labelPhone: "Phone",
        placeholderPhone: "(00) 00000-0000",
        labelPresence: "Will you attend?",
        presenceYes: "I'll be there",
        presenceNo: "Can't make it",
        labelCompanions: "Companions",
        companionNamePlaceholder: "Guest {n} name",
        labelMenu: "Meal preference",

        menuRegular: "Regular",
        menuVegetarian: "Vegetarian",
        menuVegan: "Vegan",
        menuKids: "Kids menu",
        menuGlutenFree: "Gluten-free",
        menuLactoseFree: "Lactose-free",
        menuOther: "Other",

        cdDays: "days",
        cdHours: "hrs",
        cdMinutes: "min",

        eventDetailsToggle: "Event details",
        dressCodeLabel: "Dress code",
        locationInfoLabel: "Location",
        faqLabel: "Good to know",

        btnAddCalendar: "Add to calendar",
        btnSend: "Send RSVP",

        errMissingName: "Please enter your name.",
        errMissingPhone: "Please enter your phone number.",
        errMissingPresence: "Please let us know if you'll attend.",
        errGeneric: "Something went wrong. Please try again.",

        successYesTitle: "You're confirmed!",
        successYesSub: "Thanks for letting us know, see you there!",
        successNoTitle: "Thanks for letting us know",
        successNoSub: "We're sorry you can't make it. Thanks for responding!",

        privacy: "Privacy policy",
    },
    pt: {
        invitedEyebrow: "Você foi convidado",
        publicSubtitle: "Preencha seus dados para confirmar presença.",

        labelBride: "Quem vai ser a noiva?",
        brideChoose: "Escolha uma opção",
        brideOpt1: "Yasmin, é claro",
        brideOpt2: "A Yasmin mesmo",
        brideOpt3: "Só pode ser a Yasmin",

        labelName: "Nome completo",
        labelPhone: "Telefone",
        placeholderPhone: "(00) 00000-0000",
        labelPresence: "Você vai comparecer?",
        presenceYes: "Vou comparecer",
        presenceNo: "Não vou poder ir",
        labelCompanions: "Acompanhantes",
        companionNamePlaceholder: "Nome do acompanhante {n}",
        labelMenu: "Preferência de menu",

        menuRegular: "Regular",
        menuVegetarian: "Vegetariano",
        menuVegan: "Vegano",
        menuKids: "Infantil",
        menuGlutenFree: "Sem glúten",
        menuLactoseFree: "Sem lactose",
        menuOther: "Outro",

        cdDays: "dias",
        cdHours: "hrs",
        cdMinutes: "min",

        eventDetailsToggle: "Detalhes do evento",
        dressCodeLabel: "Dress code",
        locationInfoLabel: "Local",
        faqLabel: "Bom saber",

        btnAddCalendar: "Adicionar ao calendário",
        btnSend: "Enviar confirmação",

        errMissingName: "Digite seu nome.",
        errMissingPhone: "Digite seu telefone.",
        errMissingPresence: "Diga se você vai comparecer.",
        errGeneric: "Algo deu errado. Tente novamente.",

        successYesTitle: "Presença confirmada!",
        successYesSub: "Obrigado por avisar, te esperamos lá!",
        successNoTitle: "Obrigado por avisar",
        successNoSub: "Sentimos muito que você não poderá vir. Obrigado por responder!",

        privacy: "Política de privacidade",
    }
};

let currentLang = 'pt';
let countdownTimer = null;

function detectLang() {
    return (navigator.language || '').startsWith('pt') ? 'pt' : 'en';
}

function renderCoverHero() {
    const s = STRINGS[currentLang];
    const hero = document.getElementById('coverHero');
    const photo = document.getElementById('coverPhoto');
    if (EVENT.coverImageUrl) {
        photo.onload = () => hero.classList.add('has-photo');
        photo.onerror = () => hero.classList.remove('has-photo');
        photo.src = EVENT.coverImageUrl;
    } else {
        hero.classList.remove('has-photo');
    }
    document.getElementById('heroEyebrow').textContent = s.invitedEyebrow;
    document.getElementById('heroEventTitle').textContent = EVENT.title;

    const dateEl = document.getElementById('heroEventDate');
    const d = new Date(EVENT.date);
    if (!Number.isNaN(d.getTime())) {
        dateEl.textContent = d.toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : 'en-US', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
        dateEl.hidden = false;
    } else {
        dateEl.hidden = true;
    }
}

// ═══════════════════════════════════════════════════════
//  CONTAGEM REGRESSIVA
// ═══════════════════════════════════════════════════════
function renderCountdown() {
    const el = document.getElementById('countdown');
    const target = new Date(EVENT.date).getTime();
    if (Number.isNaN(target)) { el.hidden = true; return; }

    const diff = target - Date.now();
    if (diff <= 0) { el.hidden = true; return; }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    document.getElementById('cdDays').textContent = days;
    document.getElementById('cdHours').textContent = hours;
    document.getElementById('cdMinutes').textContent = minutes;
    el.hidden = false;
}

function startCountdown() {
    renderCountdown();
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(renderCountdown, 60000);
}

// ═══════════════════════════════════════════════════════
//  ADICIONAR AO CALENDÁRIO (.ics)
// ═══════════════════════════════════════════════════════
function downloadIcs() {
    const start = new Date(EVENT.date);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4h de duração default

    const toIcsDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const description = EVENT.locationInfo || '';

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Planne//RSVP//PT',
        'BEGIN:VEVENT',
        'UID:guilherme-e-yasmin@planneapp.com',
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${toIcsDate(start)}`,
        `DTEND:${toIcsDate(end)}`,
        `SUMMARY:${EVENT.title}`,
        description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${EVENT.title.replace(/[^\w\- ]/g, '').trim() || 'evento'}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════
//  DRESS CODE / FAQ (só aparecem se EVENT.dressCode/faq forem preenchidos)
// ═══════════════════════════════════════════════════════
function renderEventExtras() {
    const dressCodeBlock = document.getElementById('dressCodeBlock');
    const faqBlock = document.getElementById('faqBlock');
    let anyDetail = false;

    if (EVENT.dressCode) {
        document.getElementById('dressCodeBody').textContent = EVENT.dressCode;
        dressCodeBlock.hidden = false;
        anyDetail = true;
    } else {
        dressCodeBlock.hidden = true;
    }
    if (EVENT.faq) {
        document.getElementById('faqBody').textContent = EVENT.faq;
        faqBlock.hidden = false;
        anyDetail = true;
    } else {
        faqBlock.hidden = true;
    }

    document.getElementById('eventDetails').hidden = !anyDetail;
}

// ═══════════════════════════════════════════════════════
//  MAPA
// ═══════════════════════════════════════════════════════
function renderMapSection() {
    const section = document.getElementById('mapSection');
    if (!EVENT.locationInfo) {
        section.hidden = true;
        return;
    }
    document.getElementById('mapAddressText').textContent = EVENT.locationInfo;
    document.getElementById('mapFrame').src =
        'https://www.google.com/maps?q=' + encodeURIComponent(EVENT.locationInfo) + '&output=embed';
    section.hidden = false;
}

// ═══════════════════════════════════════════════════════
//  MENSAGEM DOS NOIVOS
// ═══════════════════════════════════════════════════════
function renderOrganizerMessage() {
    const section = document.getElementById('organizerMessage');
    if (!EVENT.organizerMessage) {
        section.hidden = true;
        return;
    }
    document.getElementById('organizerMessageBody').textContent = EVENT.organizerMessage;
    section.hidden = false;
}

function applyLang(lang) {
    currentLang = lang;
    const s = STRINGS[lang];
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const v = s[el.dataset.i18n];
        if (v !== undefined) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const v = s[el.dataset.i18nPlaceholder];
        if (v !== undefined) el.placeholder = v;
    });
    document.getElementById('publicSubtitleText').textContent = s.publicSubtitle;
    renderCountdown();
}

// ═══════════════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════════════
const SUN_ICON = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>`;
const MOON_ICON = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>`;

function initTheme() {
    document.getElementById('theme-icon').innerHTML = document.documentElement.dataset.theme === 'dark' ? MOON_ICON : SUN_ICON;
    updateThemeColor();
}
function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('planne-theme', next);
    document.getElementById('theme-icon').innerHTML = next === 'dark' ? MOON_ICON : SUN_ICON;
    updateThemeColor();
}
function updateThemeColor() {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#101715' : '#f8fafc');
}

// ═══════════════════════════════════════════════════════
//  STATE SWITCHER
// ═══════════════════════════════════════════════════════
const ALL_STATES = ['statePublicForm', 'stateSuccess'];
function showState(id) {
    ALL_STATES.forEach(s => document.getElementById(s).classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ═══════════════════════════════════════════════════════
//  INLINE VALIDATION FEEDBACK
// ═══════════════════════════════════════════════════════
function markInvalid(id) {
    const el = document.getElementById(id);
    el.classList.add('invalid');
    el.addEventListener('input', () => el.classList.remove('invalid'), { once: true });
    el.focus();
}
function pulseAttention(id) {
    const el = document.getElementById(id);
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
}

// ═══════════════════════════════════════════════════════
//  QUANTITY STEPPER (companions)
// ═══════════════════════════════════════════════════════
function updateStepperState(input) {
    const v = parseInt(input.value || '0', 10);
    const wrap = input.closest('.stepper');
    wrap.querySelector('[data-step="-1"]').disabled = v <= 0;
}
function initSteppers() {
    document.querySelectorAll('.stepper-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            const next = Math.max(0, parseInt(input.value || '0', 10) + parseInt(btn.dataset.step, 10));
            input.value = next;
            updateStepperState(input);
            renderCompanionNames();
        });
    });
}

// ═══════════════════════════════════════════════════════
//  COMPANION NAMES — um <input> por acompanhante, gerado/removido em
//  sincronia com o valor do stepper de quantidade acima. Preserva o que
//  já foi digitado quando a quantidade muda.
// ═══════════════════════════════════════════════════════
function renderCompanionNames() {
    const s = STRINGS[currentLang];
    const countInput = document.getElementById('pubCompanions');
    const count = parseInt(countInput.value || '0', 10);
    const list = document.getElementById('pubCompanionNames');
    const existingValues = [...list.querySelectorAll('input')].map(i => i.value);

    list.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.placeholder = s.companionNamePlaceholder.replace('{n}', i + 1);
        input.value = existingValues[i] || '';
        list.appendChild(input);
    }
}

function getCompanionNames() {
    const list = document.getElementById('pubCompanionNames');
    return [...list.querySelectorAll('input')].map(i => i.value.trim());
}

// ═══════════════════════════════════════════════════════
//  PRESENCE TOGGLE
// ═══════════════════════════════════════════════════════
let attending = null;

function setPresence(value) {
    attending = value;
    document.getElementById('pubYes').classList.toggle('selected-yes', value === true);
    document.getElementById('pubNo').classList.toggle('selected-no', value === false);
    document.getElementById('pubCompanionsField').classList.toggle('show', value === true);
}

// ═══════════════════════════════════════════════════════
//  CONFIRMAÇÃO — validação local só, sem envio pra nenhum servidor.
// ═══════════════════════════════════════════════════════
function showPublicError(msg) {
    document.getElementById('publicErrorText').textContent = msg;
    document.getElementById('publicError').classList.add('show');
}
function hidePublicError() { document.getElementById('publicError').classList.remove('show'); }

function submitPublic() {
    hidePublicError();
    const s = STRINGS[currentLang];
    const name = document.getElementById('pubName').value.trim();
    const phone = document.getElementById('pubPhone').value.trim();

    if (!name) { markInvalid('pubName'); return showPublicError(s.errMissingName); }
    if (!phone) { markInvalid('pubPhone'); return showPublicError(s.errMissingPhone); }
    if (attending === null) { pulseAttention('pubPresenceToggle'); return showPublicError(s.errMissingPresence); }

    showSuccess(attending);
}

// ═══════════════════════════════════════════════════════
//  SUCCESS
// ═══════════════════════════════════════════════════════
function showSuccess(attending) {
    const s = STRINGS[currentLang];
    const icon = document.getElementById('successIcon');
    if (attending) {
        icon.className = 'seal seal-yes';
        icon.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;
        document.getElementById('successTitle').textContent = s.successYesTitle;
        document.getElementById('successSub').textContent = EVENT.thankYouMessage || s.successYesSub;
    } else {
        icon.className = 'seal seal-no';
        icon.innerHTML = `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        document.getElementById('successTitle').textContent = s.successNoTitle;
        document.getElementById('successSub').textContent = s.successNoSub;
    }

    document.getElementById('btnAddCalendar').hidden = !attending;
    showState('stateSuccess');
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSteppers();
    document.documentElement.dataset.inviteStyle = 'foto-editorial';

    applyLang(detectLang());
    renderCoverHero();
    renderEventExtras();
    renderMapSection();
    renderOrganizerMessage();
    startCountdown();

    showState('statePublicForm');
});

document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (document.getElementById('statePublicForm').classList.contains('active')) submitPublic();
});
