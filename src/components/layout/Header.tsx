import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import {
  Sparkles,
  Search,
  Bell,
  Building2,
  UserCheck,
  LogOut,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Users,
  ChevronDown,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

interface HeaderProps {
  onOpenAI: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAI,
  onOpenSearch,
}) => {
  const {
    userProfile,
    currentSchool,
    availableSchools,
    switchSchool,
    quickLoginAsRole,
    logout,
    seedData,
    loading,
  } = useAuth();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSchoolMenu, setShowSchoolMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedData();
      alert(res.message);
    } catch (e: any) {
      alert(e.message || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'school_admin':
        return { label: 'School Admin', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'principal':
        return { label: 'Principal', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'teacher':
        return { label: 'Teacher', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'student':
        return { label: 'Student', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'parent':
        return { label: 'Parent', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = userProfile ? getRoleBadge(userProfile.role) : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-black/95 px-4 backdrop-blur-md lg:px-6 shadow-sm text-white">
      {/* Left: School Identity / Super Admin Context */}
      <div className="flex items-center gap-3">
        {currentSchool ? (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-2 ring-zinc-700"
              style={{ backgroundColor: currentSchool.branding?.primaryColor || '#063BA1' }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white line-clamp-1">
                  {currentSchool.name}
                </span>
                <span className="hidden rounded-md bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300 sm:inline-block">
                  {currentSchool.code}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Session: <span className="text-zinc-200 font-semibold">{currentSchool.activeSession}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#063BA1] font-bold text-white shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Super Admin Global View</span>
              <p className="text-[11px] text-zinc-400">Multi-School Management</p>
            </div>
          </div>
        )}

        {/* Super Admin Switch School Dropdown */}
        {userProfile?.role === 'super_admin' && availableSchools.length > 1 && (
          <div className="relative ml-2">
            <button
              onClick={() => setShowSchoolMenu(!showSchoolMenu)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition shadow-xs cursor-pointer"
            >
              <span>Switch School</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {showSchoolMenu && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Switch Active Tenant
                </div>
                {availableSchools.map((sch) => (
                  <button
                    key={sch.id}
                    onClick={() => {
                      switchSchool(sch.id);
                      setShowSchoolMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition cursor-pointer ${
                      currentSchool?.id === sch.id
                        ? 'bg-[#063BA1]/30 text-cyan-300 font-semibold border border-cyan-500/20'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{sch.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{sch.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, AI Copilot, Role Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gemini AI Copilot Trigger */}
        <button
          onClick={onOpenAI}
          className="group relative flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/80 to-purple-950/80 px-3 py-1.5 text-xs font-semibold text-indigo-200 shadow-xs transition hover:border-indigo-400 hover:text-white cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
          <span className="rounded bg-indigo-900/60 px-1 py-0.2 text-[10px] text-indigo-300 font-mono border border-indigo-500/30">
            Gemini
          </span>
        </button>

        {/* Quick Role Switcher Simulator for Evaluation */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition shadow-xs cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden md:inline text-zinc-400">Role:</span>
            <span className="font-semibold text-white">{roleInfo?.label || 'Select'}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                Switch Role Persona
              </div>
              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    quickLoginAsRole('super_admin');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-purple-400 hover:bg-purple-950/40 transition cursor-pointer"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span className="font-medium">Super Admin (Global)</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('school_admin');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-blue-400 hover:bg-blue-950/40 transition cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="font-medium">School Admin</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('principal');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-emerald-400 hover:bg-emerald-950/40 transition cursor-pointer"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="font-medium">Principal</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('teacher');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-amber-400 hover:bg-amber-950/40 transition cursor-pointer"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="font-medium">Teacher</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('student');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-cyan-400 hover:bg-cyan-950/40 transition cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">Student</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('parent');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">Parent</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Direct Change Password Trigger */}
        <button
          id="header-change-password-btn"
          type="button"
          onClick={() => setShowChangePassword(true)}
          title="Change Account Password"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white hover:bg-zinc-800 transition cursor-pointer shadow-xs"
        >
          <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Change Password</span>
        </button>

        {/* Database Re-seed Helper Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          title="Reset & Seed Sample School Data"
          className="hidden lg:flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-700 hover:text-white hover:bg-zinc-800 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${seeding ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="text-[11px]">Re-Seed</span>
        </button>

        {/* Profile / Logout Menu */}
        <div className="relative">
          <button
            id="header-user-menu-btn"
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full ring-2 ring-zinc-700 hover:ring-zinc-500 p-0.5 transition cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#063BA1] to-[#029AB2] text-xs font-bold text-white shadow-xs">
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-zinc-800 pb-2.5 px-2 pt-1">
                <p className="text-xs font-bold text-white truncate">{userProfile?.name}</p>
                <p className="text-[11px] text-zinc-400 truncate">{userProfile?.email}</p>
                {roleInfo && (
                  <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                )}
              </div>

              <div className="py-1 space-y-0.5">
                {/* Change Password Option */}
                <button
                  id="menu-change-password-item"
                  type="button"
                  onClick={() => {
                    setShowChangePassword(true);
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Change Password</span>
                    <span className="text-[10px] text-zinc-500">Update security credentials</span>
                  </div>
                </button>

                {/* Sign Out Option */}
                <button
                  id="menu-sign-out-item"
                  type="button"
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Sign Out</span>
                    <span className="text-[10px] text-zinc-500">End current session</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </header>
  );
};
