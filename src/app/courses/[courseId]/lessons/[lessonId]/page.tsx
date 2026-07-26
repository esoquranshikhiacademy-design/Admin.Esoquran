"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { LessonForm, lessonToFormValues, type LessonFormValues } from "@/components/admin/LessonForm";
import { getLessonById, updateLesson } from "@/lib/services/courseService";
import { uploadLessonPdf, deleteLessonPdf } from "@/lib/services/storageService";
import type { Lesson } from "@/types/course";

function EditLessonContent({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getLessonById(courseId, lessonId);
        if (!data) {
          setNotFound(true);
          return;
        }
        setLesson(data);
      } catch {
        setErrorMsg("লেসনের তথ্য লোড করা যায়নি।");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [courseId, lessonId]);

  async function handleSubmit(values: LessonFormValues, pdfFile: File | null, removePdf: boolean) {
    setErrorMsg("");
    try {
      let pdfUrl = lesson?.pdfUrl ?? null;
      let pdfName = lesson?.pdfName ?? null;

      if (removePdf && lesson?.pdfUrl) {
        await deleteLessonPdf(lesson.pdfUrl);
        pdfUrl = null;
        pdfName = null;
      }

      if (pdfFile) {
        if (lesson?.pdfUrl) await deleteLessonPdf(lesson.pdfUrl);
        const uploaded = await uploadLessonPdf(courseId, lessonId, pdfFile);
        pdfUrl = uploaded.url;
        pdfName = uploaded.name;
      }

      await updateLesson(courseId, lessonId, {
        title: values.title,
        contentType: values.contentType,
        youtubeVideoId: values.youtubeVideoId || null,
        durationMinutes: Number(values.durationMinutes) || 0,
        summary: values.summary,
        transcript: values.transcript,
        referenceNotes: values.referenceNotes,
        isFreePreview: values.isFreePreview,
        pdfUrl,
        pdfName,
      });

      router.push(`/courses/${courseId}`);
    } catch {
      setErrorMsg("পরিবর্তন সেভ করা যায়নি। আবার চেষ্টা করুন।");
      throw new Error("submit failed");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-primary-600" size={28} />
      </div>
    );
  }

  if (notFound || !lesson) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-ink-500">এই লেসনটি খুঁজে পাওয়া যায়নি।</p>
        <Link href={`/courses/${courseId}`} className="mt-4 inline-block text-primary-700 underline">
          কোর্সে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link
        href={`/courses/${courseId}`}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft size={14} /> কোর্সে ফিরে যান
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-primary-950">লেসন এডিট করুন</h1>

      <LessonForm
        initialValues={lessonToFormValues(lesson)}
        existingPdfName={lesson.pdfName}
        onSubmit={handleSubmit}
        submitLabel="পরিবর্তন সেভ করুন"
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default function EditLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = usePromise(params);
  return (
    <AdminRoute>
      <AdminHeader />
      <EditLessonContent courseId={courseId} lessonId={lessonId} />
    </AdminRoute>
  );
}
