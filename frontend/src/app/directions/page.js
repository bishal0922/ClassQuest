// src/app/directions/page.js
import dynamic from 'next/dynamic';
import MapInitializer from '../components/MapInitializer';

const Directions = dynamic(() => import('../components/Directions'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
});

const DirectionsPage = () => {
  return (
    <>
      <MapInitializer />
      <Directions />
    </>
  );
};

export default DirectionsPage;