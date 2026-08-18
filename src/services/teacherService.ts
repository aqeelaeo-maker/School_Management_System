import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Teacher } from '../types';
import { logAuditEvent } from './auditService';

export async function getTeachers(schoolId: string): Promise<Teacher[]> {
  try {
    const snapshot = await getDocs(collection(db, `schools/${schoolId}/teachers`));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Teacher));
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
}

export async function createTeacher(
  schoolId: string,
  data: Omit<Teacher, 'id' | 'createdAt' | 'schoolId'>,
  author = { id: 'admin', name: 'Admin', role: 'school_admin' }
): Promise<Teacher> {
  const teacherId = `tch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newTeacher: Teacher = {
    ...data,
    id: teacherId,
    schoolId,
    createdAt: now,
  };

  await setDoc(doc(db, `schools/${schoolId}/teachers`, teacherId), newTeacher);

  await logAuditEvent({
    schoolId,
    userId: author.id,
    userName: author.name,
    role: author.role as any,
    action: 'ADD_TEACHER',
    module: 'Teachers',
    details: `Appointed teacher ${newTeacher.name} (${newTeacher.employeeId})`,
  });

  return newTeacher;
}

export async function updateTeacher(
  schoolId: string,
  teacherId: string,
  data: Partial<Teacher>,
  author = { id: 'admin', name: 'Admin', role: 'school_admin' }
): Promise<void> {
  const docRef = doc(db, `schools/${schoolId}/teachers`, teacherId);
  await updateDoc(docRef, data);

  await logAuditEvent({
    schoolId,
    userId: author.id,
    userName: author.name,
    role: author.role as any,
    action: 'UPDATE_TEACHER',
    module: 'Teachers',
    details: `Updated teacher profile ${teacherId}`,
  });
}

export async function deleteTeacher(
  schoolId: string,
  teacherId: string,
  author = { id: 'admin', name: 'Admin', role: 'school_admin' }
): Promise<void> {
  await deleteDoc(doc(db, `schools/${schoolId}/teachers`, teacherId));

  await logAuditEvent({
    schoolId,
    userId: author.id,
    userName: author.name,
    role: author.role as any,
    action: 'DELETE_TEACHER',
    module: 'Teachers',
    details: `Removed teacher record ${teacherId}`,
  });
}
