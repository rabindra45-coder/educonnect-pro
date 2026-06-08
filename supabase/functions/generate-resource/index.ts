// Generate text content or images for the Digital Resource Center via Lovable AI Gateway.
// Body: { kind: "text" | "image" | "cover", prompt: string, title?: string }
//   - text  -> { title, content }   (long, structured +2 level notes)
//   - image -> { dataUrl }          (freeform image)
//   - cover -> { dataUrl }          (study-notes cover page art)
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const { kind, prompt, title } = await req.json().catch(() => ({}));
    if (!prompt || typeof prompt !== "string") return json({ error: "prompt required" }, 400);

    if (kind === "image" || kind === "cover") {
      const imgPrompt = kind === "cover"
        ? `Design a premium, modern educational cover illustration for a Class 11/12 (+2 level) study notes booklet titled "${title || prompt}".
Style: clean editorial textbook cover, deep navy and gold palette with ivory accents, soft gradients, subtle geometric shapes, glassmorphism, abstract science/management/law motifs related to the topic, elegant serif title typography area at the top, plenty of negative space, no random gibberish text, premium university branding feel. 4:3 portrait-friendly composition.`
        : prompt;

      const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [{ role: "user", content: imgPrompt }],
          modalities: ["image", "text"],
        }),
      });
      if (!r.ok) return json({ error: await r.text() }, r.status);
      const data = await r.json();
      const b64 =
        data?.data?.[0]?.b64_json ??
        data?.choices?.[0]?.message?.images?.[0]?.image_url?.url?.split(",")?.[1];
      if (!b64) return json({ error: "No image returned" }, 502);
      return json({ dataUrl: `data:image/png;base64,${b64}` });
    }

    // default: long, structured +2 study notes
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
`You are a senior +2 (Class 11/12, NEB Nepal / CBSE compatible) subject expert writing PREMIUM, EXAM-READY study notes for a top college. Output must be LONG, DETAILED and well-structured — aim for 1800–3000 words.

Strict output rules:
- Plain text only. NO markdown symbols (#, *, **, _, backticks, tables with |).
- First line MUST be exactly: TITLE: <a clean exam-style chapter title>
- Then a one-paragraph "Introduction" section.
- Then numbered sections using this exact heading style on their own line, in ALL CAPS followed by a newline:
    1. INTRODUCTION
    2. KEY CONCEPTS AND DEFINITIONS
    3. DETAILED EXPLANATION
    4. IMPORTANT FORMULAS / PRINCIPLES / CASE LAWS (as relevant to subject)
    5. WORKED EXAMPLES (at least 3, with step-by-step solutions)
    6. DIAGRAM DESCRIPTIONS (describe diagrams in words students can sketch)
    7. COMMON MISCONCEPTIONS
    8. EXAM TIPS AND HIGH-WEIGHTAGE AREAS
    9. PRACTICE QUESTIONS (10 short + 5 long, with brief answer hints)
   10. QUICK REVISION SUMMARY (bullet-like lines starting with "• ")
- Use clear paragraphs, indented sub-points with "  - ", and blank lines between sections.
- Be rigorous, accurate, and pitched at Grade 11/12 difficulty. Include numerical values, units, derivations, real-world Nepal/South-Asia context where natural.
- Do NOT add disclaimers or meta commentary. Do NOT say "as an AI".`,
          },
          { role: "user", content: `Generate complete +2 level study notes on: ${prompt}` },
        ],
      }),
    });
    if (r.status === 429) return json({ error: "Rate limit exceeded. Try again shortly." }, 429);
    if (r.status === 402) return json({ error: "AI credits exhausted. Please top up." }, 402);
    if (!r.ok) return json({ error: await r.text() }, r.status);
    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    let outTitle = "";
    let content = raw;
    const m = raw.match(/^\s*TITLE:\s*(.+)$/im);
    if (m) {
      outTitle = m[1].trim();
      content = raw.replace(m[0], "").trim();
    }
    return json({ title: outTitle, content });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
