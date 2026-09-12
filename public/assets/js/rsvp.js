// ─── CONFIG ───────────────────────────────────────────
        // Endpoint da Cloud Function `rsvp` (região southamerica-east1 —
        // mesma região de todas as outras functions deste projeto;
        // um endpoint apontando pra us-central1 aqui nunca resolve,
        // fazendo todo convite cair em "convite não encontrado").
        window.__RSVP_ENDPOINT = "https://southamerica-east1-planne-692f7.cloudfunctions.net/rsvp";
        // ────────────────────────────────────────────────────

        const __p = new URLSearchParams(window.location.search);
        window.__rsvpToken = __p.get("token");

// Teto padrão de acompanhantes quando o evento não define rsvpMaxCompanions
// (evita permitir uma quantidade ilimitada via stepper ou campo manipulado).
const DEFAULT_MAX_COMPANIONS = 10;

// ═══════════════════════════════════════════════════════
//  MEMÓRIA DE PREENCHIMENTO (modo público) — guarda no localStorage que
//  esse navegador já confirmou presença nesse convite, pra quem reabre o
//  link (ex.: voltou pelo WhatsApp) cair direto na tela de sucesso em vez
//  de ver o formulário em branco de novo e achar que precisa reenviar.
//  Só faz sentido em modo público: em modo privado cada convidado busca
//  pelo próprio nome, então o mesmo aparelho pode legitimamente responder
//  por pessoas diferentes sem que isso seja um reenvio acidental.
// ═══════════════════════════════════════════════════════
function rsvpStorageKey() { return `planne_rsvp_${window.__rsvpToken}`; }
function saveRsvpCompletion(name, attending, pendingApproval) {
    try {
        localStorage.setItem(rsvpStorageKey(), JSON.stringify({ name, attending, pendingApproval, ts: Date.now() }));
    } catch (e) { /* modo privado do navegador, quota, etc. — não é crítico */ }
}
function loadRsvpCompletion() {
    try {
        const raw = localStorage.getItem(rsvpStorageKey());
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

// ═══════════════════════════════════════════════════════
//  i18n — trancado no idioma do evento (organizador), sem troca
//  manual pelo convidado. `detectLang()` só serve de fallback
//  transitório antes do resolveEvent responder (ou se o backend
//  ainda não tiver o campo `language`).
// ═══════════════════════════════════════════════════════
const STRINGS = {
    en: {
        loading: "Loading your invitation…",
        invalidTitle: "Invitation not found",
        invalidSub: "This invitation link is invalid or has been disabled.\nAsk the organizer for a new one.",
        appCheckWarning: "We couldn't load a security check on this page (often caused by an ad blocker or privacy extension). You can still RSVP normally.",

        invitedEyebrow: "You're invited",
        publicSubtitle: "Fill in your details to confirm your presence.",
        privateSearchTitle: "Find your invitation",
        privateSearchSubtitle: "Enter your name the way it was invited to find your RSVP.",
        privateConfirmTitle: "Confirm it's you",
        privateConfirmSubtitleFound: "We found your invitation. Confirm the last 4 digits of the phone number the organizer registered.",

        labelName: "Full name",
        labelPhone: "Phone",
        placeholderPhone: "(00) 00000-0000",
        labelPresence: "Will you attend?",
        presenceYes: "I'll be there",
        presenceNo: "Can't make it",
        labelCompanions: "Companions",
        companionNamePlaceholder: "Guest {n} name",
        companionTypeCompanion: "Companion",
        companionTypeChild: "Child",
        labelMenu: "Meal preference",
        labelPhoneLast4: "Last 4 digits of your phone",
        privateGreeting: "Hello, {name}!",

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
        btnAddCalendarGoogle: "Google Calendar",
        btnAddCalendarOutlook: "Outlook",
        btnAddCalendarIcs: "Apple Calendar / other (.ics file)",
        btnAddAnother: "RSVP for someone else",
        btnCreateOwnEvent: "Create your own event invite on Planne",
        footerCreateEvent: "Create your own invite",

        btnSend: "Send RSVP",
        btnSearch: "Search",

        errMissingName: "Please enter your name.",
        errMissingPhone: "Please enter your phone number.",
        errPhoneInvalid: "Invalid phone number. Numbers only.",
        errMissingPresence: "Please let us know if you'll attend.",
        errNotFound: "We couldn't find an invitation under that name.",
        errPhoneMismatch: "Those digits don't match our records. Please try again.",
        errGeneric: "Something went wrong. Please try again.",

        successYesTitle: "You're confirmed!",
        successYesSub: "Thanks for letting us know, see you there!",
        successNoTitle: "Thanks for letting us know",
        successNoSub: "We're sorry you can't make it. Thanks for responding!",
        successPendingTitle: "Response received",
        successPendingSub: "The organizer will review your RSVP shortly.",

        privacy: "Privacy policy",
    },
    pt: {
        loading: "Carregando seu convite…",
        invalidTitle: "Convite não encontrado",
        invalidSub: "Este link de convite é inválido ou foi desativado.\nPeça um novo link ao organizador.",
        appCheckWarning: "Não conseguimos carregar uma verificação de segurança desta página (geralmente causado por um bloqueador de anúncios ou extensão de privacidade). Você ainda pode confirmar presença normalmente.",

        invitedEyebrow: "Você foi convidado",
        publicSubtitle: "Preencha seus dados para confirmar presença.",
        privateSearchTitle: "Encontre seu convite",
        privateSearchSubtitle: "Digite seu nome como foi convidado pra encontrarmos sua confirmação.",
        privateConfirmTitle: "Confirme que é você",
        privateConfirmSubtitleFound: "Encontramos seu convite. Confirme os últimos 4 dígitos do telefone cadastrado pelo organizador.",

        labelName: "Nome completo",
        labelPhone: "Telefone",
        placeholderPhone: "(00) 00000-0000",
        labelPresence: "Você vai comparecer?",
        presenceYes: "Vou comparecer",
        presenceNo: "Não vou poder ir",
        labelCompanions: "Acompanhantes",
        companionNamePlaceholder: "Nome do acompanhante {n}",
        companionTypeCompanion: "Acompanhante",
        companionTypeChild: "Criança",
        labelMenu: "Preferência de menu",
        labelPhoneLast4: "Últimos 4 dígitos do seu telefone",
        privateGreeting: "Olá, {name}!",

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
        btnAddCalendarGoogle: "Google Agenda",
        btnAddCalendarOutlook: "Outlook",
        btnAddCalendarIcs: "Apple Calendar / outro (arquivo .ics)",
        btnAddAnother: "Confirmar presença de mais alguém",
        btnCreateOwnEvent: "Crie o convite do seu evento na Planne",
        footerCreateEvent: "Crie o seu também",

        btnSend: "Enviar confirmação",
        btnSearch: "Buscar",

        errMissingName: "Digite seu nome.",
        errMissingPhone: "Digite seu telefone.",
        errPhoneInvalid: "Telefone inválido. Use apenas números.",
        errMissingPresence: "Diga se você vai comparecer.",
        errNotFound: "Não encontramos um convite com esse nome.",
        errPhoneMismatch: "Esses dígitos não batem com o que temos cadastrado. Tente de novo.",
        errGeneric: "Algo deu errado. Tente novamente.",

        successYesTitle: "Presença confirmada!",
        successYesSub: "Obrigado por avisar, te esperamos lá!",
        successNoTitle: "Obrigado por avisar",
        successNoSub: "Sentimos muito que você não poderá vir. Obrigado por responder!",
        successPendingTitle: "Resposta recebida",
        successPendingSub: "O organizador vai revisar sua confirmação em breve.",

        privacy: "Política de privacidade",
    }
};

let currentLang = 'pt';
let currentEventTitle = null;
let currentEventDate = null;
let currentThankYouMessage = null;
let countdownTimer = null;
let confirmedGuestFirstName = '';

// Fallback só usado antes do resolveEvent responder (texto de loading)
// ou se o backend ainda não retornar `language` — nunca fica visível
// como opção pro convidado escolher (ver decisão: idioma é do evento,
// herdado do settings.language do organizador, não do convidado).
function detectLang() {
    return (navigator.language || '').startsWith('pt') ? 'pt' : 'en';
}

function renderCoverHero(event) {
    const s = STRINGS[currentLang];
    const hero = document.getElementById('coverHero');
    const photo = document.getElementById('coverPhoto');
    if (event.rsvpCoverImageUrl) {
        // Só marca .has-photo quando a imagem REALMENTE carrega — setar a
        // classe otimisticamente (antes de saber se a URL carrega)
        // deixava a capa "vazia" (moldura escura sem foto) quando a URL
        // falhava (permissão do Storage, 404, etc.), em vez de recolher
        // graciosamente pro estado sem foto.
        photo.onload = () => hero.classList.add('has-photo');
        photo.onerror = () => hero.classList.remove('has-photo');
        photo.src = event.rsvpCoverImageUrl;
    } else {
        hero.classList.remove('has-photo');
    }
    document.getElementById('heroEyebrow').textContent = s.invitedEyebrow;
    document.getElementById('heroEventTitle').textContent = currentEventTitle || 'Planne';

    const dateEl = document.getElementById('heroEventDate');
    if (currentEventDate) {
        const d = new Date(currentEventDate);
        if (!Number.isNaN(d.getTime())) {
            dateEl.textContent = d.toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : 'en-US', {
                day: 'numeric', month: 'long', year: 'numeric',
            });
            dateEl.hidden = false;
        } else {
            dateEl.hidden = true;
        }
    } else {
        dateEl.hidden = true;
    }
}

function renderPrivateGreeting() {
    const el = document.getElementById('privateGreeting');
    const s = STRINGS[currentLang];
    if (!confirmedGuestFirstName) { el.hidden = true; return; }
    el.textContent = s.privateGreeting.replace('{name}', confirmedGuestFirstName);
    el.hidden = false;
}

// ═══════════════════════════════════════════════════════
//  CONTAGEM REGRESSIVA
// ═══════════════════════════════════════════════════════
function renderCountdown() {
    const el = document.getElementById('countdown');
    if (!currentEventDate) { el.hidden = true; return; }

    const target = new Date(currentEventDate).getTime();
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
//  ADICIONAR AO CALENDÁRIO
//  iOS: navegação direta pro .ics abre a tela nativa "Adicionar ao
//  Calendário" (ver isIOS abaixo). Android: não tem esse atalho — navegar
//  pra um blob text/calendar só baixa o arquivo pro Downloads sem abrir
//  nada, então usamos o link de criação de evento do Google Agenda (o app
//  padrão de calendário em praticamente todo Android), que abre com os
//  dados já preenchidos. Desktop: não existe "o" app de calendário certo
//  pra adivinhar, então mostra um menu com as opções mais comuns em vez de
//  só derrubar um arquivo sem explicação.
// ═══════════════════════════════════════════════════════
function eventTimeRange() {
    if (!currentEventDate) return null;
    const start = new Date(currentEventDate);
    if (Number.isNaN(start.getTime())) return null;
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4h de duração default
    return { start, end };
}

function buildIcs(start, end, title, description) {
    const toIcsDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Planne//RSVP//PT',
        'BEGIN:VEVENT',
        `UID:${window.__rsvpToken}@planneapp.com`,
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${toIcsDate(start)}`,
        `DTEND:${toIcsDate(end)}`,
        `SUMMARY:${title}`,
        description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');
}

function buildGoogleCalendarUrl(start, end, title, description) {
    const toGDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${toGDate(start)}/${toGDate(end)}`,
    });
    if (description) params.set('details', description);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookCalendarUrl(start, end, title, description) {
    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        startdt: start.toISOString(),
        enddt: end.toISOString(),
        subject: title,
    });
    if (description) params.set('body', description);
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function isIOSDevice() {
    return /iP(hone|ad|od)/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function isAndroidDevice() {
    return /Android/.test(navigator.userAgent);
}

// Loop do convidado (H0/D): sem app publicado na App Store ainda, por isso
// nenhum CTA de "baixe o app" aparece em iOS (evita linkar pra uma loja
// onde o app não existe). `referrer=ref%3D<eventId>` só entra quando já
// temos o eventId (depois de um RSVP bem-sucedido, ver window.__rsvpEventId
// em submitPublic/submitPrivate) — é o que o app lê via Play Install
// Referrer no primeiro boot pra creditar a indicação no signup.
function playStoreUrl(eventId) {
    const base = 'https://play.google.com/store/apps/details?id=com.planne.planne';
    return eventId ? `${base}&referrer=${encodeURIComponent('ref=' + eventId)}` : base;
}
function updateAppLinks() {
    const wrap = document.getElementById('footerAppLinkWrap');
    if (wrap) wrap.hidden = isIOSDevice();
    const footerLink = document.getElementById('footerAppLink');
    if (footerLink) footerLink.href = playStoreUrl(window.__rsvpEventId);
}

function downloadIcs() {
    const range = eventTimeRange();
    if (!range) return;
    const title = currentEventTitle || 'Planne';
    const description = window.__rsvpLocationInfo || '';
    const ics = buildIcs(range.start, range.end, title, description);

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    if (isIOSDevice()) {
        // Attribute `download` faz o iOS salvar silenciosamente no app
        // Arquivos em vez de abrir a tela nativa — por isso a navegação
        // direta aqui, sem esse atributo.
        window.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^\w\- ]/g, '').trim() || 'evento'}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    closeCalendarMenu();
}

