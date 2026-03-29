"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SHOP_INFO } from "@/lib/constants";

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

  const handlePhoneSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      setErrors({ ...errors, phone: "Vui lòng nhập số điện thoại" });
      return;
    }

    if (!validatePhone(phone)) {
      setErrors({ ...errors, phone: "Số điện thoại không hợp lệ (VD: 0987654321)" });
      return;
    }

    // Move to OTP step
    setStep("otp");
    setErrors({ phone: "", otp: "" });
  };

  const handleOtpSubmit = (e: FormEvent) => {
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
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-background"
    >
      {/* Register Form Card */}
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
            {step === "phone" ? "Đăng ký tài khoản khách hàng" : "Xác thực số điện thoại"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step === "phone" 
              ? "bg-(--color-primary) text-white" 
              : "bg-(--color-accent-light) text-(--color-primary-dark)"
          }`}>
            1
          </div>
          <div className="w-12 h-0.5 bg-(--color-border)"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step === "otp" 
              ? "bg-(--color-primary) text-white" 
              : "bg-(--color-border-light) text-(--color-text-muted)"
          }`}>
            2
          </div>
        </div>

        {/* Phone Step */}
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            
            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-(--color-text-secondary) mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-muted) hidden lg:block"></i>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="0987654321"
                  className={`
                    w-full px-10 lg:pl-11 py-3 rounded-xl border outline-none
                    bg-white text-foreground
                    placeholder:text-(--color-text-muted)
                    focus:border-(--color-primary) focus:ring-2
                    focus:ring-(--color-primary) focus:ring-opacity-20
                    transition-all duration-150
                    ${errors.phone ? "border-red-400" : "border-(--color-border)"}
                  `}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
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
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-white
                           bg-(--color-primary) hover:bg-(--color-primary-dark)
                           active:scale-98 transition-all duration-150
                           border-none cursor-pointer"
              >
                Tiếp tục
              </button>

              {/* Back to Login */}
              <Link
                href="/login"
                className="w-full py-3 rounded-xl font-semibold
                           bg-white text-(--color-primary)
                           border-2 border-(--color-primary)
                           hover:bg-(--color-primary) hover:text-white
                           active:scale-98 transition-all duration-150
                           flex items-center justify-center no-underline"
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
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <i className="fa-solid fa-circle-info mr-2"></i>
                Mã OTP đã được gửi đến số <strong>{phone}</strong>
              </p>
              <p className="text-xs text-blue-600">
                Demo OTP: <code className="bg-white px-2 py-1 rounded font-mono">{DEMO_OTP}</code>
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-(--color-text-secondary) mb-2">
                Mã OTP
              </label>
              <div className="relative">
                <i className="fa-solid fa-key absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-muted) hidden lg:block"></i>
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
                  className={`
                    w-full px-4 lg:pl-11 py-3 rounded-xl border outline-none
                    bg-white text-foreground text-center text-lg tracking-widest
                    placeholder:text-(--color-text-muted) placeholder:text-sm placeholder:tracking-normal
                    focus:border-(--color-primary) focus:ring-2
                    focus:ring-(--color-primary) focus:ring-opacity-20
                    transition-all duration-150
                    ${errors.otp ? "border-red-400" : "border-(--color-border)"}
                  `}
                />
              </div>
              {errors.otp && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.otp}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-white
                           bg-(--color-primary) hover:bg-(--color-primary-dark)
                           active:scale-98 transition-all duration-150
                           border-none cursor-pointer"
              >
                Hoàn tất đăng ký
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToPhone}
                className="w-full py-3 rounded-xl font-semibold
                           bg-white text-(--color-primary)
                           border-2 border-(--color-primary)
                           hover:bg-(--color-primary) hover:text-white
                           active:scale-98 transition-all duration-150"
              >
                Thay đổi số điện thoại
              </button>
            </div>

            {/* Resend OTP (disabled in demo) */}
            <div className="text-center">
              <button
                type="button"
                disabled
                className="text-sm text-(--color-text-muted) cursor-not-allowed"
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
