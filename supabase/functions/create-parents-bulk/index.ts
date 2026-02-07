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

    // Get all active students with guardian info
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

    for (const student of students || []) {
      if (!student.guardian_email || !student.user_id) {
        skipped++;
        continue;
      }

      try {
        const userId = student.user_id;

        // Check if parent role already exists
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", userId)
          .eq("role", "parent")
          .maybeSingle();

        if (existingRole) {
          // Already has parent role, just ensure linkage
          const { data: parentProfile } = await supabase
            .from("parents")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (parentProfile) {
            // Ensure parent-student link exists
            const { data: existingLink } = await supabase
              .from("parent_students")
              .select("id")
              .eq("parent_id", parentProfile.id)
              .eq("student_id", student.id)
              .maybeSingle();

            if (!existingLink) {
              await supabase.from("parent_students").insert({
                parent_id: parentProfile.id,
                student_id: student.id,
                relationship: "guardian",
                is_primary: true,
              });
              console.log(`Linked existing parent ${parentProfile.id} to student ${student.id}`);
            }
          }
          skipped++;
          continue;
        }

        // Assign parent role (trigger creates parent profile)
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "parent" });

        if (roleError) {
          console.error(`Error assigning parent role for ${student.guardian_email}:`, roleError);
          errors++;
          continue;
        }

        // Brief wait for trigger
        await new Promise((r) => setTimeout(r, 300));

        // Get or create parent profile
        let parentId: string | null = null;
        const { data: parentProfile } = await supabase
          .from("parents")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (parentProfile) {
          parentId = parentProfile.id;
          // Update with guardian details
          await supabase
            .from("parents")
            .update({
              full_name: student.guardian_name || "Guardian",
              email: student.guardian_email,
              phone: student.guardian_phone || null,
              address: student.address || null,
            })
            .eq("id", parentId);
        } else {
          // Create manually if trigger didn't fire
          const { data: newParent } = await supabase
            .from("parents")
            .insert({
              user_id: userId,
              full_name: student.guardian_name || "Guardian",
              email: student.guardian_email,
              phone: student.guardian_phone || null,
              address: student.address || null,
            })
            .select("id")
            .single();

          if (newParent) parentId = newParent.id;
        }

        // Link parent to student
        if (parentId) {
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
          }
        }

        // Send welcome email
        if (resend && student.guardian_email) {
          try {
            await resend.emails.send({
              from: "Shree Durga Saraswati Janata SS <onboarding@resend.dev>",
              to: [student.guardian_email],
              subject: `🎓 Parent Portal Access - ${student.full_name}`,
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
                      <p>Dear <strong>${student.guardian_name || "Guardian"}</strong>,</p>
                      <p>We are pleased to provide you access to the <strong>Parent Portal</strong> where you can monitor <strong>${student.full_name}</strong>'s academic progress, attendance, fees, and more.</p>
                      
                      <div class="credentials">
                        <h3>🔐 Your Login Credentials</h3>
                        <div class="cred-row">
                          <span class="cred-label">Email:</span><br>
                          <span class="cred-value">${student.guardian_email}</span>
                        </div>
                        <div class="cred-row">
                          <span class="cred-label">Password:</span><br>
                          <span class="cred-value">${DEFAULT_PASSWORD}</span>
                        </div>
                        <div class="cred-row" style="border:none;">
                          <span class="cred-label">Student:</span><br>
                          <span class="cred-value">${student.full_name} (Class ${student.class})</span>
                        </div>
                      </div>

                      <div class="warning">
                        ⚠️ <strong>Important:</strong> Please change your password after your first login.
                      </div>

                      <p>Access the Parent Portal to stay connected with your child's education journey.</p>
                    </div>
                    <div class="footer">
                      <p>© ${new Date().getFullYear()} Shree Durga Saraswati Janata Secondary School</p>
                    </div>
                  </div>
                </body></html>
              `,
            });
            console.log(`Email sent to ${student.guardian_email}`);
          } catch (emailErr) {
            console.error(`Email failed for ${student.guardian_email}:`, emailErr);
          }
        }

        created++;
        results.push({
          student: student.full_name,
          guardian: student.guardian_name,
          email: student.guardian_email,
          status: "created",
        });

        console.log(`Parent created for student: ${student.full_name} (${student.guardian_email})`);
      } catch (innerError: any) {
        console.error(`Error processing student ${student.full_name}:`, innerError);
        errors++;
      }
    }

    const summary = {
      success: true,
      total: students?.length || 0,
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
