import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  ShieldCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileJson,
  RotateCcw,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const {
    applications,
    profile,
    resumeVersions,
    hasDemoData,
    exportDataAsJSON,
    importDataFromJSON,
    clearDemoApplications,
    resetAllData,
  } = useCareer();

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJSON(content);
      setImportStatus(res);
      if (res.success) {
        setImportText('');
      }
    };
    reader.onerror = () => {
      setImportStatus({ success: false, message: 'Failed to read backup file.' });
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (!importText.trim()) return;
    const res = importDataFromJSON(importText);
    setImportStatus(res);
    if (res.success) {
      setImportText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-display">Data Safety &amp; JSON Backup</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-sm text-slate-700">
          {/* Privacy & Storage Guarantee */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Client-Side Privacy</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your applications, interview schedules, CGPA, and resume versions are stored securely inside your browser's private <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[11px]">localStorage</code>. They survive page refreshes and browser restarts. No personal profile data or resume files are retained on external servers.
            </p>
          </div>

          {/* Section 1: Export JSON */}
          <div className="space-y-2 border-b border-slate-200 pb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-600" />
              <span>1. Download Full JSON Backup</span>
            </h3>
            <p className="text-xs text-slate-500">
              Export all your applications ({applications.length}), profile details, and resume versions into a single offline JSON file for safe-keeping.
            </p>
            <button
              onClick={exportDataAsJSON}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export careertrack_backup.json</span>
            </button>
          </div>

          {/* Section 2: Import JSON */}
          <div className="space-y-3 border-b border-slate-200 pb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-purple-600" />
              <span>2. Restore / Import JSON Backup</span>
            </h3>
            <p className="text-xs text-slate-500">
              Restore previously exported applications or migrate them to another device:
            </p>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg cursor-pointer border border-slate-300 transition-colors">
                <FileJson className="w-4 h-4 text-purple-600" />
                <span>Upload .json Backup File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400">or paste JSON below</span>
            </div>

            <textarea
              rows={3}
              placeholder="Paste raw JSON backup text here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {importText.trim() && (
              <button
                onClick={handleManualImport}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-md transition-colors"
              >
                Apply Pasted Backup
              </button>
            )}

            {importStatus && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg text-xs ${
                  importStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* Section 3: Sample & Reset Data Management */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              3. Data Reset &amp; Sample Management
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {hasDemoData && (
                <button
                  onClick={() => {
                    clearDemoApplications();
                    setImportStatus({
                      success: true,
                      message: 'Sample demo applications removed. Real data preserved.',
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Remove Demo Records Only</span>
                </button>
              )}

              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear All Applications</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 p-2 rounded-lg text-xs">
                  <span className="text-rose-900 font-medium">Are you sure?</span>
                  <button
                    onClick={() => {
                      resetAllData();
                      setShowResetConfirm(false);
                      setImportStatus({
                        success: true,
                        message: 'All application records have been cleared.',
                      });
                    }}
                    className="px-2 py-1 bg-rose-600 text-white font-bold rounded text-xs hover:bg-rose-700"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
