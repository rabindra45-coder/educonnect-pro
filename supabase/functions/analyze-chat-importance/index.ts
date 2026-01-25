import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  messages: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages }: AnalyzeRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const conversationText = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const analysisPrompt = `Analyze this conversation and determine if it should be flagged as important for school admin review.

Flag as IMPORTANT if the conversation contains:
- Complaints or negative feedback about the school
- Urgent admission inquiries or deadlines
- Safety or security concerns
- Fee payment issues or disputes
- Bullying or harassment mentions
- Parent/guardian concerns about their child
- Requests for callbacks or personal meetings
- Technical issues with school systems
- Requests that the chatbot couldn't fully answer
- Any sensitive topics requiring human attention

Conversation:
${conversationText}

Respond with ONLY a JSON object (no markdown, no code blocks):
{"isImportant": true/false, "reason": "brief reason if important, empty string if not"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI analysis error:", response.status);
      return new Response(JSON.stringify({ isImportant: false, reason: "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"isImportant": false, "reason": ""}';
    
    // Parse the JSON response
    let result;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      result = { isImportant: false, reason: "" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analysis error:", e);
    return new Response(JSON.stringify({ isImportant: false, reason: "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
