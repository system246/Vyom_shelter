import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api','') || '';
const QR_URL = (text) => `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(text)}`;

export default function IDCard() {
  const { user, authFetch } = useAuth();
  const [assoc, setAssoc]   = useState(null);
  const cardRef = useRef();

  useEffect(() => {
    if (user?.associateRecordId) {
      authFetch(`/api/associates/${user.associateRecordId}`)
        .then(r => r.json()).then(d => { if (d.success) setAssoc(d.data); }).catch(() => {});
    } else if (user?.role === 'associate') {
      authFetch(`/api/associates?limit=1`)
        .then(r => r.json()).then(d => { if (d.success && d.data?.[0]) setAssoc(d.data[0]); }).catch(() => {});
    }
  }, [user]);

  const photoUrl = user?.profile?.photoUrl
    ? `${API_URL}/uploads/${user.profile.photoUrl}`
    : null;

  const handlePrint = () => window.print();

  const data = assoc?.personal || {};
  const refData = assoc?.referral || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <BackButton />
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-xl font-bold text-[#1a3a5c]">Associate ID Card</h1>
        <button onClick={handlePrint} className="btn-primary"><Printer size={14}/> Print ID Card</button>
      </div>

      {/* ID Card */}
      <div ref={cardRef} className="mx-auto print:mx-0" style={{ maxWidth: 420 }}>
        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 print:shadow-none">
          {/* Header */}
          <div className="bg-[#1a3a5c] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg leading-tight">Associate Portal</p>
              <p className="text-blue-200 text-xs mt-0.5">Official Identity Card</p>
            </div>
            <div className="w-10 h-10 bg-[#e85d26] rounded-lg flex items-center justify-center font-bold text-white text-xl">A</div>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-5">
            <div className="flex gap-4 items-start">
              {/* Photo */}
              <div className="flex-shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-20 h-20 rounded-xl object-cover border-2 border-[#1a3a5c]" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-[#1a3a5c] flex items-center justify-center text-2xl font-bold text-[#1a3a5c]">
                    {user?.profile?.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1a3a5c] text-lg leading-tight">{data.fullName || user?.profile?.fullName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{data.sdwo ? `S/D/W/O: ${data.sdwo}` : ''}</p>
                <div className="mt-2 space-y-1">
                  {assoc?.associateId && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">ID</span>
                      <span className="text-xs font-bold text-[#1a3a5c] font-mono">{assoc.associateId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16">Mobile</span>
                    <span className="text-xs text-gray-700">{data.mobile || user?.profile?.mobile || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16">Status</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      assoc?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{assoc?.status || 'pending'}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex-shrink-0">
                <img
                  src={QR_URL(assoc?.associateId || user?.email || 'Associate')}
                  alt="QR"
                  className="w-20 h-20 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Issued: {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
            </p>
            <p className="text-xs text-gray-400">associate-portal.vercel.app</p>
          </div>
        </div>
      </div>

      {!assoc && (
        <p className="text-center text-sm text-gray-400 mt-6">
          Complete your registration to generate your ID card.
        </p>
      )}
    </div>
  );
}
