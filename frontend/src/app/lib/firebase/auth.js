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
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged as _onAuthStateChanged, 
  signOut as _signOut,
  sendEmailVerification as _sendEmailVerification
} from 'firebase/auth';
import { createUser, getUserByFirebaseId } from '../userModel';

export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Check if user exists in MongoDB
        const dbUser = await getUserByFirebaseId(user.uid);
        if (!dbUser) {
          // Create initial user document
          await createUser({
            firebaseId: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            schedule: {
              Monday: [], 
              Tuesday: [], 
              Wednesday: [], 
              Thursday: [], 
              Friday: []
            }
          });
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      }
    }
    cb(user);
  });
}

export async function signUp(email, password, displayName = '') {
  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email
    await _sendEmailVerification(userCredential.user, {
      url: process.env.NEXT_PUBLIC_VERIFICATION_REDIRECT_URL || 'http://localhost:3000/login',
    });

    // Create MongoDB user document
    await createUser({
      firebaseId: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName,
      emailVerified: false,
      schedule: {
        Monday: [], 
        Tuesday: [], 
        Wednesday: [], 
        Thursday: [], 
        Friday: []
      }
    });

    return userCredential;
  } catch (error) {
    console.error("Error signing up:", error);
    // Clean up if MongoDB creation fails
    try {
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
    } catch (deleteError) {
      console.error("Error cleaning up Firebase user:", deleteError);
    }
    throw error;
  }
}

export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      throw { code: 'auth/unverified-email' };
    }
    
    return userCredential;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}
export async function signOut() {
  try {
    await _signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}