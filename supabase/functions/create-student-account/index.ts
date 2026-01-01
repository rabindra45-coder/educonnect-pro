import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

const DEFAULT_PASSWORD = "12345678";

const handler = async (req: Request): Promise<Response> => {
  console.log("create-student-account function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { admissionId, studentName, guardianEmail, applyingForClass }: CreateStudentRequest = await req.json();
    
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
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
