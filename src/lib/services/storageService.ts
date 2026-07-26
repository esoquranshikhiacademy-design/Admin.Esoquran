import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * লেসনের PDF/নোট আপলোড করে Firebase Storage এ।
 * Storage path: lessons/{courseId}/{lessonId}/{fileName}
 */
export async function uploadLessonPdf(
  courseId: string,
  lessonId: string,
  file: File
): Promise<{ url: string; name: string }> {
  const storageRef = ref(storage, `lessons/${courseId}/${lessonId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, name: file.name };
}

/**
 * পুরনো PDF মুছে ফেলে (নতুন ফাইল আপলোডের আগে বা লেসন ডিলিটের সময়)।
 * ফাইলটি না থাকলেও নিরাপদে fail হবে - error ছড়াবে না।
 */
export async function deleteLessonPdf(pdfUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, pdfUrl);
    await deleteObject(storageRef);
  } catch {
    // ফাইল আগে থেকেই না থাকতে পারে - নিরাপদে উপেক্ষা করা হচ্ছে
  }
}
