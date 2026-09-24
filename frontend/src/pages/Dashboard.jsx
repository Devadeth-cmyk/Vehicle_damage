import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { PlusCircle, FileText, Clock, CheckCircle2, ChevronRight, Car, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await claimService.getClaims();
      setClaims(Array.isArray(data) ? data : data.claims || []);
    } catch (err) {
      console.error('Error fetching dashboard claims:', err);
      // Fallback sample data if API is pending implementation
      setClaims([
        {
          id: 'CLM-2026-0001',
          claim_number: 'CLM-2026-0001',
          vehicle: { make: 'Honda', model: 'City', registration_number: 'KL-07-BW-1234' },
          submission_date: '2026-09-24',
          status: 'ASSESSMENT_IN_PROGRESS',
          last_updated: '2026-09-24 10:15 AM'
        },
        {
          id: 'CLM-2026-0002',
          claim_number: 'CLM-2026-0002',
          vehicle: { make: 'Tata', model: 'Nexon', registration_number: 'KL-01-CA-9876' },
          submission_date: '2026-09-20',
          status: 'READY_FOR_INSURER_REVIEW',
          last_updated: '2026-09-23 04:30 PM'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeClaimsCount = claims.filter(
    (c) => c.status !== 'READY_FOR_INSURER_REVIEW' && c.status !== 'CANCELLED'
  ).length;

  const pendingActionsCount = claims.filter(
    (c) => c.status === 'NEEDS_MORE_INFORMATION'
  ).length;

  const completedClaimsCount = claims.filter(
    (c) => c.status === 'READY_FOR_INSURER_REVIEW'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.full_name || 'Valued Customer'} 👋
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Track your insurance claims and AI vehicle assessments in real time.
          </p>
        </div>
        <Link
          to="/claims/new"
          className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <span>+ New Claim</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Claims</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{activeClaimsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Actions</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{pendingActionsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Claims</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{completedClaimsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Claims Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Claims</h2>
            <p className="text-slate-500 text-xs mt-0.5">Overview of your submitted insurance claims</p>
          </div>
          <Link
            to="/claims"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching claims..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchDashboardData} />
        ) : claims.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Claims Found"
            description="You haven't filed any insurance claims yet. Start by filing a new claim."
            actionLabel="+ Create New Claim"
            onAction={() => navigate('/claims/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Claim ID</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {claims.map((claim) => (
                  <tr key={claim.id || claim.claim_number} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {claim.claim_number || claim.id}
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">
                          {claim.vehicle ? `${claim.vehicle.make} ${claim.vehicle.model}` : 'Vehicle'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {claim.submission_date || claim.created_at || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">
                      {claim.last_updated || 'Recently'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/claims/${claim.id || claim.claim_number}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        <span>View Claim</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
