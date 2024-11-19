"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { sendEmailVerification, applyActionCode, reload } from 'firebase/auth';
import { auth } from '../lib/firebase/firebase-config';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { updateEmailVerificationStatus } from '../lib/userModel';

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode');
      
      if (!oobCode) return;

      try {
        setVerificationStatus('verifying');
        console.log('Starting email verification process...');
        
        // Apply the verification code
        await applyActionCode(auth, oobCode);
        console.log('Email verified in Firebase');
        
        // Reload the user to get updated emailVerified status
        if (auth.currentUser) {
          console.log('Reloading user to get updated status...');
          await reload(auth.currentUser);
          
          setIsUpdating(true);
          try {
            // Update MongoDB record
            console.log('Updating verification status in database...');
            await updateEmailVerificationStatus(auth.currentUser.uid, true);
            console.log('Database updated successfully');
          } catch (dbError) {
            console.error('Error updating database:', dbError);
          } finally {
            setIsUpdating(false);
          }
        }

        setVerificationStatus('success');
        
        // Clear verification data
        localStorage.removeItem('verificationSentAt');
        localStorage.removeItem('verificationEmail');

        // Redirect after successful verification
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setError(error.message);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  // Redirect if already verified
  useEffect(() => {
    if (auth.currentUser?.emailVerified) {
      router.push('/');
    }
  }, [router]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendStatus('');
    setError('');

    try {
      const lastSentTime = parseInt(localStorage.getItem('verificationSentAt') || '0');
      const timeSinceLastSent = Date.now() - lastSentTime;

      if (timeSinceLastSent < 60000) { // 1 minute cooldown
        throw new Error('Please wait a minute before requesting another verification email.');
      }

      if (auth.currentUser) {
        const actionCodeSettings = {
          url: `${window.location.origin}/verify-email`,
          handleCodeInApp: true,
        };
        
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        localStorage.setItem('verificationSentAt', Date.now().toString());
        setResendStatus('success');
      } else {
        throw new Error('No user found. Please try logging in again.');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setResendStatus('error');
      setError(error.message);
    } finally {
      setIsResending(false);
    }
  };

  if (isUpdating) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-indigo-50">
        <div className="w-full max-w-md mx-4 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Updating verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-indigo-50">
      <div className="w-full max-w-md mx-4 bg-white p-8 rounded-lg shadow-md">
        {verificationStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-700">
                Email verified successfully! Redirecting to home page...
              </p>
            </div>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">
                {error || 'Failed to verify email. The link may have expired or already been used.'}
              </p>
            </div>
          </div>
        )}
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {verificationStatus === 'success' ? 'Email Verified!' : 'Verify your email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {verificationStatus === 'success' 
              ? 'Your email has been verified successfully.'
              : 'Please check your email for the verification link. If you don\'t see it, check your spam folder.'}
          </p>
        </div>

        {resendStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-700">
                Verification email sent successfully. Please check your inbox.
              </p>
            </div>
          </div>
        )}

        {resendStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">
                {error || 'Failed to send verification email. Please try again.'}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={isResending || verificationStatus === 'success'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                Sending...
              </div>
            ) : (
              'Resend verification email'
            )}
          </button>

          <Link
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;