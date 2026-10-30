import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { ResumeVersion } from '../types';

export const ProfileView: React.FC = () => {
  const {
    profile,
    updateProfile,
    resumeVersions,
    addResumeVersion,
    updateResumeVersion,
    deleteResumeVersion,
    applications,
  } = useCareer();

  // Profile form state
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [university, setUniversity] = useState(profile.university);
  const [degree, setDegree] = useState(profile.degree);
  const [major, setMajor] = useState(profile.major);
  const [graduationYear, setGraduationYear] = useState(profile.graduationYear);
  const [cgpa, setCgpa] = useState(profile.cgpa);
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [experienceSummary, setExperienceSummary] = useState(profile.experienceSummary);
  const [projectsSummary, setProjectsSummary] = useState(profile.projectsSummary);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Resume Version form modal state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [resName, setResName] = useState('');
  const [resDomain, setResDomain] = useState('');
  const [resSummary, setResSummary] = useState('');
  const [resSkills, setResSkills] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      university: university.trim(),
      degree: degree.trim(),
      major: major.trim(),
      graduationYear: graduationYear.trim(),
      cgpa: cgpa.trim(),
      skills,
      experienceSummary: experienceSummary.trim(),
      projectsSummary: projectsSummary.trim(),
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const openResumeModal = (res?: ResumeVersion) => {
    if (res) {
      setEditingResumeId(res.id);
      setResName(res.name);
      setResDomain(res.targetDomain);
      setResSummary(res.summaryText);
      setResSkills(res.skillsIncluded.join(', '));
    } else {
      setEditingResumeId(null);
      setResName('');
      setResDomain('Full Stack / Software Engineering');
      setResSummary('');
      setResSkills('');
    }
    setShowResumeModal(true);
  };

  const handleSaveResumeVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim()) return;

    const parsedSkills = resSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingResumeId) {
      updateResumeVersion(editingResumeId, {
        name: resName.trim(),
        targetDomain: resDomain.trim(),
        summaryText: resSummary.trim(),
        skillsIncluded: parsedSkills,
      });
    } else {
      addResumeVersion({
        name: resName.trim(),
        targetDomain: resDomain.trim(),
        summaryText: resSummary.trim(),
        skillsIncluded: parsedSkills,
      });
    }
    setShowResumeModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Candidate Profile &amp; Resume Versions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Maintain your academic credentials, verified skills, and multiple tailored resume profiles for AI gap analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Academic & Experience Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Academic Credentials &amp; Education
                </h2>
              </div>
              {savedFeedback && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved successfully
                </span>
              )}
            </div>

            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* University & Degree */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Degree &amp; Major
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Degree (e.g. B.Tech)"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-1/3 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Major (e.g. Computer Science)"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-2/3 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Grad Year & CGPA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Graduation Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  CGPA / Percentage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8.85 / 10.0 or 3.8 / 4.0"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Core Verified Skills Tag Editor */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Core Verified Skills &amp; Technologies
              </label>
              <p className="text-xs text-slate-500">
                These skills are used by the AI engine as verifiable candidate competencies when analyzing job postings.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a skill (e.g. React, Docker, Python) and press Add..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Add Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium border border-slate-200 transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Experience Summary */}
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Internships &amp; Work Experience Summary
              </label>
              <textarea
                rows={3}
                placeholder="Detail past summer internships, research work, or campus tech roles..."
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Projects Summary */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Key Technical Projects &amp; Open Source
              </label>
              <textarea
                rows={3}
                placeholder="List major portfolio projects, architecture, tech stacks, and metrics..."
                value={projectsSummary}
                onChange={(e) => setProjectsSummary(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Multiple Resume Versions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Resume Versions ({resumeVersions.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openResumeModal()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Version</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain separate resume versions for distinct roles (e.g. Full-Stack, Backend, Data Science). Associate each application with its exact resume version.
            </p>

            {/* Versions List */}
            <div className="space-y-3">
              {resumeVersions.map((res) => {
                const linkedAppsCount = applications.filter(
                  (a) => a.resumeVersionId === res.id
                ).length;

                return (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-display">
                          {res.name}
                        </h4>
                        <span className="text-xs text-purple-700 font-medium block">
                          {res.targetDomain}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openResumeModal(res)}
                          title="Edit Version"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteResumeVersion(res.id)}
                          title="Delete Version"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{res.summaryText}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono">
                      <span>Updated: {res.updatedDate}</span>
                      <span className="font-semibold text-slate-700">
                        {linkedAppsCount} linked apps
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & Anti-Hallucination Disclaimer */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AI Ethics &amp; Grounding Policy</span>
            </div>
            <p className="leading-relaxed">
              CareerTrack AI operates with zero fabrication. The Gemini analysis engine is forbidden from inventing unearned skills or work history. It matches your verified profile against job requirements and suggests truthful action-oriented phrasing.
            </p>
          </div>
        </div>
      </div>

      {/* Resume Version Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-display">
              {editingResumeId ? 'Edit Resume Version' : 'Create New Resume Version'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Define the role focus and specialized summary for this resume iteration.
            </p>

            <form onSubmit={handleSaveResumeVersion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Version Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack SDE v2 or Backend / Go"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Target Domain / Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems, Frontend, Cloud"
                  value={resDomain}
                  onChange={(e) => setResDomain(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Tailored Summary / Objective
                </label>
                <textarea
                  rows={3}
                  placeholder="Highlight specific strengths relevant to this target domain..."
                  value={resSummary}
                  onChange={(e) => setResSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Skills Emphasized (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Go, PostgreSQL, Redis, Docker, gRPC"
                  value={resSkills}
                  onChange={(e) => setResSkills(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Save Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
