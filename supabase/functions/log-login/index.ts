import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginLogRequest {
  userId: string;
  email: string;
  fullName?: string;
  loginMethod: "password" | "face";
  userAgent?: string;
  timezone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Log login function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName, loginMethod, userAgent, timezone }: LoginLogRequest = await req.json();

    console.log(`Logging login for user: ${email}, method: ${loginMethod}`);

    if (!userId || !email || !loginMethod) {
      throw new Error("Missing required fields: userId, email, or loginMethod");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get IP address from request headers
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      req.headers.get("x-real-ip") || 
                      "Unknown";

    // Get current timestamp
    const loginTime = new Date().toISOString();
    const formattedTime = new Date().toLocaleString("en-US", {
      timeZone: timezone || "Asia/Kathmandu",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent || "");

    // Log activity to database
    const { error: logError } = await supabase.from("activity_logs").insert({
      user_id: userId,
      action: "login",
      entity_type: "user",
      entity_id: userId,
      ip_address: ipAddress,
      details: {
        login_method: loginMethod,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        user_agent: userAgent,
        timezone: timezone || "Asia/Kathmandu",
        login_time: loginTime,
      },
    });

    if (logError) {
      console.error("Error logging activity:", logError);
    }

    // Send email notification using Gmail SMTP
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (gmailUser && gmailAppPassword) {
      try {
        const client = new SMTPClient({
          connection: {
            hostname: "smtp.gmail.com",
            port: 465,
            tls: true,
            auth: {
              username: gmailUser,
              password: gmailAppPassword,
            },
          },
        });

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 30px 20px; background: #ffffff; border: 1px solid #e0e0e0; }
              .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .info-label { font-weight: 600; color: #555; width: 120px; }
              .info-value { color: #333; }
              .method-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
              .method-face { background: #e8f5e9; color: #2e7d32; }
              .method-password { background: #e3f2fd; color: #1565c0; }
              .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; }
              .warning-icon { font-size: 20px; margin-right: 10px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 New Login Alert</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">Shree Durga Saraswati Janata Secondary School</p>
              </div>
              <div class="content">
                <p>Dear ${fullName || "Student"},</p>
                <p>We detected a new login to your student account. Here are the details:</p>
                
                <div class="info-box">
                  <div class="info-row">
                    <span class="info-label">📧 Email:</span>
                    <span class="info-value">${email}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">🕐 Time:</span>
                    <span class="info-value">${formattedTime}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">📍 IP Address:</span>
                    <span class="info-value">${ipAddress}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">💻 Device:</span>
                    <span class="info-value">${deviceInfo.device}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">🌐 Browser:</span>
                    <span class="info-value">${deviceInfo.browser}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">🔑 Method:</span>
                    <span class="info-value">
                      <span class="method-badge ${loginMethod === 'face' ? 'method-face' : 'method-password'}">
                        ${loginMethod === 'face' ? '👤 Face Login' : '🔒 Password'}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div class="warning">
                  <span class="warning-icon">⚠️</span>
                  <strong>Wasn't you?</strong> If you didn't make this login, please change your password immediately and contact the school administration.
                </div>
              </div>
              <div class="footer">
                <p>This is an automated security notification from SDSJSS.</p>
                <p>© ${new Date().getFullYear()} Shree Durga Saraswati Janata Secondary School</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await client.send({
          from: gmailUser,
          to: email,
          subject: `🔐 Login Alert - ${loginMethod === 'face' ? 'Face Recognition' : 'Password'} Login Detected`,
          content: "New login detected on your account",
          html: emailHtml,
        });

        await client.close();

        console.log("Login notification email sent via Gmail SMTP");
      } catch (emailError) {
        console.error("Error sending login email via Gmail:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log("Gmail credentials not configured, skipping email notification");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Login logged successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in log-login function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  let device = "Unknown Device";
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  // Detect OS
  if (ua.includes("Windows NT 10")) os = "Windows 10";
  else if (ua.includes("Windows NT 11") || ua.includes("Windows NT 10.0; Win64")) os = "Windows 11";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // Detect Browser
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  // Detect Device
  if (ua.includes("Mobile") || ua.includes("Android") && !ua.includes("Tablet")) device = "Mobile Phone";
  else if (ua.includes("Tablet") || ua.includes("iPad")) device = "Tablet";
  else device = "Desktop/Laptop";

  return { device, browser, os };
}

serve(handler);
