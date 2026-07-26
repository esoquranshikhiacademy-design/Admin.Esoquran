"use client";

import { useState, type FormEvent } from "react";
import { Video, FileText, Layers, Upload, X, Star } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Lesson, LessonContentType } from "@/types/course";

export interface LessonFormValues {
  title: string;
  contentType: LessonContentType;
  youtubeVideoId: string;
  durationMinutes: string;
  summary: string;
  transcript: string;
  referenceNotes: string;
  isFreePreview: boolean;
}

const CONTENT_TYPE_OPTIONS: { value: LessonContentType; label: string; icon: typeof Video }[] = [
  { value: "video", label: "ভিডিও", icon: Video },
  { value: "text", label: "লিখিত", icon: FileText },
  { value: "mixed", label: "মিশ্র", icon: Layers },
];

export function lessonToFormValues(lesson: Lesson): LessonFormValues {
  return {
    title: lesson.title,
    contentType: lesson.contentType,
    youtubeVideoId: lesson.youtubeVideoId ?? "",
    durationMinutes: String(lesson.durationMinutes ?? 0),
    summary: lesson.summary,
    transcript: lesson.transcript ?? "",
    referenceNotes: lesson.referenceNotes ?? "",
    isFreePreview: lesson.isFreePreview,
  };
}

export const emptyLessonFormValues: LessonFormValues = {
  title: "",
  contentType: "video",
  youtubeVideoId: "",
  durationMinutes: "0",
  summary: "",
  transcript: "",
  referenceNotes: "",
  isFreePreview: false,
};

interface LessonFormProps {
  initialValues: LessonFormValues;
  existingPdfName?: string | null;
  onSubmit: (values: LessonFormValues, pdfFile: File | null, removePdf: boolean) => Promise<void>;
  submitLabel: string;
  errorMsg?: string;
}

export function LessonForm({
  initialValues,
  existingPdfName,
  onSubmit,
  submitLabel,
  errorMsg,
}: LessonFormProps) {
  const [values, setValues] = useState<LessonFormValues>(initialValues);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [removePdf, setRemovePdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values, pdfFile, removePdf);
    } catch {
      // এরর মেসেজ প্যারেন্ট কম্পোনেন্ট errorMsg prop দিয়ে দেখাবে
    } finally {
      setIsSubmitting(false);
    }
  }

  const showPdfName = !removePdf && (pdfFile?.name ?? existingPdfName);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="title"
        label="লেসনের নাম"
        placeholder="যেমন: মাদ্দে তবিয়ির পরিচিতি"
        value={values.title}
        onChange={(e) => update("title", e.target.value)}
        required
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">কনটেন্টের ধরন</label>
        <div className="flex gap-2">
          {CONTENT_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("contentType", opt.value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  values.contentType === opt.value
                    ? "border-primary-700 bg-primary-700 text-white"
                    : "border-ink-200 text-ink-600"
                }`}
              >
                <Icon size={14} /> {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {(values.contentType === "video" || values.contentType === "mixed") && (
        <Input
          id="youtubeVideoId"
          label="YouTube ভিডিও আইডি (Unlisted)"
          placeholder="যেমন: dQw4w9WgXcQ (পুরো URL না, শুধু আইডি)"
          value={values.youtubeVideoId}
          onChange={(e) => update("youtubeVideoId", e.target.value)}
        />
      )}

      <Input
        id="durationMinutes"
        type="number"
        label="সময়কাল (মিনিট)"
        value={values.durationMinutes}
        onChange={(e) => update("durationMinutes", e.target.value)}
        min={0}
      />

      <div>
        <label htmlFor="summary" className="mb-1.5 block text-sm font-medium text-ink-700">
          সংক্ষিপ্ত সারাংশ
        </label>
        <textarea
          id="summary"
          rows={2}
          value={values.summary}
          onChange={(e) => update("summary", e.target.value)}
          required
          className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="transcript" className="mb-1.5 block text-sm font-medium text-ink-700">
          ট্রান্সক্রিপ্ট (ঐচ্ছিক)
        </label>
        <textarea
          id="transcript"
          rows={4}
          value={values.transcript}
          onChange={(e) => update("transcript", e.target.value)}
          className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="referenceNotes" className="mb-1.5 block text-sm font-medium text-ink-700">
          রেফারেন্স / অতিরিক্ত নোট (ঐচ্ছিক)
        </label>
        <textarea
          id="referenceNotes"
          rows={3}
          value={values.referenceNotes}
          onChange={(e) => update("referenceNotes", e.target.value)}
          className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">PDF / নোট ফাইল (ঐচ্ছিক)</label>
        {showPdfName ? (
          <div className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2 text-sm">
            <span className="truncate text-ink-600">{showPdfName}</span>
            <button
              type="button"
              onClick={() => {
                setPdfFile(null);
                setRemovePdf(true);
              }}
              className="ml-2 shrink-0 text-red-500 hover:text-red-600"
              aria-label="ফাইল সরান"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 px-3 py-3 text-sm text-ink-500 hover:bg-ink-50">
            <Upload size={15} />
            PDF আপলোড করুন
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPdfFile(file);
                setRemovePdf(false);
              }}
            />
          </label>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={values.isFreePreview}
          onChange={(e) => update("isFreePreview", e.target.checked)}
          className="h-4 w-4 rounded border-ink-300 text-primary-700 focus:ring-primary-500"
        />
        <Star size={14} className="text-gold-600" />
        এনরোলমেন্ট ছাড়াই ফ্রি প্রিভিউ হিসেবে দেখানো হোক
      </label>

      {errorMsg && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMsg}</p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