function closeCalendarMenu() {
    document.getElementById('calendarMenu').hidden = true;
    document.removeEventListener('click', onCalendarMenuOutsideClick);
}
function onCalendarMenuOutsideClick(e) {
    const wrap = document.getElementById('btnAddCalendar').closest('.calendar-wrap');
    if (!wrap.contains(e.target)) closeCalendarMenu();
}

function onAddCalendarClick() {
    const range = eventTimeRange();
    if (!range) return;
    const title = currentEventTitle || 'Planne';
    const description = window.__rsvpLocationInfo || '';

    if (isAndroidDevice()) {
        window.open(buildGoogleCalendarUrl(range.start, range.end, title, description), '_blank', 'noopener');
        return;
    }
    if (isIOSDevice()) {
        downloadIcs();
        return;
    }

    // Desktop: sem um app de calendário óbvio pra abrir direto, mostra as
    // opções mais comuns em vez de só derrubar um .ics sem contexto.
    document.getElementById('calendarMenuGoogle').href = buildGoogleCalendarUrl(range.start, range.end, title, description);
    document.getElementById('calendarMenuOutlook').href = buildOutlookCalendarUrl(range.start, range.end, title, description);
    const menu = document.getElementById('calendarMenu');
    const wasOpen = !menu.hidden;
    closeCalendarMenu();
    if (!wasOpen) {
        menu.hidden = false;
        setTimeout(() => document.addEventListener('click', onCalendarMenuOutsideClick), 0);
    }
}

