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

async function sendWelcomeEmail(
  guardianEmail: string,
  guardianName: string,
  studentName: string,
  registrationNumber: string,
  applicationNumber: string,
  applyingForClass: string,
  role: string,
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.log("RESEND_API_KEY not set, skipping email");
    return;
  }

  const resend = new Resend(resendKey);
  const portalUrl = role === "parent" ? "/parent/login" : "/login";
  const portalName = role === "parent" ? "Parent Portal" : "Student Portal";

  try {
    await resend.emails.send({
      from: "Shree Durga Saraswati Janata SS <onboarding@resend.dev>",
      to: [guardianEmail],
      subject: `🎓 ${portalName} Access - ${studentName} Admission Approved`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1e3a5f, #2d5a87); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; }
            .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 30px; background: #f9fafb; }
            .credentials { background: white; border: 2px solid #1e3a5f; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .credentials h3 { color: #1e3a5f; margin-top: 0; }
            .cred-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .cred-label { color: #666; font-size: 14px; }
            .cred-value { font-weight: bold; color: #1e3a5f; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin: 15px 0; font-size: 13px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
            .info-item { background: white; padding: 10px; border-radius: 6px; }
            .info-item label { font-size: 11px; color: #888; text-transform: uppercase; }
            .info-item p { margin: 2px 0 0; font-weight: 600; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; background: #f0f0f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>श्री दुर्गा सरस्वती जनता माध्यमिक विद्यालय</h1>
              <p>Shree Durga Saraswati Janata Secondary School</p>
            </div>
            <div class="content">
              <p>Dear <strong>${guardianName}</strong>,</p>
              <p>Congratulations! 🎉 The admission application for <strong>${studentName}</strong> has been <span style="color: green; font-weight: bold;">APPROVED</span>.</p>
              
              <div class="info-grid">
                <div class="info-item">
                  <label>Student Name</label>
                  <p>${studentName}</p>
                </div>
                <div class="info-item">
                  <label>Class</label>
                  <p>${applyingForClass}</p>
                </div>
                <div class="info-item">
                  <label>Registration No.</label>
                  <p>${registrationNumber}</p>
                </div>
                <div class="info-item">
                  <label>Application No.</label>
                  <p>${applicationNumber}</p>
                </div>
              </div>

              <div class="credentials">
                <h3>🔐 Your ${portalName} Login Credentials</h3>
                <div class="cred-item">
                  <span class="cred-label">Email:</span>
                  <span class="cred-value">${guardianEmail}</span>
                </div>
                <div class="cred-item">
                  <span class="cred-label">Password:</span>
                  <span class="cred-value">${DEFAULT_PASSWORD}</span>
                </div>
                <div class="cred-item" style="border-bottom:none;">
                  <span class="cred-label">Portal:</span>
                  <span class="cred-value">${portalName}</span>
                </div>
              </div>

              <div class="warning">
                ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
              </div>

              <p>You can now access the <strong>${portalName}</strong> to monitor ${role === "parent" ? "your child's" : ""} academic progress, attendance, fee status, and more.</p>
              
              <p>Welcome to our school family! 🏫</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Shree Durga Saraswati Janata Secondary School</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Welcome email sent to ${guardianEmail} for ${role} portal`);
  } catch (emailError) {
    console.error(`Error sending ${role} welcome email:`, emailError);
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log("create-student-account function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
      applicationNumber,
    }: CreateStudentRequest = await req.json();

    console.log("Processing admission:", { admissionId, studentName, guardianEmail, applyingForClass });

    if (!guardianEmail) {
      throw new Error("Guardian email is required to create student account");
    }

    // ── 1. Create or find auth user ──
    let userId: string;
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === guardianEmail);

    if (existingUser) {
      console.log("User already exists, updating password");
      userId = existingUser.id;
      await supabase.auth.admin.updateUserById(userId, { password: DEFAULT_PASSWORD });
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: guardianEmail,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: studentName, must_change_password: true },
      });
      if (authError) throw new Error(`Failed to create user account: ${authError.message}`);
      userId = authData.user.id;
      console.log("New user created:", userId);
    }

    // ── 2. Assign student role ──
    const { data: existingStudentRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "student")
      .maybeSingle();

    if (!existingStudentRole) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "student" });
      if (roleError) throw new Error(`Failed to assign student role: ${roleError.message}`);
      console.log("Student role assigned");
    }

    // ── 3. Update profile ──
    await supabase.from("profiles").update({ full_name: studentName }).eq("id", userId);

    // ── 4. Add student record ──
    const registrationNumber = `STU-${new Date().getFullYear()}-${applicationNumber.replace("ADM-", "").replace("APP-", "")}`;

    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let studentId: string;

    if (existingStudent) {
      studentId = existingStudent.id;
      console.log("Student record already exists:", studentId);
    } else {
      const { data: newStudent, error: studentError } = await supabase
        .from("students")
        .insert({
          user_id: userId,
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
          status: "active",
        })
        .select("id")
        .single();

      if (studentError) {
        console.error("Error adding student:", studentError);
        throw new Error(`Failed to create student record: ${studentError.message}`);
      }
      studentId = newStudent.id;
      console.log("Student record created:", studentId);
    }

    // ── 5. Assign parent role (trigger auto-creates parent profile) ──
    const { data: existingParentRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "parent")
      .maybeSingle();

    if (!existingParentRole) {
      const { error: parentRoleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "parent" });
      if (parentRoleError) {
        console.error("Error assigning parent role:", parentRoleError);
      } else {
        console.log("Parent role assigned");
      }
    }

    // Wait briefly for trigger to create parent profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── 6. Update parent profile with guardian details ──
    const { data: parentProfile } = await supabase
      .from("parents")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (parentProfile) {
      await supabase
        .from("parents")
        .update({
          full_name: guardianName,
          email: guardianEmail,
          phone: guardianPhone,
          address: address || null,
        })
        .eq("id", parentProfile.id);

      // ── 7. Link parent to student ──
      const { data: existingLink } = await supabase
        .from("parent_students")
        .select("id")
        .eq("parent_id", parentProfile.id)
        .eq("student_id", studentId)
        .maybeSingle();

      if (!existingLink) {
        const { error: linkError } = await supabase
          .from("parent_students")
          .insert({
            parent_id: parentProfile.id,
            student_id: studentId,
            relationship: "guardian",
            is_primary: true,
          });
        if (linkError) {
          console.error("Error linking parent to student:", linkError);
        } else {
          console.log("Parent linked to student");
        }
      }
    } else {
      console.log("Parent profile not found after trigger, creating manually");
      const { data: newParent, error: manualParentErr } = await supabase
        .from("parents")
        .insert({
          user_id: userId,
          full_name: guardianName,
          email: guardianEmail,
          phone: guardianPhone,
          address: address || null,
        })
        .select("id")
        .single();

      if (!manualParentErr && newParent) {
        await supabase.from("parent_students").insert({
          parent_id: newParent.id,
          student_id: studentId,
          relationship: "guardian",
          is_primary: true,
        });
        console.log("Parent profile created manually and linked");
      }
    }

    // ── 8. Create welcome notice ──
    const { data: schoolSettings } = await supabase
      .from("school_settings")
      .select("school_name")
      .single();

    const schoolName = schoolSettings?.school_name || "Shree Durga Saraswati Janata Secondary School";

    await supabase.from("notices").insert({
      title: `🎉 Welcome ${studentName} - Admission Approved!`,
      content: `Dear ${guardianName},\n\nCongratulations! The admission for ${studentName} has been approved.\n\n**Details:**\n- Student: ${studentName}\n- Class: ${applyingForClass}\n- Registration: ${registrationNumber}\n- Application: ${applicationNumber}\n\n**Login Credentials (Student & Parent Portal):**\n- Email: ${guardianEmail}\n- Password: ${DEFAULT_PASSWORD}\n\n⚠️ Please change your password after first login.\n\nWelcome to ${schoolName}!`,
      category: "Admission",
      is_published: true,
      is_pinned: false,
    });

    // ── 9. Send welcome emails ──
    await Promise.all([
      sendWelcomeEmail(guardianEmail, guardianName, studentName, registrationNumber, applicationNumber, applyingForClass, "parent"),
      sendWelcomeEmail(guardianEmail, guardianName, studentName, registrationNumber, applicationNumber, applyingForClass, "student"),
    ]);

    console.log("=== ACCOUNT CREATED ===");
    console.log(`Student: ${studentName} | Email: ${guardianEmail} | Reg: ${registrationNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        studentId,
        registrationNumber,
        defaultPassword: DEFAULT_PASSWORD,
        message: "Student & Parent accounts created. Credentials emailed.",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: any) {
    console.error("Error in create-student-account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
