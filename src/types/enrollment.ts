/**
 * Firestore collection: enrollments/{enrollmentId}
 * ডকুমেন্ট আইডি কনভেনশন: `${userId}_${courseId}` — এতে একই ইউজার
 * একই কোর্সে দুইবার enroll request পাঠাতে পারবে না (duplicate ঠেকানো সহজ হবে)।
 *
 * ওয়ার্কফ্লো: student request পাঠায় (status: pending) → admin approve/reject করে।
 */
export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface Enrollment {
  id: string; // `${userId}_${courseId}`
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus;
  requestedAt: string;
  decidedAt?: string | null;
  decidedBy?: string | null; // admin uid
  note?: string; // student এর অনুরোধের সাথে সংক্ষিপ্ত নোট, বা admin এর reject কারণ
}

export function buildEnrollmentId(userId: string, courseId: string): string {
  return `${userId}_${courseId}`;
}

export function createEnrollmentRequest(
  userId: string,
  userName: string,
  userEmail: string,
  courseId: string,
  courseTitle: string
): Enrollment {
  return {
    id: buildEnrollmentId(userId, courseId),
    userId,
    userName,
    userEmail,
    courseId,
    courseTitle,
    status: "pending",
    requestedAt: new Date().toISOString(),
    decidedAt: null,
    decidedBy: null,
  };
}

/**
 * Firestore collection: lessonProgress/{userId}_{lessonId}
 * প্রতিটা ইউজারের প্রতিটা লেসনে progress আলাদা ডকুমেন্ট হিসেবে থাকবে।
 * এটা flat রাখা হলো (nested না করে) যাতে query সহজ হয় -
 * "এই ইউজারের এই কোর্সের সব progress" এক কোয়েরিতে বের করা যাবে।
 */
export interface LessonProgress {
  id: string; // `${userId}_${lessonId}`
  userId: string;
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  videoWatchedPercent: number; // 0-100
  quizScore?: number | null; // percent, quiz থাকলে
  lastAccessedAt: string;
  completedAt?: string | null;
}

export function buildProgressId(userId: string, lessonId: string): string {
  return `${userId}_${lessonId}`;
}
