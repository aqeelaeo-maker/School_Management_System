import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateSchool } from '../../services/schoolService';
import {
  Settings,
  Building2,
  Palette,
  Save,
  Check,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  KeyRound,
  Shield,
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
      primaryColor: currentSchool?.branding?.primaryColor || '#0A2E68',
      secondaryColor: currentSchool?.branding?.secondaryColor || '#00D2BC',
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
          primaryColor: currentSchool.branding?.primaryColor || '#0A2E68',
          secondaryColor: currentSchool.branding?.secondaryColor || '#00D2BC',
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
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          {/* Image Box styled with theme blue-to-turquoise gradient */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm border border-white/20"
            style={{
              background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
            }}
          >
            <Settings className="h-4 w-4 text-[#00D2BC]" />
          </div>
          School Profile & Institutional Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure institutional Name, Address, Contact Number, Email, EMIS credentials, and branding colors
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Core Profile */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#064E78]" />
              Institutional Identity & Contact Information
            </h2>
            {currentSchool?.emisCode && (
              <span className="rounded-md bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-[10px] font-mono font-bold text-[#064E78]">
                EMIS: {currentSchool.emisCode}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Field 1: Name */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-slate-400" />
                School Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>

            {/* Field 2: Contact Number (Phone) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-slate-400" />
                Contact Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>

            {/* Field 3: Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-slate-400" />
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>

            {/* Field 4: Address */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-slate-400" />
                Campus Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">School Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-mono font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">EMIS Code (Default Login Username & Password)</label>
              <input
                type="text"
                value={formData.emisCode}
                onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-mono font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Principal Name *</label>
              <input
                type="text"
                required
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Active Academic Session</label>
              <input
                type="text"
                value={formData.activeSession}
                onChange={(e) => setFormData({ ...formData, activeSession: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Branding & Palette */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Palette className="h-4 w-4 text-purple-600" />
            School Theme & Visual Identity
          </h2>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600 font-medium">Primary Theme Color</label>
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
                  className="h-8 w-12 rounded-lg cursor-pointer border border-slate-200 bg-white p-0.5"
                />
                <span className="text-xs font-mono font-semibold text-slate-800">{formData.branding.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium">Secondary Accent Color</label>
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
                  className="h-8 w-12 rounded-lg cursor-pointer border border-slate-200 bg-white p-0.5"
                />
                <span className="text-xs font-mono font-semibold text-slate-800">{formData.branding.secondaryColor}</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-slate-600 font-medium">Motto / Tagline</label>
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
                className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Check className="h-4 w-4" /> School details updated successfully
            </span>
          )}
          {!saved && <div />}

          {/* Save Button styled with theme blue-to-turquoise gradient */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-[#00D2BC]" />}
            <span>Save School Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
