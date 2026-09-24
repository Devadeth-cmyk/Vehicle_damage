import React, { useState, useEffect } from 'react';
import { vehicleService } from '../../services/api';
import { Car, Plus, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const StepVehicle = ({ claimData, setClaimData, onNext }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(claimData.vehicle_id || '');

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await vehicleService.getVehicles();
        const list = Array.isArray(data) ? data : data.vehicles || [];
        setVehicles(list);
        if (!selectedId && list.length > 0) {
          setSelectedId(list[0].id);
          setClaimData((prev) => ({
            ...prev,
            vehicle_id: list[0].id,
            vehicle: list[0],
            insurer_name: list[0].insurer_name || prev.insurer_name,
            policy_number: list[0].policy_number || prev.policy_number,
            policy_start_date: list[0].policy_start_date || prev.policy_start_date,
            policy_expiry_date: list[0].policy_expiry_date || prev.policy_expiry_date,
          }));
        }
      } catch (err) {
        // Fallback placeholder list if backend API pending
        const mockList = [
          {
            id: 'v1',
            registration_number: 'KL-07-BW-1234',
            make: 'Honda',
            model: 'City',
            year: '2022',
            insurer_name: 'HDFC ERGO General Insurance',
            policy_number: 'POL-99882211',
            policy_expiry_date: '2027-04-15'
          },
          {
            id: 'v2',
            registration_number: 'KL-01-CA-9876',
            make: 'Tata',
            model: 'Nexon',
            year: '2023',
            insurer_name: 'ICICI Lombard Insurance',
            policy_number: 'POL-77665544',
            policy_expiry_date: '2027-11-20'
          }
        ];
        setVehicles(mockList);
        if (!selectedId && mockList.length > 0) {
          setSelectedId(mockList[0].id);
          setClaimData((prev) => ({
            ...prev,
            vehicle_id: mockList[0].id,
            vehicle: mockList[0],
            insurer_name: mockList[0].insurer_name,
            policy_number: mockList[0].policy_number,
            policy_expiry_date: mockList[0].policy_expiry_date
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const handleSelect = (v) => {
    setSelectedId(v.id);
    setClaimData((prev) => ({
      ...prev,
      vehicle_id: v.id,
      vehicle: v,
      insurer_name: v.insurer_name || prev.insurer_name,
      policy_number: v.policy_number || prev.policy_number,
      policy_start_date: v.policy_start_date || prev.policy_start_date,
      policy_expiry_date: v.policy_expiry_date || prev.policy_expiry_date,
    }));
  };

  const handleProceed = () => {
    if (!selectedId) return;
    onNext();
  };

  if (loading) return <LoadingSpinner text="Loading registered vehicles..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Select Vehicle for Claim</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Choose the vehicle involved in the accident from your registered list.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vehicles.map((v) => {
          const isSelected = selectedId === v.id;
          return (
            <div
              key={v.id}
              onClick={() => handleSelect(v)}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex items-start justify-between ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-600 shadow-md shadow-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {v.make} {v.model}
                  </h3>
                  <span className="inline-block mt-1 font-mono font-bold text-xs text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {v.registration_number}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    Insurer: <span className="text-slate-700 font-semibold">{v.insurer_name || 'N/A'}</span>
                  </p>
                </div>
              </div>
              {isSelected && <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <a
          href="/vehicles"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Vehicle</span>
        </a>

        <button
          disabled={!selectedId}
          onClick={handleProceed}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all"
        >
          Next: Accident Details →
        </button>
      </div>
    </div>
  );
};

export default StepVehicle;
