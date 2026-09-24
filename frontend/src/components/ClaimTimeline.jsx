import React from 'react';

const STAGES = [
  { key: 'SUBMITTED', label: 'Claim Submitted' },
  { key: 'RECEIVED_BY_SERVICE_CENTER', label: 'Service Center Received' },
  { key: 'ASSESSMENT_IN_PROGRESS', label: 'Vehicle Assessment' },
  { key: 'TECHNICIAN_VERIFICATION', label: 'Verification' },
  { key: 'CLAIM_PACKAGE_GENERATED', label: 'Claim Package' },
  { key: 'READY_FOR_INSURER_REVIEW', label: 'Insurer Review' }
];

const getStageIndex = (status) => {
  switch (status) {
    case 'SUBMITTED': return 0;
    case 'RECEIVED_BY_SERVICE_CENTER': return 1;
    case 'ASSESSMENT_IN_PROGRESS':
    case 'AI_ASSESSMENT_COMPLETED': return 2;
    case 'TECHNICIAN_VERIFICATION': return 3;
    case 'CLAIM_PACKAGE_GENERATED': return 4;
    case 'READY_FOR_INSURER_REVIEW': return 5;
    default: return 0;
  }
};

const ClaimTimeline = ({ status }) => {
  const currentIndex = getStageIndex(status);

  return (
    <div className="py-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-4">Claim Progress Timeline</h4>
      <div className="relative">
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={stage.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-blue-700 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClaimTimeline;
