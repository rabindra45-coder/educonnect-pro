// Generate text content or images for the Digital Resource Center via Lovable AI Gateway.
// Body: { kind: "text" | "image", prompt: string }
// Returns: text -> { title, content }; image -> { dataUrl }
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const { kind, prompt } = await req.json().catch(() => ({}));
    if (!prompt || typeof prompt !== "string") return json({ error: "prompt required" }, 400);

    if (kind === "image") {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });
      if (!r.ok) return json({ error: await r.text() }, r.status);
      const data = await r.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) return json({ error: "No image returned" }, 502);
      return json({ dataUrl: `data:image/png;base64,${b64}` });
    }

    // default: text content
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You write polished educational study material for a college (Class 11/12) in Nepal. Produce a clear, structured document with sections, bullet points, and worked examples where useful. Plain text only — no markdown symbols (#, *, **). Start with a clear TITLE: line on its own.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (r.status === 429) return json({ error: "Rate limit exceeded. Try again shortly." }, 429);
    if (r.status === 402) return json({ error: "AI credits exhausted. Please top up." }, 402);
    if (!r.ok) return json({ error: await r.text() }, r.status);
    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    let title = "";
    let content = raw;
    const m = raw.match(/^\s*TITLE:\s*(.+)$/im);
    if (m) {
      title = m[1].trim();
      content = raw.replace(m[0], "").trim();
    }
    return json({ title, content });
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
