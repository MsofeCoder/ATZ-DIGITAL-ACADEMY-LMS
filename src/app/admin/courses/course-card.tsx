"use client";

import { useState } from "react";
import { updateCourse, deleteCourse } from "./actions";

type Course = {
  id: string;
  title: string;
  description: string | null;
};

export default function CourseCard({ course }: { course: Course }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setError(null);
    const result = await updateCourse(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditing(false);
    }
  }

  function handleDelete(formData: FormData) {
    if (!confirm("Delete this course? This cannot be undone.")) {
      return;
    }
    deleteCourse(formData);
  }

  if (editing) {
    return (
      <div className="bg-white border border-atz-bg-alt rounded-lg p-5">
        <form action={handleUpdate} className="space-y-4">
          <input type="hidden" name="id" value={course.id} />
          <div>
            <label htmlFor={`edit-title-${course.id}`} className="block text-sm font-medium text-atz-slate mb-1">
              Title
            </label>
            <input
              id={`edit-title-${course.id}`}
              name="title"
              defaultValue={course.title}
              required
              className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
            />
          </div>
          <div>
            <label htmlFor={`edit-desc-${course.id}`} className="block text-sm font-medium text-atz-slate mb-1">
              Description
            </label>
            <textarea
              id={`edit-desc-${course.id}`}
              name="description"
              defaultValue={course.description ?? ""}
              rows={3}
              className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
            />
          </div>
          {error && (
            <p className="text-sm text-atz-warn">{error}</p>
          )}
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
      <h3 className="text-lg font-semibold text-atz-navy">{course.title}</h3>
      {course.description && (
        <p className="mt-1 text-sm text-atz-slate">{course.description}</p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-atz-slate bg-atz-bg-alt hover:bg-atz-bg transition-colors"
        >
          Edit
        </button>
        <form action={handleDelete}>
          <input type="hidden" name="id" value={course.id} />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-atz-warn hover:opacity-90 transition-colors"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
