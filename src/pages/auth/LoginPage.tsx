import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import {
  Building2,
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Check,
  GraduationCap,
} from 'lucide-react';

// Fallback school list in case Firestore is still initializing
const DEFAULT_SCHOOLS = [
  { id: 'sch_beacon_01', name: 'Beacon Hill Academy' },
  { id: 'sch_stjude_02', name: 'St. Jude International School' },
  { id: 'sch_oakridge_03', name: 'Oakridge High School' },
];

type LoginRoleKey = 'admin' | 'principal' | 'teacher' | 'student' | 'parent';

interface RoleChoice {
  key: LoginRoleKey;
  label: string;
  defaultUser: string;
  defaultPass: string;
  placeholder: string;
  hint: string;
}

const ROLE_CHOICES: RoleChoice[] = [
  {
    key: 'admin',
    label: 'Admin',
    defaultUser: 'Admin',
    defaultPass: 'Admin',
    placeholder: 'Enter username (e.g. Admin)',
    hint: 'Credentials for Super Admin: Username Admin, Password Admin',
  },
  {
    key: 'principal',
    label: 'Principal',
    defaultUser: 'principal_arthur',
    defaultPass: 'admin123',
    placeholder: 'Enter username (e.g. principal_arthur)',
    hint: 'Default credentials: Username principal_arthur • Password admin123',
  },
  {
    key: 'teacher',
    label: 'Teacher',
    defaultUser: 'EMP-0104',
    defaultPass: 'EMP-0104',
    placeholder: 'Teacher Registration No. / Employee ID (e.g. EMP-0104)',
    hint: 'Default Username & Password is Teacher Reg. No. (EMP-0104)',
  },
  {
    key: 'student',
    label: 'Student',
    defaultUser: 'BHP-2024-0081',
    defaultPass: 'BHP-2024-0081',
    placeholder: 'Student Admission No. / Reg. No. (e.g. BHP-2024-0081)',
    hint: 'Default Username & Password is Student Reg. No. (BHP-2024-0081)',
  },
  {
    key: 'parent',
    label: 'Parents',
    defaultUser: 'BHP-2024-0081',
    defaultPass: 'BHP-2024-0081',
    placeholder: "Child's Admission No. / Reg. No. (e.g. BHP-2024-0081)",
    hint: "Default login is child's Reg. No. (same as student login)",
  },
];

