import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  KeyRound,
  Shield,
  Building2,
  Copy,
  Check,
  Search,
  Eye,
  EyeOff,
  Lock,
  User,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface CredentialsManagementProps {
  onNavigateTab?: (tab: string) => void;
}

export const CredentialsManagement: React.FC<CredentialsManagementProps> = ({ onNavigateTab }) => {
  const { availableSchools, switchSchool } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredSchools = availableSchools.filter((school) => {
    const term = searchTerm.toLowerCase();
    return (
      school.name.toLowerCase().includes(term) ||
      (school.emisCode && school.emisCode.toLowerCase().includes(term)) ||
      school.code.toLowerCase().includes(term) ||
      (school.principalName && school.principalName.toLowerCase().includes(term)) ||
      (school.city && school.city.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            {/* Image Box styled with theme blue-to-turquoise gradient */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm border border-white/20"
              style={{
                background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
              }}
            >
              <KeyRound className="h-4 w-4 text-[#00D2BC]" />
            </div>
            Credentials Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional authentication and access credentials for Super Admin and all registered schools
          </p>
        </div>
      </div>

      {/* Notice Banner: EMIS Code Rules */}
      <div className="flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4 shadow-xs">
        {/* Image Box styled with theme blue-to-turquoise gradient */}
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white shadow-xs border border-white/20"
          style={{
            background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
          }}
        >
          <Info className="h-4 w-4 text-[#00D2BC]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#0A2E68]">Institutional Access Protocol</h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-[#0A2E68]">Default usernames for all schools will be their EMIS Codes. Both username and Password will be the EMIS Code.</span> School administrators can log into their isolated tenant portal using their school&apos;s assigned EMIS Code as both credentials.
          </p>
        </div>
      </div>

      {/* Super Admin Credentials Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            {/* Image Box styled with theme blue-to-turquoise gradient */}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm border border-white/20"
              style={{
                background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
              }}
            >
              <Shield className="h-5 w-5 text-[#00D2BC]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Super Admin Master Credentials</h2>
              <p className="text-[11px] text-slate-500">Root system access across all institutional partitions</p>
            </div>
          </div>
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
            ROOT PRIVILEGES
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Username
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard('Admin', 'superadmin_user')}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-[#0A2E68] hover:bg-slate-200 transition cursor-pointer"
              >
                {copiedKey === 'superadmin_user' ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900">Admin</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Password
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('superadmin')}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title="Toggle visibility"
                >
                  {revealedPasswords['superadmin'] ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard('Admin', 'superadmin_pass')}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-[#0A2E68] hover:bg-slate-200 transition cursor-pointer"
                >
                  {copiedKey === 'superadmin_pass' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900">
              {revealedPasswords['superadmin'] ? 'Admin' : '••••••••'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500">Access Scope</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-semibold text-slate-800">Global System Management</span>
              {/* Button styled with theme blue-to-turquoise gradient */}
              <button
                type="button"
                onClick={() => copyToClipboard('Admin / Admin', 'superadmin_all')}
                style={{
                  background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                }}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold text-white hover:opacity-95 transition cursor-pointer shadow-sm border border-white/20 active:scale-[0.99]"
              >
                {copiedKey === 'superadmin_all' ? <Check className="h-3 w-3 text-[#00D2BC]" /> : <Copy className="h-3 w-3" />}
                <span>Copy Both</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* School Credentials Directory Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#064E78]" />
              School Institutional Credentials
            </h2>
            <p className="text-xs text-slate-500">
              EMIS Code credentials for each school tenant ({availableSchools.length} registered schools)
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by school, EMIS, code, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00D2BC] focus:outline-none focus:ring-2 focus:ring-[#00D2BC]/20 shadow-xs"
            />
          </div>
        </div>

        {/* Schools Credentials Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredSchools.map((school) => {
            const emis = school.emisCode || school.code;
            const isRevealed = revealedPasswords[school.id];
            const isCopiedEmis = copiedKey === `school_emis_${school.id}`;
            const isCopiedAll = copiedKey === `school_all_${school.id}`;

            return (
              <div
                key={school.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Image Box styled with theme blue-to-turquoise gradient */}
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-1 ring-white/20"
                        style={{
                          background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                        }}
                      >
                        <Building2 className="h-6 w-6 text-[#00D2BC]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{school.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                            {school.code}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {school.city ? `${school.city}, ${school.state}` : 'Active School'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      ACTIVE
                    </span>
                  </div>

                  {/* Credentials Box */}
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#0A2E68] flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-[#027A8F]" />
                        Official EMIS Code
                      </span>
                      <span className="font-mono font-bold text-[#064E78] bg-white border border-cyan-200 px-2 py-0.5 rounded-md shadow-xs">
                        {school.emisCode || 'Not Assigned'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-100">
                      {/* Default Username */}
                      <div className="rounded-lg bg-white border border-slate-200/80 p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-slate-500">Username</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(emis, `school_emis_${school.id}`)}
                            className="text-[10px] text-[#0A2E68] hover:text-[#00D2BC] font-semibold transition cursor-pointer"
                          >
                            {isCopiedEmis ? <Check className="h-3 w-3 text-emerald-600 inline" /> : <Copy className="h-3 w-3 inline" />}
                          </button>
                        </div>
                        <p className="mt-1 font-mono text-xs font-bold text-slate-900 truncate">
                          {emis}
                        </p>
                      </div>

                      {/* Default Password */}
                      <div className="rounded-lg bg-white border border-slate-200/80 p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-slate-500">Password</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(school.id)}
                              className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            >
                              {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(emis, `school_pass_${school.id}`)}
                              className="text-[10px] text-[#0A2E68] hover:text-[#00D2BC] font-semibold transition cursor-pointer"
                            >
                              {copiedKey === `school_pass_${school.id}` ? (
                                <Check className="h-3 w-3 text-emerald-600 inline" />
                              ) : (
                                <Copy className="h-3 w-3 inline" />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 font-mono text-xs font-bold text-slate-900 truncate">
                          {isRevealed ? emis : '••••••••'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* School Contact Information */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400">Principal:</span>{' '}
                      <span className="font-medium text-slate-800">{school.principalName || 'Not Set'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Contact:</span>{' '}
                      <span className="font-medium text-slate-800">{school.phone || 'N/A'}</span>
                    </div>
                    <div className="col-span-2 truncate">
                      <span className="text-slate-400">Email:</span>{' '}
                      <span className="font-medium text-slate-800">{school.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions with theme blue-to-turquoise gradient buttons */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${emis} / ${emis}`, `school_all_${school.id}`)}
                    style={{
                      background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95 shadow-sm transition cursor-pointer active:scale-[0.99]"
                  >
                    {isCopiedAll ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#00D2BC]" />
                        <span className="text-white font-semibold">Credentials Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[#00D2BC]" />
                        <span>Copy Both (EMIS)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await switchSchool(school.id);
                      if (onNavigateTab) onNavigateTab('dashboard');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
                    }}
                    className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition cursor-pointer border border-white/20 active:scale-[0.99]"
                  >
                    <span>View School</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#00D2BC]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSchools.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-800">No schools matching your search</p>
            <p className="text-xs text-slate-500">Try searching for a different school name or EMIS code.</p>
          </div>
        )}
      </div>
    </div>
  );
};
