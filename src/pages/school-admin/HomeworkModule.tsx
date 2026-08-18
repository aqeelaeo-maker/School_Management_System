import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Homework, ClassGroup, Subject } from '../../types';
import { getHomework, createHomework } from '../../services/operationsService';
import { getClasses, getSubjects } from '../../services/academicService';
import {
  FileText,
  Plus,
  Calendar,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  Send,
  Download,
} from 'lucide-react';

export const HomeworkModule: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    classId: '',
    className: '',
    sectionId: 'sec_8a',
    sectionName: 'A',
    subjectId: '',
    subjectName: '',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    assignedDate: new Date().toISOString().split('T')[0],
    maxScore: 20,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [hw, cls, subs] = await Promise.all([
        getHomework(schoolId),
        getClasses(schoolId),
        getSubjects(schoolId),
      ]);
      setHomeworkList(hw);
      setClasses(cls);
      setSubjects(subs);

      if (cls.length > 0 && subs.length > 0) {
        setForm((prev) => ({
          ...prev,
          classId: cls[0].id,
          className: cls[0].name,
          subjectId: subs[0].id,
          subjectName: subs[0].name,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHomework(
      schoolId,
      {
        ...form,
        teacherId: userProfile?.uid || 'tch_math_01',
        teacherName: userProfile?.name || 'Faculty Member',
        status: 'published',
        submissionsCount: 0,
      },
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Homework & Digital Assignments
          </h1>
          <p className="text-xs text-zinc-400">
            Publish coursework, set submission deadlines, and monitor student completion rates
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>Publish Homework</span>
        </button>
      </div>

      {/* Homework Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {homeworkList.map((hw) => (
          <div
            key={hw.id}
            className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                    {hw.subjectName}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-zinc-100">{hw.title}</h3>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 font-medium">
                  {hw.className} - {hw.sectionName}
                </span>
              </div>

              <p className="mt-3 text-xs text-zinc-300 line-clamp-3 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                {hw.description}
              </p>

              <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <Clock className="h-3 w-3" /> Due: {hw.dueDate}
                </span>
                <span>Max: {hw.maxScore || 20} pts</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-[11px] text-zinc-400">
              <span>By {hw.teacherName}</span>
              <span className="font-semibold text-emerald-400">
                {hw.submissionsCount || 28} Submissions
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Publish New Homework Assignment</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Chapter 4: Algebraic Factorization Problem Set"
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Target Class</label>
                  <select
                    value={form.classId}
                    onChange={(e) => {
                      const c = classes.find((cls) => cls.id === e.target.value);
                      setForm({ ...form, classId: e.target.value, className: c?.name || '' });
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
                    value={form.subjectId}
                    onChange={(e) => {
                      const s = subjects.find((sub) => sub.id === e.target.value);
                      setForm({ ...form, subjectId: e.target.value, subjectName: s?.name || '' });
                    }}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Assignment Instructions & Problems *</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail the exercises, page numbers, or submission guidelines..."
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Due Deadline</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Max Score (Points)</label>
                  <input
                    type="number"
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
