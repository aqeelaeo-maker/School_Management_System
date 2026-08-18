import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TimetableSlot, ClassGroup, Subject, Teacher } from '../../types';
import { getTimetable, createTimetableSlot } from '../../services/academicService';
import { getClasses, getSubjects } from '../../services/academicService';
import { getTeachers } from '../../services/teacherService';
import {
  Calendar,
  Clock,
  Plus,
  BookOpen,
  User,
  MapPin,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';

export const TimetableModule: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { num: 1, time: '08:30 - 09:15' },
    { num: 2, time: '09:15 - 10:00' },
    { num: 3, time: '10:15 - 11:00' },
    { num: 4, time: '11:00 - 11:45' },
    { num: 5, time: '12:30 - 01:15' },
    { num: 6, time: '01:15 - 02:00' },
  ];

  const [slotForm, setSlotForm] = useState({
    day: 'Monday' as any,
    periodNumber: 1,
    startTime: '08:30 AM',
    endTime: '09:15 AM',
    subjectId: '',
    subjectName: '',
    teacherId: '',
    teacherName: '',
    roomNumber: 'Room 204',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, sList, tList] = await Promise.all([
        getClasses(schoolId),
        getSubjects(schoolId),
        getTeachers(schoolId),
      ]);
      setClasses(cList);
      setSubjects(sList);
      setTeachers(tList);

      if (cList.length > 0) {
        setSelectedClassId(cList[0].id);
      }
      if (sList.length > 0 && tList.length > 0) {
        setSlotForm((prev) => ({
          ...prev,
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

  const loadSchedule = async () => {
    if (!selectedClassId) return;
    const tt = await getTimetable(schoolId, selectedClassId);
    setSlots(tt);
  };

  useEffect(() => {
    loadSchedule();
  }, [schoolId, selectedClassId, selectedSection]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const curClass = classes.find((c) => c.id === selectedClassId);
    await createTimetableSlot(
      schoolId,
      {
        ...slotForm,
        classId: selectedClassId,
        className: curClass?.name || 'Grade',
        sectionId: `sec_${selectedSection.toLowerCase()}`,
        sectionName: selectedSection,
      },
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsSlotModalOpen(false);
    await loadSchedule();
  };

  const getSlot = (day: string, periodNum: number) => {
    return slots.find((s) => s.day.toLowerCase() === day.toLowerCase() && s.periodNumber === periodNum);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Weekly Academic Timetable Schedule
          </h1>
          <p className="text-xs text-zinc-400">
            Interactive master period planner, room allocations, and conflict-free faculty schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Schedule</span>
          </button>

          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Class Period Slot</span>
          </button>
        </div>
      </div>

      {/* Class & Section Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label className="text-[11px] font-medium text-zinc-400">Selected Grade / Class</label>
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

        <div className="w-48">
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
      </div>

      {/* Timetable Matrix Grid */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/70 shadow-sm custom-scrollbar">
        <table className="w-full min-w-[750px] text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3 w-28">Day / Time</th>
              {periods.map((p) => (
                <th key={p.num} className="px-3 py-3 text-center border-l border-zinc-800/80">
                  <div>Period {p.num}</div>
                  <div className="text-[10px] text-zinc-500 font-mono font-normal">{p.time}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {days.map((day) => (
              <tr key={day} className="hover:bg-zinc-800/30">
                <td className="px-4 py-4 font-bold text-zinc-200 bg-zinc-950/40">{day}</td>

                {periods.map((p) => {
                  const slot = getSlot(day, p.num);
                  return (
                    <td key={p.num} className="px-2.5 py-3 border-l border-zinc-800/60 text-center">
                      {slot ? (
                        <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-2 text-left hover:border-blue-700/60 transition">
                          <div className="font-semibold text-xs text-blue-300 truncate">{slot.subjectName}</div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                            <User className="h-3 w-3 text-zinc-500" />
                            {slot.teacherName}
                          </div>
                          <div className="text-[9px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-2.5 w-2.5 text-zinc-500" />
                            {slot.roomNumber}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSlotForm((prev) => ({
                              ...prev,
                              day: day as any,
                              periodNumber: p.num,
                            }));
                            setIsSlotModalOpen(true);
                          }}
                          className="h-14 w-full rounded border border-dashed border-zinc-800 text-[11px] text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 hover:bg-zinc-950/40 flex items-center justify-center"
                        >
                          + Assign
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Assign Timetable Period Slot</h3>
            <form onSubmit={handleAddSlot} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Day of Week</label>
                  <select
                    value={slotForm.day}
                    onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value as any })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Period Slot</label>
                  <select
                    value={slotForm.periodNumber}
                    onChange={(e) => setSlotForm({ ...slotForm, periodNumber: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    {periods.map((p) => (
                      <option key={p.num} value={p.num}>
                        Period {p.num} ({p.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Subject Course</label>
                <select
                  value={slotForm.subjectId}
                  onChange={(e) => {
                    const sub = subjects.find((s) => s.id === e.target.value);
                    setSlotForm({ ...slotForm, subjectId: e.target.value, subjectName: sub?.name || '' });
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
                  value={slotForm.teacherId}
                  onChange={(e) => {
                    const tch = teachers.find((t) => t.id === e.target.value);
                    setSlotForm({ ...slotForm, teacherId: e.target.value, teacherName: tch?.name || '' });
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
                <label className="text-xs text-zinc-300">Classroom / Lab Wing</label>
                <input
                  type="text"
                  value={slotForm.roomNumber}
                  onChange={(e) => setSlotForm({ ...slotForm, roomNumber: e.target.value })}
                  placeholder="e.g. Science Lab 2"
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Confirm Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
