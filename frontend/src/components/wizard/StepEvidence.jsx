import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Video, X, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'Front', label: 'Front View' },
  { id: 'Rear', label: 'Rear View' },
  { id: 'Left Side', label: 'Left Side' },
  { id: 'Right Side', label: 'Right Side' },
  { id: 'Additional Evidence', label: 'Additional Photos' },
  { id: 'Video', label: 'Walkaround Video' }
];

const StepEvidence = ({ claimData, setClaimData, onNext, onBack }) => {
  const [evidenceList, setEvidenceList] = useState(claimData.evidenceFiles || []);
  const [activeCategory, setActiveCategory] = useState('Front');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newEntries = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      category: activeCategory,
      filename: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      isVideo: file.type.startsWith('video/'),
      status: 'Ready for upload'
    }));

    const updated = [...evidenceList, ...newEntries];
    setEvidenceList(updated);
    setClaimData((prev) => ({ ...prev, evidenceFiles: updated }));
  };

  const removeFile = (id) => {
    const updated = evidenceList.filter((item) => item.id !== id);
    setEvidenceList(updated);
    setClaimData((prev) => ({ ...prev, evidenceFiles: updated }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Upload Visual Evidence</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Upload clear photos and videos of the damaged vehicle areas for AI Assessment.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 text-center bg-slate-50/50 transition-colors relative">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Click or drag files here to upload under <span className="text-blue-600">[{activeCategory}]</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP, MP4, MOV (Max 50MB per video)</p>
        </div>
      </div>

      {/* Uploaded Evidence Grid */}
      {evidenceList.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Uploaded Evidence ({evidenceList.length} Files)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs relative flex flex-col justify-between group"
              >
                <div className="h-28 bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center mb-2">
                  {item.preview ? (
                    <img src={item.preview} alt={item.filename} className="w-full h-full object-cover" />
                  ) : item.isVideo ? (
                    <Video className="w-8 h-8 text-slate-400" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
                  <span className="absolute top-1.5 left-1.5 bg-slate-900/70 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.filename}</p>
                  <p className="text-[11px] text-slate-400">{item.size}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="absolute top-4 right-4 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
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
          Next: Supporting Documents →
        </button>
      </div>
    </div>
  );
};

export default StepEvidence;
