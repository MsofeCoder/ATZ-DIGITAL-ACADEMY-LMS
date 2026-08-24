import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ModuleCard from "./module-card";
import CreateModuleForm from "./create-form";

export default async function CourseModulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!course) {
    notFound();
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, order_index, live_session_url, recording_url, release_date")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  return (
    <div className="min-h-screen bg-atz-bg">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-atz-muted mb-1">
              <a href="/admin/courses" className="hover:underline">
                Courses
              </a>{" "}
              / {course.title}
            </p>
            <h1 className="text-3xl font-bold text-atz-navy">Modules</h1>
          </div>
          <a
            href="/admin/courses"
            className="text-sm text-atz-slate hover:text-atz-navy transition-colors"
          >
            &larr; Back to Courses
          </a>
        </div>

        {/* Module list */}
        <div className="space-y-4 mb-10">
          {modules && modules.length > 0 ? (
            modules.map((mod, index) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                courseId={id}
                isFirst={index === 0}
                isLast={index === modules.length - 1}
                prevModuleId={index > 0 ? modules[index - 1].id : null}
                nextModuleId={
                  index < modules.length - 1 ? modules[index + 1].id : null
                }
              />
            ))
          ) : (
            <p className="text-sm text-atz-muted">
              No modules yet. Add one below.
            </p>
          )}
        </div>

        {/* Create module form */}
        <CreateModuleForm courseId={id} />
      </div>
    </div>
  );
}
