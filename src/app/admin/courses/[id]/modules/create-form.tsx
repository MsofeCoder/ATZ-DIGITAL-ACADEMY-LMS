"use client";

import { useActionState } from "react";
import { createModule } from "./actions";

export default function CreateModuleForm({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      formData.set("course_id", courseId);
      const result = await createModule(formData);
      return { error: result?.error ?? null };
    },
    { error: null }
  );

  return (
    <div className="bg-white border border-atz-bg-alt rounded-lg p-5">
      <h2 className="text-lg font-semibold text-atz-navy mb-4">Add Module</h2>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="course_id" value={courseId} />
        <div>
          <label
            htmlFor="create-mod-title"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            Title
          </label>
          <input
            id="create-mod-title"
            name="title"
            required
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          />
        </div>
        <div>
          <label
            htmlFor="create-mod-live"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            Live Session URL
          </label>
          <input
            id="create-mod-live"
            name="live_session_url"
            type="url"
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          />
        </div>
        <div>
          <label
            htmlFor="create-mod-rec"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            Recording URL
          </label>
          <input
            id="create-mod-rec"
            name="recording_url"
            type="url"
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          />
        </div>
        <div>
          <label
            htmlFor="create-mod-date"
            className="block text-sm font-medium text-atz-slate mb-1"
          >
            Release Date
          </label>
          <input
            id="create-mod-date"
            name="release_date"
            type="date"
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          />
        </div>
        {state.error && <p className="text-sm text-atz-warn">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-lg text-sm font-medium text-atz-navy bg-atz-gold hover:bg-atz-gold-dark transition-colors disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add Module"}
        </button>
      </form>
    </div>
  );
}
