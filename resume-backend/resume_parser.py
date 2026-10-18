import io
import re

import docx
import pdfplumber
import spacy
from spacy.matcher import PhraseMatcher

nlp = spacy.load("en_core_web_sm")


# ---------- Text cleaning (used for training AND prediction; keep identical) ----------
def clean(text: str) -> str:
    text = re.sub(r"http\S+|\S+@\S+", " ", text)
    text = re.sub(r"[^a-zA-Z ]", " ", text).lower()
    return re.sub(r"\s+", " ", text).strip()


# ---------- Text extraction ----------
def extract_text(data: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    document = docx.Document(io.BytesIO(data))
    return "\n".join(p.text for p in document.paragraphs)


# ---------- Patterns & Regular Expressions ----------
EMAIL = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE = re.compile(
    r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}\b"
)
MONTH = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*"
DATES = re.compile(
    rf"({MONTH}\d{{4}}|\d{{4}})\s*(?:-|–|—|to)\s*(Present|Current|Ongoing|{MONTH}\d{{4}}|\d{{4}})",
    re.I,
)
YEAR = re.compile(r"(?:19|20)\d{2}")

DEGREE_PATTERN = (
    r"\b("
    r"b\.?tech(?:nology)?|"
    r"b\.?e\.?|"
    r"m\.?tech(?:nology)?|"
    r"m\.?e\.?|"
    r"b\.?sc(?:ience)?|"
    r"m\.?sc(?:ience)?|"
    r"bca|mca|mba|bba|"
    r"bachelor(?:'s)?(?:\s+of\s+[a-zA-Z\s]+)?|"
    r"master(?:'s)?(?:\s+of\s+[a-zA-Z\s]+)?|"
    r"diploma|ph\.?d|doctorate|"
    r"higher\s+secondary|senior\s+secondary|hsc|ssc|"
    r"10th|12th|cbse|icse"
    r")\b"
)
DEGREE = re.compile(DEGREE_PATTERN, re.I)

INSTITUTE = re.compile(
    r"\b(college|university|institute|school|academy|polytechnic|vidyalaya|campus|iit|nit|iiit|bits)\b",
    re.I,
)

SECTION_HEADERS = {
    "education": re.compile(
        r"^(?:education|academic(?:s| background| qualifications| details)?|qualifications)\b",
        re.I,
    ),
    "experience": re.compile(
        r"^(?:experience|work experience|employment(?: history)?|professional experience|internships?|work history)\b",
        re.I,
    ),
    "projects": re.compile(
        r"^(?:projects|academic projects|personal projects|technical projects)\b",
        re.I,
    ),
    "skills": re.compile(
        r"^(?:technical skills|skills|skills & abilities|core competencies|technologies)\b",
        re.I,
    ),
}

# Standardized Skills List
SKILLS = [
    # Programming Languages
    "python", "java", "c++", "c", "c#", "javascript", "typescript", "go", "rust",
    "r", "php", "ruby", "swift", "kotlin", "dart", "sql", "html", "css", "bash", "shell",
    # Frameworks & Libraries
    "react", "next.js", "angular", "vue", "node.js", "express", "fastapi", "flask",
    "django", "spring", "spring boot", "tailwind", "tailwind css", "bootstrap",
    # AI / ML / Data Science
    "machine learning", "deep learning", "nlp", "pandas", "numpy", "scikit-learn",
    "tensorflow", "pytorch", "keras", "opencv", "computer vision", "llm", "generative ai",
    "data analysis", "tableau", "power bi", "excel",
    # Databases & Cloud / DevOps
    "mongodb", "postgresql", "mysql", "redis", "sqlite", "firebase",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "linux", "ci/cd",
    # CS Fundamentals & Concepts
    "data structures", "algorithms", "dbms", "oop", "rest api", "graphql",
    # General / Soft Skills
    "communication", "leadership", "teamwork", "project management", "customer service",
    "teaching", "accounting", "budgeting", "financial analysis", "sales", "marketing",
    "recruitment", "payroll", "negotiation", "time management", "problem solving",
    "microsoft office", "photoshop", "illustrator", "autocad", "public speaking",
    "agile", "scrum", "jira",
]

# Canonical casing for well-known acronyms & technologies
DISPLAY_SKILL_MAP = {
    "c++": "C++",
    "c#": "C#",
    "sql": "SQL",
    "html": "HTML",
    "css": "CSS",
    "aws": "AWS",
    "gcp": "GCP",
    "nlp": "NLP",
    "llm": "LLM",
    "oop": "OOP",
    "dbms": "DBMS",
    "rest api": "REST API",
    "ci/cd": "CI/CD",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "next.js": "Next.js",
    "node.js": "Node.js",
    "fastapi": "FastAPI",
    "scikit-learn": "Scikit-Learn",
    "power bi": "Power BI",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "opencv": "OpenCV",
}

matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
matcher.add("SKILL", [nlp.make_doc(s) for s in SKILLS])


