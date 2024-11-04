// src/app/map/page.js
"use client"
import dynamic from 'next/dynamic';
import { useAuthContext } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Lock } from 'lucide-react';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
});

const RestrictedMapAccess = () => {
  return (
    <div className="h-[500px] w-full flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center max-w-md px-4">
        <div className="inline-block p-3 bg-yellow-100 rounded-full mb-4">
          <Lock className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Map Access Restricted</h2>
        <p className="text-gray-600 mb-6">
          The interactive map feature is only available for registered users. Sign up now to access real-time location tracking and more!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/signup"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign Up Now
          </a>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Log In
          </a>
        </div>
      </div>
    </div>
  );
};

const MapPage = () => {
  const { isGuestMode } = useAuthContext();
  const router = useRouter();

  // completely prevent access
  useEffect(() => {
    if (isGuestMode) {
      router.push('/');
    }
  }, [isGuestMode, router]);

  if (isGuestMode) {
    return <RestrictedMapAccess />;
  }

  return (
    <>
      <MapComponent />
    </>
  );
};

export default MapPage;