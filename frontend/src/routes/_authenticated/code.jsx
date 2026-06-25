import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/_authenticated/code")({ component: CodePage });

function CodePage() {
  const [action, setAction] = useState("Generate");
  const [lang, setLang] = useState("JavaScript");

  const extraFields = (
    <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Action</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        >
          <option value="Generate">Generate Code</option>
          <option value="Explain">Explain Code</option>
          <option value="Fix">Fix Bugs</option>
          <option value="Convert">Convert Language</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Programming Language</label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        >
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
          <option value="C++">C++</option>
          <option value="React">React</option>
          <option value="Node.js">Node.js</option>
        </select>
      </div>
    </div>
  );

  return (
    <ToolPage
      title="AI Code Assistant"
      tool="code"
      system="You are an elite coding assistant. Perform the requested action on the code or prompt in the specified language, using markdown and code blocks in your response."
      placeholder={action === "Generate" ? "Describe the function or component you want to generate..." : "Paste your code here..."}
      inputLabel="Description or Code"
      extraFields={extraFields}
      buildPrompt={(input) => `Action: ${action}\nLanguage: ${lang}\n\nCode or prompt:\n${input}`}
    />
  );
}