def format_skill(skill_str: str) -> str:
    lower = skill_str.lower()
    if lower in DISPLAY_SKILL_MAP:
        return DISPLAY_SKILL_MAP[lower]
    return skill_str.title()


def extract_candidate_name(text: str, doc) -> str:
    """Extract candidate name cleanly from top of resume, ignoring boilerplate headers."""
    skip_keywords = {
        "resume", "curriculum vitae", "cv", "biodata", "profile", "portfolio",
        "contact", "email", "phone", "page", "developer", "engineer"
    }

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # 1. Look for a clean line near the top (first 5 lines)
    for line in lines[:5]:
        if EMAIL.search(line) or PHONE.search(line):
            continue
        cleaned = re.sub(r"[^a-zA-Z\s]", "", line).strip()
        words = cleaned.split()
        if 2 <= len(words) <= 4:
            if not any(w.lower() in skip_keywords for w in words):
                return line.title()

    # 2. Check spaCy PERSON entities in top 300 characters
    for ent in doc.ents:
        if ent.label_ == "PERSON" and ent.start_char < 300:
            cleaned = re.sub(r"[^a-zA-Z\s]", "", ent.text).strip()
            words = cleaned.split()
            if 1 <= len(words) <= 4 and not any(w.lower() in skip_keywords for w in words):
                return ent.text.strip().title()

    # 3. Fallback
    return lines[0].title() if lines else ""


def extract_info(text: str) -> dict:
    doc = nlp(text)

    # 1. Candidate Name
    name = extract_candidate_name(text, doc)

    # 2. Contact details
    m_email = EMAIL.search(text)
    email = m_email.group(0) if m_email else ""

    m_phone = PHONE.search(text)
    phone = m_phone.group(0) if m_phone else ""

    # 3. Skills
    matched_skills = {doc[s:e].text.lower() for _, s, e in matcher(doc)}
    skills = sorted([format_skill(s) for s in matched_skills])

    # 4. Section & Entry Parsing for Education and Experience
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    education = []
    experience = []

    current_section = None
    i = 0
    while i < len(lines):
        line = lines[i]

        # Check for section header
        matched_header = None
        for sec, pattern in SECTION_HEADERS.items():
            if pattern.search(line) and len(line) < 40:
                matched_header = sec
                break

        if matched_header:
            current_section = matched_header
            i += 1
            continue

        # Check if line matches a Degree (PRIORITIZE EDUCATION OVER EXPERIENCE)
        if DEGREE.search(line):
            d_match = DATES.search(line)
            duration = (
                d_match.group(0)
                if d_match
                else (YEAR.findall(line)[-1] if YEAR.findall(line) else "")
            )

            deg_text = line
            if d_match:
                deg_text = line.replace(d_match.group(0), "").strip(" ,|-–()")

            institute = ""
            # Check if next line contains institute name
            if (
                i + 1 < len(lines)
                and (INSTITUTE.search(lines[i + 1]) or "college" in lines[i + 1].lower())
                and not DEGREE.search(lines[i + 1])
                and not any(p.search(lines[i + 1]) for p in SECTION_HEADERS.values())
            ):
                institute = lines[i + 1]
                i += 1
            elif INSTITUTE.search(deg_text):
                # Split degree and institute if on the same line
                parts = re.split(r"\s+(?:at|from|–|-|\|)\s+", deg_text, flags=re.I)
                if len(parts) > 1:
                    deg_text, institute = parts[0].strip(), parts[1].strip()

            if len(education) < 4:
                education.append(
                    {"degree": deg_text.strip(" ,|-–"), "institute": institute, "year": duration}
                )

        # Work Experience matching (must NOT be a degree line)
        elif current_section == "experience" or DATES.search(line):
            d_match = DATES.search(line)
            if d_match and len(experience) < 5:
                duration = d_match.group(0)
                head = line.replace(duration, "").strip(" ,|-–()[]")

                role, company = head, ""
                if " at " in head.lower():
                    parts = re.split(r"\s+at\s+", head, flags=re.I)
                    role, company = parts[0].strip(), parts[1].strip()
                elif any(sep in head for sep in [" - ", " – ", " — "]):
                    parts = re.split(r"\s+[-–—]\s+", head)
                    role, company = parts[0].strip(), parts[1].strip()
                elif " | " in head:
                    parts = head.split(" | ")
                    role, company = parts[0].strip(), parts[1].strip()
                elif "," in head:
                    parts = head.split(",", 1)
                    role, company = parts[0].strip(), parts[1].strip()
                elif i + 1 < len(lines) and not DATES.search(lines[i + 1]) and not DEGREE.search(lines[i + 1]):
                    # Maybe company is on the next line
                    if not any(p.search(lines[i + 1]) for p in SECTION_HEADERS.values()):
                        company = lines[i + 1]
                        i += 1

                # Avoid adding project headers or empty roles
                if role and not any(kw in role.lower() for kw in ["project", "skills", "summary"]):
                    experience.append(
                        {"role": role, "company": company, "duration": duration}
                    )

        i += 1

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "experience": experience,
        "education": education,
    }
