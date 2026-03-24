"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SHOP_INFO } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "", general: "" });
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
      setErrors({ username: "", password: "", general: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: "var(--color-bg-main)",
      }}
    >
      {/* Login Form Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        
        {/* Logo & Shop Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
            <Image
              src={SHOP_INFO.logo}
              alt={SHOP_INFO.name}
              fill
              className="object-contain"
              sizes="80px"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-(--color-primary-dark) mb-1">
            {SHOP_INFO.name}
          </h1>
          <p className="text-sm text-(--color-text-muted)">
            Đăng nhập vào hệ thống
          </p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-(--color-text-secondary) mb-2">
              Tên đăng nhập
            </label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-muted) hidden lg:block"></i>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors({ ...errors, username: "", general: "" });
                }}
                placeholder="admin / số điện thoại / tên nhân viên"
                className={`
                  w-full px-4 lg:pl-11 py-3 rounded-xl border outline-none
                  bg-white text-(--color-text-primary)
                  placeholder:text-(--color-text-muted)
                  focus:border-(--color-primary) focus:ring-2
                  focus:ring-(--color-primary) focus:ring-opacity-20
                  transition-all duration-150
                  ${errors.username ? "border-red-400" : "border-(--color-border)"}
                `}
              />
            </div>
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation"></i>
                {errors.username}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-(--color-text-secondary) mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-muted) hidden lg:block"></i>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "", general: "" });
                }}
                placeholder="Nhập mật khẩu"
                className={`
                  w-full px-4 lg:pl-11 pr-11 py-3 rounded-xl border outline-none
                  bg-white text-(--color-text-primary)
                  placeholder:text-(--color-text-muted)
                  focus:border-(--color-primary) focus:ring-2
                  focus:ring-(--color-primary) focus:ring-opacity-20
                  transition-all duration-150
                  ${errors.password ? "border-red-400" : "border-(--color-border)"}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
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
              className="w-full py-3 rounded-xl font-semibold text-white
                         bg-(--color-primary) hover:bg-(--color-primary-dark)
                         active:scale-98 transition-all duration-150
                         border-none cursor-pointer"
            >
              Đăng nhập
            </button>

            {/* Register Button */}
            <Link
              href="/register"
              className="w-full py-3 rounded-xl font-semibold
                         bg-white text-(--color-primary)
                         border-2 border-(--color-primary)
                         hover:bg-(--color-primary) hover:text-white
                         active:scale-98 transition-all duration-150
                         flex items-center justify-center no-underline"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </form>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-(--color-bg-main) rounded-lg">
          <p className="text-xs text-(--color-text-muted) mb-2 font-semibold">Tài khoản demo:</p>
          <ul className="text-xs text-(--color-text-muted) space-y-1">
            <li>• Quản lý: <code className="bg-white px-1.5 py-0.5 rounded">admin / admin</code></li>
            <li>• Nhân viên: <code className="bg-white px-1.5 py-0.5 rounded">Nguyễn Văn An / Nguyễn Văn An</code></li>
            <li>• Khách hàng: <code className="bg-white px-1.5 py-0.5 rounded">0987654321 / user1</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
