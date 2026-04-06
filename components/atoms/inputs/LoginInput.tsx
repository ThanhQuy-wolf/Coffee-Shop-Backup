import { useState } from "react";

import { LoginInputProps } from "./Input.types";

export default function LoginInput({
  label,
  type,
  name,
  value,
  errors,
  onChange,
  ...restProps
}: LoginInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  function isPassword() {
    if (type === "password") {
      return (
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
      );
    }
    return "";
  }

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
      >
        {label}
      </label>
      <div className="relative">
        <i className="fa-solid fa-user absolute top-1/2 left-4 hidden -translate-y-1/2 text-(--color-text-muted) lg:block"></i>
        <input
          id={name}
          type={showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder= {type === "password" ? "Mật khẩu" : "admin / số điện thoại / tên nhân viên"}
          className={`text-foreground focus:ring-opacity-20 w-full rounded-xl border bg-white px-10 py-3 transition-all duration-150 outline-none placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) lg:pl-11 ${errors ? "border-red-400" : "border-(--color-border)"} `}
        />
        {isPassword()}
      </div>
    </div>
  );
}
