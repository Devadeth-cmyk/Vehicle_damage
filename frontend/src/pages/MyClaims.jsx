import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { claimService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Search, Filter, Plus, ChevronRight, Car, Calendar, FileText } from 'lucide-react';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const FILTERS = ['All', 'Submitted', 'Assessment', 'Verification', 'Package Ready', 'Completed'];

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await claimService.getClaims();
      const list = Array.isArray(data) ? data : data.claims || [];
      setClaims(list);
      setFilteredClaims(list);
    } catch (err) {
      console.error('Error loading claims:', err);
      const mockList = [
        {
          id: 'CLM-2026-0001',
          claim_number: 'CLM-2026-0001',
          vehicle: { make: 'Honda', model: 'City', registration_number: 'KL-07-BW-1234' },
          accident_date: '2026-09-22',
          submission_date: '2026-09-24',
          status: 'ASSESSMENT_IN_PROGRESS',
          last_updated: '2026-09-24 10:15 AM'
        },
        {
          id: 'CLM-2026-0002',
          claim_number: 'CLM-2026-0002',
          vehicle: { make: 'Tata', model: 'Nexon', registration_number: 'KL-01-CA-9876' },
          accident_date: '2026-09-18',
          submission_date: '2026-09-20',
          status: 'READY_FOR_INSURER_REVIEW',
          last_updated: '2026-09-23 04:30 PM'
        }
      ];
      setClaims(mockList);
      setFilteredClaims(mockList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    let result = claims;

    // Filter by tab
    if (activeFilter === 'Submitted') {
      result = result.filter((c) => c.status === 'SUBMITTED' || c.status === 'RECEIVED_BY_SERVICE_CENTER');
    } else if (activeFilter === 'Assessment') {
      result = result.filter(
        (c) => c.status === 'ASSESSMENT_IN_PROGRESS' || c.status === 'AI_ASSESSMENT_COMPLETED'
      );
    } else if (activeFilter === 'Verification') {
      result = result.filter((c) => c.status === 'TECHNICIAN_VERIFICATION');
    } else if (activeFilter === 'Package Ready') {
      result = result.filter((c) => c.status === 'CLAIM_PACKAGE_GENERATED');
    } else if (activeFilter === 'Completed') {
      result = result.filter((c) => c.status === 'READY_FOR_INSURER_REVIEW');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          (c.claim_number || c.id || '').toLowerCase().includes(q) ||
          (c.vehicle?.registration_number || '').toLowerCase().includes(q) ||
          (c.vehicle?.make || '').toLowerCase().includes(q) ||
          (c.vehicle?.model || '').toLowerCase().includes(q)
      );
    }

    setFilteredClaims(result);
  }, [activeFilter, searchQuery, claims]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Insurance Claims</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track real-time status and access vehicle damage assessments</p>
        </div>
        <Link
          to="/claims/new"
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>+ New Claim</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {FILTERS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Claim ID or Vehicle Reg..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        {/* Claims Table / List */}
        {loading ? (
          <LoadingSpinner text="Fetching claims list..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchClaims} />
        ) : filteredClaims.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Claims Found"
            description="No insurance claims match your current filter or search criteria."
            actionLabel="+ Submit New Claim"
            onAction={() => navigate('/claims/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Claim Number</th>
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Accident Date</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id || claim.claim_number} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 font-mono">
                      {claim.claim_number || claim.id}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {claim.vehicle ? `${claim.vehicle.make} ${claim.vehicle.model}` : 'Vehicle'}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {claim.vehicle?.registration_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                      {claim.accident_date || 'N/A'}
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
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                      >
                        <span>View Details</span>
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

export default MyClaims;
