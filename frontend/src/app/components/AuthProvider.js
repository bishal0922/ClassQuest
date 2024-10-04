/**
 * This file is for setting up the AuthProvider.
 * It helps to manage and provide authentication info to the rest of the app.
 * It now includes guest mode functionality.
 */
"use client";
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { signOut as firebaseSignOut } from '../lib/firebase/auth'; // Import the signOut function from your auth file

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);

  const authValue = {
    ...auth,
    isGuestMode,
    setGuestMode: (value) => {
      setIsGuestMode(value);
      // If entering guest mode, clear any existing auth
      if (value) {
        firebaseSignOut(); // Use the imported signOut function
      }
    },
    signOut: async () => {
      await firebaseSignOut(); // Use the imported signOut function
      setIsGuestMode(false);
    }
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}