// ═══════════════════════════════════════════════════════
//  DRESS CODE / FAQ (extras opcionais — só aparecem se preenchidos)
// ═══════════════════════════════════════════════════════
function renderEventExtras(event) {
    const dressCodeBlock = document.getElementById('dressCodeBlock');
    const faqBlock = document.getElementById('faqBlock');
    let anyDetail = false;

    if (event.rsvpDressCode) {
        document.getElementById('dressCodeBody').textContent = event.rsvpDressCode;
        dressCodeBlock.hidden = false;
        anyDetail = true;
    } else {
        dressCodeBlock.hidden = true;
    }
    if (event.rsvpFaq) {
        document.getElementById('faqBody').textContent = event.rsvpFaq;
        faqBlock.hidden = false;
        anyDetail = true;
    } else {
        faqBlock.hidden = true;
    }

    document.getElementById('eventDetails').hidden = !anyDetail;
}

// ═══════════════════════════════════════════════════════
//  COR PREDOMINANTE (rsvpAccentColor) — sobrescreve --teal/--teal-dark
//  em cima de QUALQUER estilo (rsvpTemplateId), via inline style no
//  documentElement (sempre vence uma regra de stylesheet sem !important,
//  independente de qual dos 3 estilos está ativo).
// ═══════════════════════════════════════════════════════
function darkenHex(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amount)));
    const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amount)));
    const b = Math.max(0, Math.round((n & 255) * (1 - amount)));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function lightenHex(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const mix = (channel) => Math.min(255, Math.round(channel + (255 - channel) * amount));
    const r = mix((n >> 16) & 255);
    const g = mix((n >> 8) & 255);
    const b = mix(n & 255);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
// --teal-dark é usado como cor de TEXTO (countdown, saudação privada,
// "rsvp-another" etc.) em cima do fundo da página (--paper/--mist). No
// modo claro esse fundo é claro, então escurecer a cor escolhida pelo
// organizador garante contraste. No modo escuro o fundo já é bem escuro
// (#101715) — se a cor escolhida também for escura, escurecer ainda mais
// deixa o texto ilegível. Por isso, no escuro clareamos em vez de
// escurecer. currentAccentHex guarda a última cor pra recalcular quando
// o tema muda (ver toggleTheme).
let currentAccentHex = null;
function applyAccentColor(hex) {
    const root = document.documentElement;
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
        currentAccentHex = null;
        root.style.removeProperty('--teal');
        root.style.removeProperty('--teal-dark');
        return;
    }
    currentAccentHex = hex;
    const isDark = root.dataset.theme === 'dark';
    root.style.setProperty('--teal', hex);
    root.style.setProperty('--teal-dark', isDark ? lightenHex(hex, 0.6) : darkenHex(hex, 0.35));
}

