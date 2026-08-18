import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Notice } from '../../types';
import { getNotices, createNotice } from '../../services/operationsService';
import {
  Bell,
  Plus,
  Calendar,
  User,
  Sparkles,
  Tag,
  AlertCircle,
  X,
  Share2,
} from 'lucide-react';

export const NoticesModule: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    targetAudience: ['all'] as ('all' | 'students' | 'teachers' | 'parents')[],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getNotices(schoolId);
      setNotices(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNotice(
      schoolId,
      {
        ...form,
        publishedBy: userProfile?.name || 'School Principal',
        publishedDate: new Date().toISOString().split('T')[0],
      },
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsModalOpen(false);
    await loadData();
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'emergency':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/50';
      case 'exam':
        return 'bg-purple-950/60 text-purple-400 border-purple-800/50';
      case 'holiday':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/50';
      case 'event':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      default:
        return 'bg-blue-950/60 text-blue-400 border-blue-800/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-400" />
            School Notice Board & Broadcasts
          </h1>
          <p className="text-xs text-zinc-400">
            Publish institutional circulars, holiday announcements, and targeted alerts for students and parents
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Notices Feed */}
      <div className="space-y-3">
        {notices.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase border ${getCategoryColor(
                    n.category
                  )}`}
                >
                  {n.category}
                </span>
                <h3 className="text-sm font-bold text-zinc-100">{n.title}</h3>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-zinc-500" />
                  {n.publishedBy}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3 text-zinc-500" />
                  {n.publishedDate}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
              {n.content}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-[11px]">
              <span className="text-zinc-500">
                Audience: <span className="text-zinc-300 font-medium capitalize">{n.targetAudience?.join(', ')}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Broadcast New Institutional Notice</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Sports Day Schedule & Uniform Directives"
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300">Category Tag</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="general">General Circular</option>
                  <option value="exam">Examination Alert</option>
                  <option value="holiday">Holiday Announcement</option>
                  <option value="event">Event & Competition</option>
                  <option value="emergency">Urgent Advisory</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Notice Content & Details *</label>
                <textarea
                  rows={5}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write notice instructions..."
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
