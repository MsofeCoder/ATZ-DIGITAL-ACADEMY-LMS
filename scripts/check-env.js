const fs = require("fs");
const path = require("path");

// Load .env.local manually (Next.js does this automatically, but this script runs before next build)
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

const missing = requiredEnvVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(
    `\n❌ Missing required environment variables:\n${missing.map((v) => `   - ${v}`).join("\n")}\n\n` +
    `These must be set in Vercel Dashboard > Settings > Environment Variables (Production scope).\n` +
    `See .env.local.example for expected values.\n`
  );
  process.exit(1);
}

console.log("✅ All required environment variables are set.");
