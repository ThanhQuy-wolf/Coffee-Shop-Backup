"use client";

import Button from "@/components/atoms/buttons/Button";
import { useAuth } from "@/lib/auth-context";
import { SHOP_INFO } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

// Static OTP for demo (in production, this would be sent via SMS)
const DEMO_OTP = "123456";

export default function RegisterPage() {
  const router = useRouter();
  const { completeRegistration } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({ phone: "", otp: "" });

  // Validate Vietnamese phone number
  const validatePhone = (phoneNumber: string): boolean => {
    // Vietnamese phone format: 10 digits starting with 0
    // Valid prefixes: 03, 05, 07, 08, 09
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handlePhoneSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phone.trim()) {
      setErrors({ ...errors, phone: "Vui lòng nhập số điện thoại" });
      return;
    }

    if (!validatePhone(phone)) {
      setErrors({
        ...errors,
        phone: "Số điện thoại không hợp lệ (VD: 0987654321)",
      });
      return;
    }

    

    // Move to OTP step
    setStep("otp");
    setErrors({ phone: "", otp: "" });
  };

  const handleOtpSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp.trim()) {
      setErrors({ ...errors, otp: "Vui lòng nhập mã OTP" });
      return;
    }

    if (otp !== DEMO_OTP) {
      setErrors({ ...errors, otp: "Mã OTP không đúng" });
      return;
    }

    // Complete registration
    completeRegistration(phone);
    router.push("/");
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setErrors({ phone: "", otp: "" });
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      {/* Register Form Card */}
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
            {step === "phone"
              ? "Đăng ký tài khoản khách hàng"
              : "Xác thực số điện thoại"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              step === "phone"
                ? "bg-(--color-primary) text-white"
                : "bg-(--color-accent-light) text-(--color-primary-dark)"
            }`}
          >
            1
          </div>
          <div className="h-0.5 w-12 bg-(--color-border)"></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              step === "otp"
                ? "bg-(--color-primary) text-white"
                : "bg-(--color-border-light) text-(--color-text-muted)"
            }`}
          >
            2
          </div>
        </div>

        {/* Phone Step */}
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            {/* Phone Input */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
              >
                Số điện thoại
              </label>
              <div className="relative">
                <i className="fa-solid fa-phone absolute top-1/2 left-4 hidden -translate-y-1/2 text-(--color-text-muted) lg:block"></i>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="0987654321"
                  className={`text-foreground focus:ring-opacity-20 w-full rounded-xl border bg-white px-10 py-3 transition-all duration-150 outline-none placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) lg:pl-11 ${errors.phone ? "border-red-400" : "border-(--color-border)"} `}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.phone}
                </p>
              )}
              <p className="mt-2 text-xs text-(--color-text-muted)">
                Nhập số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              {/* Submit Button */}
              <Button
                variant="primaryNoBorder"
                type="submit"
                style="login"
                size="lg"
              >
                Tiếp tục
              </Button>

              {/* Back to Login */}
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl border-2 border-(--color-primary) bg-white py-3 font-semibold text-(--color-primary) no-underline transition-all duration-150 hover:bg-(--color-primary) hover:text-white active:scale-98"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            {/* Info Message */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-2 text-sm text-blue-800">
                <i className="fa-solid fa-circle-info mr-2"></i>
                Mã OTP đã được gửi đến số <strong>{phone}</strong>
              </p>
              <p className="text-xs text-blue-600">
                Demo OTP:{" "}
                <code className="rounded bg-white px-2 py-1 font-mono">
                  {DEMO_OTP}
                </code>
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
              >
                Mã OTP
              </label>
              <div className="relative">
                <i className="fa-solid fa-key absolute top-1/2 left-4 hidden -translate-y-1/2 text-(--color-text-muted) lg:block"></i>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setErrors({ ...errors, otp: "" });
                  }}
                  placeholder="Nhập mã OTP"
                  maxLength={6}
                  className={`text-foreground focus:ring-opacity-20 w-full rounded-xl border bg-white px-4 py-3 text-center text-lg tracking-widest transition-all duration-150 outline-none placeholder:text-sm placeholder:tracking-normal placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) lg:pl-11 ${errors.otp ? "border-red-400" : "border-(--color-border)"} `}
                />
              </div>
              {errors.otp && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.otp}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              {/* Submit Button */}
              <Button
                variant="primaryNoBorder"
                type="submit"
                style="login"
                size="lg"
              >
                Hoàn tất đăng ký
              </Button>

              {/* Back Button */}
              <Button
                variant="bgWhite"
                onClick={handleBackToPhone}
                size="lg"
                style="login"
              >
                Thay đổi số điện thoại
              </Button>
            </div>

            {/* Resend OTP (disabled in demo) */}
            <div className="text-center">
              <button
                type="button"
                disabled
                className="cursor-not-allowed text-sm text-(--color-text-muted)"
              >
                Gửi lại mã OTP (60s)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
