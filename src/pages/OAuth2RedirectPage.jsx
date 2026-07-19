import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../features/auth/useAuthStore";

export default function OAuth2RedirectPage() {
  const [params]        = useSearchParams();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate        = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const ok = loginWithGoogle(token);

    if (ok) {
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [params, loginWithGoogle, navigate]);

  return (
      <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <p className="animate-pulse font-medium">Đang đăng nhập hệ thống...</p>
      </div>
  );
}