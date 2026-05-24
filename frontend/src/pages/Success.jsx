import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, FileText, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Success() {
  const { state } = useLocation();
  const associateId = state?.associateId || 'ASCXXXXXX';
  const name = state?.name || 'Associate';

  const copyId = () => {
    navigator.clipboard.writeText(associateId);
    toast.success('Associate ID copied!');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="card p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Submitted!</h1>
        <p className="text-gray-500 mb-6">
          Congratulations <strong>{name}</strong>! Your associate registration has been submitted successfully.
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Your Associate ID</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-[#1a3a5c] font-mono tracking-wider">{associateId}</span>
            <button onClick={copyId} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Copy size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Save this ID for future reference</p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-8 text-left">
          <p className="text-xs text-amber-700 font-semibold mb-1">What happens next?</p>
          <ul className="text-xs text-amber-600 space-y-1">
            <li>• Your documents will be verified within 3–5 working days</li>
            <li>• You'll receive a confirmation on your registered mobile and email</li>
            <li>• Your associate kit will be dispatched after approval</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-secondary">
            <Home size={15} /> Go Home
          </Link>
          <Link to="/report" state={{ associateId }} className="btn-primary">
            <FileText size={15} /> View Report
          </Link>
        </div>
      </div>
    </div>
  );
}
