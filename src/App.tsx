/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CareerProvider, useCareer } from './context/CareerContext';
import { Navbar } from './components/Navbar';
import { KPISummary } from './components/KPISummary';
import { KanbanBoard } from './components/KanbanBoard';
import { ApplicationTable } from './components/ApplicationTable';
import { ApplicationModal } from './components/ApplicationModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { BackupModal } from './components/BackupModal';
import { ProfileView } from './components/ProfileView';
import { AIMatchStudio } from './components/AIMatchStudio';
import { JobApplication, ApplicationStatus } from './types';
import { LayoutGrid, Table as TableIcon, Sparkles } from 'lucide-react';

function CareerTrackApp() {
  const { deleteApplication } = useCareer();

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'table' | 'profile' | 'ai-match'>('dashboard');
  const [dashboardSubView, setDashboardSubView] = useState<'kanban' | 'table'>('kanban');

  // Modals state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appToEdit, setAppToEdit] = useState<JobApplication | null>(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<ApplicationStatus>('Applied');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<JobApplication | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [aiTargetApp, setAiTargetApp] = useState<JobApplication | null>(null);

  const handleOpenNewModal = (defaultStatus: ApplicationStatus = 'Applied') => {
    setAppToEdit(null);
    setModalDefaultStatus(defaultStatus);
    setIsAppModalOpen(true);
  };

  const handleEditApplication = (app: JobApplication) => {
    setAppToEdit(app);
    setIsAppModalOpen(true);
  };

  const handleDeleteApplication = (app: JobApplication) => {
    setAppToDelete(app);
    setIsDeleteModalOpen(true);
  };

  const handleAnalyzeApplication = (app: JobApplication) => {
    setAiTargetApp(app);
    setCurrentTab('ai-match');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navbar Contract */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'ai-match') {
            setAiTargetApp(null);
          }
        }}
        onOpenNewModal={() => handleOpenNewModal('Applied')}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard View (Kanban + KPI + View Switcher) */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-display">
                  Job Search Pipeline
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track stages, upcoming deadlines, and interview schedules in one unified workspace.
                </p>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setDashboardSubView('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                    dashboardSubView === 'kanban'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kanban Board</span>
                </button>
                <button
                  onClick={() => setDashboardSubView('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                    dashboardSubView === 'table'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Data Table</span>
                </button>
              </div>
            </div>

            {/* Metrics and urgent alerts */}
            <KPISummary onSelectApplication={handleEditApplication} />

            {/* Sub-view switcher */}
            {dashboardSubView === 'kanban' ? (
              <KanbanBoard
                onEditApplication={handleEditApplication}
                onDeleteApplication={handleDeleteApplication}
                onAnalyzeApplication={handleAnalyzeApplication}
                onAddNewToStatus={(status) => handleOpenNewModal(status)}
              />
            ) : (
              <ApplicationTable
                onEditApplication={handleEditApplication}
                onDeleteApplication={handleDeleteApplication}
                onAnalyzeApplication={handleAnalyzeApplication}
                onOpenNewModal={() => handleOpenNewModal('Applied')}
              />
            )}
          </div>
        )}

        {/* All Applications Table View */}
        {currentTab === 'table' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                All Applications Registry
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Sort, filter, and review your entire job search database with inline stage controls.
              </p>
            </div>

            <KPISummary onSelectApplication={handleEditApplication} />

            <ApplicationTable
              onEditApplication={handleEditApplication}
              onDeleteApplication={handleDeleteApplication}
              onAnalyzeApplication={handleAnalyzeApplication}
              onOpenNewModal={() => handleOpenNewModal('Applied')}
            />
          </div>
        )}

        {/* AI Match Studio View */}
        {currentTab === 'ai-match' && (
          <AIMatchStudio
            initialApplication={aiTargetApp}
            onClearInitialApp={() => setAiTargetApp(null)}
          />
        )}

        {/* Candidate Profile & Resumes View */}
        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Global Modals */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        applicationToEdit={appToEdit}
        defaultStatus={modalDefaultStatus}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        application={appToDelete}
        onConfirmDelete={(id) => deleteApplication(id)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Clean, Anti-Slop Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 font-display">CareerTrack AI</span>
            <span>·</span>
            <span>Client-side persistent job search suite</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Data stored in private browser storage</span>
            <span>·</span>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Export JSON Backup
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CareerProvider>
      <CareerTrackApp />
    </CareerProvider>
  );
}
