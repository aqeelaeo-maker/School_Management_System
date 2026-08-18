import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  GraduationCap,
  Briefcase,
  CalendarCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  BookOpen,
  Sparkles,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { getStudents } from '../../services/studentService';
import { getInvoices } from '../../services/feeService';
import { getNotices } from '../../services/operationsService';
import { Notice } from '../../types';

interface SchoolDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ onNavigateTab, onOpenAI }) => {
  const { currentSchool } = useAuth();
  const [studentsCount, setStudentsCount] = useState<number>(340);
  const [pendingFeesAmount, setPendingFeesAmount] = useState<number>(18200);
  const [notices, setNotices] = useState<Notice[]>([]);

  const schoolId = currentSchool?.id || 'sch_beacon_01';

  useEffect(() => {
    async function loadData() {
      if (currentSchool?.id) {
        const stds = await getStudents(currentSchool.id);
        if (stds.length > 0) setStudentsCount(stds.length);

        const invs = await getInvoices(currentSchool.id);
        const overdue = invs.filter((i) => i.status === 'overdue' || i.status === 'pending');
        const sumPending = overdue.reduce((acc, i) => acc + (i.balance || i.totalAmount), 0);
        if (sumPending > 0) setPendingFeesAmount(sumPending);

        const nots = await getNotices(currentSchool.id);
        setNotices(nots.slice(0, 3));
      }
    }
    loadData();
  }, [currentSchool]);

  // Attendance donut data
  const attendanceData = [
    { name: 'Present', value: 92, color: '#10b981' },
    { name: 'Absent', value: 4, color: '#ef4444' },
    { name: 'Late', value: 3, color: '#f59e0b' },
    { name: 'On Leave', value: 1, color: '#6366f1' },
  ];

  // Grade enrollment data
  const gradeDistribution = [
    { grade: 'Gr 6', count: 56 },
    { grade: 'Gr 7', count: 62 },
    { grade: 'Gr 8', count: 68 },
    { grade: 'Gr 9', count: 74 },
    { grade: 'Gr 10', count: 80 },
  ];

  return (
    <div className="space-y-6">
      {/* School Header Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 sm:flex-row sm:items-center sm:justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {currentSchool?.name || 'School Command Portal'}
            </h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-500/30">
              {currentSchool?.code}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Academic Session <span className="text-zinc-200 font-medium">{currentSchool?.activeSession || '2026-2027'}</span> • Principal:{' '}
            <span className="text-zinc-200 font-medium">{currentSchool?.principalName || 'Dr. Arthur Pendelton'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Mark Attendance</span>
          </button>

          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/60 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Students</span>
            <GraduationCap className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">{studentsCount}</p>
          <span className="text-[10px] text-emerald-400 mt-0.5">Enrolled Total</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Teachers</span>
            <Briefcase className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">{currentSchool?.stats?.totalTeachers || 24}</p>
          <span className="text-[10px] text-zinc-400 mt-0.5">Active Faculty</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Today's Attn.</span>
            <CalendarCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-400">94.8%</p>
          <span className="text-[10px] text-zinc-400 mt-0.5">322 Present</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Fee Collection</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">
            ${(currentSchool?.stats?.totalRevenue || 148500).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 mt-0.5">This Term</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Outstanding</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-rose-400">${pendingFeesAmount.toLocaleString()}</p>
          <span className="text-[10px] text-rose-400 mt-0.5">Defaulters</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Active Classes</span>
            <BookOpen className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-purple-300">10 Groups</p>
          <span className="text-[10px] text-zinc-400 mt-0.5">Grades 1 - 10</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Attendance Donut */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Today's Attendance Distribution
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium">94.8% Rate</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present (92%)
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Absent (4%)
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Late (3%)
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> On Leave (1%)
            </div>
          </div>
        </div>

        {/* Grade Distribution Bar */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Student Strength by Grade Level
            </h3>
            <span className="text-[11px] text-zinc-400">Total: {studentsCount} Enrolled</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="grade" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix & Recent Announcements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Launchers */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Quick Operational Actions
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onNavigateTab('students')}
              className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-center hover:border-blue-500/50 hover:bg-zinc-900 transition"
            >
              <GraduationCap className="h-5 w-5 text-blue-400 mb-1" />
              <span className="text-xs font-semibold text-zinc-200">Admit Student</span>
              <span className="text-[10px] text-zinc-500">New Enrollment</span>
            </button>

            <button
              onClick={() => onNavigateTab('attendance')}
              className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-center hover:border-emerald-500/50 hover:bg-zinc-900 transition"
            >
              <CalendarCheck className="h-5 w-5 text-emerald-400 mb-1" />
              <span className="text-xs font-semibold text-zinc-200">Daily Attendance</span>
              <span className="text-[10px] text-zinc-500">Mark Class Roll</span>
            </button>

            <button
              onClick={() => onNavigateTab('fees')}
              className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-center hover:border-amber-500/50 hover:bg-zinc-900 transition"
            >
              <CreditCard className="h-5 w-5 text-amber-400 mb-1" />
              <span className="text-xs font-semibold text-zinc-200">Fee Vouchers</span>
              <span className="text-[10px] text-zinc-500">Collect & Invoices</span>
            </button>

            <button
              onClick={() => onNavigateTab('examinations')}
              className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-center hover:border-purple-500/50 hover:bg-zinc-900 transition"
            >
              <TrendingUp className="h-5 w-5 text-purple-400 mb-1" />
              <span className="text-xs font-semibold text-zinc-200">Report Cards</span>
              <span className="text-[10px] text-zinc-500">Exam Results</span>
            </button>
          </div>
        </div>

        {/* Recent Bulletin Notices (Right Side Panel) */}
        <div className="rounded-xl border border-zinc-300 bg-[#F5F5F5] p-5 lg:col-span-2 text-zinc-900 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-blue-600" />
              School Notice Board & Circulars
            </h3>
            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {notices.map((n) => (
              <div
                key={n.id}
                className="rounded-lg border border-zinc-300 bg-white p-3.5 hover:border-zinc-400 transition shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-zinc-900">{n.title}</h4>
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                    {n.category.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600 line-clamp-2 leading-relaxed">{n.content}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>By: {n.publishedBy}</span>
                  <span>{n.publishedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
