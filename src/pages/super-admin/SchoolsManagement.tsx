import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { School } from '../../types';
import { createSchool, updateSchool, deleteSchool, toggleSchoolStatus } from '../../services/schoolService';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Palette,
  X,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  KeyRound,
  Shield,
  Check,
} from 'lucide-react';

interface SchoolsManagementProps {
  onEnterSchool?: (schoolId: string) => void;
}

export const SchoolsManagement: React.FC<SchoolsManagementProps> = ({ onEnterSchool }) => {
  const { availableSchools, refreshProfile, switchSchool, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial Form Data
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
    establishedDate: '2022-01-01',
    activeSession: '2026-2027',
    branding: {
      primaryColor: '#0A2E68',
      secondaryColor: '#00D2BC',
      accentColor: '#f59e0b',
      tagline: 'Inspiring Minds, Shaping Character',
    },
    status: 'active' as const,
  };

  const [formData, setFormData] = useState(initialForm);

  const filteredSchools = availableSchools.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      (s.emisCode && s.emisCode.toLowerCase().includes(term)) ||
      (s.city && s.city.toLowerCase().includes(term)) ||
      (s.principalName && s.principalName.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingSchool(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name || '',
      code: school.code || '',
      emisCode: school.emisCode || '',
      regNumber: school.regNumber || '',
      type: school.type || 'k12',
      address: school.address || '',
      city: school.city || '',
      state: school.state || '',
      country: school.country || 'United States',
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      principalName: school.principalName || '',
      establishedDate: school.establishedDate || '2022-01-01',
      activeSession: school.activeSession || '2026-2027',
      branding: {
        primaryColor: school.branding?.primaryColor || '#0A2E68',
        secondaryColor: school.branding?.secondaryColor || '#00D2BC',
        accentColor: school.branding?.accentColor || '#f59e0b',
        tagline: school.branding?.tagline || '',
      },
      status: school.status || 'active',
    });
    setIsModalOpen(true);
  };

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
        showToast(`School "${formData.name}" updated successfully.`);
      } else {
        await createSchool(
          formData,
          userProfile?.uid,
          userProfile?.name
        );
        showToast(`New School "${formData.name}" created successfully with default EMIS credentials.`);
      }
      await refreshProfile();
      setIsModalOpen(false);
      setEditingSchool(null);
      setFormData(initialForm);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSchool) return;
    setLoading(true);
    try {
      await deleteSchool(
        deletingSchool.id,
        userProfile?.uid,
        userProfile?.name
      );
      showToast(`School "${deletingSchool.name}" has been deleted.`);
      await refreshProfile();
      setDeletingSchool(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete school');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (schoolId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await toggleSchoolStatus(schoolId, newStatus as any, userProfile?.uid, userProfile?.name);
    await refreshProfile();
    showToast(`School status changed to ${newStatus}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 shadow-xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#00D2BC]" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            {/* Image Box styled with theme blue-to-turquoise gradient */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm border border-white/20"
              style={{
                background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
              }}
            >
              <Building2 className="h-4 w-4 text-[#00D2BC]" />
            </div>
            Schools Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage institutional tenants, configure EMIS credentials, and edit or delete schools
          </p>
        </div>

        {/* Add New School Button styled with theme blue-to-turquoise gradient */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          style={{
            background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
          }}
          className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition cursor-pointer active:scale-[0.99]"
        >
          <Plus className="h-4 w-4 text-[#00D2BC]" />
          <span>Add New School</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by school name, code, EMIS Code, city, or principal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00D2BC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#00D2BC]"
          >
            <option value="all">All Statuses ({availableSchools.length})</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredSchools.map((school) => {
          const emis = school.emisCode || school.code;

          return (
            <div
              key={school.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 transition"
            >
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* School Image Box styled with theme blue-to-turquoise gradient */}
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-1 ring-white/20"
                      style={{
                        background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                      }}
                    >
                      <Building2 className="h-6 w-6 text-[#00D2BC]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{school.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                          {school.code}
                        </span>
                        <span className="rounded-md bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#064E78]">
                          EMIS: {emis}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      school.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {school.status.toUpperCase()}
                  </span>
                </div>

                {/* Motto */}
                {school.branding?.tagline && (
                  <p className="text-xs italic text-slate-600 border-l-2 border-[#00D2BC] pl-2">
                    &ldquo;{school.branding.tagline}&rdquo;
                  </p>
                )}

                {/* Details Table */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400">Principal:</span>{' '}
                    <span className="font-semibold text-slate-800">{school.principalName || 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Session:</span>{' '}
                    <span className="font-semibold text-slate-800">{school.activeSession}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>{' '}
                    <span className="font-semibold text-slate-800">{school.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>{' '}
                    <span className="font-semibold text-slate-800 truncate block">{school.email || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Address:</span>{' '}
                    <span className="font-medium text-slate-800">
                      {school.address ? `${school.address}, ${school.city}` : 'Campus Address'}
                    </span>
                  </div>
                </div>

                {/* Credentials reminder badge */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#0A2E68] bg-cyan-50/60 border border-cyan-100 rounded-lg px-2.5 py-1">
                  <KeyRound className="h-3.5 w-3.5 text-[#027A8F]" />
                  <span>
                    Default Login: <strong className="font-mono">{emis}</strong> (Username & Password)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(school)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3 text-slate-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(school.id, school.status)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition cursor-pointer ${
                      school.status === 'active'
                        ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {school.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingSchool(school)}
                    title="Delete School"
                    className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Enter School Button styled with theme blue-to-turquoise gradient */}
                <button
                  type="button"
                  onClick={async () => {
                    await switchSchool(school.id);
                    if (onEnterSchool) onEnterSchool(school.id);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                  }}
                  className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition cursor-pointer border border-white/20 active:scale-[0.99]"
                >
                  <span>Enter School</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#00D2BC]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchools.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Building2 className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-2 text-sm font-bold text-slate-800">No schools found</h3>
          <p className="text-xs text-slate-500">No schools matching your search criteria.</p>
        </div>
      )}

      {/* Add / Edit School Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                {/* Image Box styled with theme blue-to-turquoise gradient */}
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm border border-white/20"
                  style={{
                    background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                  }}
                >
                  <Building2 className="h-4 w-4 text-[#00D2BC]" />
                </div>
                {editingSchool ? 'Edit School Information' : 'Add New School Tenant'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700">School Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Oxford Grammar International"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">School Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. OGIS"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">EMIS Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.emisCode}
                    onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                    placeholder="e.g. EMIS-77401"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                  <p className="mt-1 text-[10px] text-[#027A8F]">
                    * Default username and password for this school will be this EMIS Code.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Principal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Contact Number (Phone)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2811"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@school.edu"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Academic Session</label>
                  <input
                    type="text"
                    value={formData.activeSession}
                    onChange={(e) => setFormData({ ...formData, activeSession: e.target.value })}
                    placeholder="2026-2027"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Campus Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Academic Way"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Boston"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">State / Region</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="MA"
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Motto / Tagline</label>
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
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                {/* Submit button styled with theme blue-to-turquoise gradient */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingSchool ? 'Update School' : 'Create School'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete School Tenant</h3>
                <p className="text-xs text-slate-500">Permanent institutional deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{deletingSchool.name}</strong> ({deletingSchool.code})? This will permanently remove the school and its credentials from the multi-tenant ERP.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingSchool(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
