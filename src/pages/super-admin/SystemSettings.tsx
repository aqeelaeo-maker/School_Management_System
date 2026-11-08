import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateSchool } from '../../services/schoolService';
import { updateUserProfile } from '../../services/userService';
import {
  Settings,
  Shield,
  Building2,
  Save,
  Check,
  Phone,
  Mail,
  MapPin,
  User,
  Sparkles,
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { userProfile, availableSchools, refreshProfile, seedData } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'super_admin' | 'all_schools' | 'platform'>('super_admin');

  // Super Admin Fields: Name, Address, Contact Number (Phone), Email
  const [superAdminData, setSuperAdminData] = useState({
    name: userProfile?.name || 'Victoria Vance (Super Admin)',
    address: (userProfile as any)?.address || '100 University Plaza, Central Administration Building',
    phone: userProfile?.phone || '+1 (555) 019-2831',
    email: userProfile?.email || 'superadmin@edusphere.org',
  });

  const [savingSuperAdmin, setSavingSuperAdmin] = useState(false);
  const [superAdminSaved, setSuperAdminSaved] = useState(false);

  // Sync from userProfile
  useEffect(() => {
    if (userProfile) {
      setSuperAdminData({
        name: userProfile.name || 'Victoria Vance (Super Admin)',
        address: (userProfile as any).address || '100 University Plaza, Central Administration Building',
        phone: userProfile.phone || '+1 (555) 019-2831',
        email: userProfile.email || 'superadmin@edusphere.org',
      });
    }
  }, [userProfile]);

  const handleSaveSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSavingSuperAdmin(true);
    try {
      await updateUserProfile(userProfile.uid, {
        name: superAdminData.name,
        email: superAdminData.email,
        phone: superAdminData.phone,
        address: superAdminData.address,
      } as any);
      await refreshProfile();
      setSuperAdminSaved(true);
      setTimeout(() => setSuperAdminSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update Super Admin settings');
    } finally {
      setSavingSuperAdmin(false);
    }
  };

  // State for all schools editing: key-value map by schoolId
  const [schoolsFormMap, setSchoolsFormMap] = useState<
    Record<
      string,
      {
        name: string;
        address: string;
        phone: string;
        email: string;
        emisCode: string;
      }
    >
  >({});

  const [savingSchoolId, setSavingSchoolId] = useState<string | null>(null);
  const [savedSchoolId, setSavedSchoolId] = useState<string | null>(null);
  const [schoolsSearchTerm, setSchoolsSearchTerm] = useState('');

  // Populate schools form map
  useEffect(() => {
    const map: Record<string, { name: string; address: string; phone: string; email: string; emisCode: string }> = {};
    availableSchools.forEach((s) => {
      map[s.id] = {
        name: s.name || '',
        address: s.address || '',
        phone: s.phone || '',
        email: s.email || '',
        emisCode: s.emisCode || s.code || '',
      };
    });
    setSchoolsFormMap(map);
  }, [availableSchools]);

  const handleSchoolFieldChange = (schoolId: string, field: 'name' | 'address' | 'phone' | 'email', value: string) => {
    setSchoolsFormMap((prev) => ({
      ...prev,
      [schoolId]: {
        ...prev[schoolId],
        [field]: value,
      },
    }));
  };

  const handleSaveSchool = async (schoolId: string) => {
    const data = schoolsFormMap[schoolId];
    if (!data) return;
    setSavingSchoolId(schoolId);
    try {
      await updateSchool(
        schoolId,
        {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
        },
        userProfile?.uid,
        userProfile?.name
      );
      await refreshProfile();
      setSavedSchoolId(schoolId);
      setTimeout(() => setSavedSchoolId(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update school settings');
    } finally {
      setSavingSchoolId(null);
    }
  };

  // Platform state
  const [platformSettings, setPlatformSettings] = useState({
    systemName: 'School Management System (NEXORA Technologies)',
    defaultCurrency: 'USD ($)',
    academicYearDefault: '2026-2027',
    enableAIEducationalCopilot: true,
  });
  const [platformSaved, setPlatformSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault();
    setPlatformSaved(true);
    setTimeout(() => setPlatformSaved(false), 2500);
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

  const filteredSchools = availableSchools.filter((s) => {
    const term = schoolsSearchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.emisCode && s.emisCode.toLowerCase().includes(term)) ||
      (s.city && s.city.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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
          Institutional Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure profile details, contact information, and institutional data for Super Admin and all registered schools
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('super_admin')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'super_admin'
              ? 'border-[#0A2E68] text-[#0A2E68]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Super Admin Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('all_schools')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'all_schools'
              ? 'border-[#0A2E68] text-[#0A2E68]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>All Schools Settings ({availableSchools.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('platform')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'platform'
              ? 'border-[#0A2E68] text-[#0A2E68]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>System & Seed Operations</span>
        </button>
      </div>

      {/* ================= TAB 1: SUPER ADMIN SETTINGS ================= */}
      {activeSubTab === 'super_admin' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                {/* Image Box styled with theme blue-to-turquoise gradient */}
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm border border-white/20"
                  style={{
                    background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                  }}
                >
                  <Shield className="h-5 w-5 text-[#00D2BC]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Super Admin Profile & Contact Information</h2>
                  <p className="text-[11px] text-slate-500">
                    Primary administrative credentials, official address, contact number, and email
                  </p>
                </div>
              </div>

              {superAdminSaved && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <Check className="h-3.5 w-3.5" /> Super Admin details saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSuperAdmin} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Field 1: Name */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={superAdminData.name}
                    onChange={(e) => setSuperAdminData({ ...superAdminData, name: e.target.value })}
                    placeholder="e.g. Victoria Vance"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400">Display name for Super Admin root account</p>
                </div>

                {/* Field 2: Email */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={superAdminData.email}
                    onChange={(e) => setSuperAdminData({ ...superAdminData, email: e.target.value })}
                    placeholder="e.g. superadmin@edusphere.org"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400">Official email for system alerts & root notifications</p>
                </div>

                {/* Field 3: Contact Number */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={superAdminData.phone}
                    onChange={(e) => setSuperAdminData({ ...superAdminData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2831"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400">Official direct phone / mobile contact number</p>
                </div>

                {/* Field 4: Address */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={superAdminData.address}
                    onChange={(e) => setSuperAdminData({ ...superAdminData, address: e.target.value })}
                    placeholder="e.g. 100 University Plaza, Central Administration Building"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400">Central headquarters or administrative mailing address</p>
                </div>
              </div>

              {/* Save Button styled with theme blue-to-turquoise gradient */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSuperAdmin}
                  style={{
                    background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {savingSuperAdmin ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 text-[#00D2BC]" />
                  )}
                  <span>Save Super Admin Information</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ALL SCHOOLS SETTINGS ================= */}
      {activeSubTab === 'all_schools' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#064E78]" />
                Institutional Schools Directory (Name, Address, Contact & Email)
              </h2>
              <p className="text-xs text-slate-500">
                Directly view and update Name, Address, Contact Number, and Email for all schools
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search school name or EMIS code..."
                value={schoolsSearchTerm}
                onChange={(e) => setSchoolsSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
              />
            </div>
          </div>

          {/* Cards for each school */}
          <div className="space-y-4">
            {filteredSchools.map((school) => {
              const formData = schoolsFormMap[school.id] || {
                name: school.name || '',
                address: school.address || '',
                phone: school.phone || '',
                email: school.email || '',
                emisCode: school.emisCode || school.code || '',
              };

              const isSaving = savingSchoolId === school.id;
              const isSaved = savedSchoolId === school.id;

              return (
                <div
                  key={school.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      {/* School Image Box styled with theme blue-to-turquoise gradient */}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-1 ring-white/20"
                        style={{
                          background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                        }}
                      >
                        <Building2 className="h-5 w-5 text-[#00D2BC]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{school.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                            {school.code}
                          </span>
                          <span className="rounded-md bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#064E78]">
                            EMIS: {school.emisCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSaved && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in">
                          <Check className="h-3 w-3" /> Updated
                        </span>
                      )}

                      {/* Update School Details Button styled with theme blue-to-turquoise gradient */}
                      <button
                        type="button"
                        onClick={() => handleSaveSchool(school.id)}
                        disabled={isSaving}
                        style={{
                          background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                      >
                        {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-[#00D2BC]" />}
                        <span>Update School Details</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Required Fields for All Schools: Name, Address, Contact Number, Email */}
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* 1. Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        School Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleSchoolFieldChange(school.id, 'name', e.target.value)}
                        placeholder="School name"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white px-3 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                      />
                    </div>

                    {/* 2. Contact Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleSchoolFieldChange(school.id, 'phone', e.target.value)}
                        placeholder="Phone / Contact"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white px-3 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                      />
                    </div>

                    {/* 3. Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleSchoolFieldChange(school.id, 'email', e.target.value)}
                        placeholder="Email address"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white px-3 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                      />
                    </div>

                    {/* 4. Address */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleSchoolFieldChange(school.id, 'address', e.target.value)}
                        placeholder="Campus address"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white px-3 py-2 text-xs text-slate-900 font-medium focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSchools.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <Building2 className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-800">No schools matching your search</p>
                <p className="text-xs text-slate-500">Check spelling or search by EMIS code.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PLATFORM & SEED ================= */}
      {activeSubTab === 'platform' && (
        <div className="space-y-5">
          <form onSubmit={handleSavePlatform} className="space-y-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Global ERP Platform Configuration
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Platform Title</label>
                  <input
                    type="text"
                    value={platformSettings.systemName}
                    onChange={(e) =>
                      setPlatformSettings({ ...platformSettings, systemName: e.target.value })
                    }
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Default Currency</label>
                  <select
                    value={platformSettings.defaultCurrency}
                    onChange={(e) =>
                      setPlatformSettings({ ...platformSettings, defaultCurrency: e.target.value })
                    }
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00D2BC]"
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
                  <label className="text-xs font-semibold text-slate-700">Default Academic Session</label>
                  <input
                    type="text"
                    value={platformSettings.academicYearDefault}
                    onChange={(e) =>
                      setPlatformSettings({ ...platformSettings, academicYearDefault: e.target.value })
                    }
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {platformSaved ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Platform configuration saved
                  </span>
                ) : (
                  <div />
                )}
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer active:scale-[0.99]"
                >
                  <Save className="h-3.5 w-3.5 text-[#00D2BC]" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>

            {/* Seed Database Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Database className="h-4 w-4 text-[#00D2BC]" />
                Database Reset & Multi-Tenant Data Seeding
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Reset & Populate Sample Institutions</p>
                  <p className="text-[11px] text-slate-500">
                    Generates demo schools (Beacon Hill Prep & Horizon STEM) with students, teachers, exams, and EMIS credentials
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSeed}
                  disabled={seeding}
                  style={{
                    background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                  }}
                  className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  {seeding ? 'Seeding Data...' : 'Populate Sample Data'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
