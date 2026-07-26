"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={28} />
      </div>
    );
  }

  if (profile && profile.role !== "admin" && profile.role !== "teacher") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="mb-3 text-red-500" size={32} />
        <p className="font-semibold text-ink-800">অনুমতি নেই</p>
        <p className="mt-1 text-sm text-ink-500">
          এই প্যানেলটি শুধুমাত্র অ্যাডমিন ও শিক্ষকদের জন্য। ভুল অ্যাকাউন্ট দিয়ে
          লগইন করা হলে সঠিক অ্যাকাউন্ট দিয়ে আবার চেষ্টা করুন।
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
