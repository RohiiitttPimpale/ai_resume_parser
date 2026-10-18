import { Button } from "@/components/ui/button";
import { useEffect, useState, type ReactNode } from "react";
import { Mail, Phone, User, GraduationCap, Check, Copy, ChevronDown } from "lucide-react";
import type { ParsedResume } from "@/api/parseResume";

export function Card({ title, children, delay = 0, className = "" }: { title: string; children: ReactNode; delay?: number; className?: string }) {
  return (
    <section className={`glass p-6 rise ${className}`} style={{ animationDelay: `${delay}ms` }} aria-label={title}>
      <h2 className="card-heading font-display mb-4">{title}<span className="card-kanji">{({ PROFILE: "Identity", SKILLS: "Abilities", EXPERIENCE: "History", EDUCATION: "Academics", "JOB CATEGORY": "Classification" } as Record<string, string>)[title]}</span></h2>
      {children}
    </section>
  );
}

export function ProfileCard({ data, delay }: { data: ParsedResume; delay: number }) {
  const rows = [
    { icon: User, label: "Name", value: data.name },
    { icon: Mail, label: "Email", value: data.email },
    { icon: Phone, label: "Phone", value: data.phone },
  ];
  return (
    <Card title="PROFILE" delay={delay}>
      <ul className="space-y-3">
        {rows.map(({ icon: I, label, value }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="rounded-lg border p-2 text-primary"><I className="size-4" aria-label={label} /></span>
            <span className="break-all">{value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function SkillsCard({ skills, delay }: { skills: string[]; delay: number }) {
  return (
    <Card title="SKILLS" delay={delay}>
      <ul className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <li key={s} className="skill-chip hover-glow rounded-full border text-sm">{s}</li>
        ))}
      </ul>
    </Card>
  );
}

export function ExperienceTimeline({ items, delay }: { items: ParsedResume["experience"]; delay: number }) {
  return (
    <Card title="EXPERIENCE" delay={delay}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">No professional experience listed.</p>
      ) : (
        <ol className="experience-line relative ml-2 space-y-6">
          {items.map((e, idx) => (
            <li key={e.role + e.company + idx} className="pl-6 relative">
              <span className="timeline-node absolute -left-[7px] top-1.5" aria-hidden>✦</span>
              <p className="font-semibold">{e.role}</p>
              {e.company && <p className="text-sm text-muted-foreground">{e.company}</p>}
              {e.duration && <p className="text-xs font-display text-secondary mt-1">{e.duration}</p>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export function EducationCard({ items, delay }: { items: ParsedResume["education"]; delay: number }) {
  return (
    <Card title="EDUCATION" delay={delay}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">No education details listed.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((e, idx) => (
            <li key={e.degree + idx} className="flex gap-3">
              <GraduationCap className="size-6 text-primary shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">{e.degree}</p>
                {e.institute && <p className="text-sm text-muted-foreground">{e.institute}</p>}
                {e.year && (
                  <p className="text-xs font-display text-secondary mt-1">
                    {e.year.includes("–") || e.year.includes("-") || e.year.toLowerCase().includes("present")
                      ? e.year
                      : `Class of ${e.year}`}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function CategoryGauge({ category, confidence, delay }: { category: string; confidence: number; delay: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setV(confidence);
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / 1200));
      setV(Math.round(confidence * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [confidence, delay]);
  const r = 52, c = 2 * Math.PI * r;
  return (
    <Card title="JOB CATEGORY" delay={delay}>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 120 120" className="size-32 shrink-0 -rotate-90" role="img" aria-label={`Confidence ${confidence} percent`}>
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0" stopColor="var(--primary)" /><stop offset="1" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="url(#g)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}  />
          <text x="60" y="60" className="font-display" fill="var(--gold)" fontSize="22" fontWeight="700"
            textAnchor="middle" dominantBaseline="central" transform="rotate(90 60 60)">{v}%</text>
        </svg>
        <div>
          <p className="font-display text-2xl font-bold text-foreground">{category}</p>
          <p className="text-sm text-muted-foreground mt-1">Confidence score</p>
        </div>
      </div>
    </Card>
  );
}

function highlight(json: string) {
  const esc = json.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return esc.replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(\d+)\b/g, (m, s, colon, n) => {
    if (n) return `<span class="text-json-number">${n}</span>`;
    return colon ? `<span class="text-json-key">${s}</span>${colon}` : `<span class="text-json-string">${s}</span>`;
  });
}

export function JsonPanel({ data, delay }: { data: ParsedResume; delay: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);
  const copy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section className="glass p-6 rise md:col-span-2" style={{ animationDelay: `${delay}ms` }} aria-label="Raw JSON">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="raw-json"
          className="flex items-center gap-2 font-display text-sm font-bold text-foreground rounded">
          RAW JSON <ChevronDown className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden />
        </Button>
        <Button variant="ghost" type="button" onClick={copy} className="hover-glow flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {open && (
        <pre id="raw-json" className="mt-4 max-h-96 overflow-auto rounded-lg bg-background/70 p-4 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlight(json) }} />
      )}
    </section>
  );
}
