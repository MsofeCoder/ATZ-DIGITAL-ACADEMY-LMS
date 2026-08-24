"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title?.trim()) {
    return { error: "Title is required." };
  }

  const { error } = await supabase
    .from("courses")
    .insert({ title: title.trim(), description: description?.trim() || "" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/courses");
}

export async function updateCourse(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!id || !title?.trim()) {
    return { error: "Title is required." };
  }

  const { error } = await supabase
    .from("courses")
    .update({ title: title.trim(), description: description?.trim() || "" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/courses");
}

export async function deleteCourse(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Course ID is required." };
  }

  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/courses");
}
