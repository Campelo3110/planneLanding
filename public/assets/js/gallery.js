(() => {
  'use strict';
  const endpoint = 'https://southamerica-east1-planne-692f7.cloudfunctions.net/uploadEventPhoto';
  const token = new URLSearchParams(location.search).get('token');
  const $ = (id) => document.getElementById(id);
  const video = $('cameraVideo'), placeholder = $('cameraPlaceholder'), status = $('cameraStatus');
  const startBtn = $('startCameraBtn'), captureBtn = $('captureBtn'), switchBtn = $('switchCameraBtn');
  const fileInput = $('fileInput'), review = $('review'), reviewImage = $('reviewImage');
  const formError = $('formError'), submitBtn = $('submitBtn'), result = $('resultCard');
  let stream = null, facingMode = 'environment', selectedBlob = null, previewUrl = null, terminalError = false, filter = 'none', zoom = 1, flash = false, sticker = '', cameraCapabilities = {}, zoomApplying = false, queuedZoom = null, softwareZoom = false;
  const filters = {
    none: 'none',
    golden: 'sepia(.24) saturate(1.22) brightness(1.05)',
    soft: 'brightness(1.08) saturate(.88) contrast(.9)',
    garden: 'saturate(1.18) hue-rotate(7deg) brightness(1.03)',
    party: 'saturate(1.42) contrast(1.12) brightness(1.06)',
    film: 'sepia(.16) saturate(.78) contrast(1.12) brightness(.96)',
    mono: 'grayscale(1) contrast(1.22) brightness(1.04)',
  };
  const requestedLanguage = new URLSearchParams(location.search).get('lang')?.toLowerCase();
  const storedLanguage = (() => {
    try {
      const saved = localStorage.getItem('planne-language')?.toLowerCase();
      if (saved?.startsWith('pt') || saved?.startsWith('en')) return saved;
    } catch (_) { /* Local storage is optional. */ }
    return null;
  })();
  // O link pertence ao evento, não ao idioma do navegador do convidado.
  // Enquanto os metadados chegam, PT-BR evita cair em inglês em WebViews que
  // não compartilham o localStorage do app.
  let language = requestedLanguage?.startsWith('en') ? 'en' : requestedLanguage?.startsWith('pt') ? 'pt' : storedLanguage?.startsWith('en') ? 'en' : 'pt';
  const hasExplicitLanguage = Boolean(requestedLanguage || storedLanguage);
  const updateDocumentLanguage = () => { document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en'; };
  updateDocumentLanguage();
  const tr = (pt, en) => language === 'pt' ? pt : en;
  const text = {
    missing_token: tr('Este link está incompleto. Peça um novo link à organização.', 'This link is incomplete. Ask the host for a new link.'),
    invalid_token: tr('Este link expirou ou não existe mais. Peça um novo link à organização.', 'This link has expired or no longer exists. Ask the host for a new link.'),
    gallery_disabled: tr('O álbum deste evento não está ativo no momento.', 'This event album is not active right now.'),
    unsupported_type: tr('Não foi possível usar esse arquivo. Escolha outra foto.', 'We could not use this file. Choose another photo.'),
    file_too_large: tr('Essa foto é grande demais. Tente outra.', 'This photo is too large. Try another one.'),
    rate_limited: tr('Muitas fotos foram enviadas agora. Espere alguns minutos.', 'A lot of photos were sent just now. Please wait a few minutes.'),
    appcheck_failed: tr('Não foi possível validar o acesso. Recarregue a página.', 'We could not validate access. Reload the page.'),
  };
  const setCopy = (id, pt, en) => { const node = $(id); if (node) node.textContent = tr(pt, en); };
  // App Check melhora a proteção quando o reCAPTCHA está disponível, mas não
  // pode bloquear um convidado numa tela de "Enviando". A Function aceita o
  // fluxo público sem esse header enquanto GALLERY_APPCHECK_ENFORCE estiver
  // desligado, portanto após um limite curto seguimos sem o token.
  async function getAppCheckTokenForGallery() {
    if (typeof window.__getAppCheckToken !== 'function') return null;
    let timeoutId;
    try {
      return await Promise.race([
        window.__getAppCheckToken(),
        new Promise((resolve) => {
          timeoutId = setTimeout(() => resolve(null), 5000);
        }),
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
  const filterLabels = { none: ['Natural', 'Natural'], golden: ['Luz dourada', 'Golden hour'], soft: ['Brilho suave', 'Soft glow'], garden: ['Jardim', 'Garden'], party: ['Flash de festa', 'Party flash'], film: ['Filme', 'Film'], mono: ['Monocromático', 'Mono'] };
  function applyTranslations() {
    setCopy('albumLabel', 'ÁLBUM DO EVENTO', 'EVENT ALBUM');
    if (!$('eventName').dataset.eventName) setCopy('eventName', 'Álbum do evento', 'Event album');
    setCopy('pageTitle', 'Guarde este instante', 'Keep this moment'); setCopy('cameraHint', 'Abra a câmera ou escolha uma foto para deixar no álbum.', 'Open the camera or choose a photo for the album.');
    setCopy('startCameraBtn', 'Ligar câmera', 'Turn on camera'); setCopy('cameraStatusText', 'CÂMERA PRONTA', 'CAMERA READY');
    setCopy('chooseFileLabel', 'Rolo de fotos', 'Photo roll'); setCopy('captureLabel', 'Ligue a câmera', 'Turn on the camera'); setCopy('bottomEffectsLabel', 'Efeitos', 'Effects');
    setCopy('cameraNote', 'As fotos ficam disponíveis somente para a organização no app Planne.', 'Photos are available only to the host in the Planne app.');
    setCopy('reviewFilmLabel', 'SEU MOMENTO', 'YOUR MOMENT'); setCopy('reviewTitle', 'Ficou boa?', 'Does it look good?'); setCopy('uploaderNameLabel', 'Seu nome', 'Your name'); setCopy('uploaderNameOptional', 'opcional', 'optional');
    $('uploaderName').placeholder = tr('Para aparecer junto da foto', 'To appear with the photo'); setCopy('retakeBtn', 'Refazer', 'Retake'); setCopy('submitBtn', 'Revelar foto', 'Develop photo');
    $('flashBtn').setAttribute('aria-label', tr('Lanterna', 'Torch')); $('stickerBtn').setAttribute('aria-label', tr('Emojis', 'Emojis')); $('switchCameraBtn').setAttribute('aria-label', tr('Trocar câmera', 'Switch camera')); $('captureBtn').setAttribute('aria-label', tr('Tirar foto', 'Take photo'));
    document.querySelectorAll('#effectOptions [data-filter]').forEach((button) => { const [pt, en] = filterLabels[button.dataset.filter]; button.textContent = tr(pt, en); });
  }
  applyTranslations();
  const setError = (message) => { formError.textContent = message || ''; formError.hidden = !message; };
  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null; cameraCapabilities = {}; flash = false; zoom = 1; softwareZoom = false;
    video.srcObject = null; status.hidden = true; switchBtn.hidden = true;
    video.style.transform = '';
    captureBtn.disabled = true;
    $('cameraTools').hidden = true; $('viewfinder').hidden = true; $('toolSheet').hidden = true;
    $('bottomEffectsBtn').setAttribute('aria-expanded', 'false'); $('stickerBtn').setAttribute('aria-expanded', 'false');
    $('flashBtn').classList.remove('is-active'); $('zoomRange').value = '1'; $('zoomValue').textContent = '1×';
  };
  const revokePreview = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = null; };
  const showResult = (title, message, error = false, terminal = false) => { terminalError = terminal; result.classList.toggle('is-error', error); $('resultTitle').textContent = title; $('resultText').textContent = message; $('resultAction').textContent = terminal ? tr('Fechar', 'Close') : error ? tr('Tentar novamente', 'Try again') : tr('Enviar outra foto', 'Send another photo'); result.hidden = false; };
  async function requestCamera() {
    const preferred = { video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false };
    try { return await navigator.mediaDevices.getUserMedia(preferred); }
    catch (error) {
      // Computadores normalmente não expõem uma câmera "traseira". Quando
      // a preferência do dispositivo não puder ser atendida, ainda tentamos
      // a webcam disponível antes de oferecer o rolo de fotos.
      if (['OverconstrainedError', 'NotFoundError'].includes(error?.name)) {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      throw error;
    }
  }
  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { $('cameraHint').textContent = tr('A câmera não é compatível neste navegador. Você ainda pode escolher uma foto.', 'The camera is not supported in this browser. You can still choose a photo.'); return; }
    stopCamera(); placeholder.hidden = false; $('cameraHint').textContent = tr('Pedindo acesso à câmera…', 'Requesting camera access…'); startBtn.disabled = true; startBtn.textContent = tr('Abrindo câmera…', 'Opening camera…');
    try {
      stream = await requestCamera();
      video.srcObject = stream; await video.play(); placeholder.hidden = true; status.hidden = false;
      captureBtn.disabled = false;
      // Uma track representa a stream atual, não a quantidade de lentes.
      // Só oferecemos trocar câmera quando há ao menos duas entradas reais.
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        switchBtn.hidden = devices.filter((device) => device.kind === 'videoinput').length < 2;
      } catch (_) { switchBtn.hidden = true; }
      $('cameraTools').hidden = false;
      $('viewfinder').hidden = false; $('captureLabel').textContent = tr('Aperte para fotografar', 'Press to take a photo');
      cameraCapabilities = stream.getVideoTracks()[0]?.getCapabilities?.() || {};
      // Lanterna só existe em parte do hardware. Já o zoom ganha fallback
      // visual, para a pinça funcionar também em navegadores que não expõem
      // MediaStreamTrack.getCapabilities().zoom.
      $('flashBtn').hidden = !cameraCapabilities.torch;
      const min = Number(cameraCapabilities.zoom?.min) || 1;
      const max = Number(cameraCapabilities.zoom?.max) || 3;
      $('zoomRange').disabled = false; $('zoomRange').closest('.zoom-control').hidden = false;
      $('zoomRange').min = String(min); $('zoomRange').max = String(Math.max(min, max));
      $('zoomRange').value = String(min); zoom = min; softwareZoom = !cameraCapabilities.zoom;
      $('zoomValue').textContent = `${zoom.toFixed(1).replace('.0', '')}×`;
    } catch (error) {
      $('cameraHint').textContent = error?.name === 'NotAllowedError' ? tr('A câmera foi bloqueada. Libere a permissão ou escolha uma foto.', 'Camera access was blocked. Allow it or choose a photo.') : tr('Não foi possível abrir a câmera. Escolha uma foto para continuar.', 'We could not open the camera. Choose a photo to continue.');
    } finally { startBtn.disabled = false; startBtn.textContent = tr('Ligar câmera', 'Turn on camera'); }
  }
  async function compressImage(source) {
    const url = URL.createObjectURL(source);
    try {
      const image = new Image(); image.decoding = 'async';
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
      const longest = Math.max(image.naturalWidth, image.naturalHeight), scale = Math.min(1, 1600 / longest);
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d', { alpha: false }).drawImage(image, 0, 0, canvas.width, canvas.height);
      return await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('compress_failed')), 'image/jpeg', .84));
    } finally { URL.revokeObjectURL(url); }
  }
  async function openReview(blob) { selectedBlob = blob; revokePreview(); previewUrl = URL.createObjectURL(blob); reviewImage.src = previewUrl; setError(''); review.hidden = false; stopCamera(); requestAnimationFrame(() => $('uploaderName').focus()); }
  async function takePicture() {
    if (!stream || !video.videoWidth) return; navigator.vibrate?.(20);
    const canvas = $('captureCanvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext('2d', { alpha: false }); context.filter = filters[filter];
    // No fallback visual, recortamos a mesma área ampliada no preview para
    // que a foto confirmada seja exatamente a que a pessoa enquadrou.
    const sourceWidth = softwareZoom ? video.videoWidth / zoom : video.videoWidth;
    const sourceHeight = softwareZoom ? video.videoHeight / zoom : video.videoHeight;
    const sourceX = (video.videoWidth - sourceWidth) / 2;
    const sourceY = (video.videoHeight - sourceHeight) / 2;
    context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    if (sticker) { context.filter = 'none'; context.font = `${Math.round(canvas.width * .14)}px sans-serif`; context.textAlign = 'center'; context.fillText(sticker, canvas.width * .5, canvas.height * .58); }
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', .84)); if (blob) openReview(blob);
  }
  const toBase64 = (blob) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); reader.onerror = reject; reader.readAsDataURL(blob); });
  async function upload() {
    if (!selectedBlob) return; setError(''); submitBtn.disabled = true; submitBtn.textContent = tr('Enviando…', 'Sending…');
    try {
      const appCheckToken = await getAppCheckTokenForGallery();
      if (!appCheckToken) console.warn('Planne gallery: App Check indisponível ou excedeu 5 segundos; enviando pelo fluxo público.');
      const headers = { 'Content-Type': 'application/json' }; if (appCheckToken) headers['X-Firebase-AppCheck'] = appCheckToken;
      const abortController = new AbortController();
      const requestTimeout = setTimeout(() => abortController.abort(), 35000);
      let response;
      try {
        response = await fetch(endpoint, { method: 'POST', headers, signal: abortController.signal, body: JSON.stringify({ publicToken: token, imageBase64: await toBase64(selectedBlob), contentType: 'image/jpeg', uploaderName: $('uploaderName').value.trim() }) });
      } finally {
        clearTimeout(requestTimeout);
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Não registrar token, foto nem nome: o status e o código bastam
        // para diagnosticar a Function sem expor a capability do álbum.
        console.error('Planne gallery: envio da foto falhou', { status: response.status, code: data.error || 'request_failed' });
        const error = new Error(data.error || 'request_failed'); error.code = data.error; throw error;
      }
      review.hidden = true; revokePreview(); selectedBlob = null; $('uploaderName').value = ''; showResult(tr('Foto enviada!', 'Photo sent!'), tr('Ela já está disponível para a organização no app Planne.', 'It is now available to the host in the Planne app.'));
    } catch (error) {
      if (error?.name === 'AbortError') error.code = 'request_timeout';
      console.error('Planne gallery: erro ao enviar foto', { name: error?.name, code: error?.code, message: error?.message });
      setError(text[error.code] || tr('Não foi possível enviar sua foto. Tente novamente.', 'We could not send your photo. Try again.'));
    }
    finally { submitBtn.disabled = false; submitBtn.textContent = tr('Revelar foto', 'Develop photo'); }
  }
  function resetToCamera() { result.hidden = true; review.hidden = true; selectedBlob = null; revokePreview(); fileInput.value = ''; startCamera(); }
  startBtn.addEventListener('click', startCamera); captureBtn.addEventListener('click', takePicture); $('chooseFileBtn').addEventListener('click', () => fileInput.click());
  const toggleEffects = (open, stickers = false) => { $('toolSheet').hidden = !open; $('stickerOptions').hidden = !stickers; $('bottomEffectsBtn').setAttribute('aria-expanded', String(open)); $('stickerBtn').setAttribute('aria-expanded', String(open && stickers)); };
  $('bottomEffectsBtn').addEventListener('click', () => toggleEffects($('toolSheet').hidden));
  $('stickerBtn').addEventListener('click', () => { if (stream) toggleEffects(true, true); });
  $('effectOptions').addEventListener('click', (event) => {
    const next = event.target.dataset.filter; if (!next) return;
    filter = next; video.style.filter = filters[filter];
    document.querySelectorAll('#effectOptions button').forEach((button) => { const selected = button.dataset.filter === filter; button.classList.toggle('is-selected', selected); button.setAttribute('aria-pressed', String(selected)); });
  });
  $('stickerOptions').addEventListener('click', (event) => {
    const next = event.target.dataset.sticker; if (!next) return;
    sticker = sticker === next ? '' : next; $('stickerLayer').textContent = sticker;
    document.querySelectorAll('#stickerOptions button').forEach((button) => { const selected = button.dataset.sticker === sticker; button.classList.toggle('is-selected', selected); button.setAttribute('aria-pressed', String(selected)); });
  });
  async function applyHardwareZoom(next) {
    const track = stream?.getVideoTracks?.()[0]; if (!track) return;
    const min = Number($('zoomRange').min) || 1, max = Number($('zoomRange').max) || 3;
    if (!cameraCapabilities.zoom) {
      softwareZoom = true; zoom = Math.min(max, Math.max(min, next));
      $('zoomRange').value = String(zoom); $('zoomValue').textContent = `${zoom.toFixed(1).replace('.0', '')}×`;
      video.style.transform = zoom > 1 ? `scale(${zoom})` : '';
      return;
    }
    const range = cameraCapabilities.zoom;
    zoom = Math.min(Number(range.max), Math.max(Number(range.min), next));
    $('zoomRange').value = String(zoom); $('zoomValue').textContent = `${zoom.toFixed(1).replace('.0', '')}×`;
    if (zoomApplying) { queuedZoom = zoom; return; }
    zoomApplying = true;
    try { await track.applyConstraints({ advanced: [{ zoom }] }); }
    catch (_) { zoom = Number(range.min) || 1; $('zoomRange').value = String(zoom); $('zoomValue').textContent = `${zoom.toFixed(1).replace('.0', '')}×`; }
    finally { zoomApplying = false; if (queuedZoom !== null) { const queued = queuedZoom; queuedZoom = null; applyHardwareZoom(queued); } }
  }
  $('zoomRange').addEventListener('input', async (event) => {
    applyHardwareZoom(Number(event.target.value));
  });
  $('flashBtn').addEventListener('click', async () => {
    const track = stream?.getVideoTracks?.()[0]; if (!track || !cameraCapabilities.torch) return;
    const next = !flash;
    try { await track.applyConstraints({ advanced: [{ torch: next }] }); flash = next; $('flashBtn').classList.toggle('is-active', flash); $('flashBtn').setAttribute('aria-pressed', String(flash)); }
    catch (_) { flash = false; $('flashBtn').classList.remove('is-active'); $('flashBtn').setAttribute('aria-pressed', 'false'); }
  });
  const activePointers = new Map(); let pinchDistance = null;
  $('cameraStage').addEventListener('pointerdown', (event) => {
    if (!stream || event.target.closest('button, input, label')) return;
    event.currentTarget.setPointerCapture?.(event.pointerId); activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size === 2) { const [a, b] = [...activePointers.values()]; pinchDistance = Math.hypot(a.x - b.x, a.y - b.y); return; }
    const ring = $('focusRing'), box = event.currentTarget.getBoundingClientRect();
    ring.style.left = `${event.clientX - box.left}px`; ring.style.top = `${event.clientY - box.top}px`; ring.hidden = false;
    clearTimeout($('focusRing')._hideTimer); ring._hideTimer = setTimeout(() => ring.hidden = true, 1200);
  });
  $('cameraStage').addEventListener('pointermove', (event) => {
    if (!activePointers.has(event.pointerId) || activePointers.size !== 2) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); const [a, b] = [...activePointers.values()];
    const distance = Math.hypot(a.x - b.x, a.y - b.y); if (!pinchDistance) { pinchDistance = distance; return; }
    const span = Number($('zoomRange').max) - Number($('zoomRange').min);
    applyHardwareZoom(zoom + ((distance - pinchDistance) / event.currentTarget.clientWidth) * span * 1.6); pinchDistance = distance;
  });
  const releasePointer = (event) => { activePointers.delete(event.pointerId); if (activePointers.size < 2) pinchDistance = null; };
  $('cameraStage').addEventListener('pointerup', releasePointer); $('cameraStage').addEventListener('pointercancel', releasePointer);
  switchBtn.addEventListener('click', () => { facingMode = facingMode === 'environment' ? 'user' : 'environment'; startCamera(); });
  fileInput.addEventListener('change', async () => { const file = fileInput.files?.[0]; if (!file) return; try { await openReview(await compressImage(file)); } catch (_) { showResult(tr('Não foi possível abrir a foto', 'We could not open this photo'), tr('Escolha outro arquivo ou tente usar a câmera.', 'Choose another file or try using the camera.'), true); } });
  $('retakeBtn').addEventListener('click', resetToCamera); submitBtn.addEventListener('click', upload); $('resultAction').addEventListener('click', () => terminalError ? result.hidden = true : resetToCamera());
  addEventListener('pagehide', stopCamera); document.addEventListener('visibilitychange', () => { if (document.hidden && review.hidden) stopCamera(); });
  async function loadGalleryInfo() {
    if (!token) return;
    try {
      const cacheKey = `planne-gallery-info:${token}`;
      let cached = null; try { cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null'); } catch (_) { /* Cache corrompido é descartável. */ }
      if (cached?.expiresAt > Date.now() && typeof cached.eventName === 'string') {
        $('eventName').textContent = cached.eventName;
        $('eventName').dataset.eventName = cached.eventName;
        document.title = `Planne · ${cached.eventName}`;
        return;
      }
      const appCheckToken = await getAppCheckTokenForGallery();
      const headers = { 'Content-Type': 'application/json' }; if (appCheckToken) headers['X-Firebase-AppCheck'] = appCheckToken;
      const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ action: 'getGalleryInfo', publicToken: token }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;
      if (typeof data.eventName === 'string' && data.eventName.trim()) {
        const eventName = data.eventName.trim();
        $('eventName').textContent = eventName;
        $('eventName').dataset.eventName = eventName;
        document.title = `Planne · ${eventName}`;
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ eventName, expiresAt: Date.now() + 15 * 60 * 1000 })); } catch (_) { /* Cache é opcional. */ }
      }
      if (!hasExplicitLanguage && (data.language === 'pt' || data.language === 'en')) {
        language = data.language;
        updateDocumentLanguage();
        applyTranslations();
      }
    } catch (error) {
      console.warn('Planne gallery: não foi possível carregar os metadados do álbum', { name: error?.name, message: error?.message });
      /* O upload continua sendo a fonte de erro apropriada. */
    }
  }
  if (!token) { placeholder.hidden = true; showResult(tr('Não foi possível abrir a câmera', 'We could not open the camera'), text.missing_token, true, true); }
  else { loadGalleryInfo(); }
})();
