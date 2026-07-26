"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "মুছে ফেলুন",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={18} />
        </div>
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        <p className="mt-1 text-sm text-ink-500">{description}</p>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            বাতিল
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
