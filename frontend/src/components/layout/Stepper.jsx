import { Check } from 'lucide-react';
import { STEPS } from '../../utils/constants';

export default function Stepper({ currentStep, onStepClick }) {
  return (
    <div className="card p-4 mb-6 no-print">
      <div className="flex items-start justify-between overflow-x-auto pb-1">
        {STEPS.map((step, idx) => {
          const done   = currentStep > step.id;
          const active = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              {/* Step */}
              <div
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={() => done && onStepClick && onStepClick(step.id)}
                title={step.label}
              >
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                  border-2 transition-all duration-300 select-none
                  ${done   ? 'bg-green-600 border-green-600 text-white'   : ''}
                  ${active ? 'bg-[#1a3a5c] border-[#1a3a5c] text-white shadow-md ring-4 ring-blue-100' : ''}
                  ${!done && !active ? 'bg-white border-gray-200 text-gray-400' : ''}
                `}>
                  {done ? <Check size={15} /> : step.id}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                  active ? 'text-[#1a3a5c]' : done ? 'text-green-700' : 'text-gray-400'
                }`}>
                  {step.short}
                </span>
              </div>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div className={`step-connector ${done ? 'done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      <div className="text-center mt-3 border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-400">Step {currentStep} of {STEPS.length} &nbsp;&mdash;&nbsp;</span>
        <span className="text-xs font-semibold text-[#1a3a5c]">
          {STEPS.find(s => s.id === currentStep)?.label}
        </span>
      </div>
    </div>
  );
}
