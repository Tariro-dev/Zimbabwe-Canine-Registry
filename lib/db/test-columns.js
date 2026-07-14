import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://neondb_owner:npg_OBnjTlYxW4s9@ep-lucky-smoke-abb1n5rf.eu-west-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
    `);
    console.log("Columns in users table:", res.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
