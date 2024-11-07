// src/app/lib/authService.js

/**
 * Utility functions for UTA-specific authentication requirements
 */


import { sendEmailVerification as firebaseSendEmailVerification } from 'firebase/auth';

const UTA_EMAIL_DOMAINS = ['@mavs.uta.edu', '@uta.edu'];

export const isValidUTAEmail = (email) => {
  if (!email) return false;
  return UTA_EMAIL_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
};
  
  export const checkEmailVerified = (user) => {
    return user?.emailVerified || false;
  };
  

export const formatAuthError = (error) => {
  const errorCode = error?.code || '';
  
  const errorMessages = {
    'auth/email-already-in-use': 'An account with this email already exists. Please log in.',
    'auth/invalid-email': 'Please enter a valid UTA email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign in was cancelled. Please try again.',
    'auth/unverified-email': 'Please verify your email address before logging in.',
    'auth/email-verification-failed': 'Failed to send verification email. Please try again.',
  };

  return errorMessages[errorCode] || error?.message || 'An unexpected error occurred. Please try again.';
};

export const sendEmailVerification = async (user) => {
  try {
    const actionCodeSettings = {
      url: process.env.NEXT_PUBLIC_VERIFICATION_REDIRECT_URL || `${window.location.origin}/login`,
      handleCodeInApp: true,
    };

    await firebaseSendEmailVerification(user, actionCodeSettings);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};