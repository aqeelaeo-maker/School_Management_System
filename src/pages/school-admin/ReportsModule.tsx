import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Printer,
  Download,
  Filter,
  BarChart2,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
} from 'lucide-react';
import { getStudents } from '../../services/studentService';
import { getInvoices } from '../../services/feeService';
import { getClasses } from '../../services/academicService';
import { getTeachers } from '../../services/teacherService';

export const ReportsModule: React.FC = () => {
  const { currentSchool } = useAuth();
  const schoolId = currentSchool?.id || 'sch_beacon_01';

  const [reportType, setReportType] = useState<
    'demographics' | 'fee_ledger' | 'faculty' | 'academic_summary'
  >('demographics');

  const [students, setStudents] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [s, inv, t, c] = await Promise.all([
          getStudents(schoolId),
          getInvoices(schoolId),
          getTeachers(schoolId),
          getClasses(schoolId),
        ]);
        setStudents(s);
        setInvoices(inv);
        setTeachers(t);
        setClasses(c);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [schoolId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-emerald-400" />
            Institutional Reports & Regulatory Exports
          </h1>
          <p className="text-xs text-zinc-400">
            Generate formal administrative summaries, student census rosters, and financial audit statements
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition"
        >
          <Printer className="h-4 w-4" />
          <span>Print Formal Report</span>
        </button>
      </div>

      {/* Report Selector Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={() => setReportType('demographics')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition ${
            reportType === 'demographics'
              ? 'border-blue-500 bg-blue-950/40 text-blue-400'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <Users className="h-6 w-6 mb-2" />
          <span className="text-xs font-semibold">Student Demographics</span>
          <span className="text-[10px] opacity-70">Enrollment & Blood Groups</span>
        </button>

        <button
          onClick={() => setReportType('fee_ledger')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition ${
            reportType === 'fee_ledger'
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="h-6 w-6 mb-2" />
          <span className="text-xs font-semibold">Fee Collection Ledger</span>
          <span className="text-[10px] opacity-70">Paid & Defaulter Audit</span>
        </button>

        <button
          onClick={() => setReportType('faculty')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition ${
            reportType === 'faculty'
              ? 'border-amber-500 bg-amber-950/40 text-amber-400'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <Award className="h-6 w-6 mb-2" />
          <span className="text-xs font-semibold">Faculty Staff Roster</span>
          <span className="text-[10px] opacity-70">Salaries & Specializations</span>
        </button>

        <button
          onClick={() => setReportType('academic_summary')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition ${
            reportType === 'academic_summary'
              ? 'border-purple-500 bg-purple-950/40 text-purple-400'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <CalendarCheck className="h-6 w-6 mb-2" />
          <span className="text-xs font-semibold">Academic Class Summary</span>
          <span className="text-[10px] opacity-70">Capacity & Sections</span>
        </button>
      </div>

      {/* Printable Report Output Area */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
        <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {currentSchool?.name} — {reportType.replace('_', ' ').toUpperCase()} REPORT
            </h3>
            <p className="text-xs text-zinc-400">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">EMIS: {currentSchool?.emisCode}</span>
        </div>

        {/* View 1: Demographics */}
        {reportType === 'demographics' && (
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-2.5">Roll No</th>
                <th className="p-2.5">Admission No</th>
                <th className="p-2.5">Student Name</th>
                <th className="p-2.5">Grade Level</th>
                <th className="p-2.5">Gender</th>
                <th className="p-2.5">Blood Group</th>
                <th className="p-2.5">City / State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="p-2.5 font-mono text-zinc-400">{s.rollNo}</td>
                  <td className="p-2.5 font-mono">{s.admissionNo}</td>
                  <td className="p-2.5 font-semibold text-white">{s.name}</td>
                  <td className="p-2.5">{s.className} - {s.sectionName}</td>
                  <td className="p-2.5 capitalize">{s.gender}</td>
                  <td className="p-2.5 font-mono">{s.bloodGroup || 'N/A'}</td>
                  <td className="p-2.5">{s.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* View 2: Fee Ledger */}
        {reportType === 'fee_ledger' && (
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-2.5">Invoice #</th>
                <th className="p-2.5">Student Name</th>
                <th className="p-2.5">Grade</th>
                <th className="p-2.5">Month</th>
                <th className="p-2.5">Total Amount</th>
                <th className="p-2.5">Paid</th>
                <th className="p-2.5">Balance</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="p-2.5 font-mono text-emerald-400">{inv.invoiceNumber}</td>
                  <td className="p-2.5 font-semibold text-white">{inv.studentName}</td>
                  <td className="p-2.5">{inv.className}</td>
                  <td className="p-2.5">{inv.month}</td>
                  <td className="p-2.5 font-bold">${inv.totalAmount}</td>
                  <td className="p-2.5 text-emerald-400 font-medium">${inv.paidAmount || 0}</td>
                  <td className="p-2.5 text-rose-400 font-bold">${inv.balance}</td>
                  <td className="p-2.5 uppercase font-mono text-[10px]">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* View 3: Faculty */}
        {reportType === 'faculty' && (
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-2.5">EMP ID</th>
                <th className="p-2.5">Faculty Name</th>
                <th className="p-2.5">Designation</th>
                <th className="p-2.5">Specialization</th>
                <th className="p-2.5">Salary ($/mo)</th>
                <th className="p-2.5">Assigned Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td className="p-2.5 font-mono text-amber-400">{t.employeeId}</td>
                  <td className="p-2.5 font-semibold text-white">{t.name}</td>
                  <td className="p-2.5">{t.designation}</td>
                  <td className="p-2.5">{t.specialization}</td>
                  <td className="p-2.5 font-bold text-emerald-400">${t.salary}</td>
                  <td className="p-2.5">{t.assignedSubjects?.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* View 4: Classes */}
        {reportType === 'academic_summary' && (
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-2.5">Class / Grade</th>
                <th className="p-2.5">Numeric Level</th>
                <th className="p-2.5">Room Location</th>
                <th className="p-2.5">Sections</th>
                <th className="p-2.5">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {classes.map((c) => (
                <tr key={c.id}>
                  <td className="p-2.5 font-bold text-white">{c.name}</td>
                  <td className="p-2.5 font-mono">{c.numericGrade}</td>
                  <td className="p-2.5">{c.roomNumber || 'Academic Wing'}</td>
                  <td className="p-2.5">{c.sections?.map((s: any) => s.name).join(', ')}</td>
                  <td className="p-2.5 font-mono">{c.capacity || 40} Seats</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
