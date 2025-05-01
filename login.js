async function login(password) {
    const auth = firebase.auth(); // Zugriff auf das globale Firebase-Auth-Objekt
    try {
        const userCredential = await auth.signInWithEmailAndPassword("aromaps@aromaps.de", password);
        const token = await userCredential.user.getIdToken(); // Hole das ID-Token
        sessionStorage.setItem("accessToken", token); // Speichere das Token in sessionStorage
        console.log("Login erfolgreich, Token gespeichert.");

        // Login-Overlay ausblenden
        const loginOverlay = document.getElementById("login");
        loginOverlay.classList.add("hidden"); // Füge die Klasse für die Animation hinzu

        // Initialisiere die Anwendung
        init();
    } catch (error) {
        console.error("Login fehlgeschlagen:", error.message);
        showErrorBanner("Das Passwort war nicht korrekt");
    }
}

function handleLogin(event) {
    event.preventDefault(); // Verhindert das Neuladen der Seite
    const password = document.getElementById("loginInput").value;
    login(password); // Übergibt den Wert an die login-Funktion
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

document.addEventListener("DOMContentLoaded", () => {
    // login("aromaps@aromaps.de", "123456");    
});