export const LoginPage: React.FC = () => {
  const {
    availableSchools,
    loginAsSuperAdmin,
    loginAsSchoolUser,
  } = useAuth();

  // Combine available schools with fallback if empty
  const schoolsList = availableSchools.length > 0 ? availableSchools : DEFAULT_SCHOOLS;

  // Selected school or 'super_admin'
  const [selectedSchool, setSelectedSchool] = useState<string>('super_admin');
  const [selectedRole, setSelectedRole] = useState<LoginRoleKey>('admin');
  const [username, setUsername] = useState<string>('Admin');
  const [password, setPassword] = useState<string>('Admin');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync selected school if available
  useEffect(() => {
    if (availableSchools.length > 0 && selectedSchool !== 'super_admin') {
      const exists = availableSchools.some((s) => s.id === selectedSchool);
      if (!exists) {
        setSelectedSchool(availableSchools[0].id);
      }
    }
  }, [availableSchools, selectedSchool]);

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSchool(val);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (val === 'super_admin') {
      setSelectedRole('admin');
      setUsername('Admin');
      setPassword('Admin');
    } else {
      if (selectedRole === 'admin') {
        setUsername('beacon_admin');
        setPassword('admin123');
      }
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleKey = e.target.value as LoginRoleKey;
    setSelectedRole(roleKey);
    setErrorMessage(null);
    setSuccessMessage(null);

    const roleInfo = ROLE_CHOICES.find((r) => r.key === roleKey);
    if (!roleInfo) return;

    if (roleKey === 'admin') {
      if (selectedSchool === 'super_admin') {
        setUsername('Admin');
        setPassword('Admin');
      } else {
        setUsername('beacon_admin');
        setPassword('admin123');
      }
    } else {
      // For Principal, Teacher, Student, Parents:
      // If school was 'super_admin', switch to first registered campus school
      if (selectedSchool === 'super_admin') {
        const firstSchool = schoolsList.find((s) => s.id !== 'super_admin')?.id || 'sch_beacon_01';
        setSelectedSchool(firstSchool);
      }
      setUsername(roleInfo.defaultUser);
      setPassword(roleInfo.defaultPass);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isSuperAdminCredential =
        cleanUsername.toLowerCase() === 'admin' &&
        (cleanPassword === 'Admin' || cleanPassword.toLowerCase() === 'admin');

      if (selectedSchool === 'super_admin' || (selectedRole === 'admin' && isSuperAdminCredential)) {
        const res = await loginAsSuperAdmin(cleanUsername, cleanPassword);
        if (!res.success) {
          setErrorMessage(res.error || 'Authentication failed. Please verify Super Admin credentials.');
        } else {
          setSuccessMessage('Super Admin authenticated successfully. Entering dashboard...');
        }
      } else {
        const targetSchoolId = selectedSchool || schoolsList[0].id;
        const expectedUserRole: UserRole =
          selectedRole === 'admin'
            ? 'school_admin'
            : selectedRole === 'principal'
            ? 'principal'
            : selectedRole === 'teacher'
            ? 'teacher'
            : selectedRole === 'student'
            ? 'student'
            : 'parent';

        const res = await loginAsSchoolUser(targetSchoolId, cleanUsername, cleanPassword, expectedUserRole);
        if (!res.success) {
          // If school user login failed, but user entered Super Admin credentials
          if (isSuperAdminCredential) {
            const superRes = await loginAsSuperAdmin(cleanUsername, cleanPassword);
            if (superRes.success) {
              setSuccessMessage('Super Admin authenticated successfully. Entering dashboard...');
              return;
            }
          }
          setErrorMessage(res.error || 'Authentication failed. Please check school and credentials.');
        } else {
          const roleLabel = ROLE_CHOICES.find((r) => r.key === selectedRole)?.label || 'User';
          setSuccessMessage(`Authenticated successfully as ${roleLabel}. Redirecting to your portal...`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRoleInfo = ROLE_CHOICES.find((r) => r.key === selectedRole) || ROLE_CHOICES[0];

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 antialiased selection:bg-[#00D2BC] selection:text-[#0A2E68] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 35%, #027A8F 70%, #00D2BC 100%)',
      }}
    >
      {/* Blue-to-Turquoise Ambient Lighting Mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Top-left deep royal blue aura */}
        <div className="absolute -top-36 -left-24 h-[36rem] w-[36rem] rounded-full bg-[#0A3997]/30 blur-[110px]" />
        {/* Bottom-right radiant turquoise aura */}
        <div className="absolute -bottom-32 -right-20 h-[38rem] w-[38rem] rounded-full bg-[#00D2BC]/35 blur-[110px]" />
        {/* Center azure transition aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-[#0284A6]/20 blur-[120px]" />
        {/* Subtle geometric dot matrix */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(#FFFFFF 1px, transparent 1px), radial-gradient(#00D2BC 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            backgroundPosition: '0 0, 14px 14px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[430px] space-y-3.5">
        {/* On top: Professional Logo & ONLY "School Management System" in Ash White */}
        <div className="flex flex-col items-center justify-center text-center space-y-2.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.12] text-[#F4F6F8] shadow-xl shadow-black/10 ring-2 ring-white/30 backdrop-blur-md">
            <GraduationCap className="h-8 w-8 text-[#F4F6F8] drop-shadow-sm" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F4F6F8] sm:text-3xl drop-shadow-md">
              School Management System
            </h1>
          </div>
        </div>

        {/* Login Glassmorphic Card */}
        <div className="rounded-2xl border border-white/20 bg-white/[0.10] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all">
          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-300/40 bg-rose-950/40 p-3 text-xs text-rose-200 animate-in fade-in duration-200 backdrop-blur-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-300 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-300/40 bg-emerald-950/40 p-3 text-xs text-emerald-200 animate-in fade-in duration-200 backdrop-blur-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Field 1: Select School (Credentials in Ash White) */}
            <div className="space-y-1.5">
              <label htmlFor="school-select" className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#E2E8F0]">
                <Building2 className="h-3.5 w-3.5 text-[#F4F6F8]" />
                Select School
              </label>
              <div className="relative">
                <select
                  id="school-select"
                  value={selectedSchool}
                  onChange={handleSchoolChange}
                  className="w-full appearance-none rounded-xl border border-white/40 bg-[#F4F6F8] hover:bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium transition focus:border-[#00D2BC] focus:bg-white focus:outline-none focus:ring-4 focus:ring-white/20 cursor-pointer shadow-sm"
                >
                  <option value="super_admin" className="font-semibold text-slate-900 bg-white">
                    Super Admin
                  </option>
                  <optgroup label="Registered Schools" className="font-medium text-slate-700 bg-white">
                    {schoolsList.map((school) => (
                      <option key={school.id} value={school.id} className="text-slate-900 bg-white">
                        {school.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {/* Field 2: Role (Credentials in Ash White) */}
            <div className="space-y-1.5">
              <label htmlFor="role-select" className="flex items-center justify-between text-xs font-semibold tracking-wide text-[#E2E8F0]">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[#F4F6F8]" />
                  Role
                </span>
                <span className="text-[10px] text-[#CBD5E1] font-medium">
                  {selectedRole === 'admin' && selectedSchool === 'super_admin'
                    ? 'Super Admin Access'
                    : selectedRole === 'admin'
                    ? 'School Administrator'
                    : `${currentRoleInfo.label} Portal`}
                </span>
              </label>
              <div className="relative">
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full appearance-none rounded-xl border border-white/40 bg-[#F4F6F8] hover:bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium transition focus:border-[#00D2BC] focus:bg-white focus:outline-none focus:ring-4 focus:ring-white/20 cursor-pointer shadow-sm"
                >
                  {ROLE_CHOICES.map((r) => (
                    <option key={r.key} value={r.key} className="text-slate-900 bg-white">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {/* Field 3: Username (Credentials in Ash White) */}
            <div className="space-y-1.5">
              <label htmlFor="username-input" className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#E2E8F0]">
                <User className="h-3.5 w-3.5 text-[#F4F6F8]" />
                Username
              </label>
              <div className="relative">
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full rounded-xl border border-white/40 bg-[#F4F6F8] hover:bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-500 font-medium transition focus:border-[#00D2BC] focus:bg-white focus:outline-none focus:ring-4 focus:ring-white/20 shadow-sm"
                />
              </div>
            </div>

            {/* Field 4: Password (Credentials in Ash White) */}
            <div className="space-y-1.5">
              <label htmlFor="password-input" className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#E2E8F0]">
                <Lock className="h-3.5 w-3.5 text-[#F4F6F8]" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full rounded-xl border border-white/40 bg-[#F4F6F8] hover:bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-500 font-medium transition focus:border-[#00D2BC] focus:bg-white focus:outline-none focus:ring-4 focus:ring-white/20 shadow-sm"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button in Ash White */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F4F6F8] hover:bg-white py-2.5 px-4 text-xs font-bold text-[#0A2E68] shadow-lg shadow-black/15 transition-all focus:outline-none focus:ring-4 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A2E68] border-t-transparent" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to School System</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer: Operational Status & Powered By NEXORA in Ash White */}
        <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
          <div className="flex items-center gap-1.5 text-[11px] text-[#E2E8F0] font-medium drop-shadow-xs">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#00D2BC] animate-pulse shadow-[0_0_8px_#00D2BC]" />
            <span>All Systems Operational</span>
            <span className="text-[#CBD5E1]/60">&bull;</span>
            <span>Secure 256-bit Encryption</span>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.08] px-3 py-1 shadow-xs border border-white/20 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-[#F4F6F8] tracking-wide">
              Powered By
            </span>
            <img
              src="/assets/aistudio/NEXORA_Technologies_Logo_290384d8.png"
              alt="NEXORA Technologies"
              style={{ filter: 'brightness(0) invert(0.96) drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
              className="h-6 sm:h-6.5 w-auto max-w-[170px] object-contain transition-transform hover:scale-105 duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
