import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/_authenticated/cover-letter")({ component: CoverLetterPage });

function CoverLetterPage() {
  return (
    <ToolPage
      title="Cover Letter Generator"
      tool="cover-letter"
      system="You are a professional resume writer and career coach. Generate a compelling, ATS-friendly cover letter tailored to the job description and candidate background provided by the user."
      placeholder="Paste the job description, company name, and briefly describe your relevant background..."
      inputLabel="Job Details & Background"
    />
  );
}
