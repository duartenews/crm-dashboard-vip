import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAs30GJ9HgyI2e6mkKLtTMnGcVjthFfpNI",
    authDomain: "crm-insta.firebaseapp.com",
    projectId: "crm-insta",
    storageBucket: "crm-insta.firebasestorage.app",
    messagingSenderId: "134024509361",
    appId: "1:134024509361:web:93f3e05e52ae869a28baf3",
    measurementId: "G-B4YJLV6PQ9"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
