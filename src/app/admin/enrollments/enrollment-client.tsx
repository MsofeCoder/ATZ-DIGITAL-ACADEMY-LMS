"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { enrollUser } from "./actions";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
};

type Course = {
  id: string;
  title: string;
};

type Enrollment = {
  user_id: string;
  course_id: string;
};

export default function EnrollmentClient({
  profiles,
  courses,
  enrollments,
  selectedCourseId,
}: {
  profiles: Profile[];
  courses: Course[];
  enrollments: Enrollment[];
  selectedCourseId: string;
}) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState(selectedCourseId);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const enrolledUserIds = new Set(
    enrollments
      .filter((e) => e.course_id === selectedCourse)
      .map((e) => e.user_id)
  );

  const [, formAction, pending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      setMessage(null);
      const result = await enrollUser(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
        return { error: result.error };
      }
      setMessage({ type: "success", text: "Student enrolled successfully." });
      router.refresh();
      return { error: null };
    },
    { error: null }
  );

  function handleCourseChange(value: string) {
    setSelectedCourse(value);
    setMessage(null);
  }

  return (
    <div className="min-h-screen bg-atz-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-atz-navy">
              Enroll Students
            </h1>
            <p className="mt-1 text-sm text-atz-muted">
              Manually enroll students into courses
            </p>
          </div>
          <a
            href="/admin"
            className="text-sm text-atz-slate hover:text-atz-navy transition-colors"
          >
            &larr; Back to Dashboard
          </a>
        </div>

        {/* Course selector */}
        <div className="bg-white border border-atz-bg-alt rounded-lg p-5 mb-6">
          <label
            htmlFor="course-select"
            className="block text-sm font-medium text-atz-slate mb-2"
          >
            Select Course
          </label>
          <select
            id="course-select"
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full px-3 py-2 border border-atz-bg-alt rounded-lg text-atz-navy focus:outline-none focus:ring-2 focus:ring-atz-gold"
          >
            <option value="">-- Choose a course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Message display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Payment note */}
        <p className="mb-4 text-sm text-atz-muted italic">
          Enroll students here after confirming payment in the registration
          dashboard.
        </p>

        {/* User table */}
        {selectedCourse ? (
          <div className="bg-white border border-atz-bg-alt rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-atz-bg-alt">
                  <th className="text-left px-5 py-3 text-sm font-medium text-atz-slate">
                    Student
                  </th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-atz-slate">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-atz-slate">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-atz-slate">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const isEnrolled = enrolledUserIds.has(profile.id);
                  return (
                    <tr
                      key={profile.id}
                      className="border-b border-atz-bg-alt last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-atz-navy">
                        {profile.full_name || "Unnamed"}
                      </td>
                      <td className="px-5 py-4 text-sm text-atz-slate">
                        {profile.email}
                      </td>
                      <td className="px-5 py-4">
                        {isEnrolled ? (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-atz-success text-white">
                            Enrolled
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-atz-bg-alt text-atz-muted">
                            Not enrolled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isEnrolled ? (
                          <span className="text-xs text-atz-muted">
                            Already enrolled
                          </span>
                        ) : (
                          <form action={formAction} className="inline">
                            <input
                              type="hidden"
                              name="user_id"
                              value={profile.id}
                            />
                            <input
                              type="hidden"
                              name="course_id"
                              value={selectedCourse}
                            />
                            <button
                              type="submit"
                              disabled={pending}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-atz-navy bg-atz-gold hover:bg-atz-gold-dark transition-colors disabled:opacity-50"
                            >
                              {pending ? "Enrolling..." : "Enroll"}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {profiles.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-sm text-atz-muted"
                    >
                      No users found. Users appear here after signing in via
                      Google OAuth.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-atz-bg-alt rounded-lg p-10 text-center">
            <p className="text-sm text-atz-muted">
              Select a course above to view and manage student enrollments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
