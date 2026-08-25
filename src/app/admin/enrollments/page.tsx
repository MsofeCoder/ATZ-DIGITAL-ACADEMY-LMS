import { createClient } from "@/lib/supabase-server";
import EnrollmentClient from "./enrollment-client";

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const selectedCourseId = params.course ?? "";

  const [{ data: profiles }, { data: courses }, { data: enrollments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email")
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
    ]);

  return (
    <EnrollmentClient
      profiles={profiles ?? []}
      courses={courses ?? []}
      enrollments={enrollments ?? []}
      selectedCourseId={selectedCourseId}
    />
  );
}
