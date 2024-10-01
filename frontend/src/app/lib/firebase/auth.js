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