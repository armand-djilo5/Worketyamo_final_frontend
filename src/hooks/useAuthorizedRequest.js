import { useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/env";
import { getSession, setSession, clearSession } from "../utils/authStorage";

// This hook does NOT define any backend routes and does NOT use React
// Context. Each page still writes its own axios call with its own URL —
// this only wraps that call so it carries the admin's bearer token (read
// straight from localStorage) and transparently refreshes it once on a 401
// via POST /api/admin/refresh, then retries the exact same request.
export function useAuthorizedRequest() {
  const navigate = useNavigate();

  const request = useCallback(
    async (config) => {
      const session = getSession();
      try {
        return await axios({
          ...config,
          headers: { ...config.headers, Authorization: `Bearer ${session?.token}` },
        });
      } catch (error) {
        if (error?.response?.status === 401 && session?.refreshToken) {
          try {
            const refreshRes = await axios.post(`${API_BASE_URL}/admin/refresh`, {
              refreshToken: session.refreshToken,
            });
            const newToken = refreshRes.data.accessToken;
            setSession({ ...session, token: newToken });
            return await axios({
              ...config,
              headers: { ...config.headers, Authorization: `Bearer ${newToken}` },
            });
          } catch (refreshError) {
            clearSession();
            navigate("/admin/login", { replace: true });
            throw refreshError;
          }
        }
        throw error;
      }
    },
    [navigate]
  );

  return request;
}
