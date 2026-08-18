import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ClassGroup, Subject, SubjectAllocation } from '../../types';
import {
  getClasses,
  createClass,
  getSubjects,
  createSubject,
  getSubjectAllocations,
  allocateSubjectTeacher,
} from '../../services/academicService';
import { getTeachers } from '../../services/teacherService';
import {
  BookOpen,
  Layers,
  Plus,
  Users,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  X,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

export const AcademicManagement: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'allocations'>('classes');
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allocations, setAllocations] = useState<SubjectAllocation[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);

  // Forms
  const [classForm, setClassForm] = useState({
    name: '',
    numericGrade: 8,
    sections: ['A', 'B'],
    capacity: 40,
    roomNumber: 'Room 201',
    sessionId: currentSchool?.activeSession || '2026-2027',
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    type: 'core' as const,
    totalMarks: 100,
    passingMarks: 40,
    credits: 4,
    description: '',
  });

  const [allocForm, setAllocForm] = useState({
    classId: '',
    className: '',
    sectionId: 'sec_a',
    sectionName: 'A',
    subjectId: '',
    subjectName: '',
    teacherId: '',
    teacherName: '',
    periodsPerWeek: 5,
    sessionId: currentSchool?.activeSession || '2026-2027',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, sList, aList, tList] = await Promise.all([
        getClasses(schoolId),
        getSubjects(schoolId),
        getSubjectAllocations(schoolId),
        getTeachers(schoolId),
      ]);
      setClasses(cList);
      setSubjects(sList);
      setAllocations(aList);
      setTeachers(tList);

      if (cList.length > 0 && sList.length > 0 && tList.length > 0) {
        setAllocForm((prev) => ({
          ...prev,
          classId: cList[0].id,
          className: cList[0].name,
          subjectId: sList[0].id,
          subjectName: sList[0].name,
          teacherId: tList[0].id,
          teacherName: tList[0].name,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClass(
      schoolId,
      {
        ...classForm,
        sections: [
          { id: `sec_${Date.now()}_a`, name: 'A', capacity: 35, currentStudentsCount: 0 },
          { id: `sec_${Date.now()}_b`, name: 'B', capacity: 35, currentStudentsCount: 0 },
        ],
      },
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsClassModalOpen(false);
    await loadData();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSubject(
      schoolId,
      subjectForm,
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsSubjectModalOpen(false);
    await loadData();
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    await allocateSubjectTeacher(
      schoolId,
      allocForm,
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsAllocModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Academic Curriculum & Allocations
          </h1>
          <p className="text-xs text-zinc-400">
            Structure grade levels, master course catalogs, and faculty teaching allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'classes' && (
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Create Class</span>
            </button>
          )}

          {activeTab === 'subjects' && (
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Course / Subject</span>
            </button>
          )}

          {activeTab === 'allocations' && (
            <button
              onClick={() => setIsAllocModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Allocate Faculty</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'classes'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Classes & Sections ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'subjects'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Subject Catalog ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('allocations')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'allocations'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Faculty Allocation Matrix ({allocations.length})</span>
        </button>
      </div>

      {/* Tab 1: Classes */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-300 font-bold text-sm">
                    {cls.numericGrade}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{cls.name}</h3>
                    <p className="text-[11px] text-zinc-400">{cls.roomNumber || 'Assigned Wing'}</p>
                  </div>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                  {cls.sections?.length || 2} Sections
                </span>
              </div>

              <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Active Sections:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {cls.sections?.map((sec) => (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 p-2 text-xs"
                    >
                      <span className="font-semibold text-zinc-200">Section {sec.name}</span>
                      <span className="text-[10px] text-zinc-400">Cap: {sec.capacity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Subjects */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{sub.name}</h3>
                  <span className="font-mono text-[11px] text-indigo-400 font-semibold">{sub.code}</span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    sub.type === 'core'
                      ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                      : 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                  }`}
                >
                  {sub.type}
                </span>
              </div>

              {sub.description && (
                <p className="mt-2 text-xs text-zinc-400">{sub.description}</p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-3 text-center text-xs">
                <div className="rounded bg-zinc-950/50 p-1.5">
                  <div className="text-[10px] text-zinc-500">Total Marks</div>
                  <div className="font-bold text-zinc-200">{sub.totalMarks}</div>
                </div>
                <div className="rounded bg-zinc-950/50 p-1.5">
                  <div className="text-[10px] text-zinc-500">Pass Marks</div>
                  <div className="font-bold text-emerald-400">{sub.passingMarks}</div>
                </div>
                <div className="rounded bg-zinc-950/50 p-1.5">
                  <div className="text-[10px] text-zinc-500">Credits</div>
                  <div className="font-bold text-indigo-300">{sub.credits} cr</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Allocations */}
      {activeTab === 'allocations' && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Class & Section</th>
                <th className="px-4 py-3">Subject / Course</th>
                <th className="px-4 py-3">Assigned Faculty</th>
                <th className="px-4 py-3">Weekly Periods</th>
                <th className="px-4 py-3 text-right">Academic Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No teacher-subject allocations configured yet.
                  </td>
                </tr>
              ) : (
                allocations.map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-zinc-100">
                      {a.className} - {a.sectionName}
                    </td>
                    <td className="px-4 py-3 text-indigo-300 font-medium">{a.subjectName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-zinc-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        {a.teacherName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
                        {a.periodsPerWeek} periods / wk
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-400">{a.sessionId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Create New Class / Grade Level</h3>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Class Name *</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. Grade 11"
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-300">Numeric Level (1-12)</label>
                <input
                  type="number"
                  value={classForm.numericGrade}
                  onChange={(e) => setClassForm({ ...classForm, numericGrade: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-300">Room / Hall Location</label>
                <input
                  type="text"
                  value={classForm.roomNumber}
                  onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })}
                  placeholder="Room 304"
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Add Course / Subject to Catalog</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Physics & Mechanics"
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    placeholder="PHY-101"
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Type</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value as any })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="core">Core Requirement</option>
                    <option value="elective">Elective</option>
                    <option value="practical">Practical / Lab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Total Marks</label>
                  <input
                    type="number"
                    value={subjectForm.totalMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, totalMarks: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Pass Marks</label>
                  <input
                    type="number"
                    value={subjectForm.passingMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, passingMarks: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Credits</label>
                  <input
                    type="number"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Faculty Modal */}
      {isAllocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Allocate Faculty to Course</h3>
            <form onSubmit={handleAllocate} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Class & Section</label>
                <select
                  value={allocForm.classId}
                  onChange={(e) => {
                    const c = classes.find((cls) => cls.id === e.target.value);
                    setAllocForm({ ...allocForm, classId: e.target.value, className: c?.name || '' });
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
                <label className="text-xs text-zinc-300">Course / Subject</label>
                <select
                  value={allocForm.subjectId}
                  onChange={(e) => {
                    const s = subjects.find((sub) => sub.id === e.target.value);
                    setAllocForm({ ...allocForm, subjectId: e.target.value, subjectName: s?.name || '' });
                  }}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Faculty Instructor</label>
                <select
                  value={allocForm.teacherId}
                  onChange={(e) => {
                    const t = teachers.find((tch) => tch.id === e.target.value);
                    setAllocForm({ ...allocForm, teacherId: e.target.value, teacherName: t?.name || '' });
                  }}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Weekly Periods</label>
                <input
                  type="number"
                  value={allocForm.periodsPerWeek}
                  onChange={(e) => setAllocForm({ ...allocForm, periodsPerWeek: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAllocModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
