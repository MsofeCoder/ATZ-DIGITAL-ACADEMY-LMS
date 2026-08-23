import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-atz-navy px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-block px-4 py-1 rounded-full text-sm font-medium tracking-wide bg-atz-gold/10 text-atz-gold">
          ATZ Digital Academy
        </div>
        <h1 className="text-7xl font-bold text-atz-gold">
          403
        </h1>
        <h2 className="text-2xl font-semibold text-white">
          Access Denied
        </h2>
        <p className="text-atz-muted">
          You don&apos;t have permission to access the admin dashboard.
          Contact an administrator if you believe this is a mistake.
        </p>
        <Link
          href="/student"
          className="inline-block mt-2 px-6 py-3 rounded-lg font-medium text-white bg-atz-gold hover:bg-atz-gold-dark transition-colors"
        >
          Go to Student Dashboard
        </Link>
      </div>
    </div>
  );
}
