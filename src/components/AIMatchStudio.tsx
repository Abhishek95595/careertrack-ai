import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Link2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  HelpCircle,
  ShieldAlert,
  Building2,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { JobApplication, AIAnalysisResult } from '../types';

interface AIMatchStudioProps {
  initialApplication?: JobApplication | null;
  onClearInitialApp?: () => void;
}

export const AIMatchStudio: React.FC<AIMatchStudioProps> = ({
  initialApplication,
  onClearInitialApp,
}) => {
  const { profile, resumeVersions, applications } = useCareer();

  // Input states
  const [inputMode, setInputMode] = useState<'paste' | 'upload' | 'url'>('paste');
  const [companyName, setCompanyName] = useState(initialApplication?.company || '');
  const [roleName, setRoleName] = useState(initialApplication?.role || '');
  const [jobDescription, setJobDescription] = useState(initialApplication?.notes || '');
  const [urlInput, setUrlInput] = useState(initialApplication?.applicationUrl || '');
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    initialApplication?.resumeVersionId || resumeVersions[0]?.id || ''
  );

  // Status states
  const [isUrlFetching, setIsUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);

  // Sync if initial application passed from other views
  useEffect(() => {
    if (initialApplication) {
      setCompanyName(initialApplication.company);
      setRoleName(initialApplication.role);
      setUrlInput(initialApplication.applicationUrl || '');
      if (initialApplication.resumeVersionId) {
        setSelectedResumeId(initialApplication.resumeVersionId);
      }
    }
  }, [initialApplication]);

  // Handle URL fetch via Express proxy
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a valid job posting URL.');
      return;
    }

    setUrlError(null);
    setIsUrlFetching(true);

    try {
      const res = await fetch('/api/scrape/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setJobDescription(data.text);
        setInputMode('paste'); // Switch to review extracted text
      } else {
        setUrlError(
          data.error ||
            'Could not automatically retrieve job description from this portal due to bot protection. Please copy and paste the job description text manually below.'
        );
      }
    } catch (err: unknown) {
      setUrlError(
        'Network error trying to fetch job posting URL. Please paste the job description text manually below.'
      );
    } finally {
      setIsUrlFetching(false);
    }
  };

  // Handle File Upload (.txt or .pdf text extract)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setJobDescription(text);
        setInputMode('paste');
      };
      reader.readAsText(file);
    } else {
      // For PDF or other files, read as plain text or prompt
      const reader = new FileReader();
      reader.onload = (event) => {
        const raw = event.target?.result as string;
        // Basic printable string extraction from binary / text
        const printable = raw.replace(/[^\x20-\x7E\t\r\n]/g, ' ').replace(/\s+/g, ' ');
        if (printable.length > 50) {
          setJobDescription(printable.slice(0, 8000));
          setInputMode('paste');
        } else {
          setAnalysisError('Could not parse text from this file. Please paste the job description directly.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Select an existing application to prefill
  const handleSelectExistingApp = (appId: string) => {
    const found = applications.find((a) => a.id === appId);
    if (found) {
      setCompanyName(found.company);
      setRoleName(found.role);
      setUrlInput(found.applicationUrl || '');
      if (found.resumeVersionId) {
        setSelectedResumeId(found.resumeVersionId);
      }
      if (found.notes) {
        setJobDescription((prev) => (prev ? prev : found.notes));
      }
    }
  };

  // Run Gemini analysis via Express proxy
  const handleRunAnalysis = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setAnalysisError('Please provide a complete job description (at least 30 characters) to analyze.');
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const chosenResume = resumeVersions.find((r) => r.id === selectedResumeId);
    const resumeText = chosenResume
      ? `Resume: ${chosenResume.name} (${chosenResume.targetDomain})\nSummary: ${chosenResume.summaryText}\nSkills: ${chosenResume.skillsIncluded.join(', ')}`
      : undefined;

    try {
      const res = await fetch('/api/ai/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          candidateProfile: profile,
          resumeText,
          roleName: roleName.trim() || 'Software Engineer',
          companyName: companyName.trim() || 'Company',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to complete analysis');
      }

      setAnalysisResult(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Powered by Gemini 3.8 Flash
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          AI Job Description &amp; Resume Gap Studio
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Paste any job description or posting link. Gemini analyzes required qualifications, matches them against your verified candidate profile, highlights missing keywords, and crafts tailored bullet rewrites grounded strictly in your real projects.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            {/* Quick Prefill Selector */}
            {applications.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Prefill From Tracked Job (Optional)
                </label>
                <select
                  onChange={(e) => handleSelectExistingApp(e.target.value)}
                  defaultValue=""
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an application to auto-fill...</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} — {app.role} ({app.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Target Company & Role */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Target Company
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Google, Microsoft"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Target Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. SDE Intern, Backend"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Candidate Resume Benchmark Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Candidate Resume Benchmark
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">Master Profile (All {profile.skills.length} skills)</option>
                  {resumeVersions.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} ({res.targetDomain})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Mode Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Job Description Source
              </label>
              <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                    inputMode === 'paste'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                    inputMode === 'url'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Posting URL
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                    inputMode === 'upload'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {/* Input Mode: URL Fetch */}
            {inputMode === 'url' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://company.com/jobs/sde-intern"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isUrlFetching}
                    onClick={handleFetchUrl}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                  >
                    {isUrlFetching ? 'Fetching...' : 'Fetch JD'}
                  </button>
                </div>

                {urlError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>URL Retrieval Fallback</span>
                    </div>
                    <p className="leading-relaxed">{urlError}</p>
                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className="text-xs font-bold text-amber-800 underline block mt-1"
                    >
                      Switch to manual text paste &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Input Mode: File Upload */}
            {inputMode === 'upload' && (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50">
                  <Upload className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-800">
                    Click to upload Job Description
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Supports .txt, .pdf, or markdown files
                  </span>
                  <input
                    type="file"
                    accept=".txt,.pdf,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Input Mode: Direct Text Area */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Job Description Text *
              </label>
              <textarea
                rows={9}
                placeholder="Paste the job requirements, responsibilities, and qualifications here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
              />
              <span className="text-[11px] text-slate-400 block text-right font-mono">
                {jobDescription.length} characters
              </span>
            </div>

            {/* Error Message */}
            {analysisError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Qualifications with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Gap &amp; Tailor Resume</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!analysisResult && !isAnalyzing && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[460px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Ready to Benchmark Your Profile
              </h3>
              <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
                Provide a job posting on the left to extract core competencies, inspect your skill gaps, and receive verified, truthful resume bullet point suggestions.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center text-[11px] text-slate-600">
                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                  ✓ Matched vs. Missing Matrix
                </span>
                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                  ✓ Action-Oriented Bullet Suggestions
                </span>
                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                  ✓ Role-Specific Interview Questions
                </span>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm flex flex-col items-center justify-center text-center min-h-[460px] space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Evaluating Alignment
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-referencing candidate skills with job description requirements...
                </p>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Match Header Score Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Grounded Skill Alignment
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 font-display mt-0.5">
                      {companyName || 'Target Role'} · {roleName || 'Job Posting'}
                    </h2>
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500 block">Match Score</span>
                      <span className="text-2xl font-bold font-mono text-slate-900">
                        {analysisResult.skillMatchPercentage}%
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-4 border-blue-600 flex items-center justify-center font-bold font-mono text-xs text-blue-700">
                      {analysisResult.skillMatchPercentage}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {analysisResult.roleSummary}
                </p>
              </div>

              {/* Side-by-Side Skills Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="bg-white rounded-xl border border-emerald-200/90 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 border-b border-emerald-100 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Matched Skills ({analysisResult.matchedSkills.length})
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Explicitly verified in your profile/resume:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.matchedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md text-xs font-semibold"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{sk}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-white rounded-xl border border-amber-200/90 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 border-b border-amber-100 pb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Missing / Desired Skills ({analysisResult.missingSkills.length})
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mentioned in JD but not evident in candidate data:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-xs font-medium"
                      >
                        <span>{sk}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tailored Bullet Suggestions */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Grounded Resume Bullet Recommendations</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Action-oriented bullet points rephrased strictly around your existing projects to highlight target job keywords.
                  </p>
                </div>

                <div className="space-y-4">
                  {analysisResult.tailoredBulletSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded">
                          Target: {item.targetSkill}
                        </span>
                        <button
                          onClick={() => copyToClipboard(item.suggestedBullet, idx)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          {copiedBulletIdx === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Bullet</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-800 font-medium leading-relaxed font-sans bg-white p-2.5 rounded border border-slate-200">
                        &bull; {item.suggestedBullet}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-500">
                        <span>Original context: {item.originalContext}</span>
                        <span className="italic text-slate-400">{item.rationale}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Likely Interview Questions */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Likely Interview Questions &amp; Preparation Angles</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Targeted technical and conceptual topics tailored to this position's stack.
                  </p>
                </div>

                <div className="space-y-3">
                  {analysisResult.interviewQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-slate-200 bg-purple-50/30 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-mono">
                          {q.focusArea}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">Q{idx + 1}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{q.question}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-700">Preparation Tip:</strong> {q.answerTip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Advice & Mandatory Disclaimer */}
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
                  <strong className="font-semibold block mb-1">Career Advisor Insight:</strong>
                  {analysisResult.overallAdvice}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-500 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Honesty &amp; Transparency Notice:</strong> {analysisResult.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
