import React from 'react';
import { X, Lock } from 'lucide-react';
import Link from 'next/link';

const RestrictedFeatureModal = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="p-2 bg-yellow-100 rounded-full">
            <Lock className="h-6 w-6 text-yellow-600" />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Feature Restricted
        </h3>
        
        <p className="text-gray-600 mb-4">
          {featureName} is only available for registered UTA users. Sign up now to unlock all features!
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link 
            href="/signup"
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-center hover:bg-indigo-700 transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/login" 
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-center hover:bg-gray-50 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestrictedFeatureModal;