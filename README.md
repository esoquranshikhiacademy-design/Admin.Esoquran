# এসো কুরআন শিখি একাডেমি — কোর্স অ্যাডমিন প্যানেল

মূল সাইট (`esho-quran-shikhi-academy`) থেকে সম্পূর্ণ আলাদা একটি Next.js প্রজেক্ট, কিন্তু
**একই Firebase Project** ব্যবহার করে। এই প্যানেলের একমাত্র কাজ: **কোর্স ও লেসন
ম্যানেজমেন্ট** — কোর্স তৈরি, এডিট, ক্রম সাজানো, প্রকাশ/খসড়া করা, মুছে ফেলা, এবং
প্রতিটা কোর্সের ভেতর লেসন যোগ/এডিট/ক্রম সাজানো/মুছে ফেলা।

সাইটের বাকি সব কনটেন্ট (Arabic Alphabet Studio, Makhraj Studio, Tajweed Lab,
Practice Zone, Self Assessment) কোডে হার্ডকোডেড — সেগুলোর জন্য এই admin panel
প্রযোজ্য না। শুধু কোর্স বিক্রি/পরিচালনার অংশটাই ডাইনামিক এবং এখানে ম্যানেজ হয়।

## সেটআপ

1. `.env.local.example` কপি করে `.env.local` বানান
2. মূল সাইটের `.env.local` এ যেসব Firebase কনফিগ ভ্যালু আছে **ঠিক সেগুলোই** এখানে বসান
   (একই প্রজেক্ট, তাই কনফিগ হুবহু মিলবে)
3. GitHub এ পুশ করে Vercel এ নতুন প্রজেক্ট হিসেবে import করুন, Environment Variables
   এ উপরের ভ্যালুগুলো বসান

## লগইন

- এই প্যানেলে সাইনআপ নেই। মূল সাইটে যে অ্যাকাউন্টের Firestore `users/{uid}` ডকুমেন্টে
  `role: "admin"` অথবা `role: "teacher"` আছে, শুধু সেই অ্যাকাউন্ট দিয়ে লগইন করা যাবে।
- অন্য role (student) দিয়ে লগইন করলে "অনুমতি নেই" মেসেজ দেখাবে।

## রুট

- `/login` — লগইন পেজ
- `/` — কোর্স তালিকা (ড্র্যাগ করে ক্রম বদলানো যায়, প্রকাশ/খসড়া টগল, মুছে ফেলা) + পেন্ডিং এনরোলমেন্ট শর্টকাট
- `/courses/new` — নতুন কোর্স তৈরি
- `/courses/[courseId]` — কোর্স এডিট + সেই কোর্সের লেসন তালিকা (ড্র্যাগ রিঅর্ডার সহ)
- `/courses/[courseId]/lessons/new` — নতুন লেসন
- `/courses/[courseId]/lessons/[lessonId]` — লেসন এডিট
- `/enrollments` — এনরোলমেন্ট রিকোয়েস্ট: "পেন্ডিং" ও "সব রিকোয়েস্ট" ট্যাব, অনুমোদন/বাতিল, এবং ভুল হলে পূর্বাবস্থায় ফেরানো (undo)

## Main site থেকে যা সরাতে হবে (ডাবল মেইনটেন্স এড়াতে)

এই সব ফিচার এখন এই অ্যাডমিন repo-তে replicate হয়ে গেছে। main site থেকে GitHub এডিটরে
গিয়ে নিচের ফাইল/ফোল্ডার ডিলিট করুন:

```
src/app/admin/                        ← পুরো ফোল্ডার
src/components/admin/AdminRoute.tsx   ← admin folder এর বাইরে ব্যবহার হয় না
src/lib/services/seedService.ts       ← শুধু admin dashboard এর sample-data বাটনে ব্যবহার হতো
```

**মুছবেন না** (main site এ student-facing ফিচারের জন্য এখনও দরকার):
- `src/lib/services/courseService.ts` — কোর্স/লেসন **read** করার জন্য
- `src/lib/services/enrollmentService.ts` — student এর enrollment **request** পাঠানোর জন্য
- `src/types/course.ts`, `src/types/enrollment.ts`

## Firestore / Storage rules

মূল সাইটের `firestore.rules` এবং `storage.rules` এ ইতিমধ্যে `courses` ও
`courses/{id}/lessons` এর জন্য `isAdmin() || isTeacher()` write permission আছে,
তাই এই নতুন repo এর জন্য rules এ কোনো পরিবর্তন লাগবে না। Firebase Console এর
Rules ট্যাবে একবার নিশ্চিত করে নিতে পারেন যে rules deploy করা আছে।

## পরে যোগ হবে (এই ব্যাচে নেই)

- Quiz প্রশ্ন ম্যানেজমেন্ট (কুইজ UI)
- Assignment জমা রিভিউ/স্কোরিং
- Certificate ইস্যু করা
