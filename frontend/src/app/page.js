"use client"
import React from 'react';
import { useAuthContext } from './components/AuthProvider';
import { useRouter } from 'next/navigation';

const Home = () => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to ClassQuest</h1>
        <p className="text-xl text-gray-600 mb-8">Effortlessly sync your schedules with friends and colleagues.</p>
        
        {user ? (
          <div>
            <p className="text-lg text-gray-800 mb-4">Hello, {user.displayName || user.email}!</p>
            <button 
              onClick={() => router.push('/schedule')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View My Schedule
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <button 
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/signup')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;