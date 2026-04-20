import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId } = await req.json();
    if (!studentId || typeof studentId !== "string") {
      return new Response(JSON.stringify({ error: "studentId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the student and linked user
    const { data: student, error: sErr } = await admin
      .from("students")
      .select("id, user_id, full_name")
      .eq("id", studentId)
      .maybeSingle();

    if (sErr || !student) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!student.user_id) {
      return new Response(
        JSON.stringify({ error: "Student is not linked to a login account" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get email from profiles
    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", student.user_id)
      .maybeSingle();

    if (!profile?.email) {
      return new Response(
        JSON.stringify({ error: "No email associated with this student" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate a magic link. We extract the hashed_token to verify on client.
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: profile.email,
    });

    if (linkErr || !linkData) {
      console.error("generateLink error:", linkErr);
      return new Response(
        JSON.stringify({ error: "Failed to generate login token" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        email: profile.email,
        full_name: student.full_name,
        token_hash: (linkData.properties as any)?.hashed_token,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("qr-login error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
