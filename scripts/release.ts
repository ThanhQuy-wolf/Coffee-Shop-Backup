import { execSync } from "node:child_process";

const version = process.argv[2];
if (!version) {
  console.error("❌ Version không được cung cấp!");
  process.exit(1);
}

const zipPath = "release.zip";

console.log(`📦 Đang nén file cho version: ${version}...`);

execSync(`zip -r ${zipPath} out`, {
  stdio: "inherit",
});

console.log(`✅ Đã tạo file zip: ${zipPath}`);

execSync("pnpm format");
