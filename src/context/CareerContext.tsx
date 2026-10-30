import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobApplication, UserProfile, ResumeVersion, ApplicationStatus } from '../types';

interface CareerContextType {
  applications: JobApplication[];
  profile: UserProfile;
  resumeVersions: ResumeVersion[];
  hasDemoData: boolean;
  addApplication: (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  updateStatus: (id: string, newStatus: ApplicationStatus) => void;
  clearDemoApplications: () => void;
  resetAllData: () => void;
  updateProfile: (profile: UserProfile) => void;
  addResumeVersion: (version: Omit<ResumeVersion, 'id' | 'updatedDate'>) => void;
  updateResumeVersion: (id: string, updates: Partial<ResumeVersion>) => void;
  deleteResumeVersion: (id: string) => void;
  exportDataAsJSON: () => void;
  importDataFromJSON: (jsonString: string) => { success: boolean; message: string; count?: number };
}

const STORAGE_KEYS = {
  APPLICATIONS: 'careertrack_applications_v1',
  PROFILE: 'careertrack_profile_v1',
  RESUMES: 'careertrack_resumes_v1',
};

// Realistic initial demo seed for a final-year CS student
const INITIAL_DEMO_APPLICATIONS: JobApplication[] = [
  {
    id: 'demo-app-1',
    company: 'Google',
    role: 'Software Engineering Intern, Summer 2026',
    location: 'Mountain View, CA / Hybrid',
    applicationDate: '2026-10-12',
    deadlineDate: '2026-11-05',
    applicationUrl: 'https://careers.google.com/jobs/results/12345',
    status: 'Interview',
    interviewDateTime: '2026-11-02T15:30',
    notes: 'Technical Round 1: Algorithms & Data Structures. Focus on Graphs, Dynamic Programming, and System Design basics.',
    salary: '$58/hr + Housing Stipend',
    resumeVersionId: 'demo-resume-1',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'demo-app-2',
    company: 'Microsoft',
    role: 'Software Engineer - University Graduate',
    location: 'Redmond, WA',
    applicationDate: '2026-10-18',
    deadlineDate: '2026-10-31',
    applicationUrl: 'https://jobs.careers.microsoft.com/global/en/job/78910',
    status: 'Online Assessment',
    interviewDateTime: '2026-10-31T20:00',
    notes: 'Codility OA link received. 3 algorithmic questions, 90 minute duration. Must complete before deadline tomorrow night.',
    salary: '$130k base + $35k stock/bonus',
    resumeVersionId: 'demo-resume-1',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: 'demo-app-3',
    company: 'Stripe',
    role: 'Backend Engineering Intern',
    location: 'San Francisco, CA / Remote',
    applicationDate: '2026-10-24',
    deadlineDate: '2026-11-15',
    applicationUrl: 'https://stripe.com/jobs/listing/4567',
    status: 'Applied',
    notes: 'Applied with tailored Distributed Systems resume. Referral submitted by alumni Sarah Jenkins.',
    salary: '$62/hr',
    resumeVersionId: 'demo-resume-2',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: 'demo-app-4',
    company: 'Amazon',
    role: 'SDE 1 (Full-Time 2026)',
    location: 'Seattle, WA',
    applicationDate: '2026-10-28',
    deadlineDate: '2026-11-04',
    applicationUrl: 'https://amazon.jobs/en/jobs/2026-sde',
    status: 'Wishlist',
    notes: 'Preparing leadership principles stories. Need to review Amazon STAR format answers.',
    salary: '$138k base',
    resumeVersionId: 'demo-resume-1',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'demo-app-5',
    company: 'Atlassian',
    role: 'Associate Software Engineer',
    location: 'Bengaluru / Remote',
    applicationDate: '2026-09-20',
    deadlineDate: '2026-10-15',
    applicationUrl: 'https://www.atlassian.com/company/careers/details/9928',
    status: 'Offer',
    notes: 'Official offer letter received! 2 weeks to sign. Need to review health benefits and 401k match.',
    salary: '₹24 LPA total CTC',
    resumeVersionId: 'demo-resume-3',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'demo-app-6',
    company: 'Uber',
    role: 'Software Engineer Intern',
    location: 'Sunnyvale, CA',
    applicationDate: '2026-09-15',
    deadlineDate: '2026-10-01',
    status: 'Rejected',
    notes: 'Received automated rejection after Codesignal OA score (740). Will practice more sliding window problems.',
    resumeVersionId: 'demo-resume-1',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
];

const INITIAL_DEMO_RESUMES: ResumeVersion[] = [
  {
    id: 'demo-resume-1',
    name: 'General SDE - 2026 Full Stack',
    targetDomain: 'Software Engineering / Full-Stack',
    summaryText: 'Final-year B.Tech CS candidate with strong foundations in Data Structures, Algorithms, TypeScript, React, and Python. Experience building scalable web applications and microservices.',
    skillsIncluded: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'REST APIs', 'Git'],
    updatedDate: '2026-10-25',
  },
  {
    id: 'demo-resume-2',
    name: 'Backend & Distributed Systems',
    targetDomain: 'Backend Engineering & Cloud',
    summaryText: 'Focused on high-throughput backend services, Redis caching, Go, PostgreSQL database indexing, and distributed messaging pipelines with RabbitMQ and Kafka.',
    skillsIncluded: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Distributed Systems', 'gRPC', 'System Design'],
    updatedDate: '2026-10-20',
  },
  {
    id: 'demo-resume-3',
    name: 'Frontend & UI Engineering',
    targetDomain: 'Frontend & Web Platforms',
    summaryText: 'Specialized in modern client-side architectures, React 19, Next.js, Tailwind CSS, performance optimization, and accessibility WCAG standards.',
    skillsIncluded: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'State Management', 'Web Performance', 'Testing Library'],
    updatedDate: '2026-10-15',
  },
];

