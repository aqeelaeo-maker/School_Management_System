import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  GraduationCap,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Bell,
  BookOpen,
  Send,
  Printer,
  Sparkles,
} from 'lucide-react';
import { getExamResults } from '../../services/examService';
import { getInvoices } from '../../services/feeService';
import { getHomework } from '../../services/operationsService';
import { getNotices } from '../../services/operationsService';
import { getTimetable } from '../../services/academicService';

export const StudentParentPortal: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'fees' | 'homework' | 'schedule'>('overview');
  const [examResults, setExamResults] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Student mock identity
  const student = {
    name: 'Alexander Hayes',
    rollNo: '2026-0801',
    admissionNo: 'ADM-8821',
    className: 'Grade 8',
    sectionName: 'Section A',
    attendancePct: 96.4,
    classRank: 1,
    gpa: 3.9,
  };

  useEffect(() => {
    async function loadPortalData() {
      setLoading(true);
      try {
        const [res, inv, hw, nots, tt] = await Promise.all([
          getExamResults(schoolId),
          getInvoices(schoolId),
          getHomework(schoolId),
          getNotices(schoolId),
          getTimetable(schoolId, 'cls_8'),
        ]);
        setExamResults(res);
        setInvoices(inv);
        setHomeworkList(hw);
        setNotices(nots);
        setTimetable(tt);
      } finally {
        setLoading(false);
      }
    }
    loadPortalData();
  }, [schoolId]);

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-blue-950/80 via-zinc-900 to-indigo-950/80 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white text-xl shadow-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{student.name}</h1>
                <span className="rounded-full bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  Enrolled Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Roll No: <span className="font-mono text-zinc-200">{student.rollNo}</span> •{' '}
                {student.className} ({student.sectionName}) • {currentSchool?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Attendance</span>
              <div className="text-base font-bold text-emerald-400">{student.attendancePct}%</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Term GPA</span>
              <div className="text-base font-bold text-blue-400">{student.gpa} / 4.0</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Rank</span>
              <div className="text-base font-bold text-purple-400">#{student.classRank} in Class</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'academics'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Academic Grades & Report Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'fees'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Fee Vouchers & Payment Status</span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'homework'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Homework & Tasks ({homeworkList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'schedule'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Class Timetable</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Recent Notices & Assignments */}
          <div className="space-y-6 lg:col-span-2">
            {/* Notices */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-blue-400" />
                Latest School Circulars & Announcements
              </h3>
              <div className="space-y-3">
                {notices.slice(0, 3).map((n) => (
                  <div key={n.id} className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{n.title}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{n.publishedDate}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Homework */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-indigo-400" />
                Pending Assignments & Due Dates
              </h3>
              <div className="space-y-3">
                {homeworkList.slice(0, 3).map((hw) => (
                  <div key={hw.id} className="flex items-start justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                    <div>
                      <span className="rounded bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                        {hw.subjectName}
                      </span>
                      <h4 className="mt-1.5 text-xs font-bold text-zinc-200">{hw.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{hw.description}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 whitespace-nowrap">
                      <Clock className="h-3 w-3" /> Due {hw.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Quick Fee Summary & Attendance */}
          <div className="space-y-6">
            {/* Fee Card */}
            <div className="rounded-xl border border-zinc-300 bg-[#F5F5F5] p-5 space-y-3 text-zinc-900 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Fee Payment Status
              </h3>
              {invoices.length > 0 && (
                <div className="rounded-lg bg-white border border-zinc-200 p-3.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-800 font-semibold">{invoices[0].month} Voucher</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 uppercase">
                      {invoices[0].status}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-zinc-900">${invoices[0].totalAmount}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">Due Date: {invoices[0].dueDate}</div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-zinc-300 bg-[#F5F5F5] p-5 space-y-3 text-zinc-900 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Parent Direct Actions</h3>
              <button
                onClick={() => alert('Leave application submitted to Class Teacher!')}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:border-zinc-400 transition shadow-xs"
              >
                Submit Leave Application
              </button>
              <button
                onClick={() => alert('Message sent to School Principal office.')}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:border-zinc-400 transition shadow-xs"
              >
                Message Principal / Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Academics */}
      {activeTab === 'academics' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
            <h3 className="text-sm font-bold text-white mb-3">Term Examination Grade Report</h3>
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-3">Exam Term</th>
                  <th className="p-3">Total Marks</th>
                  <th className="p-3">Obtained</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">GPA</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {examResults.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-semibold text-white">{r.examName}</td>
                    <td className="p-3">{r.totalMarks}</td>
                    <td className="p-3 font-bold text-emerald-400">{r.obtainedMarks}</td>
                    <td className="p-3">{r.percentage}%</td>
                    <td className="p-3 font-bold text-purple-400">{r.grade}</td>
                    <td className="p-3 font-mono">{r.gpa}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => window.print()}
                        className="rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        Download Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Fees */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
            <h3 className="text-sm font-bold text-white mb-3">Student Fee Invoices & History</h3>
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-3">Voucher #</th>
                  <th className="p-3">Billing Month</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-3 font-mono font-semibold text-emerald-400">{inv.invoiceNumber}</td>
                    <td className="p-3 font-semibold text-white">{inv.month}</td>
                    <td className="p-3 font-mono text-zinc-400">{inv.dueDate}</td>
                    <td className="p-3 font-bold text-white">${inv.totalAmount}</td>
                    <td className="p-3">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => window.print()}
                        className="rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:text-white"
                      >
                        Print Challan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Homework */}
      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {homeworkList.map((hw) => (
            <div key={hw.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <span className="rounded bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {hw.subjectName}
                </span>
                <span className="text-xs text-rose-400 font-medium">Due: {hw.dueDate}</span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100">{hw.title}</h3>
              <p className="text-xs text-zinc-400">{hw.description}</p>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-xs">
                <span className="text-zinc-500">Instructor: {hw.teacherName}</span>
                <button
                  onClick={() => alert('Assignment marked submitted for review!')}
                  className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Submit Work
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Schedule */}
      {activeTab === 'schedule' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
          <h3 className="text-sm font-bold text-white mb-3">Weekly Class Period Schedule (Grade 8-A)</h3>
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-3">Day</th>
                <th className="p-3">Period</th>
                <th className="p-3">Course Subject</th>
                <th className="p-3">Teacher</th>
                <th className="p-3">Classroom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {timetable.map((t) => (
                <tr key={t.id}>
                  <td className="p-3 font-bold text-white">{t.day}</td>
                  <td className="p-3 font-mono">Period {t.periodNumber} ({t.startTime} - {t.endTime})</td>
                  <td className="p-3 font-semibold text-blue-400">{t.subjectName}</td>
                  <td className="p-3">{t.teacherName}</td>
                  <td className="p-3 font-mono text-zinc-400">{t.roomNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
