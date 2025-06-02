let isInitialized = false;
let fbAccess, fbAuth, fbFunctions, fbSetPersistence,
    fbBrowserSessionPersistence, fbSignInWithCustomToken,
    fbOnAuthStateChanged, fbHttpsCallable;
let tokenRefreshIntervalId = null;
const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000;

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

async function performValidationAndSignInLogic(validateAccessCallable, password) {
    try {
        const result = await validateAccessCallable({ password: password });
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

async function validateAndSignIn(password) {
    if (!fbFunctions || !fbHttpsCallable) {
        showErrorBanner("Firebase Functions nicht initialisiert.");
        handleLoginError({ message: "Firebase Functions nicht initialisiert." });
        throw new Error("Firebase Functions nicht initialisiert.");
    }
    const validateAccess = fbHttpsCallable(fbFunctions, 'validateAccessAndGenerateToken');
    await performValidationAndSignInLogic(validateAccess, password);
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

async function handleAuthenticatedUser() {
    try {
        await generateToken(true);
        startTokenRefreshInterval();
        init();
    } catch (error) {
        showErrorBanner("Fehler bei der Initialisierung der Sitzung.");
    }
}

function handleUnauthenticatedUser() {
    stopTokenRefreshInterval();
    if (window.firebaseGlobalAccess) {
        window.firebaseGlobalAccess.token = null;
    }
    showLogIn();
}

async function onAuthUserChanged(user) {
    if (user) {
        await handleAuthenticatedUser();
    } else {
        handleUnauthenticatedUser();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseGlobals();
    if (typeof initializeFirebaseDataDependencies === 'function') {
        initializeFirebaseDataDependencies();
    }
    if (fbAuth && fbOnAuthStateChanged) {
        fbOnAuthStateChanged(fbAuth, onAuthUserChanged);
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

function getAuthenticatedUserOrThrow() {
    if (!window.firebaseGlobalAccess || !window.firebaseGlobalAccess.auth) {
        throw new Error("Firebase Auth ist nicht initialisiert.");
    }
    const user = window.firebaseGlobalAccess.auth.currentUser;
    if (!user) {
        showErrorBanner("Benutzer ist nicht eingeloggt. Bitte anmelden.");
        throw new Error("Benutzer ist nicht eingeloggt für Token-Generierung.");
    }
    return user;
}

async function fetchAndSetIdToken(user, forceRefresh) {
    try {
        const tokenValue = await user.getIdToken(forceRefresh);
        window.firebaseGlobalAccess.token = tokenValue;
    } catch (error) {
        showErrorBanner("Fehler beim Abrufen des ID-Tokens: " + (error.message || "Unbekannter Fehler"));
        throw error;
    }
}

async function generateToken(forceRefresh = false) {
    const user = getAuthenticatedUserOrThrow();
    await fetchAndSetIdToken(user, forceRefresh);
}

async function performTokenRefresh() {
    try {
        await generateToken(true);
    } catch (error) {
        showErrorBanner("Fehler bei der automatischen Token-Aktualisierung: " + (error.message || "Unbekannter Fehler"));
    }
}

function startTokenRefreshInterval() {
    if (tokenRefreshIntervalId) {
        clearInterval(tokenRefreshIntervalId);
    }
    tokenRefreshIntervalId = setInterval(performTokenRefresh, TOKEN_REFRESH_INTERVAL);
}

function stopTokenRefreshInterval() {
    if (tokenRefreshIntervalId) {
        clearInterval(tokenRefreshIntervalId);
        tokenRefreshIntervalId = null;
    }
}

async function fetchInitialData() {
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
    if (loginSuccess) {
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
