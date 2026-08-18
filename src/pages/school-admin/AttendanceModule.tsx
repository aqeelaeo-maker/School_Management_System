import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Student, AttendanceRecord, AttendanceStatus, ClassGroup } from '../../types';
import { getStudents } from '../../services/studentService';
import { getClasses } from '../../services/academicService';
import { getAttendanceByDate, markBatchAttendance } from '../../services/attendanceService';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  Send,
  Save,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  RefreshCw,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function initClasses() {
      const clsList = await getClasses(schoolId);
      setClasses(clsList);
      if (clsList.length > 0) {
        setSelectedClassId(clsList[0].id);
      }
    }
    initClasses();
  }, [schoolId]);

  const loadAttendanceForSelection = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      const stdList = await getStudents(schoolId, selectedClassId);
      const filtered = stdList.filter((s) => s.sectionName === selectedSection || !s.sectionName);
      setStudents(filtered);

      const existingRecords = await getAttendanceByDate(
        schoolId,
        selectedDate,
        selectedClassId
      );

      const map: Record<string, AttendanceStatus> = {};
      const rMap: Record<string, string> = {};

      filtered.forEach((std) => {
        const found = existingRecords.find((r: any) => (r.targetId || r.studentId) === std.id);
        map[std.id] = found ? found.status : 'present';
        rMap[std.id] = found?.remarks || '';
      });

      setAttendanceMap(map);
      setRemarksMap(rMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceForSelection();
  }, [schoolId, selectedClassId, selectedSection, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentClassObj = classes.find((c) => c.id === selectedClassId);
      const recordsToSave = students.map((s) => ({
        date: selectedDate,
        type: 'student' as const,
        targetId: s.id,
        targetName: s.name,
        classId: selectedClassId,
        className: currentClassObj?.name || 'Class',
        sectionId: `sec_${selectedSection.toLowerCase()}`,
        sectionName: selectedSection,
        status: attendanceMap[s.id] || 'present',
        remarks: remarksMap[s.id] || '',
        recordedBy: userProfile?.name || 'Faculty Admin',
      }));

      await markBatchAttendance(
        schoolId,
        recordsToSave,
        userProfile?.name || 'Admin'
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'late').length;
  const leaveCount = Object.values(attendanceMap).filter((s) => s === 'leave').length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-emerald-400" />
            Daily Student Attendance Register
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time daily roll call logging, automated parent alerts, and multi-status tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Attendance saved!
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Register</span>
          </button>
        </div>
      </div>

      {/* Filter Selection Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:grid-cols-4">
        <div>
          <label className="text-[11px] font-medium text-zinc-400">Target Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-zinc-400">Select Grade / Class</label>
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
          <label className="text-[11px] font-medium text-zinc-400">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={() => handleMarkAll('present')}
            className="flex-1 rounded-lg border border-emerald-800/60 bg-emerald-950/40 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="rounded-lg border border-rose-800/60 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Attendance Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 text-center">
          <div className="text-[11px] text-zinc-400">Total Enrolled</div>
          <div className="text-lg font-bold text-white mt-0.5">{totalCount}</div>
        </div>
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-center">
          <div className="text-[11px] text-emerald-400">Present (P)</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{presentCount}</div>
        </div>
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3 text-center">
          <div className="text-[11px] text-rose-400">Absent (A)</div>
          <div className="text-lg font-bold text-rose-400 mt-0.5">{absentCount}</div>
        </div>
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-center">
          <div className="text-[11px] text-amber-400">Late (L)</div>
          <div className="text-lg font-bold text-amber-400 mt-0.5">{lateCount}</div>
        </div>
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 text-center">
          <div className="text-[11px] text-blue-400">Present Rate</div>
          <div className="text-lg font-bold text-blue-400 mt-0.5">{percentage}%</div>
        </div>
      </div>

      {/* Attendance Grid Sheet */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 shadow-sm">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Roll No</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3 text-center">Attendance Status</th>
              <th className="px-4 py-3">Remarks / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-500">
                  No students in this class/section.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const currentStatus = attendanceMap[student.id] || 'present';
                return (
                  <tr key={student.id} className="hover:bg-zinc-800/40 transition">
                    <td className="px-4 py-3 font-mono font-semibold text-zinc-300">
                      {student.rollNo}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-100">{student.name}</div>
                      <div className="text-[10px] text-zinc-500">F: {student.fatherName}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                            currentStatus === 'late'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          L
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'leave')}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                            currentStatus === 'leave'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          LV
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. medical note)..."
                        value={remarksMap[student.id] || ''}
                        onChange={(e) =>
                          setRemarksMap({ ...remarksMap, [student.id]: e.target.value })
                        }
                        className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
