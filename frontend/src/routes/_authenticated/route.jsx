import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) {
      throw redirect({ to: "/auth" });
    }
    try {
      const res = await apiFetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      return { user: data.user };
    } catch (err) {
      if (typeof window !== 'undefined') localStorage.removeItem("token");
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
