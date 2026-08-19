import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Guard: the inquiry forms need both Supabase env vars inlined at build time.
  // If either is missing the client falls back to a mailto: link and the form
  // silently stops writing to the database — a submission looks like it worked
  // but never arrives. Rather than let that ship, fail the production deploy
  // loudly (Netlify sets CONTEXT=production for the live build) and warn on
  // every other build so secret-less preview deploys still succeed.
  if (command === "build") {
    const missing = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"].filter(
      (k) => !env[k] || env[k].trim() === "",
    );
    if (missing.length > 0) {
      const msg = `Supabase env var(s) missing at build time: ${missing.join(", ")}. The inquiry forms will not write to the database.`;
      if (process.env.CONTEXT === "production") {
        throw new Error(
          `${msg}\nSet them in Netlify → Site configuration → Environment variables (scoped to Production) and redeploy.`,
        );
      }
      console.warn(`\n⚠️  ${msg} (non-production build — continuing.)\n`);
    }
  }

  return {
    base: "/",
    plugins: [react()],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
