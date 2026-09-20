import { readFileSync } from "node:fs";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL পাওয়া যায়নি। .env.local ফাইলটি ঠিক আছে কি না দেখুন।");
  process.exit(1);
}

const sql = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
await client.query(sql);
await client.end();
console.log("টেবিল তৈরি হয়েছে।");
