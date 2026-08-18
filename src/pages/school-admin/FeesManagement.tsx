import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FeeInvoice, FeeStructure, ClassGroup, Student } from '../../types';
import {
  getInvoices,
  getFeeStructures,
  createInvoice,
  recordPayment,
  createFeeStructure,
} from '../../services/feeService';
import { getClasses } from '../../services/academicService';
import { getStudents } from '../../services/studentService';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  X,
  FileText,
  Building2,
  RefreshCw,
} from 'lucide-react';

export const FeesManagement: React.FC = () => {
  const { currentSchool, userProfile } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [activeTab, setActiveTab] = useState<'invoices' | 'structures' | 'defaulters'>('invoices');
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<FeeInvoice | null>(null);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<FeeInvoice | null>(null);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    studentId: '',
    classId: '',
    title: 'Monthly Tuition Fee',
    month: 'October 2026',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '2026-10-10',
    amount: 450,
    lateFine: 25,
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'bank_transfer' as const,
    transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: 'Paid at counter',
  });

  const [structureForm, setStructureForm] = useState({
    name: 'Tuition Fee - Senior School',
    classId: '',
    className: 'Grade 8',
    frequency: 'monthly' as const,
    amount: 450,
    breakdown: [
      { head: 'Tuition', amount: 350 },
      { head: 'Lab & STEM Access', amount: 60 },
      { head: 'Library & Sports', amount: 40 },
    ],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [invList, structList, clsList, stdList] = await Promise.all([
        getInvoices(schoolId),
        getFeeStructures(schoolId),
        getClasses(schoolId),
        getStudents(schoolId),
      ]);
      setInvoices(invList);
      setStructures(structList);
      setClasses(clsList);
      setStudents(stdList);

      if (stdList.length > 0) {
        setInvoiceForm((prev) => ({
          ...prev,
          studentId: stdList[0].id,
          classId: stdList[0].classId,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find((s) => s.id === invoiceForm.studentId);
    if (!std) return;

    await createInvoice(
      schoolId,
      {
        invoiceNumber: invoiceForm.invoiceNumber,
        studentId: std.id,
        studentName: std.name,
        rollNo: std.rollNo,
        classId: std.classId,
        className: std.className,
        title: invoiceForm.title,
        month: invoiceForm.month,
        issueDate: invoiceForm.issueDate,
        dueDate: invoiceForm.dueDate,
        items: [
          { head: 'Tuition Fee', amount: invoiceForm.amount },
          { head: 'Campus Technology', amount: 30 },
        ],
        totalAmount: invoiceForm.amount + 30,
        paidAmount: 0,
        balance: invoiceForm.amount + 30,
        lateFine: invoiceForm.lateFine,
        status: 'pending',
      },
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsInvoiceModalOpen(false);
    await loadData();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPay) return;

    await recordPayment(
      schoolId,
      selectedInvoiceForPay.id,
      paymentForm.amount,
      paymentForm.paymentMethod,
      paymentForm.transactionRef,
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsPaymentModalOpen(false);
    setSelectedInvoiceForPay(null);
    await loadData();
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFeeStructure(
      schoolId,
      {
        ...structureForm,
        sessionId: currentSchool?.activeSession || '2026-2027',
      },
      { id: userProfile?.uid || 'admin', name: userProfile?.name || 'Admin', role: 'school_admin' }
    );
    setIsStructureModalOpen(false);
    await loadData();
  };

  // Metrics
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const totalPending = invoices.reduce((acc, i) => acc + (i.balance || 0), 0);
  const defaulters = invoices.filter((i) => i.status === 'overdue' || (i.status === 'pending' && new Date(i.dueDate) < new Date()));

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            Fee Management & Accounts Ledger
          </h1>
          <p className="text-xs text-zinc-400">
            Generate monthly challans, record payments, manage fee structures, and monitor defaulters
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'invoices' && (
            <button
              onClick={() => {
                setInvoiceForm((prev) => ({
                  ...prev,
                  invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                }));
                setIsInvoiceModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Generate Fee Invoice</span>
            </button>
          )}

          {activeTab === 'structures' && (
            <button
              onClick={() => setIsStructureModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Fee Structure</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Invoiced Billing</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-white mt-1.5">${totalInvoiced.toLocaleString()}</p>
          <span className="text-[10px] text-zinc-400">This Academic Term</span>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium">
            <span>Collected Revenue</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-1.5">${totalCollected.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400">
            {totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100}% Recovery Rate
          </span>
        </div>

        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4">
          <div className="flex items-center justify-between text-rose-400 text-xs font-medium">
            <span>Unpaid & Overdue Balance</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-rose-400 mt-1.5">${totalPending.toLocaleString()}</p>
          <span className="text-[10px] text-rose-300 font-medium">{defaulters.length} Defaulters</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'invoices'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Vouchers & Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('structures')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'structures'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Fee Heads & Structures ({structures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('defaulters')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === 'defaulters'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Defaulter Tracking ({defaulters.length})</span>
        </button>
      </div>

      {/* Tab 1: Invoices */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search invoice number, student name, roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Invoices Table */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 shadow-sm">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Voucher No</th>
                  <th className="px-4 py-3">Student & Grade</th>
                  <th className="px-4 py-3">Billing Month</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-800/40 transition">
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                        {inv.invoiceNumber}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-100">{inv.studentName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{inv.rollNo} • {inv.className}</div>
                      </td>

                      <td className="px-4 py-3 text-zinc-300">{inv.month}</td>

                      <td className="px-4 py-3 font-mono text-zinc-400">{inv.dueDate}</td>

                      <td className="px-4 py-3 font-semibold text-white">
                        ${inv.totalAmount}
                        {inv.balance > 0 && inv.status !== 'pending' && (
                          <span className="block text-[10px] text-rose-400">Bal: ${inv.balance}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                            inv.status === 'paid'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                              : inv.status === 'overdue'
                              ? 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                              : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => {
                                setSelectedInvoiceForPay(inv);
                                setPaymentForm((prev) => ({ ...prev, amount: inv.balance }));
                                setIsPaymentModalOpen(true);
                              }}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 transition"
                            >
                              Collect
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="rounded-lg border border-zinc-700 bg-zinc-800 p-1 text-zinc-300 hover:text-white"
                            title="Print 3-Copy Fee Voucher"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Structures */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {structures.map((st) => (
            <div
              key={st.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-zinc-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{st.name}</h3>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 font-medium mt-1 inline-block">
                    {st.className}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-emerald-400">${st.amount}</div>
                  <div className="text-[10px] uppercase text-zinc-500 font-semibold">{st.frequency}</div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-zinc-800 pt-3 text-xs">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Fee Breakdown Heads:
                </span>
                {st.breakdown?.map((b, i) => (
                  <div key={i} className="flex justify-between text-zinc-300">
                    <span>{b.head}</span>
                    <span className="font-mono text-zinc-400">${b.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Defaulters */}
      {activeTab === 'defaulters' && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Roll & Class</th>
                <th className="px-4 py-3">Overdue Month</th>
                <th className="px-4 py-3">Outstanding Balance</th>
                <th className="px-4 py-3 text-right">Reminder Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {defaulters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-emerald-400">
                    No overdue fee defaulters recorded!
                  </td>
                </tr>
              ) : (
                defaulters.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-800/40">
                    <td className="px-4 py-3 font-semibold text-zinc-100">{d.studentName}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{d.rollNo} • {d.className}</td>
                    <td className="px-4 py-3 text-rose-400 font-medium">{d.month} (Due {d.dueDate})</td>
                    <td className="px-4 py-3 font-bold text-rose-400">${d.balance}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => alert(`Automated SMS & Notice sent to parent of ${d.studentName}`)}
                        className="rounded-lg border border-rose-800/60 bg-rose-950/30 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900/50"
                      >
                        Send SMS Alert
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Collect Payment Modal */}
      {isPaymentModalOpen && selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2">Record Fee Collection</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Collecting fee for <span className="text-zinc-200 font-semibold">{selectedInvoiceForPay.studentName}</span> ({selectedInvoiceForPay.invoiceNumber})
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Amount to Collect ($) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300">Payment Mode</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="bank_transfer">Bank Transfer / Online Deposit</option>
                  <option value="cash">Counter Cash</option>
                  <option value="cheque">Bank Cheque</option>
                  <option value="card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Transaction / Receipt Reference</label>
                <input
                  type="text"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Fee Voucher Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Generate Student Fee Voucher</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300">Select Student</label>
                <select
                  value={invoiceForm.studentId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo} - {s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Fee Title / Month</label>
                <input
                  type="text"
                  value={invoiceForm.month}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, month: e.target.value })}
                  placeholder="e.g. November 2026"
                  className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300">Amount ($)</label>
                  <input
                    type="number"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Generate Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable 3-Copy Fee Voucher */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Printer className="h-4 w-4 text-emerald-400" />
                Printable 3-Copy Bank Challan / Fee Voucher
              </h3>
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 3-column replica voucher */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white text-zinc-900 p-4 rounded-xl text-[11px] font-sans">
              {['Bank Copy', 'School Copy', 'Student Copy'].map((copyType, idx) => (
                <div key={idx} className="border border-dashed border-zinc-400 p-3 rounded flex flex-col justify-between">
                  <div>
                    <div className="text-center pb-2 border-b border-zinc-300">
                      <h4 className="font-bold text-xs uppercase">{currentSchool?.name}</h4>
                      <p className="text-[9px] text-zinc-600">{copyType}</p>
                      <span className="font-mono text-[10px] font-bold text-blue-800">{selectedInvoiceForPrint.invoiceNumber}</span>
                    </div>

                    <div className="space-y-1 py-2 text-[10px]">
                      <div><strong>Student:</strong> {selectedInvoiceForPrint.studentName}</div>
                      <div><strong>Roll No:</strong> {selectedInvoiceForPrint.rollNo}</div>
                      <div><strong>Class:</strong> {selectedInvoiceForPrint.className}</div>
                      <div><strong>Month:</strong> {selectedInvoiceForPrint.month}</div>
                      <div><strong>Due Date:</strong> {selectedInvoiceForPrint.dueDate}</div>
                    </div>

                    <div className="border-t border-zinc-300 pt-2 space-y-0.5">
                      {selectedInvoiceForPrint.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span>{item.head}:</span>
                          <span className="font-mono font-semibold">${item.amount}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-zinc-400 pt-1 font-bold text-xs text-blue-900">
                        <span>Total Payable:</span>
                        <span>${selectedInvoiceForPrint.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-center text-[9px] text-zinc-500 border-t border-zinc-200 mt-2">
                    Authorized Bank Officer Signature
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
