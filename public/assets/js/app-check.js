const RECAPTCHA_V3_SITE_KEY = '6LeCA3YtAAAAANSEdxmY375Ti8X6j0iIQMbFSxNd';
let appCheckTokenPromise = null;

async function initializePlanneAppCheck() {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const { initializeAppCheck, ReCaptchaV3Provider, getToken } =
    await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js');

  const app = initializeApp({
    apiKey: 'AIzaSyB1wOwTWEIjxhx4hvkOzBF8rMZcgLLOVUA',
    authDomain: 'planne-692f7.firebaseapp.com',
    projectId: 'planne-692f7',
    storageBucket: 'planne-692f7.firebasestorage.app',
    messagingSenderId: '136432930965',
    appId: '1:136432930965:web:83213ea34af4c013bc0b9c',
  });
  return {
    appCheck: initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    }),
    getToken,
  };
}

window.__getAppCheckToken = async () => {
  try {
    appCheckTokenPromise ??= initializePlanneAppCheck();
    const { appCheck, getToken } = await appCheckTokenPromise;
    return (await getToken(appCheck, false)).token;
  } catch (error) {
    console.warn('App Check indisponível, seguindo sem o header:', error);
    window.showAppCheckWarning?.();
    return null;
  }
};
