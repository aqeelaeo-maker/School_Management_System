import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuditLog } from '../../types';
import { getAuditLogs } from '../../services/auditService';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Building2,
  FileCode,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { availableSchools } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(schoolFilter === 'all' ? undefined : schoolFilter, 100);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [schoolFilter]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADMIT') || action.includes('ADD')) {
      return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
    }
    if (action.includes('UPDATE') || action.includes('CHANGE') || action.includes('MARK')) {
      return 'bg-blue-950/60 text-blue-400 border-blue-800/50';
    }
    if (action.includes('DELETE') || action.includes('REMOVE')) {
      return 'bg-rose-950/60 text-rose-400 border-rose-800/50';
    }
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  const getSchoolCode = (schoolId?: string) => {
    if (!schoolId || schoolId === 'global') return 'GLOBAL';
    const s = availableSchools.find((sch) => sch.id === schoolId);
    return s ? s.code : schoolId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-400" />
            Immutable System Audit Logs
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time chronological trace of institutional security events, admissions, results, and fee transactions
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Trace</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All School Tenants</option>
            {availableSchools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="Schools">Schools</option>
            <option value="Students">Students</option>
            <option value="Teachers">Teachers</option>
            <option value="Attendance">Attendance</option>
            <option value="Fees">Fees</option>
            <option value="Examinations">Examinations</option>
            <option value="Users">Users</option>
          </select>
        </div>
      </div>

      {/* Logs timeline list */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-xs text-zinc-500">
            No audit records found matching the active filters.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 hover:border-zinc-700 transition sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                  <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold border ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                      {log.module}
                    </span>
                    <span className="text-xs font-medium text-zinc-200">{log.details}</span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <User className="h-3 w-3 text-zinc-500" />
                      {log.userName} ({log.role.replace('_', ' ')})
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-zinc-500" />
                      Tenant: <span className="font-semibold text-zinc-300">{getSchoolCode(log.schoolId)}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 shrink-0">
                <Clock className="h-3 w-3" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
