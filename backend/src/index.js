import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Prompts ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are DebugMind — an elite AI debugging agent that thinks like a principal engineer with 20 years of experience. You perform abductive reasoning: given symptoms (errors, logs, stack traces), you reason backwards to the most probable root cause.

You ALWAYS respond in this EXACT JSON format (no markdown, no extra text):
{
  "summary": "One-line TL;DR of what went wrong",
  "severity": "critical|high|medium|low",
  "rootCause": {
    "title": "Root cause title",
    "explanation": "Detailed explanation of why this happened",
    "confidence": 85
  },
  "hypotheses": [
    {
      "id": 1,
      "title": "Hypothesis title",
      "description": "What could cause this",
      "probability": 85,
      "evidence": "Evidence from the provided error/logs",
      "status": "likely|possible|unlikely"
    }
  ],
  "causalChain": [
    { "step": 1, "event": "What triggered first", "type": "trigger" },
    { "step": 2, "event": "What happened next", "type": "propagation" },
    { "step": 3, "event": "Final symptom", "type": "symptom" }
  ],
  "affectedServices": ["service1", "service2"],
  "fix": {
    "immediate": "What to do RIGHT NOW to stop the bleeding",
    "shortTerm": "Proper fix within hours/days",
    "longTerm": "Architectural improvement to prevent recurrence"
  },
  "codeSnippet": {
    "language": "javascript",
    "broken": "// broken code example if identifiable",
    "fixed": "// fixed code example"
  },
  "similarBugs": ["Common pattern this matches", "Known antipattern"],
  "postMortemDraft": "Brief post-mortem timeline and lessons learned",
  "debugCommands": ["specific command to run", "another diagnostic command"],
  "timeToResolve": "estimated time: e.g. 30 minutes"
}`;

// ─── Routes ─────────────────────────────────────────────────────────────────

app.post("/api/debug", async (req, res) => {
  const { error, logs, stack, language, services, context } = req.body;

  if (!error && !logs && !stack) {
    return res.status(400).json({ error: "Provide at least error, logs, or stack trace." });
  }

  const userMessage = `
Debug this issue:

ERROR: ${error || "Not provided"}

STACK TRACE:
${stack || "Not provided"}

LOGS:
${logs || "Not provided"}

LANGUAGE/FRAMEWORK: ${language || "Not specified"}
SERVICES INVOLVED: ${services || "Not specified"}
ADDITIONAL CONTEXT: ${context || "None"}

Perform abductive reasoning. Generate hypotheses, rank by probability, identify root cause, provide fixes.
`.trim();

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4096,
      temperature: 0.3,
      stream: true,
    });

    let fullText = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      fullText += delta;
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true, full: fullText })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/followup", async (req, res) => {
  const { question, context } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are DebugMind, an expert debugging assistant. Answer follow-up questions about the debug session concisely and technically. Use markdown formatting." },
        { role: "user", content: `Previous debug context:\n${context}\n\nFollow-up question: ${question}` },
      ],
      max_tokens: 1024,
      temperature: 0.4,
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (_, res) => res.json({ status: "ok", model: "llama-3.3-70b-versatile" }));

// ─── Serve Frontend ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`DebugMind backend running on port ${PORT}`));