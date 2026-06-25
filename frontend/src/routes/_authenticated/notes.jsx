import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/_authenticated/notes")({ component: NotesPage });

function NotesPage() {
  return (
    <ToolPage
      title="Notes Summarizer"
      tool="notes"
      system="You are a premium AI notes assistant. Analyze the user's notes and generate a highly organized, professional summary containing a summary, bulleted key takeaways, and action items."
      placeholder="Paste your meeting notes, lecture notes, or general thoughts here..."
      inputLabel="Notes / Text Content"
    />
  );
}
