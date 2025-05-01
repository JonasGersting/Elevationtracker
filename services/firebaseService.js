// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyCWsmUh_XdU95JquEVer_UPPhmehnHztvE",
    authDomain: "aromaps-3b242.firebaseapp.com",
    databaseURL: "https://aromaps-3b242-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "aromaps-3b242",
    storageBucket: "aromaps-3b242.firebasestorage.app",
    messagingSenderId: "331646826678",
    appId: "1:331646826678:web:e4d126d148280be7744e17",
    measurementId: "G-BS3BDK1C03"
  };

  // Firebase initialisieren
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const database = firebase.database();

  // Mach Firebase-Objekte global verfügbar
  window.firebaseApp = app;
  window.firebaseAuth = auth;
  window.firebaseDatabase = database;

  console.log("Firebase wurde initialisiert und ist global verfügbar.");

