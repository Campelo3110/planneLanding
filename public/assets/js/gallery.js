(() => {
  'use strict';
  const endpoint = 'https://southamerica-east1-planne-692f7.cloudfunctions.net/uploadEventPhoto';
  const token = new URLSearchParams(location.search).get('token');
  const $ = (id) => document.getElementById(id);
  const video = $('cameraVideo'), placeholder = $('cameraPlaceholder'), status = $('cameraStatus');
  const startBtn = $('startCameraBtn'), captureBtn = $('captureBtn'), switchBtn = $('switchCameraBtn');
  const fileInput = $('fileInput'), review = $('review'), reviewImage = $('reviewImage');
  const formError = $('formError'), submitBtn = $('submitBtn'), result = $('resultCard');
  let stream = null, facingMode = 'environment', selectedBlob = null, previewUrl = null, terminalError = false;
  const language = (() => {
    try {
      const saved = localStorage.getItem('planne-language')?.toLowerCase();
      if (saved?.startsWith('pt')) return 'pt';
      if (saved?.startsWith('en')) return 'en';
    } catch (_) { /* Local storage is optional. */ }
    return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  })();
  document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
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
  setCopy('albumLabel', 'ÁLBUM DO EVENTO', 'EVENT ALBUM'); setCopy('singlePhotoLabel', 'FOTO ÚNICA', 'ONE PHOTO');
  setCopy('pageTitle', 'Guarde este instante', 'Keep this moment'); setCopy('cameraHint', 'Abra a câmera ou escolha uma foto para deixar no álbum.', 'Open the camera or choose a photo for the album.');
  setCopy('startCameraBtn', 'Ligar câmera', 'Turn on camera'); setCopy('cameraStatusText', 'CÂMERA PRONTA', 'CAMERA READY');
  setCopy('chooseFileLabel', 'Rolo de fotos', 'Photo roll'); setCopy('captureLabel', 'Ligue a câmera', 'Turn on the camera'); setCopy('photoCountLabel', 'foto', 'photo');
  setCopy('cameraNote', 'As fotos ficam disponíveis somente para a organização no app Planne.', 'Photos are available only to the host in the Planne app.');
  setCopy('reviewFilmLabel', 'FOTO 01', 'PHOTO 01'); setCopy('reviewTitle', 'Ficou boa?', 'Does it look good?'); setCopy('uploaderNameLabel', 'Seu nome', 'Your name'); setCopy('uploaderNameOptional', 'opcional', 'optional');
  $('uploaderName').placeholder = tr('Para aparecer junto da foto', 'To appear with the photo'); setCopy('retakeBtn', 'Refazer', 'Retake'); setCopy('submitBtn', 'Revelar foto', 'Develop photo');
  const setError = (message) => { formError.textContent = message || ''; formError.hidden = !message; };
  const stopCamera = () => { stream?.getTracks().forEach((track) => track.stop()); stream = null; video.srcObject = null; status.hidden = true; switchBtn.hidden = true; captureBtn.disabled = true; };
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
      video.srcObject = stream; await video.play(); placeholder.hidden = true; status.hidden = false; captureBtn.disabled = false; switchBtn.hidden = stream.getVideoTracks().length < 1; $('captureLabel').textContent = tr('Aperte para fotografar', 'Press to take a photo');
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
  async function openReview(blob) { selectedBlob = blob; revokePreview(); previewUrl = URL.createObjectURL(blob); reviewImage.src = previewUrl; setError(''); review.hidden = false; stopCamera(); }
  async function takePicture() {
    if (!stream || !video.videoWidth) return; navigator.vibrate?.(20);
    const canvas = $('captureCanvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext('2d', { alpha: false }); context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', .84)); if (blob) openReview(blob);
  }
  const toBase64 = (blob) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); reader.onerror = reject; reader.readAsDataURL(blob); });
  async function upload() {
    if (!selectedBlob) return; setError(''); submitBtn.disabled = true; submitBtn.textContent = 'Enviando…';
    try {
      const appCheckToken = await window.__getAppCheckToken?.(); const headers = { 'Content-Type': 'application/json' }; if (appCheckToken) headers['X-Firebase-AppCheck'] = appCheckToken;
      const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ publicToken: token, imageBase64: await toBase64(selectedBlob), contentType: 'image/jpeg', uploaderName: $('uploaderName').value.trim() }) });
      const data = await response.json().catch(() => ({})); if (!response.ok) { const error = new Error(data.error || 'request_failed'); error.code = data.error; throw error; }
      review.hidden = true; revokePreview(); selectedBlob = null; $('uploaderName').value = ''; showResult(tr('Foto enviada!', 'Photo sent!'), tr('Ela já está disponível para a organização no app Planne.', 'It is now available to the host in the Planne app.'));
    } catch (error) { setError(text[error.code] || tr('Não foi possível enviar sua foto. Tente novamente.', 'We could not send your photo. Try again.')); }
    finally { submitBtn.disabled = false; submitBtn.textContent = tr('Revelar foto', 'Develop photo'); }
  }
  function resetToCamera() { result.hidden = true; review.hidden = true; selectedBlob = null; revokePreview(); fileInput.value = ''; startCamera(); }
  startBtn.addEventListener('click', startCamera); captureBtn.addEventListener('click', takePicture); $('chooseFileBtn').addEventListener('click', () => fileInput.click());
  switchBtn.addEventListener('click', () => { facingMode = facingMode === 'environment' ? 'user' : 'environment'; startCamera(); });
  fileInput.addEventListener('change', async () => { const file = fileInput.files?.[0]; if (!file) return; try { await openReview(await compressImage(file)); } catch (_) { showResult(tr('Não foi possível abrir a foto', 'We could not open this photo'), tr('Escolha outro arquivo ou tente usar a câmera.', 'Choose another file or try using the camera.'), true); } });
  $('retakeBtn').addEventListener('click', resetToCamera); submitBtn.addEventListener('click', upload); $('resultAction').addEventListener('click', () => terminalError ? result.hidden = true : resetToCamera());
  addEventListener('pagehide', stopCamera); document.addEventListener('visibilitychange', () => { if (document.hidden && review.hidden) stopCamera(); });
  if (!token) { placeholder.hidden = true; showResult(tr('Não foi possível abrir a câmera', 'We could not open the camera'), text.missing_token, true, true); }
})();
