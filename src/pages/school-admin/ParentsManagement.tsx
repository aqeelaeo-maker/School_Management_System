import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Parent, Student } from '../../types';
import { getParents } from '../../services/operationsService';
import { getStudents } from '../../services/studentService';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Home,
  MessageCircle,
} from 'lucide-react';

export const ParentsManagement: React.FC = () => {
  const { currentSchool } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pList, sList] = await Promise.all([
          getParents(schoolId),
          getStudents(schoolId),
        ]);
        setParents(pList);
        setStudents(sList);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [schoolId]);

  const getChildInfo = (studentId: string) => {
    return students.find((s) => s.id === studentId);
  };

  const filteredParents = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            Parents & Guardians Directory
          </h1>
          <p className="text-xs text-zinc-400">
            Multi-child household links, contact registries, and automated parent communication channels
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by parent name, child name, phone number, or occupation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-8 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredParents.map((parent) => (
          <div
            key={parent.id}
            className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-bold text-lg">
                    {parent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{parent.name}</h3>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-zinc-500" />
                      {parent.occupation || 'Guardian'}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/50">
                  {parent.studentIds.length} Child{parent.studentIds.length > 1 ? 'ren' : ''}
                </span>
              </div>

              {/* Contact Info */}
              <div className="mt-4 space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-zinc-200 font-medium">{parent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate">{parent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Home className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate">{parent.address}</span>
                </div>
              </div>

              {/* Linked Children / Students */}
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Enrolled Wards / Children:
                </span>
                <div className="mt-2 space-y-1.5">
                  {parent.studentIds.map((stdId) => {
                    const child = getChildInfo(stdId);
                    return (
                      <div
                        key={stdId}
                        className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-2.5 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                          <div>
                            <span className="text-xs font-semibold text-zinc-200">
                              {child ? child.name : `Student (${stdId})`}
                            </span>
                            <span className="ml-2 text-[10px] text-zinc-500">
                              {child ? `${child.className} - ${child.sectionName}` : ''}
                            </span>
                          </div>
                        </div>
                        {child && (
                          <span className="font-mono text-[10px] text-zinc-400">
                            {child.rollNo}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-800 pt-3">
              <a
                href={`tel:${parent.phone}`}
                className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:text-white"
              >
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </a>
              <a
                href={`mailto:${parent.email}`}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <MessageCircle className="h-3 w-3" />
                <span>Message</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
