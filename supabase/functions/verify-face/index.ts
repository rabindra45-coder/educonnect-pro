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
    const { email, faceImage } = await req.json();

    if (!email || !faceImage) {
      return new Response(
        JSON.stringify({ error: "Email and face image are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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

    // Get stored face data
    const { data: faceData, error: faceError } = await supabase
      .from("student_face_data")
      .select("face_image_url")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (faceError || !faceData) {
      return new Response(
        JSON.stringify({ success: false, message: "Face login not set up for this account" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download stored face image and convert to base64
    let storedFaceBase64: string;
    try {
      const imageResponse = await fetch(faceData.face_image_url);
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch stored face image");
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      storedFaceBase64 = `data:${contentType};base64,${base64}`;
    } catch (e) {
      console.error("Error fetching stored face image:", e);
      return new Response(
        JSON.stringify({ success: false, message: "Could not retrieve stored face data" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Gemini Vision to compare faces
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a face verification system. Compare the two faces in the images and determine if they are the SAME PERSON. 
            
Consider: facial structure, eyes, nose, mouth, overall face shape. 
Account for: different lighting, angles, expressions, aging (within reason).

Respond with ONLY a JSON object:
{"match": true/false, "confidence": 0-100, "reason": "brief explanation"}

Be strict - only return true if you are confident it's the same person.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Compare these two face images and determine if they are the same person:" },
              { type: "image_url", image_url: { url: storedFaceBase64 } },
              { type: "image_url", image_url: { url: faceImage } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Face verification failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let result;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { match: false, confidence: 0, reason: "Could not parse response" };
    } catch {
      result = { match: false, confidence: 0, reason: "Verification error" };
    }

    if (result.match && result.confidence >= 70) {
      // Generate a magic link for passwordless login
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      });

      if (linkError) throw linkError;

      return new Response(
        JSON.stringify({
          success: true,
          token: linkData.properties?.hashed_token,
          message: "Face verified successfully",
          confidence: result.confidence,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: result.confidence < 70 
          ? "Face verification confidence too low. Please try again with better lighting." 
          : "Face does not match. Please use password login.",
        confidence: result.confidence,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-face error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
