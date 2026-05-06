import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendWelcomeRequest {
  to: string;
  recipientName: string;
  studentName: string;
  registrationNumber?: string;
  applyingForClass?: string;
  password?: string; // optional — if missing, it's a resend without credentials
  resend?: boolean;
}

function buildHtml(opts: SendWelcomeRequest) {
  const credBlock = opts.password
    ? `
      <div style="background:white;border:2px solid #1e3a5f;border-radius:8px;padding:20px;margin:20px 0">
        <h3 style="color:#1e3a5f;margin-top:0">🔐 Login Credentials</h3>
        <p style="margin:6px 0"><strong>Email:</strong> ${opts.to}</p>
        <p style="margin:6px 0"><strong>Password:</strong> <code>${opts.password}</code></p>
        <p style="margin:6px 0;font-size:13px;color:#b45309">⚠️ Please change your password after first login.</p>
      </div>`
    : `<p>This is a resend of your welcome notification. If you forgot your password, please use the "Forgot password" option on the login page.</p>`;

  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;margin:0;padding:0">
    <div style="max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a87);color:white;padding:24px;text-align:center">
        <h1 style="margin:0;font-size:20px">Milestone International College</h1>
        <p style="margin:4px 0 0;opacity:.9">Welcome to our school family</p>
      </div>
      <div style="padding:24px;background:#f9fafb">
        <p>Dear <strong>${opts.recipientName}</strong>,</p>
        <p>${opts.resend ? "Here is your portal access information again." : "🎉 Congratulations! The admission for <strong>" + opts.studentName + "</strong> has been approved."}</p>
        ${opts.registrationNumber ? `<p><strong>Registration:</strong> ${opts.registrationNumber}${opts.applyingForClass ? ` &nbsp; <strong>Class:</strong> ${opts.applyingForClass}` : ""}</p>` : ""}
        ${credBlock}
        <p>You can now sign in to the Student & Parent portals.</p>
      </div>
      <div style="text-align:center;padding:16px;color:#888;font-size:12px;background:#f0f0f0">
        © ${new Date().getFullYear()} Milestone International College
      </div>
    </div></body></html>`;
}

export async function sendViaGmail(req: SendWelcomeRequest) {
  const gmailUser = Deno.env.get("GMAIL_USER");
  const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!gmailUser || !gmailPass) {
    throw new Error("Gmail credentials not configured");
  }
  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: { username: gmailUser, password: gmailPass },
    },
  });
  try {
    await client.send({
      from: `Milestone International College <${gmailUser}>`,
      to: req.to,
      subject: req.resend
        ? `Your Milestone College Portal Access`
        : `🎓 Admission Approved — Welcome ${req.studentName}`,
      html: buildHtml(req),
      content: "auto",
    });
  } finally {
    await client.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: callerRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .in("role", ["super_admin", "admin"])
      .maybeSingle();
    if (!callerRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: SendWelcomeRequest = await req.json();
    if (!body.to || !body.recipientName || !body.studentName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    await sendViaGmail(body);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-welcome-email error:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
