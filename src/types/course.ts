/**
 * Firestore collection: courses/{courseId}
 * প্রতিটা কোর্সের মূল মেটাডেটা। lessons আলাদা সাব-কালেকশনে থাকবে
 * (courses/{courseId}/lessons/{lessonId}) যাতে একটা কোর্স ডকুমেন্ট
 * খুব বড় না হয়ে যায় এবং লেসন আলাদাভাবে query করা যায়।
 */

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus = "draft" | "published" | "archived";

export interface Course {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  thumbnailUrl?: string | null;
  level: CourseLevel;
  status: CourseStatus;
  category: string; // যেমন: "তাজবীদ", "আরবি ভাষা", "কুরআন পাঠ"
  totalLessons: number; // lesson তৈরি/মুছার সময় auto আপডেট হবে
  estimatedHours: number;
  instructorName: string;
  instructorId?: string | null;
  order: number; // course listing এ সাজানোর ক্রম
  createdAt: string;
  updatedAt: string;
}

/**
 * Firestore collection: courses/{courseId}/lessons/{lessonId}
 */
export type LessonContentType = "video" | "text" | "mixed";

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  order: number; // কোর্সের ভেতর লেসনের ক্রম (নেভিগেশনের জন্য জরুরি)
  contentType: LessonContentType;
  youtubeVideoId?: string | null; // শুধু ভিডিও আইডি (যেমন "dQw4w9WgXcQ"), পুরো URL না
  durationMinutes?: number;
  summary: string; // সংক্ষিপ্ত সারাংশ
  transcript?: string; // ভিডিওর লিখিত ট্রান্সক্রিপ্ট
  referenceNotes?: string; // রেফারেন্স / অতিরিক্ত নোট
  pdfUrl?: string | null; // Firebase Storage URL
  pdfName?: string | null;
  relatedTopics?: string[]; // অন্য লেসন/টপিকের নাম বা আইডি রেফারেন্স
  isFreePreview: boolean; // enrollment ছাড়াই দেখা যাবে কিনা (প্রথম লেসন সাধারণত true)
  createdAt: string;
  updatedAt: string;
}

/**
 * নতুন কোর্স তৈরির ডিফল্ট মান
 */
export function createDefaultCourse(
  data: Pick<Course, "title" | "description" | "category" | "level" | "instructorName">
): Omit<Course, "id"> {
  const now = new Date().toISOString();
  return {
    ...data,
    thumbnailUrl: null,
    status: "draft",
    totalLessons: 0,
    estimatedHours: 0,
    instructorId: null,
    order: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultLesson(
  data: Pick<Lesson, "courseId" | "title" | "order" | "summary">
): Omit<Lesson, "id"> {
  const now = new Date().toISOString();
  return {
    ...data,
    contentType: "video",
    youtubeVideoId: null,
    durationMinutes: 0,
    transcript: "",
    referenceNotes: "",
    pdfUrl: null,
    pdfName: null,
    relatedTopics: [],
    isFreePreview: false,
    createdAt: now,
    updatedAt: now,
  };
}
