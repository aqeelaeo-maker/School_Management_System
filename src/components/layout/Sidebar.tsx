import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Award,
  Clock,
  BookCheck,
  Library,
  Bus,
  Receipt,
  Bell,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { userProfile, currentSchool } = useAuth();
  const role = userProfile?.role || 'school_admin';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'super_admin':
        return [
          { id: 'super_dashboard', label: 'Global Overview', icon: LayoutDashboard },
          { id: 'schools', label: 'All Schools', icon: Building2 },
          { id: 'global_users', label: 'System Users', icon: Users },
          { id: 'audit_logs', label: 'Audit Logs', icon: ShieldAlert },
          { id: 'system_settings', label: 'System Settings', icon: Settings },
        ];

      case 'principal':
        return [
          { id: 'principal_dashboard', label: 'Principal Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Students Roster', icon: GraduationCap },
          { id: 'teachers', label: 'Faculty Directory', icon: Briefcase },
          { id: 'attendance', label: 'Attendance Monitor', icon: CalendarCheck },
          { id: 'academics', label: 'Academic Structure', icon: BookOpen },
          { id: 'examinations', label: 'Exam Results & GPA', icon: Award },
          { id: 'fees', label: 'Fee Collection', icon: CreditCard },
          { id: 'notices', label: 'Notices & Circulars', icon: Bell },
          { id: 'reports', label: 'Institutional Reports', icon: FileSpreadsheet },
        ];

      case 'teacher':
        return [
          { id: 'teacher_dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'My Students', icon: GraduationCap },
          { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
          { id: 'homework', label: 'Homework & Tasks', icon: BookCheck },
          { id: 'examinations', label: 'Enter Exam Marks', icon: Award },
          { id: 'timetable', label: 'My Timetable', icon: Clock },
          { id: 'notices', label: 'School Notices', icon: Bell },
        ];

      case 'student':
        return [
          { id: 'student_dashboard', label: 'My Overview', icon: LayoutDashboard },
          { id: 'timetable', label: 'Class Timetable', icon: Clock },
          { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
          { id: 'homework', label: 'My Homework', icon: BookCheck },
          { id: 'examinations', label: 'My Report Card', icon: Award },
          { id: 'fees', label: 'Fee Invoices', icon: CreditCard },
          { id: 'notices', label: 'Announcements', icon: Bell },
        ];

      case 'parent':
        return [
          { id: 'parent_dashboard', label: 'Children Overview', icon: LayoutDashboard },
          { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
          { id: 'examinations', label: 'Term Results', icon: Award },
          { id: 'fees', label: 'Fee Invoices & Vouchers', icon: CreditCard },
          { id: 'notices', label: 'School Notices', icon: Bell },
        ];

      case 'school_admin':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: GraduationCap },
          { id: 'teachers', label: 'Teachers & Staff', icon: Briefcase },
          { id: 'parents', label: 'Parents', icon: Users },
          { id: 'academics', label: 'Classes & Subjects', icon: BookOpen },
          { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
          { id: 'fees', label: 'Fees & Invoices', icon: CreditCard },
          { id: 'examinations', label: 'Examinations', icon: Award },
          { id: 'timetable', label: 'Timetable', icon: Clock },
          { id: 'homework', label: 'Homework', icon: BookCheck },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'transport', label: 'Transport', icon: Bus },
          { id: 'expenses', label: 'Expenses & Payroll', icon: Receipt },
          { id: 'notices', label: 'Notices & Events', icon: Bell },
          { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
          { id: 'settings', label: 'School Settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Banner */}
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">EduSphere ERP</h1>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Multi-School SaaS
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {role.replace('_', ' ')} Portal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/30'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition ${
                      isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-zinc-800/80 p-3">
          <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-400">Database Status</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>
            <p className="mt-1 text-[10px] text-zinc-400 truncate">
              {currentSchool ? currentSchool.name : 'Multi-Tenant Firestore'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
