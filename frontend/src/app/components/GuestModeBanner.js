import React from 'react';
import { AlertTriangle } from 'lucide-react';

const GuestModeBanner = () => {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
      <div className="flex items-center">
        <AlertTriangle className="mr-2" />
        <p className="font-bold">Guest Mode</p>
      </div>
      <p className="text-sm">You're browsing as a guest. Your data won't be saved. Sign up for full access!</p>
    </div>
  );
};

export default GuestModeBanner;