/**
 * Test script: verifikasi env Supabase sudah benar dan tabel sudah ada.
 * Jalankan: node scripts/test-env.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Baca .env.local secara manual (tidak perlu dotenv)
const envPath = resolve(process.cwd(), ".env.local");
const envLines = readFileSync(envPath, "utf-8").split("\n");
const env = {};
for (const line of envLines) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) env[key.trim()] = rest.join("=").trim();
}

const url = env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];
const bucket = env["SUPABASE_COVERS_BUCKET"];

console.log("\n=== Comicron – Test Koneksi Supabase ===\n");

// 1. Cek variabel ada
const checks = [
  ["NEXT_PUBLIC_SUPABASE_URL", url],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceKey],
  ["SUPABASE_COVERS_BUCKET", bucket],
];

let envOk = true;
for (const [name, val] of checks) {
  if (val && !val.startsWith("your-") && !val.startsWith("GANTI_")) {
    console.log(`  ✔  ${name}`);
  } else {
    console.log(`  ✘  ${name} — belum diisi / masih placeholder`);
    envOk = false;
  }
}

if (!envOk) {
  console.log("\n❌ Ada env yang belum diisi. Isi dulu di .env.local\n");
  process.exit(1);
}

// 2. Cek koneksi & tabel
const client = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// junction tables tidak punya kolom id, gunakan select minimal
const tableSelects = {
  publishers: "id",
  titles: "id",
  events: "id",
  issues: "id",
  characters: "id",
  issue_characters: "issue_id",
  event_issues: "event_id",
};

console.log("\n--- Cek tabel ---");
let tableOk = true;
for (const [table, col] of Object.entries(tableSelects)) {
  const { error } = await client.from(table).select(col).limit(1);
  if (error) {
    console.log(`  ✘  ${table} — ${error.message}`);
    tableOk = false;
  } else {
    console.log(`  ✔  ${table}`);
  }
}

// 3. Cek Storage bucket
console.log("\n--- Cek Storage bucket ---");
const { data: buckets, error: bucketErr } = await client.storage.listBuckets();
if (bucketErr) {
  console.log(`  ✘  Storage — ${bucketErr.message}`);
} else {
  const found = buckets.find((b) => b.name === bucket);
  if (found) {
    console.log(`  ✔  Bucket "${bucket}" ditemukan`);
    if (found.public) {
      console.log("  ✔  Bucket bersifat public (URL publik bisa diakses browser)");
    } else {
      console.log("  ⚠  Bucket masih private. Jika app pakai getPublicUrl(), cover tidak akan tampil.");
      console.log("     Solusi: jadikan bucket public atau gunakan signed URL.");
    }
  } else {
    const names = buckets.map((b) => b.name).join(", ") || "(kosong)";
    console.log(`  ✘  Bucket "${bucket}" tidak ada. Bucket yg tersedia: ${names}`);
    tableOk = false;
  }
}

console.log("");
if (tableOk) {
  console.log("✅ Semua OK — env sudah benar dan skema sudah ada.\n");
} else {
  console.log("❌ Ada yang perlu diperbaiki. Lihat output di atas.\n");
  process.exit(1);
}
