// app/not-found.tsx
import Link from 'next/link';
import type { Viewport } from 'next';

export const metadata = {
  title: '404 - Page Not Found | vidocean',
  description: 'The page you are looking for could not be found.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0891b2',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="mb-4">Could not find the requested resource.</p>
        <Link href="/" className="text-cyan-400 hover:underline">
          Return Home
        </Link>
      </div>
    </div>
  );
}
