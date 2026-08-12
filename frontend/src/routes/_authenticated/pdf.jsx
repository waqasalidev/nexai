import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, Sparkles, MessageSquare, Send, Trash2, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { Markdown } from "@/components/Markdown";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/pdf")({ component: PdfPage });

function PdfPage() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function loadDocuments() {
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/documents", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function selectDoc(docId) {
    setActiveDocId(docId);
    if (!docId) {
      setActiveDoc(null);
      setChat([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/api/documents/${docId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load document analysis");
      const data = await res.json();
      setActiveDoc(data.document);
      setChat(data.document.analysisHistory || []);
    } catch (err) {
      toast.error("Error loading document details");
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/documents/upload", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload document");
      toast.success("PDF analyzed successfully!");
      loadDocuments();
      selectDoc(data.document._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function askQuestion(e) {
    e.preventDefault();
    const qText = question.trim();
    if (!qText || asking || !activeDocId) return;

    const nextChat = [...chat, { question: qText, answer: "" }];
    setChat(nextChat);
    setQuestion("");
    setAsking(true);

    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/api/documents/${activeDocId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question: qText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get response");
      
      setChat((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { question: qText, answer: data.answer };
        return copy;
      });
    } catch (err) {
      setChat((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          question: qText,
          answer: "Sorry, I couldn't process that question. Please try again.",
        };
        return copy;
      });
      toast.error(err.message);
    } finally {
      setAsking(false);
    }
  }

  async function deleteDoc(docId, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/api/documents/${docId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete document");
      toast.success("Document deleted");
      if (activeDocId === docId) {
        selectDoc(null);
      }
      loadDocuments();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <AppShell title="AI PDF Analyzer">
      {activeDoc ? (
        <div className="space-y-4">
          <button
            onClick={() => selectDoc(null)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-2 cursor-pointer min-h-[44px] px-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Uploads
          </button>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left side: PDF Details and Summaries */}
            <div className="lg:col-span-3 space-y-6">
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-accent/10 border border-accent/20 grid place-items-center">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-lg line-clamp-1">{activeDoc.fileName}</h2>
                      <p className="text-xs text-muted-foreground">
                        Size: {(activeDoc.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteDoc(activeDoc._id, e)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="border-t border-border/50 pt-5 space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" /> Summary
                    </h3>
                    <div className="text-sm leading-relaxed text-muted-foreground glass p-4 rounded-xl break-words overflow-x-auto">
                      <Markdown content={activeDoc.summary || "Generating summary..."} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <Sparkles className="h-4 w-4 text-accent" /> Key Points
                    </h3>
                    <div className="text-sm leading-relaxed text-muted-foreground glass p-4 rounded-xl break-words overflow-x-auto">
                      <Markdown content={activeDoc.keyPoints || "Extracting key points..."} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Chat with Document */}
            <div className="lg:col-span-2 glass rounded-2xl p-5 flex flex-col h-[500px] sm:h-[650px]">
              <div className="border-b border-border/50 pb-3 mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold">Chat with Document</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {chat.length === 0 && (
                  <div className="text-center py-20 text-xs text-muted-foreground">
                    Ask any question about this PDF to analyze specific sections, extract references, or rewrite contents.
                  </div>
                )}

                {chat.map((item, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground px-4 py-2.5 text-sm break-words">
                        {item.question}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[90%] space-y-1 break-words overflow-x-auto">
                        {item.answer ? (
                          <Markdown content={item.answer} />
                        ) : (
                          <div className="text-sm text-muted-foreground">Analyzing PDF contents...</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={askQuestion} className="mt-4 pt-3 border-t border-border/50 flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about this file..."
                  disabled={asking}
                  className="flex-1 rounded-xl bg-input border border-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={asking || !question.trim()}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center disabled:opacity-40 hover:scale-105 transition shrink-0 cursor-pointer disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
                >
                  <Send className="h-4 w-4 text-primary-foreground" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Uploader Card */}
          <div className="glass rounded-2xl p-8 text-center border-2 border-dashed border-border/60 hover:border-primary/50 transition relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            {uploading ? (
              <div className="py-8 space-y-3 flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <h3 className="font-semibold text-lg">Analyzing Document...</h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  NexAI is parsing PDF pages and running neural model checks. This will take a few seconds.
                </p>
              </div>
            ) : (
              <div className="py-8 space-y-4 flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 grid place-items-center shadow-lg">
                  <Upload className="h-6 w-6 text-accent animate-bounce" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Upload your PDF</h3>
                  <p className="text-xs text-muted-foreground max-w-md mt-1">
                    Drag and drop your PDF here, or click to browse. Max size 20MB.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Past Uploads List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Recently Analyzed Documents</h3>
            {documents.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center text-xs text-muted-foreground">
                No analyzed documents found. Upload a PDF above to get started.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => selectDoc(doc._id)}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-white/[0.04] cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 pr-4 truncate">
                      <FileText className="h-5 w-5 text-accent shrink-0" />
                      <div className="truncate">
                        <h4 className="font-medium text-sm truncate">{doc.fileName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteDoc(doc._id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive p-1 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
