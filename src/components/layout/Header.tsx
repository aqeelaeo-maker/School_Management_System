import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import {
  Building2,
  LogOut,
  ShieldAlert,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

interface HeaderProps {
  onOpenAI?: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    userProfile,
    currentSchool,
    availableSchools,
    switchSchool,
    logout,
  } = useAuth();

  const [showSchoolMenu, setShowSchoolMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
    <header
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/15 px-4 backdrop-blur-md lg:px-6 shadow-sm text-white"
      style={{
        background: 'linear-gradient(90deg, #0A2E68 0%, #064E78 35%, #027A8F 70%, #00D2BC 100%)',
      }}
    >
      {/* Left: School Identity / Super Admin Context */}
      <div className="flex items-center gap-3">
        {userProfile?.role === 'super_admin' ? (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-2 ring-white/30 border border-white/20"
              style={{
                background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
              }}
            >
              <ShieldAlert className="h-5 w-5 text-[#00D2BC]" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Super Admin</span>
              <p className="text-[11px] text-white/80">Institutional Administration</p>
            </div>
          </div>
        ) : currentSchool ? (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-2 ring-white/30 border border-white/20"
              style={{
                background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
              }}
            >
              <Building2 className="h-5 w-5 text-[#00D2BC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white line-clamp-1">
                  {currentSchool.name}
                </span>
                <span className="hidden rounded-md bg-white/15 border border-white/25 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:inline-block">
                  {currentSchool.code}
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                Session: <span className="text-white font-semibold">{currentSchool.activeSession}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-2 ring-white/30 border border-white/20"
              style={{
                background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
              }}
            >
              <Building2 className="h-5 w-5 text-[#00D2BC]" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">School System</span>
              <p className="text-[11px] text-white/80">Institutional Portal</p>
            </div>
          </div>
        )}
      </div>

      {/* Right: Change Password & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Direct Change Password Trigger styled with blue-to-turquoise gradient */}
        <button
          id="header-change-password-btn"
          type="button"
          onClick={() => setShowChangePassword(true)}
          title="Change Account Password"
          style={{
            background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
          }}
          className="flex items-center gap-1.5 rounded-xl border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95 transition cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <KeyRound className="h-3.5 w-3.5 text-[#00D2BC]" />
          <span className="hidden sm:inline">Change Password</span>
        </button>

        {/* Profile / Logout Menu */}
        <div className="relative">
          <button
            id="header-user-menu-btn"
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full ring-2 ring-white/40 hover:ring-white p-0.5 transition cursor-pointer"
          >
            {/* User Avatar Box styled with blue-to-turquoise gradient */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shadow-xs border border-white/40"
              style={{
                background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
              }}
            >
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-white/20 bg-[#0A2E68] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-white/15 pb-2.5 px-2 pt-1">
                <p className="text-xs font-bold text-white truncate">{userProfile?.name}</p>
                <p className="text-[11px] text-white/70 truncate">{userProfile?.email}</p>
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-white/90 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5 text-cyan-200" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Change Password</span>
                    <span className="text-[10px] text-white/60">Update security credentials</span>
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Sign Out</span>
                    <span className="text-[10px] text-white/60">End current session</span>
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
