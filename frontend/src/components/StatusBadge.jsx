import React from 'react';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Claim Submitted', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  RECEIVED_BY_SERVICE_CENTER: { label: 'Received by Service Center', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  ASSESSMENT_IN_PROGRESS: { label: 'Assessment In Progress', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  AI_ASSESSMENT_COMPLETED: { label: 'AI Assessment Completed', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  TECHNICIAN_VERIFICATION: { label: 'Technician Verification', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  CLAIM_PACKAGE_GENERATED: { label: 'Claim Package Generated', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  READY_FOR_INSURER_REVIEW: { label: 'Ready for Insurer Review', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  NEEDS_MORE_INFORMATION: { label: 'Needs More Info', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
