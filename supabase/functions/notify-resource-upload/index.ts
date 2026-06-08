import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface Body {
  resource_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resource_id } = (await req.json()) as Body;
    if (!resource_id) throw new Error("resource_id required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: r, error: rerr } = await admin
      .from("digital_resources")
      .select("id,title,description,class,subject,access_level,allowed_roles")
      .eq("id", resource_id)
      .single();
    if (rerr || !r) throw rerr || new Error("Resource not found");

    const allowed = (r.allowed_roles as string[] | null) ?? null;
    const wantStudents = !allowed || allowed.includes("student") || r.access_level === "all";
    const wantTeachers = !allowed || allowed.includes("teacher") || r.access_level === "all";
    const wantParents = !allowed || allowed.includes("parent") || r.access_level === "all";

    const recipients: { user_id: string; email: string | null; name: string | null }[] = [];

    if (wantStudents) {
      let q = admin.from("students").select("user_id,full_name,email,class").not("user_id", "is", null);
      if (r.class && r.class !== "All") q = q.eq("class", r.class);
      const { data } = await q;
      for (const s of data ?? []) {
        if (s.user_id) recipients.push({ user_id: s.user_id, email: s.email, name: s.full_name });
      }
    }

    if (wantTeachers) {
      const { data } = await admin
        .from("teachers")
        .select("user_id,full_name,email")
        .not("user_id", "is", null)
        .eq("status", "active");
      for (const t of data ?? []) {
        if (t.user_id) recipients.push({ user_id: t.user_id, email: t.email, name: t.full_name });
      }
    }

    if (wantParents) {
      if (r.class && r.class !== "All") {
        const { data: kids } = await admin.from("students").select("id").eq("class", r.class);
        const ids = (kids ?? []).map((k) => k.id);
        if (ids.length) {
          const { data: links } = await admin
            .from("parent_students")
            .select("parent_id")
            .in("student_id", ids);
          const parentIds = Array.from(new Set((links ?? []).map((l) => l.parent_id)));
          if (parentIds.length) {
            const { data: parents } = await admin
              .from("parents")
              .select("user_id,full_name,email")
              .in("id", parentIds)
              .not("user_id", "is", null);
            for (const p of parents ?? []) {
              if (p.user_id) recipients.push({ user_id: p.user_id, email: p.email, name: p.full_name });
            }
          }
        }
      } else {
        const { data } = await admin
          .from("parents")
          .select("user_id,full_name,email")
          .not("user_id", "is", null);
        for (const p of data ?? []) {
          if (p.user_id) recipients.push({ user_id: p.user_id, email: p.email, name: p.full_name });
        }
      }
    }

    // dedupe by user_id
    const seen = new Set<string>();
    const uniq = recipients.filter((r) => (seen.has(r.user_id) ? false : (seen.add(r.user_id), true)));

    const link = `/resources?focus=${r.id}`;
    const title = `New resource: ${r.title}`;
    const body = r.description
      ? r.description.slice(0, 200)
      : `A new ${r.class ? `Class ${r.class} ` : ""}resource is available.`;

    // Insert in-app notifications in chunks
    const rows = uniq.map((u) => ({
      user_id: u.user_id,
      title,
      body,
      link,
      type: "resource",
      resource_id: r.id,
    }));
    for (let i = 0; i < rows.length; i += 500) {
      await admin.from("notifications").insert(rows.slice(i, i + 500));
    }

    // Send emails (best-effort, limit blast)
    const emailTargets = uniq.filter((u) => u.email).slice(0, 200);
    let emailsSent = 0;
    if (Deno.env.get("RESEND_API_KEY")) {
      await Promise.allSettled(
        emailTargets.map(async (u) => {
          try {
            await resend.emails.send({
              from: "Milestone International College <onboarding@resend.dev>",
              to: [u.email!],
              subject: title,
              html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">
                  <div style="background:#1e3a5f;color:#fff;padding:16px;border-radius:8px 8px 0 0">
                    <h2 style="margin:0">📚 New Resource Available</h2>
                  </div>
                  <div style="background:#f9f9f9;padding:20px;border-radius:0 0 8px 8px">
                    <p>Dear ${u.name ?? "Student"},</p>
                    <p>A new resource has been published:</p>
                    <h3 style="color:#1e3a5f">${r.title}</h3>
                    <p>${body}</p>
                    ${r.class ? `<p><b>Class:</b> ${r.class}</p>` : ""}
                    ${r.subject ? `<p><b>Subject:</b> ${r.subject}</p>` : ""}
                    <p style="margin-top:20px">
                      <a href="https://milestoneinternationalcollege.lovable.app${link}"
                         style="background:#d4a017;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px">
                        View Resource
                      </a>
                    </p>
                  </div>
                </div>`,
            });
            emailsSent++;
          } catch (_) { /* swallow */ }
        }),
      );
    }

    return new Response(
      JSON.stringify({ ok: true, notified: uniq.length, emails: emailsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
