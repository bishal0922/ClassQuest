// src/app/lib/authService.js

/**
 * Utility functions for UTA-specific authentication requirements
 */

const UTA_EMAIL_DOMAINS = ['@mavs.uta.edu', '@uta.edu'];

export const isValidUTAEmail = (email) => {
  if (!email) return false;
  return UTA_EMAIL_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
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
    'auth/popup-closed-by-user': 'Sign in was cancelled. Please try again.'
  };

  return errorMessages[errorCode] || error?.message || 'An unexpected error occurred. Please try again.';
};