import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyCnWriy9BZP07DmXSJAWokByxKo5_tYuiI",
    authDomain: "internarea-3ba8a.firebaseapp.com",
    projectId: "internarea-3ba8a",
    storageBucket: "internarea-3ba8a.firebasestorage.app",
    messagingSenderId: "843153222077",
    appId: "1:843153222077:web:f727e608189eaab1310ad4",
    measurementId: "G-B2XKZDT486"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }                                           