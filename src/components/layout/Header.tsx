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
  PanelRight,
} from 'lucide-react';

interface HeaderProps {
  onOpenAI: () => void;
  onOpenSearch?: () => void;
  onToggleRightPanel?: () => void;
  rightPanelOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAI,
  onOpenSearch,
  onToggleRightPanel,
  rightPanelOpen,
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
        return { label: 'Super Admin', bg: 'bg-purple-900/40 text-purple-300 border-purple-700/50' };
      case 'school_admin':
        return { label: 'School Admin', bg: 'bg-blue-900/40 text-blue-300 border-blue-700/50' };
      case 'principal':
        return { label: 'Principal', bg: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' };
      case 'teacher':
        return { label: 'Teacher', bg: 'bg-amber-900/40 text-amber-300 border-amber-700/50' };
      case 'student':
        return { label: 'Student', bg: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50' };
      case 'parent':
        return { label: 'Parent', bg: 'bg-rose-900/40 text-rose-300 border-rose-700/50' };
      default:
        return { label: role, bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const roleInfo = userProfile ? getRoleBadge(userProfile.role) : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur-md lg:px-6">
      {/* Left: School Identity / Super Admin Context */}
      <div className="flex items-center gap-3">
        {currentSchool ? (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: currentSchool.branding?.primaryColor || '#1e3a8a' }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100 line-clamp-1">
                  {currentSchool.name}
                </span>
                <span className="hidden rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 sm:inline-block">
                  {currentSchool.code}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Session: <span className="text-zinc-200">{currentSchool.activeSession}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-zinc-100">Super Admin Global View</span>
              <p className="text-[11px] text-zinc-400">Multi-School Management</p>
            </div>
          </div>
        )}

        {/* Super Admin Switch School Dropdown */}
        {userProfile?.role === 'super_admin' && availableSchools.length > 1 && (
          <div className="relative ml-2">
            <button
              onClick={() => setShowSchoolMenu(!showSchoolMenu)}
              className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
            >
              <span>Switch School</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {showSchoolMenu && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl ring-1 ring-black/50 z-50">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Switch Active Tenant
                </div>
                {availableSchools.map((sch) => (
                  <button
                    key={sch.id}
                    onClick={() => {
                      switchSchool(sch.id);
                      setShowSchoolMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition ${
                      currentSchool?.id === sch.id
                        ? 'bg-blue-600/20 text-blue-300 font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{sch.name}</span>
                    <span className="text-[10px] text-zinc-400">{sch.code}</span>
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
          className="group relative flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-gradient-to-r from-indigo-950/80 to-purple-950/80 px-3 py-1.5 text-xs font-medium text-indigo-200 shadow-sm transition hover:border-indigo-400 hover:from-indigo-900 hover:to-purple-900 hover:text-white"
        >
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
          <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[10px] text-indigo-300 font-mono">
            Gemini
          </span>
        </button>

        {/* Quick Role Switcher Simulator for Evaluation */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
          >
            <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden md:inline text-zinc-400">Role:</span>
            <span className="font-semibold">{roleInfo?.label || 'Select'}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-56 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-2xl z-50">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                Switch Role Persona
              </div>
              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    quickLoginAsRole('super_admin');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-purple-300 hover:bg-purple-950/50"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Super Admin (Global)</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('school_admin');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-blue-300 hover:bg-blue-950/50"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>School Admin</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('principal');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-emerald-300 hover:bg-emerald-950/50"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Principal</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('teacher');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-amber-300 hover:bg-amber-950/50"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Teacher</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('student');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-cyan-300 hover:bg-cyan-950/50"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Student</span>
                </button>
                <button
                  onClick={() => {
                    quickLoginAsRole('parent');
                    setShowRoleMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-rose-300 hover:bg-rose-950/50"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Parent</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Database Re-seed Helper Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          title="Reset & Seed Sample School Data"
          className="hidden sm:flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${seeding ? 'animate-spin text-blue-400' : ''}`} />
          <span className="text-[11px]">Re-Seed</span>
        </button>

        {/* Toggle Right Operations Panel */}
        {onToggleRightPanel && (
          <button
            onClick={onToggleRightPanel}
            title={rightPanelOpen ? 'Hide Right Panel' : 'Show Right Panel'}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition ${
              rightPanelOpen
                ? 'border-zinc-400 bg-[#F5F5F5] text-zinc-900 shadow-sm font-semibold'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            <PanelRight className="h-4 w-4" />
            <span className="hidden lg:inline text-[11px]">Panel</span>
          </button>
        )}

        {/* Profile / Logout Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full ring-1 ring-zinc-700 p-0.5 hover:ring-zinc-500"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-56 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-2xl z-50">
              <div className="border-b border-zinc-800 pb-2 px-1">
                <p className="text-xs font-semibold text-zinc-100 truncate">{userProfile?.name}</p>
                <p className="text-[11px] text-zinc-400 truncate">{userProfile?.email}</p>
                {roleInfo && (
                  <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="mt-2 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
