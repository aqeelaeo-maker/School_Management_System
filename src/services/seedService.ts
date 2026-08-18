import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  School,
  UserProfile,
  ClassGroup,
  Subject,
  Student,
  Teacher,
  Parent,
  AttendanceRecord,
  FeeInvoice,
  Examination,
  ExamResult,
  TimetableSlot,
  Homework,
  Notice,
  SchoolEvent,
  LibraryBook,
  TransportRoute,
  InventoryItem,
  ExpenseItem,
} from '../types';

export async function seedInitialDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    // ================= 1. SUPER ADMIN USER =================
    const superAdmin: UserProfile = {
      uid: 'user_super_admin',
      name: 'Victoria Vance (Super Admin)',
      email: 'superadmin@edusphere.org',
      phone: '+1 (555) 019-2831',
      role: 'super_admin',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'users', superAdmin.uid), superAdmin);

    // ================= 2. SCHOOL 1: BEACON HILL ACADEMY =================
    const school1: School = {
      id: 'sch_beacon_01',
      name: 'Beacon Hill Preparatory Academy',
      code: 'BHPA',
      emisCode: 'EMIS-40192',
      regNumber: 'REG-2018-9921',
      type: 'k12',
      address: '742 Evergreen Terrace',
      city: 'Boston',
      state: 'Massachusetts',
      country: 'United States',
      phone: '+1 (617) 555-0142',
      email: 'admin@beaconhill.edu',
      website: 'https://beaconhill.edu',
      principalName: 'Dr. Arthur Pendelton',
      establishedDate: '2012-08-15',
      status: 'active',
      activeSession: '2026-2027',
      branding: {
        primaryColor: '#1e3a8a', // Deep Blue
        secondaryColor: '#3b82f6',
        accentColor: '#f59e0b',
        tagline: 'Inspiring Minds, Shaping Character',
      },
      stats: {
        totalStudents: 340,
        totalTeachers: 24,
        totalStaff: 12,
        totalClasses: 10,
        totalRevenue: 148500,
        pendingFees: 18200,
        attendanceRate: 94.6,
      },
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'schools', school1.id), school1);

    // ================= 3. SCHOOL 2: HORIZON INTERNATIONAL =================
    const school2: School = {
      id: 'sch_horizon_02',
      name: 'Horizon STEM International Academy',
      code: 'HSIA',
      emisCode: 'EMIS-88201',
      regNumber: 'REG-2021-3011',
      type: 'higher_secondary',
      address: '105 Innovation Way, Tech Corridor',
      city: 'Austin',
      state: 'Texas',
      country: 'United States',
      phone: '+1 (512) 555-0198',
      email: 'info@horizonstem.edu',
      website: 'https://horizonstem.edu',
      principalName: 'Dr. Evelyn Vance',
      establishedDate: '2019-09-01',
      status: 'active',
      activeSession: '2026-2027',
      branding: {
        primaryColor: '#065f46', // Emerald Green
        secondaryColor: '#10b981',
        accentColor: '#8b5cf6',
        tagline: 'Leading the Future of Science & Innovation',
      },
      stats: {
        totalStudents: 220,
        totalTeachers: 18,
        totalStaff: 8,
        totalClasses: 6,
        totalRevenue: 98000,
        pendingFees: 11400,
        attendanceRate: 96.2,
      },
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'schools', school2.id), school2);

    // ================= 4. DEMO USERS (PRINCIPALS, TEACHERS, STUDENTS, PARENTS) =================
    const demoUsers: UserProfile[] = [
      {
        uid: 'user_beacon_admin',
        name: 'Marcus Sterling',
        email: 'admin@beaconhill.edu',
        phone: '+1 (617) 555-0111',
        role: 'school_admin',
        schoolId: school1.id,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        uid: 'user_beacon_principal',
        name: 'Dr. Arthur Pendelton',
        email: 'principal@beaconhill.edu',
        phone: '+1 (617) 555-0112',
        role: 'principal',
        schoolId: school1.id,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        uid: 'user_beacon_teacher_1',
        name: 'Prof. Clara Oswald',
        email: 'clara.oswald@beaconhill.edu',
        phone: '+1 (617) 555-0120',
        role: 'teacher',
        schoolId: school1.id,
        status: 'active',
        teacherId: 'tch_clara',
        createdAt: now,
        updatedAt: now,
      },
      {
        uid: 'user_beacon_parent_1',
        name: 'David Reynolds',
        email: 'david.reynolds@gmail.com',
        phone: '+1 (617) 555-0145',
        role: 'parent',
        schoolId: school1.id,
        status: 'active',
        parentId: 'prt_david',
        linkedStudentIds: ['std_alex_reynolds', 'std_maya_reynolds'],
        createdAt: now,
        updatedAt: now,
      },
      {
        uid: 'user_beacon_student_1',
        name: 'Alex Reynolds',
        email: 'alex.reynolds@student.beaconhill.edu',
        phone: '+1 (617) 555-0146',
        role: 'student',
        schoolId: school1.id,
        status: 'active',
        studentId: 'std_alex_reynolds',
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const u of demoUsers) {
      await setDoc(doc(db, 'users', u.uid), u);
    }

    // ================= 5. CLASSES & SECTIONS FOR BEACON HILL =================
    const classes: ClassGroup[] = [
      { id: 'cls_grade_6', schoolId: school1.id, name: 'Grade 6', numericLevel: 6, sections: ['A', 'B'], room: 'Wing A-101', capacity: 30, enrolledStudentsCount: 28 },
      { id: 'cls_grade_7', schoolId: school1.id, name: 'Grade 7', numericLevel: 7, sections: ['A', 'B'], room: 'Wing A-102', capacity: 30, enrolledStudentsCount: 26 },
      { id: 'cls_grade_8', schoolId: school1.id, name: 'Grade 8', numericLevel: 8, sections: ['A', 'B'], room: 'Wing B-201', capacity: 32, enrolledStudentsCount: 30 },
      { id: 'cls_grade_9', schoolId: school1.id, name: 'Grade 9', numericLevel: 9, sections: ['A', 'B'], room: 'Wing B-202', capacity: 32, enrolledStudentsCount: 29 },
      { id: 'cls_grade_10', schoolId: school1.id, name: 'Grade 10', numericLevel: 10, sections: ['A', 'B'], room: 'Wing C-301', capacity: 35, enrolledStudentsCount: 32 },
    ];

    for (const c of classes) {
      await setDoc(doc(db, `schools/${school1.id}/classes`, c.id), c);
    }

    // ================= 6. SUBJECTS =================
    const subjects: Subject[] = [
      { id: 'sub_math', schoolId: school1.id, code: 'MTH-101', name: 'Advanced Mathematics', type: 'theory', totalMarks: 100, passingMarks: 40, classIds: ['cls_grade_8', 'cls_grade_9', 'cls_grade_10'], teacherName: 'Prof. Clara Oswald' },
      { id: 'sub_phys', schoolId: school1.id, code: 'PHY-201', name: 'Physics & Applied Mechanics', type: 'both', totalMarks: 100, passingMarks: 40, classIds: ['cls_grade_9', 'cls_grade_10'], teacherName: 'Dr. Robert Oppen' },
      { id: 'sub_chem', schoolId: school1.id, code: 'CHM-201', name: 'Organic & Inorganic Chemistry', type: 'both', totalMarks: 100, passingMarks: 40, classIds: ['cls_grade_9', 'cls_grade_10'], teacherName: 'Dr. Sarah Connor' },
      { id: 'sub_eng', schoolId: school1.id, code: 'ENG-101', name: 'English Literature & Composition', type: 'theory', totalMarks: 100, passingMarks: 40, classIds: ['cls_grade_6', 'cls_grade_7', 'cls_grade_8', 'cls_grade_9', 'cls_grade_10'], teacherName: 'Ms. Emily Bronte' },
      { id: 'sub_cs', schoolId: school1.id, code: 'CSC-301', name: 'Computer Science & AI Basics', type: 'both', totalMarks: 100, passingMarks: 40, classIds: ['cls_grade_8', 'cls_grade_9', 'cls_grade_10'], teacherName: 'Alan Turing Jr.' },
    ];

    for (const s of subjects) {
      await setDoc(doc(db, `schools/${school1.id}/subjects`, s.id), s);
    }

    // ================= 7. TEACHERS =================
    const teachers: Teacher[] = [
      {
        id: 'tch_clara',
        schoolId: school1.id,
        employeeId: 'EMP-0104',
        name: 'Prof. Clara Oswald',
        dob: '1988-04-12',
        gender: 'female',
        phone: '+1 (617) 555-0120',
        email: 'clara.oswald@beaconhill.edu',
        address: '12 Baker Street, Cambridge, MA',
        qualification: 'M.Sc. Pure Mathematics (MIT)',
        experience: '8 Years',
        joiningDate: '2019-08-01',
        designation: 'Senior Mathematics Instructor',
        department: 'Mathematics & Computing',
        subjects: ['Advanced Mathematics', 'Algebra & Geometry'],
        assignedClasses: [
          { classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'A' },
          { classId: 'cls_grade_10', className: 'Grade 10', sectionName: 'A' },
        ],
        salary: 5800,
        status: 'active',
        createdAt: now,
      },
      {
        id: 'tch_robert',
        schoolId: school1.id,
        employeeId: 'EMP-0108',
        name: 'Dr. Robert Oppen',
        dob: '1984-06-25',
        gender: 'male',
        phone: '+1 (617) 555-0129',
        email: 'robert.oppen@beaconhill.edu',
        address: '88 Riverdale Ave, Boston, MA',
        qualification: 'Ph.D. Experimental Physics (Harvard)',
        experience: '12 Years',
        joiningDate: '2018-09-01',
        designation: 'Head of Physical Sciences',
        department: 'Sciences',
        subjects: ['Physics & Applied Mechanics'],
        assignedClasses: [
          { classId: 'cls_grade_9', className: 'Grade 9', sectionName: 'A' },
          { classId: 'cls_grade_10', className: 'Grade 10', sectionName: 'A' },
        ],
        salary: 6400,
        status: 'active',
        createdAt: now,
      },
      {
        id: 'tch_emily',
        schoolId: school1.id,
        employeeId: 'EMP-0112',
        name: 'Ms. Emily Bronte',
        dob: '1992-02-18',
        gender: 'female',
        phone: '+1 (617) 555-0133',
        email: 'emily.bronte@beaconhill.edu',
        address: '304 Commonwealth Ave, Boston, MA',
        qualification: 'M.A. English Literature (Oxford)',
        experience: '6 Years',
        joiningDate: '2021-08-15',
        designation: 'Senior English Faculty',
        department: 'Humanities & Languages',
        subjects: ['English Literature & Composition'],
        assignedClasses: [
          { classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'A' },
          { classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'B' },
        ],
        salary: 5200,
        status: 'active',
        createdAt: now,
      },
    ];

    for (const t of teachers) {
      await setDoc(doc(db, `schools/${school1.id}/teachers`, t.id), t);
    }

    // ================= 8. STUDENTS =================
    const students: Student[] = [
      {
        id: 'std_alex_reynolds',
        schoolId: school1.id,
        admissionNo: 'BHP-2024-0081',
        rollNo: '08-A-01',
        name: 'Alex Reynolds',
        fatherName: 'David Reynolds',
        motherName: 'Sarah Reynolds',
        dob: '2012-05-14',
        gender: 'male',
        bloodGroup: 'O+',
        phone: '+1 (617) 555-0146',
        email: 'alex.reynolds@student.beaconhill.edu',
        address: '42 Harvard Street, Brookline, MA',
        city: 'Boston',
        guardianName: 'David Reynolds',
        guardianPhone: '+1 (617) 555-0145',
        parentIds: ['prt_david'],
        admissionDate: '2024-08-10',
        classId: 'cls_grade_8',
        className: 'Grade 8',
        sectionId: 'sec_8a',
        sectionName: 'A',
        sessionId: '2026-2027',
        status: 'active',
        balance: 0,
        emergencyContact: '+1 (617) 555-0145',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'std_maya_reynolds',
        schoolId: school1.id,
        admissionNo: 'BHP-2025-0114',
        rollNo: '06-A-04',
        name: 'Maya Reynolds',
        fatherName: 'David Reynolds',
        motherName: 'Sarah Reynolds',
        dob: '2014-09-22',
        gender: 'female',
        bloodGroup: 'A+',
        phone: '+1 (617) 555-0145',
        email: 'maya.reynolds@student.beaconhill.edu',
        address: '42 Harvard Street, Brookline, MA',
        city: 'Boston',
        guardianName: 'David Reynolds',
        parentIds: ['prt_david'],
        admissionDate: '2025-08-12',
        classId: 'cls_grade_6',
        className: 'Grade 6',
        sectionId: 'sec_6a',
        sectionName: 'A',
        sessionId: '2026-2027',
        status: 'active',
        balance: 450,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'std_ethan_hunt',
        schoolId: school1.id,
        admissionNo: 'BHP-2024-0082',
        rollNo: '08-A-02',
        name: 'Ethan Hunt',
        fatherName: 'Jonathan Hunt',
        dob: '2012-03-10',
        gender: 'male',
        bloodGroup: 'B+',
        phone: '+1 (617) 555-0188',
        email: 'ethan.hunt@student.beaconhill.edu',
        address: '19 Beacon Blvd, Boston, MA',
        city: 'Boston',
        guardianName: 'Jonathan Hunt',
        parentIds: [],
        admissionDate: '2024-08-10',
        classId: 'cls_grade_8',
        className: 'Grade 8',
        sectionId: 'sec_8a',
        sectionName: 'A',
        sessionId: '2026-2027',
        status: 'active',
        balance: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'std_sophia_chen',
        schoolId: school1.id,
        admissionNo: 'BHP-2024-0083',
        rollNo: '08-A-03',
        name: 'Sophia Chen',
        fatherName: 'Wei Chen',
        motherName: 'Mei Chen',
        dob: '2012-11-05',
        gender: 'female',
        bloodGroup: 'AB+',
        phone: '+1 (617) 555-0192',
        email: 'sophia.chen@student.beaconhill.edu',
        address: '77 Quincy Street, Boston, MA',
        city: 'Boston',
        guardianName: 'Wei Chen',
        parentIds: [],
        admissionDate: '2024-08-10',
        classId: 'cls_grade_8',
        className: 'Grade 8',
        sectionId: 'sec_8a',
        sectionName: 'A',
        sessionId: '2026-2027',
        status: 'active',
        balance: 600, // Defaulter
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'std_lucas_vance',
        schoolId: school1.id,
        admissionNo: 'BHP-2023-0044',
        rollNo: '10-A-01',
        name: 'Lucas Vance',
        fatherName: 'Dr. Gregory Vance',
        dob: '2010-01-18',
        gender: 'male',
        bloodGroup: 'O-',
        phone: '+1 (617) 555-0177',
        email: 'lucas.vance@student.beaconhill.edu',
        address: '500 Boylston St, Boston, MA',
        city: 'Boston',
        guardianName: 'Dr. Gregory Vance',
        parentIds: [],
        admissionDate: '2023-08-15',
        classId: 'cls_grade_10',
        className: 'Grade 10',
        sectionId: 'sec_10a',
        sectionName: 'A',
        sessionId: '2026-2027',
        status: 'active',
        balance: 0,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const std of students) {
      await setDoc(doc(db, `schools/${school1.id}/students`, std.id), std);
    }

    // ================= 9. PARENT RECORD =================
    const parent: Parent = {
      id: 'prt_david',
      schoolId: school1.id,
      name: 'David Reynolds',
      cnic: 'CNIC-84920-19283',
      phone: '+1 (617) 555-0145',
      email: 'david.reynolds@gmail.com',
      address: '42 Harvard Street, Brookline, MA',
      occupation: 'Senior Software Architect',
      relationship: 'father',
      userId: 'user_beacon_parent_1',
      linkedStudentIds: ['std_alex_reynolds', 'std_maya_reynolds'],
      createdAt: now,
    };
    await setDoc(doc(db, `schools/${school1.id}/parents`, parent.id), parent);

    // ================= 10. ATTENDANCE RECORDS FOR TODAY =================
    const attendanceList: AttendanceRecord[] = [
      { id: `${today}_std_alex_reynolds`, schoolId: school1.id, date: today, type: 'student', targetId: 'std_alex_reynolds', targetName: 'Alex Reynolds', classId: 'cls_grade_8', className: 'Grade 8', sectionId: 'sec_8a', sectionName: 'A', status: 'present', createdAt: now },
      { id: `${today}_std_ethan_hunt`, schoolId: school1.id, date: today, type: 'student', targetId: 'std_ethan_hunt', targetName: 'Ethan Hunt', classId: 'cls_grade_8', className: 'Grade 8', sectionId: 'sec_8a', sectionName: 'A', status: 'present', createdAt: now },
      { id: `${today}_std_sophia_chen`, schoolId: school1.id, date: today, type: 'student', targetId: 'std_sophia_chen', targetName: 'Sophia Chen', classId: 'cls_grade_8', className: 'Grade 8', sectionId: 'sec_8a', sectionName: 'A', status: 'late', remarks: 'Bus delay', createdAt: now },
      { id: `${today}_std_maya_reynolds`, schoolId: school1.id, date: today, type: 'student', targetId: 'std_maya_reynolds', targetName: 'Maya Reynolds', classId: 'cls_grade_6', className: 'Grade 6', sectionId: 'sec_6a', sectionName: 'A', status: 'present', createdAt: now },
      { id: `${today}_std_lucas_vance`, schoolId: school1.id, date: today, type: 'student', targetId: 'std_lucas_vance', targetName: 'Lucas Vance', classId: 'cls_grade_10', className: 'Grade 10', sectionId: 'sec_10a', sectionName: 'A', status: 'present', createdAt: now },
    ];

    for (const att of attendanceList) {
      await setDoc(doc(db, `schools/${school1.id}/attendance`, att.id), att);
    }

    // ================= 11. FEE INVOICES =================
    const invoices: FeeInvoice[] = [
      {
        id: 'inv_2026_08_001',
        schoolId: school1.id,
        invoiceNumber: 'INV-2026-0801',
        studentId: 'std_alex_reynolds',
        studentName: 'Alex Reynolds',
        admissionNo: 'BHP-2024-0081',
        classId: 'cls_grade_8',
        className: 'Grade 8',
        sectionName: 'A',
        month: 'August 2026',
        issueDate: '2026-08-01',
        dueDate: '2026-08-15',
        items: [
          { feeTypeId: 'ft_tuition', name: 'Monthly Tuition Fee', amount: 450 },
          { feeTypeId: 'ft_lab', name: 'Science & Computer Lab Fee', amount: 75 },
          { feeTypeId: 'ft_activity', name: 'Sports & Extracurricular Fee', amount: 50 },
        ],
        subtotal: 575,
        discount: 25,
        fine: 0,
        totalAmount: 550,
        paidAmount: 550,
        balance: 0,
        status: 'paid',
        paymentMethod: 'bank_transfer',
        paymentDate: '2026-08-05',
        transactionRef: 'WIRE-892104882',
        createdAt: now,
      },
      {
        id: 'inv_2026_08_002',
        schoolId: school1.id,
        invoiceNumber: 'INV-2026-0802',
        studentId: 'std_sophia_chen',
        studentName: 'Sophia Chen',
        admissionNo: 'BHP-2024-0083',
        classId: 'cls_grade_8',
        className: 'Grade 8',
        sectionName: 'A',
        month: 'August 2026',
        issueDate: '2026-08-01',
        dueDate: '2026-08-10',
        items: [
          { feeTypeId: 'ft_tuition', name: 'Monthly Tuition Fee', amount: 450 },
          { feeTypeId: 'ft_transport', name: 'School Bus Route #4', amount: 120 },
          { feeTypeId: 'ft_lab', name: 'Lab Fee', amount: 30 },
        ],
        subtotal: 600,
        discount: 0,
        fine: 30,
        totalAmount: 630,
        paidAmount: 0,
        balance: 630,
        status: 'overdue',
        createdAt: now,
      },
      {
        id: 'inv_2026_08_003',
        schoolId: school1.id,
        invoiceNumber: 'INV-2026-0803',
        studentId: 'std_maya_reynolds',
        studentName: 'Maya Reynolds',
        admissionNo: 'BHP-2025-0114',
        classId: 'cls_grade_6',
        className: 'Grade 6',
        sectionName: 'A',
        month: 'August 2026',
        issueDate: '2026-08-01',
        dueDate: '2026-08-25',
        items: [
          { feeTypeId: 'ft_tuition', name: 'Monthly Tuition Fee', amount: 400 },
          { feeTypeId: 'ft_art', name: 'Art & Design Kit', amount: 50 },
        ],
        subtotal: 450,
        discount: 0,
        fine: 0,
        totalAmount: 450,
        paidAmount: 0,
        balance: 450,
        status: 'pending',
        createdAt: now,
      },
    ];

    for (const inv of invoices) {
      await setDoc(doc(db, `schools/${school1.id}/invoices`, inv.id), inv);
    }

    // ================= 12. EXAMINATIONS & RESULTS =================
    const exam: Examination = {
      id: 'exam_midterm_2026',
      schoolId: school1.id,
      name: 'Mid-Term Comprehensive Examination 2026',
      session: '2026-2027',
      startDate: '2026-07-15',
      endDate: '2026-07-28',
      status: 'published',
      classIds: ['cls_grade_8', 'cls_grade_9', 'cls_grade_10'],
    };
    await setDoc(doc(db, `schools/${school1.id}/examinations`, exam.id), exam);

    const resultAlex: ExamResult = {
      id: 'res_alex_midterm',
      schoolId: school1.id,
      examId: exam.id,
      examName: exam.name,
      studentId: 'std_alex_reynolds',
      studentName: 'Alex Reynolds',
      admissionNo: 'BHP-2024-0081',
      rollNo: '08-A-01',
      classId: 'cls_grade_8',
      className: 'Grade 8',
      sectionName: 'A',
      subjectMarks: [
        { subjectId: 'sub_math', subjectName: 'Advanced Mathematics', marksObtained: 94, maxMarks: 100, grade: 'A+', remarks: 'Outstanding problem solving' },
        { subjectId: 'sub_eng', subjectName: 'English Literature', marksObtained: 88, maxMarks: 100, grade: 'A', remarks: 'Creative vocabulary & eloquence' },
        { subjectId: 'sub_cs', subjectName: 'Computer Science', marksObtained: 96, maxMarks: 100, grade: 'A+', remarks: 'Exceptional coding agility' },
        { subjectId: 'sub_phys', subjectName: 'Physics Fundamentals', marksObtained: 91, maxMarks: 100, grade: 'A+', remarks: 'Strong theoretical grasp' },
      ],
      totalMarksObtained: 369,
      totalMaxMarks: 400,
      percentage: 92.25,
      grade: 'A+',
      gpa: 4.0,
      position: 1,
      remarks: 'Exemplary academic excellence and leadership throughout the examination term.',
      status: 'pass',
      publishedAt: now,
    };
    await setDoc(doc(db, `schools/${school1.id}/results`, resultAlex.id), resultAlex);

    // ================= 13. TIMETABLE SLOTS =================
    const timetableSlots: TimetableSlot[] = [
      { id: 'tt_mon_p1', schoolId: school1.id, classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'A', day: 'Monday', period: 1, startTime: '08:30', endTime: '09:15', subject: 'Advanced Mathematics', teacherName: 'Prof. Clara Oswald', room: 'Room 201' },
      { id: 'tt_mon_p2', schoolId: school1.id, classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'A', day: 'Monday', period: 2, startTime: '09:20', endTime: '10:05', subject: 'English Literature', teacherName: 'Ms. Emily Bronte', room: 'Room 201' },
      { id: 'tt_mon_p3', schoolId: school1.id, classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'A', day: 'Monday', period: 3, startTime: '10:10', endTime: '10:55', subject: 'Computer Science', teacherName: 'Alan Turing Jr.', room: 'Computer Lab 2' },
      { id: 'tt_mon_p4', schoolId: school1.id, classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'A', day: 'Monday', period: 4, startTime: '11:15', endTime: '12:00', subject: 'Physics & Applied Mechanics', teacherName: 'Dr. Robert Oppen', room: 'Physics Lab' },
      { id: 'tt_tue_p1', schoolId: school1.id, classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'A', day: 'Tuesday', period: 1, startTime: '08:30', endTime: '09:15', subject: 'Advanced Mathematics', teacherName: 'Prof. Clara Oswald', room: 'Room 201' },
      { id: 'tt_tue_p2', schoolId: school1.id, classId: 'cls_grade_8', className: 'Grade 8', sectionName: 'A', day: 'Tuesday', period: 2, startTime: '09:20', endTime: '10:05', subject: 'Organic Chemistry', teacherName: 'Dr. Sarah Connor', room: 'Chem Lab' },
    ];

    for (const tt of timetableSlots) {
      await setDoc(doc(db, `schools/${school1.id}/timetables`, tt.id), tt);
    }

    // ================= 14. HOMEWORK =================
    const homeworkList: Homework[] = [
      {
        id: 'hw_math_quadratics',
        schoolId: school1.id,
        classId: 'cls_grade_8',
        className: 'Grade 8',
        sectionName: 'A',
        subjectId: 'sub_math',
        subjectName: 'Advanced Mathematics',
        teacherId: 'tch_clara',
        teacherName: 'Prof. Clara Oswald',
        title: 'Quadratic Equations & Factoring Problem Set',
        description: 'Complete textbook Exercises 4.2 through 4.5 (Problems 1 to 20). Show step-by-step discriminant calculations.',
        assignedDate: '2026-08-16',
        dueDate: '2026-08-20',
        submissionCount: 22,
        totalStudents: 30,
        status: 'active',
      },
      {
        id: 'hw_eng_essay',
        schoolId: school1.id,
        classId: 'cls_grade_8',
        className: 'Grade 8',
        sectionName: 'A',
        subjectId: 'sub_eng',
        subjectName: 'English Literature',
        teacherId: 'tch_emily',
        teacherName: 'Ms. Emily Bronte',
        title: 'Analytical Essay on Romantic Era Poetry',
        description: 'Draft a 600-word structured critique analyzing metaphorical contrast in William Wordsworth\'s selected sonnets.',
        assignedDate: '2026-08-15',
        dueDate: '2026-08-22',
        submissionCount: 18,
        totalStudents: 30,
        status: 'active',
      },
    ];

    for (const hw of homeworkList) {
      await setDoc(doc(db, `schools/${school1.id}/homework`, hw.id), hw);
    }

    // ================= 15. NOTICES & EVENTS =================
    const notices: Notice[] = [
      {
        id: 'not_sports_day',
        schoolId: school1.id,
        title: 'Annual Inter-House Sports Olympiad 2026',
        content: 'Beacon Hill Academy cordially invites all students and esteemed parents to the 14th Annual Sports Day celebrations on the main athletic tracks.',
        category: 'event',
        targetAudience: 'all',
        publishedBy: 'Principal Office',
        publishedDate: '2026-08-14',
        isPinned: true,
      },
      {
        id: 'not_global_system',
        schoolId: 'global',
        title: 'System Upgraded: Gemini 2.5 AI Educational Copilot Enabled',
        content: 'All faculty members and school administrators now have direct access to AI lesson planner, MCQ quiz builder, and institutional intelligence analytics.',
        category: 'general',
        targetAudience: 'all',
        publishedBy: 'Super Admin Victoria Vance',
        publishedDate: '2026-08-17',
        isPinned: true,
      },
    ];

    for (const n of notices) {
      await setDoc(doc(db, 'notices', n.id), n);
    }

    // ================= 16. LIBRARY & TRANSPORT =================
    const books: LibraryBook[] = [
      { id: 'bk_01', schoolId: school1.id, title: 'Principles of Mathematical Analysis', author: 'Walter Rudin', isbn: '978-0070542358', category: 'Mathematics', totalCopies: 15, availableCopies: 12 },
      { id: 'bk_02', schoolId: school1.id, title: 'The Feynman Lectures on Physics', author: 'Richard P. Feynman', isbn: '978-0465024933', category: 'Physics', totalCopies: 10, availableCopies: 8 },
      { id: 'bk_03', schoolId: school1.id, title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 8, availableCopies: 5 },
    ];

    for (const b of books) {
      await setDoc(doc(db, `schools/${school1.id}/books`, b.id), b);
    }

    const routes: TransportRoute[] = [
      {
        id: 'route_north_01',
        schoolId: school1.id,
        routeName: 'Route #1 - North Brookline & Cambridge',
        startPoint: 'Harvard Square',
        endPoint: 'Beacon Hill Academy Gate A',
        vehicleNumber: 'BUS-MA-8821',
        driverName: 'Mr. Hector Salamanca',
        driverPhone: '+1 (617) 555-0922',
        capacity: 45,
        assignedStudents: 38,
        monthlyFee: 120,
        stops: [
          { stopName: 'Harvard Yard Gate', time: '07:15 AM', fee: 120 },
          { stopName: 'Memorial Drive Crossing', time: '07:30 AM', fee: 120 },
          { stopName: 'Beacon St Junction', time: '07:45 AM', fee: 120 },
        ],
      },
    ];

    for (const r of routes) {
      await setDoc(doc(db, `schools/${school1.id}/routes`, r.id), r);
    }

    return {
      success: true,
      message: 'Successfully initialized multi-tenant database with 2 schools and complete academic records!',
    };
  } catch (error: any) {
    console.error('Seed Database error:', error);
    return {
      success: false,
      message: error.message || 'Failed to seed database',
    };
  }
}
