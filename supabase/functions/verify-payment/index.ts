import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  gateway: "esewa" | "khalti" | "imepay";
  transaction_id: string;
  gateway_response?: any;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user with anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { gateway, transaction_id, gateway_response }: VerifyRequest = await req.json();

    // Find the transaction
    const { data: transaction, error: txError } = await supabase
      .from("payment_transactions")
      .select("*, student_fees(*)")
      .eq("gateway_transaction_id", transaction_id)
      .single();

    if (txError || !transaction) {
      throw new Error("Transaction not found");
    }

    let verified = false;
    let verificationData = {};

    switch (gateway) {
      case "esewa":
        // Verify eSewa payment server-side
        if (gateway_response?.oid && gateway_response?.refId) {
          try {
            const esewaVerifyUrl = `https://uat.esewa.com.np/epay/transrec`;
            const verifyParams = new URLSearchParams({
              amt: transaction.amount.toString(),
              scd: Deno.env.get("ESEWA_MERCHANT_CODE") || "EPAYTEST",
              pid: transaction_id,
              rid: gateway_response.refId,
            });
            const esewaRes = await fetch(`${esewaVerifyUrl}?${verifyParams.toString()}`);
            const esewaText = await esewaRes.text();
            verified = esewaText.includes("Success");
            verificationData = {
              refId: gateway_response.refId,
              oid: gateway_response.oid,
              serverVerified: true,
            };
          } catch (e) {
            console.error("eSewa verification failed:", e);
            verified = false;
          }
        }
        break;

      case "khalti":
        // Verify Khalti payment server-side only
        if (gateway_response?.pidx) {
          const khaltiSecretKey = Deno.env.get("KHALTI_SECRET_KEY");
          if (!khaltiSecretKey) {
            throw new Error("Khalti payment verification not configured");
          }
          const lookupResponse = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
            method: "POST",
            headers: {
              "Authorization": `Key ${khaltiSecretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pidx: gateway_response.pidx }),
          });

          if (lookupResponse.ok) {
            const lookupData = await lookupResponse.json();
            verified = lookupData.status === "Completed";
            verificationData = lookupData;
          } else {
            verified = false;
            verificationData = { error: "Khalti lookup failed" };
          }
        }
        break;

      case "imepay":
        // IME Pay requires proper server-side verification
        // Block until properly implemented
        verified = false;
        verificationData = { error: "IME Pay verification not yet implemented" };
        break;

      default:
        throw new Error("Invalid payment gateway");
    }

    if (verified) {
      // Update transaction status
      await supabase
        .from("payment_transactions")
        .update({
          status: "success",
          response_payload: verificationData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      // Create fee payment record
      const { data: payment, error: paymentError } = await supabase
        .from("fee_payments")
        .insert({
          student_fee_id: transaction.student_fee_id,
          student_id: transaction.student_id,
          amount: transaction.amount,
          payment_method: gateway,
          transaction_id: transaction_id,
          gateway_response: verificationData,
        })
        .select()
        .single();

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          payment_id: payment?.id,
          receipt_number: payment?.receipt_number,
          message: "Payment verified and recorded successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Update transaction as failed
      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          response_payload: verificationData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: "Payment verification failed",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Payment verification failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
