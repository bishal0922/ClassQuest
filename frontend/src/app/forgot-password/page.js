"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { isValidUTAEmail } from '../lib/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidUTAEmail(email)) {
      setError('Please use a valid UTA email address (@mavs.uta.edu or @uta.edu)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess('Password reset email sent. Please check your inbox.');
      setEmail('');
    } catch (error) {
      console.error('Error sending reset email:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-indigo-50">
      <div className="w-full max-w-md mx-4 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your UTA email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setSuccess('');
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                Sending...
              </div>
            ) : (
              'Send reset instructions'
            )}
          </button>

          <Link
            href="/login"
            className="w-full flex justify-center items-center py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;