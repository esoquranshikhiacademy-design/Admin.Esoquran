"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createCourse } from "@/lib/services/courseService";
import { createDefaultCourse } from "@/types/course";
import type { CourseLevel } from "@/types/course";

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: "beginner", label: "শুরুর স্তর" },
  { value: "intermediate", label: "মধ্যম স্তর" },
  { value: "advanced", label: "উচ্চ স্তর" },
];

function NewCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [instructorName, setInstructorName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const courseData = createDefaultCourse({
        title,
        description,
        category,
        level,
        instructorName,
      });
      courseData.titleEn = titleEn || undefined;
      courseData.estimatedHours = Number(estimatedHours) || 0;
      // নতুন কোর্স সবসময় draft হিসেবে তৈরি হয় - প্রকাশ করার সিদ্ধান্ত
      // ড্যাশবোর্ড থেকে লেসন যোগ করার পরে নেওয়া ভালো (খালি কোর্স যেন
      // ভুলবশত প্রকাশিত না হয়ে যায়)।

      const courseId = await createCourse(courseData);
      router.push(`/courses/${courseId}/lessons/new`);
    } catch {
      setErrorMsg("কোর্স তৈরি করা যায়নি। আবার চেষ্টা করুন।");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link href="/" className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
        <ArrowLeft size={14} /> ফিরে যান
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-primary-950">নতুন কোর্স তৈরি করুন</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="title"
          label="কোর্সের নাম (বাংলা)"
          placeholder="যেমন: তাজবীদের মূল নিয়মাবলী"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          id="titleEn"
          label="কোর্সের নাম (ইংরেজি, ঐচ্ছিক)"
          placeholder="e.g. Foundations of Tajweed"
          value={titleEn}
          onChange={(e) => setTitleEn(e.target.value)}
        />

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink-700">
            বিবরণ
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2"
          />
        </div>

        <Input
          id="category"
          label="ক্যাটাগরি"
          placeholder="যেমন: তাজবীদ, আরবি ভাষা"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">লেভেল</label>
          <div className="flex gap-2">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLevel(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  level === opt.value
                    ? "border-primary-700 bg-primary-700 text-white"
                    : "border-ink-200 text-ink-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          id="instructor"
          label="শিক্ষকের নাম"
          placeholder="যেমন: উস্তাদ আব্দুল্লাহ"
          value={instructorName}
          onChange={(e) => setInstructorName(e.target.value)}
          required
        />

        <Input
          id="hours"
          type="number"
          label="আনুমানিক সময় (ঘণ্টা)"
          value={estimatedHours}
          onChange={(e) => setEstimatedHours(e.target.value)}
          min={0}
        />

        {errorMsg && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMsg}</p>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          কোর্স তৈরি করুন ও লেসন যোগ করুন
        </Button>
      </form>
    </div>
  );
}

export default function NewCoursePage() {
  return (
    <AdminRoute>
      <AdminHeader />
      <NewCourseForm />
    </AdminRoute>
  );
}
