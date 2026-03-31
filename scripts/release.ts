import { execSync } from "node:child_process";
import fs from "node:fs";

const version = process.argv[2];
if (!version) {
  console.error("❌ Version không được cung cấp!");
  process.exit(1);
}

const zipPath = `release-v${version}.zip`; // Thêm version vào tên file cho dễ quản lý

console.log(
  `📦 Đang chuẩn bị đóng gói App Router Standalone cho version: ${version}...`,
);

// Kiểm tra xem đã build chưa
if (!fs.existsSync(".next/standalone")) {
  console.error(
    "❌ Thư mục .next/standalone không tồn tại. Hãy chạy 'pnpm build' trước!",
  );
  process.exit(1);
}

/**
 * Với Next.js Standalone, ta cần:
 * 1. Nội dung trong .next/standalone (copy ra ngoài hoặc nén trực tiếp)
 * 2. .next/static (phải nằm trong .next/static của gói release)
 * 3. public (phải nằm trong public của gói release)
 */

try {
  // Tạo thư mục tạm để cấu trúc lại file trước khi nén
  execSync("rm -rf temp_release && mkdir -p temp_release");

  console.log("🚚 Đang sao chép các file standalone...");
  execSync("cp -r .next/standalone/. temp_release/");

  console.log("🚚 Đang sao chép static và public...");
  execSync("mkdir -p temp_release/.next/static");
  execSync("cp -r .next/static/. temp_release/.next/static/");
  execSync("cp -r public temp_release/ 2>/dev/null || : "); // Bỏ qua nếu không có thư mục public

  console.log("🗜️ Đang nén thành file zip...");
  // Di chuyển vào temp_release để nén các file bên trong nó
  execSync(`cd temp_release && zip -r ../${zipPath} .`, { stdio: "inherit" });

  // Xóa thư mục tạm
  execSync("rm -rf temp_release");

  console.log(`✅ Đã tạo file thành công: ${zipPath}`);

  execSync("pnpm format");
} catch (error) {
  console.error("❌ Có lỗi xảy ra trong quá trình nén:", error.message);
  process.exit(1);
}
