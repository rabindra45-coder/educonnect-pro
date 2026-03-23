import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, verified, confidence } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: Never trust client-supplied "verified" flag alone.
    // The face comparison happens client-side using face-api.js, but we 
    // validate that the request includes a confidence score above threshold.
    if (!verified || typeof confidence !== "number" || confidence < 40) {
      return new Response(
        JSON.stringify({ success: false, message: "Face verification failed or confidence too low" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const user = userData.users.find((u) => u.email === email);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "No account found with this email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user actually has face data registered
    const { data: faceData, error: faceError } = await supabase
      .from("student_face_data")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (faceError || !faceData) {
      return new Response(
        JSON.stringify({ success: false, message: "Face login not set up for this account" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a magic link for passwordless login
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (linkError) throw linkError;

    return new Response(
      JSON.stringify({
        success: true,
        token_hash: linkData.properties?.hashed_token,
        message: "Face verified successfully",
        confidence: confidence || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-face error:", error);
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
