/**
 * This file is for setting up the AuthProvider.
 * It helps to manage and provide authentication info to the rest of the app.
 * It now includes guest mode functionality.
 */
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../lib/useAuth';
import { signOut as firebaseSignOut } from '../lib/firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { user, loading } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Effect to reset guest mode when user logs in
  useEffect(() => {
    if (user) {
      setIsGuestMode(false);
    }
  }, [user]);

  const authValue = {
    user,
    loading,
    isGuestMode,
    setGuestMode: (value) => {
      setIsGuestMode(value);
      // If entering guest mode, clear any existing auth
      if (value) {
        firebaseSignOut();
      }
    },
    signOut: async () => {
      await firebaseSignOut();
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