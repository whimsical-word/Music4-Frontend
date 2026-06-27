import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../features/auth/useAuthStore";

export default function OAuth2RedirectPage() {
  const [params]        = useSearchParams();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate        = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const ok    = loginWithGoogle(token);
    navigate(ok ? "/" : "/login", { replace: true });
  }, []);

  return <p>Đang đăng nhập...</p>;
}