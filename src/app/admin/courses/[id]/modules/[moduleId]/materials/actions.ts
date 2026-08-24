"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export async function createMaterial(formData: FormData) {
  const supabase = await createClient();
  const moduleId = formData.get("module_id") as string;
  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const file_url = formData.get("file_url") as string;
  const file_type = formData.get("file_type") as string;

  if (!title?.trim()) {
    return { error: "Title is required." };
  }

  if (!file_url?.trim()) {
    return { error: "File URL is required." };
  }

  const { error } = await supabase.from("materials").insert({
    module_id: moduleId,
    title: title.trim(),
    file_url: file_url.trim(),
    file_type: file_type || "other",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}/materials`);
}

export async function deleteMaterial(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const moduleId = formData.get("module_id") as string;
  const courseId = formData.get("course_id") as string;

  if (!id) {
    return { error: "Material ID is required." };
  }

  const { error } = await supabase.from("materials").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}/materials`);
}
