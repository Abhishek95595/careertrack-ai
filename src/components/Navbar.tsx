import React, { useState } from 'react';
import {
  Briefcase,
  LayoutGrid,
  Table,
  UserCheck,
  Sparkles,
  Download,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';

interface NavbarProps {
  currentTab: 'dashboard' | 'table' | 'profile' | 'ai-match';
  setCurrentTab: (tab: 'dashboard' | 'table' | 'profile' | 'ai-match') => void;
  onOpenNewModal: () => void;
  onOpenBackupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewModal,
  onOpenBackupModal,
}) => {
  const { hasDemoData, clearDemoApplications } = useCareer();
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-[#1E3E62] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Single element brand mark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white font-display block leading-none">
                  CareerTrack AI
                </span>
                <span className="text-[11px] text-slate-400 font-medium tracking-wider uppercase block mt-1">
                  Student Job &amp; Internship Tracker
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'dashboard'
                  ? 'bg-[#1E3E62] text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban Board
            </button>

            <button
              onClick={() => setCurrentTab('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'table'
                  ? 'bg-[#1E3E62] text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-4 h-4" />
              All Applications
            </button>

            <button
              onClick={() => setCurrentTab('ai-match')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'ai-match'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              AI Match Studio
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'profile'
                  ? 'bg-[#1E3E62] text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Profile &amp; Resumes
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {hasDemoData && (
              <button
                onClick={() => setShowDemoConfirm(true)}
                title="Remove sample records"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-md hover:bg-amber-900/60 transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Demo Data
              </button>
            )}

            <button
              onClick={onOpenBackupModal}
              title="Backup, restore, and data privacy"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#1E3E62]/70 hover:bg-[#1E3E62] border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup / JSON</span>
            </button>

            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-md shadow-sm transition-all whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B192C]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Application</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800 text-xs">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'dashboard' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Board</span>
          </button>
          <button
            onClick={() => setCurrentTab('table')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'table' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setCurrentTab('ai-match')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'ai-match' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Match</span>
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'profile' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Demo Data Removal Confirmation Modal */}
      {showDemoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
              Remove Demo Applications?
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              This will remove all pre-loaded sample applications (Google, Microsoft, Stripe, etc.). Any real applications you created will remain safe.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDemoConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearDemoApplications();
                  setShowDemoConfirm(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
              >
                Remove Demo Records
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
