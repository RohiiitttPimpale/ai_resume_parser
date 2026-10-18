import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import type { ParsedResume } from "@/api/parseResume";
import { ProfileCard, SkillsCard, ExperienceTimeline, EducationCard, CategoryGauge, JsonPanel } from "./cards";

export function ResultsGrid({ data, onReset }: { data: ParsedResume; onReset: () => void }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name.replace(/\s+/g, "_").toLowerCase()}_resume.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCard data={data} delay={0} />
        <CategoryGauge category={data.jobCategory} confidence={data.confidence} delay={100} />
        <SkillsCard skills={data.skills} delay={200} />
        <EducationCard items={data.education} delay={300} />
        <div className="md:col-span-2"><ExperienceTimeline items={data.experience} delay={400} /></div>
        <JsonPanel data={data} delay={500} />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center rise" style={{ animationDelay: "600ms" }}>
        <Button variant="ghost" type="button" onClick={download}
          className="neon-btn flex items-center justify-center gap-2 h-12 bg-gradient-neon px-6 font-display font-bold text-primary-foreground">
          <Download className="size-4" aria-hidden /> DOWNLOAD JSON
        </Button>
        <Button variant="ghost" type="button" onClick={onReset}
          className="neon-btn glass flex items-center justify-center gap-2 h-12 px-6 font-display font-bold text-primary">
          <RotateCcw className="size-4" aria-hidden /> PARSE ANOTHER RESUME
        </Button>
      </div>
    </div>
  );
}
