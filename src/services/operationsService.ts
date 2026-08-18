import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Homework,
  Notice,
  SchoolEvent,
  LibraryBook,
  BookIssue,
  TransportRoute,
  InventoryItem,
  ExpenseItem,
  PayrollRecord,
  Parent,
} from '../types';

// =================== HOMEWORK ===================
export async function getHomework(schoolId: string, classId?: string): Promise<Homework[]> {
  try {
    const snapshot = await getDocs(collection(db, `schools/${schoolId}/homework`));
    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Homework));
    if (classId && classId !== 'all') {
      list = list.filter((h) => h.classId === classId);
    }
    list.sort((a, b) => (b.assignedDate || '').localeCompare(a.assignedDate || ''));
    return list;
  } catch (error) {
    console.error('Error fetching homework:', error);
    return [];
  }
}

export async function createHomework(
  schoolId: string,
  data: Omit<Homework, 'id' | 'schoolId'>,
  _author?: any
): Promise<Homework> {
  const hwId = `hw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newHw: Homework = {
    ...data,
    id: hwId,
    schoolId,
  };
  await setDoc(doc(db, `schools/${schoolId}/homework`, hwId), newHw);
  return newHw;
}

// =================== NOTICES & EVENTS ===================
export async function getNotices(schoolId?: string): Promise<Notice[]> {
  try {
    const snapshot = await getDocs(collection(db, 'notices'));
    let all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notice));
    if (schoolId) {
      all = all.filter((n) => !n.schoolId || n.schoolId === schoolId || n.schoolId === 'global');
    }
    all.sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''));
    return all;
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
}

export async function createNotice(
  data: Omit<Notice, 'id'>,
  _schoolId?: string,
  _author?: any
): Promise<Notice> {
  const noticeId = `not_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newNotice: Notice = { ...data, id: noticeId };
  await setDoc(doc(db, 'notices', noticeId), newNotice);
  return newNotice;
}

export async function getEvents(schoolId: string): Promise<SchoolEvent[]> {
  try {
    const snapshot = await getDocs(collection(db, `schools/${schoolId}/events`));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SchoolEvent));
    list.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
    return list;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function createEvent(schoolId: string, data: Omit<SchoolEvent, 'id' | 'schoolId'>): Promise<SchoolEvent> {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newEvent: SchoolEvent = { ...data, id: eventId, schoolId };
  await setDoc(doc(db, `schools/${schoolId}/events`, eventId), newEvent);
  return newEvent;
}

// =================== LIBRARY ===================
export async function getLibraryBooks(schoolId: string): Promise<LibraryBook[]> {
  try {
    const snap = await getDocs(collection(db, `schools/${schoolId}/books`));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LibraryBook));
    list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    return list;
  } catch (error) {
    console.error('Error fetching library books:', error);
    return [];
  }
}

export const getBooks = getLibraryBooks;

export async function addLibraryBook(
  schoolId: string,
  data: Omit<LibraryBook, 'id' | 'schoolId'>,
  _author?: any
): Promise<LibraryBook> {
  const bookId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newBook: LibraryBook = { ...data, id: bookId, schoolId };
  await setDoc(doc(db, `schools/${schoolId}/books`, bookId), newBook);
  return newBook;
}

export const createBook = addLibraryBook;

// =================== TRANSPORT ===================
export async function getTransportRoutes(schoolId: string): Promise<TransportRoute[]> {
  try {
    const snap = await getDocs(collection(db, `schools/${schoolId}/routes`));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TransportRoute));
    list.sort((a, b) => (a.routeName || '').localeCompare(b.routeName || ''));
    return list;
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
}

export const getRoutes = getTransportRoutes;

export async function createRoute(
  schoolId: string,
  data: Omit<TransportRoute, 'id' | 'schoolId'>,
  _author?: any
): Promise<TransportRoute> {
  const id = `rt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newRoute: TransportRoute = { ...data, id, schoolId };
  await setDoc(doc(db, `schools/${schoolId}/routes`, id), newRoute);
  return newRoute;
}

// =================== INVENTORY ===================
export async function getInventoryItems(schoolId: string): Promise<InventoryItem[]> {
  try {
    const snap = await getDocs(collection(db, `schools/${schoolId}/inventory`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryItem));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

export async function addInventoryItem(schoolId: string, item: Omit<InventoryItem, 'id' | 'schoolId'>): Promise<InventoryItem> {
  const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newItem: InventoryItem = { ...item, id, schoolId };
  await setDoc(doc(db, `schools/${schoolId}/inventory`, id), newItem);
  return newItem;
}

// =================== EXPENSES ===================
export async function getExpenses(schoolId: string): Promise<ExpenseItem[]> {
  try {
    const snap = await getDocs(collection(db, `schools/${schoolId}/expenses`));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExpenseItem));
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return list;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export async function recordExpense(
  schoolId: string,
  expense: Omit<ExpenseItem, 'id' | 'schoolId'>,
  _author?: any
): Promise<ExpenseItem> {
  const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newExp: ExpenseItem = { ...expense, id, schoolId };
  await setDoc(doc(db, `schools/${schoolId}/expenses`, id), newExp);
  return newExp;
}

export const createExpense = recordExpense;

// =================== PAYROLL ===================
export async function getPayrollRecords(schoolId: string): Promise<PayrollRecord[]> {
  try {
    const snap = await getDocs(collection(db, `schools/${schoolId}/payroll`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PayrollRecord));
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return [];
  }
}

// =================== PARENTS ===================
export async function getParents(schoolId: string): Promise<Parent[]> {
  try {
    const snap = await getDocs(collection(db, `schools/${schoolId}/parents`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Parent));
  } catch (error) {
    console.error('Error fetching parents:', error);
    return [];
  }
}
