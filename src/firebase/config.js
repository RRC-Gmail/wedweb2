import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCakVpf30pT8FkdYR-HhjiqrxvdZRgowIE",
    authDomain: "wedweb-eabd8.firebaseapp.com",
    projectId: "wedweb-eabd8",
    storageBucket: "wedweb-eabd8.firebasestorage.app",
    messagingSenderId: "585054419841",
    appId: "1:585054419841:web:0254b9dcfd751d1d820680",
    measurementId: "G-G0WQJP8PFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
