import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { JobApplication } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  onConfirmDelete: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  application,
  onConfirmDelete,
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 overflow-hidden">
        <div className="flex items-center gap-3 text-rose-600 mb-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Delete Application Record?
          </h3>
        </div>

        <p className="text-sm text-slate-600 mb-2 leading-relaxed">
          Are you sure you want to delete the application record for:
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-3">
          <p className="font-bold text-slate-900 text-sm">{application.company}</p>
          <p className="text-xs text-slate-600">{application.role}</p>
          <p className="text-[11px] text-slate-400 mt-1">Stage: {application.status}</p>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          This action will remove the record from your dashboard. You can restore it later only if you have exported a JSON backup.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(application.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Yes, Delete Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
