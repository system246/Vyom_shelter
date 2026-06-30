import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Do I need to create an account to buy, sell, or rent a property?',
    a: 'No. Browsing listings, submitting a property for sale/rent, and sending an enquiry are all open to anyone — no login or signup required. An account is only needed if you want to become a Vyom Shelter Associate.',
  },
  {
    q: 'How does Vyom Shelter verify a property listing?',
    a: "When you submit a property, it stays in a 'pending' state until our team checks the details, documents, and ownership information you've provided. Only approved listings show up in public search results.",
  },
  {
    q: 'Is there any fee to list my property?',
    a: 'Listing your property for sale or rent is free. Vyom Shelter earns through brokerage on completed deals, not upfront listing fees.',
  },
  {
    q: 'How do I become a Vyom Shelter Associate?',
    a: 'Click "Become an Associate" on the homepage or navbar, create an account, verify your email with the OTP sent to you, and you can log in right away. From there, complete the Associate Registration form — that submission is what gets reviewed and approved.',
  },
  {
    q: 'What if I was not referred by an existing associate?',
    a: 'No problem — during registration, just tick "I wasn\'t referred by any associate" and you\'ll be registered directly under Vyom Shelter\'s Head Office.',
  },
  {
    q: 'How quickly will someone contact me after an enquiry?',
    a: 'Our team typically reaches out within 24–48 hours of receiving a buyer/tenant enquiry or a site-visit request.',
  },
];

function FaqItem({ q, a, open, onClick }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <span className="font-medium text-sm text-gray-800">{q}</span>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[#1a3a5c]' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40' : 'max-h-0'}`}>
        <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fb] text-[#1a3a5c] text-xs font-semibold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
          <HelpCircle size={13} /> Got Questions?
        </div>
        <h2 className="font-bold gradient-text text-xl">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <FaqItem
            key={item.q}
            {...item}
            open={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  );
}
