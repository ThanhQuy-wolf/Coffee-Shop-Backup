"use client";

import { Button, ErrorMessageLogin } from "@/components/atoms";
import { BRAND } from "@/lib/constants";
import { useAuth } from "@/lib/contexts/auth-context";
import { ApiError, VN_PHONE_REGEX, authService } from "@/lib/services";
import { errorMessage } from "@/lib/utils/errors";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useEffect, useState } from "react";

const DEMO_OTP = "123456"; // the mock always sends this code
const MIN_PASSWORD = 6;

/**
 * Classes for a register form input.
 * @param hasError Turns the border red.
 */
const inputClass = (hasError: boolean) =>
  `text-foreground w-full rounded-xl border bg-white px-4 py-3 outline-none transition-all duration-150 placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) ${hasError ? "border-(--color-danger)" : "border-(--color-border)"}`;

/**
 * Customer sign-up (UC-01) in two steps: send an OTP to the phone (A-3),
 * then enter the code, name and password to create the account (A-4).
 */
export default function RegisterPage() {
  const router = useRouter();
  const { startSession } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendOtp = async () => {
    setSending(true);
    try {
      const { resendAfter } = await authService.requestOtp(phone.trim());
      setResendIn(resendAfter);
      setStep("otp");
      setErrors({});
    } catch (err) {
      // BR-02: too soon; the server says how long to wait
      if (err instanceof ApiError && typeof err.details.retryAfter === "number")
        setResendIn(err.details.retryAfter);
      setErrors({ phone: errorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  const handlePhoneSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!VN_PHONE_REGEX.test(phone.trim())) {
      setErrors({ phone: "Số điện thoại không hợp lệ (VD: 0912345678)" });
      return;
    }
    sendOtp();
  };

  const handleRegister = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\d{6}$/.test(otp)) next.otp = "Mã OTP gồm 6 chữ số";
    if (!fullName.trim()) next.fullName = "Vui lòng nhập họ tên";
    if (password.length < MIN_PASSWORD)
      next.password = `Mật khẩu ít nhất ${MIN_PASSWORD} ký tự`;
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      const session = await authService.register({
        phone: phone.trim(),
        otp,
        fullName: fullName.trim(),
        password,
      });
      startSession(session);
      router.push("/");
    } catch (err) {
      setErrors({ otp: errorMessage(err) });
      setSending(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4 h-20 w-20">
            <Image
              src={BRAND.logo}
              alt={`Logo ${BRAND.name}`}
              fill
              className="object-contain"
              sizes="80px"
              priority
            />
          </div>
          <h1 className="mb-1 text-2xl font-bold text-(--color-primary-dark)">
            {BRAND.name}
          </h1>
          <p className="text-sm text-(--color-text-muted)">
            {step === "phone"
              ? "Đăng ký tài khoản khách hàng"
              : "Xác thực và đặt mật khẩu"}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
              >
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors({});
                }}
                placeholder="0912345678"
                className={inputClass(!!errors.phone)}
              />
              <ErrorMessageLogin type="secondary" message={errors.phone} />
            </div>
            <div className="space-y-3 pt-2">
              <Button
                variant="primaryNoBorder"
                type="submit"
                style="login"
                size="lg"
                disabled={sending}
              >
                {sending ? "Đang gửi mã..." : "Gửi mã OTP"}
              </Button>
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl border-2 border-(--color-primary) bg-white py-3 font-semibold text-(--color-primary) no-underline transition-all duration-150 hover:bg-(--color-primary) hover:text-white"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              Mã OTP đã gửi tới <strong>{phone}</strong>. Mã demo:{" "}
              <code className="rounded bg-white px-2 py-1 font-mono">
                {DEMO_OTP}
              </code>
            </div>
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
              >
                Mã OTP
              </label>
              <input
                id="otp"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                className={`${inputClass(!!errors.otp)} text-center text-lg tracking-widest`}
              />
              <ErrorMessageLogin type="secondary" message={errors.otp} />
            </div>
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
              >
                Họ tên
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
                className={inputClass(!!errors.fullName)}
              />
              <ErrorMessageLogin type="secondary" message={errors.fullName} />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass(!!errors.password)}
              />
              <ErrorMessageLogin type="secondary" message={errors.password} />
            </div>
            <div className="space-y-3 pt-2">
              <Button
                variant="primaryNoBorder"
                type="submit"
                style="login"
                size="lg"
                disabled={sending}
              >
                {sending ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký"}
              </Button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="cursor-pointer border-none bg-transparent text-(--color-text-muted) hover:text-(--color-primary)"
                >
                  Đổi số điện thoại
                </button>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={resendIn > 0 || sending}
                  className="cursor-pointer border-none bg-transparent text-(--color-primary) disabled:cursor-not-allowed disabled:text-(--color-text-muted)"
                >
                  {resendIn > 0 ? `Gửi lại mã (${resendIn}s)` : "Gửi lại mã"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
