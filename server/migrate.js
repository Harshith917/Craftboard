const { execSync } = require("child_process");
require("dotenv").config();

const schema = "--schema=prisma/schema.prisma";

async function main() {
  try {
    console.log("Attempting prisma migrate deploy...");
    execSync(`npx prisma migrate deploy ${schema}`, { stdio: "inherit" });
    console.log("Migrations applied successfully.");
    return;
  } catch {
    console.log("Deploy failed. Resetting migration history...");
  }

  try {
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query('DELETE FROM "_prisma_migrations"');
    console.log("  Cleared _prisma_migrations table");
    await pool.end();
  } catch (err) {
    console.log("  Could not clear _prisma_migrations:", err.message);
    process.exit(1);
  }

  console.log("\nApplying fresh migration...");
  try {
    execSync(`npx prisma migrate deploy ${schema}`, { stdio: "inherit" });
    console.log("All migrations applied successfully.");
  } catch (err) {
    console.error("Migration deploy failed:", err.message);
    process.exit(1);
  }
}

main();
