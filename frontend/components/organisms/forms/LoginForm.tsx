"use client";

import Button from "@/components/atoms/buttons/Button";
import ErrorMessageLogin from "@/components/atoms/errors/ErrorMessageLogin";
import LoginInput from "@/components/atoms/inputs/LoginInput";
import { homePathFor, useAuth } from "@/lib/contexts/auth-context";
import { ApiError, VN_PHONE_REGEX } from "@/lib/services";
import { errorMessage } from "@/lib/utils/errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";

type Mode = "customer" | "staff";

const NO_ERRORS = { account: "", password: "", general: "" };

/** UC-02: khách (A-1), nhân viên và quản lý (A-2) */
export default function LoginForm() {
  const router = useRouter();
  const { loginCustomer, loginStaff } = useAuth();

  const [mode, setMode] = useState<Mode>("customer");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(NO_ERRORS);
  const [sending, setSending] = useState(false);

  const isCustomer = mode === "customer";

  const switchMode = (next: Mode) => {
    setMode(next);
    setAccount("");
    setPassword("");
    setErrors(NO_ERRORS);
  };

  const validate = (): boolean => {
    const next = { ...NO_ERRORS };
    if (!account.trim())
      next.account = isCustomer
        ? "Vui lòng nhập số điện thoại"
        : "Vui lòng nhập tên đăng nhập";
    else if (isCustomer && !VN_PHONE_REGEX.test(account.trim()))
      next.account = "Số điện thoại không hợp lệ (VD: 0987654321)";
    if (!password) next.password = "Vui lòng nhập mật khẩu";
    setErrors(next);
    return !next.account && !next.password;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const user = isCustomer
        ? await loginCustomer(account.trim(), password)
        : await loginStaff(account.trim(), password);
      router.push(homePathFor(user.role));
    } catch (err) {
      // BR-04: the lock message carries the remaining minutes, so show it as is
      const general =
        err instanceof ApiError && err.status === 401
          ? isCustomer
            ? "Số điện thoại hoặc mật khẩu không đúng"
            : "Tên đăng nhập hoặc mật khẩu không đúng"
          : errorMessage(err);
      setErrors({ ...NO_ERRORS, general });
      setSending(false);
    }
  };

  const tab = (value: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => switchMode(value)}
      className={`flex-1 cursor-pointer rounded-lg border-none py-2 text-sm font-semibold transition ${
        mode === value
          ? "bg-white text-(--color-primary-dark) shadow-sm"
          : "bg-transparent text-(--color-text-muted)"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div
        role="tablist"
        className="mb-5 flex gap-1 rounded-xl bg-(--color-border-light) p-1"
      >
        {tab("customer", "Khách hàng")}
        {tab("staff", "Nhân viên quán")}
      </div>

      {errors.general && <ErrorMessageLogin message={errors.general} />}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <LoginInput
            label={isCustomer ? "Số điện thoại" : "Tên đăng nhập"}
            type={isCustomer ? "tel" : "text"}
            name="account"
            value={account}
            onChange={(e) => {
              setAccount(e.target.value);
              setErrors({ ...errors, account: "", general: "" });
            }}
            errors={errors.account}
          />
          {errors.account && (
            <ErrorMessageLogin message={errors.account} type="secondary" />
          )}
        </div>

        <div>
          <LoginInput
            label="Mật khẩu"
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: "", general: "" });
            }}
            errors={errors.password}
          />
          {errors.password && (
            <ErrorMessageLogin message={errors.password} type="secondary" />
          )}
        </div>

        <div className="space-y-3 pt-2">
          <Button
            variant="primaryNoBorder"
            type="submit"
            style="login"
            size="lg"
            disabled={sending}
          >
            {sending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          {isCustomer && (
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl border-2 border-(--color-primary) bg-white py-3 font-semibold text-(--color-primary) no-underline transition-all duration-150 hover:bg-(--color-primary) hover:text-white active:scale-98"
            >
              Đăng ký tài khoản
            </Link>
          )}
          <Link
            href="/"
            className="block text-center text-sm text-(--color-text-muted) hover:text-(--color-primary)"
          >
            Đặt món không cần đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
