import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell,
  Calendar,
  Sparkles,
  TrendingUp,
  CreditCard,
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenAI?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenAI,
}) => {
  const { currentSchool, userProfile, availableSchools } = useAuth();

  const events = [
    { time: '09:00 AM', title: 'Morning Assembly & Roll Call', tag: 'Daily' },
    { time: '11:30 AM', title: 'Grade 8 STEM Lab Practicum', tag: 'Academics' },
    { time: '02:00 PM', title: 'Faculty Curriculum Review', tag: 'Staff' },
    { time: 'Tomorrow', title: 'Mid-Term Exam Rollout', tag: 'Exam' },
  ];

  const recentAlerts = [
    {
      title: 'Term Fee Billing Cycle',
      desc: 'Monthly vouchers generated for 340 students.',
      time: '10m ago',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      title: 'Automated SMS Broadcast',
      desc: 'Attendance summaries delivered to parents.',
      time: '1h ago',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      title: 'System Backup Complete',
      desc: 'Multi-tenant cloud snapshot verified.',
      time: '3h ago',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-zinc-300 bg-[#F5F5F5] text-zinc-900 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Panel Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-300 px-4 bg-[#F5F5F5]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 text-zinc-800 border border-zinc-300">
            <Bell className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Live Operations Panel
            </h2>
            <p className="text-[10px] text-zinc-500">
              {currentSchool?.name ? currentSchool.name.substring(0, 24) : 'System Command'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Panel Content Scrollable */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4 custom-scrollbar bg-[#F5F5F5]">
        {/* School Overview Summary Card */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700">Tenant Status</span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Online
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-[#F5F5F5] border border-zinc-200 p-2">
              <span className="text-[10px] text-zinc-500">Attendance</span>
              <div className="text-sm font-bold text-emerald-700">94.8%</div>
            </div>
            <div className="rounded-lg bg-[#F5F5F5] border border-zinc-200 p-2">
              <span className="text-[10px] text-zinc-500">Active Students</span>
              <div className="text-sm font-bold text-blue-700">
                {currentSchool?.stats?.totalStudents || 340}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launchers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Quick Shortcuts
            </span>
            {onOpenAI && (
              <button
                onClick={onOpenAI}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900"
              >
                <Sparkles className="h-3 w-3" />
                AI Assistant
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('attendance')}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white p-2.5 text-left text-xs font-semibold text-zinc-800 shadow-sm hover:border-emerald-500 hover:bg-emerald-50 transition"
            >
              <CalendarCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] leading-tight">Attendance</div>
                <div className="text-[9px] text-zinc-500 font-normal">Daily Roll</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('fees')}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white p-2.5 text-left text-xs font-semibold text-zinc-800 shadow-sm hover:border-amber-500 hover:bg-amber-50 transition"
            >
              <CreditCard className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-[11px] leading-tight">Fee Vouchers</div>
                <div className="text-[9px] text-zinc-500 font-normal">Invoices</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('students')}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white p-2.5 text-left text-xs font-semibold text-zinc-800 shadow-sm hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <GraduationCap className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] leading-tight">Enrollment</div>
                <div className="text-[9px] text-zinc-500 font-normal">New Student</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('notices')}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white p-2.5 text-left text-xs font-semibold text-zinc-800 shadow-sm hover:border-purple-500 hover:bg-purple-50 transition"
            >
              <Bell className="h-4 w-4 text-purple-600 shrink-0" />
              <div>
                <div className="text-[11px] leading-tight">Notices</div>
                <div className="text-[9px] text-zinc-500 font-normal">Broadcast</div>
              </div>
            </button>
          </div>
        </div>

        {/* Real-Time Institutional Activity */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
            Recent Institutional Events
          </span>

          <div className="space-y-2">
            {recentAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-zinc-300 bg-white p-2.5 shadow-sm space-y-1 hover:border-zinc-400 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900">{alert.title}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">{alert.time}</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug">{alert.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule & Milestones */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Today's Timeline
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-300 bg-white p-3 shadow-sm space-y-2.5">
            {events.map((ev, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-zinc-900">{ev.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ev.time}
                    </span>
                    <span className="rounded bg-[#F5F5F5] border border-zinc-200 px-1.5 py-0.2 text-[9px] font-medium text-zinc-600">
                      {ev.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
