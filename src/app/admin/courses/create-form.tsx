"use client";

import { useActionState } from "react";
import { createCourse } from "./actions";

export default function CreateCourseForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      const result = await createCourse(formData);
      return { error: result?.error ?? null };
    },
    { error: null }
  );

  return (
    <div className="bg-white border border-atz-bg-alt rounded-lg p-5">
      <h2 className="text-lg font-semibold text-atz-navy mb-4">
        Create Course
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="create-title"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            Title
          </label>
          <input
            id="create-title"
            name="title"
            required
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          />
        </div>
        <div>
          <label
            htmlFor="create-desc"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            Description
          </label>
          <textarea
            id="create-desc"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          />
        </div>
        {state.error && (
          <p className="text-sm text-atz-warn">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-lg text-sm font-medium text-atz-navy bg-atz-gold hover:bg-atz-gold-dark transition-colors disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}
