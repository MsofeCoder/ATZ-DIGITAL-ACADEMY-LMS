import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import EnrollmentClient from "./enrollment-client";

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const selectedCourseId = params.course ?? "";

  const [{ data: profiles }, { data: courses }, { data: enrollments }, { data: authData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, role")
        .order("full_name", { ascending: true }),
      supabase
        .from("courses")
        .select("id, title")
        .order("created_at", { ascending: true }),
      selectedCourseId
        ? supabase
            .from("enrollments")
            .select("user_id, course_id")
            .eq("course_id", selectedCourseId)
        : Promise.resolve({ data: [] }),
      supabaseAdmin.auth.admin.listUsers(),
    ]);

  const emailMap = new Map(
    authData?.users?.map((u) => [u.id, u.email ?? ""]) ?? []
  );

  const profilesWithEmail = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? "",
  }));

  return (
    <EnrollmentClient
      profiles={profilesWithEmail}
      courses={courses ?? []}
      enrollments={enrollments ?? []}
      selectedCourseId={selectedCourseId}
    />
  );
}
