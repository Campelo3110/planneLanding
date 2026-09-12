// ═══════════════════════════════════════════════════════
//  i18n
// ═══════════════════════════════════════════════════════
const STRINGS = {
    en: {
        loading:   "Loading…",
        verifying: "Verifying your email…",
        recovering:"Restoring your email…",
        // reset form
        resetTitle:    "New password",
        resetSubtitle: "Choose a strong password to keep your account secure.",
        labelNew:        "New password",
        placeholderNew:  "At least 8 characters",
        labelConfirm:    "Confirm password",
        placeholderConfirm:"Repeat the password",
        btnReset:    "Reset password",
        btnUpdating: "Updating…",
        secure:      "secure connection",
        // reset success
        resetSuccessTitle:"Password updated!",
        resetSuccessSub:  "Your password has been changed.\nOpen the app and log in.",
        // verify email
        verifySuccessTitle:"Email verified!",
        verifySuccessSub:  "Your account is confirmed.\nYou can now use Planne.",
        verifyErrorTitle:  "Verification failed",
        verifyErrorSub:    "This link is invalid or has expired.\nRequest a new one through the app.",
        // recover email
        recoverSuccessTitle:"Email restored",
        recoverSuccessSub:  "Your previous email has been restored.\nIf you didn't request this, contact support.",
        recoverErrorTitle:  "Could not restore",
        recoverErrorSub:    "This link is invalid or has expired.\nPlease contact support.",
        // invalid fallback
        invalidTitle:"Link expired",
        invalidSubReset:  "This password reset link is no longer valid.\nRequest a new one through the app.",
        invalidSubVerify: "This email verification link is no longer valid.\nRequest a new one through the app.",
        invalidSubGeneric:"This link is invalid or has expired.",
        // errors
        errShort:   "Password must be at least 8 characters.",
        errWeak:    "Choose a stronger password (uppercase, numbers or symbols).",
        errMatch:   "Passwords do not match.",
        errExpired: "This link has expired. Request a new one.",
        errInvalid: "Invalid link. Please request a new one.",
        errWeakFb:  "Password too weak. Try a stronger one.",
        errDisabled:"This account has been disabled.",
        errNotFound:"Account not found.",
        errGeneric: "Something went wrong. Please try again.",
        errCooldown:"Too many attempts. Wait a moment.",
        // strength
        strTooShort:"Too short", strWeak:"Weak", strGood:"Good", strStrong:"Strong",
        // nav
        backHome:"Back to Planne",
        privacy: "Privacy policy",
        terms:   "Terms of use",
    },
    pt: {
        loading:   "Carregando…",
        verifying: "Verificando seu email…",
        recovering:"Restaurando seu email…",
        resetTitle:    "Nova senha",
        resetSubtitle: "Escolha uma senha forte para manter sua conta segura.",
        labelNew:        "Nova senha",
        placeholderNew:  "Mínimo 8 caracteres",
        labelConfirm:    "Confirmar senha",
        placeholderConfirm:"Repita a senha",
        btnReset:    "Redefinir senha",
        btnUpdating: "Atualizando…",
        secure:      "conexão segura",
        resetSuccessTitle:"Senha atualizada!",
        resetSuccessSub:  "Sua senha foi alterada com sucesso.\nAbra o app e faça login.",
        verifySuccessTitle:"Email verificado!",
        verifySuccessSub:  "Sua conta está confirmada.\nVocê já pode usar a Planne.",
        verifyErrorTitle:  "Verificação falhou",
        verifyErrorSub:    "Este link é inválido ou expirou.\nSolicite um novo pelo app.",
        recoverSuccessTitle:"Email restaurado",
        recoverSuccessSub:  "Seu email anterior foi restaurado.\nSe não foi você, entre em contato com o suporte.",
        recoverErrorTitle:  "Não foi possível restaurar",
        recoverErrorSub:    "Este link é inválido ou expirou.\nEntre em contato com o suporte.",
        invalidTitle:"Link expirado",
        invalidSubReset:  "Este link de redefinição não é mais válido.\nSolicite um novo pelo app.",
        invalidSubVerify: "Este link de verificação não é mais válido.\nSolicite um novo pelo app.",
        invalidSubGeneric:"Este link é inválido ou expirou.",
        errShort:   "A senha deve ter pelo menos 8 caracteres.",
        errWeak:    "Escolha uma senha mais forte (maiúsculas, números ou símbolos).",
        errMatch:   "As senhas não coincidem.",
        errExpired: "Este link expirou. Solicite um novo.",
        errInvalid: "Link inválido. Solicite um novo.",
        errWeakFb:  "Senha muito fraca. Tente uma mais forte.",
        errDisabled:"Esta conta foi desativada.",
        errNotFound:"Conta não encontrada.",
        errGeneric: "Algo deu errado. Tente novamente.",
        errCooldown:"Muitas tentativas. Aguarde um momento.",
        strTooShort:"Muito curta", strWeak:"Fraca", strGood:"Boa", strStrong:"Forte",
        backHome:"Voltar para a Planne",
        privacy: "Política de privacidade",
        terms:   "Termos de uso",
    }
};

