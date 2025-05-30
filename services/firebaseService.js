import { initializeApp } from 'firebase/app';
import {
    getAuth,
    setPersistence as fbSetPersistence,
    browserSessionPersistence as fbBrowserSessionPersistence,
    signInWithCustomToken as fbSignInWithCustomToken,
    onAuthStateChanged as fbOnAuthStateChanged
} from 'firebase/auth';
import {
    getDatabase,
    ref as fbDbRef,
    get as fbDbGet
} from 'firebase/database';
import {
    getFunctions,
    httpsCallable as fbHttpsCallable
} from 'firebase/functions';

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

const app = initializeApp(firebaseConfig);
const authInstance = getAuth(app);
const databaseInstance = getDatabase(app);
const functionsInstance = getFunctions(app, 'europe-west3');

// Stelle Firebase-Instanzen und SDK-Funktionen global bereit
window.firebaseGlobalAccess = {
    // Firebase Service Instanzen
    app: app,
    auth: authInstance,
    database: databaseInstance,
    functions: functionsInstance,

    // Firebase Auth SDK Funktionen
    setAuthPersistence: fbSetPersistence,
    browserSessionPersistence: fbBrowserSessionPersistence,
    signInWithCustomToken: fbSignInWithCustomToken,
    onAuthStateChanged: fbOnAuthStateChanged,

    // Firebase Database SDK Funktionen
    dbRef: fbDbRef,
    dbGet: fbDbGet,

    // Firebase Functions SDK Funktionen
    httpsCallable: fbHttpsCallable,
};

// Kein 'export' hier nötig, da die Bereitstellung über window.firebaseGlobalAccess erfolgt
// und dieses Skript als Modul geladen wird, das Nebeneffekte (window-Zuweisung) hat.