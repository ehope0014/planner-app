import { neon } from "@neondatabase/serverless";

// One shared connection helper. DATABASE_URL lives only in Vercel's
// environment variables, never in the code.
let client;

export function sql(strings, ...values) {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Add it in Vercel > Settings > Environment Variables.");
    }
    client = neon(process.env.DATABASE_URL);
  }
  // Tagged template: values are always sent separately from the SQL text,
  // which prevents SQL injection.
  return client(strings, ...values);
}
