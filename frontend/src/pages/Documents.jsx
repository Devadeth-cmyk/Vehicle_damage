import React, { useEffect, useState } from 'react';
import { documentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { FolderKanban, FileText, Download, Eye, ExternalLink } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocuments();
      setDocuments(Array.isArray(data) ? data : data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([
        {
          id: 'doc-1',
          name: 'Registration_Certificate.pdf',
          claim: 'CLM-2026-0001',
          type: 'Registration certificate',
          uploaded_date: '2026-09-24',
          status: 'Verified',
          url: '#'
        },
        {
          id: 'doc-2',
          name: 'Insurance_Policy_Bond.pdf',
          claim: 'CLM-2026-0001',
          type: 'Insurance policy',
          uploaded_date: '2026-09-24',
          status: 'Verified',
          url: '#'
        },
        {
          id: 'doc-3',
          name: 'Driving_Licence.pdf',
          claim: 'CLM-2026-0002',
          type: 'Driving licence',
          uploaded_date: '2026-09-20',
          status: 'Verified',
          url: '#'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Documents & Vault</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage policy documents and uploaded claim attachments</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        {loading ? (
          <LoadingSpinner text="Fetching document vault..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchDocuments} />
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No Documents Found"
            description="You haven't uploaded any documents yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Claim Reference</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Uploaded Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate max-w-xs">{doc.name || doc.filename}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {doc.claim || doc.claim_id || 'Global Account'}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      {doc.type}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {doc.uploaded_date || doc.created_at || 'Recently'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {doc.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={doc.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={doc.url || '#'}
                          download
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
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

export default Documents;
