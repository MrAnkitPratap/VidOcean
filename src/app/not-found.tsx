// app/not-found.tsx
import Link from 'next/link';

// 🔥 SEPARATE VIEWPORT EXPORT
export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#0891b2',
};

export const metadata = {
  title: '404 - Page Not Found | vidocean',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="mb-4">Could not find the requested resource.</p>
        <Link href="/" className="text-blue-500 hover:underline">
          Return Home
        </Link>
      </div>
    </div>
  );
}
