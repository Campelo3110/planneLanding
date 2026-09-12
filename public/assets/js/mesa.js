// ─── CONFIG ───────────────────────────────────────────
        // Endpoint da Cloud Function `lookupTable` (região
        // southamerica-east1 — mesma região de todas as outras functions
        // deste projeto, ver rsvp.html pro histórico do bug de região
        // errada que isso já causou uma vez).
        window.__SEATING_ENDPOINT = "https://southamerica-east1-planne-692f7.cloudfunctions.net/lookupTable";
        // ────────────────────────────────────────────────────

        const __p = new URLSearchParams(window.location.search);
        window.__seatingToken = __p.get("token");

function showState(id) {
    ['statePicker', 'stateLoading', 'stateFound', 'stateNoTable', 'stateNotFound', 'stateError']
        .forEach((s) => document.getElementById(s).classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

const FATAL_MESSAGES = {
    missing_token: 'Este link está incompleto. Peça pra quem organiza o evento mandar de novo.',
    invalid_token: 'Este link expirou ou não existe mais. Peça pra quem organiza o evento mandar um novo.',
};

function showFatalError(code) {
    document.getElementById('fatalErrorSub').textContent =
        FATAL_MESSAGES[code] || 'Algo deu errado ao abrir o mapa de mesas. Tente novamente em alguns minutos.';
    showState('stateError');
}

const LOOKUP_ERROR_MESSAGES = {
    invalid_token: 'Este link expirou. Peça um link novo pra quem organiza o evento.',
    premium_required: 'A busca de mesa por QR não está mais disponível para este evento. Fale com quem organiza.',
    rate_limited: 'Muitas tentativas em pouco tempo. Espere alguns minutos e tente de novo.',
    appcheck_failed: 'Não foi possível confirmar que este é um acesso válido. Recarregue a página.',
};

async function lookupTable(name) {
    const appCheckToken = await window.__getAppCheckToken();
    const headers = { 'Content-Type': 'application/json' };
    if (appCheckToken) {
        headers['X-Firebase-AppCheck'] = appCheckToken;
    }
    const res = await fetch(window.__SEATING_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({ publicToken: window.__seatingToken, name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data.error || 'request_failed');
        err.code = data.error;
        throw err;
    }
    return data;
}

const pickerError = document.getElementById('pickerError');
const pickerErrorText = document.getElementById('pickerErrorText');

function setPickerError(message) {
    if (!message) {
        pickerError.classList.remove('show');
        return;
    }
    pickerErrorText.textContent = message;
    pickerError.classList.add('show');
}

document.getElementById('lookupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    if (!name) return;

    setPickerError(null);
    showState('stateLoading');

    try {
        const data = await lookupTable(name);
        if (!data.found) {
            showState('stateNotFound');
        } else if (!data.tableName) {
            showState('stateNoTable');
        } else {
            document.getElementById('tableNameValue').textContent = data.tableName;
            showState('stateFound');
        }
    } catch (e) {
        showState('statePicker');
        setPickerError(LOOKUP_ERROR_MESSAGES[e.code] || 'Não foi possível buscar sua mesa agora. Tente de novo.');
    }
});

['searchAgainBtn1', 'searchAgainBtn2', 'searchAgainBtn3'].forEach((id) => {
    document.getElementById(id).addEventListener('click', () => {
        document.getElementById('guestName').value = '';
        setPickerError(null);
        showState('statePicker');
    });
});

// Loop do convidado (H0/D): sem app publicado na App Store ainda, então sem
// link de "baixe o app" em iOS (evita apontar pra uma loja onde ele não existe).
const isIOSDevice = () => /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
document.getElementById('footerAppLinkWrap').hidden = isIOSDevice();

// ═══════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════
if (!window.__seatingToken) {
    showFatalError('missing_token');
}
