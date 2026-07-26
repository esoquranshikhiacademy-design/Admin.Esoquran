"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Loader2,
  FileText,
  Video,
  Layers,
  Pencil,
  Trash2,
  Inbox,
  Save,
  Star,
} from "lucide-react";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  getCourseById,
  updateCourse,
  getLessonsByCourse,
  deleteLesson,
  reorderLessons,
} from "@/lib/services/courseService";
import type { Course, CourseLevel, CourseStatus, Lesson } from "@/types/course";

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: "beginner", label: "শুরুর স্তর" },
  { value: "intermediate", label: "মধ্যম স্তর" },
  { value: "advanced", label: "উচ্চ স্তর" },
];

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: "draft", label: "খসড়া" },
  { value: "published", label: "প্রকাশিত" },
  { value: "archived", label: "আর্কাইভড" },
];

const CONTENT_ICON = {
  video: Video,
  text: FileText,
  mixed: Layers,
};

function LessonRow({
  lesson,
  courseId,
  onDeleteRequest,
}: {
  lesson: Lesson;
  courseId: string;
  onDeleteRequest: (lesson: Lesson) => void;
}) {
  const Icon = CONTENT_ICON[lesson.contentType];
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-3.5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-ink-800">{lesson.title}</p>
          {lesson.isFreePreview && (
            <span
              className="flex shrink-0 items-center gap-0.5 rounded-full bg-gold-100 px-1.5 py-0.5 text-[10px] font-medium text-gold-800"
              title="ফ্রি প্রিভিউ"
            >
              <Star size={9} /> ফ্রি
            </span>
          )}
        </div>
        <p className="truncate text-xs text-ink-400">
          {lesson.durationMinutes ? `${lesson.durationMinutes} মিনিট` : "সময় নির্ধারিত নয়"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/courses/${courseId}/lessons/${lesson.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-primary-700 hover:bg-primary-50"
          aria-label="লেসন এডিট করুন"
        >
          <Pencil size={15} />
        </Link>
        <button
          onClick={() => onDeleteRequest(lesson)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
          aria-label="লেসন মুছে ফেলুন"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}

function CourseDetailContent({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ফর্ম ফিল্ড
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [status, setStatus] = useState<CourseStatus>("draft");
  const [instructorName, setInstructorName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("0");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);

  async function load() {
    setIsLoading(true);
    setNotFound(false);
    try {
      const [courseData, lessonData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId),
      ]);
      if (!courseData) {
        setNotFound(true);
        return;
      }
      setCourse(courseData);
      setLessons(lessonData);
      setTitle(courseData.title);
      setTitleEn(courseData.titleEn ?? "");
      setDescription(courseData.description);
      setCategory(courseData.category);
      setLevel(courseData.level);
      setStatus(courseData.status);
      setInstructorName(courseData.instructorName);
      setEstimatedHours(String(courseData.estimatedHours));
    } catch {
      setErrorMsg("কোর্সের তথ্য লোড করা যায়নি।");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage("");
    setErrorMsg("");
    try {
      await updateCourse(courseId, {
        title,
        titleEn: titleEn || undefined,
        description,
        category,
        level,
        status,
        instructorName,
        estimatedHours: Number(estimatedHours) || 0,
      });
      setSaveMessage("পরিবর্তন সেভ হয়েছে।");
    } catch {
      setErrorMsg("সেভ করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReorderLessons(newOrder: Lesson[]) {
    setLessons(newOrder);
    try {
      await reorderLessons(courseId, newOrder.map((l) => l.id));
    } catch {
      setErrorMsg("লেসনের ক্রম সেভ করা যায়নি। পেজ রিলোড করে আবার চেষ্টা করুন।");
      load();
    }
  }

  async function handleConfirmDeleteLesson() {
    if (!deleteTarget) return;
    setIsDeletingLesson(true);
    try {
      await deleteLesson(courseId, deleteTarget.id);
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setCourse((prev) => (prev ? { ...prev, totalLessons: prev.totalLessons - 1 } : prev));
      setDeleteTarget(null);
    } catch {
      setErrorMsg("লেসন মুছে ফেলা যায়নি।");
    } finally {
      setIsDeletingLesson(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-primary-600" size={28} />
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-ink-500">এই কোর্সটি খুঁজে পাওয়া যায়নি।</p>
        <Link href="/" className="mt-4 inline-block text-primary-700 underline">
          কোর্স তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/" className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
        <ArrowLeft size={14} /> কোর্স তালিকায় ফিরে যান
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-primary-950">কোর্স এডিট করুন</h1>

      {errorMsg && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMsg}</p>
      )}

      <div className="space-y-4 rounded-2xl border border-primary-100 bg-white p-5">
        <Input
          id="title"
          label="কোর্সের নাম (বাংলা)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          id="titleEn"
          label="কোর্সের নাম (ইংরেজি, ঐচ্ছিক)"
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
            className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2"
          />
        </div>
        <Input
          id="category"
          label="ক্যাটাগরি"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">স্ট্যাটাস</label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  status === opt.value
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
          value={instructorName}
          onChange={(e) => setInstructorName(e.target.value)}
        />
        <Input
          id="hours"
          type="number"
          label="আনুমানিক সময় (ঘণ্টা)"
          value={estimatedHours}
          onChange={(e) => setEstimatedHours(e.target.value)}
          min={0}
        />

        {saveMessage && (
          <p className="rounded-lg bg-primary-50 p-3 text-sm text-primary-800">{saveMessage}</p>
        )}

        <Button onClick={handleSave} isLoading={isSaving} className="w-auto px-5">
          <Save size={15} /> পরিবর্তন সেভ করুন
        </Button>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-950">
            লেসন সমূহ ({lessons.length})
          </h2>
          <Link
            href={`/courses/${courseId}/lessons/new`}
            className="flex items-center gap-1.5 rounded-xl bg-primary-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            <Plus size={15} /> নতুন লেসন
          </Link>
        </div>

        {lessons.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 py-12 text-center">
            <Inbox className="mb-3 text-primary-400" size={28} />
            <p className="text-sm text-ink-500">এই কোর্সে এখনো কোনো লেসন নেই।</p>
          </div>
        )}

        {lessons.length > 0 && (
          <SortableList
            items={lessons}
            onReorder={handleReorderLessons}
            renderItem={(lesson) => (
              <LessonRow
                lesson={lesson}
                courseId={courseId}
                onDeleteRequest={setDeleteTarget}
              />
            )}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="লেসন মুছে ফেলবেন?"
        description={`"${deleteTarget?.title}" লেসনটি এবং এর কুইজ ও মন্তব্য স্থায়ীভাবে মুছে যাবে।`}
        isLoading={isDeletingLesson}
        onConfirm={handleConfirmDeleteLesson}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = usePromise(params);
  return (
    <AdminRoute>
      <AdminHeader />
      <CourseDetailContent courseId={courseId} />
    </AdminRoute>
  );
}
