import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Exam, ExamResult, ClassGroup, Subject, Student } from '../../types';
import {
  getExams,
  createExam,
  getExamResults,
  saveExamResult,
  calculateGradeAndGPA,
} from '../../services/examService';
import { getClasses, getSubjects } from '../../services/academicService';
import { getStudents } from '../../services/studentService';
import {
  TrendingUp,
  Plus,
  Printer,
  Award,
  BookOpen,
  CheckCircle2,
  Calendar,
  Save,
  X,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const ExaminationsModule: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [activeTab, setActiveTab] = useState<'results' | 'exams' | 'transcript'>('results');
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<ExamResult | null>(null);

  // Marks Entry state
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    name: 'Final Term Comprehensive Exam 2026',
    term: 'final' as const,
    session: currentSchool?.activeSession || '2026-2027',
    startDate: '2026-11-15',
    endDate: '2026-11-30',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [eList, cList, sList, stdList] = await Promise.all([
        getExams(schoolId),
        getClasses(schoolId),
        getSubjects(schoolId),
        getStudents(schoolId),
      ]);
      setExams(eList);
      setClasses(cList);
      setSubjects(sList);
      setStudents(stdList);

      if (eList.length > 0) setSelectedExamId(eList[0].id);
      if (cList.length > 0) setSelectedClassId(cList[0].id);
      if (sList.length > 0) setSelectedSubjectId(sList[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const loadResultsForExam = async () => {
    if (!selectedExamId) return;
    const resList = await getExamResults(schoolId, selectedExamId, selectedClassId || undefined);
    setResults(resList);

    // Populate marks map for the selected subject
    const map: Record<string, number> = {};
    resList.forEach((r) => {
      const sub = r.subjects.find((s) => s.subjectId === selectedSubjectId);
      if (sub) {
        map[r.studentId] = sub.obtainedMarks;
      }
    });
    setMarksMap(map);
  };

  useEffect(() => {
    loadResultsForExam();
  }, [schoolId, selectedExamId, selectedClassId, selectedSubjectId]);

  const handleSaveMarks = async () => {
    const curExam = exams.find((e) => e.id === selectedExamId);
    const curClass = classes.find((c) => c.id === selectedClassId);
    const curSub = subjects.find((s) => s.id === selectedSubjectId);
    if (!curExam || !curClass || !curSub) return;

    for (const student of students.filter((s) => s.classId === selectedClassId)) {
      const mark = marksMap[student.id] || 0;
      const subResult = {
        subjectId: curSub.id,
        subjectName: curSub.name,
        totalMarks: curSub.totalMarks || 100,
        obtainedMarks: mark,
        grade: mark >= 80 ? 'A' : mark >= 65 ? 'B' : mark >= 50 ? 'C' : 'F',
        gpa: mark >= 80 ? 4.0 : mark >= 65 ? 3.0 : mark >= 50 ? 2.0 : 0.0,
      };

      const existing = results.find((r) => r.studentId === student.id);
      const otherSubjects = existing ? existing.subjects.filter((s) => s.subjectId !== curSub.id) : [];
      const updatedSubjects = [...otherSubjects, subResult];

      const totalObtained = updatedSubjects.reduce((a, b) => a + b.obtainedMarks, 0);
      const totalMax = updatedSubjects.reduce((a, b) => a + b.totalMarks, 0);
      const { percentage, grade, gpa } = calculateGradeAndGPA(totalObtained, totalMax);

      await saveExamResult(
        schoolId,
        {
          examId: curExam.id,
          examName: curExam.name,
          studentId: student.id,
          studentName: student.name,
          rollNo: student.rollNo,
          classId: curClass.id,
          className: curClass.name,
          sectionName: student.sectionName,
          subjects: updatedSubjects,
          totalMarks: totalMax,
          obtainedMarks: totalObtained,
          percentage,
          grade,
          gpa,
          remarks: percentage >= 80 ? 'Outstanding academic excellence' : 'Good steady progress',
        },
        userProfile?.name || 'Admin'
      );
    }

    alert('Marks saved and student results compiled!');
    await loadResultsForExam();
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExam(
      schoolId,
      {
        ...examForm,
        classes: classes.map((c) => c.name),
        status: 'scheduled',
      },
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsExamModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Examinations, Marks & Report Cards
          </h1>
          <p className="text-xs text-zinc-400">
            Create assessment terms, enter marks, calculate grades/GPA, and print official student transcripts
          </p>
        </div>

        <button
          onClick={() => setIsExamModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-500 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule New Exam Term</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'results'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Marks Entry Sheet</span>
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'transcript'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Class Transcripts & Position Ranks ({results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'exams'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Exam Schedules & Terms ({exams.length})</span>
        </button>
      </div>

      {/* Tab 1: Marks Entry */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* Selector bar */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:grid-cols-4">
            <div>
              <label className="text-[11px] font-medium text-zinc-400">Exam Term</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200"
              >
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400">Target Grade / Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code}) - Total: {s.totalMarks}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSaveMarks}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Compile & Save Marks</span>
              </button>
            </div>
          </div>

          {/* Marks Entry Grid */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Total Marks</th>
                  <th className="px-4 py-3">Obtained Marks</th>
                  <th className="px-4 py-3">Auto Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {students
                  .filter((s) => s.classId === selectedClassId)
                  .map((std) => {
                    const mark = marksMap[std.id] ?? 85;
                    const grade = mark >= 80 ? 'A+' : mark >= 70 ? 'A' : mark >= 55 ? 'B' : 'C';
                    return (
                      <tr key={std.id} className="hover:bg-zinc-800/40">
                        <td className="px-4 py-3 font-mono font-semibold text-zinc-300">{std.rollNo}</td>
                        <td className="px-4 py-3 font-medium text-zinc-100">{std.name}</td>
                        <td className="px-4 py-3 text-zinc-400">100</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={marksMap[std.id] ?? 85}
                            onChange={(e) =>
                              setMarksMap({ ...marksMap, [std.id]: Number(e.target.value) })
                            }
                            className="w-24 rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-bold text-purple-300 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 text-[11px] font-bold text-purple-300">
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Class Transcripts */}
      {activeTab === 'transcript' && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Rank / Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Class & Section</th>
                <th className="px-4 py-3">Marks Obtained</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Grade & GPA</th>
                <th className="px-4 py-3 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No results compiled for this exam yet.
                  </td>
                </tr>
              ) : (
                results
                  .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
                  .map((res, index) => (
                    <tr key={res.id} className="hover:bg-zinc-800/40">
                      <td className="px-4 py-3 font-mono font-semibold text-zinc-300">
                        #{index + 1} ({res.rollNo})
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-100">{res.studentName}</td>
                      <td className="px-4 py-3">{res.className} - {res.sectionName}</td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {res.obtainedMarks} / {res.totalMarks}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{res.percentage}%</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 font-bold text-zinc-200">
                          {res.grade} ({res.gpa} GPA)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedStudentForReport(res)}
                          className="flex items-center gap-1 ml-auto rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition"
                        >
                          <Printer className="h-3 w-3" />
                          <span>View Report</span>
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Exam Terms */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((ex) => (
            <div
              key={ex.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{ex.name}</h3>
                  <span className="rounded bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-300 mt-1 inline-block">
                    {ex.term} Term
                  </span>
                </div>
                <span className="rounded-full bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {ex.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 space-y-1 text-xs text-zinc-400 border-t border-zinc-800 pt-3">
                <div>Duration: {ex.startDate} to {ex.endDate}</div>
                <div>Session: {ex.session}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Exam Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Schedule Examination Session</h3>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300">Term Category</label>
                <select
                  value={examForm.term}
                  onChange={(e) => setExamForm({ ...examForm, term: e.target.value as any })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="mid">Mid Term</option>
                  <option value="final">Final Term</option>
                  <option value="monthly">Monthly Test</option>
                  <option value="quiz">Quiz / Unit Assessment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Start Date</label>
                  <input
                    type="date"
                    value={examForm.startDate}
                    onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300">End Date</label>
                  <input
                    type="date"
                    value={examForm.endDate}
                    onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Schedule Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Student Report Card Modal */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-400" />
                Official Student Academic Progress Report
              </h3>
              <button
                onClick={() => setSelectedStudentForReport(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Transcript Sheet */}
            <div className="bg-white text-zinc-900 p-6 rounded-xl border border-zinc-300 font-sans space-y-4">
              {/* Header */}
              <div
                className="rounded-lg p-3 text-white text-center"
                style={{ backgroundColor: currentSchool?.branding?.primaryColor || '#1e3a8a' }}
              >
                <h2 className="text-base font-bold uppercase tracking-wider">{currentSchool?.name}</h2>
                <p className="text-xs opacity-90">{currentSchool?.city}, {currentSchool?.state} • {currentSchool?.email}</p>
                <p className="text-[11px] font-semibold mt-1 uppercase tracking-widest bg-black/20 rounded py-0.5">
                  Official Academic Transcript & Grade Report
                </p>
              </div>

              {/* Student Meta */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-zinc-300 pb-3">
                <div><strong>Student Name:</strong> {selectedStudentForReport.studentName}</div>
                <div><strong>Roll Number:</strong> {selectedStudentForReport.rollNo}</div>
                <div><strong>Grade Level:</strong> {selectedStudentForReport.className} - {selectedStudentForReport.sectionName}</div>
                <div><strong>Examination:</strong> {selectedStudentForReport.examName}</div>
              </div>

              {/* Grades Table */}
              <table className="w-full text-left text-xs border border-zinc-300">
                <thead className="bg-zinc-100 border-b border-zinc-300 font-bold">
                  <tr>
                    <th className="p-2 border-r border-zinc-300">Subject Course</th>
                    <th className="p-2 border-r border-zinc-300 text-center">Max Marks</th>
                    <th className="p-2 border-r border-zinc-300 text-center">Obtained</th>
                    <th className="p-2 border-r border-zinc-300 text-center">Grade</th>
                    <th className="p-2 text-center">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-300">
                  {selectedStudentForReport.subjects?.map((sub, i) => (
                    <tr key={i}>
                      <td className="p-2 border-r border-zinc-300 font-semibold">{sub.subjectName}</td>
                      <td className="p-2 border-r border-zinc-300 text-center">{sub.totalMarks}</td>
                      <td className="p-2 border-r border-zinc-300 text-center font-bold">{sub.obtainedMarks}</td>
                      <td className="p-2 border-r border-zinc-300 text-center font-semibold text-blue-900">{sub.grade}</td>
                      <td className="p-2 text-center font-mono">{sub.gpa.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Bar */}
              <div className="grid grid-cols-3 gap-2 bg-zinc-100 p-3 rounded text-center text-xs">
                <div>
                  <div className="text-zinc-600 font-medium">Total Score</div>
                  <div className="font-bold text-sm text-zinc-900">
                    {selectedStudentForReport.obtainedMarks} / {selectedStudentForReport.totalMarks}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-600 font-medium">Aggregate Percentage</div>
                  <div className="font-bold text-sm text-blue-800">{selectedStudentForReport.percentage}%</div>
                </div>
                <div>
                  <div className="text-zinc-600 font-medium">Final Grade / GPA</div>
                  <div className="font-bold text-sm text-emerald-700">
                    {selectedStudentForReport.grade} ({selectedStudentForReport.gpa} GPA)
                  </div>
                </div>
              </div>

              {/* Remarks & Signatures */}
              <div className="pt-4 flex justify-between items-end text-xs text-zinc-600 border-t border-zinc-300">
                <div>
                  <strong>Principal Remarks:</strong> {selectedStudentForReport.remarks || 'Excellent progress!'}
                </div>
                <div className="text-center">
                  <div className="border-b border-zinc-400 w-32 mb-1" />
                  <span>Authorized Principal</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official Report Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
