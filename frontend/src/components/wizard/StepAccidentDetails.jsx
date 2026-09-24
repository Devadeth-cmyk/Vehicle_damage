import React, { useState } from 'react';

const ACCIDENT_TYPES = [
  'Collision',
  'Rear-end collision',
  'Front collision',
  'Side collision',
  'Parking damage',
  'Weather-related damage',
  'Vandalism',
  'Other'
];

const StepAccidentDetails = ({ claimData, setClaimData, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    accident_date: claimData.accident_date || new Date().toISOString().split('T')[0],
    accident_time: claimData.accident_time || '14:30',
    accident_location: claimData.accident_location || '',
    accident_type: claimData.accident_type || 'Collision',
    accident_description: claimData.accident_description || '',
    other_vehicle_involved: claimData.other_vehicle_involved || 'No',
    third_party_damage: claimData.third_party_damage || 'No',
    injury_reported: claimData.injury_reported || 'No',
    police_fir_available: claimData.police_fir_available || 'No',
    additional_remarks: claimData.additional_remarks || ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.accident_date) errs.accident_date = 'Accident date is required';
    if (!formData.accident_time) errs.accident_time = 'Approximate time is required';
    if (!formData.accident_location.trim()) errs.accident_location = 'Accident location is required';
    if (!formData.accident_description.trim()) errs.accident_description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setClaimData((prev) => ({ ...prev, ...formData }));
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Accident & Damage Details</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Provide accurate details about when, where, and how the incident occurred.
        </p>
      </div>

      <div className="space-y-4 text-sm">
        {/* Date, Time & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Accident Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.accident_date}
              onChange={(e) => setFormData({ ...formData, accident_date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
            />
            {errors.accident_date && <p className="text-xs text-rose-500 mt-1">{errors.accident_date}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Approximate Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={formData.accident_time}
              onChange={(e) => setFormData({ ...formData, accident_time: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
            />
            {errors.accident_time && <p className="text-xs text-rose-500 mt-1">{errors.accident_time}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Accident Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.accident_type}
              onChange={(e) => setFormData({ ...formData, accident_type: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
            >
              {ACCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Accident Location <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.accident_location}
            onChange={(e) => setFormData({ ...formData, accident_location: e.target.value })}
            placeholder="e.g. MG Road, Near City Center Flyover, Kochi"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
          />
          {errors.accident_location && <p className="text-xs text-rose-500 mt-1">{errors.accident_location}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Accident & Damage Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={formData.accident_description}
            onChange={(e) => setFormData({ ...formData, accident_description: e.target.value })}
            placeholder="Describe what happened and the visible damage (e.g. Front bumper dented and headlamp broken after rear-ending a stationary vehicle)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium focus:outline-none focus:border-blue-600 resize-none"
          />
          {errors.accident_description && <p className="text-xs text-rose-500 mt-1">{errors.accident_description}</p>}
        </div>

        {/* Optional Toggles */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Other Vehicle Involved?</label>
            <select
              value={formData.other_vehicle_involved}
              onChange={(e) => setFormData({ ...formData, other_vehicle_involved: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Third-party Damage?</label>
            <select
              value={formData.third_party_damage}
              onChange={(e) => setFormData({ ...formData, third_party_damage: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Injury Reported?</label>
            <select
              value={formData.injury_reported}
              onChange={(e) => setFormData({ ...formData, injury_reported: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Police / FIR Available?</label>
            <select
              value={formData.police_fir_available}
              onChange={(e) => setFormData({ ...formData, police_fir_available: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Additional Remarks (Optional)</label>
          <input
            type="text"
            value={formData.additional_remarks}
            onChange={(e) => setFormData({ ...formData, additional_remarks: e.target.value })}
            placeholder="Any extra context for the service technician..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
          />
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
          Next: Insurance Info →
        </button>
      </div>
    </div>
  );
};

export default StepAccidentDetails;
