export type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: { role: string; company: string; duration: string }[];
  education: { degree: string; institute: string; year: string }[];
  jobCategory: string;
  confidence: number; // 0 to 100
};

const rawBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const API_URL = rawBaseUrl.replace(/\/+$/, "");

export async function parseResume(file: File): Promise<ParsedResume> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/parse`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Cannot reach the server. It may be waking up, please try again in a minute."
    );
  }

  if (!response.ok) {
    let detail = "Failed to parse resume";
    try {
      const errorData = await response.json();
      detail = errorData.detail ?? detail;
    } catch {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  return response.json();
}
