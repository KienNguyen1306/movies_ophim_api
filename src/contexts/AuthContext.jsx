"use client";
/**
 * AuthContext — đăng ký / đăng nhập qua MySQL API
 *
 * Session được lưu bằng httpOnly cookie (JWT) phía server.
 * Client chỉ giữ user object trong React state (không còn localStorage).
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  // Khôi phục session từ cookie khi app load
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => setUser(user ?? null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  /** Đăng ký tài khoản mới */
  const signup = useCallback(async ({ name, email, password }) => {
    const res = await fetch("/api/auth/signup", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Đăng ký thất bại");
    setUser(data.user);
    return data.user;
  }, []);

  /** Đăng nhập */
  const login = useCallback(async ({ email, password }) => {
    const res = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Đăng nhập thất bại");
    setUser(data.user);
    return data.user;
  }, []);

  /** Đăng xuất */
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
