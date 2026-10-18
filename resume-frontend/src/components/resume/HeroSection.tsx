const pills = ["NLP Powered", "PDF + DOCX", "Instant JSON"];

export function HeroSection() {
  return (
    <header className="hero">
      <div className="hero-copy">
        <h1 className="font-display font-black text-gradient glow-text">AI RESUME PARSER</h1>
        <p className="jp-subtitle">Resume Analysis</p>
        <p className="hero-tagline mt-4 text-muted-foreground">Upload a resume. Extract structured data in seconds.</p>
        <ul className="hero-pills mt-6 flex flex-wrap gap-3" aria-label="Features">
          {pills.map((p) => <li key={p} className="rounded-full px-4 py-2 text-xs">{p}</li>)}
        </ul>
      </div>
      <svg className="hero-art" viewBox="0 0 300 260" aria-hidden="true">
        <defs>
          <linearGradient id="moon" x2="1" y2="1"><stop stopColor="var(--warm-white)" /><stop offset="1" stopColor="var(--sky-light)" /></linearGradient>
          <linearGradient id="paper" x2="1" y2="1"><stop stopColor="var(--warm-white)" /><stop offset="1" stopColor="var(--background)" /></linearGradient>
        </defs>
        <circle cx="166" cy="99" r="68" fill="none" stroke="var(--primary)" strokeOpacity=".12" />
        <circle cx="166" cy="99" r="55" fill="none" stroke="var(--secondary)" strokeOpacity=".2" />
        <circle cx="166" cy="99" r="42" fill="url(#moon)" />
        <path d="M90 111q5-23 27-17 15-28 39-9 25-5 32 18h35q14 0 14 10H90" fill="var(--scene-cloud)" opacity=".9" />
        <path d="M170 141q6-18 24-13 17-24 39-5 16-4 24 10h20q15 0 15 11H170" fill="var(--warm-white)" opacity=".7" />
        <g className="floating-document">
          <g transform="translate(80 115) rotate(-10)">
            <rect x="14" y="-8" width="86" height="112" rx="8" fill="var(--sky-light)" stroke="var(--primary)" strokeOpacity=".3" />
            <rect x="7" y="-4" width="86" height="112" rx="8" fill="var(--accent)" stroke="var(--secondary)" strokeOpacity=".4" />
            <rect width="86" height="112" rx="8" fill="url(#paper)" stroke="var(--primary)" strokeOpacity=".55" />
            <rect x="15" y="12" width="56" height="5" rx="2" fill="var(--sky-light)" />
            <rect x="15" y="25" width="19" height="19" rx="4" fill="var(--secondary)" opacity=".45" />
            <path d="M44 29h24M44 38h17M17 57h52M17 69h43M17 81h52M17 93h31" stroke="var(--muted-foreground)" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g transform="translate(227 59) rotate(15)"><rect width="39" height="49" rx="5" fill="url(#paper)" stroke="var(--secondary)" strokeOpacity=".6" /><path d="M10 15h19M10 24h19M10 33h12" stroke="var(--primary)" strokeOpacity=".6" strokeWidth="2" /></g>
          <circle cx="192" cy="171" r="26" fill="var(--warm-white)" fillOpacity=".7" stroke="var(--primary)" strokeWidth="5" />
          <path d="m212 191 25 26" stroke="var(--secondary)" strokeWidth="9" strokeLinecap="round" />
          <path d="m181 172 7 7 15-17" fill="none" stroke="var(--secondary-ink)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <path d="m66 65 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--gold)" />
        <path d="m243 188 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--secondary)" opacity=".8" />
        <circle cx="105" cy="41" r="2" fill="var(--primary)" /><circle cx="265" cy="135" r="2" fill="var(--peach)" />
      </svg>
    </header>
  );
}
