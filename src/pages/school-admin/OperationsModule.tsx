import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Book, TransportRoute, Expense } from '../../types';
import {
  getBooks,
  createBook,
  getRoutes,
  createRoute,
  getExpenses,
  createExpense,
} from '../../services/operationsService';
import {
  Layers,
  BookOpen,
  Bus,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  MapPin,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const OperationsModule: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [activeTab, setActiveTab] = useState<'library' | 'transport' | 'expenses'>('library');
  const [books, setBooks] = useState<Book[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Forms
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: `ISBN-978-${Math.floor(1000 + Math.random() * 9000)}`,
    category: 'Science & STEM',
    quantity: 10,
    availableCopies: 10,
    shelfLocation: 'Rack B-4',
  });

  const [routeForm, setRouteForm] = useState({
    routeName: 'Route 3 - North Suburbs',
    vehicleNumber: 'BUS-104',
    driverName: 'Robert Vance',
    driverPhone: '+1 (555) 890-1234',
    capacity: 45,
    stops: ['North Station', 'Oakridge Blvd', 'Maple Ave', 'School Campus'],
    monthlyFee: 120,
    status: 'active' as const,
  });

  const [expenseForm, setExpenseForm] = useState({
    title: 'Science Lab Equipment & Glassware',
    category: 'lab' as const,
    amount: 1450,
    date: new Date().toISOString().split('T')[0],
    paidTo: 'Apex Scientific Suppliers',
    paymentMethod: 'bank_transfer' as const,
    approvedBy: 'Dr. Arthur Pendelton',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bList, rList, eList] = await Promise.all([
        getBooks(schoolId),
        getRoutes(schoolId),
        getExpenses(schoolId),
      ]);
      setBooks(bList);
      setRoutes(rList);
      setExpenses(eList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBook(
      schoolId,
      bookForm,
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsBookModalOpen(false);
    await loadData();
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoute(
      schoolId,
      routeForm,
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsRouteModalOpen(false);
    await loadData();
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpense(
      schoolId,
      expenseForm,
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsExpenseModalOpen(false);
    await loadData();
  };

  const totalExpenseSum = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            School Logistics & Operations
          </h1>
          <p className="text-xs text-zinc-400">
            Manage library circulation, campus bus routes, and operational expense ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'library' && (
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Catalog New Book</span>
            </button>
          )}

          {activeTab === 'transport' && (
            <button
              onClick={() => setIsRouteModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-500 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Bus Route</span>
            </button>
          )}

          {activeTab === 'expenses' && (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'library'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Library Management ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transport')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'transport'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bus className="h-4 w-4" />
          <span>Transport & Fleet ({routes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'expenses'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Expenses & Accounts (${totalExpenseSum.toLocaleString()})</span>
        </button>
      </div>

      {/* Tab 1: Library */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                    {book.category}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-zinc-100">{book.title}</h3>
                  <p className="text-xs text-zinc-400">By {book.author}</p>
                </div>
                <div className="text-right font-mono text-[10px] text-zinc-500">
                  {book.isbn}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs">
                <span className="text-zinc-400">
                  Location: <span className="font-semibold text-zinc-200">{book.shelfLocation}</span>
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    book.availableCopies > 0
                      ? 'bg-emerald-950/60 text-emerald-400'
                      : 'bg-rose-950/60 text-rose-400'
                  }`}
                >
                  {book.availableCopies} / {book.quantity} Available
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Transport */}
      {activeTab === 'transport' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {routes.map((route) => (
            <div
              key={route.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{route.routeName}</h3>
                    <span className="font-mono text-xs text-amber-400">{route.vehicleNumber}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">${route.monthlyFee}/mo</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300 border-t border-zinc-800 pt-3">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{route.driverName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{route.driverPhone}</span>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Route Stops & Stations:
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {route.stops?.map((stop, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300"
                    >
                      <MapPin className="h-2.5 w-2.5 text-amber-400" />
                      {stop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Expenses */}
      {activeTab === 'expenses' && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Expense Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Paid Recipient</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-semibold text-zinc-100">{exp.title}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] uppercase font-mono text-zinc-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{exp.paidTo}</td>
                  <td className="px-4 py-3 font-mono text-zinc-400">{exp.date}</td>
                  <td className="px-4 py-3 capitalize text-zinc-400">{exp.paymentMethod.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-400">${exp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Catalog New Library Book</h3>
            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-300">Author Name *</label>
                <input
                  type="text"
                  required
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Category</label>
                  <input
                    type="text"
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Copies (Qty)</label>
                  <input
                    type="number"
                    value={bookForm.quantity}
                    onChange={(e) =>
                      setBookForm({
                        ...bookForm,
                        quantity: Number(e.target.value),
                        availableCopies: Number(e.target.value),
                      })
                    }
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Shelf Location</label>
                <input
                  type="text"
                  value={bookForm.shelfLocation}
                  onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Record Institutional Expense</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="utilities">Utilities & Electricity</option>
                    <option value="lab">Lab & STEM Equipment</option>
                    <option value="maintenance">Campus Maintenance</option>
                    <option value="salary">Faculty & Staff Payroll</option>
                    <option value="events">School Events & Sports</option>
                    <option value="other">General Operational</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 font-bold text-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Paid Recipient / Vendor</label>
                <input
                  type="text"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
