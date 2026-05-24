import { CheckCircle, Edit2, Send, FileText } from 'lucide-react';
import Loader from '../ui/Loader';

const Row = ({ label, value }) => (
  <div className="flex py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 uppercase tracking-wide w-40 flex-shrink-0 pt-0.5">{label}</span>
    <span className="text-sm text-gray-800 font-medium flex-1">{value || <span className="text-gray-300">—</span>}</span>
  </div>
);

const Section = ({ title, onEdit, children }) => (
  <div className="card p-5 mb-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-[#1a3a5c] uppercase tracking-wide">{title}</h3>
      {onEdit && (
        <button onClick={onEdit} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
          <Edit2 size={12} /> Edit
        </button>
      )}
    </div>
    {children}
  </div>
);

export default function ReviewSubmit({ data, onPrev, onSubmit, onEdit, submitting, onGenerateReport }) {
  const { personal, professional, documents, bank, referral } = data;

  return (
    <div className="form-section-enter">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-center gap-3">
        <CheckCircle size={20} className="text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">Please review all details below before submitting. Click "Edit" on any section to make changes.</p>
      </div>

      <Section title="Personal Details" onEdit={() => onEdit(1)}>
        <Row label="Full Name"    value={personal?.fullName} />
        <Row label="S/D/W/O"     value={personal?.sdwo} />
        <Row label="Date of Birth" value={personal?.dob} />
        <Row label="Gender"       value={personal?.gender} />
        <Row label="Mobile"       value={personal?.mobile} />
        <Row label="WhatsApp"     value={personal?.whatsapp} />
        <Row label="Email"        value={personal?.email} />
        <Row label="Address"      value={personal?.address} />
        <Row label="Pincode"      value={personal?.pincode} />
      </Section>

      <Section title="Professional Details" onEdit={() => onEdit(2)}>
        <Row label="Profession"   value={professional?.profession} />
        <Row label="Education"    value={professional?.education} />
        <Row label="Nominee"      value={professional?.nomineeName} />
        <Row label="Relation"     value={professional?.nomineeRelation} />
      </Section>

      <Section title="Documents" onEdit={() => onEdit(3)}>
        <Row label="Aadhaar No"   value={documents?.aadhaarNumber} />
        <Row label="Aadhaar File" value={documents?.aadhaarFile?.name} />
        <Row label="PAN No"       value={documents?.panNumber} />
        <Row label="PAN File"     value={documents?.panFile?.name} />
      </Section>

      <Section title="Bank Details" onEdit={() => onEdit(4)}>
        <Row label="Bank Name"    value={bank?.bankName} />
        <Row label="Branch"       value={bank?.branch} />
        <Row label="IFSC Code"    value={bank?.ifscCode} />
        <Row label="Account No"   value={bank ? '••••' + bank.accountNumber?.slice(-4) : ''} />
      </Section>

      <Section title="Referral Details" onEdit={() => onEdit(5)}>
        <Row label="Ref No"       value={referral?.associateRefNo} />
        <Row label="Associate"    value={referral?.associateName} />
        <Row label="Circle"       value={referral?.circle} />
        <Row label="Candidate Ref" value={referral?.newCandidateRefNo} />
      </Section>

      <div className="flex flex-wrap justify-between gap-3 mt-6">
        <button onClick={onPrev} className="btn-secondary">← Previous</button>
        <div className="flex gap-3 flex-wrap">
          <button onClick={onGenerateReport} className="btn-ghost border border-gray-200">
            <FileText size={15} /> Preview Report
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="btn-accent"
          >
            {submitting ? <Loader size="sm" /> : <Send size={15} />}
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </div>
    </div>
  );
}
