# CareerTrack AI 🎯

**Intelligent Job & Internship Application Tracker for Students & Early-Career Professionals**

CareerTrack AI is a full-featured, persistent job search command center built with React 19, TypeScript, Tailwind CSS, Express, and Google Gemini API. It streamlines managing your job search pipeline, tracking upcoming interviews, tailoring resumes, and performing deep AI-powered job description gap analyses.

---

## ✨ Features

- 📊 **Kanban Pipeline Board**: Drag-and-drop or status-card management across stages (*Wishlist*, *Applied*, *Screening*, *Technical Interview*, *Behavioral Interview*, *Offer Received*, *Rejected*, *Withdrawn*).
- 📋 **All-Applications Data Table**: Searchable, filterable, and sortable database view of all your job submissions with quick inline status controls.
- ⏱️ **Interview & Deadline Tracker**: Countdown timers, priority flags, and urgent alerts for upcoming deadlines and rounds.
- 🤖 **AI Match Studio**: Powered by Gemini (`@google/genai`), compares your candidate profile/resume against real job descriptions to calculate match scores, detect skill gaps, and provide targeted interview prep talking points.
- 👤 **Candidate Profile & Resume Vault**: Save your base technical background, project highlights, links, and target salary ranges.
- 💾 **Data Persistence & Portability**: Automatic local persistence with JSON backup export and restore capabilities.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons
- **Backend / API**: Node.js, Express, tsx
- **AI Integration**: `@google/genai` (Google Gemini SDK)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/careertrack-ai.git
cd careertrack-ai

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and provide your Gemini API key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📄 License
This project is licensed under the Apache-2.0 License.
