import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { logAuditEvent } from './auditService';

export async function getAttendanceByDateAndClass(
  schoolId: string,
  date: string,
  classId?: string,
  sectionName?: string
): Promise<AttendanceRecord[]> {
  try {
    const attRef = collection(db, `schools/${schoolId}/attendance`);
    const snap = await getDocs(attRef);
    let records = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
    if (date) {
      records = records.filter((r) => r.date === date);
    }
    if (classId && classId !== 'all') {
      records = records.filter((r) => r.classId === classId);
    }
    if (sectionName && sectionName !== 'all') {
      records = records.filter((r) => r.sectionName === sectionName);
    }
    return records;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
}

export const getAttendanceByDate = (schoolId: string, date: string, classId?: string) =>
  getAttendanceByDateAndClass(schoolId, date, classId);

export async function saveBulkAttendance(
  schoolId: string,
  records: Omit<AttendanceRecord, 'id' | 'schoolId' | 'createdAt'>[],
  recordedBy = 'Teacher'
): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  records.forEach((record) => {
    // Unique ID based on date + targetId
    const docId = `${record.date}_${record.targetId}`;
    const docRef = doc(db, `schools/${schoolId}/attendance`, docId);
    batch.set(
      docRef,
      {
        ...record,
        id: docId,
        schoolId,
        createdAt: now,
      },
      { merge: true }
    );
  });

  await batch.commit();

  await logAuditEvent({
    schoolId,
    userId: 'user',
    userName: typeof recordedBy === 'object' ? (recordedBy as any)?.name || 'Teacher' : recordedBy,
    role: 'teacher',
    action: 'MARK_ATTENDANCE',
    module: 'Attendance',
    details: `Marked attendance for ${records.length} students on ${records[0]?.date || 'today'}`,
  });
}

export const markBatchAttendance = saveBulkAttendance;
export const markAttendance = saveBulkAttendance;

