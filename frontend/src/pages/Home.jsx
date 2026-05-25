import { Link } from 'react-router-dom';
import { UserPlus, BarChart2, Shield, Smartphone, Clock, CheckCircle } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="card p-5 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-lg bg-[#e8f0fb] flex items-center justify-center mb-3">
      <Icon size={20} className="text-[#1a3a5c]" />
    </div>
    <h3 className="font-semibold text-gray-800 mb-1.5 text-sm">{title}</h3>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }) => (
  <div className="flex gap-4">
    <div className="w-8 h-8 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{num}</div>
    <div>
      <p className="font-semibold text-gray-800 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fb] text-[#1a3a5c] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
          Associate Registration Portal
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a5c] mb-4 leading-tight">
          Register as an Associate<br />
          <span className="text-[#e85d26]">Quickly & Securely</span>
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto mb-8 leading-relaxed">
          Complete your associate registration in 7 simple steps. All data is saved automatically so you can continue where you left off.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/login" className="btn-primary text-base px-8 py-3 rounded-xl">
            <UserPlus size={18} /> Get Started
          </Link>
          <Link to="/signup" className="btn-secondary text-base px-8 py-3 rounded-xl">
            Create Account
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        <Feature icon={Shield}      title="Secure & Private"     desc="Your Aadhaar and PAN data is handled with bank-level security." />
        <Feature icon={Smartphone}  title="Mobile Friendly"      desc="Works perfectly on phones, tablets and desktops." />
        <Feature icon={Clock}       title="Auto-Save Draft"      desc="Progress saved automatically. Resume anytime." />
        <Feature icon={CheckCircle} title="Real-time Validation" desc="Instant feedback on Aadhaar, PAN, IFSC and more." />
        <Feature icon={UserPlus}    title="7-Step Process"       desc="Guided form covering all registration requirements." />
        <Feature icon={BarChart2}   title="Instant Reports"      desc="Generate and print registration reports." />
      </div>

      {/* How it works */}
      <div className="card p-6">
        <h2 className="font-bold text-[#1a3a5c] text-lg mb-5">How It Works</h2>
        <div className="space-y-5">
          <Step num="1" title="Personal Details" desc="Name, DOB, gender, address and contact information." />
          <Step num="2" title="Professional Details" desc="Profession, education and nominee details." />
          <Step num="3" title="Document Upload" desc="Upload Aadhaar and PAN card with number verification." />
          <Step num="4" title="Bank Details" desc="Bank account for payments and disbursements." />
          <Step num="5" title="Referral Details" desc="Associate who referred you and your referral number." />
          <Step num="6" title="Declaration" desc="Review and accept terms & conditions." />
          <Step num="7" title="Review & Submit" desc="Final review of all details before submission." />
        </div>
      </div>
    </div>
  );
}
