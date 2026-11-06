import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Building2,
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

export const LoginPage: React.FC = () => {
  const {
    availableSchools,
    loginAsSuperAdmin,
    loginAsSchoolUser,
  } = useAuth();

  // Combine available schools with fallback if empty
  const schoolsList = availableSchools.length > 0 ? availableSchools : DEFAULT_SCHOOLS;

  // Selected school or 'super_admin'
  const [selectedSchool, setSelectedSchool] = useState<string>('sch_beacon_01');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync selected school once availableSchools loads
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
      if (selectedSchool === 'super_admin') {
        const res = await loginAsSuperAdmin(cleanUsername, cleanPassword);
        if (!res.success) {
          setErrorMessage(res.error || 'Authentication failed. Please verify Super Admin credentials.');
        } else {
          setSuccessMessage('Super Admin authenticated successfully. Entering dashboard...');
        }
      } else {
        const targetSchoolId = selectedSchool || schoolsList[0].id;
        const res = await loginAsSchoolUser(targetSchoolId, cleanUsername, cleanPassword);
        if (!res.success) {
          setErrorMessage(res.error || 'Authentication failed. Please check school and credentials.');
        } else {
          setSuccessMessage('Authenticated successfully. Redirecting to your portal...');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {/* Field: Select School (with Super Admin in dropdown) */}
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

            {/* Field: Username */}
            <div className="space-y-1.5">
              <label htmlFor="username-input" className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                Username
              </label>
              <div className="relative">
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedSchool === 'super_admin'
                      ? 'Enter Super Admin username'
                      : 'Enter username or registration number'
                  }
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <label htmlFor="password-input" className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
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