const INITIAL_DEMO_PROFILE: UserProfile = {
  fullName: 'Alex Chen',
  email: 'alex.chen.cs26@example.edu',
  university: 'National Institute of Technology / B.Tech CS',
  degree: 'Bachelor of Technology (B.Tech)',
  major: 'Computer Science & Engineering',
  graduationYear: '2026',
  cgpa: '8.85 / 10.0',
  skills: [
    'Data Structures & Algorithms',
    'TypeScript',
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'Express',
    'PostgreSQL',
    'Redis',
    'Docker',
    'Git',
    'Linux',
    'REST APIs',
    'System Design',
  ],
  experienceSummary: 'Summer Software Engineering Intern at TechVanguard (May - July 2025): Developed internal microservices in Node.js and TypeScript, improved database query performance by 34% via composite indexing, and built automated CI/CD GitHub Actions pipelines.',
  projectsSummary: '1. Distributed Task Scheduler: Built a fault-tolerant job queue in Go and Redis with exponential backoff and worker pooling. 2. Real-time Collaborative Code Editor: Developed a WebSocket-based multi-user workspace using React, Node.js, and Operational Transformation algorithms. 3. Campus Career Portal: Full-stack platform serving 1,200+ students with automated resume parsing and notification webhooks.',
};

const CareerContext = createContext<CareerContextType | null>(null);

export const CareerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load applications with fallback to initial demo
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load applications from localStorage:', e);
    }
    return INITIAL_DEMO_APPLICATIONS;
  });

  // Load profile with fallback
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load profile from localStorage:', e);
    }
    return INITIAL_DEMO_PROFILE;
  });

  // Load resume versions with fallback
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESUMES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load resume versions from localStorage:', e);
    }
    return INITIAL_DEMO_RESUMES;
  });

  // Sync to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.error('Error persisting applications to localStorage:', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error persisting profile to localStorage:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumeVersions));
    } catch (e) {
      console.error('Error persisting resumes to localStorage:', e);
    }
  }, [resumeVersions]);

  const hasDemoData = applications.some((app) => app.isDemo);

  const addApplication = (appData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApp: JobApplication = {
      ...appData,
      id: 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      isDemo: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates, updatedAt: Date.now() } : app))
    );
  };

  const updateStatus = (id: string, newStatus: ApplicationStatus) => {
    updateApplication(id, { status: newStatus });
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const clearDemoApplications = () => {
    setApplications((prev) => prev.filter((app) => !app.isDemo));
  };

  const resetAllData = () => {
    setApplications([]);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const addResumeVersion = (versionData: Omit<ResumeVersion, 'id' | 'updatedDate'>) => {
    const newVersion: ResumeVersion = {
      ...versionData,
      id: 'resume_' + Date.now(),
      updatedDate: new Date().toISOString().split('T')[0],
    };
    setResumeVersions((prev) => [newVersion, ...prev]);
  };

  const updateResumeVersion = (id: string, updates: Partial<ResumeVersion>) => {
    setResumeVersions((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...updates, updatedDate: new Date().toISOString().split('T')[0] }
          : r
      )
    );
  };

  const deleteResumeVersion = (id: string) => {
    setResumeVersions((prev) => prev.filter((r) => r.id !== id));
  };

  const exportDataAsJSON = () => {
    const backupPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      applications,
      profile,
      resumeVersions,
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `careertrack_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importDataFromJSON = (
    jsonString: string
  ): { success: boolean; message: string; count?: number } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid file format: Expected a JSON object.' };
      }
      if (!Array.isArray(data.applications)) {
        return {
          success: false,
          message: 'Invalid backup structure: missing "applications" array.',
        };
      }

      // Sanitize applications
      const importedApps: JobApplication[] = data.applications.map((app: any, idx: number) => ({
        id: app.id || `imported_${Date.now()}_${idx}`,
        company: app.company || 'Unknown Company',
        role: app.role || 'Role',
        location: app.location || 'Remote',
        applicationDate: app.applicationDate || new Date().toISOString().split('T')[0],
        deadlineDate: app.deadlineDate || undefined,
        applicationUrl: app.applicationUrl || undefined,
        status: app.status || 'Applied',
        interviewDateTime: app.interviewDateTime || undefined,
        notes: app.notes || '',
        salary: app.salary || undefined,
        resumeVersionId: app.resumeVersionId || undefined,
        isDemo: Boolean(app.isDemo),
        createdAt: app.createdAt || Date.now(),
        updatedAt: app.updatedAt || Date.now(),
      }));

      setApplications(importedApps);

      if (data.profile && typeof data.profile === 'object') {
        setProfile((prev) => ({ ...prev, ...data.profile }));
      }
      if (Array.isArray(data.resumeVersions)) {
        setResumeVersions(data.resumeVersions);
      }

      return {
        success: true,
        message: `Successfully restored ${importedApps.length} applications and profile data.`,
        count: importedApps.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'JSON parse error';
      return { success: false, message: `Failed to import JSON: ${msg}` };
    }
  };

  return (
    <CareerContext.Provider
      value={{
        applications,
        profile,
        resumeVersions,
        hasDemoData,
        addApplication,
        updateApplication,
        deleteApplication,
        updateStatus,
        clearDemoApplications,
        resetAllData,
        updateProfile,
        addResumeVersion,
        updateResumeVersion,
        deleteResumeVersion,
        exportDataAsJSON,
        importDataFromJSON,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
};

export const useCareer = () => {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
};
