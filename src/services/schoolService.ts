import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { School, SchoolStats } from '../types';
import { logAuditEvent } from './auditService';

const SCHOOLS_COLLECTION = 'schools';

export async function getAllSchools(): Promise<School[]> {
  try {
    const querySnapshot = await getDocs(collection(db, SCHOOLS_COLLECTION));
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as School[];
  } catch (error) {
    console.error('Error fetching schools:', error);
    return [];
  }
}

export async function getSchoolById(schoolId: string): Promise<School | null> {
  try {
    const docRef = doc(db, SCHOOLS_COLLECTION, schoolId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as School;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching school ${schoolId}:`, error);
    return null;
  }
}

export async function createSchool(
  data: Omit<School, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string = 'system',
  userName: string = 'Super Admin'
): Promise<School> {
  const schoolId = `sch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newSchool: School = {
    ...data,
    id: schoolId,
    createdAt: now,
    updatedAt: now,
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalStaff: 0,
      totalClasses: 0,
      totalRevenue: 0,
      pendingFees: 0,
      attendanceRate: 95,
      ...data.stats,
    },
  };

  await setDoc(doc(db, SCHOOLS_COLLECTION, schoolId), newSchool);

  // Initialize default academic session
  const sessionRef = doc(db, `schools/${schoolId}/academicSessions`, 'current_session');
  await setDoc(sessionRef, {
    id: 'current_session',
    schoolId,
    name: data.activeSession || '2026-2027',
    startDate: '2026-08-01',
    endDate: '2027-05-31',
    isCurrent: true,
  });

  await logAuditEvent({
    schoolId,
    userId,
    userName,
    role: 'super_admin',
    action: 'CREATE_SCHOOL',
    module: 'Schools',
    details: `Created school: ${data.name} (${data.code})`,
  });

  return newSchool;
}

export async function updateSchool(
  schoolId: string,
  data: Partial<School>,
  userId: string = 'system',
  userName: string = 'Admin'
): Promise<void> {
  const docRef = doc(db, SCHOOLS_COLLECTION, schoolId);
  const now = new Date().toISOString();
  await updateDoc(docRef, { ...data, updatedAt: now });

  await logAuditEvent({
    schoolId,
    userId,
    userName,
    role: 'super_admin',
    action: 'UPDATE_SCHOOL',
    module: 'Schools',
    details: `Updated school settings for ${schoolId}`,
  });
}

export async function toggleSchoolStatus(
  schoolId: string,
  status: 'active' | 'inactive' | 'suspended',
  userId: string = 'system',
  userName: string = 'Super Admin'
): Promise<void> {
  const docRef = doc(db, SCHOOLS_COLLECTION, schoolId);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent({
    schoolId,
    userId,
    userName,
    role: 'super_admin',
    action: 'CHANGE_SCHOOL_STATUS',
    module: 'Schools',
    details: `Changed school status to: ${status}`,
  });
}
