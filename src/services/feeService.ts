import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { FeeInvoice, FeeStructure, InvoiceStatus } from '../types';
import { logAuditEvent } from './auditService';

export async function getInvoices(schoolId: string, status?: string): Promise<FeeInvoice[]> {
  try {
    const invRef = collection(db, `schools/${schoolId}/invoices`);
    const snapshot = await getDocs(invRef);
    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeeInvoice));
    if (status && status !== 'all') {
      list = list.filter((inv) => inv.status === status);
    }
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return list;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export async function getFeeStructures(schoolId: string): Promise<FeeStructure[]> {
  try {
    const snap = await getDocs(collection(db, `schools/${schoolId}/fee_structures`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FeeStructure));
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    return [];
  }
}

export async function createFeeStructure(
  schoolId: string,
  data: Omit<FeeStructure, 'id' | 'schoolId'>,
  _author?: any
): Promise<FeeStructure> {
  const id = `fs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const item: FeeStructure = { ...data, id, schoolId };
  await setDoc(doc(db, `schools/${schoolId}/fee_structures`, id), item);
  return item;
}

export async function createInvoice(
  schoolId: string,
  data: any,
  author: any = { id: 'admin', name: 'Accountant' },
  ..._rest: any[]
): Promise<FeeInvoice> {
  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newInvoice: FeeInvoice = {
    ...data,
    id: invoiceId,
    schoolId,
    createdAt: now,
  };

  await setDoc(doc(db, `schools/${schoolId}/invoices`, invoiceId), newInvoice);

  await logAuditEvent({
    schoolId,
    userId: typeof author === 'object' ? author?.id || 'admin' : 'admin',
    userName: typeof author === 'object' ? author?.name || 'Accountant' : 'Accountant',
    role: 'accountant',
    action: 'CREATE_INVOICE',
    module: 'Fees',
    details: `Generated voucher ${newInvoice.invoiceNumber} for ${newInvoice.studentName} ($${newInvoice.totalAmount})`,
  });

  return newInvoice;
}


export async function recordPayment(
  schoolId: string,
  invoiceId: string,
  arg3: any,
  arg4?: any,
  arg5?: any,
  arg6?: any
): Promise<void> {
  const docRef = doc(db, `schools/${schoolId}/invoices`, invoiceId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) throw new Error('Invoice not found');
  const invoice = snap.data() as FeeInvoice;

  let paidAmount = 0;
  let paymentMethod: any = 'cash';
  let transactionRef = '';
  let notes = '';
  let author: any = { id: 'admin', name: 'Accountant' };

  if (typeof arg3 === 'number') {
    paidAmount = arg3;
    paymentMethod = arg4 || 'cash';
    transactionRef = arg5 || '';
    if (arg6) author = arg6;
  } else if (typeof arg3 === 'object' && arg3 !== null) {
    paidAmount = arg3.paidAmount || arg3.amount || 0;
    paymentMethod = arg3.paymentMethod || 'cash';
    transactionRef = arg3.transactionRef || '';
    notes = arg3.notes || '';
    if (arg4) author = arg4;
  }

  const newPaidAmount = (invoice.paidAmount || 0) + paidAmount;
  const newBalance = Math.max(0, invoice.totalAmount - newPaidAmount);
  const newStatus: InvoiceStatus = newBalance === 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending';

  await updateDoc(docRef, {
    paidAmount: newPaidAmount,
    balance: newBalance,
    status: newStatus,
    paymentMethod,
    paymentDate: new Date().toISOString(),
    transactionRef,
    notes,
  });

  await logAuditEvent({
    schoolId,
    userId: typeof author === 'object' ? author?.id || 'admin' : 'admin',
    userName: typeof author === 'object' ? author?.name || 'Accountant' : 'Accountant',
    role: 'accountant',
    action: 'RECEIVE_PAYMENT',
    module: 'Fees',
    details: `Received payment of $${paidAmount} for Voucher ${invoice.invoiceNumber} (${invoice.studentName})`,
  });
}