let currentLang = 'en';

function detectLang() {
    // 1. preferência salva pelo usuário no site
    const savedValue = localStorage.getItem('planne-language') || localStorage.getItem('planne-lang');
    const saved = savedValue?.startsWith('pt') ? 'pt' : savedValue;
    if (saved === 'pt' || saved === 'en') return saved;
    // 2. lang enviado pelo Firebase no link (?lang=pt)
    const fbLang = (window.__planneAuth || {}).lang || '';
    if (fbLang.startsWith('pt')) return 'pt';
    // 3. idioma do browser
    return (navigator.language || '').startsWith('pt') ? 'pt' : 'en';
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

    const btn = document.getElementById('submitBtn');
    if (btn && !btn.disabled) document.getElementById('btnText').textContent = s.btnReset;

    document.getElementById('btn-pt').classList.toggle('active', lang === 'pt');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');

    evalStrength(document.getElementById('newPassword')?.value || '');
}

function setLang(lang) {
    localStorage.setItem('planne-lang', lang);
    localStorage.setItem('planne-language', lang === 'pt' ? 'pt-BR' : 'en');
    applyLang(lang);
}

// ═══════════════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════════════
function initTheme() {
    const saved = localStorage.getItem('planne-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
        setMoonIcon();
    }
    updateThemeColor();
}
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('planne-theme', isDark ? 'dark' : 'light');
    isDark ? setMoonIcon() : setSunIcon();
    updateThemeColor();
}
function updateThemeColor() {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.classList.contains('dark') ? '#101715' : '#F8FAFC');
}
function setSunIcon() {
    document.getElementById('theme-icon').innerHTML =
        `<circle cx="12" cy="12" r="5"/>
         <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
         <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
         <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
         <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
}
function setMoonIcon() {
    document.getElementById('theme-icon').innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
}

// ═══════════════════════════════════════════════════════
//  BACK TO APP (deep link, fallback to Play Store)
// ═══════════════════════════════════════════════════════
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.planne.planne';
function handleBackToApp() {
    const fallback = setTimeout(() => {
        if (document.visibilityState === 'visible') window.location.href = PLAY_STORE_URL;
    }, 1500);
    const cancel = () => clearTimeout(fallback);
    document.addEventListener('visibilitychange', cancel, { once: true });
    window.addEventListener('pagehide', cancel, { once: true });
}

// ═══════════════════════════════════════════════════════
//  STATE SWITCHER
// ═══════════════════════════════════════════════════════
function showState(id) {
    ['stateLoading','stateReset','stateVerify','stateRecover','stateResetSuccess','stateInvalid']
        .forEach(s => {
            const el = document.getElementById(s);
            el.classList.remove('active');
        });
    document.getElementById(id).classList.add('active');
}

// ═══════════════════════════════════════════════════════
//  PASSWORD VISIBILITY
// ═══════════════════════════════════════════════════════
function togglePw(id, btn) {
    const input = document.getElementById(id);
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.innerHTML = isText
        ? `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
        : `<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

// ═══════════════════════════════════════════════════════
//  STRENGTH METER
// ═══════════════════════════════════════════════════════
const SC = ['#ef4444','#f97316','#eab308','#10b981'];

function getScore(v) {
    let s = 0;
    if (v.length >= 8)          s++;
    if (/[A-Z]/.test(v))        s++;
    if (/[0-9]/.test(v))        s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
}
function evalStrength(val) {
    const score = getScore(val);
    const s = STRINGS[currentLang];
    ['s1','s2','s3','s4'].forEach((id,i) => {
        document.getElementById(id).style.background = i < score ? SC[score-1] : 'var(--border)';
    });
    const lbl = document.getElementById('strengthLabel');
    const labels = [s.strTooShort, s.strWeak, s.strGood, s.strStrong];
    if (!val.length) { lbl.textContent=''; return; }
    lbl.textContent  = labels[score-1] || labels[0];
    lbl.style.color  = SC[score-1] || SC[0];
}

// ═══════════════════════════════════════════════════════
//  ERROR MSG
// ═══════════════════════════════════════════════════════
function showError(msg) {
    const el = document.getElementById('resetError');
    document.getElementById('resetErrorText').textContent = msg;
    el.classList.add('show');
}
function hideError() { document.getElementById('resetError').classList.remove('show'); }

// ═══════════════════════════════════════════════════════
//  COOLDOWN
// ═══════════════════════════════════════════════════════
let failCount  = 0;
let cooldownEnd = 0;
const COOLDOWNS = [0, 0, 5, 15, 30];

function startCooldown(secs) {
    const btn  = document.getElementById('submitBtn');
    const wrap = document.getElementById('cooldownWrap');
    const bar  = document.getElementById('cooldownBar');
    btn.disabled = true;
    wrap.style.display = 'block';
    cooldownEnd = Date.now() + secs * 1000;
    function tick() {
        const left = cooldownEnd - Date.now();
        if (left <= 0) {
            btn.disabled = false;
            wrap.style.display = 'none';
            bar.style.width = '100%';
            document.getElementById('btnText').textContent = STRINGS[currentLang].btnReset;
            return;
        }
        bar.style.width = (left / (secs * 1000) * 100) + '%';
        setTimeout(tick, 80);
    }
    tick();
}

// ═══════════════════════════════════════════════════════
//  HANDLE RESET PASSWORD
// ═══════════════════════════════════════════════════════
async function handleReset() {
    if (Date.now() < cooldownEnd) return;
    hideError();

    const s    = STRINGS[currentLang];
    const pw   = document.getElementById('newPassword').value;
    const conf = document.getElementById('confirmPassword').value;
    const np   = document.getElementById('newPassword');
    const cp   = document.getElementById('confirmPassword');

    np.classList.remove('invalid');
    cp.classList.remove('invalid');

    if (pw.length < 8)      { np.classList.add('invalid'); showError(s.errShort); return; }
    if (getScore(pw) < 2)   { np.classList.add('invalid'); showError(s.errWeak);  return; }
    if (pw !== conf)         { cp.classList.add('invalid'); showError(s.errMatch); return; }

    const { auth, confirmPasswordReset, oobCode } = window.__planneAuth || {};
    if (!oobCode) { showError(s.errInvalid); return; }

    // loading
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    document.getElementById('spinner').style.display  = 'block';
    document.getElementById('btnText').textContent    = s.btnUpdating;
    document.getElementById('btnIcon').style.display  = 'none';

    try {
        await confirmPasswordReset(auth, oobCode, pw);
        failCount = 0;
        history.replaceState(null, '', window.location.pathname);
        showState('stateResetSuccess');
    } catch(err) {
        failCount++;
        const secs = COOLDOWNS[Math.min(failCount, COOLDOWNS.length-1)];
        const map = {
            'auth/expired-action-code': s.errExpired,
            'auth/invalid-action-code': s.errInvalid,
            'auth/weak-password':       s.errWeakFb,
            'auth/user-disabled':       s.errDisabled,
            'auth/user-not-found':      s.errNotFound,
        };
        const msg = map[err.code] || s.errGeneric;
        showError(secs > 0 ? `${msg} ${s.errCooldown}` : msg);
        if (secs > 0) startCooldown(secs);
        else {
            btn.disabled = false;
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('btnText').textContent   = s.btnReset;
            document.getElementById('btnIcon').style.display = 'block';
        }
    }
}

// ═══════════════════════════════════════════════════════
//  HANDLE VERIFY EMAIL
// ═══════════════════════════════════════════════════════
async function handleVerifyEmail(auth, applyActionCode, oobCode) {
    showState('stateVerify');
    try {
        await applyActionCode(auth, oobCode);
        history.replaceState(null, '', window.location.pathname);
        document.getElementById('verifyLoading').style.display = 'none';
        const s = STRINGS[currentLang];
        document.getElementById('verifyTitle').textContent = s.verifySuccessTitle;
        document.getElementById('verifySub').textContent   = s.verifySuccessSub;
        document.getElementById('verifyIcon').className    = 'state-icon icon-success';
        document.getElementById('verifyIcon').innerHTML    = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;
        document.getElementById('verifyResult').style.display = 'flex';
    } catch {
        document.getElementById('verifyLoading').style.display = 'none';
        const s = STRINGS[currentLang];
        document.getElementById('verifyTitle').textContent = s.verifyErrorTitle;
        document.getElementById('verifySub').textContent   = s.verifyErrorSub;
        document.getElementById('verifyIcon').className    = 'state-icon icon-error';
        document.getElementById('verifyIcon').innerHTML    = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        document.getElementById('verifyResult').style.display = 'flex';
    }
}

// ═══════════════════════════════════════════════════════
//  HANDLE RECOVER EMAIL
// ═══════════════════════════════════════════════════════
async function handleRecoverEmail(auth, applyActionCode, oobCode) {
    showState('stateRecover');
    try {
        await applyActionCode(auth, oobCode);
        history.replaceState(null, '', window.location.pathname);
        document.getElementById('recoverLoading').style.display = 'none';
        const s = STRINGS[currentLang];
        document.getElementById('recoverTitle').textContent = s.recoverSuccessTitle;
        document.getElementById('recoverSub').textContent   = s.recoverSuccessSub;
        document.getElementById('recoverIcon').className    = 'state-icon icon-warning';
        document.getElementById('recoverResult').style.display = 'flex';
    } catch {
        document.getElementById('recoverLoading').style.display = 'none';
        const s = STRINGS[currentLang];
        document.getElementById('recoverTitle').textContent = s.recoverErrorTitle;
        document.getElementById('recoverSub').textContent   = s.recoverErrorSub;
        document.getElementById('recoverIcon').className    = 'state-icon icon-error';
        document.getElementById('recoverIcon').innerHTML    = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        document.getElementById('recoverResult').style.display = 'flex';
    }
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    applyLang(detectLang());

    // wait for Firebase module
    let attempts = 0;
    while (!window.__planneAuth && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    const pa = window.__planneAuth;
    if (!pa || !pa.oobCode || !pa.mode) {
        document.getElementById('invalidSub').textContent = STRINGS[currentLang].invalidSubGeneric;
        showState('stateInvalid');
        return;
    }

    const { auth, verifyPasswordResetCode, applyActionCode, confirmPasswordReset, mode, oobCode } = pa;

    if (mode === 'resetPassword') {
        try {
            await verifyPasswordResetCode(auth, oobCode);
            document.getElementById('btnText').textContent = STRINGS[currentLang].btnReset;
            showState('stateReset');
        } catch {
            document.getElementById('invalidSub').textContent = STRINGS[currentLang].invalidSubReset;
            showState('stateInvalid');
        }
    } else if (mode === 'verifyEmail') {
        await handleVerifyEmail(auth, applyActionCode, oobCode);
    } else if (mode === 'recoverEmail') {
        await handleRecoverEmail(auth, applyActionCode, oobCode);
    } else {
        document.getElementById('invalidSub').textContent = STRINGS[currentLang].invalidSubGeneric;
        showState('stateInvalid');
    }
});

document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('stateReset').classList.contains('active')) {
        handleReset();
    }
});
