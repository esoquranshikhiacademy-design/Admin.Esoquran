"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Loader2,
  Inbox,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuth } from "@/context/AuthContext";
import {
  getPendingEnrollments,
  getAllEnrollments,
  decideEnrollment,
  revertEnrollmentToPending,
} from "@/lib/services/enrollmentService";
import type { Enrollment, EnrollmentStatus } from "@/types/enrollment";

type Tab = "pending" | "all";

const STATUS_META: Record<
  EnrollmentStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: { label: "পেন্ডিং", className: "bg-gold-100 text-gold-800", icon: Clock },
  approved: { label: "অনুমোদিত", className: "bg-primary-100 text-primary-800", icon: CheckCircle2 },
  rejected: { label: "বাতিল", className: "bg-red-100 text-red-700", icon: XCircle },
};

function EnrollmentCard({
  enrollment,
  isProcessing,
  onApprove,
  onReject,
  onUndo,
}: {
  enrollment: Enrollment;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onUndo: () => void;
}) {
  const meta = STATUS_META[enrollment.status];
  const StatusIcon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-between gap-3 rounded-xl border border-primary-100 bg-white p-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-ink-800">{enrollment.userName}</p>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.className}`}
          >
            <StatusIcon size={10} /> {meta.label}
          </span>
        </div>
        <p className="truncate text-xs text-ink-400">{enrollment.userEmail}</p>
        <p className="mt-1 truncate text-xs text-primary-700">কোর্স: {enrollment.courseTitle}</p>
      </div>

      <div className="flex shrink-0 gap-2">
        {enrollment.status === "pending" && (
          <>
            <button
              onClick={onApprove}
              disabled={isProcessing}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 disabled:opacity-50"
              aria-label="অনুমোদন করুন"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
              aria-label="বাতিল করুন"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            </button>
          </>
        )}
        {enrollment.status !== "pending" && (
          <button
            onClick={onUndo}
            disabled={isProcessing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 hover:bg-ink-50 disabled:opacity-50"
            aria-label="পেন্ডিং-এ ফিরিয়ে নিন"
            title="পেন্ডিং-এ ফিরিয়ে নিন"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={15} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function EnrollmentsContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<Enrollment[]>([]);
  const [all, setAll] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function load() {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [pendingData, allData] = await Promise.all([
        getPendingEnrollments(),
        getAllEnrollments(),
      ]);
      setPending(pendingData);
      setAll(allData);
    } catch {
      setErrorMsg("এনরোলমেন্ট তালিকা লোড করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(enrollment: Enrollment, decision: "approved" | "rejected") {
    if (!user) return;
    setProcessingId(enrollment.id);
    setErrorMsg("");
    try {
      await decideEnrollment(enrollment.id, decision, user.uid);
      setPending((prev) => prev.filter((e) => e.id !== enrollment.id));
      setAll((prev) =>
        prev.map((e) =>
          e.id === enrollment.id
            ? { ...e, status: decision, decidedAt: new Date().toISOString(), decidedBy: user.uid }
            : e
        )
      );
    } catch {
      setErrorMsg("সিদ্ধান্ত সেভ করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleUndo(enrollment: Enrollment) {
    setProcessingId(enrollment.id);
    setErrorMsg("");
    try {
      await revertEnrollmentToPending(enrollment.id);
      const reverted: Enrollment = {
        ...enrollment,
        status: "pending",
        decidedAt: null,
        decidedBy: null,
      };
      setAll((prev) => prev.map((e) => (e.id === enrollment.id ? reverted : e)));
      setPending((prev) => [...prev, reverted]);
    } catch {
      setErrorMsg("পূর্বাবস্থায় ফেরানো যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setProcessingId(null);
    }
  }

  const list = tab === "pending" ? pending : all;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-primary-950">এনরোলমেন্ট রিকোয়েস্ট</h1>
      <p className="mb-5 text-sm text-ink-500">শিক্ষার্থীদের ভর্তি অনুরোধ অনুমোদন বা বাতিল করুন</p>

      <div className="mb-5 flex gap-2 border-b border-ink-100">
        <button
          onClick={() => setTab("pending")}
          className={`relative px-3 py-2 text-sm font-medium ${
            tab === "pending" ? "text-primary-800" : "text-ink-400"
          }`}
        >
          পেন্ডিং {pending.length > 0 && `(${pending.length})`}
          {tab === "pending" && (
            <motion.div layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-700" />
          )}
        </button>
        <button
          onClick={() => setTab("all")}
          className={`relative px-3 py-2 text-sm font-medium ${
            tab === "all" ? "text-primary-800" : "text-ink-400"
          }`}
        >
          সব রিকোয়েস্ট
          {tab === "all" && (
            <motion.div layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-700" />
          )}
        </button>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMsg}</p>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary-600" size={28} />
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 py-16 text-center">
          <Inbox className="mb-3 text-primary-400" size={32} />
          <p className="text-sm text-ink-500">
            {tab === "pending" ? "এই মুহূর্তে কোনো পেন্ডিং রিকোয়েস্ট নেই।" : "এখনো কোনো এনরোলমেন্ট রিকোয়েস্ট আসেনি।"}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {list.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment}
              isProcessing={processingId === enrollment.id}
              onApprove={() => handleDecision(enrollment, "approved")}
              onReject={() => handleDecision(enrollment, "rejected")}
              onUndo={() => handleUndo(enrollment)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EnrollmentsPage() {
  return (
    <AdminRoute>
      <AdminHeader />
      <EnrollmentsContent />
    </AdminRoute>
  );
}
