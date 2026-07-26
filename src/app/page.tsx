"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Loader2,
  BookOpen,
  Pencil,
  Trash2,
  Inbox,
  Eye,
  EyeOff,
  Users,
  ChevronRight,
} from "lucide-react";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  getAllCoursesForAdmin,
  deleteCourse,
  reorderCourses,
  updateCourse,
} from "@/lib/services/courseService";
import { getPendingEnrollments } from "@/lib/services/enrollmentService";
import type { Course, CourseStatus } from "@/types/course";

const STATUS_LABEL: Record<CourseStatus, string> = {
  draft: "খসড়া",
  published: "প্রকাশিত",
  archived: "আর্কাইভড",
};

const STATUS_STYLE: Record<CourseStatus, string> = {
  draft: "bg-ink-100 text-ink-600",
  published: "bg-primary-100 text-primary-800",
  archived: "bg-gold-100 text-gold-800",
};

function CourseCard({
  course,
  onTogglePublish,
  onDeleteRequest,
  isTogglingPublish,
}: {
  course: Course;
  onTogglePublish: (course: Course) => void;
  onDeleteRequest: (course: Course) => void;
  isTogglingPublish: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 rounded-2xl border border-primary-100 bg-white p-4"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <BookOpen size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-ink-800">{course.title}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[course.status]}`}
          >
            {STATUS_LABEL[course.status]}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {course.category} · {course.totalLessons} লেসন · {course.instructorName}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => onTogglePublish(course)}
          disabled={isTogglingPublish}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 disabled:opacity-50"
          aria-label={course.status === "published" ? "খসড়ায় ফেরান" : "প্রকাশ করুন"}
          title={course.status === "published" ? "খসড়ায় ফেরান" : "প্রকাশ করুন"}
        >
          {isTogglingPublish ? (
            <Loader2 size={16} className="animate-spin" />
          ) : course.status === "published" ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
        <Link
          href={`/courses/${course.id}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-primary-700 hover:bg-primary-50"
          aria-label="এডিট করুন"
        >
          <Pencil size={16} />
        </Link>
        <button
          onClick={() => onDeleteRequest(course)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
          aria-label="মুছে ফেলুন"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function DashboardContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function load() {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [courseData, pendingData] = await Promise.all([
        getAllCoursesForAdmin(),
        getPendingEnrollments(),
      ]);
      setCourses(courseData);
      setPendingCount(pendingData.length);
    } catch {
      setErrorMsg("কোর্স তালিকা লোড করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReorder(newOrder: Course[]) {
    setCourses(newOrder); // অপটিমিস্টিক আপডেট - সাথে সাথে UI তে দেখা যাবে
    try {
      await reorderCourses(newOrder.map((c) => c.id));
    } catch {
      setErrorMsg("ক্রম সেভ করা যায়নি। পেজ রিলোড করে আবার চেষ্টা করুন।");
      load();
    }
  }

  async function handleTogglePublish(course: Course) {
    setTogglingId(course.id);
    try {
      const newStatus: CourseStatus = course.status === "published" ? "draft" : "published";
      await updateCourse(course.id, { status: newStatus });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, status: newStatus } : c))
      );
    } catch {
      setErrorMsg("স্ট্যাটাস পরিবর্তন করা যায়নি।");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCourse(deleteTarget.id);
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setErrorMsg("কোর্স মুছে ফেলা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-950">কোর্স ম্যানেজমেন্ট</h1>
          <p className="mt-1 text-sm text-ink-500">
            কোর্স তৈরি, এডিট, ক্রম সাজানো ও প্রকাশ করুন
          </p>
        </div>
        <Link
          href="/courses/new"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <Plus size={16} /> নতুন কোর্স
        </Link>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMsg}</p>
      )}

      <Link
        href="/enrollments"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50/60 p-4 transition-colors hover:bg-gold-50"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-white">
          <Users size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-800">এনরোলমেন্ট রিকোয়েস্ট</p>
          <p className="text-xs text-ink-500">
            {pendingCount > 0
              ? `${pendingCount}টা রিকোয়েস্ট অনুমোদনের অপেক্ষায় আছে`
              : "এই মুহূর্তে কোনো পেন্ডিং রিকোয়েস্ট নেই"}
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-gold-500 px-1.5 text-xs font-semibold text-white">
            {pendingCount}
          </span>
        )}
        <ChevronRight size={18} className="shrink-0 text-ink-300" />
      </Link>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary-600" size={28} />
        </div>
      )}

      {!isLoading && courses.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 py-16 text-center">
          <Inbox className="mb-3 text-primary-400" size={32} />
          <p className="text-sm text-ink-500">এখনো কোনো কোর্স তৈরি হয়নি।</p>
          <Link
            href="/courses/new"
            className="mt-4 rounded-xl bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            প্রথম কোর্স তৈরি করুন
          </Link>
        </div>
      )}

      {!isLoading && courses.length > 0 && (
        <SortableList
          items={courses}
          onReorder={handleReorder}
          renderItem={(course) => (
            <CourseCard
              course={course}
              onTogglePublish={handleTogglePublish}
              onDeleteRequest={setDeleteTarget}
              isTogglingPublish={togglingId === course.id}
            />
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="কোর্স মুছে ফেলবেন?"
        description={`"${deleteTarget?.title}" কোর্সটি এবং এর সব লেসন, কুইজ ও মন্তব্য স্থায়ীভাবে মুছে যাবে। এই কাজটি ফেরানো যাবে না।`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminRoute>
      <AdminHeader />
      <DashboardContent />
    </AdminRoute>
  );
}
