import dynamic from 'next/dynamic';

// Dynamically import the Home component with no SSR
const HomePage = dynamic(() => import('@/components/HomePage'), { ssr: false });

export default function Page() {
  return <HomePage />;
}
