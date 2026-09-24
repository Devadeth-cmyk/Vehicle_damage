import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepVehicle from '../components/wizard/StepVehicle';
import StepAccidentDetails from '../components/wizard/StepAccidentDetails';
import StepInsurance from '../components/wizard/StepInsurance';
import StepEvidence from '../components/wizard/StepEvidence';
import StepDocuments from '../components/wizard/StepDocuments';
import StepReview from '../components/wizard/StepReview';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  'Vehicle',
  'Accident Details',
  'Insurance',
  'Evidence',
  'Documents',
  'Review & Submit'
];

const NewClaim = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submittedClaimId, setSubmittedClaimId] = useState(null);
  const [claimData, setClaimData] = useState({
    vehicle_id: '',
    vehicle: null,
    accident_date: new Date().toISOString().split('T')[0],
    accident_time: '14:30',
    accident_location: '',
    accident_type: 'Collision',
    accident_description: '',
    other_vehicle_involved: 'No',
    third_party_damage: 'No',
    injury_reported: 'No',
    police_fir_available: 'No',
    additional_remarks: '',
    insurer_name: '',
    policy_number: '',
    policy_type: 'Comprehensive Package Policy',
    policy_start_date: '',
    policy_expiry_date: '',
    evidenceFiles: [],
    documentFiles: []
  });

  const navigate = useNavigate();

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSuccess = (claimId) => {
    setSubmittedClaimId(claimId);
  };

  if (submittedClaimId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Claim Submitted Successfully</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your insurance claim has been sent directly to the service center for AI vehicle damage assessment.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 inline-block mb-8 min-w-[280px]">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Claim Reference Number</span>
            <span className="text-2xl font-black text-blue-600 font-mono mt-0.5 block">{submittedClaimId}</span>
          </div>

          <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 bg-blue-50/60 border border-blue-100 p-3 rounded-xl">
            "Your claim has been sent to the service center for vehicle assessment."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(`/claims/${submittedClaimId}`)}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Track Claim Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">New Insurance Claim Wizard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Follow the 6-step procedure to submit your damage report</p>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-6 gap-2">
          {STEPS.map((stepLabel, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-semibold truncate max-w-full hidden sm:block ${
                    isCurrent ? 'text-blue-600 font-bold' : isDone ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {stepLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {currentStep === 0 && (
          <StepVehicle claimData={claimData} setClaimData={setClaimData} onNext={handleNext} />
        )}
        {currentStep === 1 && (
          <StepAccidentDetails
            claimData={claimData}
            setClaimData={setClaimData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 2 && (
          <StepInsurance
            claimData={claimData}
            setClaimData={setClaimData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <StepEvidence
            claimData={claimData}
            setClaimData={setClaimData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
          <StepDocuments
            claimData={claimData}
            setClaimData={setClaimData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 5 && (
          <StepReview claimData={claimData} onBack={handleBack} onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
};

export default NewClaim;
