import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { ClastEmblem, ClastLogo } from '../../components/common/ClastLogo';
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#FAFAFA] p-4 text-slate-800 antialiased selection:bg-[#063BA1] selection:text-white overflow-hidden">
      {/* Clast.io Signature Ambient Background Gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Soft top gradient orb */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[32rem] w-[52rem] rounded-full bg-gradient-to-tr from-[#063BA1]/8 via-[#029AB2]/8 to-[#00D2BC]/6 blur-3xl" />
        {/* Bottom accent glow */}
        <div className="absolute -bottom-24 right-1/4 h-96 w-96 rounded-full bg-[#635BFF]/5 blur-3xl" />
        {/* Modern subtle tech grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'radial-gradient(#063BA1 1px, transparent 1px), radial-gradient(#063BA1 1px, #FAFAFA 1px)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[440px] space-y-6">
        {/* On top: Clast.io Professional Logo & ONLY "School Management System" */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <ClastEmblem className="h-16 w-16" />

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#063BA1] sm:text-3xl">
              School Management System
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Next-Gen Institutional ERP &amp; Academic Intelligence
            </p>
          </div>
        </div>

        {/* Login Card Styled in Clast.io Theme */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-[0_10px_35px_-4px_rgba(6,59,161,0.08)] backdrop-blur-sm transition-all">
          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-700 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Select School (with Super Admin in dropdown) */}
            <div className="space-y-1.5">
              <label htmlFor="school-select" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Building2 className="h-3.5 w-3.5 text-[#063BA1]" />
                Select School
              </label>
              <div className="relative">
                <select
                  id="school-select"
                  value={selectedSchool}
                  onChange={handleSchoolChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 font-medium transition focus:border-[#063BA1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#063BA1]/10 cursor-pointer shadow-xs"
                >
                  <option value="super_admin" className="font-semibold text-[#063BA1] bg-white">
                    Super Admin
                  </option>
                  <optgroup label="Registered Schools" className="font-medium text-slate-600 bg-white">
                    {schoolsList.map((school) => (
                      <option key={school.id} value={school.id} className="text-slate-800 bg-white">
                        {school.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Field 2: Role (Admin, Principal, Teacher, Student, Parents) */}
            <div className="space-y-1.5">
              <label htmlFor="role-select" className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[#063BA1]" />
                  Role
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
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
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 font-medium transition focus:border-[#063BA1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#063BA1]/10 cursor-pointer shadow-xs"
                >
                  {ROLE_CHOICES.map((r) => (
                    <option key={r.key} value={r.key} className="text-slate-800 bg-white">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Field 3: Username */}
            <div className="space-y-1.5">
              <label htmlFor="username-input" className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#063BA1]" />
                  Username
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-normal">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-medium transition focus:border-[#063BA1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#063BA1]/10 shadow-xs"
                />
              </div>
            </div>

            {/* Field 4: Password */}
            <div className="space-y-1.5">
              <label htmlFor="password-input" className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#063BA1]" />
                  Password
                </span>
                <span className="text-[10px] text-[#063BA1] font-mono font-medium">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 font-medium transition focus:border-[#063BA1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#063BA1]/10 shadow-xs"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Clast.io Signature Credential Notice Banner */}
            <div className="rounded-xl border border-[#CFCCFF] bg-[#EFEFFF]/70 px-3.5 py-2.5 text-[11px] text-[#2A266B] flex items-start gap-2.5 transition">
              <Shield className="h-3.5 w-3.5 text-[#635BFF] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {selectedSchool === 'super_admin' || (selectedRole === 'admin' && username === 'Admin') ? (
                  <span>
                    <strong>Super Admin Credentials:</strong> Username{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-[#CFCCFF] font-mono font-bold text-[#063BA1]">
                      Admin
                    </code>{' '}
                    &bull; Password{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-[#CFCCFF] font-mono font-bold text-[#063BA1]">
                      Admin
                    </code>
                  </span>
                ) : (
                  <span>{currentRoleInfo.hint}</span>
                )}
              </div>
            </div>

            {/* Clast Gradient Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#063BA1] via-[#029AB2] to-[#00D2BC] py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-[#063BA1]/20 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-[#063BA1]/30 focus:outline-none focus:ring-4 focus:ring-[#063BA1]/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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

        {/* Footer Brand Credit & Status */}
        <div className="flex flex-col items-center justify-center space-y-1.5 text-center text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-600">All Systems Operational</span>
            <span>&bull;</span>
            <span>Secure 256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Powered by</span>
            <ClastLogo className="h-3.5 w-auto inline-block opacity-80" />
            <span>Architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
};
