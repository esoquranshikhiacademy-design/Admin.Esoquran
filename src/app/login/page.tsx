"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

function firebaseErrorToBengali(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "ইমেইল বা পাসওয়ার্ড সঠিক নয়।";
    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
    case "auth/invalid-email":
      return "সঠিক ইমেইল ঠিকানা দিন।";
    default:
      return "লগইন করা যায়নি। আবার চেষ্টা করুন।";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setError(firebaseErrorToBengali(code));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-xl font-bold text-primary-950">অ্যাডমিন প্যানেল</h1>
          <p className="mt-1 text-sm text-ink-500">
            এসো কুরআন শিখি একাডেমি — শুধু অ্যাডমিন ও শিক্ষকদের জন্য
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="ইমেইল"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            id="password"
            type="password"
            label="পাসওয়ার্ড"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting}>
            লগইন করুন
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          নতুন অ্যাকাউন্ট এখান থেকে তৈরি করা যায় না। মূল সাইট থেকে অ্যাডমিন/শিক্ষক
          হিসেবে যুক্ত হওয়া অ্যাকাউন্ট দিয়ে লগইন করুন।
        </p>
      </motion.div>
    </div>
  );
}
