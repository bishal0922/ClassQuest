import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase/firebase-config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { isValidUTAEmail } from '../../../lib/authService';

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

    // Send password reset email
    await sendPasswordResetEmail(auth, email, {
      url: process.env.NEXT_PUBLIC_PASSWORD_RESET_REDIRECT_URL || 'http://localhost:3000/login',
      handleCodeInApp: true,
    });

    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    
    const errorMessage = error.code === 'auth/user-not-found'
      ? 'No account found with this email address'
      : 'Failed to send password reset email';

    return NextResponse.json(
      { message: errorMessage, error: error.code },
      { status: 400 }
    );
  }
}