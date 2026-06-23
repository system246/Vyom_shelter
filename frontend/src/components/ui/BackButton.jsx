import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Consistent "go back" control for every inner page (profile, ID card,
 * reports, admin sub-pages...). Falls back to a given route if there's
 * nothing sensible in browser history (e.g. opened in a new tab).
 */
export default function BackButton({ to, label = 'Back' }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) return navigate(to);
    if (window.history.length > 2) return navigate(-1);
    navigate('/admin/dashboard');
  };
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#1a3a5c] mb-4 transition-colors print:hidden"
    >
      <ArrowLeft size={15} /> {label}
    </button>
  );
}
