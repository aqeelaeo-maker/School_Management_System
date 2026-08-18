import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  Plus,
  Clock,
  BookOpen,
  Send,
  Sparkles,
} from 'lucide-react';
import { getStudents } from '../../services/studentService';
import { getClasses, getSubjects, getTimetable } from '../../services/academicService';
import { markAttendance } from '../../services/attendanceService';
import { getHomework, createHomework } from '../../services/operationsService';

export const TeacherPortal: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [activeTab, setActiveTab] = useState<'attendance' | 'schedule' | 'homework' | 'leave'>('attendance');
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [selectedClassId, setSelectedClassId] = useState('cls_8');
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [isHwModalOpen, setIsHwModalOpen] = useState(false);

  // Homework Form
  const [hwForm, setHwForm] = useState({
    title: '',
    description: '',
    classId: 'cls_8',
    className: 'Grade 8',
    subjectId: 'sub_math_01',
    subjectName: 'Mathematics',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  });

  const teacher = {
    name: userProfile?.name || 'Dr. Sarah Jenkins',
    employeeId: 'EMP-701',
    designation: 'Head of Mathematics & STEM',
    assignedClasses: ['Grade 8 - Section A', 'Grade 9 - Section B', 'Grade 10 - Section A'],
  };

  useEffect(() => {
    async function loadData() {
      const [stdList, clsList, subList, hwList] = await Promise.all([
        getStudents(schoolId),
        getClasses(schoolId),
        getSubjects(schoolId),
        getHomework(schoolId),
      ]);
      setStudents(stdList);
      setClasses(clsList);
      setSubjects(subList);
      setHomeworkList(hwList);

      const map: Record<string, 'present' | 'absent' | 'late'> = {};
      stdList.forEach((s) => {
        map[s.id] = 'present';
      });
      setAttendanceMap(map);
    }
    loadData();
  }, [schoolId]);

  const handleSaveAttendance = async () => {
    const records = Object.entries(attendanceMap).map(([studentId, status]) => {
      const s = students.find((std) => std.id === studentId);
      return {
        date: new Date().toISOString().split('T')[0],
        type: 'student' as const,
        targetId: studentId,
        targetName: s?.name || '',
        classId: selectedClassId,
        className: 'Grade 8',
        sectionId: 'sec_8a',
        sectionName: 'A',
        status: status as any,
      };
    });

    await markAttendance(
      schoolId,
      records,
      teacher.name
    );
    alert('Attendance submitted successfully for Grade 8-A!');
  };

  const handleCreateHw = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHomework(
      schoolId,
      {
        ...hwForm,
        sectionId: 'sec_8a',
        sectionName: 'A',
        assignedDate: new Date().toISOString().split('T')[0],
        maxScore: 20,
        teacherId: userProfile?.uid || 'teacher',
        teacherName: teacher.name,
        status: 'published',
        submissionsCount: 0,
      },
      { id: userProfile?.uid || 'teacher', name: teacher.name, role: 'teacher' }
    );
    setIsHwModalOpen(false);
    const updated = await getHomework(schoolId);
    setHomeworkList(updated);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile Header */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-600 font-bold text-white text-xl shadow-lg">
              {teacher.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{teacher.name}</h1>
                <span className="rounded-full bg-amber-950/80 border border-amber-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  {teacher.designation}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Staff ID: <span className="font-mono text-zinc-200">{teacher.employeeId}</span> • {currentSchool?.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {teacher.assignedClasses.map((cls, i) => (
              <span key={i} className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                {cls}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'attendance'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Quick Class Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'homework'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Assigned Homework</span>
        </button>

        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'leave'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Staff Leave Request</span>
        </button>
      </div>

      {/* Tab 1: Quick Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div>
              <h3 className="text-xs font-bold text-white">Daily Roster Attendance: Grade 8 - Section A</h3>
              <p className="text-[11px] text-zinc-400">Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const map: any = {};
                  students.forEach((s) => (map[s.id] = 'present'));
                  setAttendanceMap(map);
                }}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
              >
                Mark All Present
              </button>
              <button
                onClick={handleSaveAttendance}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
              >
                Submit Attendance
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {students.map((std) => (
                  <tr key={std.id} className="hover:bg-zinc-800/40">
                    <td className="p-3 font-mono font-semibold text-zinc-300">{std.rollNo}</td>
                    <td className="p-3 font-medium text-white">{std.name}</td>
                    <td className="p-3 text-zinc-400">{std.className} - {std.sectionName}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setAttendanceMap({ ...attendanceMap, [std.id]: 'present' })}
                          className={`rounded px-2.5 py-1 text-xs font-semibold ${
                            attendanceMap[std.id] === 'present'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => setAttendanceMap({ ...attendanceMap, [std.id]: 'late' })}
                          className={`rounded px-2.5 py-1 text-xs font-semibold ${
                            attendanceMap[std.id] === 'late'
                              ? 'bg-amber-600 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => setAttendanceMap({ ...attendanceMap, [std.id]: 'absent' })}
                          className={`rounded px-2.5 py-1 text-xs font-semibold ${
                            attendanceMap[std.id] === 'absent'
                              ? 'bg-rose-600 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Homework */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Coursework Assignments Published</h3>
            <button
              onClick={() => setIsHwModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Create Assignment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="rounded bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                    {hw.subjectName}
                  </span>
                  <span className="text-xs text-rose-400">Due: {hw.dueDate}</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-100">{hw.title}</h4>
                <p className="text-xs text-zinc-400">{hw.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Leave Request */}
      {activeTab === 'leave' && (
        <div className="max-w-xl rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Apply for Faculty Leave</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Leave application submitted to the Principal office for authorization.');
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-xs text-zinc-300">Leave Type</label>
              <select className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200">
                <option>Casual Leave (1-2 Days)</option>
                <option>Medical Leave</option>
                <option>Academic Conference / Training</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-300">From Date</label>
                <input type="date" className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200" />
              </div>
              <div>
                <label className="text-xs text-zinc-300">To Date</label>
                <input type="date" className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200" />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300">Reason / Description</label>
              <textarea rows={3} className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200" placeholder="State reason..." />
            </div>

            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500">
              Submit Leave Request
            </button>
          </form>
        </div>
      )}

      {/* HW Modal */}
      {isHwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Create Homework Assignment</h3>
            <form onSubmit={handleCreateHw} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Title</label>
                <input
                  type="text"
                  required
                  value={hwForm.title}
                  onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-300">Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={hwForm.description}
                  onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsHwModalOpen(false)} className="rounded px-3 py-1.5 text-xs text-zinc-300">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
