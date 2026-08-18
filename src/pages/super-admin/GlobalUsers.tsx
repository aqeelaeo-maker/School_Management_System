import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { getAllUsers, toggleUserStatus } from '../../services/userService';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';

export const GlobalUsers: React.FC = () => {
  const { availableSchools, userProfile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    if (confirm(`Change status of ${user.name} to ${nextStatus}?`)) {
      await toggleUserStatus(
        user.uid,
        nextStatus,
        {
          id: currentAdmin?.uid || 'super_admin',
          name: currentAdmin?.name || 'Super Admin',
          role: 'super_admin',
          schoolId: user.schoolId || '',
        }
      );
      await loadAllUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSchool = schoolFilter === 'all' || u.schoolId === schoolFilter;
    return matchesSearch && matchesRole && matchesSchool;
  });

  const getSchoolName = (schoolId?: string) => {
    if (!schoolId) return 'Global (System-wide)';
    const sch = availableSchools.find((s) => s.id === schoolId);
    return sch ? sch.name : schoolId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System User Directory</h1>
          <p className="text-xs text-zinc-400">
            Cross-institution user access management, authentication control, and role enforcement
          </p>
        </div>
        <button
          onClick={loadAllUsers}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="school_admin">School Admin</option>
            <option value="principal">Principal</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        <div>
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Schools</option>
            {availableSchools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">User & Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Tenant School</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  No users match your criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-zinc-800/40 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-200 font-semibold">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-100">{user.name}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {user.email}
                          </span>
                          {user.phone && (
                            <span className="hidden sm:flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-200">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="truncate max-w-[200px]">{getSchoolName(user.schoolId)}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        user.status === 'active'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50'
                          : 'bg-rose-950/50 text-rose-400 border-rose-800/50'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      {user.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                        user.status === 'active'
                          ? 'border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50'
                          : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50'
                      }`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
