import express from 'express';

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client with required aistudio-build telemetry header
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment. Please set it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Job Description Scraping / Extraction Endpoint with graceful fallback
app.post('/api/scrape/url', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ success: false, error: 'Please provide a valid URL.' });
    return;
  }

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      res.status(400).json({ success: false, error: 'URL must start with http:// or https://' });
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      res.status(200).json({
        success: false,
        error: `Could not fetch job posting (HTTP ${response.status}). Many job portals (e.g. LinkedIn, Greenhouse, Workday) require login or block automatic retrieval. Please copy and paste the job description text manually below.`,
      });
      return;
    }

    const html = await response.text();
    // Strip scripts, styles, and extract plain text
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length < 100) {
      res.status(200).json({
        success: false,
        error: 'The fetched page did not contain sufficient readable text. Please copy and paste the job description manually.',
      });
      return;
    }

    // Limit text to avoid payload overload
    const trimmed = cleanText.slice(0, 10000);
    res.json({ success: true, text: trimmed });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown network error';
    res.status(200).json({
      success: false,
      error: `Could not connect to URL (${errorMsg}). Please copy and paste the job description text or upload a PDF/TXT file directly.`,
    });
  }
});

// Gemini-powered Job Description Gap Analysis & Resume Tailoring
app.post('/api/ai/analyze-jd', async (req, res) => {
  try {
    const { jobDescription, candidateProfile, resumeText, roleName, companyName } = req.body;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 40) {
      res.status(400).json({
        error: 'Please provide a complete job description (at least 40 characters) to analyze.',
      });
      return;
    }

    let ai;
    try {
      ai = getGenAIClient();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Missing API Key';
      res.status(500).json({ error: msg });
      return;
    }

    const systemInstruction = `You are CareerTrack AI's career intelligence engine. You analyze job descriptions and evaluate them against student candidate profiles and resumes.

STRICT ACCURACY & HONESTY RULES:
1. NEVER INVENT qualifications, skills, companies, GPA, or projects not present in the candidate profile or resume.
2. CLEARLY DISTINGUISH matched skills (verifiably present in candidate data) from missing skills (required or preferred by the JD but absent from candidate data).
3. Do NOT make unrealistic promises. Suggest genuine, truthful bullet point improvements that frame the candidate's existing projects and coursework in terms of the job description's target keywords.
4. Calculate skillMatchPercentage strictly as: (matched skills count / total required skills identified) * 100 (rounded to an integer between 0 and 100).
5. Always include an honest disclaimer stating that ATS scores and interview outcomes cannot be guaranteed and are based on self-reported profile data.`;

    const prompt = `
TARGET JOB DETAILS:
Role: ${roleName || 'Software Role'}
Company: ${companyName || 'Not specified'}

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 12000)}
"""

CANDIDATE PROFILE:
Full Name: ${candidateProfile?.fullName || 'Student'}
Degree: ${candidateProfile?.degree || 'B.Tech'} in ${candidateProfile?.major || 'Computer Science'}
University: ${candidateProfile?.university || 'University'}
Graduation Year: ${candidateProfile?.graduationYear || '2026'}
CGPA: ${candidateProfile?.cgpa || 'N/A'}
Declared Skills: ${(candidateProfile?.skills || []).join(', ') || 'General CS fundamentals'}
Experience Summary: ${candidateProfile?.experienceSummary || 'None provided'}
Projects Summary: ${candidateProfile?.projectsSummary || 'None provided'}

SPECIFIC RESUME VERSION TEXT PROVIDED:
"""
${resumeText ? resumeText.slice(0, 6000) : 'Use candidate profile details above.'}
"""

Please produce a structured, high-precision gap analysis and interview preparation briefing.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roleSummary: {
              type: Type.STRING,
              description: 'Concise 2-sentence summary of the core job expectations.',
            },
            skillMatchPercentage: {
              type: Type.INTEGER,
              description: 'Calculated match percentage (0-100) based on verified skills.',
            },
            matchedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills explicitly found in both candidate profile and the JD.',
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills or tools mentioned in the JD that are not evident in candidate data.',
            },
            keyResponsibilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 core expectations distilled from the posting.',
            },
            tailoredBulletSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  targetSkill: { type: Type.STRING },
                  originalContext: {
                    type: Type.STRING,
                    description: 'Candidate existing experience or project mentioned.',
                  },
                  suggestedBullet: {
                    type: Type.STRING,
                    description: 'Action-verb + metrics + technology tailored bullet point.',
                  },
                  rationale: {
                    type: Type.STRING,
                    description: 'Why this adjustment helps align with the JD.',
                  },
                },
                required: ['targetSkill', 'originalContext', 'suggestedBullet', 'rationale'],
              },
              description: 'Truthful suggestions to highlight existing work using relevant JD keywords.',
            },
            interviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  answerTip: { type: Type.STRING },
                },
                required: ['question', 'focusArea', 'answerTip'],
              },
              description: '4 role-specific technical/conceptual interview questions likely to be asked.',
            },
            overallAdvice: {
              type: Type.STRING,
              description: 'Practical advice for this specific candidate when applying or interviewing.',
            },
            disclaimer: {
              type: Type.STRING,
              description: 'Mandatory disclaimer statement regarding ATS scores.',
            },
          },
          required: [
            'roleSummary',
            'skillMatchPercentage',
            'matchedSkills',
            'missingSkills',
            'keyResponsibilities',
            'tailoredBulletSuggestions',
            'interviewQuestions',
            'overallAdvice',
            'disclaimer',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      res.status(500).json({ error: 'AI returned an empty response. Please try again.' });
      return;
    }

    const parsedData = JSON.parse(text);
    res.json({ success: true, data: parsedData });
  } catch (err: unknown) {
    console.error('Error generating AI analysis:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown AI generation error';
    res.status(500).json({
      error: `AI Analysis failed: ${errorMsg}. Please ensure your API key is valid.`,
    });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerTrack AI server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  void startServer();
}
