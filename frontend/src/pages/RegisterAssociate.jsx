import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Stepper             from '../components/layout/Stepper';
import PersonalDetails     from '../components/forms/PersonalDetails';
import ProfessionalDetails from '../components/forms/ProfessionalDetails';
import DocumentUpload      from '../components/forms/DocumentUpload';
import BankDetails         from '../components/forms/BankDetails';
import ReferralDetails     from '../components/forms/ReferralDetails';
import Declaration         from '../components/forms/Declaration';
import ReviewSubmit        from '../components/forms/ReviewSubmit';
import { saveDraft, loadDraft, clearDraft } from '../utils/localStorage';
import { submitAssociate } from '../services/associateApi';

const INITIAL = { personal: {}, professional: {}, documents: {}, bank: {}, referral: {}, declaration: {} };

export default function RegisterAssociate() {
  const navigate      = useNavigate();
  const { authFetch, refreshUser } = useAuth();
  const [step, setStep]           = useState(1);
  const [formData, setFormData]   = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);

  useEffect(() => {
    if (draftChecked) return;
    const draft = loadDraft();
    if (draft) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Draft found. Restore it?</span>
          <span className="text-xs text-gray-500">Files need re-uploading on Step 3.</span>
          <div className="flex gap-2 mt-1">
            <button className="bg-[#1a3a5c] text-white text-xs px-3 py-1.5 rounded-lg"
              onClick={() => {
                const restored = draft.formData || INITIAL;
                if (restored.documents) { restored.documents.aadhaarFile = null; restored.documents.panFile = null; }
                setFormData(restored);
                setStep(draft.step || 1);
                toast.dismiss(t.id);
                toast.success('Draft restored! Re-upload your documents on Step 3.');
              }}>Restore</button>
            <button className="text-gray-400 text-xs border border-gray-200 px-3 py-1.5 rounded-lg"
              onClick={() => { clearDraft(); toast.dismiss(t.id); }}>Discard</button>
          </div>
        </div>
      ), { duration: 12000 });
    }
    setDraftChecked(true);
  }, [draftChecked]);

  useEffect(() => { saveDraft({ formData, step }); }, [step, formData]);

  const goNext = (key, data) => {
    setFormData(prev => ({ ...prev, [key]: data }));
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goPrev = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleSaveDraft = async () => {
    setSaving(true);
    saveDraft({ formData, step });
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    toast.success('Draft saved!');
  };

  const handleSubmit = async () => {
    if (!formData.documents?.aadhaarFile || !formData.documents?.panFile) {
      toast.error('Please go back to Step 3 and upload both documents.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitAssociate(formData, authFetch);
      clearDraft();
      // Refresh user in context so associateRecordId is updated
      await refreshUser();
      navigate('/awaiting-approval');
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Associate Registration</h1>
        <p className="text-sm text-gray-500 mt-1">Complete all steps to register an associate</p>
      </div>
      <Stepper currentStep={step} onStepClick={setStep} />
      {step === 1 && <PersonalDetails     data={formData.personal}      onNext={(d) => goNext('personal', d)} />}
      {step === 2 && <ProfessionalDetails data={formData.professional}  onNext={(d) => goNext('professional', d)} onPrev={goPrev} />}
      {step === 3 && <DocumentUpload      data={formData.documents}     onNext={(d) => goNext('documents', d)}   onPrev={goPrev} />}
      {step === 4 && <BankDetails         data={formData.bank}          onNext={(d) => goNext('bank', d)}        onPrev={goPrev} />}
      {step === 5 && <ReferralDetails     data={formData.referral}      onNext={(d) => goNext('referral', d)}    onPrev={goPrev} />}
      {step === 6 && <Declaration         data={formData.declaration}   onNext={(d) => goNext('declaration', d)} onPrev={goPrev} onSaveDraft={handleSaveDraft} saving={saving} />}
      {step === 7 && (
        <ReviewSubmit
          data={formData}
          onPrev={goPrev}
          onSubmit={handleSubmit}
          onEdit={setStep}
          submitting={submitting}
          onGenerateReport={() => navigate('/report', { state: { formData } })}
        />
      )}
    </div>
  );
}
