import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, CreditCard, Sparkles, Mail, ShieldAlert, Loader2, ArrowRight, Trash2, Shield, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPage });

function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Load stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData.stats);

      // Load users
      const usersRes = await fetch("/api/admin/users", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) setAdminUsers(usersData.users);

      // Load messages
      const msgRes = await fetch("/api/admin/messages", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const msgData = await msgRes.json();
      if (msgRes.ok) setMessages(msgData.messages);

    } catch (err) {
      console.error(err);
      toast.error("Error loading admin records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, [user]);

  async function toggleRole(userId, currentRole) {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) throw new Error("Failed to change user role");
      toast.success("User role updated");
      loadAdminData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function updatePlan(userId, plan) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Failed to update plan");
      toast.success("User subscription updated");
      loadAdminData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteMessage(msgId) {
    if (!confirm("Delete this message?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/messages/${msgId}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error("Failed to delete message");
      toast.success("Message deleted");
      loadAdminData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) {
    return (
      <AppShell title="Admin Core">
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (user?.role !== "admin") {
    return (
      <AppShell title="Access Restricted">
        <div className="mx-auto max-w-md text-center py-16 space-y-4">
          <div className="h-16 w-16 bg-destructive/10 rounded-full border border-destructive/20 grid place-items-center mx-auto text-destructive shadow-lg shadow-destructive/5">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="font-display font-bold text-xl">Authorization Error</h2>
          <p className="text-sm text-muted-foreground">
            You do not have administrative clearance to access the NexAI core dashboards. Please contact an system administrator.
          </p>
          <Link
            to="/dashboard"
            className="inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            Return to Workspace
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="NexAI Admin Dashboard">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border/50 pb-2">
          {["overview", "users", "messages"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab
                  ? "bg-primary/20 text-foreground border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            {/* Overview cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass rounded-2xl p-5 border border-border/40 space-y-2.5">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wide">Total Users</span>
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-display">{stats.totalUsers}</h3>
              </div>

              <div className="glass rounded-2xl p-5 border border-border/40 space-y-2.5">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wide">Premium Subscribers</span>
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-display">{stats.activeSubscriptions}</h3>
              </div>

              <div className="glass rounded-2xl p-5 border border-border/40 space-y-2.5">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wide">AI Executions</span>
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-display">{stats.totalAiRequests}</h3>
              </div>

              <div className="glass rounded-2xl p-5 border border-border/40 space-y-2.5">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wide">Inbound Messages</span>
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-display">{stats.totalMessages}</h3>
              </div>
            </div>

            {/* Usage Analytics representation */}
            <div className="glass rounded-2xl p-6 border border-border/40 space-y-4">
              <h3 className="text-sm font-semibold">AI Tool Utilization Analytics</h3>
              <div className="space-y-3">
                {Object.entries(stats.toolUsageStats || {}).map(([tool, count]) => {
                  const max = Math.max(...Object.values(stats.toolUsageStats || {}), 1);
                  const pct = (count / max) * 100;
                  return (
                    <div key={tool} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground font-medium">{tool}</span>
                        <span className="font-semibold text-foreground">{count} runs</span>
                      </div>
                      <div className="w-full bg-input rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="glass rounded-2xl overflow-hidden border border-border/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-white/[0.01] text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="p-4">Name / Email</th>
                    <th className="p-4">Authorization Role</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {adminUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{u.name || "N/A"}</div>
                        <div className="text-muted-foreground mt-0.5">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-accent/15 text-accent border border-accent/25"
                            : "bg-white/[0.04] text-muted-foreground border border-border/20"
                        }`}>
                          {u.role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold uppercase tracking-wide">{u.plan || "Free"}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => toggleRole(u._id, u.role)}
                          className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-white/[0.03] text-muted-foreground hover:text-foreground transition font-medium"
                        >
                          Toggle Admin
                        </button>
                        <select
                          value={u.plan || "free"}
                          onChange={(e) => updatePlan(u._id, e.target.value)}
                          className="rounded-lg bg-input border border-border px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center text-xs text-muted-foreground">
                Inbox clear. No customer messages found.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m._id}
                  className="glass rounded-2xl p-5 border border-border/40 flex justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{m.subject}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          From: <span className="font-medium text-foreground">{m.name}</span> ({m.email})
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium bg-white/[0.03] px-2 py-1 rounded">
                        {new Date(m.createdAt).toLocaleDateString()} at {new Date(m.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed p-3.5 bg-black/15 rounded-xl border border-border/30">
                      {m.message}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-start">
                    <button
                      onClick={() => deleteMessage(m._id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition"
                      title="Delete Message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
