import type { ResumeProfile } from "@/lib/types";

function tokens(value: string) {
  return value.toLowerCase().split(/[^a-z0-9+#]+/).filter((token) => token.length > 2);
}

/** Select the CV whose target role overlaps the opening title most. */
export function chooseResume<T extends Pick<ResumeProfile, "target_roles" | "resume_text">>(resumes: T[], openingTitle: string, fallback: string) {
  const titleTokens = tokens(openingTitle);
  let best: T | null = null;
  let bestScore = 0;
  for (const resume of resumes) {
    const score = resume.target_roles.reduce((total, role) => total + tokens(role).filter((token) => titleTokens.includes(token)).length, 0);
    if (score > bestScore || (score === bestScore && resume.target_roles.length > 0 && !best)) {
      best = resume;
      bestScore = score;
    }
  }
  return { text: best?.resume_text?.trim() || fallback, name: best && "name" in best ? String(best.name) : "Primary résumé" };
}
