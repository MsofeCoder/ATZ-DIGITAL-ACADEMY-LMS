export default function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-atz-bg">
      <h1 className="text-4xl font-bold text-atz-navy">Admin Dashboard</h1>
      <p className="mt-4 text-lg text-atz-slate">Manage courses, modules, and students.</p>
      <a
        href="/admin/courses"
        className="mt-6 px-6 py-3 rounded-lg font-medium text-atz-navy bg-atz-gold hover:bg-atz-gold-dark transition-colors"
      >
        Manage Courses
      </a>
    </div>
  );
}
