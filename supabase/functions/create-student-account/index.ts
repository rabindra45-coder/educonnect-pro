import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateStudentRequest {
  admissionId: string;
  studentName: string;
  guardianEmail: string;
  applyingForClass: string;
}

function generatePassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("create-student-account function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { admissionId, studentName, guardianEmail, applyingForClass }: CreateStudentRequest = await req.json();
    
    console.log("Processing admission:", { admissionId, studentName, guardianEmail, applyingForClass });

    if (!guardianEmail) {
      throw new Error("Guardian email is required to create student account");
    }

    // Generate a random password
    const password = generatePassword();
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: guardianEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: studentName,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(`Failed to create user account: ${authError.message}`);
    }

    const userId = authData.user.id;
    console.log("User created with ID:", userId);

    // Assign student role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "student",
      });

    if (roleError) {
      console.error("Role assignment error:", roleError);
      throw new Error(`Failed to assign student role: ${roleError.message}`);
    }

    console.log("Student role assigned successfully");

    // Get school settings for email branding
    const { data: schoolSettings } = await supabase
      .from("school_settings")
      .select("school_name, school_email")
      .single();

    const schoolName = schoolSettings?.school_name || "Shree Durga Saraswati Janata Secondary School";

    // Send welcome email with login credentials
    const { error: emailError } = await resend.emails.send({
      from: `${schoolName} <onboarding@resend.dev>`,
      to: [guardianEmail],
      subject: `Welcome to ${schoolName} - Your Login Credentials`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .credential-item { margin: 10px 0; }
            .label { font-weight: bold; color: #6b7280; }
            .value { font-family: monospace; background: #e5e7eb; padding: 5px 10px; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to ${schoolName}!</h1>
            </div>
            <div class="content">
              <p>Dear Parent/Guardian,</p>
              <p>We are pleased to inform you that the admission application for <strong>${studentName}</strong> for <strong>Class ${applyingForClass}</strong> has been <strong style="color: #10b981;">approved</strong>.</p>
              
              <p>A student portal account has been created. Below are the login credentials:</p>
              
              <div class="credentials">
                <div class="credential-item">
                  <span class="label">Email:</span><br/>
                  <span class="value">${guardianEmail}</span>
                </div>
                <div class="credential-item">
                  <span class="label">Password:</span><br/>
                  <span class="value">${password}</span>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes. Keep these credentials safe and do not share them with anyone.
              </div>
              
              <p>If you have any questions, please contact the school administration.</p>
              
              <p>Best regards,<br/><strong>${schoolName}</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Email error:", emailError);
      // Don't throw - account was created, just log the email error
      console.warn("Email could not be sent, but account was created successfully");
    } else {
      console.log("Welcome email sent successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: "Student account created and email sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-student-account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
