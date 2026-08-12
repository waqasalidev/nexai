import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Markdown, CopyButton } from "@/components/Markdown";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/chat")({ component: ChatPage });

function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user chats list
  async function loadChats() {
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/chats", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load chats");
      const data = await res.json();
      setChats(data.chats || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadChats();
  }, []);

  // Load active chat history
  async function selectChat(chatId) {
    if (busy) return;
    setActiveChatId(chatId);
    if (!chatId) {
      setMessages([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/api/chats/${chatId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load conversation");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      toast.error("Error loading chat history");
    }
  }

  // Delete chat thread
  async function deleteChat(chatId, e) {
    e.stopPropagation();
    if (busy) return;
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete chat");
      toast.success("Conversation deleted");
      if (activeChatId === chatId) {
        selectChat(null);
      }
      loadChats();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    let chatId = activeChatId;
    const next = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const token = localStorage.getItem("token");
      
      // If no active chat, create one first
      if (!chatId) {
        const createRes = await apiFetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ title: text.slice(0, 40) || "New Conversation" }),
        });
        if (!createRes.ok) throw new Error("Failed to create chat");
        const createData = await createRes.json();
        chatId = createData.chat._id;
        setActiveChatId(chatId);
        loadChats();
      }

      // Stream assistant response
      const res = await apiFetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return copy;
      });
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="AI Chat">
      <div className="flex h-[calc(100vh-10rem)] relative overflow-hidden -mx-6 -my-8">
        {/* SIDEBAR FOR PAST CHATS */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <>
              {/* Mobile backdrop for chat sidebar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-xs"
              />

              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full border-r border-border/50 bg-background/95 md:bg-background/50 flex flex-col shrink-0 overflow-hidden absolute md:relative left-0 top-0 z-40"
              >
                <div className="p-4 border-b border-border/50">
                  <button
                    onClick={() => selectChat(null)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-white/[0.04] px-4 py-3 text-sm font-semibold transition cursor-pointer min-h-[44px]"
                  >
                    <Plus className="h-4 w-4" /> New Chat
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {chats.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-8">
                      No past conversations
                    </div>
                  ) : (
                    chats.map((c) => {
                      const active = c._id === activeChatId;
                      return (
                        <div
                          key={c._id}
                          onClick={() => {
                            selectChat(c._id);
                            if (window.innerWidth < 768) setSidebarOpen(false);
                          }}
                          className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm cursor-pointer transition ${
                            active
                              ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate">{c.title}</span>
                          </div>
                          <button
                            onClick={(e) => deleteChat(c._id, e)}
                            className="opacity-100 md:opacity-0 group-hover:opacity-100 hover:text-destructive p-1 rounded transition shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                            title="Delete Chat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* SIDEBAR TOGGLE BUTTON */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Conversation List"
          className="absolute left-3 top-3 z-30 h-10 w-10 rounded-xl border border-border bg-card/90 backdrop-blur grid place-items-center text-muted-foreground hover:text-foreground transition cursor-pointer min-h-[44px] min-w-[44px]"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* CHAT MAIN AREA */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-36 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-16 sm:py-20">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center glow mb-4">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold">How can I help today?</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Ask anything — coding, research, writing, career advice.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "user" ? (
                  <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground px-4 py-3 text-sm break-words">
                    {m.content}
                  </div>
                ) : (
                  <div className="space-y-2 max-w-[90%] sm:max-w-[85%] break-words overflow-x-auto">
                    {m.content ? (
                      <Markdown content={m.content} />
                    ) : (
                      <div className="text-sm text-muted-foreground">Thinking…</div>
                    )}
                    {m.content && <CopyButton text={m.content} />}
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl px-2">
            <div className="glass-strong rounded-2xl p-2 neon-border flex items-end gap-2 shadow-2xl">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything…"
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground max-h-40"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center disabled:opacity-40 shrink-0 shadow-lg hover:scale-105 transition cursor-pointer disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
              >
                <Send className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