// ═══════════════════════════════════════════════════════
//  FONTE CURADA (rsvpFontPairId) — sobrescreve --display-font/
//  --body-font em cima de QUALQUER estilo (rsvpTemplateId), mesmo
//  mecanismo do applyAccentColor acima (inline style sempre vence uma
//  regra de stylesheet sem !important). Catálogo espelhado em
//  rsvp_local_preview.dart (_fontPairs, prévia dentro do app) e nas
//  labels i18n do seletor em convite_settings_widget.dart — mudou aqui,
//  muda nos outros 2.
// ═══════════════════════════════════════════════════════
const FONT_PAIRS = {
    'script-dourado': {
        display: '"Bonheur Royale", cursive', body: '"Jost", "Planne Inter", sans-serif',
        families: ['Bonheur+Royale', 'Jost:wght@400;500;600'],
    },
    suico: {
        display: '"Familjen Grotesk", "Planne Inter", sans-serif', body: '"Archivo", "Planne Inter", sans-serif',
        families: ['Familjen+Grotesk:wght@500;600', 'Archivo:wght@400;500;600'],
    },
    divertido: {
        display: '"Fredoka", "Planne Inter", sans-serif', body: '"Quicksand", "Planne Inter", sans-serif',
        families: ['Fredoka:wght@500;600;700', 'Quicksand:wght@500;600;700'],
    },
    postal: {
        display: '"Unbounded", "Planne Inter", sans-serif', body: '"Karla", "Planne Inter", sans-serif',
        families: ['Unbounded:wght@500;600;700', 'Karla:wght@400;500;600'],
    },
    literario: {
        display: '"Vollkorn", Georgia, serif', body: '"Nunito Sans", "Planne Inter", sans-serif',
        families: ['Vollkorn:ital,wght@0,500;1,500;0,600', 'Nunito+Sans:wght@400;500;600'],
    },
    tecnico: {
        display: '"Martian Mono", ui-monospace, monospace', body: '"Work Sans", "Planne Inter", sans-serif',
        families: ['Martian+Mono:wght@400;500;600', 'Work+Sans:wght@400;500;600'],
    },
};
const loadedFontPairs = new Set();
function applyFontPairOverride(fontPairId) {
    const root = document.documentElement;
    const pair = FONT_PAIRS[fontPairId];
    if (!pair) {
        root.style.removeProperty('--display-font');
        root.style.removeProperty('--body-font');
        return;
    }
    if (!loadedFontPairs.has(fontPairId)) {
        loadedFontPairs.add(fontPairId);
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?' +
            pair.families.map((f) => `family=${f}`).join('&') + '&display=swap';
        document.head.appendChild(link);
    }
    root.style.setProperty('--display-font', pair.display);
    root.style.setProperty('--body-font', pair.body);
}

// ═══════════════════════════════════════════════════════
//  MAPA (rsvpLocationInfo — texto livre usado como endereço)
// ═══════════════════════════════════════════════════════
function renderMapSection(event) {
    window.__rsvpLocationInfo = event.rsvpLocationInfo || '';
    const section = document.getElementById('mapSection');
    if (!event.rsvpLocationInfo) {
        section.hidden = true;
        return;
    }
    document.getElementById('mapAddressText').textContent = event.rsvpLocationInfo;
    document.getElementById('mapFrame').src =
        'https://www.google.com/maps?q=' + encodeURIComponent(event.rsvpLocationInfo) + '&output=embed';
    section.hidden = false;
}

// ═══════════════════════════════════════════════════════
//  MENSAGEM DO ORGANIZADOR (rsvpOrganizerMessage)
// ═══════════════════════════════════════════════════════
function renderOrganizerMessage(event) {
    const section = document.getElementById('organizerMessage');
    if (!event.rsvpOrganizerMessage) {
        section.hidden = true;
        return;
    }
    document.getElementById('organizerMessageBody').textContent = event.rsvpOrganizerMessage;
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
    renderPrivateGreeting();
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
    // Recalcula --teal-dark pro novo tema (claro escurece, escuro clareia
    // a cor escolhida pelo organizador — ver applyAccentColor).
    if (currentAccentHex) applyAccentColor(currentAccentHex);
}
function updateThemeColor() {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#101715' : '#f8fafc');
}

