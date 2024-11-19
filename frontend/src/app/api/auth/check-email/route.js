import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase/firebase-config';
import { isValidUTAEmail } from '../../../lib/authService';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

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

    // Check if email exists in Firebase
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length > 0) {
        // Email exists
        return NextResponse.json(
          { message: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      
      // Email is available
      return NextResponse.json(
        { message: 'Email available' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Firebase error:', error);
      
      if (error.code === 'auth/too-many-requests') {
        return NextResponse.json(
          { message: 'Too many attempts. Please try again later' },
          { status: 429 }
        );
      }

      // Handle other Firebase errors
      return NextResponse.json(
        { message: 'Error checking email availability', error: error.code },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { message: 'Server error checking email availability' },
      { status: 500 }
    );
  }
}