import {
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Examination, ExamResult } from '../types';
import { logAuditEvent } from './auditService';

export async function getExaminations(schoolId: string): Promise<Examination[]> {
  try {
    const snapshot = await getDocs(collection(db, `schools/${schoolId}/examinations`));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Examination));
    list.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
    return list;
  } catch (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
}

export const getExams = getExaminations;

export async function createExamination(
  schoolId: string,
  data: Omit<Examination, 'id' | 'schoolId'>,
  _author?: any
): Promise<Examination> {
  const examId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newExam: Examination = {
    ...data,
    id: examId,
    schoolId,
  };
  await setDoc(doc(db, `schools/${schoolId}/examinations`, examId), newExam);
  return newExam;
}

export const createExam = createExamination;

export function calculateGradeAndGPA(marksObtained: number, totalMarks: number) {
  if (!totalMarks || totalMarks === 0) return { percentage: 0, grade: 'N/A', gpa: 0 };
  const percentage = (marksObtained / totalMarks) * 100;
  let grade = 'F';
  let gpa = 0.0;
  if (percentage >= 90) {
    grade = 'A+';
    gpa = 4.0;
  } else if (percentage >= 80) {
    grade = 'A';
    gpa = 3.7;
  } else if (percentage >= 70) {
    grade = 'B';
    gpa = 3.0;
  } else if (percentage >= 60) {
    grade = 'C';
    gpa = 2.0;
  } else if (percentage >= 50) {
    grade = 'D';
    gpa = 1.0;
  }
  return {
    percentage: Math.round(percentage * 10) / 10,
    grade,
    gpa,
  };
}

export async function getExamResults(
  schoolId: string,
  examId?: string,
  classId?: string
): Promise<ExamResult[]> {
  try {
    const resRef = collection(db, `schools/${schoolId}/results`);
    const snapshot = await getDocs(resRef);
    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ExamResult));

    if (examId && examId !== 'all') {
      list = list.filter((r) => r.examId === examId);
    }
    if (classId && classId !== 'all') {
      list = list.filter((r) => r.classId === classId);
    }
    list.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    return list;
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return [];
  }
}

export async function saveExamResult(
  schoolId: string,
  result: Omit<ExamResult, 'id' | 'schoolId'>,
  recordedBy = 'Exam Incharge'
): Promise<ExamResult> {
  const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newResult: ExamResult = {
    ...result,
    id: resultId,
    schoolId,
  };
  await setDoc(doc(db, `schools/${schoolId}/results`, resultId), newResult);

  await logAuditEvent({
    schoolId,
    userId: 'user',
    userName: typeof recordedBy === 'object' ? (recordedBy as any)?.name || 'Exam Incharge' : recordedBy,
    role: 'teacher',
    action: 'RECORD_EXAM_MARKS',
    module: 'Examinations',
    details: `Recorded result for ${newResult.studentName} - ${newResult.examName}: ${newResult.percentage}% (${newResult.grade})`,
  });

  return newResult;
}
