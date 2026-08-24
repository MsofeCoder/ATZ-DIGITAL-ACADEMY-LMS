import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import MaterialList from "./material-list";
import CreateMaterialForm from "./create-form";

export default async function MaterialsPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id, moduleId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!course) {
    notFound();
  }

  const { data: module } = await supabase
    .from("modules")
    .select("id, title")
    .eq("id", moduleId)
    .single();

  if (!module) {
    notFound();
  }

  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, file_url, file_type")
    .eq("module_id", moduleId)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-atz-bg">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-atz-muted mb-1">
              <a href="/admin/courses" className="hover:underline">
                Courses
              </a>{" "}
              /{" "}
              <a
                href={`/admin/courses/${id}/modules`}
                className="hover:underline"
              >
                {course.title}
              </a>{" "}
              / {module.title}
            </p>
            <h1 className="text-3xl font-bold text-atz-navy">Materials</h1>
          </div>
          <a
            href={`/admin/courses/${id}/modules`}
            className="text-sm text-atz-slate hover:text-atz-navy transition-colors"
          >
            &larr; Back to Modules
          </a>
        </div>

        {/* Materials list */}
        <div className="mb-10">
          <MaterialList
            materials={materials ?? []}
            moduleId={moduleId}
            courseId={id}
          />
        </div>

        {/* Create material form */}
        <CreateMaterialForm moduleId={moduleId} courseId={id} />
      </div>
    </div>
  );
}
