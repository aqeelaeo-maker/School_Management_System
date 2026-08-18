import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Student } from '../types';
import { logAuditEvent } from './auditService';

export async function getStudents(schoolId: string, classId?: string): Promise<Student[]> {
  try {
    const studentsRef = collection(db, `schools/${schoolId}/students`);
    const snapshot = await getDocs(studentsRef);
    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
    if (classId && classId !== 'all') {
      list = list.filter((s) => s.classId === classId);
    }
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export async function getStudentById(schoolId: string, studentId: string): Promise<Student | null> {
  try {
    const docRef = doc(db, `schools/${schoolId}/students`, studentId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Student;
    }
    return null;
  } catch (error) {
    console.error('Error fetching student details:', error);
    return null;
  }
}

export async function createStudent(
  schoolId: string,
  data: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'schoolId'>,
  author = { id: 'admin', name: 'Admin', role: 'school_admin' }
): Promise<Student> {
  const studentId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newStudent: Student = {
    ...data,
    id: studentId,
    schoolId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, `schools/${schoolId}/students`, studentId), newStudent);

  await logAuditEvent({
    schoolId,
    userId: author.id,
    userName: author.name,
    role: author.role as any,
    action: 'ADMIT_STUDENT',
    module: 'Students',
    details: `Admitted student ${newStudent.name} (${newStudent.admissionNo}) into ${newStudent.className}`,
  });

  return newStudent;
}

export async function updateStudent(
  schoolId: string,
  studentId: string,
  data: Partial<Student>,
  author = { id: 'admin', name: 'Admin', role: 'school_admin' }
): Promise<void> {
  const docRef = doc(db, `schools/${schoolId}/students`, studentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent({
    schoolId,
    userId: author.id,
    userName: author.name,
    role: author.role as any,
    action: 'UPDATE_STUDENT',
    module: 'Students',
    details: `Updated record for student ${studentId}`,
  });
}

export async function deleteStudent(
  schoolId: string,
  studentId: string,
  author = { id: 'admin', name: 'Admin', role: 'school_admin' }
): Promise<void> {
  await deleteDoc(doc(db, `schools/${schoolId}/students`, studentId));

  await logAuditEvent({
    schoolId,
    userId: author.id,
    userName: author.name,
    role: author.role as any,
    action: 'DELETE_STUDENT',
    module: 'Students',
    details: `Deleted student record ${studentId}`,
  });
}
