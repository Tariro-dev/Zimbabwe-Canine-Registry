import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://neondb_owner:npg_OBnjTlYxW4s9@ep-lucky-smoke-abb1n5rf.eu-west-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected successfully");
    const res = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:", res.rows.map(r => r.table_name));
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

run();
