import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { School } from '../../types';
import { createSchool, updateSchool, toggleSchoolStatus } from '../../services/schoolService';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Edit2,
  Shield,
  Palette,
  X,
  RefreshCw,
} from 'lucide-react';

interface SchoolsManagementProps {
  onEnterSchool?: (schoolId: string) => void;
}

export const SchoolsManagement: React.FC<SchoolsManagementProps> = ({ onEnterSchool }) => {
  const { availableSchools, refreshProfile, switchSchool, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    code: '',
    emisCode: '',
    regNumber: '',
    type: 'k12' as const,
    address: '',
    city: '',
    state: '',
    country: 'United States',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    establishedDate: '2020-01-01',
    activeSession: '2026-2027',
    branding: {
      primaryColor: '#1e3a8a',
      secondaryColor: '#3b82f6',
      accentColor: '#f59e0b',
      tagline: 'Excellence in Education',
    },
    status: 'active' as const,
  };

  const [formData, setFormData] = useState(initialForm);

  const filteredSchools = availableSchools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.principalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSchool) {
        await updateSchool(
          editingSchool.id,
          formData,
          userProfile?.uid,
          userProfile?.name
        );
      } else {
        await createSchool(
          formData,
          userProfile?.uid,
          userProfile?.name
        );
      }
      await refreshProfile();
      setIsCreateModalOpen(false);
      setEditingSchool(null);
      setFormData(initialForm);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      emisCode: school.emisCode,
      regNumber: school.regNumber,
      type: school.type,
      address: school.address,
      city: school.city,
      state: school.state,
      country: school.country,
      phone: school.phone,
      email: school.email,
      website: school.website || '',
      principalName: school.principalName,
      establishedDate: school.establishedDate,
      activeSession: school.activeSession,
      branding: {
        primaryColor: school.branding?.primaryColor || '#1e3a8a',
        secondaryColor: school.branding?.secondaryColor || '#3b82f6',
        accentColor: school.branding?.accentColor || '#f59e0b',
        tagline: school.branding?.tagline || '',
      },
      status: school.status,
    });
    setIsCreateModalOpen(true);
  };

  const handleToggleStatus = async (schoolId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (confirm(`Are you sure you want to change school status to ${newStatus}?`)) {
      await toggleSchoolStatus(schoolId, newStatus as any, userProfile?.uid, userProfile?.name);
      await refreshProfile();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Institutional School Directory</h1>
          <p className="text-xs text-zinc-400">
            Create, configure, and oversee isolated tenant schools across the multi-tenant ERP
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSchool(null);
            setFormData(initialForm);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add New School</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by school name, code, EMIS, city, or principal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        {filteredSchools.map((school) => (
          <div
            key={school.id}
            className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold text-lg shadow-md ring-1 ring-white/10"
                    style={{ backgroundColor: school.branding?.primaryColor || '#1e3a8a' }}
                  >
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{school.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                        {school.code}
                      </span>
                      <span className="text-[11px] text-zinc-400">EMIS: {school.emisCode}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    school.status === 'active'
                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                      : 'bg-rose-950/50 text-rose-400 border-rose-800/60'
                  }`}
                >
                  {school.status.toUpperCase()}
                </span>
              </div>

              {/* Tagline / Motto */}
              {school.branding?.tagline && (
                <p className="mt-3 text-xs italic text-zinc-400 border-l-2 border-zinc-700 pl-2">
                  "{school.branding.tagline}"
                </p>
              )}

              {/* School Details */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                <div>
                  <span className="text-zinc-500">Principal:</span> {school.principalName}
                </div>
                <div>
                  <span className="text-zinc-500">Academic Session:</span> {school.activeSession}
                </div>
                <div>
                  <span className="text-zinc-500">Location:</span> {school.city}, {school.state}
                </div>
                <div>
                  <span className="text-zinc-500">Phone:</span> {school.phone}
                </div>
                <div>
                  <span className="text-zinc-500">Email:</span> {school.email}
                </div>
                <div>
                  <span className="text-zinc-500">Category:</span> {school.type.toUpperCase()}
                </div>
              </div>

              {/* Mini Stats Pill Group */}
              <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-zinc-800">
                <span className="rounded bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-300">
                  👨‍🎓 <span className="font-semibold text-white">{school.stats?.totalStudents || 0}</span> Students
                </span>
                <span className="rounded bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-300">
                  👩‍🏫 <span className="font-semibold text-white">{school.stats?.totalTeachers || 0}</span> Teachers
                </span>
                <span className="rounded bg-zinc-800/80 px-2 py-1 text-[11px] text-emerald-400">
                  💵 <span className="font-semibold">${school.stats?.totalRevenue?.toLocaleString()}</span> Rev
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEdit(school)}
                  className="flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:text-white"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleToggleStatus(school.id, school.status)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium ${
                    school.status === 'active'
                      ? 'border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50'
                      : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                >
                  {school.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <button
                onClick={async () => {
                  await switchSchool(school.id);
                  if (onEnterSchool) onEnterSchool(school.id);
                }}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm"
              >
                <span>Enter Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* School Creation & Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                {editingSchool ? 'Edit Institution Profile' : 'Register New Tenant School'}
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-zinc-300">School Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Westbridge International Grammar School"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">School Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WIGS"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">EMIS Code</label>
                  <input
                    type="text"
                    value={formData.emisCode}
                    onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                    placeholder="e.g. EMIS-9012"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Registration Number</label>
                  <input
                    type="text"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                    placeholder="e.g. REG-2026-09"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">School Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="k12">K-12 Comprehensive</option>
                    <option value="primary">Primary Elementary</option>
                    <option value="secondary">Middle / Secondary School</option>
                    <option value="higher_secondary">Higher Secondary College</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Principal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Active Academic Session</label>
                  <input
                    type="text"
                    value={formData.activeSession}
                    onChange={(e) => setFormData({ ...formData, activeSession: e.target.value })}
                    placeholder="2026-2027"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2811"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@school.edu"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-medium text-zinc-300">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Academic Way"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Boston"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">State / Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="MA"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                {/* Branding Colors */}
                <div className="col-span-2 pt-2 border-t border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 mb-2">
                    <Palette className="h-3.5 w-3.5 text-blue-400" />
                    School Branding Colors & Tagline
                  </h4>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400">Primary Brand Color</label>
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
                  <label className="text-[11px] text-zinc-400">Secondary Accent</label>
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

                <div className="col-span-2">
                  <label className="text-[11px] text-zinc-400">Motto / Tagline</label>
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

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {editingSchool ? 'Save Changes' : 'Create School Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
