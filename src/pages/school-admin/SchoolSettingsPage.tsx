import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateSchool } from '../../services/schoolService';
import {
  Settings,
  Building2,
  Palette,
  Save,
  Check,
  Globe,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export const SchoolSettingsPage: React.FC = () => {
  const { currentSchool, refreshProfile, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: currentSchool?.name || '',
    code: currentSchool?.code || '',
    emisCode: currentSchool?.emisCode || '',
    regNumber: currentSchool?.regNumber || '',
    principalName: currentSchool?.principalName || '',
    phone: currentSchool?.phone || '',
    email: currentSchool?.email || '',
    website: currentSchool?.website || '',
    address: currentSchool?.address || '',
    city: currentSchool?.city || '',
    state: currentSchool?.state || '',
    activeSession: currentSchool?.activeSession || '2026-2027',
    branding: {
      primaryColor: currentSchool?.branding?.primaryColor || '#1e3a8a',
      secondaryColor: currentSchool?.branding?.secondaryColor || '#3b82f6',
      accentColor: currentSchool?.branding?.accentColor || '#f59e0b',
      tagline: currentSchool?.branding?.tagline || 'Excellence in Education',
    },
  });

  useEffect(() => {
    if (currentSchool) {
      setFormData({
        name: currentSchool.name,
        code: currentSchool.code,
        emisCode: currentSchool.emisCode,
        regNumber: currentSchool.regNumber,
        principalName: currentSchool.principalName,
        phone: currentSchool.phone,
        email: currentSchool.email,
        website: currentSchool.website || '',
        address: currentSchool.address,
        city: currentSchool.city,
        state: currentSchool.state,
        activeSession: currentSchool.activeSession,
        branding: {
          primaryColor: currentSchool.branding?.primaryColor || '#1e3a8a',
          secondaryColor: currentSchool.branding?.secondaryColor || '#3b82f6',
          accentColor: currentSchool.branding?.accentColor || '#f59e0b',
          tagline: currentSchool.branding?.tagline || 'Excellence in Education',
        },
      });
    }
  }, [currentSchool]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    setLoading(true);
    try {
      await updateSchool(
        currentSchool.id,
        formData,
        userProfile?.uid,
        userProfile?.name
      );
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          School Tenant Configuration & Branding
        </h1>
        <p className="text-xs text-zinc-400">
          Customize institutional metadata, official EMIS credentials, and dynamic UI theme colors
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Core Profile */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-400" />
            Institutional Profile
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-300">School Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">School Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">EMIS Code</label>
              <input
                type="text"
                value={formData.emisCode}
                onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Principal Name *</label>
              <input
                type="text"
                required
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Active Academic Session</label>
              <input
                type="text"
                value={formData.activeSession}
                onChange={(e) => setFormData({ ...formData, activeSession: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-300">Campus Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* Branding & Palette */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Palette className="h-4 w-4 text-purple-400" />
            Institutional Theme & Branding Colors
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Primary Theme Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, primaryColor: e.target.value },
                    })
                  }
                  className="h-8 w-12 rounded cursor-pointer border border-zinc-700 bg-zinc-950 p-0.5"
                />
                <span className="text-xs font-mono text-zinc-300">{formData.branding.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400">Secondary Accent Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={formData.branding.secondaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, secondaryColor: e.target.value },
                    })
                  }
                  className="h-8 w-12 rounded cursor-pointer border border-zinc-700 bg-zinc-950 p-0.5"
                />
                <span className="text-xs font-mono text-zinc-300">{formData.branding.secondaryColor}</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-400">Motto / Tagline</label>
              <input
                type="text"
                value={formData.branding.tagline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branding: { ...formData.branding, tagline: e.target.value },
                  })
                }
                placeholder="e.g. Empowering Leaders of Tomorrow"
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <Check className="h-4 w-4" /> School details updated successfully
            </span>
          )}
          {!saved && <div />}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save School Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
