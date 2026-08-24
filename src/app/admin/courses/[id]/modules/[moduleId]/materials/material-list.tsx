"use client";

import { useRouter } from "next/navigation";
import { deleteMaterial } from "./actions";

type Material = {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
};

const FILE_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  pdf: { label: "PDF", className: "bg-red-100 text-red-700" },
  pptx: { label: "PPT", className: "bg-orange-100 text-orange-700" },
  docx: { label: "DOC", className: "bg-blue-100 text-blue-700" },
  other: { label: "File", className: "bg-gray-100 text-gray-700" },
};

export default function MaterialList({
  materials,
  moduleId,
  courseId,
}: {
  materials: Material[];
  moduleId: string;
  courseId: string;
}) {
  const router = useRouter();

  function handleDelete(formData: FormData) {
    if (!confirm("Delete this material? This cannot be undone.")) {
      return;
    }
    deleteMaterial(formData).then(() => router.refresh());
  }

  if (materials.length === 0) {
    return (
      <p className="text-sm text-atz-muted">No materials yet. Add one below.</p>
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((mat) => {
        const badge = FILE_TYPE_STYLES[mat.file_type] ?? FILE_TYPE_STYLES.other;
        return (
          <div
            key={mat.id}
            className="flex items-start justify-between gap-4 bg-white border border-atz-bg-alt rounded-lg p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-atz-navy hover:text-atz-gold truncate"
                >
                  {mat.title}
                </a>
              </div>
              <p className="mt-1 text-xs text-atz-muted truncate">
                {mat.file_url}
              </p>
            </div>
            <form action={handleDelete} className="shrink-0">
              <input type="hidden" name="id" value={mat.id} />
              <input type="hidden" name="module_id" value={moduleId} />
              <input type="hidden" name="course_id" value={courseId} />
              <button
                type="submit"
                className="px-3 py-1.5 rounded text-xs font-medium text-white bg-atz-warn hover:opacity-90 transition-colors"
              >
                Delete
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
