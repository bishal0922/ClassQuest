/**
 * This file contains the useAuth hook, which helps us manage user authentication state in our application.
 * 
 * We import the necessary functions and modules:
 * - `useState` and `useEffect` from React: These hooks help us manage state and side effects in our component.
 * - `onAuthStateChanged` from Firebase's auth module: This function allows us to listen for changes in the authentication state.
 * - `auth` from our firebase-config file: This is our Firebase authentication instance that we configured earlier.
 * 
 * The useAuth hook will:
 * - Keep track of the current user and loading state.
 * - Use the `onAuthStateChanged` function to update the user state whenever the authentication state changes.
 * - Return the current user and loading state so that other components can use this information.
 */
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase-config';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}