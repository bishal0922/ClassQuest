// Importing the Directions component from the components directory
import dynamic from 'next/dynamic';

const Directions = dynamic(() => import('../components/Directions'), {
  ssr: false,
});

export default function DirectionsPage() {
  return <Directions />;
}