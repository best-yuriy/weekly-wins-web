// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBoZ8w8ezsm4xjDn3iwjTeh53NbA2NQe6Y',
  authDomain: 'weeklywinsnow.firebaseapp.com',
  projectId: 'weeklywinsnow',
  storageBucket: 'weeklywinsnow.firebasestorage.app',
  messagingSenderId: '94380753356',
  appId: '1:94380753356:web:3f887bee0d2e890ef79d69',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Vite replaces import.meta.env at build time
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_FIREBASE_AUTH_EMULATOR === 'true'
) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}

export { app, auth };
