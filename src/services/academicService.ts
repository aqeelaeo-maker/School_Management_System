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
import { ClassGroup, Section, Subject, TimetableSlot } from '../types';

export async function getClasses(schoolId: string): Promise<ClassGroup[]> {
  try {
    const snapshot = await getDocs(collection(db, `schools/${schoolId}/classes`));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ClassGroup));
    list.sort((a, b) => (a.numericLevel || 0) - (b.numericLevel || 0));
    return list;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}

export async function createClass(
  schoolId: string,
  data: Omit<ClassGroup, 'id' | 'schoolId'>,
  _author?: any
): Promise<ClassGroup> {
  const classId = `cls_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newClass: ClassGroup = {
    ...data,
    id: classId,
    schoolId,
  };
  await setDoc(doc(db, `schools/${schoolId}/classes`, classId), newClass);
  return newClass;
}

export async function getSubjects(schoolId: string): Promise<Subject[]> {
  try {
    const snapshot = await getDocs(collection(db, `schools/${schoolId}/subjects`));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

export async function createSubject(
  schoolId: string,
  data: Omit<Subject, 'id' | 'schoolId'>,
  _author?: any
): Promise<Subject> {
  const subjectId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newSubject: Subject = {
    ...data,
    id: subjectId,
    schoolId,
  };
  await setDoc(doc(db, `schools/${schoolId}/subjects`, subjectId), newSubject);
  return newSubject;
}

export async function getTimetableSlots(schoolId: string, classId?: string): Promise<TimetableSlot[]> {
  try {
    const slotsRef = collection(db, `schools/${schoolId}/timetables`);
    const snapshot = await getDocs(slotsRef);
    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TimetableSlot));
    if (classId && classId !== 'all') {
      list = list.filter((s) => s.classId === classId);
    }
    list.sort((a, b) => (a.period || 0) - (b.period || 0));
    return list;
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return [];
  }
}

export const getTimetable = getTimetableSlots;

export async function saveTimetableSlot(
  schoolId: string,
  slot: Omit<TimetableSlot, 'id' | 'schoolId'>,
  _author?: any
): Promise<TimetableSlot> {
  const slotId = `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newSlot: TimetableSlot = {
    ...slot,
    id: slotId,
    schoolId,
  };
  await setDoc(doc(db, `schools/${schoolId}/timetables`, slotId), newSlot);
  return newSlot;
}

export const createTimetableSlot = saveTimetableSlot;

export async function deleteTimetableSlot(schoolId: string, slotId: string): Promise<void> {
  await deleteDoc(doc(db, `schools/${schoolId}/timetables`, slotId));
}

// Subject Allocation Service Support
export async function getSubjectAllocations(schoolId: string): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, `schools/${schoolId}/subject_allocations`));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching subject allocations:', error);
    return [];
  }
}

export async function saveSubjectAllocation(
  schoolId: string,
  data: any,
  _author?: any
): Promise<any> {
  const id = `alloc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const item = { ...data, id, schoolId };
  await setDoc(doc(db, `schools/${schoolId}/subject_allocations`, id), item);
  return item;
}

export const allocateSubjectTeacher = saveSubjectAllocation;

export async function deleteSubjectAllocation(schoolId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, `schools/${schoolId}/subject_allocations`, id));
}
