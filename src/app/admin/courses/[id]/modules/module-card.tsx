"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateModule, deleteModule, reorderModules } from "./actions";

type Module = {
  id: string;
  title: string;
  order_index: number;
  live_session_url: string | null;
  recording_url: string | null;
  release_date: string | null;
};

type Props = {
  module: Module;
  courseId: string;
  isFirst: boolean;
  isLast: boolean;
  prevModuleId: string | null;
  nextModuleId: string | null;
};

export default function ModuleCard({
  module: mod,
  courseId,
  isFirst,
  isLast,
  prevModuleId,
  nextModuleId,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    setError(null);
    const result = await updateModule(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditing(false);
      router.refresh();
    }
  }

  function handleDelete(formData: FormData) {
    if (!confirm("Delete this module? This cannot be undone.")) {
      return;
    }
    deleteModule(formData);
  }

  async function handleReorder(targetId: string) {
    await reorderModules(mod.id, targetId, courseId);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-white border border-atz-bg-alt rounded-lg p-5">
        <form action={handleUpdate} className="space-y-4">
          <input type="hidden" name="id" value={mod.id} />
          <input type="hidden" name="course_id" value={courseId} />
          <div>
            <label
              htmlFor={`edit-mod-title-${mod.id}`}
              className="block text-sm font-medium text-atz-slate mb-1"
            >
              Title
            </label>
            <input
              id={`edit-mod-title-${mod.id}`}
              name="title"
              defaultValue={mod.title}
              required
              className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
            />
          </div>
          <div>
            <label
              htmlFor={`edit-mod-live-${mod.id}`}
              className="block text-sm font-medium text-atz-slate mb-1"
            >
              Live Session URL
            </label>
            <input
              id={`edit-mod-live-${mod.id}`}
              name="live_session_url"
              type="url"
              defaultValue={mod.live_session_url ?? ""}
              className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
            />
          </div>
          <div>
            <label
              htmlFor={`edit-mod-rec-${mod.id}`}
              className="block text-sm font-medium text-atz-slate mb-1"
            >
              Recording URL
            </label>
            <input
              id={`edit-mod-rec-${mod.id}`}
              name="recording_url"
              type="url"
              defaultValue={mod.recording_url ?? ""}
              className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
            />
          </div>
          <div>
            <label
              htmlFor={`edit-mod-date-${mod.id}`}
              className="block text-sm font-medium text-atz-slate mb-1"
            >
              Release Date
            </label>
            <input
              id={`edit-mod-date-${mod.id}`}
              name="release_date"
              type="date"
              defaultValue={mod.release_date ?? ""}
              className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
            />
          </div>
          {error && <p className="text-sm text-atz-warn">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-atz-slate bg-atz-bg-alt hover:bg-atz-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-atz-navy bg-atz-gold hover:bg-atz-gold-dark transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white border border-atz-bg-alt rounded-lg p-5">
      <div className="flex items-start gap-3">
        {/* Reorder buttons */}
        <div className="flex flex-col gap-1 pt-1">
          {!isFirst && prevModuleId && (
            <button
              onClick={() => handleReorder(prevModuleId!)}
              className="w-7 h-7 flex items-center justify-center rounded text-atz-slate bg-atz-bg-alt hover:bg-atz-bg transition-colors text-xs"
              title="Move up"
            >
              &#9650;
            </button>
          )}
          {!isLast && nextModuleId && (
            <button
              onClick={() => handleReorder(nextModuleId!)}
              className="w-7 h-7 flex items-center justify-center rounded text-atz-slate bg-atz-bg-alt hover:bg-atz-bg transition-colors text-xs"
              title="Move down"
            >
              &#9660;
            </button>
          )}
        </div>

        {/* Module content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-atz-navy">{mod.title}</h3>
          <div className="mt-2 space-y-1 text-sm text-atz-slate">
            <p>
              <span className="font-medium">Live:</span>{" "}
              {mod.live_session_url ? (
                <a
                  href={mod.live_session_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-atz-gold hover:underline"
                >
                  {mod.live_session_url}
                </a>
              ) : (
                <span className="text-atz-muted">—</span>
              )}
            </p>
            <p>
              <span className="font-medium">Recording:</span>{" "}
              {mod.recording_url ? (
                <a
                  href={mod.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-atz-gold hover:underline"
                >
                  {mod.recording_url}
                </a>
              ) : (
                <span className="text-atz-muted">—</span>
              )}
            </p>
            <p>
              <span className="font-medium">Release:</span>{" "}
              {mod.release_date || <span className="text-atz-muted">—</span>}
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-atz-slate bg-atz-bg-alt hover:bg-atz-bg transition-colors"
            >
              Edit
            </button>
            <form action={handleDelete}>
              <input type="hidden" name="id" value={mod.id} />
              <input type="hidden" name="course_id" value={courseId} />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-atz-warn hover:opacity-90 transition-colors"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
