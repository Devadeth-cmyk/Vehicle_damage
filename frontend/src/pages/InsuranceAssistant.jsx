import React from 'react';
import Chatbot from '../components/Chatbot';

const InsuranceAssistant = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Insurance Assistant</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Ask questions about motor policy coverages, claim procedures, required documents, or damage assessments.
        </p>
      </div>

      <div className="relative h-[650px] bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        <Chatbot isOpen={true} onClose={() => {}} />
      </div>
    </div>
  );
};

export default InsuranceAssistant;
