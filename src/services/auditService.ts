import { collection, doc, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuditLog, UserRole } from '../types';

const AUDIT_COLLECTION = 'auditLogs';

export async function logAuditEvent(entry: {
  schoolId?: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  details: string;
}): Promise<void> {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const auditLog: AuditLog = {
      id: logId,
      schoolId: entry.schoolId || 'global',
      userId: entry.userId,
      userName: entry.userName,
      role: entry.role,
      action: entry.action,
      module: entry.module,
      details: entry.details,
      timestamp: now,
    };

    await setDoc(doc(db, AUDIT_COLLECTION, logId), auditLog);
  } catch (error) {
    console.warn('Could not write audit log:', error);
  }
}

export async function getAuditLogs(schoolId?: string, maxRecords = 50): Promise<AuditLog[]> {
  try {
    const logsRef = collection(db, AUDIT_COLLECTION);
    let q = query(logsRef, orderBy('timestamp', 'desc'), limit(maxRecords));

    if (schoolId && schoolId !== 'all') {
      q = query(logsRef, where('schoolId', '==', schoolId), orderBy('timestamp', 'desc'), limit(maxRecords));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}
