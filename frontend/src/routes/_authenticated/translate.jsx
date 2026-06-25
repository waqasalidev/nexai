import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/_authenticated/translate")({ component: TranslatePage });

function TranslatePage() {
  const [lang, setLang] = useState("Spanish");
  const [tone, setTone] = useState("Professional");

  const extraFields = (
    <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Target Language</label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        >
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Italian">Italian</option>
          <option value="Arabic">Arabic</option>
          <option value="Portuguese">Portuguese</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        >
          <option value="Professional">Professional</option>
          <option value="Casual">Casual</option>
          <option value="Formal">Formal</option>
          <option value="Friendly">Friendly</option>
          <option value="Diplomatic">Diplomatic</option>
        </select>
      </div>
    </div>
  );

  return (
    <ToolPage
      title="AI Translator"
      tool="translate"
      system="You are an expert translator. Translate the text into the requested target language maintaining the exact tone requested, making sure it sounds natural and contextually appropriate."
      placeholder="Type or paste the text to translate..."
      inputLabel="Source Text"
      extraFields={extraFields}
      buildPrompt={(input) => `Target Language: ${lang}\nTone: ${tone}\n\nTranslate the following text:\n${input}`}
    />
  );
}
