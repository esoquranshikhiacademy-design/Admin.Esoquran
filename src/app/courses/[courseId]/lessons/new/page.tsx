"use client";

import { useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { LessonForm, emptyLessonFormValues, type LessonFormValues } from "@/components/admin/LessonForm";
import { createLesson, getLessonsByCourse, updateLesson } from "@/lib/services/courseService";
import { uploadLessonPdf } from "@/lib/services/storageService";
import { createDefaultLesson } from "@/types/course";

function NewLessonContent({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(values: LessonFormValues, pdfFile: File | null) {
    setErrorMsg("");
    try {
      const existingLessons = await getLessonsByCourse(courseId);
      const nextOrder = existingLessons.length;

      const lessonData = createDefaultLesson({
        courseId,
        title: values.title,
        order: nextOrder,
        summary: values.summary,
      });
      lessonData.contentType = values.contentType;
      lessonData.youtubeVideoId = values.youtubeVideoId || null;
      lessonData.durationMinutes = Number(values.durationMinutes) || 0;
      lessonData.transcript = values.transcript;
      lessonData.referenceNotes = values.referenceNotes;
      lessonData.isFreePreview = values.isFreePreview;
      // প্রথম লেসনটি স্বয়ংক্রিয়ভাবে ফ্রি প্রিভিউ - নতুন শিক্ষার্থীরা এনরোল
      // করার আগে কোর্সের মান যাচাই করতে পারবে
      if (nextOrder === 0) lessonData.isFreePreview = true;

      const lessonId = await createLesson(courseId, lessonData);

      if (pdfFile) {
        const { url, name } = await uploadLessonPdf(courseId, lessonId, pdfFile);
        await updateLesson(courseId, lessonId, { pdfUrl: url, pdfName: name });
      }

      router.push(`/courses/${courseId}`);
    } catch {
      setErrorMsg("লেসন তৈরি করা যায়নি। আবার চেষ্টা করুন।");
      throw new Error("submit failed");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link
        href={`/courses/${courseId}`}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft size={14} /> কোর্সে ফিরে যান
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-primary-950">নতুন লেসন যোগ করুন</h1>

      <LessonForm
        initialValues={emptyLessonFormValues}
        onSubmit={handleSubmit}
        submitLabel="লেসন যোগ করুন"
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default function NewLessonPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = usePromise(params);
  return (
    <AdminRoute>
      <AdminHeader />
      <NewLessonContent courseId={courseId} />
    </AdminRoute>
  );
}