// ═══════════════════════════════════════════════════════
//  STATE SWITCHER
// ═══════════════════════════════════════════════════════
const ALL_STATES = ['stateLoading','stateInvalid','statePublicForm','statePrivateSearch','statePrivateConfirm','stateSuccess'];
function showState(id) {
    ALL_STATES.forEach(s => document.getElementById(s).classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ═══════════════════════════════════════════════════════
//  API — contrato esperado da Cloud Function `rsvp`
//  (implementação/deploy fora deste repo). Ver comentário no topo.
//
//    POST { action: 'resolveEvent' }
//      -> { rsvpEnabled, rsvpMode: 'publico'|'privado',
//           rsvpAllowCompanions, rsvpMaxCompanions, eventTitle?,
//           j       // ISO string — contagem regressiva + .ics
//           language?,              // 'pt'|'en' — settings.language do organizador,
//                                   // idioma FIXO do convite (não escolhido pelo convidado)
//           rsvpDressCode?, rsvpFaq?,         // texto livre, extras opcionais
//           rsvpLocationInfo?,      // texto livre — usado como endereço do mapa
//           rsvpOrganizerMessage?,  // mensagem livre do organizador
//           rsvpCoverImageUrl?,     // URL da foto de capa (full-bleed)
//           rsvpThankYouMessage? }  // sobrescreve a msg padrão de sucesso
//    POST { action: 'lookup', publicToken, name }
//      -> { found: boolean }
//    POST { action: 'verifyAndSubmitPrivate', publicToken, name,
//           phoneLast4, confirmationStatus, menu, companions }
//      -> { ok: true } | { error }
//    POST { action: 'submitPublic', publicToken, name, phone,
//           phoneCountry, confirmationStatus, menu, companions }
//      -> { ok: true, pendingApproval: boolean } | { error }
//
//  confirmationStatus: 1 = Confirmado, 0 = Recusado
//  (mesmo mapeamento usado no app — ver dropdown de status do convidado)
//  menu: 1..7 (int, não string!) — mesmo enum do app nativo
//  (add_guest_widget.dart): 1=Regular, 2=Vegetariano, 3=Vegano,
//  4=Infantil, 5=Sem glúten, 6=Sem lactose, 7=Outro.
// ═══════════════════════════════════════════════════════
async function callRsvpApi(payload) {
    const appCheckToken = await window.__getAppCheckToken();
    const headers = { 'Content-Type': 'application/json' };
    if (appCheckToken) {
        headers['X-Firebase-AppCheck'] = appCheckToken;
    }
    const res = await fetch(window.__RSVP_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({ publicToken: window.__rsvpToken, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    // rsvp.js devolve alguns erros (ex: "not_found" de nome/telefone que não
    // batem) com HTTP 200 de propósito, pra não dar pista via status code de
    // qual parte errou — mas isso significa que `res.ok` sozinho não basta
    // pra saber se deu certo. Sem checar `data.error` aqui, toda chamada que
    // falhasse assim caía direto no "sucesso" do chamador, sem nunca ter
    // gravado nada no Firestore.
    if (!res.ok || data.error) {
        const err = new Error(data.error || 'request_failed');
        err.code = data.error;
        throw err;
    }
    return data;
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
// Clampa qualquer valor (inclusive digitado manualmente, caso o atributo
// `readonly` do input seja contornado via devtools) para um inteiro válido
// entre 0 e o teto configurado — nunca confiar no valor bruto do campo.
function clampCompanions(rawValue) {
    const max = window.__rsvpMaxCompanions ?? DEFAULT_MAX_COMPANIONS;
    const v = parseInt(rawValue, 10);
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(max, v));
}
function updateStepperState(input) {
    const max = window.__rsvpMaxCompanions ?? DEFAULT_MAX_COMPANIONS;
    const v = parseInt(input.value || '0', 10);
    const wrap = input.closest('.stepper');
    wrap.querySelector('[data-step="-1"]').disabled = v <= 0;
    wrap.querySelector('[data-step="1"]').disabled = v >= max;
}
function initSteppers() {
    document.querySelectorAll('.stepper-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            const next = clampCompanions((parseInt(input.value || '0', 10) + parseInt(btn.dataset.step, 10)).toString());
            input.value = next;
            updateStepperState(input);
            renderCompanionNames(input.id === 'pubCompanions' ? 'pub' : 'priv');
        });
    });
    // Defesa extra: se o campo (readonly) for editado manualmente via
    // devtools, reclampa e re-renderiza os nomes ao perder o foco.
    document.querySelectorAll('#pubCompanions, #privCompanions').forEach(input => {
        input.addEventListener('input', () => {
            input.value = clampCompanions(input.value);
            updateStepperState(input);
            renderCompanionNames(input.id === 'pubCompanions' ? 'pub' : 'priv');
        });
    });
}

// ═══════════════════════════════════════════════════════
//  COMPANION NAMES — um <input> por acompanhante, gerado/removido em
//  sincronia com o valor do stepper de quantidade acima. Preserva o que
//  já foi digitado quando a quantidade muda (ex.: 3→2 mantém os 2
//  primeiros nomes; 2→3 mantém os 2 e abre um 3º vazio).
// ═══════════════════════════════════════════════════════
function renderCompanionNames(scope) {
    const s = STRINGS[currentLang];
    const countInput = document.getElementById(scope === 'pub' ? 'pubCompanions' : 'privCompanions');
    const count = parseInt(countInput.value || '0', 10);
    const list = document.getElementById(scope === 'pub' ? 'pubCompanionNames' : 'privCompanionNames');
    const existingValues = [...list.querySelectorAll('input')].map(i => i.value);
    const existingTypes = [...list.querySelectorAll('select')].map(sel => sel.value);

    list.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const row = document.createElement('div');
        row.className = 'companion-row';

        const input = document.createElement('input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.maxLength = 120;
        input.placeholder = s.companionNamePlaceholder.replace('{n}', i + 1);
        input.value = existingValues[i] || '';
        row.appendChild(input);

        const select = document.createElement('select');
        const companionOpt = document.createElement('option');
        companionOpt.value = 'companion';
        companionOpt.textContent = s.companionTypeCompanion;
        const childOpt = document.createElement('option');
        childOpt.value = 'child';
        childOpt.textContent = s.companionTypeChild;
        select.appendChild(companionOpt);
        select.appendChild(childOpt);
        select.value = existingTypes[i] === 'child' ? 'child' : 'companion';
        row.appendChild(select);

        list.appendChild(row);
    }
}

function getCompanionNames(scope) {
    const list = document.getElementById(scope === 'pub' ? 'pubCompanionNames' : 'privCompanionNames');
    return [...list.querySelectorAll('input')].map(i => i.value.trim());
}

function getCompanionTypes(scope) {
    const list = document.getElementById(scope === 'pub' ? 'pubCompanionNames' : 'privCompanionNames');
    return [...list.querySelectorAll('select')].map(sel => sel.value);
}

// ═══════════════════════════════════════════════════════
//  TELEFONE (modo público) — só dígitos e caracteres de formatação
//  (espaço, parênteses, traço, +), igual ao validador nativo do app
//  (ver tfTelefoneTextControllerValidator em add_guest_model.dart/
//  edit_guest_model.dart). Filtra em tempo real (cola incluído, o
//  navegador já dispara 'input' pra paste) — isValidPhoneFormat() abaixo
//  é só um cinto-de-segurança pro submit, já que o input nunca deveria
//  conseguir chegar lá com caractere fora desse conjunto.
// ═══════════════════════════════════════════════════════
const MAX_PHONE_DIGITS = 15; // teto do E.164 (ITU-T) — nenhum telefone real passa disso
function truncatePhoneDigits(value) {
    let digits = 0;
    let cut = value.length;
    for (let i = 0; i < value.length; i++) {
        if (/\d/.test(value[i])) {
            digits++;
            if (digits > MAX_PHONE_DIGITS) { cut = i; break; }
        }
    }
    return value.slice(0, cut);
}
function initPhoneMasking() {
    const input = document.getElementById('pubPhone');
    input.addEventListener('input', () => {
        const cleaned = truncatePhoneDigits(input.value.replace(/[^0-9()+\-\s]/g, ''));
        if (cleaned === input.value) return;
        const diff = input.value.length - cleaned.length;
        const pos = Math.max(0, input.selectionStart - diff);
        input.value = cleaned;
        input.setSelectionRange(pos, pos);
    });
}
function isValidPhoneFormat(value) {
    return /^[0-9()+\-\s]+$/.test(value);
}
function phoneDigitCount(value) {
    return (value.match(/\d/g) || []).length;
}

// ═══════════════════════════════════════════════════════
//  PAÍS DO TELEFONE (modo público) — mesmo catálogo de DDIs de
//  custom_cloud_functions/rsvp.js (DIAL_CODES) e de
//  custom_code/functions/to_e164_phone.dart no app. Pré-selecionado com
//  rsvpDefaultCountry (ver resolveEvent em rsvp.js), detectado do
//  dispositivo de quem configurou o convite — o convidado pode trocar se
//  não for o país certo.
// ═══════════════════════════════════════════════════════
const DIAL_CODES = {
    BR: '55', US: '1', GB: '44', CA: '1', AU: '61', NZ: '64',
    AO: '244', MZ: '258', CV: '238', SN: '221', CM: '237', ST: '239', MO: '853',
    ZA: '27', NG: '234', KE: '254', GH: '233',
    SG: '65', IN: '91', HK: '852', JP: '81', CN: '86', AE: '971', CH: '41',
    PT: '351', GW: '245', GQ: '240', TL: '670', IE: '353', JM: '1876', ZW: '263',
};

function countryFlagEmoji(id) {
    return String.fromCodePoint(...[...id.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}

function initPhoneCountrySelect() {
    const select = document.getElementById('pubPhoneCountry');
    select.innerHTML = '';
    Object.keys(DIAL_CODES).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${countryFlagEmoji(id)} +${DIAL_CODES[id]}`;
        select.appendChild(option);
    });
}

function isValidCountryId(value) {
    return Object.prototype.hasOwnProperty.call(DIAL_CODES, String(value || '').toUpperCase());
}

// ═══════════════════════════════════════════════════════
//  PHONE VERIFICATION — four-digit code entry
// ═══════════════════════════════════════════════════════
function initOtpBoxes() {
    const boxes = [...document.querySelectorAll('.otp-box')];
    const hidden = document.getElementById('phoneLast4');
    const sync = () => { hidden.value = boxes.map(b => b.value).join(''); };

    boxes.forEach((box, i) => {
        box.addEventListener('input', () => {
            box.value = box.value.replace(/\D/g, '').slice(-1);
            box.classList.remove('invalid');
            if (box.value && boxes[i + 1]) boxes[i + 1].focus();
            sync();
        });
        box.addEventListener('keydown', e => {
            if (e.key === 'Backspace' && !box.value && boxes[i - 1]) boxes[i - 1].focus();
        });
        box.addEventListener('paste', e => {
            const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            if (!text) return;
            e.preventDefault();
            text.slice(0, 4).split('').forEach((d, idx) => { if (boxes[idx]) boxes[idx].value = d; });
            sync();
            boxes[Math.min(text.length, 4) - 1]?.focus();
        });
    });
}
function resetOtpBoxes(markAsInvalid) {
    const boxes = [...document.querySelectorAll('.otp-box')];
    boxes.forEach(b => { b.value = ''; if (markAsInvalid) b.classList.add('invalid'); });
    document.getElementById('phoneLast4').value = '';
    if (markAsInvalid) document.querySelector('.otp-group').classList.add('shake');
    boxes[0]?.focus();
}

// ═══════════════════════════════════════════════════════
//  PRESENCE TOGGLE
// ═══════════════════════════════════════════════════════
const presenceState = { pub: null, priv: null };

function setPresence(scope, attending) {
    presenceState[scope] = attending;
    const yesBtn = document.getElementById(scope === 'pub' ? 'pubYes' : 'privYes');
    const noBtn  = document.getElementById(scope === 'pub' ? 'pubNo'  : 'privNo');
    yesBtn.classList.toggle('selected-yes', attending === true);
    noBtn.classList.toggle('selected-no', attending === false);

    const companionsField = document.getElementById(scope === 'pub' ? 'pubCompanionsField' : 'privCompanionsField');
    if (companionsField) {
        companionsField.classList.toggle('show', attending === true && window.__rsvpAllowCompanions === true);
    }
}

// Chamado pelo <script type="module"> (App Check) quando o token não
// pôde ser obtido — não impede o RSVP, só avisa. Idempotente: seguro
// chamar de novo em toda tentativa de fetch enquanto continuar bloqueado.
function showAppCheckWarning() {
    document.getElementById('appCheckWarningText').textContent = STRINGS[currentLang].appCheckWarning;
    document.getElementById('appCheckWarning').classList.add('show');
}

// ═══════════════════════════════════════════════════════
//  MODO PÚBLICO
// ═══════════════════════════════════════════════════════
function showPublicError(msg) {
    document.getElementById('publicErrorText').textContent = msg;
    document.getElementById('publicError').classList.add('show');
}
function hidePublicError() { document.getElementById('publicError').classList.remove('show'); }

async function submitPublic() {
    hidePublicError();
    const s = STRINGS[currentLang];
    const name = document.getElementById('pubName').value.trim();
    const phone = document.getElementById('pubPhone').value.trim();
    const attending = presenceState.pub;

    if (!name) { markInvalid('pubName'); return showPublicError(s.errMissingName); }
    if (!phone) { markInvalid('pubPhone'); return showPublicError(s.errMissingPhone); }
    if (!isValidPhoneFormat(phone) || phoneDigitCount(phone) < 8 || phoneDigitCount(phone) > 15) {
        markInvalid('pubPhone');
        return showPublicError(s.errPhoneInvalid);
    }
    if (attending === null) { pulseAttention('pubPresenceToggle'); return showPublicError(s.errMissingPresence); }

    const btn = document.getElementById('pubSubmitBtn');
    btn.disabled = true;
    document.getElementById('pubSpinner').style.display = 'block';

    try {
        const companions = window.__rsvpAllowCompanions
            ? clampCompanions(document.getElementById('pubCompanions').value)
            : 0;
        const companionNames = window.__rsvpAllowCompanions ? getCompanionNames('pub') : [];
        const companionTypes = window.__rsvpAllowCompanions ? getCompanionTypes('pub') : [];
        const phoneCountry = document.getElementById('pubPhoneCountry').value;
        const result = await callRsvpApi({
            action: 'submitPublic',
            name,
            phone,
            phoneCountry,
            confirmationStatus: attending ? 1 : 0,
            menu: parseInt(document.getElementById('pubMenu').value, 10),
            companions,
            companionNames,
            companionTypes,
        });
        saveRsvpCompletion(name, attending, result.pendingApproval === true);
        window.__rsvpEventId = result.eventId || window.__rsvpEventId || null;
        showSuccess(attending, result.pendingApproval === true);
    } catch (e) {
        showPublicError(s.errGeneric);
        btn.disabled = false;
        document.getElementById('pubSpinner').style.display = 'none';
    }
}

// ═══════════════════════════════════════════════════════
//  MODO PRIVADO
// ═══════════════════════════════════════════════════════
let confirmedName = '';

function showSearchError(msg) {
    document.getElementById('searchErrorText').textContent = msg;
    document.getElementById('searchError').classList.add('show');
}
function hideSearchError() { document.getElementById('searchError').classList.remove('show'); }

async function lookupGuest() {
    hideSearchError();
    const s = STRINGS[currentLang];
    const name = document.getElementById('searchName').value.trim();
    if (!name) { markInvalid('searchName'); return showSearchError(s.errMissingName); }

    const btn = document.getElementById('searchBtn');
    btn.disabled = true;
    document.getElementById('searchSpinner').style.display = 'block';

    try {
        const result = await callRsvpApi({ action: 'lookup', name });
        btn.disabled = false;
        document.getElementById('searchSpinner').style.display = 'none';

        if (!result.found) {
            return showSearchError(s.errNotFound);
        }
        confirmedName = name;
        confirmedGuestFirstName = name.trim().split(/\s+/)[0] || name;
        document.getElementById('privateConfirmSubtitle').textContent = s.privateConfirmSubtitleFound;
        renderPrivateGreeting();
        showState('statePrivateConfirm');
    } catch (e) {
        btn.disabled = false;
        document.getElementById('searchSpinner').style.display = 'none';
        showSearchError(s.errGeneric);
    }
}

function showConfirmError(msg) {
    document.getElementById('confirmErrorText').textContent = msg;
    document.getElementById('confirmError').classList.add('show');
}
function hideConfirmError() { document.getElementById('confirmError').classList.remove('show'); }

async function submitPrivate() {
    hideConfirmError();
    const s = STRINGS[currentLang];
    const phoneLast4 = document.getElementById('phoneLast4').value.trim();
    const attending = presenceState.priv;

    if (phoneLast4.length !== 4) {
        document.querySelector('.otp-group').classList.add('shake');
        document.querySelectorAll('.otp-box')[0]?.focus();
        return showConfirmError(s.errPhoneMismatch);
    }
    if (attending === null) { pulseAttention('privPresenceToggle'); return showConfirmError(s.errMissingPresence); }

    const btn = document.getElementById('confirmBtn');
    btn.disabled = true;
    document.getElementById('confirmSpinner').style.display = 'block';

    try {
        const companions = window.__rsvpAllowCompanions
            ? clampCompanions(document.getElementById('privCompanions').value)
            : 0;
        const companionNames = window.__rsvpAllowCompanions ? getCompanionNames('priv') : [];
        const companionTypes = window.__rsvpAllowCompanions ? getCompanionTypes('priv') : [];
        const result = await callRsvpApi({
            action: 'verifyAndSubmitPrivate',
            name: confirmedName,
            phoneLast4,
            confirmationStatus: attending ? 1 : 0,
            menu: parseInt(document.getElementById('privMenu').value, 10),
            companions,
            companionNames,
            companionTypes,
        });
        window.__rsvpEventId = result.eventId || window.__rsvpEventId || null;
        showSuccess(attending, false);
    } catch (e) {
        btn.disabled = false;
        document.getElementById('confirmSpinner').style.display = 'none';
        if (e.code === 'not_found') {
            resetOtpBoxes(true);
            showConfirmError(s.errPhoneMismatch);
        } else {
            showConfirmError(s.errGeneric);
        }
    }
}

// ═══════════════════════════════════════════════════════
//  SUCCESS
// ═══════════════════════════════════════════════════════
function showSuccess(attending, pendingApproval) {
    const s = STRINGS[currentLang];
    const icon = document.getElementById('successIcon');
    if (pendingApproval) {
        icon.className = 'seal seal-pending';
        icon.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
        document.getElementById('successTitle').textContent = s.successPendingTitle;
        document.getElementById('successSub').textContent = s.successPendingSub;
    } else if (attending) {
        icon.className = 'seal seal-yes';
        icon.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;
        document.getElementById('successTitle').textContent = s.successYesTitle;
        // Mensagem de agradecimento personalizada (rsvpThankYouMessage) —
        // só sobrescreve o texto padrão quando o organizador confirmou
        // presença E configurou uma mensagem própria.
        document.getElementById('successSub').textContent =
            currentThankYouMessage || s.successYesSub;
    } else {
        icon.className = 'seal seal-no';
        icon.innerHTML = `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        document.getElementById('successTitle').textContent = s.successNoTitle;
        document.getElementById('successSub').textContent = s.successNoSub;
    }

    const calendarBtn = document.getElementById('btnAddCalendar');
    calendarBtn.hidden = !(attending && !pendingApproval && currentEventDate);

    document.getElementById('btnAddAnother').hidden = window.__rsvpMode !== 'publico';

    // Loop do convidado (H0/D): sem app publicado na App Store ainda, então
    // sem CTA em iOS. Ver playStoreUrl()/updateAppLinks() acima — o mesmo
    // eventId (window.__rsvpEventId, setado logo antes de chamar
    // showSuccess) alimenta esse botão e o link do rodapé.
    const referralBtn = document.getElementById('btnCreateOwnEvent');
    referralBtn.hidden = isIOSDevice();
    referralBtn.href = playStoreUrl(window.__rsvpEventId);
    updateAppLinks();

    showState('stateSuccess');
}

// Reabre o formulário público em branco sem sair da página — pro caso de
// alguém confirmando por mais de uma pessoa no mesmo aparelho (ex.: pela
// família toda). A confirmação anterior fica salva; só a mais recente é
// usada como "já respondeu" no próximo carregamento (ver loadRsvpCompletion).
function startAnotherPublicRsvp() {
    hidePublicError();
    document.getElementById('pubName').value = '';
    document.getElementById('pubPhone').value = '';
    document.getElementById('pubCompanions').value = '0';
    document.getElementById('pubCompanionNames').innerHTML = '';
    document.getElementById('pubMenu').value = '1';
    setPresence('pub', null);
    document.getElementById('pubSubmitBtn').disabled = false;
    document.getElementById('pubSpinner').style.display = 'none';
    showState('statePublicForm');
    document.getElementById('pubName').focus();
}

// ═══════════════════════════════════════════════════════
//  INIT — resolve o evento pelo token e escolhe o modo certo
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    applyLang(detectLang());
    initSteppers();
    initOtpBoxes();
    initPhoneMasking();
    initPhoneCountrySelect();
    updateAppLinks();

    if (!window.__rsvpToken) {
        showState('stateInvalid');
        return;
    }

    try {
        const event = await callRsvpApi({ action: 'resolveEvent' });
        if (!event.rsvpEnabled) {
            showState('stateInvalid');
            return;
        }
        window.__rsvpAllowCompanions = event.rsvpAllowCompanions === true;
        window.__rsvpMaxCompanions = typeof event.rsvpMaxCompanions === 'number' && event.rsvpMaxCompanions > 0
            ? event.rsvpMaxCompanions : DEFAULT_MAX_COMPANIONS;
        document.getElementById('pubPhoneCountry').value =
            isValidCountryId(event.rsvpDefaultCountry) ? event.rsvpDefaultCountry.toUpperCase() : 'BR';
        currentEventTitle = event.eventTitle || null;
        currentEventDate = event.eventDate || null;
        currentThankYouMessage = event.rsvpThankYouMessage || null;

        // Aba do navegador com o nome do evento em vez do genérico
        // "Planne - RSVP" — só depois de resolver o evento (antes disso
        // não temos o nome ainda; o <title> estático segue como fallback).
        if (currentEventTitle) {
            document.title = 'Planne - ' + currentEventTitle;
        }

        // Idioma É o do evento (settings.language do organizador) — fixo
        // pra todo mundo que abre o link, sem toggle manual. Fallback pro
        // idioma do navegador só se o backend ainda não mandar `language`
        // (compatibilidade enquanto o deploy da Cloud Function não sobe).
        applyLang(event.language === 'pt' || event.language === 'en' ? event.language : detectLang());

        // Estilo visual (rsvpTemplateId) — só reskin (fonte/cor/decoração)
        // em cima desta MESMA estrutura de página; nenhum estilo muda a
        // ordem das seções. 'foto-editorial' é o default (também cobre
        // valores do sistema antigo de 6 templates, que não existem mais).
        const validStyles = ['foto-editorial', 'ilustrado', 'gravado'];
        document.documentElement.dataset.inviteStyle =
            validStyles.includes(event.rsvpTemplateId) ? event.rsvpTemplateId : 'foto-editorial';

        // Cor predominante escolhida pelo organizador (rsvpAccentColor) —
        // sobrescreve a cor nativa do estilo acima, em QUALQUER um dos 3
        // estilos. Ausente/inválida = mantém a cor nativa do estilo.
        applyAccentColor(event.rsvpAccentColor);

        // Par de fonte curado (rsvpFontPairId) — mesma regra: sobrescreve
        // a fonte nativa do estilo em cima de qualquer um dos 3, ausente/
        // desconhecido mantém a fonte nativa.
        applyFontPairOverride(event.rsvpFontPairId);

        renderCoverHero(event);
        renderEventExtras(event);
        renderMapSection(event);
        renderOrganizerMessage(event);
        startCountdown();

        window.__rsvpMode = event.rsvpMode === 'privado' ? 'privado' : 'publico';

        // Já respondeu nesse aparelho (modo público)? Pula direto pra tela
        // de sucesso em vez de mostrar o formulário em branco de novo —
        // ver comentário em cima de rsvpStorageKey().
        const cachedCompletion = window.__rsvpMode === 'publico' ? loadRsvpCompletion() : null;
        if (cachedCompletion) {
            showSuccess(cachedCompletion.attending, cachedCompletion.pendingApproval === true);
        } else {
            const targetState = window.__rsvpMode === 'privado' ? 'statePrivateSearch' : 'statePublicForm';
            showState(targetState);
        }
    } catch (e) {
        showState('stateInvalid');
    }
});

document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (document.getElementById('statePublicForm').classList.contains('active')) submitPublic();
    else if (document.getElementById('statePrivateSearch').classList.contains('active')) lookupGuest();
    else if (document.getElementById('statePrivateConfirm').classList.contains('active')) submitPrivate();
});
