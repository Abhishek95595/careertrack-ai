export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'Online Assessment'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  applicationDate: string; // YYYY-MM-DD
  deadlineDate?: string;   // YYYY-MM-DD
  applicationUrl?: string;
  status: ApplicationStatus;
  interviewDateTime?: string; // YYYY-MM-DDTHH:mm
  notes: string;
  salary?: string;
  resumeVersionId?: string;
  isDemo?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  fullName: string;
  email: string;
  university: string;
  degree: string;
  major: string;
  graduationYear: string;
  cgpa: string;
  skills: string[];
  experienceSummary: string;
  projectsSummary: string;
}

export interface ResumeVersion {
  id: string;
  name: string;
  targetDomain: string;
  summaryText: string;
  skillsIncluded: string[];
  updatedDate: string;
}

export interface TailoredBulletSuggestion {
  targetSkill: string;
  originalContext: string;
  suggestedBullet: string;
  rationale: string;
}

export interface InterviewQuestionItem {
  question: string;
  focusArea: string;
  answerTip: string;
}

export interface AIAnalysisResult {
  roleSummary: string;
  skillMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  keyResponsibilities: string[];
  tailoredBulletSuggestions: TailoredBulletSuggestion[];
  interviewQuestions: InterviewQuestionItem[];
  overallAdvice: string;
  disclaimer: string;
}
