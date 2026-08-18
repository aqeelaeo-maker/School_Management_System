import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Settings,
  Shield,
  Sparkles,
  Database,
  Lock,
  Globe,
  Bell,
  Check,
  Save,
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { seedData } = useAuth();
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [settings, setSettings] = useState({
    systemName: 'EduSphere Multi-School Enterprise SMS',
    defaultCurrency: 'USD ($)',
    academicYearDefault: '2026-2027',
    allowSchoolSelfRegistration: false,
    enableAIEducationalCopilot: true,
    geminiModel: 'gemini-2.5-flash',
    auditLoggingRetentionDays: 365,
    enforceStrongPasswords: true,
    maintenanceMode: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedData();
      alert(res.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          Global Multi-Tenant System Settings
        </h1>
        <p className="text-xs text-zinc-400">
          Configure system-wide academic baselines, AI copilot integration, and tenant isolation policies
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Core System Identity */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            Global Platform Parameters
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-300">System Platform Title</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Default Currency</label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              >
                <option value="USD ($)">USD - US Dollar ($)</option>
                <option value="GBP (£)">GBP - British Pound (£)</option>
                <option value="EUR (€)">EUR - Euro (€)</option>
                <option value="PKR (Rs)">PKR - Pakistani Rupee (Rs)</option>
                <option value="INR (₹)">INR - Indian Rupee (₹)</option>
                <option value="AED (AED)">AED - UAE Dirham</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Global Academic Session</label>
              <input
                type="text"
                value={settings.academicYearDefault}
                onChange={(e) => setSettings({ ...settings, academicYearDefault: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Audit Log Retention</label>
              <select
                value={settings.auditLoggingRetentionDays}
                onChange={(e) => setSettings({ ...settings, auditLoggingRetentionDays: Number(e.target.value) })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              >
                <option value={90}>90 Days</option>
                <option value={180}>180 Days</option>
                <option value={365}>365 Days (1 Year)</option>
                <option value={1825}>5 Years (Regulatory)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gemini AI Integration */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Google AI Studio & Gemini Integration
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <div>
                <p className="text-xs font-medium text-zinc-200">Enable Gemini Educational Copilot</p>
                <p className="text-[11px] text-zinc-400">
                  Allows faculty to generate lesson plans, quizzes, homework, and analytical report summaries
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableAIEducationalCopilot}
                onChange={(e) => setSettings({ ...settings, enableAIEducationalCopilot: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Gemini Foundation Model</label>
              <select
                value={settings.geminiModel}
                onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-fast, Recommended for ERP)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep reasoning & curriculum synthesis)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database & Cloud Operations */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            Database & Multi-Tenant Partitioning
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5">
            <div>
              <p className="text-xs font-medium text-zinc-200">Reset & Seed Sample Database</p>
              <p className="text-[11px] text-zinc-400">
                Populates full demo schools (Beacon Hill & Horizon STEM) with students, teachers, exams, and attendance
              </p>
            </div>
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {seeding ? 'Seeding...' : 'Populate Sample Data'}
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <Check className="h-4 w-4" /> Settings updated successfully
            </span>
          )}
          {!saved && <div />}

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Global Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
