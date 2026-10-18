# AI Resume Parser — Frontend

A futuristic, sci-fi styled web app that uploads a PDF or DOCX resume and extracts structured data (profile, skills, experience, education, job category) in seconds.

## Tech Stack

React + TypeScript + TailwindCSS v4 · TanStack Start (SSR) · TanStack Router · TanStack Query · Vite · shadcn/ui

## Data Shape

```ts
type ParsedResume = {
  name: string; email: string; phone: string;
  skills: string[];
  experience: { role: string; company: string; duration: string }[];
  education: { degree: string; institute: string; year: string }[];
  jobCategory: string;
  confidence: number; // 0 to 100
}
```

The API layer lives entirely in `src/api/parseResume.ts`. Swapping the mock for a real backend only requires updating that file.

## Visual Design (Futuristic / Sci-Fi)

- **Background:** deep navy-black (`#0a0e1a`) with animated grid + floating glow orbs
- **Accents:** neon cyan (`#00f5ff`) and violet (`#8a2be2`) gradient on key elements
- **Cards:** glassmorphism (translucent bg, backdrop blur, 1px glowing border)
- **Fonts:** Orbitron for headings/numbers · Inter for body
- **Animations:** smooth 200–400 ms transitions, respects `prefers-reduced-motion`

## Development

Requires **Node.js ≥ 18** and **npm**.

```sh
git clone <this-repository-url>
cd resume-frontend
npm install
npm run dev
```

## API Backend

The frontend calls `VITE_API_URL/parse` (defaults to `http://localhost:8000`).  
Set `VITE_API_URL` in a `.env.local` file to point at your deployed backend.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with ESLint |
| `npm run test` | Run tests |
