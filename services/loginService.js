// Flag, um sicherzustellen, dass init() nur einmal aufgerufen wird
let isInitialized = false;

// --- Login-Funktion (bleibt wie zuvor) ---
async function login(password) {
    showLogInSuccess(); 
    const functions = firebase.app().functions('europe-west3');
    const validateAccess = functions.httpsCallable('validateAccessAndGenerateToken');

    try {
        const result = await validateAccess({ password: password });
        const customAuthToken = result.data.token;

        if (customAuthToken) {
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
            await firebase.auth().signInWithCustomToken(customAuthToken);
            console.log("Erfolgreich mit Custom Token angemeldet.");
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
    // finally Block wird nicht mehr benötigt, da init() vom Listener aufgerufen wird
}

// --- handleLogin (bleibt wie zuvor) ---
function handleLogin(event) {
    event.preventDefault();
    const passwordInput = document.getElementById("loginInput");
    const password = passwordInput.value;
    // Button/Input Deaktivierung passiert jetzt am Anfang von login()
    login(password); // Ruft login auf, aber init() wird vom Listener gesteuert
}

// --- showErrorBanner (bleibt wie zuvor) ---
function showErrorBanner(message) {
    hideLogInSuccess(); // Versteckt Erfolgsmeldung bei Fehler
    const errorBanner = document.getElementById("errorBanner");
    if (!errorBanner) return; // Sicherstellen, dass das Element existiert
    errorBanner.textContent = message;
    errorBanner.classList.add("show");
    setTimeout(() => {
        errorBanner.classList.remove("show");
    }, 3000);
}

// --- init (bleibt wie zuvor, wird aber vom Listener aufgerufen) ---
async function init() {
    if (isInitialized) return; // Verhindert mehrfachen Aufruf
    isInitialized = true;
    console.log("Initialisiere Anwendung...");


    removeOverlay(); // Entfernt Login-Overlay

    try {
        // Lade notwendige Daten
        await Promise.all([
            getData('navAids'),
            getData('aerodromes'),
            getData('obstacles'),
            getData('aipInfo')
            // Füge hier weitere initiale getData-Aufrufe hinzu, falls nötig
        ]);

        // Karteninitialisierung, falls map verfügbar ist
        if (typeof map !== 'undefined' && map) {
            showCursorCoordinates(map);
        } else {
            console.warn("Karte (map) ist noch nicht initialisiert in init().");
            // Ggf. warten oder später initialisieren
        }
        console.log("Anwendung initialisiert.");

    } catch (error) {
        console.error("Fehler während der Initialisierung:", error);
        showErrorBanner("Fehler beim Laden der Anwendungsdaten.");
        isInitialized = false;
        hideLogInSuccess(); // Versteckt Erfolgsmeldung bei Fehler
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
    console.log('');
    
    const loginSuccess = document.getElementById("loginSuccess");
    loginSuccess.classList.add("d-none");

}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log("Benutzer ist angemeldet:", user.uid);
                init();
            } else {
                console.log("Benutzer ist nicht angemeldet.");
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
        });
    } else {
        console.error("Firebase Auth konnte nicht initialisiert werden. Listener nicht angehängt.");
        showErrorBanner("Fehler bei der Initialisierung. Bitte Seite neu laden.");
    }
});