import React, { useState } from 'react';

const StepInsurance = ({ claimData, setClaimData, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    insurer_name: claimData.insurer_name || claimData.vehicle?.insurer_name || '',
    policy_number: claimData.policy_number || claimData.vehicle?.policy_number || '',
    policy_type: claimData.policy_type || 'Comprehensive Package Policy',
    policy_start_date: claimData.policy_start_date || claimData.vehicle?.policy_start_date || '',
    policy_expiry_date: claimData.policy_expiry_date || claimData.vehicle?.policy_expiry_date || ''
  });

  const handleNext = () => {
    setClaimData((prev) => ({ ...prev, ...formData }));
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Insurance Policy Information</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Verify your motor insurance policy details pre-filled from your registered vehicle.
        </p>
      </div>

      <div className="space-y-4 text-sm bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Insurance Company Name</label>
            <input
              type="text"
              value={formData.insurer_name}
              onChange={(e) => setFormData({ ...formData, insurer_name: e.target.value })}
              placeholder="HDFC ERGO / ICICI Lombard / TATA AIG"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Policy Number</label>
            <input
              type="text"
              value={formData.policy_number}
              onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
              placeholder="POL-99882211"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Policy Type</label>
            <select
              value={formData.policy_type}
              onChange={(e) => setFormData({ ...formData, policy_type: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="Comprehensive Package Policy">Comprehensive Package Policy</option>
              <option value="Zero Depreciation Policy">Zero Depreciation Policy</option>
              <option value="Third-Party Cover Only">Third-Party Cover Only</option>
              <option value="Standalone Own Damage">Standalone Own Damage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Policy Expiry Date</label>
            <input
              type="date"
              value={formData.policy_expiry_date}
              onChange={(e) => setFormData({ ...formData, policy_expiry_date: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
        >
          Next: Evidence Upload →
        </button>
      </div>
    </div>
  );
};

export default StepInsurance;
