import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables first, before any other imports
dotenv.config({ path: join(__dirname, "../.env.local") });
dotenv.config({ path: join(__dirname, ".env.local") });

// Debug environment variables
console.log("Environment Variables Loaded:");
console.log(
  "NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "exists" : "undefined"
);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "exists" : "undefined"
);
