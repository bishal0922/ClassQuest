/**
 * This file handles authentication-related functions using Firebase.
 * 
 * We import the necessary functions from Firebase's authentication module.
 * 
 * - `auth`: This is our Firebase authentication instance, which we configured in `firebase-config.js`.
 * - `createUserWithEmailAndPassword`: This function allows us to create a new user with an email and password.
 * - `signInWithEmailAndPassword`: This function allows us to sign in an existing user with an email and password.
 * - `onAuthStateChanged`: This function is used to listen for changes in the authentication state (e.g., when a user signs in or out).
 * - `signOut`: This function allows us to sign out the currently signed-in user.
 * 
 * We alias `onAuthStateChanged` and `signOut` to `_onAuthStateChanged` and `_signOut` respectively to avoid naming conflicts with our own functions.
 */
import { auth } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged as _onAuthStateChanged, signOut as _signOut } from 'firebase/auth';

export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

export async function signUp(email, password) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function signIn(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    return await _signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}