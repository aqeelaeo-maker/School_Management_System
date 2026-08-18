import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json({ limit: '10mb' }));

  // Lazy initialize Gemini API SDK
  let aiClient: GoogleGenAI | null = null;
  function getAIClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not configured');
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Server-side Gemini AI Assistant API for School Management
  app.post('/api/gemini/assistant', async (req, res) => {
    try {
      const { role, schoolName, contextData, userPrompt, taskType } = req.body;

      if (!userPrompt) {
        return res.status(400).json({ error: 'User prompt is required' });
      }

      const ai = getAIClient();

      let systemInstruction = `You are an elite, highly intelligent AI School Management System Assistant embedded in "${schoolName || 'Multi-School ERP'}".
Your persona is adapted for the role: "${role || 'administrator'}".

Key guidelines:
1. Provide structured, accurate, professional, and actionable responses.
2. Use markdown formatting with bullet points, clean headings, and tables where appropriate.
3. Be supportive, concise, and focused on educational excellence, institutional efficiency, and student growth.
4. When analyzing school data, identify trends, potential risks (such as low attendance or overdue fees), and provide concrete recommendations.
5. If asked to generate lesson plans, quizzes, homework, or notices, output ready-to-use, polished educational content.`;

      const promptContent = `
Current Context Data:
${JSON.stringify(contextData || {}, null, 2)}

User Role: ${role}
Task Type: ${taskType || 'general_query'}
User Request: ${userPrompt}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const text = response.text || 'No response generated.';
      return res.json({ result: text });
    } catch (error: any) {
      console.error('Gemini Assistant Error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to process AI request',
      });
    }
  });

  // Teacher AI Lesson Plan Generator
  app.post('/api/gemini/lesson-plan', async (req, res) => {
    try {
      const { subject, grade, topic, duration, objectives } = req.body;
      const ai = getAIClient();

      const prompt = `Create a comprehensive, highly engaging lesson plan:
- Subject: ${subject || 'General Science'}
- Grade/Class: ${grade || 'Grade 8'}
- Topic: ${topic || 'Photosynthesis'}
- Duration: ${duration || '45 minutes'}
- Key Objectives: ${objectives || 'Core understanding and practical real-life examples'}

Format with:
1. Learning Objectives (Bloom's Taxonomy)
2. Materials & Prerequisites
3. Step-by-Step Lesson Timeline (Warm-up, Direct Instruction, Guided Practice, Independent Activity, Wrap-up/Assessment)
4. Differentiated Learning / Accommodations
5. Homework / Extension Activity`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({ lessonPlan: response.text });
    } catch (error: any) {
      console.error('Lesson Plan Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate lesson plan' });
    }
  });

  // Teacher AI Quiz / MCQ Generator
  app.post('/api/gemini/quiz-generator', async (req, res) => {
    try {
      const { subject, grade, topic, numQuestions, difficulty } = req.body;
      const ai = getAIClient();

      const prompt = `Generate a printable quiz for students:
- Subject: ${subject || 'Mathematics'}
- Grade: ${grade || 'Grade 7'}
- Topic: ${topic || 'Algebra Basics'}
- Number of Questions: ${numQuestions || 5}
- Difficulty: ${difficulty || 'Medium'}

Include:
- Multiple Choice Questions (A, B, C, D)
- 2 Short Answer / Reasoning Questions
- Answer Key with step-by-step explanations at the bottom`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({ quiz: response.text });
    } catch (error: any) {
      console.error('Quiz Generator Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate quiz' });
    }
  });

  // Admin AI Circular / Notice Generator
  app.post('/api/gemini/notice-generator', async (req, res) => {
    try {
      const { schoolName, title, audience, details, date } = req.body;
      const ai = getAIClient();

      const prompt = `Draft a formal, beautifully worded school notice/circular:
- School: ${schoolName || 'Horizon Academy'}
- Subject/Title: ${title || 'Annual Sports Day 2026'}
- Target Audience: ${audience || 'Parents and Students'}
- Key Information/Details: ${details || 'Event timing, dress code, participation guidelines'}
- Date of Event / Notice: ${date || 'Upcoming Friday'}

Ensure proper formal school letterhead structure, polite tone, clear instructions, and sign-off placeholders.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({ notice: response.text });
    } catch (error: any) {
      console.error('Notice Generator Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate notice' });
    }
  });

  // Teacher AI Student Feedback / Remarks Generator
  app.post('/api/gemini/student-feedback', async (req, res) => {
    try {
      const { studentName, subject, strengths, areasForImprovement, tone } = req.body;
      const ai = getAIClient();

      const prompt = `Draft personalized, encouraging, and constructive report card remarks:
- Student Name: ${studentName}
- Subject/General Performance: ${subject || 'Overall Academic Term'}
- Strengths: ${strengths || 'Active participation, good analytical skills'}
- Areas for Growth: ${areasForImprovement || 'Consistency in homework submissions and exam time management'}
- Tone: ${tone || 'Encouraging and constructive'}

Provide:
1. Formal Report Card Remark (2-3 concise sentences)
2. Detailed Parent-Teacher Conference Note (1 paragraph)`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({ feedback: response.text });
    } catch (error: any) {
      console.error('Feedback Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate feedback' });
    }
  });

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Multi-School SMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
