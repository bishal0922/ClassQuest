// src/app/components/AuthProvider.js
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase/firebase-config';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If user exists but email is not verified
        if (!firebaseUser.emailVerified) {
          // Only allow access to verification page
          if (pathname !== '/verify-email') {
            router.push('/verify-email');
          }
          setUser(null);
        } else {
          // Email is verified, set user
          setUser(firebaseUser);
          if (pathname === '/verify-email' || pathname === '/signup' || pathname === '/login') {
            router.push('/');
          }
        }
      } else {
        setUser(null);
        // If not in guest mode and trying to access protected routes
        if (!isGuestMode && isProtectedRoute(pathname)) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, isGuestMode]);

  const isProtectedRoute = (path) => {
    const protectedRoutes = ['/schedule', '/search', '/compare', '/directions', '/map'];
    return protectedRoutes.includes(path);
  };

  const authValue = {
    user,
    loading,
    isGuestMode,
    setGuestMode: (value) => {
      setIsGuestMode(value);
      if (value) {
        firebaseSignOut(auth);
      }
    },
    signOut: async () => {
      await firebaseSignOut(auth);
      setIsGuestMode(false);
      router.push('/');
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