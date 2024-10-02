/**
 * This file is responsible for setting up and configuring Firebase for our application.
 * 
 * We import the necessary functions from Firebase's app and auth modules.
 * 
 * - `initializeApp`: This function initializes a Firebase app instance with the provided configuration.
 * - `getApps`: This function returns an array of all initialized Firebase app instances.
 * - `getAuth`: This function returns the authentication instance associated with the provided Firebase app.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth};