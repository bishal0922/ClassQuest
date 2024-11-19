import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase/firebase-config';
import { applyActionCode } from 'firebase/auth';

export async function POST(request) {
  try {
    const { oobCode } = await request.json();
    
    console.log('Verifying email with code:', oobCode);

    if (!oobCode) {
      return NextResponse.json(
        { message: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Apply the verification code
    await applyActionCode(auth, oobCode);

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    
    const errorMessage = error.code === 'auth/invalid-action-code'
      ? 'The verification link has expired or already been used'
      : 'Failed to verify email';

    return NextResponse.json(
      { message: errorMessage, error: error.code },
      { status: 400 }
    );
  }
}