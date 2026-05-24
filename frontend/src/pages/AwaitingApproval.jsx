import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, RefreshCw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearDraft } from '../utils/localStorage';

export default function AwaitingApproval() {
  const { user, authFetch, logout } = useAuth();
  const navigate = useNavigate();
  const [assocStatus, setAssocStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [checking, setChecking] = useState(true);

  const checkStatus = async () => {
    setChecking(true);
    try {
      // Check associate record status
      if (user?.associateRecordId) {
        const res  = await authFetch(`/api/associates/${user.associateRecordId}`);
        const data = await res.json();
        if (data.success) {
          setAssocStatus(data.data.status);
          if (data.data.status === 'approved') {
            navigate('/admin/dashboard');
          }
        }
      } else {
        // No associate record yet — they haven't submitted the form
        setAssocStatus('no_record');
      }
    } catch {}
    finally { setChecking(false); }
  };

  useEffect(() => { checkStatus(); }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  // If rejected — send back to registration form
  if (assocStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0f4fa]">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Application Rejected</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your application was not approved. Please re-submit your registration form with correct details.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary w-full justify-center"
            >
              <FileText size={15} /> Re-submit Registration
            </button>
            <button onClick={handleLogout} className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline block mx-auto">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0f4fa]">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Awaiting Approval</h2>
          <p className="text-sm text-gray-500 mb-2">
            Your registration has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            A Head Admin or Admin will review your details and approve your account. You'll get access once approved.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-xs text-amber-700 font-medium">What happens next?</p>
            <ul className="text-xs text-amber-600 mt-1 space-y-1 list-disc list-inside">
              <li>Admin reviews your submitted details</li>
              <li>You'll be notified once approved</li>
              <li>After approval, you can access your dashboard</li>
            </ul>
          </div>

          <button
            onClick={checkStatus}
            disabled={checking}
            className="btn-secondary w-full justify-center mb-3"
          >
            <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking…' : 'Check Status'}
          </button>

          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 underline block mx-auto">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
