import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Teacher } from '../../types';
import { getTeachers, createTeacher, updateTeacher } from '../../services/teacherService';
import {
  Briefcase,
  Plus,
  Search,
  Mail,
  Phone,
  BookOpen,
  DollarSign,
  Calendar,
  Award,
  Edit2,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export const TeachersManagement: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const initialForm = {
    employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    email: '',
    phone: '',
    designation: 'Senior Faculty',
    qualification: 'M.Sc. Mathematics, B.Ed',
    specialization: 'Pure Mathematics & Calculus',
    joiningDate: '2023-08-15',
    salary: 4800,
    assignedSubjects: ['Mathematics', 'Statistics'],
    assignedClasses: ['Grade 8', 'Grade 9', 'Grade 10'],
    status: 'active' as const,
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getTeachers(schoolId);
      setTeachers(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTeacher) {
        await updateTeacher(
          schoolId,
          editingTeacher.id,
          formData,
          { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
        );
      } else {
        await createTeacher(
          schoolId,
          formData,
          { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
        );
      }
      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData(initialForm);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      employeeId: t.employeeId,
      name: t.name,
      email: t.email,
      phone: t.phone,
      designation: t.designation,
      qualification: t.qualification,
      specialization: t.specialization,
      joiningDate: t.joiningDate,
      salary: t.salary || 4500,
      assignedSubjects: t.assignedSubjects,
      assignedClasses: t.assignedClasses,
      status: t.status,
    });
    setIsModalOpen(true);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-amber-400" />
            Faculty & Teaching Staff
          </h1>
          <p className="text-xs text-zinc-400">
            Manage academic instructors, departmental allocations, compensation records, and workload
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTeacher(null);
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by faculty name, employee ID, designation, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-8 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Teachers Grid Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold text-lg">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{teacher.name}</h3>
                    <p className="text-[11px] text-amber-400 font-medium">{teacher.designation}</p>
                    <span className="font-mono text-[10px] text-zinc-500">{teacher.employeeId}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(teacher)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Award className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate">{teacher.qualification}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              {/* Subject Badges */}
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Teaching Subjects:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {teacher.assignedSubjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Classes */}
              <div className="mt-2 flex flex-wrap gap-1">
                {teacher.assignedClasses.map((cls, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-amber-950/40 border border-amber-800/30 px-1.5 py-0.5 text-[10px] text-amber-300 font-medium"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <DollarSign className="h-3.5 w-3.5" /> ${teacher.salary?.toLocaleString()}/mo
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" /> Joined {teacher.joiningDate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-amber-500" />
                {editingTeacher ? 'Update Faculty Profile' : 'Add New Faculty Member'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Monthly Salary ($)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
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

                <div>
                  <label className="text-xs font-medium text-zinc-300">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-500"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {editingTeacher ? 'Save Changes' : 'Confirm Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
