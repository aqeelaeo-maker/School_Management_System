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
  KeyRound,
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
          { id: 'credentials', label: 'credentials', icon: KeyRound },
          { id: 'schools', label: 'Schools', icon: Building2 },
          { id: 'settings', label: 'Settings', icon: Settings },
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-white/15 text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
        }}
      >
        {/* Brand Banner */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/15 bg-black/15 px-3.5">
          {/* Logo Image Box styled with theme blue-to-turquoise gradient */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-1 shadow-md border border-white/30"
            style={{
              background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
            }}
          >
            <img
              src="/assets/aistudio/NEXORA_Technologies_Logo_290384d8.png"
              alt="Logo"
              style={{ filter: 'brightness(0) invert(0.96) drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xs font-bold tracking-tight text-[#F4F6F8] leading-tight">
              School Management System
            </h1>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4 custom-scrollbar">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
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
                style={
                  isActive
                    ? {
                        background:
                          'linear-gradient(90deg, rgba(10, 46, 104, 0.75) 0%, rgba(2, 122, 143, 0.75) 60%, rgba(0, 210, 188, 0.75) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                      }
                    : undefined
                }
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'text-white font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition ${
                      isActive ? 'text-[#00D2BC]' : 'text-white/70 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-md border border-white/30 bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="border-t border-white/15 bg-black/10 p-3 space-y-2">
          <div className="rounded-xl bg-white/10 p-2.5 border border-white/15 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-white/70">Database Status</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>
            <p className="mt-1 text-[10px] text-white font-medium truncate">
              {currentSchool ? currentSchool.name : 'Multi-Tenant Firestore'}
            </p>
          </div>

          {/* Sign Out Button according to theme blue-to-turquoise gradient */}
          <button
            onClick={() => logout()}
            style={{
              background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 py-2 px-3 text-xs font-semibold text-white hover:opacity-90 transition shadow-sm cursor-pointer active:scale-[0.99]"
          >
            <LogOut className="h-3.5 w-3.5 text-[#00D2BC]" />
            <span>Sign Out / Switch</span>
          </button>
        </div>
      </aside>
    </>
  );
};
