"use client";

import { useActionState } from "react";
import { createMaterial } from "./actions";

export default function CreateMaterialForm({
  moduleId,
  courseId,
}: {
  moduleId: string;
  courseId: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      formData.set("module_id", moduleId);
      formData.set("course_id", courseId);
      const result = await createMaterial(formData);
      return { error: result?.error ?? null };
    },
    { error: null }
  );

  return (
    <div className="bg-white border border-atz-bg-alt rounded-lg p-5">
      <h2 className="text-lg font-semibold text-atz-navy mb-4">
        Add Material
      </h2>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="module_id" value={moduleId} />
        <input type="hidden" name="course_id" value={courseId} />
        <div>
          <label
            htmlFor="create-mat-title"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            Title
          </label>
          <input
            id="create-mat-title"
            name="title"
            required
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          />
        </div>
        <div>
          <label
            htmlFor="create-mat-url"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            File URL (Google Drive link)
          </label>
          <input
            id="create-mat-url"
            name="file_url"
            type="url"
            required
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          />
        </div>
        <div>
          <label
            htmlFor="create-mat-type"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            File Type
          </label>
          <select
            id="create-mat-type"
            name="file_type"
            defaultValue="other"
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          >
            <option value="pdf">PDF</option>
            <option value="pptx">PowerPoint (PPTX)</option>
            <option value="docx">Word (DOCX)</option>
            <option value="other">Other</option>
          </select>
        </div>
        {state.error && <p className="text-sm text-atz-warn">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-lg text-sm font-medium text-atz-navy bg-atz-gold hover:bg-atz-gold-dark transition-colors disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add Material"}
        </button>
      </form>
    </div>
  );
}
