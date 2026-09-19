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
  const messages = { missing_token: 'Este link está incompleto. Peça um novo link à organização.', invalid_token: 'Este link expirou ou não existe mais. Peça um novo link à organização.', gallery_disabled: 'O álbum deste evento não está ativo no momento.', unsupported_type: 'Não foi possível usar esse arquivo. Escolha outra foto.', file_too_large: 'Essa foto é grande demais. Tente outra.', rate_limited: 'Muitas fotos foram enviadas agora. Espere alguns minutos.', appcheck_failed: 'Não foi possível validar o acesso. Recarregue a página.' };
  const setError = (message) => { formError.textContent = message || ''; formError.hidden = !message; };
  const stopCamera = () => { stream?.getTracks().forEach((track) => track.stop()); stream = null; video.srcObject = null; status.hidden = true; switchBtn.hidden = true; captureBtn.disabled = true; };
  const revokePreview = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = null; };
  const showResult = (title, text, error = false, terminal = false) => { terminalError = terminal; result.classList.toggle('is-error', error); $('resultTitle').textContent = title; $('resultText').textContent = text; $('resultAction').textContent = terminal ? 'Fechar' : error ? 'Tentar novamente' : 'Enviar outra foto'; result.hidden = false; };
  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { $('cameraHint').textContent = 'A câmera não é compatível neste navegador. Você ainda pode escolher uma foto.'; return; }
    stopCamera(); placeholder.hidden = false; startBtn.disabled = true; startBtn.textContent = 'Abrindo câmera…';
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      video.srcObject = stream; await video.play(); placeholder.hidden = true; status.hidden = false; captureBtn.disabled = false; switchBtn.hidden = stream.getVideoTracks().length === 0; $('captureLabel').textContent = 'Toque para fotografar';
    } catch (error) {
      $('cameraHint').textContent = error?.name === 'NotAllowedError' ? 'A câmera foi bloqueada. Libere a permissão ou escolha uma foto.' : 'Não foi possível abrir a câmera. Escolha uma foto para continuar.';
    } finally { startBtn.disabled = false; startBtn.textContent = 'Abrir câmera'; }
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
      review.hidden = true; revokePreview(); selectedBlob = null; $('uploaderName').value = ''; showResult('Foto enviada!', 'Ela já está disponível para a organização no app Planne.');
    } catch (error) { setError(messages[error.code] || 'Não foi possível enviar sua foto. Tente novamente.'); }
    finally { submitBtn.disabled = false; submitBtn.textContent = 'Enviar foto'; }
  }
  function resetToCamera() { result.hidden = true; review.hidden = true; selectedBlob = null; revokePreview(); fileInput.value = ''; startCamera(); }
  startBtn.addEventListener('click', startCamera); captureBtn.addEventListener('click', takePicture); $('chooseFileBtn').addEventListener('click', () => fileInput.click());
  switchBtn.addEventListener('click', () => { facingMode = facingMode === 'environment' ? 'user' : 'environment'; startCamera(); });
  fileInput.addEventListener('change', async () => { const file = fileInput.files?.[0]; if (!file) return; try { await openReview(await compressImage(file)); } catch (_) { showResult('Não foi possível abrir a foto', 'Escolha outro arquivo ou tente usar a câmera.', true); } });
  $('retakeBtn').addEventListener('click', resetToCamera); submitBtn.addEventListener('click', upload); $('resultAction').addEventListener('click', () => terminalError ? result.hidden = true : resetToCamera());
  addEventListener('pagehide', stopCamera); document.addEventListener('visibilitychange', () => { if (document.hidden && review.hidden) stopCamera(); });
  if (!token) { placeholder.hidden = true; showResult('Não foi possível abrir a câmera', messages.missing_token, true, true); }
})();
