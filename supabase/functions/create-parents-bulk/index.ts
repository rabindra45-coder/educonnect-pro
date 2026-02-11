import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_PASSWORD = "12345678";

const handler = async (req: Request): Promise<Response> => {
  console.log("create-parents-bulk function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;

    // Get all students with guardian email
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, user_id, full_name, guardian_name, guardian_email, guardian_phone, address, class")
      .not("guardian_email", "is", null)
      .order("created_at", { ascending: true });

    if (studentsError) throw new Error(`Failed to fetch students: ${studentsError.message}`);

    console.log(`Found ${students?.length || 0} students with guardian emails`);

    let created = 0;
    let skipped = 0;
    let errors = 0;
    const results: any[] = [];

    // Group students by guardian_email so one parent can have multiple children
    const guardianMap = new Map<string, typeof students>();
    for (const student of students || []) {
      if (!student.guardian_email) continue;
      const email = student.guardian_email.toLowerCase().trim();
      if (!guardianMap.has(email)) {
        guardianMap.set(email, []);
      }
      guardianMap.get(email)!.push(student);
    }

    console.log(`Found ${guardianMap.size} unique guardian emails`);

    for (const [guardianEmail, guardianStudents] of guardianMap) {
      try {
        const firstStudent = guardianStudents[0];

        // Check if a parent account already exists for this email
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
          (u) => u.email?.toLowerCase() === guardianEmail
        );

        let parentUserId: string;

        if (existingUser) {
          parentUserId = existingUser.id;
          console.log(`User already exists for ${guardianEmail}: ${parentUserId}`);
        } else {
          // Create a NEW auth user for the parent with guardian email
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: guardianEmail,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
              full_name: firstStudent.guardian_name || "Guardian",
              must_change_password: true,
            },
          });

          if (createError) {
            console.error(`Error creating user for ${guardianEmail}:`, createError);
            errors++;
            continue;
          }

          parentUserId = newUser.user!.id;
          console.log(`Created new user for ${guardianEmail}: ${parentUserId}`);
        }

        // Ensure parent role exists
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", parentUserId)
          .eq("role", "parent")
          .maybeSingle();

        if (!existingRole) {
          await supabase
            .from("user_roles")
            .insert({ user_id: parentUserId, role: "parent" });

          // Wait for trigger to create parent profile
          await new Promise((r) => setTimeout(r, 500));
        }

        // Get or create parent profile
        let parentId: string | null = null;
        const { data: parentProfile } = await supabase
          .from("parents")
          .select("id")
          .eq("user_id", parentUserId)
          .maybeSingle();

        if (parentProfile) {
          parentId = parentProfile.id;
          await supabase
            .from("parents")
            .update({
              full_name: firstStudent.guardian_name || "Guardian",
              email: guardianEmail,
              phone: firstStudent.guardian_phone || null,
              address: firstStudent.address || null,
            })
            .eq("id", parentId);
        } else {
          const { data: newParent } = await supabase
            .from("parents")
            .insert({
              user_id: parentUserId,
              full_name: firstStudent.guardian_name || "Guardian",
              email: guardianEmail,
              phone: firstStudent.guardian_phone || null,
              address: firstStudent.address || null,
            })
            .select("id")
            .single();

          if (newParent) parentId = newParent.id;
        }

        if (!parentId) {
          console.error(`Failed to get parent profile for ${guardianEmail}`);
          errors++;
          continue;
        }

        // Link parent to ALL their children
        const childrenNames: string[] = [];
        for (const student of guardianStudents) {
          const { data: existingLink } = await supabase
            .from("parent_students")
            .select("id")
            .eq("parent_id", parentId)
            .eq("student_id", student.id)
            .maybeSingle();

          if (!existingLink) {
            await supabase.from("parent_students").insert({
              parent_id: parentId,
              student_id: student.id,
              relationship: "guardian",
              is_primary: true,
            });
            console.log(`Linked parent ${parentId} to student ${student.full_name}`);
          }
          childrenNames.push(`${student.full_name} (Class ${student.class})`);
        }

        // Send welcome email
        if (resend && !existingUser) {
          try {
            await resend.emails.send({
              from: "Shree Durga Saraswati Janata SS <onboarding@resend.dev>",
              to: [guardianEmail],
              subject: `🎓 Parent Portal Access - Your Children's School`,
              html: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; }
                  .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { padding: 25px; background: #f9fafb; }
                  .credentials { background: white; border: 2px solid #0d9488; border-radius: 8px; padding: 20px; margin: 15px 0; }
                  .credentials h3 { color: #0d9488; margin-top: 0; }
                  .cred-row { padding: 8px 0; border-bottom: 1px solid #eee; }
                  .cred-label { color: #666; font-size: 13px; }
                  .cred-value { font-weight: bold; color: #0d9488; }
                  .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin: 15px 0; font-size: 13px; }
                  .footer { text-align: center; padding: 15px; color: #888; font-size: 11px; }
                </style></head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2 style="margin:0;">Parent Portal Access</h2>
                      <p style="margin:5px 0 0;opacity:0.9;font-size:14px;">श्री दुर्गा सरस्वती जनता माध्यमिक विद्यालय</p>
                    </div>
                    <div class="content">
                      <p>Dear <strong>${firstStudent.guardian_name || "Guardian"}</strong>,</p>
                      <p>We are pleased to provide you access to the <strong>Parent Portal</strong> where you can monitor your children's academic progress, attendance, fees, and more.</p>
                      
                      <div class="credentials">
                        <h3>🔐 Your Login Credentials</h3>
                        <div class="cred-row">
                          <span class="cred-label">Email:</span><br>
                          <span class="cred-value">${guardianEmail}</span>
                        </div>
                        <div class="cred-row">
                          <span class="cred-label">Password:</span><br>
                          <span class="cred-value">${DEFAULT_PASSWORD}</span>
                        </div>
                        <div class="cred-row" style="border:none;">
                          <span class="cred-label">Children:</span><br>
                          <span class="cred-value">${childrenNames.join(", ")}</span>
                        </div>
                      </div>

                      <div class="warning">
                        ⚠️ <strong>Important:</strong> Please change your password after your first login for security.
                      </div>

                      <p>Access the Parent Portal to stay connected with your children's education journey.</p>
                    </div>
                    <div class="footer">
                      <p>© ${new Date().getFullYear()} Shree Durga Saraswati Janata Secondary School</p>
                    </div>
                  </div>
                </body></html>
              `,
            });
            console.log(`Email sent to ${guardianEmail}`);
          } catch (emailErr) {
            console.error(`Email failed for ${guardianEmail}:`, emailErr);
          }
        }

        if (existingUser) {
          skipped++;
        } else {
          created++;
        }

        results.push({
          guardian: firstStudent.guardian_name,
          email: guardianEmail,
          children: childrenNames,
          status: existingUser ? "already_existed" : "created",
        });
      } catch (innerError: any) {
        console.error(`Error processing guardian ${guardianEmail}:`, innerError);
        errors++;
      }
    }

    const summary = {
      success: true,
      totalGuardians: guardianMap.size,
      created,
      skipped,
      errors,
      results,
    };

    console.log("Bulk parent creation summary:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in create-parents-bulk:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
