import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { parseResume, type ParsedResume } from "@/api/parseResume";
import { HeroSection } from "@/components/resume/HeroSection";
import { UploadCard } from "@/components/resume/UploadCard";
import { ResultsGrid } from "@/components/resume/ResultsGrid";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Resume Parser — Structured data in seconds" },
      { name: "description", content: "Upload a PDF or DOCX resume and extract profile, skills, experience and job category as JSON." },
      { property: "og:title", content: "AI Resume Parser" },
      { property: "og:description", content: "Upload a resume. Extract structured data in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ParsedResume | null>(null);

  const parse = async () => {
    if (!file) return;
    setScanning(true);
    try {
      setResult(await parseResume(file));
      toast.success("Resume parsed successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to parse resume";
      toast.error(message);
    } finally {
      setScanning(false);
    }
  };
  const reset = () => { setResult(null); setFile(null); };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="anime-background pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <svg className="absolute size-0" focusable="false">
          <defs>
            <symbol id="float-doc" viewBox="0 0 64 84">
              <rect x="8" y="4" width="48" height="72" rx="4" fill="var(--warm-white)" stroke="var(--scene-mountain)" />
              <rect x="15" y="12" width="34" height="5" rx="2" fill="var(--sky-light)" />
              <rect x="15" y="24" width="12" height="13" rx="2" fill="var(--scene-mountain)" />
              <path d="M33 26h15M33 32h12M15 45h34M15 52h34M15 59h24M15 66h30" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" />
              <rect className="document-light" x="10" y="20" width="44" height="5" rx="2" />
            </symbol>
            <symbol id="float-plane" viewBox="0 0 64 84"><path d="m4 45 55-30-16 50-13-15-14 7 3-18Z" fill="var(--warm-white)" stroke="var(--primary)" strokeWidth="2" /><path d="m19 39 40-24-29 35" fill="none" stroke="var(--sky-light)" strokeWidth="2" /></symbol>
            <symbol id="float-clip" viewBox="0 0 64 84"><path d="M22 55V25a12 12 0 0 1 24 0v32a8 8 0 0 1-16 0V28a4 4 0 0 1 8 0v24" fill="none" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" /></symbol>
            <symbol id="float-sticky" viewBox="0 0 64 84"><path d="M9 15h46v43L40 73H9Z" fill="var(--gold)" stroke="var(--peach)" /><path d="M40 73V58h15" fill="var(--warm-white)" /><path d="M18 30h27M18 39h22M18 48h25" stroke="var(--muted-foreground)" strokeWidth="2" /></symbol>
            <symbol id="float-check" viewBox="0 0 64 84"><circle cx="32" cy="42" r="20" fill="var(--warm-white)" stroke="var(--secondary)" strokeWidth="2" /><path d="m21 42 8 8 15-17" fill="none" stroke="var(--secondary-ink)" strokeWidth="3" strokeLinecap="round" /></symbol>
            <symbol id="float-search" viewBox="0 0 64 84"><circle cx="27" cy="33" r="16" fill="var(--warm-white)" stroke="var(--primary)" strokeWidth="3" /><path d="m39 46 15 17" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" /></symbol>
          </defs>
        </svg>
        {["doc", "plane", "clip", "doc", "sticky", "check", "doc", "search", "plane", "sticky", "clip", "doc"].map((kind, i) => (
          <svg key={i} className="paperwork-item" data-kind={kind} style={{ "--item": i } as React.CSSProperties} viewBox="0 0 64 84"><use href={`#float-${kind}`} /></svg>
        ))}
        <svg className="horizon" viewBox="0 0 1440 220" preserveAspectRatio="none">
          <path opacity=".45" d="M0 180 160 90 270 130 440 30 620 140 800 70 990 130 1200 40 1440 150V220H0Z" />
          <path d="M0 180H70V150H100V130H125V180H200V160H250V190H360V150H390V100H410V150H440V190H590V160H650V190H760V140H790V120H810V140H840V190H970V165H1020V180H1120V135H1150V165H1190V190H1320V150H1360V180H1440V220H0Z" />
        </svg>
      </div>
      <main className="mx-auto max-w-5xl px-4 pb-20">
        <HeroSection />
        {result ? <ResultsGrid data={result} onReset={reset} /> : <UploadCard file={file} onFile={setFile} scanning={scanning} onParse={parse} />}
      </main>
    </div>
  );
}
