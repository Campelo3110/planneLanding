// ─── CONFIG ───────────────────────────────────────────
        // Endpoint da Cloud Function `uploadEventPhoto` (região
        // southamerica-east1 — mesma região de todas as outras functions
        // deste projeto, ver rsvp.html pro histórico do bug de região
        // errada que isso já causou uma vez).
        window.__GALLERY_ENDPOINT = "https://southamerica-east1-planne-692f7.cloudfunctions.net/uploadEventPhoto";
        // ────────────────────────────────────────────────────

        const __p = new URLSearchParams(window.location.search);
        window.__galleryToken = __p.get("token");

// ═══════════════════════════════════════════════════════
//  STATE SWITCHER — mesmo padrão de auth-action.html
// ═══════════════════════════════════════════════════════
function showState(id) {
    ['stateLoading', 'statePicker', 'stateUploading', 'stateSuccess', 'stateError']
        .forEach((s) => document.getElementById(s).classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ═══════════════════════════════════════════════════════
//  ERRO FATAL — token ausente ou algo que não tem como
//  seguir sem recarregar a página com um link novo.
// ═══════════════════════════════════════════════════════
const FATAL_MESSAGES = {
    missing_token: 'Este link está incompleto. Peça pra quem organiza o evento mandar de novo.',
    invalid_token: 'Este link expirou ou não existe mais. Peça pra quem organiza o evento mandar um novo.',
    gallery_disabled: 'O álbum deste evento não está ativo no momento. Fale com quem organiza.',
};

function showFatalError(code) {
    document.getElementById('fatalErrorSub').textContent =
        FATAL_MESSAGES[code] || 'Algo deu errado ao abrir o álbum. Tente novamente em alguns minutos.';
    showState('stateError');
}

// ═══════════════════════════════════════════════════════
//  COMPRESSÃO CLIENT-SIDE — via <canvas>, sempre reduz pra
//  JPEG. Sem isso, uma foto de celular moderna facilmente
//  passa do limite de payload da Cloud Function (onRequest
//  aceita ~10MB, e base64 já adiciona ~33% de overhead em
//  cima do binário).
// ═══════════════════════════════════════════════════════
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let { width, height } = img;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                const scale = MAX_DIMENSION / Math.max(width, height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('compress_failed'));
                    resolve(blob);
                },
                'image/jpeg',
                JPEG_QUALITY,
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('decode_failed'));
        };
        img.src = objectUrl;
    });
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = () => reject(new Error('read_failed'));
        reader.readAsDataURL(blob);
    });
}

// ═══════════════════════════════════════════════════════
//  API
// ═══════════════════════════════════════════════════════
async function uploadPhoto({ imageBase64, contentType, uploaderName }) {
    const appCheckToken = await window.__getAppCheckToken();
    const headers = { 'Content-Type': 'application/json' };
    if (appCheckToken) {
        headers['X-Firebase-AppCheck'] = appCheckToken;
    }
    const res = await fetch(window.__GALLERY_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            publicToken: window.__galleryToken,
            imageBase64,
            contentType,
            uploaderName,
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data.error || 'request_failed');
        err.code = data.error;
        throw err;
    }
    return data;
}

// ═══════════════════════════════════════════════════════
//  PICKER — seleção de foto, preview, envio
// ═══════════════════════════════════════════════════════
const UPLOAD_ERROR_MESSAGES = {
    invalid_token: 'Este link expirou. Peça um link novo pra quem organiza o evento.',
    gallery_disabled: 'O álbum não está mais ativo neste evento.',
    unsupported_type: 'Esse tipo de arquivo não é aceito. Tente outra foto.',
    file_too_large: 'Essa foto é grande demais. Tente outra ou tire uma nova.',
    rate_limited: 'Muitas fotos em pouco tempo. Espere alguns minutos e tente de novo.',
    appcheck_failed: 'Não foi possível confirmar que este é um acesso válido. Recarregue a página.',
};

let selectedBlob = null;

const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const previewWrap = document.getElementById('previewWrap');
const previewImg = document.getElementById('previewImg');
const submitBtn = document.getElementById('submitBtn');
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

dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
    }
});

fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    setPickerError(null);
    submitBtn.disabled = true;

    try {
        selectedBlob = await compressImage(file);
        previewImg.src = URL.createObjectURL(selectedBlob);
        previewWrap.hidden = false;
        submitBtn.disabled = false;
    } catch (e) {
        selectedBlob = null;
        previewWrap.hidden = true;
        setPickerError('Não conseguimos abrir essa foto. Tente outra.');
    }
});

document.getElementById('previewClear').addEventListener('click', () => {
    selectedBlob = null;
    previewWrap.hidden = true;
    submitBtn.disabled = true;
    fileInput.value = '';
});

submitBtn.addEventListener('click', async () => {
    if (!selectedBlob) return;
    setPickerError(null);
    showState('stateUploading');

    try {
        const imageBase64 = await blobToBase64(selectedBlob);
        const uploaderName = document.getElementById('uploaderName').value.trim();
        await uploadPhoto({ imageBase64, contentType: 'image/jpeg', uploaderName });
        showState('stateSuccess');
    } catch (e) {
        showState('statePicker');
        setPickerError(UPLOAD_ERROR_MESSAGES[e.code] || 'Não foi possível enviar sua foto. Tente de novo.');
    }
});

document.getElementById('uploadAnotherBtn').addEventListener('click', () => {
    selectedBlob = null;
    previewWrap.hidden = true;
    submitBtn.disabled = true;
    fileInput.value = '';
    document.getElementById('uploaderName').value = '';
    setPickerError(null);
    showState('statePicker');
});

// Loop do convidado (H0/D): sem app publicado na App Store ainda, então sem
// link de "baixe o app" em iOS (evita apontar pra uma loja onde ele não existe).
const isIOSDevice = () => /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
document.getElementById('footerAppLinkWrap').hidden = isIOSDevice();

// ═══════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════
if (!window.__galleryToken) {
    showFatalError('missing_token');
} else {
    // Sem endpoint de "resolveEvent" dedicado pra galeria — a primeira
    // tentativa de envio já valida token/galleryEnabled/premium do lado
    // do servidor (ver event_gallery.js) e mostra o erro certo se algo
    // estiver errado. Evita manter 2 chamadas de rede pra cada visita.
    showState('statePicker');
}
