"use client";

import { useAuth } from "@/lib/auth-context";
import { SHOP_INFO } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors = { username: "", password: "", general: "" };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    } else if (password.length < 4) {
      newErrors.password = "Mật khẩu phải có ít nhất 4 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const success = login(username, password);

    if (success) {
      router.push("/");
    } else {
      setErrors({
        username: "",
        password: "",
        general: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }
  };

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

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
            >
              Tên đăng nhập
            </label>
            <div className="relative">
              <i className="fa-solid fa-user absolute top-1/2 left-4 hidden -translate-y-1/2 text-(--color-text-muted) lg:block"></i>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors({ ...errors, username: "", general: "" });
                }}
                placeholder="admin / số điện thoại / tên nhân viên"
                className={`text-foreground focus:ring-opacity-20 w-full rounded-xl border bg-white px-10 py-3 transition-all duration-150 outline-none placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) lg:pl-11 ${errors.username ? "border-red-400" : "border-(--color-border)"} `}
              />
            </div>
            {errors.username && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <i className="fa-solid fa-circle-exclamation"></i>
                {errors.username}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute top-1/2 left-4 hidden -translate-y-1/2 text-(--color-text-muted) lg:block"></i>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "", general: "" });
                }}
                placeholder="Nhập mật khẩu"
                className={`text-foreground focus:ring-opacity-20 w-full rounded-xl border bg-white px-10 py-3 pr-11 transition-all duration-150 outline-none placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) lg:pl-11 ${errors.password ? "border-red-400" : "border-(--color-border)"} `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <i
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <i className="fa-solid fa-circle-exclamation"></i>
                {errors.password}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            {/* Login Button */}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl border-none bg-(--color-primary) py-3 font-semibold text-white transition-all duration-150 hover:bg-(--color-primary-dark) active:scale-98"
            >
              Đăng nhập
            </button>

            {/* Register Button */}
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl border-2 border-(--color-primary) bg-white py-3 font-semibold text-(--color-primary) no-underline transition-all duration-150 hover:bg-(--color-primary) hover:text-white active:scale-98"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </form>

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
