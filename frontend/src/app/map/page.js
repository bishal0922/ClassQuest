"use client"

import dynamic from 'next/dynamic';

// Dynamically import the MapComponent with no SSR
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
});

const MapPage = () => {
  return <MapComponent />;
};

export default MapPage;