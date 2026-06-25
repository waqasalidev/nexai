import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileSignature, Loader2, Plus, Trash2, Download, Save, Sparkles, Printer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/resume")({ component: ResumePage });

function ResumePage() {
  const [resumes, setResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [title, setTitle] = useState("My Professional Resume");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Resume Content Structure
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);

  async function loadResumes() {
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/resumes", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load resumes");
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadResumes();
  }, []);

  async function selectResume(resume) {
    if (!resume) {
      setActiveResumeId(null);
      setTitle("New Resume");
      setSummary("");
      setSkills([]);
      setExperience([]);
      setEducation([]);
      return;
    }
    setActiveResumeId(resume._id);
    setTitle(resume.title);
    setSummary(resume.content?.summary || "");
    setSkills(resume.content?.skills || []);
    setExperience(resume.content?.experience || []);
    setEducation(resume.content?.education || []);
  }

  // Generate resume content using AI
  async function generateResume() {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/resumes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate resume");

      // Set generated fields
      setSummary(data.resume.content?.summary || "");
      setSkills(data.resume.content?.skills || []);
      setExperience(data.resume.content?.experience || []);
      setEducation(data.resume.content?.education || []);
      toast.success("Resume generated! Feel free to edit the sections below.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  }

  // Save resume to MongoDB
  async function saveResume() {
    setSaving(true);
    const content = { summary, skills, experience, education };
    try {
      const token = localStorage.getItem("token");
      const url = activeResumeId ? `/api/resumes/${activeResumeId}` : "/api/resumes";
      const method = activeResumeId ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save resume");
      
      toast.success("Resume saved successfully!");
      if (!activeResumeId) {
        setActiveResumeId(data.resume._id);
      }
      loadResumes();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteResume(id, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/api/resumes/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete resume");
      toast.success("Resume deleted");
      if (activeResumeId === id) {
        selectResume(null);
      }
      loadResumes();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function addExperience() {
    setExperience([...experience, { company: "", role: "", duration: "", details: "" }]);
  }

  function removeExperience(idx) {
    setExperience(experience.filter((_, i) => i !== idx));
  }

  function addEducation() {
    setEducation([...education, { school: "", degree: "", year: "" }]);
  }

  function removeEducation(idx) {
    setEducation(education.filter((_, i) => i !== idx));
  }

  function handlePrint() {
    window.print();
  }

  return (
    <AppShell title="AI Resume Builder">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left control panel */}
        <div className="lg:col-span-2 space-y-6 print:hidden">
          {/* History / Select Resume */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold">Resumes</span>
              <button
                onClick={() => selectResume(null)}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Create New
              </button>
            </div>
            {resumes.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">No saved resumes.</div>
            ) : (
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                {resumes.map((r) => {
                  const active = r._id === activeResumeId;
                  return (
                    <div
                      key={r._id}
                      onClick={() => selectResume(r)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                        active ? "bg-primary/20 text-foreground border border-primary/30" : "bg-white/[0.02] hover:bg-white/[0.04] text-muted-foreground"
                      }`}
                    >
                      <span className="truncate pr-2">{r.title}</span>
                      <button
                        onClick={(e) => deleteResume(r._id, e)}
                        className="hover:text-destructive p-0.5 rounded transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Generator Box */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> AI Generation Wizard
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your target job & background, e.g. React Developer with 3 years of experience in state management..."
              rows={4}
              className="w-full rounded-xl bg-input border border-border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <button
              onClick={generateResume}
              disabled={generating || !prompt.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:scale-[1.01] transition"
            >
              {generating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {generating ? "Generating..." : "Generate Resume Data"}
            </button>
          </div>

          {/* Document Properties */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold">Document Title</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex gap-2">
              <button
                onClick={saveResume}
                disabled={saving}
                className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Resume
              </button>
              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl border border-border hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition"
                title="Print / Export as PDF"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Resume Editor & Live Document Preview */}
        <div className="lg:col-span-3 space-y-6 print:col-span-5">
          {/* Editable Live Preview */}
          <div className="glass rounded-2xl p-8 bg-card/85 text-foreground space-y-6 shadow-2xl relative border border-border/40">
            {/* Header section */}
            <div className="border-b border-border/50 pb-6 text-center space-y-2">
              <h2 className="text-2xl font-bold font-display tracking-wide uppercase text-foreground">{title}</h2>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Curriculum Vitae</span>
            </div>

            {/* Summary section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-border/30 pb-1">Professional Summary</h3>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief professional summary..."
                rows={3}
                className="w-full bg-transparent border-0 resize-none outline-none text-xs leading-relaxed text-muted-foreground p-0 focus:ring-1 focus:ring-accent/40 rounded"
              />
            </div>

            {/* Skills section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-border/30 pb-1">Core Competencies</h3>
              <input
                type="text"
                value={skills.join(", ")}
                onChange={(e) => setSkills(e.target.value.split(",").map(s => s.trim()))}
                placeholder="React, Node.js, JavaScript, Python..."
                className="w-full bg-transparent border-0 outline-none text-xs text-muted-foreground p-0 focus:ring-1 focus:ring-accent/40 rounded"
              />
              <span className="text-[10px] text-muted-foreground block print:hidden">Separate skills with commas</span>
            </div>

            {/* Experience Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-border/30 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Professional Experience</h3>
                <button
                  onClick={addExperience}
                  className="p-1 text-muted-foreground hover:text-foreground print:hidden"
                  title="Add Work Experience"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {experience.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">Add your professional experiences here.</div>
              ) : (
                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1 relative group">
                      <button
                        onClick={() => removeExperience(idx)}
                        className="absolute right-0 top-0 text-muted-foreground hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition print:hidden"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const copy = [...experience];
                            copy[idx].role = e.target.value;
                            setExperience(copy);
                          }}
                          placeholder="Role (e.g. Lead Developer)"
                          className="col-span-1 bg-transparent border-0 font-semibold outline-none text-xs text-foreground p-0"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const copy = [...experience];
                            copy[idx].company = e.target.value;
                            setExperience(copy);
                          }}
                          placeholder="Company (e.g. Acme Corp)"
                          className="col-span-1 bg-transparent border-0 outline-none text-xs text-muted-foreground p-0"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const copy = [...experience];
                            copy[idx].duration = e.target.value;
                            setExperience(copy);
                          }}
                          placeholder="Duration (e.g. 2022 - Present)"
                          className="col-span-1 bg-transparent border-0 outline-none text-xs text-right text-muted-foreground p-0"
                        />
                      </div>
                      <textarea
                        value={exp.details}
                        onChange={(e) => {
                          const copy = [...experience];
                          copy[idx].details = e.target.value;
                          setExperience(copy);
                        }}
                        placeholder="Detail bullet points about your work..."
                        rows={2}
                        className="w-full bg-transparent border-0 resize-none outline-none text-xs text-muted-foreground p-0 leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-border/30 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Education</h3>
                <button
                  onClick={addEducation}
                  className="p-1 text-muted-foreground hover:text-foreground print:hidden"
                  title="Add Education"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {education.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">Add your academic history here.</div>
              ) : (
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 relative group items-center">
                      <button
                        onClick={() => removeEducation(idx)}
                        className="absolute right-0 top-0 text-muted-foreground hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition print:hidden"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].school = e.target.value;
                          setEducation(copy);
                        }}
                        placeholder="School Name"
                        className="col-span-1 bg-transparent border-0 font-medium outline-none text-xs text-foreground p-0"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].degree = e.target.value;
                          setEducation(copy);
                        }}
                        placeholder="Degree / Major"
                        className="col-span-1 bg-transparent border-0 outline-none text-xs text-muted-foreground p-0"
                      />
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].year = e.target.value;
                          setEducation(copy);
                        }}
                        placeholder="Graduation Year"
                        className="col-span-1 bg-transparent border-0 outline-none text-xs text-right text-muted-foreground p-0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
