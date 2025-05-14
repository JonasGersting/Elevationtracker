let isInitialized = false;

function handleLoginError(error) {
    console.error("Login fehlgeschlagen:", error);
    if (error.code === 'functions/permission-denied' || (error.details && error.details.code === 'permission-denied')) {
        showErrorBanner("Login fehlgeschlagen: Ungültiges Passwort.");
    } else if (error.code === 'functions/unavailable' || error.message.includes('Failed to fetch')) {
        showErrorBanner("Login fehlgeschlagen: Netzwerkfehler oder Funktion nicht erreichbar.");
    } else {
        showErrorBanner("Login fehlgeschlagen: " + (error.message || "Unbekannter Fehler"));
    }
}

async function signInWithFirebaseToken(customAuthToken) {
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    await firebase.auth().signInWithCustomToken(customAuthToken);
    console.log("Erfolgreich mit Custom Token angemeldet.");
}

function handleNoTokenError() {
    console.error("Login fehlgeschlagen: Kein Custom Token von der Funktion erhalten.");
    showErrorBanner("Login fehlgeschlagen: Ungültige Antwort vom Server.");
}

async function validateAndSignIn(password) {
    const functions = firebase.app().functions('europe-west3');
    const validateAccess = functions.httpsCallable('validateAccessAndGenerateToken');
    const result = await validateAccess({ password: password });
    const customAuthToken = result.data.token;
    if (customAuthToken) {
        await signInWithFirebaseToken(customAuthToken);
    } else {
        handleNoTokenError();
    }
}

async function login(password) {
    showLogInSuccess();
    try {
        await validateAndSignIn(password);
    } catch (error) {
        handleLoginError(error);
    }
}

function handleLogin(event) {
    event.preventDefault();
    const passwordInput = document.getElementById("loginInput");
    const password = passwordInput.value;
    login(password);
}

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
    await Promise.all([
        getData('navAids'),
        getData('aerodromes'),
        getData('obstacles'),
        getData('aipInfo')
    ]);
}

function initializeMapRelatedFeatures() {
    if (typeof map !== 'undefined' && map) {
        showCursorCoordinates(map);
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
    removeOverlay();
    try {
        await fetchInitialData();
        initializeMapRelatedFeatures();
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
    loginSuccess.classList.add("d-none");

}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                init();
            } else {
                showLogIn();
            }
        });
    } else {
        showErrorBanner("Fehler bei der Initialisierung. Bitte Seite neu laden.");
    }
});


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