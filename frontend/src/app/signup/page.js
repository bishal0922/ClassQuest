/**
 * The useRouter hook from Next.js is used to navigate the user to the login page upon successful signup.
 * 
 * The useEffect hook is used to log the auth object to the console when the component mounts.
 * 
 * The handleChange function updates the form data state whenever the user types into the input fields.
 * The handleSubmit function handles the form submission, attempts to sign up the user using the signUp function,
 * updates the user's profile with their username, and redirects them to the login page if successful.
 * If there's an error during sign-up, it sets the error state to display an error message.
 * 
 * The component returns a JSX structure that includes the form and any error messages.
 * The form has input fields for the username, email, and password, and a submit button to sign up.
 */
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, signOut } from '../lib/firebase/auth';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase/firebase-config';
import { createUser, getUserByFirebaseId } from '../lib/userModel';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.endsWith('@mavs.uta.edu')) {
      setError('Please use a valid UTA email address (@mavs.uta.edu)');
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
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if user already exists
      const existingUser = await getUserByFirebaseId(formData.email);
      if (existingUser) {
        setError('An account with this email already exists. Please log in.');
        setIsLoading(false);
        return;
      }

      // Create user in Firebase
      const userCredential = await signUp(formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.username });
      
      // Create user in MongoDB
      await createUser({
        firebaseId: userCredential.user.uid,
        email: formData.email,
        displayName: formData.username,
        schedule: {
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
        }
      });

      setSuccessMessage('Account created successfully. Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      console.error("Error during sign up:", error);
      setError(error.message || 'An error occurred during sign up. Please try again.');
      
      // If MongoDB creation fails, sign out the user from Firebase
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Error signing out after failed signup:", signOutError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
          Sign up for ClassQuest
        </h2>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={handleChange}
              value={formData.username}
            />
          </div>
  
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              UTA Email address
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
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>
  
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
  
        <div className="text-sm text-center">
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