import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Calendar, Printer, Camera, IdCard, Copy, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../components/ui/BackButton';
import { HEAD_REFERRAL_CODE, HEAD_REFERRAL_NAME } from '../utils/constants';

const BASE = import.meta.env.VITE_API_URL || '/api';
const API_URL = BASE.replace('/api', '');

const ROLE_STYLE = {
  head_admin: 'bg-purple-100 text-purple-700',
  admin:      'bg-blue-100   text-blue-700',
  associate:  'bg-green-100  text-green-700',
};

const Row = ({ label, value }) => (
  <tr className="border-b border-gray-100">
    <td className="py-2 pr-4 text-xs text-gray-400 uppercase tracking-wide font-medium w-40">{label}</td>
    <td className="py-2 text-sm text-gray-800 font-medium">{value || '—'}</td>
  </tr>
);

export default function MyProfile() {
  const { user, authFetch } = useAuth();
  const photoInputRef = useRef();
  const [editing, setEditing]   = useState(false);
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [mobile, setMobile]     = useState(user?.profile?.mobile || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving]     = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.profile?.photoUrl || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [assocData, setAssocData] = useState(null);

  useEffect(() => {
    if (user?.role === 'associate' && user?.associateRecordId) {
      authFetch(`/api/associates/${user.associateRecordId}`)
        .then(r => r.json()).then(d => { if (d.success) setAssocData(d.data); }).catch(() => {});
    }
  }, [user]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append('profilePhoto', file);
      const res  = await authFetch(`/api/users/${user._id}/photo`, { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPhotoUrl(data.photoUrl);
      toast.success('Photo updated!');
    } catch (err) { toast.error(err.message); }
    finally { setUploadingPhoto(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { profile: { fullName, mobile } };
      if (password) {
        if (password.length < 6) { toast.error('Password min 6 chars'); setSaving(false); return; }
        body.password = password;
      }
      const res  = await authFetch(`/api/users/${user._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Profile updated');
      setEditing(false); setPassword('');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const fullPhotoUrl = photoUrl ? `${API_URL}/uploads/${photoUrl}` : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <BackButton />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#1a3a5c]">My Profile</h1>
        <div className="flex gap-2 print:hidden">
          <Link to="/id-card" className="btn-ghost border border-gray-200"><IdCard size={14}/> ID Card</Link>
          <button onClick={() => window.print()} className="btn-ghost border border-gray-200"><Printer size={14}/> Print</button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-[#1a3a5c]">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Associate Portal</h1>
        <p className="text-sm text-gray-500">Member Profile · {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</p>
      </div>

      {/* Head Referral Code — head admin only, given to associates who have no referrer */}
      {user?.role === 'head_admin' && (
        <div className="card p-6 mb-4 bg-gradient-to-br from-[#1a3a5c] to-[#1f4a73] text-white print:hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <KeyRound size={16} className="text-[#ff8a4c]" />
            <p className="font-semibold text-sm uppercase tracking-wide">Head Office Referral Code</p>
          </div>
          <p className="text-xs text-blue-100 mb-4">
            Give this code to any new associate who wasn't referred by someone else — they'll tick
            "I wasn't referred by any associate" on the registration form and it fills in automatically.
          </p>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <span className="font-mono text-lg font-bold tracking-wide flex-1">{HEAD_REFERRAL_CODE}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(HEAD_REFERRAL_CODE); toast.success('Copied!'); }}
              className="bg-white/15 hover:bg-white/25 rounded-lg p-2 transition-colors"
            >
              <Copy size={14} />
            </button>
          </div>
          <p className="text-[11px] text-blue-200 mt-2">{HEAD_REFERRAL_NAME}</p>
        </div>
      )}

      <div className="card p-6 mb-4 print:shadow-none print:border print:border-gray-200">
        {/* Photo + info */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="relative flex-shrink-0">
            {fullPhotoUrl ? (
              <img src={fullPhotoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#1a3a5c]" />
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white
                ${user?.role === 'head_admin' ? 'bg-purple-500' : user?.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'}`}>
                {user?.profile?.fullName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}
              className="print:hidden absolute -bottom-1 -right-1 w-7 h-7 bg-[#1a3a5c] rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow">
              <Camera size={12}/>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{user?.profile?.fullName}</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_STYLE[user?.role]}`}>
              {user?.role?.replace('_', ' ')}
            </span>
            {uploadingPhoto && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
          </div>
        </div>

        <table className="w-full mb-4">
          <tbody>
            <Row label="Email"   value={user?.email} />
            <Row label="Mobile"  value={user?.profile?.mobile} />
            <Row label="Role"    value={user?.role?.replace('_', ' ')} />
            <Row label="Joined"  value={new Date(user?.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })} />
            <Row label="Status"  value={user?.isActive ? 'Active' : 'Pending Approval'} />
          </tbody>
        </table>

        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-primary print:hidden">Edit Profile</button>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 print:hidden">
            <div><label className="label-base">Full Name</label><input className="input-base" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
            <div><label className="label-base">Mobile</label><input className="input-base" type="tel" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value)} /></div>
            <div><label className="label-base">New Password <span className="text-gray-400 font-normal">(leave blank to keep)</span></label>
              <input className="input-base" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setEditing(false); setPassword(''); }} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        )}
      </div>

      {/* Associate Registration Details */}
      {assocData && (
        <div className="card p-6 print:shadow-none print:border print:border-gray-200 print:mt-4">
          <h2 className="font-semibold text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Registration Details</h2>
          <div className="space-y-4">
            {[
              { title: 'Personal', rows: [
                ['Full Name', assocData.personal?.fullName], ['S/D/W/O', assocData.personal?.sdwo],
                ['Date of Birth', assocData.personal?.dob], ['Gender', assocData.personal?.gender],
                ['Address', assocData.personal?.address], ['Pincode', assocData.personal?.pincode],
                ['Mobile', assocData.personal?.mobile], ['WhatsApp', assocData.personal?.whatsapp], ['Email', assocData.personal?.email],
              ]},
              { title: 'Professional', rows: [
                ['Profession', assocData.professional?.profession], ['Education', assocData.professional?.education],
                ['Nominee', assocData.professional?.nomineeName], ['Relation', assocData.professional?.nomineeRelation],
              ]},
              { title: 'Documents', rows: [
                ['Aadhaar No', assocData.documents?.aadhaarNumber], ['PAN No', assocData.documents?.panNumber],
              ]},
              { title: 'Bank', rows: [
                ['Bank', assocData.bank?.bankName], ['Branch', assocData.bank?.branch],
                ['IFSC', assocData.bank?.ifscCode], ['Account No', assocData.bank?.accountNumber],
              ]},
              { title: 'Referral', rows: [
                ['Ref No', assocData.referral?.associateRefNo], ['Associate', assocData.referral?.associateName],
                ['Circle', assocData.referral?.circle],
              ]},
            ].map(section => (
              <div key={section.title}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{section.title}</p>
                <table className="w-full"><tbody>
                  {section.rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
                </tbody></table>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            ID: {assocData.associateId} · Status: {assocData.status} · Submitted: {new Date(assocData.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
      )}

      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>Associate Portal · Printed on {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</p>
      </div>
    </div>
  );
}
