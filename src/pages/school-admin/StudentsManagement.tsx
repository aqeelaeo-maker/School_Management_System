import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Student, ClassGroup } from '../../types';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/studentService';
import { getClasses } from '../../services/academicService';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Eye,
  Edit2,
  Trash2,
  X,
  Printer,
  Mail,
  Phone,
  Building2,
  RefreshCw,
} from 'lucide-react';

export const StudentsManagement: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Modal States
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForID, setSelectedStudentForID] = useState<Student | null>(null);

  const initialForm = {
    admissionNo: `BHP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    rollNo: '08-A-09',
    name: '',
    fatherName: '',
    motherName: '',
    dob: '2012-01-01',
    gender: 'male' as const,
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    city: 'Boston',
    guardianName: '',
    guardianPhone: '',
    parentIds: [],
    admissionDate: new Date().toISOString().split('T')[0],
    classId: 'cls_grade_8',
    className: 'Grade 8',
    sectionId: 'sec_8a',
    sectionName: 'A',
    sessionId: currentSchool?.activeSession || '2026-2027',
    status: 'active' as const,
    balance: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stdList, clsList] = await Promise.all([
        getStudents(schoolId),
        getClasses(schoolId),
      ]);
      setStudents(stdList);
      setClasses(clsList);
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
      if (editingStudent) {
        await updateStudent(
          schoolId,
          editingStudent.id,
          formData,
          { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
        );
      } else {
        await createStudent(
          schoolId,
          formData,
          { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
        );
      }
      setIsAdmitModalOpen(false);
      setEditingStudent(null);
      setFormData(initialForm);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (std: Student) => {
    setEditingStudent(std);
    setFormData({
      admissionNo: std.admissionNo,
      rollNo: std.rollNo,
      name: std.name,
      fatherName: std.fatherName,
      motherName: std.motherName || '',
      dob: std.dob,
      gender: std.gender,
      bloodGroup: std.bloodGroup || 'O+',
      phone: std.phone || '',
      email: std.email || '',
      address: std.address,
      city: std.city,
      guardianName: std.guardianName || '',
      guardianPhone: std.guardianPhone || '',
      parentIds: std.parentIds || [],
      admissionDate: std.admissionDate,
      classId: std.classId,
      className: std.className,
      sectionId: std.sectionId,
      sectionName: std.sectionName,
      sessionId: std.sessionId,
      status: std.status,
      balance: std.balance || 0,
    });
    setIsAdmitModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this student record?')) {
      await deleteStudent(schoolId, id);
      await loadData();
    }
  };

  const exportCSV = () => {
    const headers = 'AdmissionNo,RollNo,Name,FatherName,Class,Section,Phone,Status\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.admissionNo}","${s.rollNo}","${s.name}","${s.fatherName}","${s.className}","${s.sectionName}","${s.phone || ''}","${s.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${currentSchool?.code || 'school'}.csv`;
    a.click();
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || s.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            Students Roster & Admission
          </h1>
          <p className="text-xs text-zinc-400">
            Manage student admissions, profiles, academic placements, and printable ID cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingStudent(null);
              setFormData(initialForm);
              setIsAdmitModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Admit New Student</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:grid-cols-3">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by student name, roll number, admission number, or father's name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Grades / Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 shadow-sm">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Student & Roll No</th>
              <th className="px-4 py-3">Class & Section</th>
              <th className="px-4 py-3">Father / Guardian</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Fee Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  No students found matching current filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-zinc-800/40 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900/40 text-blue-300 font-bold border border-blue-700/40">
                        {std.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-100">{std.name}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <span className="font-mono text-zinc-300">{std.rollNo}</span>
                          <span>•</span>
                          <span>{std.admissionNo}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 font-medium text-zinc-200">
                      {std.className} - {std.sectionName}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-zinc-200">
                    <div>{std.fatherName}</div>
                    {std.bloodGroup && (
                      <span className="text-[10px] text-zinc-400">Blood: {std.bloodGroup}</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-zinc-300">{std.phone || 'N/A'}</div>
                    <div className="text-[10px] text-zinc-500 truncate max-w-[140px]">{std.email}</div>
                  </td>

                  <td className="px-4 py-3">
                    {std.balance > 0 ? (
                      <span className="text-rose-400 font-semibold">${std.balance} Due</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Paid</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/40">
                      {std.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedStudentForID(std)}
                        title="Generate Student ID Card"
                        className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-blue-400 transition"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(std)}
                        title="Edit Student"
                        className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(std.id)}
                        title="Delete Student"
                        className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student ID Card Modal */}
      {selectedStudentForID && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3">
              <span className="text-xs font-semibold text-zinc-200">Official Student Identity Card</span>
              <button
                onClick={() => setSelectedStudentForID(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Visual Printable Badge */}
            <div className="p-6">
              <div className="rounded-xl border-2 border-zinc-700 bg-gradient-to-b from-zinc-950 to-zinc-900 p-5 text-center shadow-lg ring-1 ring-white/10">
                {/* Header Band */}
                <div
                  className="rounded-lg p-2.5 text-white mb-4"
                  style={{ backgroundColor: currentSchool?.branding?.primaryColor || '#1e3a8a' }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider">{currentSchool?.name}</h3>
                  <p className="text-[10px] opacity-80">{currentSchool?.branding?.tagline || 'Student ID Card'}</p>
                </div>

                {/* Avatar */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 border-2 border-blue-500/50 text-2xl font-bold text-white shadow-inner">
                  {selectedStudentForID.name.charAt(0)}
                </div>

                <h4 className="mt-3 text-sm font-bold text-white">{selectedStudentForID.name}</h4>
                <p className="text-xs text-blue-400 font-mono font-medium">{selectedStudentForID.rollNo}</p>

                <div className="mt-4 space-y-1 text-left text-[11px] text-zinc-300 border-t border-zinc-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Admission No:</span>
                    <span className="font-mono">{selectedStudentForID.admissionNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Class & Section:</span>
                    <span>{selectedStudentForID.className} - {selectedStudentForID.sectionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Father's Name:</span>
                    <span>{selectedStudentForID.fatherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Blood Group:</span>
                    <span>{selectedStudentForID.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Valid Session:</span>
                    <span>{selectedStudentForID.sessionId}</span>
                  </div>
                </div>

                {/* Barcode / QR Simulation */}
                <div className="mt-4 flex flex-col items-center justify-center rounded bg-white p-2 text-black">
                  <div className="h-6 w-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px)]" />
                  <span className="text-[9px] font-mono mt-1 tracking-widest">{selectedStudentForID.admissionNo}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Student Badge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admission / Edit Modal */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                {editingStudent ? 'Edit Student Record' : 'Student Admission Form'}
              </h2>
              <button
                onClick={() => setIsAdmitModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Admission Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. 08-A-12"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-medium text-zinc-300">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Liam Benjamin"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Mother's Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Grade / Class *</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      const sel = classes.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        classId: e.target.value,
                        className: sel ? sel.name : formData.className,
                      });
                    }}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Section</label>
                  <select
                    value={formData.sectionName}
                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Emergency Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-medium text-zinc-300">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
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
                  {editingStudent ? 'Save Changes' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
