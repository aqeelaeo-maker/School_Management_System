import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

interface SuperAdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigateTab }) => {
  const { availableSchools, switchSchool } = useAuth();

  // Aggregate stats across all schools
  const totalSchools = availableSchools.length;
  const activeSchools = availableSchools.filter((s) => s.status === 'active').length;
  const totalStudents = availableSchools.reduce((acc, s) => acc + (s.stats?.totalStudents || 0), 0);
  const totalTeachers = availableSchools.reduce((acc, s) => acc + (s.stats?.totalTeachers || 0), 0);
  const totalRevenue = availableSchools.reduce((acc, s) => acc + (s.stats?.totalRevenue || 0), 0);
  const totalPending = availableSchools.reduce((acc, s) => acc + (s.stats?.pendingFees || 0), 0);

  // Chart data
  const schoolComparisonData = availableSchools.map((s) => ({
    name: s.code || s.name.substring(0, 10),
    students: s.stats?.totalStudents || 0,
    teachers: s.stats?.totalTeachers || 0,
    attendance: s.stats?.attendanceRate || 95,
  }));

  const revenueData = availableSchools.map((s) => ({
    name: s.code || s.name.substring(0, 10),
    collected: s.stats?.totalRevenue || 0,
    pending: s.stats?.pendingFees || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page Title & Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Super Admin System Command</h1>
          <p className="text-xs text-zinc-400">
            Multi-Tenant Enterprise Overview across {totalSchools} educational institutions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('schools')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Manage Schools</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Total Schools</span>
            <Building2 className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">{totalSchools}</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
            <CheckCircle2 className="h-3 w-3" /> {activeSchools} Active
          </span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Total Students</span>
            <GraduationCap className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">{totalStudents.toLocaleString()}</p>
          <span className="text-[10px] text-zinc-400 mt-0.5">Enrolled System-wide</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Total Teachers</span>
            <Briefcase className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">{totalTeachers}</p>
          <span className="text-[10px] text-zinc-400 mt-0.5">Active Faculty</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 mt-0.5">Collected</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Pending Dues</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-rose-400">${totalPending.toLocaleString()}</p>
          <span className="text-[10px] text-zinc-400 mt-0.5">Outstanding Fees</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium">Avg. Attendance</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-cyan-300">95.4%</p>
          <span className="text-[10px] text-emerald-400 mt-0.5">Normal Threshold</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Enrollment per School */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
            Enrollment & Faculty Capacity by School
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="students" fill="#3b82f6" name="Students" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teachers" fill="#f59e0b" name="Teachers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fee Collections vs Dues (Right Side Panel) */}
        <div className="rounded-xl border border-zinc-300 bg-[#F5F5F5] p-4 text-zinc-900 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-3">
            Institutional Fee Recovery Comparison ($)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} />
                <YAxis stroke="#52525b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d4d4d8',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#18181b',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#3f3f46' }} />
                <Bar dataKey="collected" fill="#059669" name="Collected ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#e11d48" name="Pending ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* School Directory Snapshot */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Registered Institutions</h3>
            <p className="text-xs text-zinc-400">Click to switch context directly to any tenant school</p>
          </div>
          <button
            onClick={() => onNavigateTab('schools')}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            <span>View All Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {availableSchools.map((sch) => (
            <div
              key={sch.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5 hover:border-zinc-700 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold shadow-sm"
                  style={{ backgroundColor: sch.branding?.primaryColor || '#1e3a8a' }}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-100">{sch.name}</h4>
                  <p className="text-[11px] text-zinc-400">
                    Principal: <span className="text-zinc-300">{sch.principalName}</span> • {sch.city}, {sch.state}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300">
                      {sch.stats?.totalStudents || 0} Students
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300">
                      {sch.stats?.totalTeachers || 0} Teachers
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      ${sch.stats?.totalRevenue?.toLocaleString()} Rev
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  await switchSchool(sch.id);
                  onNavigateTab('dashboard');
                }}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white transition"
              >
                Enter Tenant
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
