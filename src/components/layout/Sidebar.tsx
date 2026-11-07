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
  LogOut,
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
  const { userProfile, currentSchool, logout } = useAuth();
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800/90 bg-black text-zinc-100 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Banner */}
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800/90 bg-black px-4">
          <img
            src="/assets/aistudio/NEXORA_Technologies_Logo_290384d8.png"
            alt="NEXORA"
            className="h-7 w-auto max-w-[80px] object-contain shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-xs font-bold tracking-tight text-white truncate">School Management</h1>
            <p className="text-[10px] tracking-wider text-cyan-400 font-semibold truncate">
              NEXORA Technologies
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar bg-black">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
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
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#063BA1] via-[#029AB2] to-[#00D2BC] text-white font-semibold shadow-md border border-cyan-500/20'
                    : 'text-zinc-400 hover:bg-zinc-900/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-md border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="border-t border-zinc-800/90 bg-black p-3 space-y-2">
          <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-400">Database Status</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>
            <p className="mt-1 text-[10px] text-zinc-300 font-medium truncate">
              {currentSchool ? currentSchool.name : 'Multi-Tenant Firestore'}
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-semibold text-zinc-200 hover:border-rose-900/60 hover:bg-rose-950/40 hover:text-rose-300 transition shadow-xs cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out / Switch</span>
          </button>
        </div>
      </aside>
    </>
  );
};
