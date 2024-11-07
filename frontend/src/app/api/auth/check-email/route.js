// src/app/api/auth/check-email/route.js

import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase/firebase-config';
import { isValidUTAEmail } from '../../../lib/authService';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Check if email is valid UTA email
    if (!isValidUTAEmail(email)) {
      return NextResponse.json(
        { message: 'Please use a valid UTA email address (@mavs.uta.edu or @uta.edu)' },
        { status: 400 }
      );
    }

    // Try to sign in with a dummy password to check if email exists
    try {
      await signInWithEmailAndPassword(auth, email, 'dummy-password');
      // If we reach here, the email exists (shouldn't happen with dummy password)
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    } catch (error) {
      // If error code is user-not-found, that's good - we can create new user
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({ message: 'Email available' }, { status: 200 });
      }
      
      // If error is too-many-requests, return appropriate error
      if (error.code === 'auth/too-many-requests') {
        return NextResponse.json(
          { message: 'Too many attempts. Please try again later' },
          { status: 429 }
        );
      }
      
      // For other errors, check if it's something we need to handle
      throw error;
    }
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { message: 'Error checking email availability' },
      { status: 500 }
    );
  }
}