"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export async function createModule(formData: FormData) {
  const supabase = await createClient();
  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const live_session_url = formData.get("live_session_url") as string;
  const recording_url = formData.get("recording_url") as string;
  const release_date = formData.get("release_date") as string;

  if (!title?.trim()) {
    return { error: "Title is required." };
  }

  // Auto-assign order_index: max existing + 1
  const { data: existing } = await supabase
    .from("modules")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

  const { error } = await supabase.from("modules").insert({
    course_id: courseId,
    title: title.trim(),
    order_index: nextIndex,
    live_session_url: live_session_url?.trim() || null,
    recording_url: recording_url?.trim() || null,
    release_date: release_date || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}/modules`);
}

export async function updateModule(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const live_session_url = formData.get("live_session_url") as string;
  const recording_url = formData.get("recording_url") as string;
  const release_date = formData.get("release_date") as string;

  if (!id || !title?.trim()) {
    return { error: "Title is required." };
  }

  const { error } = await supabase
    .from("modules")
    .update({
      title: title.trim(),
      live_session_url: live_session_url?.trim() || null,
      recording_url: recording_url?.trim() || null,
      release_date: release_date || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}/modules`);
}

export async function deleteModule(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const courseId = formData.get("course_id") as string;

  if (!id) {
    return { error: "Module ID is required." };
  }

  const { error } = await supabase.from("modules").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}/modules`);
}

export async function reorderModules(
  moduleAId: string,
  moduleBId: string,
  courseId: string
) {
  const supabase = await createClient();

  // Fetch both modules to get their current order_index values.
  // Two sequential updates — if the second fails, order is temporarily
  // inconsistent but the admin can retry. Acceptable for solo-admin tool.
  const { data: modules } = await supabase
    .from("modules")
    .select("id, order_index")
    .in("id", [moduleAId, moduleBId]);

  if (!modules || modules.length !== 2) {
    return { error: "Could not find both modules to reorder." };
  }

  const modA = modules.find((m) => m.id === moduleAId)!;
  const modB = modules.find((m) => m.id === moduleBId)!;

  await supabase
    .from("modules")
    .update({ order_index: modB.order_index })
    .eq("id", modA.id);

  await supabase
    .from("modules")
    .update({ order_index: modA.order_index })
    .eq("id", modB.id);

  revalidatePath(`/admin/courses/${courseId}/modules`);
}
