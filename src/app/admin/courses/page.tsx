import { createClient } from "@/lib/supabase-server";
import CourseCard from "./course-card";
import CreateCourseForm from "./create-form";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description")
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-atz-bg">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-atz-navy">Courses</h1>
            <p className="mt-1 text-sm text-atz-muted">
              Manage your course catalog
            </p>
          </div>
          <a
            href="/admin"
            className="text-sm text-atz-slate hover:text-atz-navy transition-colors"
          >
            &larr; Back to Dashboard
          </a>
        </div>

        {/* Course list */}
        <div className="space-y-4 mb-10">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <p className="text-sm text-atz-muted">
              No courses yet. Create one below.
            </p>
          )}
        </div>

        {/* Create course form */}
        <CreateCourseForm />
      </div>
    </div>
  );
}
