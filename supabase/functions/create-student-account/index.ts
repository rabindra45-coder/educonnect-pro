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
  guardianName: string;
  guardianPhone: string;
  applyingForClass: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  applicationNumber: string;
}

const DEFAULT_PASSWORD = "12345678";

const handler = async (req: Request): Promise<Response> => {
  console.log("create-student-account function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      admissionId, 
      studentName, 
      guardianEmail, 
      guardianName,
      guardianPhone,
      applyingForClass,
      dateOfBirth,
      gender,
      address,
      applicationNumber
    }: CreateStudentRequest = await req.json();
    
    console.log("Processing admission:", { admissionId, studentName, guardianEmail, applyingForClass });

    if (!guardianEmail) {
      throw new Error("Guardian email is required to create student account");
    }

    let userId: string;

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === guardianEmail);

    if (existingUser) {
      console.log("User already exists, updating password and assigning role");
      userId = existingUser.id;
      
      // Update password to default
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: DEFAULT_PASSWORD,
      });

      if (updateError) {
        console.error("Error updating password:", updateError);
      }
    } else {
      // Create new user with default password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: guardianEmail,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: studentName,
          must_change_password: true,
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      userId = authData.user.id;
      console.log("New user created with ID:", userId);
    }

    // Check if student role already exists
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "student")
      .maybeSingle();

    if (!existingRole) {
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
    } else {
      console.log("Student role already exists");
    }

    // Mark user as needing password change in profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        full_name: studentName,
      })
      .eq("id", userId);

    if (profileError) {
      console.log("Profile update note:", profileError.message);
    }

    // Add student to students table
    const registrationNumber = `STU-${new Date().getFullYear()}-${applicationNumber.replace('ADM-', '')}`;
    
    const { error: studentError } = await supabase
      .from("students")
      .insert({
        registration_number: registrationNumber,
        full_name: studentName,
        class: applyingForClass,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        guardian_email: guardianEmail,
        address: address || null,
        admission_year: new Date().getFullYear(),
        status: 'active',
      });

    if (studentError) {
      console.error("Error adding student to students table:", studentError);
    } else {
      console.log("Student added to students table successfully");
    }

    // Send welcome email with login credentials
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      try {
        const { data: schoolSettings } = await supabase
          .from("school_settings")
          .select("school_name")
          .single();
        
        const schoolName = schoolSettings?.school_name || "Shree Durga Saraswati Janata Secondary School";
        
        await resend.emails.send({
          from: `${schoolName} <onboarding@resend.dev>`,
          to: [guardianEmail],
          subject: "🎉 Admission Approved - Welcome to Our School!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
                <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Admission Approved</p>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${guardianName}</strong>,</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  We are delighted to inform you that the admission application for <strong>${studentName}</strong> 
                  has been <span style="color: #10b981; font-weight: bold;">approved</span>!
                </p>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📋 Admission Details</h3>
                  <table style="width: 100%; font-size: 14px;">
                    <tr><td style="padding: 8px 0; color: #6b7280;">Student Name:</td><td style="padding: 8px 0; font-weight: 600;">${studentName}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Class:</td><td style="padding: 8px 0; font-weight: 600;">${applyingForClass}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Registration No:</td><td style="padding: 8px 0; font-weight: 600;">${registrationNumber}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Application No:</td><td style="padding: 8px 0; font-weight: 600;">${applicationNumber}</td></tr>
                  </table>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #92400e; margin-top: 0;">🔐 Student Portal Login Credentials</h3>
                  <table style="width: 100%; font-size: 14px;">
                    <tr><td style="padding: 8px 0; color: #78350f;">Email:</td><td style="padding: 8px 0; font-weight: 600; color: #92400e;">${guardianEmail}</td></tr>
                    <tr><td style="padding: 8px 0; color: #78350f;">Password:</td><td style="padding: 8px 0; font-weight: 600; color: #92400e;">${DEFAULT_PASSWORD}</td></tr>
                  </table>
                  <p style="font-size: 12px; color: #92400e; margin-bottom: 0; margin-top: 15px;">
                    ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; margin-top: 25px;">
                  If you have any questions, please don't hesitate to contact us.
                </p>
                
                <p style="font-size: 14px; margin-top: 25px;">
                  Best regards,<br>
                  <strong>${schoolName}</strong>
                </p>
              </div>
              
              <div style="background: #374151; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </body>
            </html>
          `,
        });
        
        console.log("Welcome email sent successfully to:", guardianEmail);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        registrationNumber,
        defaultPassword: DEFAULT_PASSWORD,
        message: "Student account created successfully. Default password: " + DEFAULT_PASSWORD
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
