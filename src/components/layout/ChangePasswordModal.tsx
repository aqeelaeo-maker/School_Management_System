import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate password strength
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-zinc-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (cleanNew.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMessage('New passwords do not match. Please re-confirm.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await changePassword(cleanNew, cleanCurrent || undefined);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update password.');
      } else {
        setSuccessMessage('Password updated successfully! Your account credentials have been updated.');
        setTimeout(() => {
          handleClose();
        }, 1800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="change-password-modal"
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 ring-1 ring-white/20">
              <KeyRound className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Change Password</h3>
              <p className="text-[11px] text-zinc-400">
                {userProfile ? `${userProfile.name} • ${userProfile.role.replace('_', ' ').toUpperCase()}` : 'Account Security'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Action Required</p>
                <p className="text-[11px] text-red-200/90 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-800/50 bg-emerald-950/40 p-3 text-xs text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-300">Password Changed!</p>
                <p className="text-[11px] text-emerald-200/90 mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Current Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                Current Password
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Demo: admin123</span>
            </div>
            <div className="relative">
              <input
                id="current-password-input"
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter existing password"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <KeyRound className="h-3.5 w-3.5 text-blue-400" />
              New Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="new-password-input"
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-400">Strength:</span>
                  <span
                    className={`font-semibold ${
                      strength.score === 1
                        ? 'text-red-400'
                        : strength.score === 2
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 h-1.5">
                  <div
                    className={`rounded-full transition-all ${
                      strength.score >= 1 ? strength.color : 'bg-zinc-800'
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all ${
                      strength.score >= 2 ? strength.color : 'bg-zinc-800'
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all ${
                      strength.score >= 3 ? strength.color : 'bg-zinc-800'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Confirm New Password <span className="text-rose-400">*</span>
              </span>
              {confirmPassword.length > 0 && (
                <span
                  className={`text-[10px] font-medium ${
                    passwordsMatch ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {passwordsMatch ? '✓ Passwords Match' : '✗ Does Not Match'}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="confirm-password-input"
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className={`w-full rounded-xl border bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 shadow-inner transition focus:outline-none focus:ring-1 pr-10 ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-emerald-500/70 focus:border-emerald-500 focus:ring-emerald-500'
                      : 'border-red-500/70 focus:border-red-500 focus:ring-red-500'
                    : 'border-zinc-700 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-password-button"
              disabled={isSubmitting || !newPassword || !passwordsMatch}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
