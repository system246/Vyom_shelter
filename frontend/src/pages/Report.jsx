import { useLocation, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Download } from 'lucide-react';

const Row = ({ label, value }) => (
  <tr className="border-b border-gray-100">
    <td className="py-2 pr-4 text-xs text-gray-400 uppercase tracking-wide font-medium whitespace-nowrap w-44">{label}</td>
    <td className="py-2 text-sm text-gray-800 font-medium">{value || '—'}</td>
  </tr>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold text-[#1a3a5c] uppercase tracking-widest mb-3 pb-1.5 border-b-2 border-[#1a3a5c]/20">
      {title}
    </h3>
    <table className="w-full">
      <tbody>{children}</tbody>
    </table>
  </div>
);

export default function Report() {
  const { state } = useLocation();
  const fd = state?.formData || {};
  const { personal, professional, documents, bank, referral } = fd;
  const reportDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Actions */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/register" className="btn-ghost">
          <ArrowLeft size={15} /> Back
        </Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-primary">
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Report card */}
      <div className="card p-8" id="report-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-[#1a3a5c]/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1a3a5c] rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
              <div>
                <p className="font-bold text-[#1a3a5c] text-lg leading-tight">Associate Registration</p>
                <p className="text-xs text-gray-400">Official Registration Report</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-semibold text-gray-700">{reportDate}</p>
            {state?.associateId && (
              <>
                <p className="text-xs text-gray-400 mt-2">Associate ID</p>
                <p className="text-sm font-bold text-[#e85d26]">{state.associateId}</p>
              </>
            )}
          </div>
        </div>

        {personal?.fullName ? (
          <>
            <Section title="Personal Details">
              <Row label="Full Name"        value={personal?.fullName} />
              <Row label="S / D / W / O"    value={personal?.sdwo} />
              <Row label="Date of Birth"    value={personal?.dob} />
              <Row label="Gender"           value={personal?.gender} />
              <Row label="Mobile Number"    value={personal?.mobile} />
              <Row label="WhatsApp Number"  value={personal?.whatsapp} />
              <Row label="Email Address"    value={personal?.email} />
              <Row label="Address"          value={personal?.address} />
              <Row label="Pincode"          value={personal?.pincode} />
            </Section>

            <Section title="Professional Details">
              <Row label="Profession"       value={professional?.profession} />
              <Row label="Education"        value={professional?.education} />
              <Row label="Nominee Name"     value={professional?.nomineeName} />
              <Row label="Nominee Relation" value={professional?.nomineeRelation} />
            </Section>

            <Section title="Document Details">
              <Row label="Aadhaar Number"   value={documents?.aadhaarNumber} />
              <Row label="Aadhaar Document" value={documents?.aadhaarFile?.name || 'Uploaded'} />
              <Row label="PAN Number"       value={documents?.panNumber} />
              <Row label="PAN Document"     value={documents?.panFile?.name || 'Uploaded'} />
            </Section>

            <Section title="Bank Details">
              <Row label="Bank Name"        value={bank?.bankName} />
              <Row label="Branch"           value={bank?.branch} />
              <Row label="IFSC Code"        value={bank?.ifscCode} />
              <Row label="Account Number"   value={bank ? '••••' + bank?.accountNumber?.slice(-4) : ''} />
            </Section>

            <Section title="Referral Details">
              <Row label="Associate Ref No" value={referral?.associateRefNo} />
              <Row label="Associate Name"   value={referral?.associateName} />
              <Row label="Circle"           value={referral?.circle} />
              <Row label="Candidate Ref No" value={referral?.newCandidateRefNo} />
            </Section>

            {/* Signature */}
            <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
              {['Applicant Signature', 'Witness Signature', 'Authorized Signatory'].map(label => (
                <div key={label} className="text-center">
                  <div className="h-16 border-b border-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-300 mt-6">
              This is a computer-generated document. No physical signature required.
            </p>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-4">No registration data found.</p>
            <Link to="/register" className="btn-primary inline-flex">Start Registration</Link>
          </div>
        )}
      </div>
    </div>
  );
}
