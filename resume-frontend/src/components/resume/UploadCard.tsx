import { Button } from "@/components/ui/button";
import { useRef, useState, type DragEvent } from "react";
import { FileText, X, Sparkles } from "lucide-react";
import { ScanningOverlay } from "./ScanningOverlay";

const MAX = 5 * 1024 * 1024;
const EXT = [".pdf", ".docx"];

function formatSize(b: number) {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;
}

type Props = { file: File | null; onFile: (f: File | null) => void; scanning: boolean; onParse: () => void };

export function UploadCard({ file, onFile, scanning, onParse }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  const accept = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (files.length > 1) return setError("Please upload a single file.");
    const f = files[0];
    if (!f) return;
    if (!EXT.some((e) => f.name.toLowerCase().endsWith(e))) return setError("Invalid file type. Only PDF and DOCX are accepted.");
    if (f.size > MAX) return setError("File too large. Maximum size is 5 MB.");
    setError("");
    onFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    accept(e.dataTransfer.files);
  };

  return (
    <section className="glass p-6 sm:p-8 max-w-2xl mx-auto" aria-label="Upload resume">
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload resume file, PDF or DOCX up to 5 MB"
          data-drag={drag}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
          onDragOver={(e) => (e.preventDefault(), setDrag(true))}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className="dropzone rounded-xl py-12 px-6 flex flex-col items-center text-center cursor-pointer"
        >
          <div className="upload-icon"><FileText className="size-9 text-primary" aria-hidden /><Sparkles className="upload-sparkle size-5" aria-hidden /></div>
          <p className="mt-4 font-medium">Drag & drop your resume here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse · PDF, DOCX · max 5 MB</p>
          <input
            ref={input}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => (accept(e.target.files), (e.target.value = ""))}
          />
        </div>
      ) : (
        <div className="relative rounded-xl border bg-muted p-4 flex items-center gap-4">
          <FileText className="size-10 text-primary shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>
          <Button variant="ghost"
            type="button"
            onClick={() => onFile(null)}
            disabled={scanning}
            aria-label="Remove file"
            className="rounded-full p-2 hover-glow border border-transparent disabled:opacity-40"
          >
            <X className="size-5" />
          </Button>
          {scanning && <ScanningOverlay />}
        </div>
      )}
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <Button variant="ghost"
        type="button"
        onClick={onParse}
        disabled={!file || scanning}
        className="neon-btn mt-6 h-12 w-full bg-gradient-neon font-display font-bold text-primary-foreground"
      >
        {scanning ? "PARSING..." : "PARSE RESUME"}
      </Button>
    </section>
  );
}
