import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sparkles,
  X,
  Send,
  BookOpen,
  HelpCircle,
  FileText,
  TrendingUp,
  Award,
  Calendar,
  Copy,
  Check,
  Bot,
  User,
  RefreshCw,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, currentSchool, availableSchools } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'lesson_plan' | 'quiz' | 'notice'>('chat');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Chat message history
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your **Gemini AI School Assistant**. How can I assist you with **${currentSchool?.name || 'EduSphere Multi-School ERP'}** today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Form states for specialized tools
  const [lessonForm, setLessonForm] = useState({
    subject: 'Advanced Mathematics',
    grade: 'Grade 8',
    topic: 'Quadratic Equations & Graphing Parabola',
    duration: '45 minutes',
    objectives: 'Understand roots, vertex, and real-world projectile trajectories',
  });

  const [quizForm, setQuizForm] = useState({
    subject: 'Physics',
    grade: 'Grade 9',
    topic: 'Newton\'s Laws of Motion & Momentum',
    numQuestions: 5,
    difficulty: 'Medium',
  });

  const [noticeForm, setNoticeForm] = useState({
    title: 'Parent-Teacher Academic Conference 2026',
    audience: 'Parents of Grades 6-10',
    details: 'Individual grade reviews, upcoming terminal exams schedule, and digital portal onboarding',
    date: 'August 28, 2026',
  });

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendChat = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: userProfile?.role || 'administrator',
          schoolName: currentSchool?.name || 'Beacon Hill Academy',
          contextData: {
            activeSchool: currentSchool,
            schoolsCount: availableSchools.length,
            stats: currentSchool?.stats,
          },
          userPrompt: textToSend,
          taskType: 'general_query',
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.result || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **AI Processing Notice**: ${err.message || 'Unable to connect to Gemini service.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLessonPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonForm),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: `usr_${Date.now()}`,
          sender: 'user',
          text: `Generate lesson plan for ${lessonForm.subject} (${lessonForm.grade}) on "${lessonForm.topic}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.lessonPlan,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setActiveTab('chat');
    } catch (e: any) {
      alert(e.message || 'Failed to generate lesson plan');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/quiz-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizForm),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: `usr_${Date.now()}`,
          sender: 'user',
          text: `Generate ${quizForm.numQuestions} question quiz on ${quizForm.subject} - ${quizForm.topic}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.quiz,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setActiveTab('chat');
    } catch (e: any) {
      alert(e.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNotice = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/notice-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: currentSchool?.name || 'Beacon Hill Academy',
          ...noticeForm,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: `usr_${Date.now()}`,
          sender: 'user',
          text: `Draft official circular for: ${noticeForm.title}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.notice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setActiveTab('chat');
    } catch (e: any) {
      alert(e.message || 'Failed to draft notice');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Attendance Risk Review', prompt: 'Analyze school attendance patterns and suggest 3 high-impact intervention strategies for absentee students.' },
    { label: 'Fee Collection Strategy', prompt: 'Provide a polite, structured reminder message sequence for parents with 30+ days overdue fees.' },
    { label: 'Differentiated Learning', prompt: 'How can our teachers accommodate mixed-ability students in high school algebra classes?' },
    { label: 'Exam Question Analysis', prompt: 'Give best practices for balancing Bloom\'s Taxonomy in mid-term secondary school exams.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Gemini Educational AI Copilot
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Tailored for {userProfile?.role.replace('_', ' ')} • {currentSchool?.name || 'Global'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition ${
              activeTab === 'chat'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            AI Assistant Chat
          </button>
          <button
            onClick={() => setActiveTab('lesson_plan')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition ${
              activeTab === 'lesson_plan'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Lesson Plan Creator
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition ${
              activeTab === 'quiz'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            MCQ / Quiz Builder
          </button>
          <button
            onClick={() => setActiveTab('notice')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition ${
              activeTab === 'notice'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Circular / Notice Draft
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(q.prompt)}
                    className="rounded-md border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-indigo-500/50 hover:bg-zinc-800 hover:text-indigo-200 transition"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Messages list */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-zinc-800 bg-zinc-950/80 text-zinc-200 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>{m.timestamp}</span>
                      {m.sender === 'ai' && (
                        <button
                          onClick={() => handleCopy(m.text, m.id)}
                          className="ml-2 flex items-center gap-1 hover:text-zinc-200"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Gemini is generating educational insights...</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lesson_plan' && (
            <div className="max-w-2xl mx-auto space-y-3 bg-zinc-950/70 p-5 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                AI Lesson Plan Generator
              </h3>
              <p className="text-xs text-zinc-400">
                Generates a structured, Bloom-aligned 45-minute lesson plan with timeline, activities, and accommodations.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400">Subject</label>
                  <input
                    type="text"
                    value={lessonForm.subject}
                    onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                    className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400">Grade / Class</label>
                  <input
                    type="text"
                    value={lessonForm.grade}
                    onChange={(e) => setLessonForm({ ...lessonForm, grade: e.target.value })}
                    className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400">Lesson Topic</label>
                <input
                  type="text"
                  value={lessonForm.topic}
                  onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                  className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400">Learning Objectives</label>
                <textarea
                  rows={2}
                  value={lessonForm.objectives}
                  onChange={(e) => setLessonForm({ ...lessonForm, objectives: e.target.value })}
                  className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                />
              </div>

              <button
                onClick={handleGenerateLessonPlan}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Generate Lesson Plan with Gemini
              </button>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="max-w-2xl mx-auto space-y-3 bg-zinc-950/70 p-5 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-400" />
                MCQ & Quiz Generator
              </h3>
              <p className="text-xs text-zinc-400">
                Builds printable, ready-to-use quizzes with multiple choice options, short answers, and answer keys.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400">Subject</label>
                  <input
                    type="text"
                    value={quizForm.subject}
                    onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                    className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400">Grade Level</label>
                  <input
                    type="text"
                    value={quizForm.grade}
                    onChange={(e) => setQuizForm({ ...quizForm, grade: e.target.value })}
                    className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400">Quiz Topic</label>
                <input
                  type="text"
                  value={quizForm.topic}
                  onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                  className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400">Questions Count</label>
                  <select
                    value={quizForm.numQuestions}
                    onChange={(e) => setQuizForm({ ...quizForm, numQuestions: Number(e.target.value) })}
                    className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400">Difficulty</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                    className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  >
                    <option value="Easy">Easy (Conceptual)</option>
                    <option value="Medium">Medium (Standard Exam)</option>
                    <option value="Hard">Hard (Analytical / Advanced)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Generate Printable Quiz & Answer Key
              </button>
            </div>
          )}

          {activeTab === 'notice' && (
            <div className="max-w-2xl mx-auto space-y-3 bg-zinc-950/70 p-5 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                Official Circular / Notice Writer
              </h3>
              <p className="text-xs text-zinc-400">
                Drafts formal school announcements, circulars, and notices for parents and faculty.
              </p>

              <div>
                <label className="text-[11px] text-zinc-400">Notice Subject / Title</label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400">Target Audience</label>
                  <input
                    type="text"
                    value={noticeForm.audience}
                    onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value })}
                    className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400">Event Date</label>
                  <input
                    type="text"
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400">Key Information & Instructions</label>
                <textarea
                  rows={3}
                  value={noticeForm.details}
                  onChange={(e) => setNoticeForm({ ...noticeForm, details: e.target.value })}
                  className="w-full mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                />
              </div>

              <button
                onClick={handleGenerateNotice}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Draft Official School Notice
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer / Chat Input */}
        {activeTab === 'chat' && (
          <div className="border-t border-zinc-800 bg-zinc-950 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Gemini about attendance trends, lesson strategies, or school performance..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
