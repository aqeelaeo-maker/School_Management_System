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
} from 'lucide-react';

// Professional Emblem Logo for School Management System
const SchoolSystemLogo: React.FC<{ className?: string }> = ({ className = 'h-16 w-16' }) => (
  <div
    className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 shadow-xl shadow-indigo-500/25 ring-1 ring-white/20 p-2.5 ${className}`}
  >
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      {/* Outer shield crest outline */}
      <path
        d="M24 4L8 10V22C8 32.5 14.8 41.8 24 44C33.2 41.8 40 32.5 40 22V10L24 4Z"
        fill="currentColor"
        className="text-indigo-950/40"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mortarboard / Graduation Cap */}
      <path
        d="M24 13L34 18L24 23L14 18L24 13Z"
        fill="white"
      />
      <path
        d="M17.5 20.8V26C17.5 28.5 20.4 30.5 24 30.5C27.6 30.5 30.5 28.5 30.5 26V20.8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Cap Tassel */}
      <path
        d="M32 19V25C32 25.8 32.7 26.5 33.5 26.5C34.3 26.5 35 25.8 35 25V19.5"
        stroke="#FCD34D"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Open Book pages at bottom */}
      <path
        d="M18 34.5C20.5 33.5 22.5 34 24 35C25.5 34 27.5 33.5 30 34.5"
        stroke="#93C5FD"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Center Star of Academic Excellence */}
      <circle cx="24" cy="27" r="1.5" fill="#FCD34D" />
    </svg>
  </div>
);

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
      // If the school was currently 'super_admin', switch to first registered campus school
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
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Background Subtle Accent Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* On top: Professional Logo & ONLY "School Management System" */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <SchoolSystemLogo className="h-16 w-16" />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            School Management System
          </h1>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Select School (with Super Admin in dropdown) */}
            <div className="space-y-1.5">
              <label htmlFor="school-select" className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                Select School
              </label>
              <div className="relative">
                <select
                  id="school-select"
                  value={selectedSchool}
                  onChange={handleSchoolChange}
                  className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-xs text-white shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="super_admin" className="bg-zinc-900 text-purple-300 font-semibold">
                    Super Admin
                  </option>
                  <optgroup label="Registered Schools" className="bg-zinc-900 text-zinc-300 font-medium">
                    {schoolsList.map((school) => (
                      <option key={school.id} value={school.id} className="bg-zinc-900 text-white">
                        {school.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            {/* Field 2: Role (Admin, Principal, Teacher, Student, Parents) */}
            <div className="space-y-1.5">
              <label htmlFor="role-select" className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-400" />
                  Role
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">
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
                  className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-xs text-white shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  {ROLE_CHOICES.map((r) => (
                    <option key={r.key} value={r.key} className="bg-zinc-900 text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            {/* Field 3: Username */}
            <div className="space-y-1.5">
              <label htmlFor="username-input" className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  Username
                </span>
                <span className="text-[10px] text-zinc-400 font-normal font-mono">
                  Default: {selectedSchool === 'super_admin' ? 'Admin' : currentRoleInfo.defaultUser}
                </span>
              </label>
              <div className="relative">
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedSchool === 'super_admin'
                      ? 'Enter Super Admin username (Admin)'
                      : currentRoleInfo.placeholder
                  }
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Field 4: Password */}
            <div className="space-y-1.5">
              <label htmlFor="password-input" className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-indigo-400" />
                  Password
                </span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  Default: {selectedSchool === 'super_admin' ? 'Admin' : currentRoleInfo.defaultPass}
                </span>
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-zinc-500 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Helper Notice Banner */}
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 px-3 py-2 text-[11px] text-blue-200/90 flex items-start gap-2">
              <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>
                {selectedSchool === 'super_admin' || (selectedRole === 'admin' && username === 'Admin') ? (
                  <>
                    <strong>Super Admin Credentials:</strong> Username <code className="text-white font-mono bg-blue-900/50 px-1 py-0.5 rounded">Admin</code> &bull; Password <code className="text-white font-mono bg-blue-900/50 px-1 py-0.5 rounded">Admin</code>
                  </>
                ) : (
                  <span>{currentRoleInfo.hint}</span>
                )}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
