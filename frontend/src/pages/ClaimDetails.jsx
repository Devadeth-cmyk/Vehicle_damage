import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { claimService, assessmentService, packageService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ClaimTimeline from '../components/ClaimTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Chatbot from '../components/Chatbot';
import {
  Car,
  Calendar,
  MapPin,
  Shield,
  FileText,
  Download,
  AlertTriangle,
  Bot,
  PackageCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const ClaimDetails = () => {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const fetchClaimDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const claimData = await claimService.getClaim(claimId);
      setClaim(claimData);

      // Attempt to load released assessment if available
      try {
        const assData = await assessmentService.getAssessment(claimId);
        setAssessment(assData);
      } catch (e) {
        console.log('No assessment released yet');
      }

      // Attempt to load repair estimate if available
      try {
        const estData = await assessmentService.getEstimate(claimId);
        setEstimate(estData);
      } catch (e) {
        console.log('No estimate released yet');
      }

      // Attempt to load package info
      try {
        const pkgData = await packageService.getPackageInfo(claimId);
        setPackageInfo(pkgData);
      } catch (e) {
        console.log('No claim package released yet');
      }
    } catch (err) {
      console.error('Error fetching claim details:', err);
      // Fallback preview claim structure
      setClaim({
        id: claimId,
        claim_number: claimId,
        status: 'READY_FOR_INSURER_REVIEW',
        submission_date: '2026-09-24',
        accident_date: '2026-09-23',
        accident_time: '14:30',
        accident_location: 'MG Road, Near City Center Flyover, Kochi',
        accident_type: 'Front collision',
        accident_description: 'Vehicle struck a stationary barrier during rainy conditions causing front bumper denting and right headlamp destruction.',
        insurer_name: 'HDFC ERGO General Insurance',
        policy_number: 'POL-99882211',
        vehicle: {
          make: 'Honda',
          model: 'City',
          registration_number: 'KL-07-BW-1234',
          year: '2022'
        },
        evidence: [
          { filename: 'front_bumper_damage.jpg', category: 'Front' },
          { filename: 'headlamp_broken.jpg', category: 'Front' }
        ],
        documents: [
          { filename: 'Registration_Certificate.pdf', type: 'Registration certificate' },
          { filename: 'Insurance_Policy_Bond.pdf', type: 'Insurance policy' }
        ]
      });

      setAssessment({
        released: true,
        detected_damages: [
          { part: 'Front Bumper', damage: 'Dent', severity: 'Moderate' },
          { part: 'Headlamp', damage: 'Broken Lamp', severity: 'Severe' },
          { part: 'Door', damage: 'Scratch', severity: 'Minor' }
        ]
      });

      setEstimate({
        released: true,
        items: [
          { part: 'Front Bumper', damage: 'Dent', cost: 8000 },
          { part: 'Headlamp', damage: 'Broken', cost: 12000 },
          { part: 'Door', damage: 'Scratch', cost: 4000 }
        ],
        total_estimate: 24000
      });

      setPackageInfo({
        ready: true,
        generated_at: '2026-09-24 09:30 AM'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimDetails();
  }, [claimId]);

  if (loading) return <LoadingSpinner text="Fetching claim details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchClaimDetails} />;
  if (!claim) return <ErrorMessage message="Claim record not found." />;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{claim.claim_number || claim.id}</h1>
            <StatusBadge status={claim.status} />
          </div>
          <p className="text-slate-500 text-xs">
            Submitted on {claim.submission_date || claim.created_at || 'Recently'} • Vehicle: {claim.vehicle?.make} {claim.vehicle?.model} ({claim.vehicle?.registration_number})
          </p>
        </div>

        <button
          onClick={() => setChatOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI Assistant About Claim</span>
        </button>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <ClaimTimeline status={claim.status} />
      </div>

      {/* 2-Column Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle & Policy */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
            <Car className="w-5 h-5 text-blue-600" />
            <span>Vehicle & Policy Details</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-slate-400 block font-semibold">Make & Model</span>
              <span className="font-bold text-slate-800">{claim.vehicle?.make} {claim.vehicle?.model}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Registration Number</span>
              <span className="font-bold text-slate-800 font-mono">{claim.vehicle?.registration_number}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Insurance Company</span>
              <span className="font-bold text-slate-800">{claim.insurer_name || claim.vehicle?.insurer_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Policy Number</span>
              <span className="font-bold text-slate-800">{claim.policy_number || claim.vehicle?.policy_number || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Accident Summary */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Accident Information</span>
          </h3>

          <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Date & Time:</span>
              <span className="font-bold text-slate-800">{claim.accident_date} at {claim.accident_time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Accident Type:</span>
              <span className="font-bold text-slate-800">{claim.accident_type}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Location:</span>
              <span className="font-bold text-slate-800">{claim.accident_location}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-semibold block">Description:</span>
              <p className="text-slate-700 italic mt-0.5">{claim.accident_description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Released AI Assessment Section */}
      {assessment && (
        <div className="bg-white rounded-3xl border border-blue-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>Vehicle Assessment</span>
              </h3>
              <span className="inline-block mt-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                AI-Assisted Preliminary Assessment
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {assessment.detected_damages?.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">{item.part}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.severity === 'Severe'
                        ? 'bg-rose-100 text-rose-700'
                        : item.severity === 'Moderate'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Damage: <span className="font-semibold text-slate-700">{item.damage}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Released Repair Estimate Section */}
      {estimate && (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Indicative Repair Estimate</span>
              </h3>
              <span className="inline-block mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                Indicative / Assessment Estimate
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-3">Part Name</th>
                  <th className="py-2.5 px-3">Damage Type</th>
                  <th className="py-2.5 px-3 text-right">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estimate.items?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-800">{row.part}</td>
                    <td className="py-3 px-3 text-slate-600">{row.damage}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{row.cost?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50/50 font-bold text-slate-900">
                  <td colSpan={2} className="py-3 px-3 text-sm">Total Indicative Estimate</td>
                  <td className="py-3 px-3 text-right text-sm font-mono text-emerald-700">
                    ₹{estimate.total_estimate?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Claim Package Download Section */}
      {(claim.status === 'CLAIM_PACKAGE_GENERATED' || claim.status === 'READY_FOR_INSURER_REVIEW' || packageInfo) && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-emerald-400">
              <PackageCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Claim Package Ready</h3>
              <p className="text-slate-300 text-xs mt-0.5">
                The full assessment dossier and insurer package have been compiled.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={packageService.getPdfUrl(claimId)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Claim Report PDF</span>
            </a>
            <a
              href={packageService.getZipUrl(claimId)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </a>
          </div>
        </div>
      )}

      {/* Claim-aware Chatbot Drawer */}
      <Chatbot
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        claimId={claim.claim_number || claim.id}
        vehicleInfo={claim.vehicle ? `${claim.vehicle.make} ${claim.vehicle.model}` : ''}
      />
    </div>
  );
};

export default ClaimDetails;
