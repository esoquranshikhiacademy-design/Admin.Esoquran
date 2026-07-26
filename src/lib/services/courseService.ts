import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteLessonPdf } from "@/lib/services/storageService";
import type { Course, Lesson } from "@/types/course";

const COURSES = "courses";

// --- Courses ---

export async function getAllCoursesForAdmin(): Promise<Course[]> {
  const q = query(collection(db, COURSES), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course);
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const snap = await getDoc(doc(db, COURSES, courseId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Course;
}

/**
 * নতুন কোর্স সবসময় তালিকার শেষে যোগ হয় - বিদ্যমান কোর্সের সংখ্যা গুণে
 * order নির্ধারণ করা হয়, যাতে সব কোর্সের order 0 হয়ে সংঘর্ষ না হয়।
 */
export async function createCourse(data: Omit<Course, "id">): Promise<string> {
  const existingSnap = await getDocs(collection(db, COURSES));
  const docRef = await addDoc(collection(db, COURSES), {
    ...data,
    order: existingSnap.size,
  });
  return docRef.id;
}

export async function updateCourse(
  courseId: string,
  data: Partial<Course>
): Promise<void> {
  await updateDoc(doc(db, COURSES, courseId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * কোর্স মুছে ফেলে - কোর্সের সব লেসন এবং প্রতিটা লেসনের quiz/comments/
 * assignmentSubmissions সাব-কালেকশনও একসাথে মুছে দেয়। Firestore এ
 * ডকুমেন্ট মুছলে তার সাব-কালেকশন এমনিতে মুছে যায় না, তাই ম্যানুয়ালি
 * প্রতিটা লেভেল খুঁজে batch delete করা হচ্ছে।
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const lessons = await getLessonsByCourse(courseId);

  for (const lesson of lessons) {
    await deleteLessonSubcollections(courseId, lesson.id);
    if (lesson.pdfUrl) await deleteLessonPdf(lesson.pdfUrl);
  }

  // ৫০০ এর সীমার মধ্যে batch এ লেসনগুলো মুছে ফেলা (সাধারণত একটা কোর্সে এত লেসন হয় না)
  const batch = writeBatch(db);
  for (const lesson of lessons) {
    batch.delete(doc(db, COURSES, courseId, "lessons", lesson.id));
  }
  batch.delete(doc(db, COURSES, courseId));
  await batch.commit();
}

async function deleteLessonSubcollections(courseId: string, lessonId: string) {
  const subcollections = ["quiz", "comments", "assignmentSubmissions"];
  for (const sub of subcollections) {
    const snap = await getDocs(collection(db, COURSES, courseId, "lessons", lessonId, sub));
    if (snap.empty) continue;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

/**
 * সব কোর্সের order একসাথে আপডেট করে (drag-and-drop reorder এর পর)।
 */
export async function reorderCourses(
  orderedCourseIds: string[]
): Promise<void> {
  const batch = writeBatch(db);
  orderedCourseIds.forEach((courseId, index) => {
    batch.update(doc(db, COURSES, courseId), {
      order: index,
      updatedAt: new Date().toISOString(),
    });
  });
  await batch.commit();
}

// --- Lessons (courses/{courseId}/lessons সাব-কালেকশন) ---

function lessonsCollection(courseId: string) {
  return collection(db, COURSES, courseId, "lessons");
}

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  const q = query(lessonsCollection(courseId), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson);
}

export async function getLessonById(
  courseId: string,
  lessonId: string
): Promise<Lesson | null> {
  const snap = await getDoc(doc(db, COURSES, courseId, "lessons", lessonId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Lesson;
}

export async function createLesson(
  courseId: string,
  data: Omit<Lesson, "id">
): Promise<string> {
  const docRef = await addDoc(lessonsCollection(courseId), data);
  await updateDoc(doc(db, COURSES, courseId), {
    totalLessons: increment(1),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  data: Partial<Lesson>
): Promise<void> {
  await updateDoc(doc(db, COURSES, courseId, "lessons", lessonId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * লেসন মুছে ফেলে - তার quiz/comments/assignmentSubmissions সাব-কালেকশনসহ,
 * এবং কোর্সের totalLessons কাউন্টার কমিয়ে দেয়।
 */
export async function deleteLesson(courseId: string, lessonId: string): Promise<void> {
  const lesson = await getLessonById(courseId, lessonId);
  await deleteLessonSubcollections(courseId, lessonId);
  if (lesson?.pdfUrl) await deleteLessonPdf(lesson.pdfUrl);
  await deleteDoc(doc(db, COURSES, courseId, "lessons", lessonId));
  await updateDoc(doc(db, COURSES, courseId), {
    totalLessons: increment(-1),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * একটা কোর্সের সব লেসনের order একসাথে আপডেট করে (drag-and-drop reorder এর পর)।
 */
export async function reorderLessons(
  courseId: string,
  orderedLessonIds: string[]
): Promise<void> {
  const batch = writeBatch(db);
  orderedLessonIds.forEach((lessonId, index) => {
    batch.update(doc(db, COURSES, courseId, "lessons", lessonId), {
      order: index,
      updatedAt: new Date().toISOString(),
    });
  });
  await batch.commit();
}

/**
 * ব্যবহৃত হচ্ছে কিনা যাচাইয়ের জন্য - কোনো course-এ এই instructor আছে কিনা
 * এই মুহূর্তে ব্যবহার নেই, কিন্তু ভবিষ্যতে instructor ফিল্টারের জন্য রাখা।
 */
export async function getCoursesByCategory(category: string): Promise<Course[]> {
  const q = query(collection(db, COURSES), where("category", "==", category));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course);
}
