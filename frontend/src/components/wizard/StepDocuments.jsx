import React, { useState } from 'react';
import { FileText, Upload, Trash2, CheckCircle2 } from 'lucide-react';

const DOC_TYPES = [
  'Insurance policy',
  'Registration certificate',
  'Driving licence',
  'FIR/police document',
  'Previous claim documents',
  'Other supporting documents'
];

const StepDocuments = ({ claimData, setClaimData, onNext, onBack }) => {
  const [docList, setDocList] = useState(claimData.documentFiles || []);
  const [selectedDocType, setSelectedDocType] = useState('Insurance policy');

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newDocs = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      type: selectedDocType,
      filename: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      status: 'Ready'
    }));

    const updated = [...docList, ...newDocs];
    setDocList(updated);
    setClaimData((prev) => ({ ...prev, documentFiles: updated }));
  };

  const removeDoc = (id) => {
    const updated = docList.filter((d) => d.id !== id);
    setDocList(updated);
    setClaimData((prev) => ({ ...prev, documentFiles: updated }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Supporting Documents</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Upload official documents such as driving license, RC, policy bond or FIR.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document Category</label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-600"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select File (PDF, PNG, JPG)</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

      {docList.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Attached Documents ({docList.length})
          </h4>
          <div className="space-y-2">
            {docList.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-sm truncate">{doc.filename}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-blue-600">{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDoc(doc.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
        >
          Next: Review & Submit →
        </button>
      </div>
    </div>
  );
};

export default StepDocuments;
