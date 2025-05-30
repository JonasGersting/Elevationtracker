let isInitialized = false;
let fbAccess, fbAuth, fbFunctions, fbSetPersistence,
    fbBrowserSessionPersistence, fbSignInWithCustomToken,
    fbOnAuthStateChanged, fbHttpsCallable;

function initializeFirebaseGlobals() {
    fbAccess = window.firebaseGlobalAccess;
    if (fbAccess) {
        fbAuth = fbAccess.auth;
        fbFunctions = fbAccess.functions;
        fbSetPersistence = fbAccess.setAuthPersistence;
        fbBrowserSessionPersistence = fbAccess.browserSessionPersistence;
        fbSignInWithCustomToken = fbAccess.signInWithCustomToken;
        fbOnAuthStateChanged = fbAccess.onAuthStateChanged;
        fbHttpsCallable = fbAccess.httpsCallable;
    } else {
        showErrorBanner("Firebase Global Access ist nicht verfügbar. Bitte Seite neu laden.");
    }
}

function handleLoginError(error) {
    if (error.code === 'functions/permission-denied' || (error.details && error.details.code === 'permission-denied')) {
        showErrorBanner("Login fehlgeschlagen: Ungültiges Passwort.");
    } else if (error.code === 'functions/unavailable' || error.message.includes('Failed to fetch')) {
        showErrorBanner("Login fehlgeschlagen: Netzwerkfehler oder Funktion nicht erreichbar.");
    } else if (error.code === 'auth/network-request-failed') {
        showErrorBanner("Login fehlgeschlagen: Netzwerkfehler.");
    } else {
        showErrorBanner("Login fehlgeschlagen: " + (error.message || "Unbekannter Fehler"));
    }
}

async function signInWithFirebaseToken(customAuthToken) {
    if (!fbAuth || !fbSetPersistence || !fbBrowserSessionPersistence || !fbSignInWithCustomToken) {
        showErrorBanner("Firebase Auth-Funktionen nicht verfügbar. Bitte Seite neu laden.");
        handleLoginError({ message: "Firebase Auth nicht initialisiert." });
        return;
    }
    await fbSetPersistence(fbAuth, fbBrowserSessionPersistence);
    await fbSignInWithCustomToken(fbAuth, customAuthToken);
}

function handleNoTokenError() {
    showErrorBanner("Login fehlgeschlagen: Ungültige Antwort vom Server.");
}

async function validateAndSignIn(password) {
    if (!fbFunctions || !fbHttpsCallable) {
        showErrorBanner("Firebase Functions nicht initialisiert.");
        handleLoginError({ message: "Firebase Functions nicht initialisiert." });
        throw new Error("Firebase Functions nicht initialisiert.");
    }
    const validateAccess = fbHttpsCallable(fbFunctions, 'validateAccessAndGenerateToken');
    try {
        const result = await validateAccess({ password: password });
        const customAuthToken = result.data.token;
        if (customAuthToken) {
            await signInWithFirebaseToken(customAuthToken);
        } else {
            handleNoTokenError();
        }
    } catch (error) {
        handleLoginError(error);
        throw error; 
    }
}

async function login(password) {
    showLogInSuccess();
    try {
        await validateAndSignIn(password);
    } catch (error) {
        showErrorBanner("Login fehlgeschlagen: " + (error.message || "Unbekannter Fehler"));
    }
}

function handleLogin(event) {
    event.preventDefault();
    const passwordInput = document.getElementById("loginInput");
    const password = passwordInput.value;
    login(password);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseGlobals();
    if (typeof initializeFirebaseDataDependencies === 'function') {
        initializeFirebaseDataDependencies();
    }
    if (fbAuth && fbOnAuthStateChanged) {
        fbOnAuthStateChanged(fbAuth, user => {
            if (user) {
                init();
            } else {
                showLogIn();
            }
        });
    } else {
        showErrorBanner("Firebase Auth konnte nicht initialisiert werden. Bitte Seite neu laden.");
    }
});

function showErrorBanner(message) {
    hideLogInSuccess();
    const errorBanner = document.getElementById("errorBanner");
    if (!errorBanner) return;
    errorBanner.textContent = message;
    errorBanner.classList.add("show");
    setTimeout(() => {
        errorBanner.classList.remove("show");
    }, 3000);
}

async function fetchInitialData() {
    if (!window.firebaseGlobalAccess?.database) { 
        showErrorBanner("Datenmanagement-Service ist nicht bereit. Bitte warten Sie einen Moment.");
    }
    await Promise.all([
        getData('navAids'),
        getData('aerodromes'),
        getData('obstacles'),
        getData('aipInfo')
    ]);
}

function initializeMapRelatedFeatures() {
    if (typeof map !== 'undefined' && map) {
        if (typeof showCursorCoordinates === 'function') {
            showCursorCoordinates(map);
        }
    } else {
        showErrorBanner("Fehler: Karte ist nicht initialisiert.");
    }
}

function handleInitError(error) {
    showErrorBanner("Fehler beim Laden der Anwendungsdaten.");
    isInitialized = false;
    hideLogInSuccess();
}

async function init() {
    if (isInitialized) return;
    isInitialized = true;
    try {
        await fetchInitialData();
        initializeMapRelatedFeatures();
        removeOverlay();
    } catch (error) {
        handleInitError(error);
    }
}

function removeOverlay() {
    const loginOverlay = document.getElementById("login");
    if (loginOverlay) {
        loginOverlay.classList.add("hidden");
    }
}

function showLogInSuccess() {
    const loginSuccess = document.getElementById("loginSuccess");
    if (loginSuccess) {
        loginSuccess.classList.remove("d-none");
    }
}

function hideLogInSuccess() {
    const loginSuccess = document.getElementById("loginSuccess");
    if(loginSuccess){ 
       loginSuccess.classList.add("d-none");
    }
}

function showLogIn() {
    const loginOverlay = document.getElementById("login");
    if (loginOverlay) {
        loginOverlay.classList.remove("hidden");
    }
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.classList.remove("d-none");
    }
    isInitialized = false;
}
