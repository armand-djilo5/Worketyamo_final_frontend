import { useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";


export function useAuthorizedRequest() {
  const { token, refreshAccessToken, logout } = useAuth();

  const request = useCallback(
    async (config) => {
      try {
        return await axios({
          ...config,
          headers: { ...config.headers, Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        if (error?.response?.status === 401) {
          try {
            const newToken = await refreshAccessToken();
            return await axios({
              ...config,
              headers: { ...config.headers, Authorization: `Bearer ${newToken}` },
            });
          } catch {
            await logout();
            throw error;
          }
        }
        throw error;
      }
    },
    [token, refreshAccessToken, logout]
  );

  return request;
}
