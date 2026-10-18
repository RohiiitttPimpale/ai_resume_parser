import { Sparkles, FileText } from "lucide-react";
import { useEffect, useState } from "react";

const steps = ["Reading document...", "Extracting entities...", "Classifying profile..."];

export function ScanningOverlay() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % steps.length), 830);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl" role="status" aria-live="polite">
      <div className="absolute inset-0 bg-background/60" />
      <div className="scan-line absolute left-0 right-0 h-16" />
      <p className="scan-chip font-display">
        <span className="paper-sparkles"><FileText className="size-4" aria-hidden /><Sparkles aria-hidden /></span> {steps[i]}
      </p>
    </div>
  );
}
