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
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile, UserRole, UserStatus } from '../types';
import { logAuditEvent } from './auditService';

const USERS_COLLECTION = 'users';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, profile.uid);
  await setDoc(docRef, {
    ...profile,
    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
  performedBy = { id: 'admin', name: 'Admin', role: 'school_admin' as UserRole }
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent({
    schoolId: data.schoolId,
    userId: performedBy.id,
    userName: performedBy.name,
    role: performedBy.role,
    action: 'UPDATE_USER',
    module: 'Users',
    details: `Updated profile for user ${uid}`,
  });
}

export async function getUsersBySchool(schoolId: string): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
  } catch (error) {
    console.error('Error fetching users for school:', error);
    return [];
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export async function toggleUserStatus(
  uid: string,
  status: UserStatus,
  performedBy = { id: 'admin', name: 'Admin', role: 'school_admin' as UserRole, schoolId: '' }
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent({
    schoolId: performedBy.schoolId,
    userId: performedBy.id,
    userName: performedBy.name,
    role: performedBy.role,
    action: 'CHANGE_USER_STATUS',
    module: 'Users',
    details: `Changed user ${uid} status to ${status}`,
  });
}
