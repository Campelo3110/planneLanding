import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
        import {
            getAuth,
            verifyPasswordResetCode,
            confirmPasswordReset,
            applyActionCode,
            checkActionCode
        } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

        // ─── SUBSTITUA PELA SUA CONFIG ───────────────────────
        const firebaseConfig = {
            apiKey: "AIzaSyB1wOwTWEIjxhx4hvkOzBF8rMZcgLLOVUA",
            authDomain: "planne-692f7.firebaseapp.com",
            projectId: "planne-692f7",
            storageBucket: "planne-692f7.firebasestorage.app",
            messagingSenderId: "136432930965",
            appId: "1:136432930965:web:83213ea34af4c013bc0b9c",
            measurementId: "G-8JCTY94S1L"
        };
        // ────────────────────────────────────────────────────

        const app  = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const p    = new URLSearchParams(window.location.search);

        window.__planneAuth = {
            auth,
            verifyPasswordResetCode,
            confirmPasswordReset,
            applyActionCode,
            checkActionCode,
            mode:    p.get("mode"),
            oobCode: p.get("oobCode"),
            lang:    p.get("lang") // Firebase pode enviar o lang do usuário
        };
