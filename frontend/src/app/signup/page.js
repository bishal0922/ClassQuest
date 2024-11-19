// src/app/signup/page.js
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth'; // Added updateProfile import
import { auth } from '../lib/firebase/firebase-config';
import { Eye, EyeOff } from 'lucide-react';
import { isValidUTAEmail, formatAuthError } from '../lib/authService';
import { createUser } from '../lib/userModel';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!isValidUTAEmail(formData.email)) {
      setError('Please use a valid UTA email address (@mavs.uta.edu or @uta.edu)');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);
    console.log('Starting signup process...');

    try {
      // Check email availability
      console.log('Checking email availability...');
      const checkEmailResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const checkEmailData = await checkEmailResponse.json();

      if (!checkEmailResponse.ok) {
        throw new Error(checkEmailData.message || 'Failed to create account');
      }

      console.log('Email check passed, creating user...');

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      console.log('Firebase user created:', user.uid);

      // Update profile with display name
      await updateProfile(user, {
        displayName: formData.username
      });
      console.log('Profile updated with display name');

      // Send verification email
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email?mode=verifyEmail`,
        handleCodeInApp: true,
      };

      console.log('Sending verification email...');
      await sendEmailVerification(user, actionCodeSettings);
      console.log('Verification email sent successfully');

      // Create user in MongoDB
      console.log('Creating user in database...');
      await createUser({
        firebaseId: user.uid,
        email: formData.email,
        displayName: formData.username,
        emailVerified: false,
        schedule: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: []
        }
      });
      console.log('User created successfully in database');

      // Store verification data
      localStorage.setItem('verificationSentAt', Date.now().toString());
      localStorage.setItem('pendingVerificationEmail', formData.email);

      // Redirect to verification page
      router.push('/verify-email');
    } catch (error) {
      console.error('Error during sign up:', error);
      
      // Clean up if anything fails
      try {
        if (auth.currentUser) {
          await auth.currentUser.delete();
        }
      } catch (deleteError) {
        console.error('Error cleaning up after failed signup:', deleteError);
      }

      setError(formatAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-indigo-50">
      <div className="w-full max-w-md mx-4 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join ClassQuest with your UTA email
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="John Doe"
              onChange={handleChange}
              value={formData.username}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              UTA Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="youremail@mavs.uta.edu"
              onChange={handleChange}
              value={formData.email}
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be a valid @mavs.uta.edu or @uta.edu email
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={handleChange}
                value={formData.password}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 
                  <EyeOff className="h-5 w-5 text-gray-400" /> : 
                  <Eye className="h-5 w-5 text-gray-400" />
                }
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters long
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                Creating account...
              </div>
            ) : (
              'Sign up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;