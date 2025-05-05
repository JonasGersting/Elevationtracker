async function login(password) {
    const functions = firebase.app().functions('europe-west3');
    const validateAccess = functions.httpsCallable('validateAccessAndGenerateToken');

    try {
        const result = await validateAccess({ password: password });
        const customAuthToken = result.data.token;

        if (customAuthToken) {
            // --- HIER: Persistenz festlegen ---
            // Option A: Sitzung nur für die aktuelle Browser-Session
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

            // Option B: Sitzung nicht speichern (Ausloggen bei Neuladen)
            // await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

            // Option C: Standard (local - bleibt gespeichert) - muss nicht explizit gesetzt werden
            // await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            // --- Ende Persistenz ---

            // Mit dem Custom Token bei Firebase anmelden
            await firebase.auth().signInWithCustomToken(customAuthToken);
            console.log("Erfolgreich mit Custom Token angemeldet.");
            sessionStorage.setItem('isLoggedIn', 'true');
            init();
        } else {
            console.error("Login fehlgeschlagen: Kein Custom Token von der Funktion erhalten.");
            showErrorBanner("Login fehlgeschlagen: Ungültige Antwort vom Server.");
        }

    } catch (error) {
        console.error("Login fehlgeschlagen:", error);
        if (error.code === 'functions/permission-denied' || (error.details && error.details.code === 'permission-denied')) {
            showErrorBanner("Login fehlgeschlagen: Ungültiges Passwort.");
        } else if (error.code === 'functions/unavailable' || error.message.includes('Failed to fetch')) {
            showErrorBanner("Login fehlgeschlagen: Netzwerkfehler oder Funktion nicht erreichbar.");
        } else {
            showErrorBanner("Login fehlgeschlagen: " + (error.message || "Unbekannter Fehler"));
        }
    }
}

function handleLogin(event) {
    event.preventDefault();
    const passwordInput = document.getElementById("loginInput");
    const password = passwordInput.value;
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) loginBtn.disabled = true;

    login(password).finally(() => {
        passwordInput.disabled = false;
        if (loginBtn) loginBtn.disabled = false;
    });
}


function showErrorBanner(message) {
    const errorBanner = document.getElementById("errorBanner");
    errorBanner.textContent = message; // Setze die Fehlermeldung
    errorBanner.classList.add("show"); // Zeige das Banner an

    // Verstecke das Banner nach 3 Sekunden
    setTimeout(() => {
        errorBanner.classList.remove("show");
    }, 3000);
}


async function init() {
    showLogInSuccess();
    // Stelle sicher, dass getData und andere Funktionen verfügbar sind
    // und dass der Token ggf. für API-Aufrufe genutzt wird, falls erforderlich.
    await Promise.all([
        getData('navAids'),
        getData('aerodromes'),
        getData('obstacles'),
        getData('aipInfo')
    ]);
    // Stelle sicher, dass 'map' initialisiert ist, bevor es verwendet wird.
    if (typeof map !== 'undefined') {
        showCursorCoordinates(map);
    } else {
        console.warn("Karte (map) ist noch nicht initialisiert in init().");
    }
    removeOverlay();
}

function removeOverlay() {
    // Login-Overlay ausblenden
    const loginOverlay = document.getElementById("login");
    loginOverlay.classList.add("hidden"); // Füge die Klasse für die Animation hinzu
}

function showLogInSuccess() {
    const loginSuccess = document.getElementById("loginSuccess");
    loginSuccess.classList.remove("d-none");
    // Optional: Login-Formular ausblenden
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.classList.add("d-none");
    }
}

// document.addEventListener("DOMContentLoaded", () => {
//     // Event Listener für das Formular hinzufügen, falls noch nicht geschehen
//     const loginForm = document.getElementById("loginForm");
//     if (loginForm) {
//         // Entferne den onsubmit-Handler aus dem HTML, wenn du diesen Listener verwendest
//         // loginForm.addEventListener('submit', handleLogin);
//     }
//     // Kein automatischer Login mehr hier
//     // login("testpassword"); // Beispielaufruf entfernt
// });