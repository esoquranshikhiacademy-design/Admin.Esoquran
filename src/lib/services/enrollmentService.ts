import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Enrollment, EnrollmentStatus } from "@/types/enrollment";

const ENROLLMENTS = "enrollments";

/**
 * নোট: এখানে ইচ্ছাকৃতভাবে Firestore orderBy ব্যবহার করা হয়নি, কারণ
 * where("status") + orderBy("requestedAt") একসাথে করলে Firestore এ
 * composite index তৈরি করতে হয় (কনসোলে গিয়ে বা firestore.indexes.json
 * দিয়ে আলাদা deploy করা লাগে)। এনরোলমেন্টের সংখ্যা সাধারণত বড় হবে না,
 * তাই client-side এ sort করাই সহজ এবং কোনো index সেটআপ ছাড়াই কাজ করবে।
 */
function sortByRequestedAtDesc(list: Enrollment[]): Enrollment[] {
  return [...list].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

function sortByRequestedAtAsc(list: Enrollment[]): Enrollment[] {
  return [...list].sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
}

/**
 * পেন্ডিং তালিকা সবচেয়ে পুরনো রিকোয়েস্ট আগে দেখায় - যে শিক্ষার্থী সবচেয়ে
 * বেশিক্ষণ অপেক্ষা করছে তাকে আগে অ্যাটেন্ড করা উচিত।
 */
export async function getPendingEnrollments(): Promise<Enrollment[]> {
  const q = query(collection(db, ENROLLMENTS), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return sortByRequestedAtAsc(snap.docs.map((d) => d.data() as Enrollment));
}

/**
 * অ্যাডমিন প্যানেলে "সব রিকোয়েস্ট" ট্যাবের জন্য - pending/approved/rejected
 * সব একসাথে, সাম্প্রতিকতম আগে। বড় ডেটাসেটে পরে pagination যোগ করা যাবে।
 */
export async function getAllEnrollments(): Promise<Enrollment[]> {
  const snap = await getDocs(collection(db, ENROLLMENTS));
  return sortByRequestedAtDesc(snap.docs.map((d) => d.data() as Enrollment));
}

export async function getEnrollmentById(enrollmentId: string): Promise<Enrollment | null> {
  const snap = await getDoc(doc(db, ENROLLMENTS, enrollmentId));
  if (!snap.exists()) return null;
  return snap.data() as Enrollment;
}

export async function decideEnrollment(
  enrollmentId: string,
  decision: Extract<EnrollmentStatus, "approved" | "rejected">,
  adminUid: string
): Promise<void> {
  await updateDoc(doc(db, ENROLLMENTS, enrollmentId), {
    status: decision,
    decidedAt: new Date().toISOString(),
    decidedBy: adminUid,
  });
}

/**
 * ভুল করে approve/reject হয়ে গেলে আবার pending এ ফিরিয়ে নেওয়ার জন্য
 * (যেমন: ভুল বাটনে চাপ পড়লে)।
 */
export async function revertEnrollmentToPending(enrollmentId: string): Promise<void> {
  await updateDoc(doc(db, ENROLLMENTS, enrollmentId), {
    status: "pending",
    decidedAt: null,
    decidedBy: null,
  });
}
