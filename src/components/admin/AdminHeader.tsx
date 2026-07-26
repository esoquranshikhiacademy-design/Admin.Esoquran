"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck, BookOpen, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPendingEnrollments } from "@/lib/services/enrollmentService";

export function AdminHeader() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getPendingEnrollments()
      .then((list) => setPendingCount(list.length))
      .catch(() => {
        // ব্যাজ কাউন্ট লোড না হলেও পেজ ব্যবহারে বাধা নেই, চুপচাপ উপেক্ষা করা হচ্ছে
      });
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const navItemClass = (active: boolean) =>
    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-primary-100 text-primary-800" : "text-ink-500 hover:bg-ink-50"
    }`;

  return (
    <header className="border-b border-primary-100 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 text-white">
            <ShieldCheck size={16} />
          </div>
          <span className="hidden font-bold text-primary-950 sm:inline">কোর্স অ্যাডমিন</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className={navItemClass(pathname === "/" || pathname.startsWith("/courses"))}>
            <BookOpen size={15} /> <span className="hidden sm:inline">কোর্স</span>
          </Link>
          <Link href="/enrollments" className={navItemClass(pathname.startsWith("/enrollments"))}>
            <Users size={15} /> <span className="hidden sm:inline">এনরোলমেন্ট</span>
            {pendingCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {profile && (
            <span className="hidden text-sm text-ink-500 md:inline">{profile.name}</span>
          )}
          <button
            onClick={handleSignOut}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
            aria-label="লগআউট করুন"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
