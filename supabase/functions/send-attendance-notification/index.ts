import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AttendanceNotificationRequest {
  studentId: string;
  date: string;
  status: string;
  remarks?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { studentId, date, status, remarks }: AttendanceNotificationRequest = await req.json();

    // Fetch student details
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("full_name, class, section, guardian_name, guardian_email, guardian_phone")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      throw new Error("Student not found");
    }

    if (!student.guardian_email) {
      return new Response(
        JSON.stringify({ success: true, message: "No guardian email configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: schoolSettings } = await supabase
      .from("school_settings")
      .select("school_name, school_phone, school_email")
      .single();

    const schoolName = schoolSettings?.school_name || "Shree Durga Saraswati Janata Secondary School";
    const schoolPhone = schoolSettings?.school_phone || "";
    const schoolEmail = schoolSettings?.school_email || "";

    const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailAppPassword) {
      return new Response(
        JSON.stringify({ success: true, message: "Email credentials not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const statusColor = status === 'absent' ? '#dc2626' : status === 'late' ? '#f59e0b' : '#16a34a';
    const statusIcon = status === 'absent' ? '❌' : status === 'late' ? '⚠️' : '✅';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a5f, #2d5a87); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; background: ${statusColor}; }
        .info-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #6b7280; }
        .value { font-weight: 600; color: #1f2937; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .alert.warning { background: #fffbeb; border-color: #fde68a; }
      </style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 ${schoolName}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Attendance Notification</p>
          </div>
          <div class="content">
            <p>Dear ${student.guardian_name || 'Parent/Guardian'},</p>
            <p>This is to inform you about your ward's attendance status:</p>
            <div style="text-align: center; margin: 25px 0;">
              <span style="font-size: 40px;">${statusIcon}</span>
              <div class="status-badge" style="margin-top: 10px;">${statusDisplay}</div>
            </div>
            <div class="info-box">
              <div class="info-row"><span class="label">Student Name</span><span class="value">${student.full_name}</span></div>
              <div class="info-row"><span class="label">Class</span><span class="value">${student.class}${student.section ? ` - ${student.section}` : ''}</span></div>
              <div class="info-row"><span class="label">Date</span><span class="value">${formattedDate}</span></div>
              <div class="info-row"><span class="label">Status</span><span class="value" style="color: ${statusColor}">${statusDisplay}</span></div>
              ${remarks ? `<div class="info-row"><span class="label">Remarks</span><span class="value">${remarks}</span></div>` : ''}
            </div>
            ${status === 'absent' ? `<div class="alert"><strong>⚠️ Important:</strong> Regular attendance is crucial. Please provide a written explanation if absent due to illness or emergency.</div>` : ''}
            ${status === 'late' ? `<div class="alert warning"><strong>⏰ Note:</strong> Please ensure your child arrives on time.</div>` : ''}
            <p>Best regards,<br><strong>${schoolName}</strong></p>
          </div>
          <div class="footer">
            <p>${schoolName}</p>
            ${schoolPhone ? `<p>📞 ${schoolPhone}</p>` : ''}
            ${schoolEmail ? `<p>✉️ ${schoolEmail}</p>` : ''}
          </div>
        </div>
      </body></html>
    `;

    try {
      const client = new SMTPClient({
        connection: {
          hostname: "smtp.gmail.com",
          port: 465,
          tls: true,
          auth: { username: gmailUser, password: gmailAppPassword },
        },
      });

      await client.send({
        from: gmailUser,
        to: student.guardian_email,
        subject: `${statusIcon} Attendance Alert: ${student.full_name} - ${statusDisplay} on ${formattedDate}`,
        content: "Please view this email in an HTML-compatible email client.",
        html: emailHtml,
      });

      await client.close();

      await supabase
        .from("attendance")
        .update({ notification_sent: true })
        .eq("student_id", studentId)
        .eq("date", date);
    } catch (emailError: any) {
      console.error("Error sending attendance email:", emailError);
      return new Response(
        JSON.stringify({ success: false, error: "Email delivery failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-attendance-notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send notification" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
