import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { Printer, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api','') || '';
const QR_URL  = (text) => `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;

const ROLE_LABEL = {
  head_admin: 'Head Admin',
  admin:      'Admin',
  associate:  'Associate',
};

export default function IDCard() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [assoc, setAssoc] = useState(null);

  useEffect(() => {
    if (user?.associateRecordId) {
      authFetch(`/api/associates/${user.associateRecordId}`)
        .then(r => r.json())
        .then(d => { if (d.success) setAssoc(d.data); })
        .catch(() => {});
    }
  }, [user]);

  const photoUrl = user?.profile?.photoUrl
    ? `${API_URL}/uploads/${user.profile.photoUrl}`
    : null;

  const data    = assoc?.personal || {};
  const address = [data.address, data.pincode].filter(Boolean).join(', ');

  // Effective roles for display
  const userRoles = [...new Set([user?.role, ...(user?.roles || [])])];
  const isHead    = userRoles.includes('head_admin');
  const isAdminAndAssoc = userRoles.includes('admin') && user?.role === 'associate';
  const roleDisplay = isHead ? 'Head Admin'
    : isAdminAndAssoc ? 'Admin · Associate'
    : ROLE_LABEL[user?.role] || user?.role;

  const roleBg = isHead ? 'bg-purple-600'
    : userRoles.includes('admin') ? 'bg-blue-600'
    : 'bg-[#1a3a5c]';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <button onClick={() => navigate(-1)} className="btn-ghost border border-gray-200 p-1.5 rounded-lg">
          <ChevronLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-[#1a3a5c] flex-1">Associate ID Card</h1>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={14} /> Print
        </button>
      </div>

      {/* ID Card */}
      <div className="mx-auto" style={{ maxWidth: 400 }}>
        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 print:shadow-none bg-white">

          {/* Card Header */}
          <div className="bg-[#1a3a5c] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-base leading-tight">Associate Portal</p>
              <p className="text-blue-200 text-xs mt-0.5">Official Identity Card</p>
            </div>
            <div className="w-10 h-10 bg-[#e85d26] rounded-lg flex items-center justify-center font-bold text-white text-xl">A</div>
          </div>

          {/* Role stripe */}
          <div className={`${roleBg} px-6 py-1.5`}>
            <p className="text-white text-xs font-semibold tracking-widest uppercase">{roleDisplay}</p>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="flex gap-5 items-start">

              {/* Photo */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-24 h-24 rounded-xl object-cover border-2 border-[#1a3a5c]" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-[#1a3a5c]/10 border-2 border-[#1a3a5c] flex items-center justify-center text-3xl font-bold text-[#1a3a5c]">
                    {user?.profile?.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {/* QR below photo */}
                <img
                  src={QR_URL(assoc?.associateId || user?.email || 'Associate')}
                  alt="QR"
                  className="w-20 h-20 rounded-lg"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Name */}
                <div>
                  <p className="font-bold text-[#1a3a5c] text-lg leading-tight">
                    {data.fullName || user?.profile?.fullName}
                  </p>
                  {data.sdwo && <p className="text-xs text-gray-400 mt-0.5">S/D/W/O: {data.sdwo}</p>}
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  {assoc?.associateId && (
                    <InfoRow label="ID" value={assoc.associateId} mono />
                  )}
                  {user?.email && (
                    <InfoRow label="Email" value={user.email} />
                  )}
                  {(data.mobile || user?.profile?.mobile) && (
                    <InfoRow label="Mobile" value={data.mobile || user?.profile?.mobile} />
                  )}
                  {address && (
                    <InfoRow label="Address" value={address} />
                  )}
                  {assoc?.referral?.circle && (
                    <InfoRow label="Circle" value={assoc.referral.circle} />
                  )}
                </div>

                {/* Status badge */}
                {assoc?.status && (
                  <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1
                    ${assoc.status === 'approved' ? 'bg-green-100 text-green-700' :
                      assoc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'}`}>
                    {assoc.status.charAt(0).toUpperCase() + assoc.status.slice(1)}
                  </span>
                )}
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
          Complete your registration to generate your full ID card.
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-400 w-14 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-xs text-gray-700 flex-1 break-all ${mono ? 'font-mono font-bold text-[#1a3a5c]' : ''}`}>{value}</span>
    </div>
  );
}
