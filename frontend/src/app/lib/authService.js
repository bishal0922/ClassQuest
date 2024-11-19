// src/app/lib/authService.js

/**
 * Utility functions for UTA-specific authentication requirements
 */


import { sendEmailVerification as firebaseSendEmailVerification } from 'firebase/auth';

const UTA_EMAIL_DOMAINS = ['@mavs.uta.edu', '@uta.edu'];

export const isValidUTAEmail = (email) => {
  if (!email) return false;
  
  // Convert email to lowercase for comparison
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if email follows basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) return false;
  
  // Check if email ends with valid UTA domain
  return UTA_EMAIL_DOMAINS.some(domain => 
    normalizedEmail.endsWith(domain.toLowerCase())
  );
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
    'auth/invalid-action-code': 'The verification link is invalid or has expired. Please request a new one.',
    'auth/expired-action-code': 'The verification link has expired. Please request a new one.',
  };

  return errorMessages[errorCode] || error?.message || 'An unexpected error occurred. Please try again.';
};

export const sendEmailVerification = async (user) => {
  try {
    if (!user) throw new Error('No user provided for email verification');

    const actionCodeSettings = {
      url: process.env.NEXT_PUBLIC_VERIFICATION_REDIRECT_URL || 
           `${window.location.origin}/login`,
      handleCodeInApp: true,
    };

    await firebaseSendEmailVerification(user, actionCodeSettings);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const validateVerificationSession = (session) => {
  if (!session) return false;
  
  const now = Date.now();
  const sessionStart = new Date(session.startTime).getTime();
  const sessionExpiry = new Date(session.expiryTime).getTime();
  
  return now >= sessionStart && now <= sessionExpiry;
};