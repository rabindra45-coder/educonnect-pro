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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
        // Verify eSewa payment
        if (gateway_response?.oid && gateway_response?.refId) {
          // In production, verify with eSewa API
          // For now, we'll trust the callback
          verified = gateway_response.oid === transaction_id;
          verificationData = {
            refId: gateway_response.refId,
            oid: gateway_response.oid,
          };
        }
        break;

      case "khalti":
        // Verify Khalti payment
        if (gateway_response?.pidx) {
          const lookupResponse = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
            method: "POST",
            headers: {
              "Authorization": `Key ${Deno.env.get("KHALTI_SECRET_KEY") || "test_secret_key"}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pidx: gateway_response.pidx }),
          });

          if (lookupResponse.ok) {
            const lookupData = await lookupResponse.json();
            verified = lookupData.status === "Completed";
            verificationData = lookupData;
          } else {
            // For testing purposes, accept mock payments
            verified = gateway_response.status === "mock" || gateway_response.status === "success";
            verificationData = { mock: true };
          }
        }
        break;

      case "imepay":
        // Verify IME Pay payment
        // In production, implement IME Pay verification
        verified = gateway_response?.status === "success" || gateway_response?.status === "mock";
        verificationData = { mock: true };
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
          response_payload: gateway_response,
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
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
