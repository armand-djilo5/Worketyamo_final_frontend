import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSession } from "../utils/authStorage";


export function useRequireAdminAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session] = useState(() => getSession());
  const ready = Boolean(session?.token);

  useEffect(() => {
    if (!session?.token) {
      navigate("/admin/login", { state: { from: location }, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    admin: session?.admin ?? null,
    token: session?.token ?? null,
    refreshToken: session?.refreshToken ?? null,
    ready,
  };
}
