export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'principal'
  | 'teacher'
  | 'parent'
  | 'student'
  | 'accountant'
  | 'librarian'
  | 'transport_manager';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  schoolId?: string; // Optional for Super Admin
  status: UserStatus;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  // Specific role metadata
  studentId?: string;
  teacherId?: string;
  parentId?: string;
  linkedStudentIds?: string[];
}

export interface SchoolBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tagline?: string;
  motto?: string;
}

export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalClasses: number;
  totalRevenue: number;
  pendingFees: number;
  attendanceRate: number;
}

export interface School {
  id: string;
  name: string;
  code: string;
  emisCode: string;
  regNumber: string;
  type: 'primary' | 'secondary' | 'higher_secondary' | 'k12' | 'college';
  address: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  principalName: string;
  principalEmail?: string;
  principalPhone?: string;
  establishedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  activeSession: string; // e.g. "2026-2027"
  branding: SchoolBranding;
  stats?: Partial<SchoolStats>;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSession {
  id: string;
  schoolId: string;
  name: string; // e.g., "2026-2027"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ClassGroup {
  id: string;
  schoolId: string;
  name: string; // e.g., "Grade 1", "Grade 10"
  numericLevel: number;
  sections: string[]; // ["A", "B", "C"]
  classTeacherName?: string;
  room?: string;
  capacity?: number;
  enrolledStudentsCount?: number;
}

export interface Section {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  name: string; // "A", "B"
  room?: string;
  classTeacherId?: string;
  classTeacherName?: string;
  studentCount?: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  type: 'theory' | 'practical' | 'both';
  totalMarks: number;
  passingMarks: number;
  classIds: string[];
  teacherId?: string;
  teacherName?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  admissionNo: string;
  rollNo: string;
  name: string;
  fatherName: string;
  motherName?: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  bFormNo?: string;
  photo?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  parentIds: string[];
  admissionDate: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  sessionId: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated' | 'suspended';
  balance: number;
  qrCodeToken?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Parent {
  id: string;
  schoolId: string;
  name: string;
  cnic?: string;
  phone: string;
  email: string;
  address: string;
  occupation?: string;
  relationship: 'father' | 'mother' | 'guardian';
  photo?: string;
  userId?: string;
  linkedStudentIds: string[];
  createdAt: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  employeeId: string;
  name: string;
  cnic?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address?: string;
  qualification: string;
  experience?: string;
  joiningDate: string;
  designation: string;
  department?: string;
  specialization?: string;
  subjects?: string[];
  assignedSubjects?: string[];
  assignedClasses: (string | { classId: string; className: string; sectionName: string })[];
  salary: number;
  photo?: string;
  status: 'active' | 'inactive' | 'on_leave';
  userId?: string;
  createdAt?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'late';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  type: 'student' | 'teacher' | 'staff';
  targetId: string; // studentId or teacherId
  targetName: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface FeeType {
  id: string;
  schoolId: string;
  name: string; // e.g., "Tuition Fee", "Examination Fee", "Transport Fee"
  code: string;
  frequency: 'monthly' | 'term' | 'annual' | 'one_time';
  description?: string;
}

export interface FeeStructure {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  feeTypeId: string;
  feeTypeName: string;
  amount: number;
  dueDateDay: number; // e.g. 10th of every month
}

export interface FeeInvoiceItem {
  feeTypeId: string;
  name: string;
  head?: string;
  amount: number;
}

export type InvoiceStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface FeeInvoice {
  id: string;
  schoolId: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classId: string;
  className: string;
  sectionName: string;
  month: string; // e.g., "August 2026"
  issueDate: string;
  dueDate: string;
  items: FeeInvoiceItem[];
  subtotal: number;
  discount: number;
  fine: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  paymentMethod?: 'cash' | 'bank_transfer' | 'online' | 'cheque';
  paymentDate?: string;
  transactionRef?: string;
  notes?: string;
  createdAt: string;
}

export interface Examination {
  id: string;
  schoolId: string;
  name: string; // e.g., "Mid Term Examination 2026"
  session: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'published';
  classIds: string[];
}

export interface ExamSubjectSchedule {
  id: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  maxMarks: number;
  passingMarks: number;
}

export interface ExamResult {
  id: string;
  schoolId: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  admissionNo?: string;
  rollNo?: string;
  classId: string;
  className: string;
  sectionName?: string;
  subjectMarks?: {
    subjectId: string;
    subjectName: string;
    marksObtained?: number;
    obtainedMarks?: number;
    maxMarks?: number;
    totalMarks?: number;
    grade?: string;
    gpa?: number;
    remarks?: string;
  }[];
  subjects?: {
    subjectId: string;
    subjectName: string;
    marksObtained?: number;
    obtainedMarks?: number;
    maxMarks?: number;
    totalMarks?: number;
    grade?: string;
    gpa?: number;
    remarks?: string;
  }[];
  totalMarksObtained?: number;
  totalMaxMarks?: number;
  totalMarks?: number;
  obtainedMarks?: number;
  percentage: number;
  grade: string;
  gpa: number;
  position?: number;
  remarks?: string;
  status?: 'pass' | 'fail' | 'withheld';
  publishedAt?: string;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  sectionName: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId?: string;
  teacherName: string;
  room: string;
}

export interface Homework {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  submissionCount?: number;
  totalStudents?: number;
  status: 'active' | 'evaluated' | 'archived';
  attachmentUrl?: string;
}

export interface LibraryBook {
  id: string;
  schoolId: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  rackLocation?: string;
  totalCopies: number;
  availableCopies: number;
  price?: number;
}

export interface BookIssue {
  id: string;
  schoolId: string;
  bookId: string;
  bookTitle: string;
  borrowerType: 'student' | 'teacher';
  borrowerId: string;
  borrowerName: string;
  borrowerClass?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount?: number;
  status: 'issued' | 'returned' | 'overdue';
}

export interface TransportRoute {
  id: string;
  schoolId: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedStudents: number;
  monthlyFee: number;
  stops: { stopName: string; time: string; fee: number }[];
}

export interface InventoryItem {
  id: string;
  schoolId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string; // e.g. "Boxes", "Pieces", "Sets"
  minStockAlert: number;
  unitPrice: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  supplier?: string;
}

export interface ExpenseItem {
  id: string;
  schoolId: string;
  title: string;
  category: 'utilities' | 'maintenance' | 'supplies' | 'salaries' | 'events' | 'other';
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  paidTo: string;
  receiptNumber?: string;
  description?: string;
}

export interface PayrollRecord {
  id: string;
  schoolId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'generated' | 'paid' | 'pending';
  paymentDate?: string;
  paymentMethod?: string;
}

export interface Notice {
  id: string;
  schoolId?: string; // Null if global Super Admin notice
  title: string;
  content: string;
  category: 'general' | 'academic' | 'urgent' | 'holiday' | 'event';
  targetAudience: 'all' | 'teachers' | 'students' | 'parents' | 'staff';
  publishedBy: string;
  publishedDate: string;
  isPinned?: boolean;
}

export interface SchoolEvent {
  id: string;
  schoolId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  category: 'sports' | 'exam' | 'cultural' | 'holiday' | 'meeting';
}

export interface AuditLog {
  id: string;
  schoolId?: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  schoolId?: string;
  title: string;
  message: string;
  type: 'fee' | 'attendance' | 'exam' | 'notice' | 'system';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface SubjectAllocation {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  periodsPerWeek?: number;
}

export type Exam = Examination;
export type Book = LibraryBook;
export type Expense = ExpenseItem;

