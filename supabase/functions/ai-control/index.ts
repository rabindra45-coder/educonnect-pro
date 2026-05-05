// AI Control Center - sequential 6-agent pipeline + apply/rollback/image
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// Tables the AI is allowed to read/modify (whitelist)
const ALLOWED_TABLES = [
  "notices",
  "hero_slides",
  "facilities",
  "leadership",
  "testimonials",
  "stats",
  "about_content",
  "academic_calendar",
  "school_settings",
];

async function ai(messages: any[], model = "google/gemini-2.5-flash", tools?: any[], tool_choice?: any) {
  const body: any = { model, messages };
  if (tools) { body.tools = tools; body.tool_choice = tool_choice; }
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI ${r.status}: ${t}`);
  }
  return await r.json();
}

function sanitize(s: string) {
  return (s || "").slice(0, 4000).replace(/[\u0000-\u001F\u007F]/g, " ");
}

async function runAgent(name: string, system: string, user: string) {
  const out = await ai([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
  return { agent: name, content: out.choices?.[0]?.message?.content ?? "" };
}

async function planChange(prompt: string) {
  // Multi-agent sequential analysis
  const hr = await runAgent(
    "HR Development Agent",
    "You audit role/permission implications. Reply <=2 sentences.",
    prompt
  );
  const sw = await runAgent(
    "Software Management Agent",
    "You list which UI components/sections are affected. Reply <=3 bullets.",
    prompt
  );
  const db = await runAgent(
    "Database Management Agent",
    `You decide which whitelisted table is affected. Allowed tables: ${ALLOWED_TABLES.join(", ")}. Reply <=2 sentences.`,
    prompt
  );
  const ui = await runAgent(
    "UI/UX Design Agent",
    "You ensure brand consistency (Navy/Gold/Ivory, DM Serif/DM Sans). Reply <=2 sentences.",
    prompt
  );
  const sec = await runAgent(
    "Security & DevOps Agent",
    "You flag any security concerns. Reply <=2 sentences.",
    prompt
  );
  const strat = await runAgent(
    "Strategy & Analytics Agent",
    "You note expected engagement impact. Reply <=2 sentences.",
    prompt
  );

  // Rabindra 2.0 controller: structured plan
  const tools = [{
    type: "function",
    function: {
      name: "produce_change_plan",
      description: "Structured plan for the requested change",
      parameters: {
        type: "object",
        properties: {
          intent: { type: "string", enum: ["content_update", "ui_update", "section_addition", "database_change", "image_generation", "performance"] },
          target_table: { type: "string", enum: ALLOWED_TABLES },
          operation: { type: "string", enum: ["insert", "update", "noop"] },
          target_id: { type: "string", description: "UUID of row to update, or empty for insert" },
          fields: { type: "object", additionalProperties: true, description: "Column->new value" },
          summary: { type: "string" },
        },
        required: ["intent", "target_table", "operation", "summary", "fields"],
        additionalProperties: false,
      },
    },
  }];

  const ctx = `Admin prompt: "${prompt}"\n\nAgent notes:\n- ${hr.content}\n- ${sw.content}\n- ${db.content}\n- ${ui.content}\n- ${sec.content}\n- ${strat.content}`;
  const planResp = await ai(
    [
      { role: "system", content: `You are Rabindra 2.0, a safe controller. Only modify whitelisted tables: ${ALLOWED_TABLES.join(", ")}. For ambiguous prompts, choose noop. Never include code or SQL.` },
      { role: "user", content: ctx },
    ],
    "google/gemini-2.5-flash",
    tools,
    { type: "function", function: { name: "produce_change_plan" } }
  );

  const call = planResp.choices?.[0]?.message?.tool_calls?.[0];
  let plan: any = { intent: "content_update", target_table: "notices", operation: "noop", fields: {}, summary: "Could not produce plan" };
  if (call?.function?.arguments) {
    try { plan = JSON.parse(call.function.arguments); } catch { /* ignore */ }
  }

  return {
    plan,
    agents: [hr, sw, db, ui, sec, strat],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const token = auth.replace("Bearer ", "");

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser(token);
    if (!u?.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: rolesData } = await admin.from("user_roles").select("role").eq("user_id", u.user.id);
    const isSuper = (rolesData || []).some((r: any) => r.role === "super_admin");
    if (!isSuper) return json({ error: "Forbidden: super_admin only" }, 403);

    const body = await req.json();
    const action = body.action as string;
    const startedAt = Date.now();

    if (action === "analyze") {
      const prompt = sanitize(body.prompt || "");
      if (!prompt) return json({ error: "Prompt required" }, 400);
      const { data: log } = await admin.from("ai_logs").insert({
        user_id: u.user.id, prompt, status: "analyzing",
      }).select().single();

      try {
        const result = await planChange(prompt);
        await admin.from("ai_logs").update({
          intent: result.plan.intent,
          agent: "rabindra-2.0",
          status: "analyzed",
          result,
          duration_ms: Date.now() - startedAt,
        }).eq("id", log!.id);
        return json({ log_id: log!.id, ...result });
      } catch (e: any) {
        await admin.from("ai_logs").update({ status: "failed", error: String(e.message) }).eq("id", log!.id);
        throw e;
      }
    }

    if (action === "apply") {
      const log_id = body.log_id;
      const plan = body.plan;
      if (!log_id || !plan) return json({ error: "log_id & plan required" }, 400);
      if (!ALLOWED_TABLES.includes(plan.target_table)) return json({ error: "Table not allowed" }, 400);
      if (plan.operation === "noop") return json({ ok: true, noop: true });

      // Snapshot before
      let snapshot: any = null;
      if (plan.operation === "update" && plan.target_id) {
        const { data: cur } = await admin.from(plan.target_table).select("*").eq("id", plan.target_id).maybeSingle();
        snapshot = cur;
      }

      // Apply
      let applied: any = null;
      if (plan.operation === "insert") {
        const { data, error } = await admin.from(plan.target_table).insert(plan.fields).select().single();
        if (error) throw error;
        applied = data;
      } else if (plan.operation === "update") {
        const { data, error } = await admin.from(plan.target_table).update(plan.fields).eq("id", plan.target_id).select().single();
        if (error) throw error;
        applied = data;
      }

      // Save version
      await admin.from("ai_versions").insert({
        user_id: u.user.id,
        log_id,
        label: plan.summary?.slice(0, 80) || "AI change",
        summary: plan.summary,
        target_table: plan.target_table,
        target_id: applied?.id || plan.target_id,
        snapshot: snapshot || { _new_row: true, id: applied?.id },
        applied_changes: plan.fields,
      });

      await admin.from("ai_logs").update({ status: "applied" }).eq("id", log_id);
      return json({ ok: true, applied });
    }

    if (action === "rollback") {
      const version_id = body.version_id;
      const { data: v, error } = await admin.from("ai_versions").select("*").eq("id", version_id).single();
      if (error || !v) return json({ error: "Version not found" }, 404);
      if (v.rolled_back_at) return json({ error: "Already rolled back" }, 400);
      if (!ALLOWED_TABLES.includes(v.target_table)) return json({ error: "Table not allowed" }, 400);

      const snap = v.snapshot as any;
      if (snap?._new_row) {
        // Originally inserted -> delete it
        if (snap.id) await admin.from(v.target_table).delete().eq("id", snap.id);
      } else if (v.target_id && snap) {
        const { id, created_at, updated_at, ...rest } = snap;
        await admin.from(v.target_table).update(rest).eq("id", v.target_id);
      }
      await admin.from("ai_versions").update({ rolled_back_at: new Date().toISOString() }).eq("id", version_id);
      return json({ ok: true });
    }

    if (action === "generate_image") {
      const prompt = sanitize(body.prompt || "");
      const purpose = sanitize(body.purpose || "");
      if (!prompt) return json({ error: "Prompt required" }, 400);

      const { data: log } = await admin.from("ai_logs").insert({
        user_id: u.user.id, prompt, status: "generating", intent: "image_generation", agent: "rabindra-3.0",
      }).select().single();

      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });
      if (!r.ok) {
        await admin.from("ai_logs").update({ status: "failed", error: await r.text() }).eq("id", log!.id);
        throw new Error("Image gen failed");
      }
      const data = await r.json();
      const dataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!dataUrl) throw new Error("No image returned");

      // Upload to storage
      const base64 = dataUrl.split(",")[1];
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const path = `ai/${u.user.id}/${Date.now()}.png`;
      const { error: upErr } = await admin.storage.from("content-images").upload(path, bytes, { contentType: "image/png", upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = admin.storage.from("content-images").getPublicUrl(path);

      const { data: media } = await admin.from("ai_generated_media").insert({
        user_id: u.user.id, log_id: log!.id, prompt, purpose,
        image_url: pub.publicUrl, storage_path: path, status: "pending",
      }).select().single();

      await admin.from("ai_logs").update({ status: "ready" }).eq("id", log!.id);
      return json({ ok: true, media });
    }

    if (action === "approve_media") {
      const id = body.id;
      await admin.from("ai_generated_media").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", id);
      return json({ ok: true });
    }

    if (action === "reject_media") {
      const id = body.id;
      await admin.from("ai_generated_media").update({ status: "rejected" }).eq("id", id);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e: any) {
    console.error("ai-control error", e);
    return json({ error: e?.message || "Server error" }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
