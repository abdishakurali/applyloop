import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

// Constructed lazily: the SDK throws at instantiation if the key is
// missing, and actions.ts imports this module for every page (not just
// the AI ones) — a module-scope client would crash pages that don't
// touch AI at all whenever the key isn't configured yet.
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  return JSON.parse(raw.trim());
}

export type FitScore = { score: number; rationale: string };

export async function scoreFit(
  resumeText: string,
  opening: { title: string; company: string; description: string },
): Promise<FitScore> {
  const message = await getClient().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system:
      "You score how well a candidate's résumé fits a job posting. " +
      'Reply with ONLY a JSON object: {"score": <integer 0-100>, "rationale": "<one short sentence, plain language, no fluff>"}. No markdown, no other text.',
    messages: [
      {
        role: "user",
        content: `RÉSUMÉ:\n${resumeText}\n\nJOB: ${opening.title} at ${opening.company}\n\nDESCRIPTION:\n${opening.description}`,
      },
    ],
  });

  const block = message.content[0];
  const text = block?.type === "text" ? block.text : "{}";
  const parsed = extractJson(text) as Partial<FitScore>;
  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))),
    rationale: parsed.rationale ?? "",
  };
}

export type DraftResult = {
  letter: string;
  signoff: string;
  highlight: string;
  missing: string;
};

const DRAFT_SYSTEM_PROMPT = `You write cover letters in a specific candidate's own voice — never in generic corporate voice. Hard rules:
- Never use: "I am excited to apply", "passionate", "leverage", "thrilled", "dynamic", or any similar stock phrase.
- Vary sentence length the way real writing does — mix short and long sentences (roughly 7 to 31 words each).
- Every claim must trace back to something actually in the résumé provided. Never invent facts, numbers, employers, or credentials not present in the résumé.
- Include exactly one specific, slightly unflattering or unglamorous detail (e.g. a real friction, a slow part of the work, an argument, a mistake) — the kind of honest detail a template would never include.
- 3-4 short paragraphs. No greeting line, no "Dear Hiring Manager", no subject line, no signoff name — just the letter body.

Reply with ONLY a JSON object, no markdown fences, no other text:
{
  "letter": "paragraph one\\n\\nparagraph two\\n\\nparagraph three",
  "highlight": "the exact short phrase from the letter that is the one unflattering/honest detail",
  "missing": "a short phrase naming one relevant fact that was NOT invented because it isn't in the résumé (e.g. 'team size, and why you're leaving')"
}`;

const TONE_HINTS: Record<string, string> = {
  Plainer: "Rewrite it plainer — shorter words, less polish, more matter-of-fact.",
  Shorter: "Cut it down — same claims, noticeably fewer words overall.",
  Warmer: "Make the tone warmer and more personable without adding any flattery clichés.",
  "More technical": "Lean more technical — foreground the specific tools, systems, and mechanics involved.",
};

export async function generateDraft(
  resumeText: string,
  fullName: string,
  opening: { title: string; company: string; description: string },
  tone?: string,
): Promise<DraftResult> {
  const toneHint = tone && TONE_HINTS[tone] ? `\n\nNUDGE: ${TONE_HINTS[tone]}` : "";
  const message = await getClient().messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1000,
    system: DRAFT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `RÉSUMÉ:\n${resumeText}\n\nAPPLYING FOR: ${opening.title} at ${opening.company}\n\nJOB DESCRIPTION:\n${opening.description}${toneHint}`,
      },
    ],
  });

  const block = message.content[0];
  const text = block?.type === "text" ? block.text : "{}";
  const parsed = extractJson(text) as Partial<DraftResult>;
  return {
    letter: parsed.letter ?? "",
    signoff: fullName.split(" ")[0] || fullName,
    highlight: parsed.highlight ?? "",
    missing: parsed.missing ?? "",
  };
}
