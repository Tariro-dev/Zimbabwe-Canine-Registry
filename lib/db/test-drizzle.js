import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./src/schema/index.ts";
import { eq } from "drizzle-orm";

const { Pool } = pg;
const connectionString = "postgresql://neondb_owner:npg_OBnjTlYxW4s9@ep-lucky-smoke-abb1n5rf.eu-west-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    console.log("Running query...");
    const existing = await db.select().from(schema.usersTable).where(eq(schema.usersTable.email, "test@example.com"));
    console.log("Result:", existing);
  } catch (err) {
    console.error("Drizzle Error:", err);
  } finally {
    await pool.end();
  }
}

run();
