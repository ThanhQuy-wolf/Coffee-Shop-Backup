import Button from "@/components/atoms/buttons/Button";
import ErrorMessageLogin from "@/components/atoms/errors/ErrorMessageLogin";
import LoginInput from "@/components/atoms/inputs/LoginInput";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  });

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
    <div>
      {/* Error Message */}
      {errors.general && <ErrorMessageLogin message={errors.general} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          {/* Username Input */}
          <LoginInput
            label="Tên đăng nhập"
            type="text"
            name="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors({ ...errors, username: "", general: "" });
            }}
            errors={errors.username}
          />
          {errors.username && (
            <ErrorMessageLogin message={errors.username} type="secondary" />
          )}
        </div>

        {/* Password Input */}
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

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          {/* Login Button */}
          <Button
            variant="primaryNoBorder"
            type="submit"
            style="login"
            size="lg"
          >
            Đăng nhập
          </Button>

          {/* Register Button */}
          <Link
            href="/register"
            className="flex w-full items-center justify-center rounded-xl border-2 border-(--color-primary) bg-white py-3 font-semibold text-(--color-primary) no-underline transition-all duration-150 hover:bg-(--color-primary) hover:text-white active:scale-98"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </form>
    </div>
  );
}
