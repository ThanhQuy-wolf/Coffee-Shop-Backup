"use client";

import LoginForm from "@/components/organisms/forms/LoginForm";
import { SHOP_INFO } from "@/lib/constants";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      {/* Login Form Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo & Shop Name */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4 h-20 w-20">
            <Image
              src={SHOP_INFO.logo}
              alt={SHOP_INFO.name}
              fill
              className="object-contain"
              sizes="80px"
              priority
            />
          </div>
          <h1 className="mb-1 text-2xl font-bold text-(--color-primary-dark)">
            {SHOP_INFO.name}
          </h1>
          <p className="text-sm text-(--color-text-muted)">
            Đăng nhập vào hệ thống
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Demo Credentials Info */}
        <div className="bg-background mt-6 rounded-lg p-4">
          <p className="mb-2 text-xs font-semibold text-(--color-text-muted)">
            Tài khoản demo:
          </p>
          <ul className="space-y-1 text-xs text-(--color-text-muted)">
            <li>
              • Quản lý:{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                admin / admin
              </code>
            </li>
            <li>
              • Nhân viên:{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                Nguyễn Văn An / Nguyễn Văn An
              </code>
            </li>
            <li>
              • Khách hàng:{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                0987654321 / user1
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
