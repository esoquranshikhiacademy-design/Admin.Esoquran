/**
 * ইউজার রোল সিস্টেম
 * Firestore এ প্রতিটা ইউজার ডকুমেন্টে role ফিল্ড থাকবে,
 * যা দিয়ে dashboard এবং permission নির্ধারণ হবে।
 */
export type UserRole = "student" | "teacher" | "admin";

export type LanguagePreference = "bn" | "en" | "ar";

/**
 * Firestore collection: users/{uid}
 * এটা পুরো ইকোসিস্টেমের কেন্দ্রীয় ইউজার ডকুমেন্ট।
 * পরবর্তী ফেজে (progress, enrollments ইত্যাদি) সাব-কালেকশন হিসেবে যুক্ত হবে,
 * কিন্তু এই মূল ডকুমেন্ট flat এবং স্থিতিশীল থাকবে।
 */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  languagePreference: LanguagePreference;
  createdAt: string; // ISO string
  updatedAt: string;

  // Onboarding / Assessment স্ট্যাটাস (Phase 3 এ ব্যবহার হবে, এখন থেকেই স্কিমাতে রাখা)
  hasCompletedAssessment: boolean;
  currentLevel?: "beginner" | "intermediate" | "advanced";

  // Gamification প্লেসহোল্ডার (Phase 5), স্কিমা সংঘর্ষ এড়াতে এখনই যোগ করা
  xp: number;
  coins: number;
  streakDays: number;
  lastActiveDate?: string;
}

/**
 * নতুন ইউজার তৈরির সময়ের ডিফল্ট মান
 */
export function createDefaultUserProfile(
  uid: string,
  name: string,
  email: string,
  photoURL?: string | null
): UserProfile {
  const now = new Date().toISOString();
  return {
    uid,
    name,
    email,
    photoURL: photoURL ?? null,
    role: "student",
    languagePreference: "bn",
    createdAt: now,
    updatedAt: now,
    hasCompletedAssessment: false,
    xp: 0,
    coins: 0,
    streakDays: 0,
  };
}
