# 🧠 DebugMind — AI Root Cause Analysis Agent

> Paste your bug. Get the root cause. Powered by Groq + LLaMA 3.3 70B.

DebugMind thinks like a principal engineer — generating ranked hypotheses,
reconstructing causal chains, and finding exactly why your system broke.

---

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo>
cd debugmind
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=gsk_your_key_here
PORT=3001
```

Get your free Groq API key at: https://console.groq.com

### 3. Install & Run Backend

```bash
cd backend
npm install
npm start
```

Backend runs on: http://localhost:3001

### 4. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

---

## 🔥 Features

| Feature | Description |
|---|---|
| **Root Cause Analysis** | Abductive reasoning to find the true cause |
| **Ranked Hypotheses** | Multiple hypotheses ranked by probability |
| **Causal Chain** | Step-by-step chain from trigger → symptom |
| **3-Layer Fix Plan** | Immediate → Short-term → Long-term fixes |
| **Code Diff** | Broken vs fixed code side by side |
| **Diagnostic Commands** | Exact commands to run for verification |
| **Auto Post-Mortem** | Draft post-mortem ready to share |
| **Follow-up Chat** | Ask questions about the specific bug |

---

## 🏗️ Architecture

```
Frontend (React + Vite)          Backend (Node + Express)
┌─────────────────────┐          ┌──────────────────────────┐
│  DebugInput.jsx     │  POST    │  /api/debug (streaming)  │
│  DebugResult.jsx    │ ──────►  │  /api/followup           │
│  FollowUp.jsx       │  SSE     │  /api/health             │
│  Header.jsx         │ ◄──────  │                          │
└─────────────────────┘          │  Groq SDK                │
                                 │  llama-3.3-70b-versatile │
                                 └──────────────────────────┘
```

---

## 📡 API Reference

### `POST /api/debug`
Streams SSE analysis of a bug.

**Body:**
```json
{
  "error": "TypeError: Cannot read...",
  "stack": "at getUserData (/app/...",
  "logs": "[2024-01-15] ERROR: ...",
  "language": "JavaScript",
  "services": "API Gateway, PostgreSQL",
  "context": "Happened after deploy at 14:00"
}
```

**Response:** Server-Sent Events stream, final payload is parsed JSON.

### `POST /api/followup`
Single-turn follow-up question about a debug session.

**Body:**
```json
{
  "question": "How do I test the fix?",
  "context": "Root cause: null user_id..."
}
```

---

## 🧪 Tech Stack

- **Frontend:** React 18, Vite, Lucide Icons
- **Backend:** Node.js, Express, Groq SDK
- **AI Model:** LLaMA 3.3 70B Versatile (via Groq)
- **Streaming:** Server-Sent Events (SSE)
- **Design:** Dark industrial terminal aesthetic

---

## 📝 Research Paper Angle

> *"Abductive Reasoning Agents for Automated Root Cause Analysis in Distributed Systems"*

This system implements abductive inference for debugging:
given observable symptoms (errors, logs, stack traces), it reasons backwards
to the most probable cause — just like a doctor diagnosing from symptoms.

**Publishable at:** ICSE, FSE, ASE (software engineering conferences)

---

## 🔮 Roadmap

- [ ] GitHub/Sentry/Datadog integration
- [ ] Historical bug memory (learn from past incidents)
- [ ] Team-specific codebase context
- [ ] Auto-PR generation with fix
- [ ] Slack bot interface
- [ ] VS Code extension
