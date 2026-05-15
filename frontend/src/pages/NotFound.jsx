import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-8xl font-bold text-[#1a3a5c]/10 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-700 mb-2">Page Not Found</h1>
      <p className="text-gray-400 text-sm mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-flex">
        <Home size={15} /> Go Home
      </Link>
    </div>
  );
}
