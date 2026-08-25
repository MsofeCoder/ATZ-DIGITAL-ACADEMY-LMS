"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export async function enrollUser(formData: FormData) {
  const supabase = await createClient();
  const userId = formData.get("user_id") as string;
  const courseId = formData.get("course_id") as string;

  if (!userId || !courseId) {
    return { error: "User and course are required." };
  }

  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId });

  if (error) {
    if (error.code === "23505") {
      return { error: "This student is already enrolled in this course." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/enrollments");
}
