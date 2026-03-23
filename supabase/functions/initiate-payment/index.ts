import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  gateway: "esewa" | "khalti" | "imepay";
  student_fee_id: string;
  amount: number;
  student_name: string;
  fee_type: string;
  return_url: string;
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

    // Use anon client (with user's auth) for RLS-protected operations
    const supabase = anonClient;

    const { gateway, student_fee_id, amount, student_name, fee_type, return_url }: PaymentRequest = await req.json();

    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

    const { data: feeData, error: feeError } = await supabase
      .from("student_fees")
      .select("student_id")
      .eq("id", student_fee_id)
      .single();

    if (feeError || !feeData) {
      throw new Error("Student fee not found");
    }

    const { data: transaction, error: txError } = await supabase
      .from("payment_transactions")
      .insert({
        student_fee_id,
        student_id: feeData.student_id,
        amount,
        gateway,
        gateway_transaction_id: transactionId,
        status: "initiated",
        request_payload: { student_name, fee_type, return_url },
      })
      .select()
      .single();

    if (txError) {
      throw new Error("Failed to create transaction record");
    }

    let paymentUrl = "";
    let paymentData = {};

    switch (gateway) {
      case "esewa": {
        const esewaPath = "https://uat.esewa.com.np/epay/main";
        const esewaParams = new URLSearchParams({
          amt: amount.toString(),
          psc: "0",
          pdc: "0",
          txAmt: "0",
          tAmt: amount.toString(),
          pid: transactionId,
          scd: Deno.env.get("ESEWA_MERCHANT_CODE") || "EPAYTEST",
          su: `${return_url}?gateway=esewa&status=success&tx_id=${transactionId}`,
          fu: `${return_url}?gateway=esewa&status=failed&tx_id=${transactionId}`,
        });
        paymentUrl = `${esewaPath}?${esewaParams.toString()}`;
        paymentData = { url: paymentUrl, method: "GET" };
        break;
      }

      case "khalti": {
        const khaltiSecretKey = Deno.env.get("KHALTI_SECRET_KEY");
        if (!khaltiSecretKey) {
          throw new Error("Khalti payment gateway not configured");
        }
        const khaltiResponse = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
          method: "POST",
          headers: {
            "Authorization": `Key ${khaltiSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            return_url: `${return_url}?gateway=khalti&tx_id=${transactionId}`,
            website_url: return_url.split("/").slice(0, 3).join("/"),
            amount: amount * 100,
            purchase_order_id: transactionId,
            purchase_order_name: `${fee_type} Fee - ${student_name}`,
          }),
        });

        if (khaltiResponse.ok) {
          const khaltiData = await khaltiResponse.json();
          paymentUrl = khaltiData.payment_url;
          paymentData = { url: paymentUrl, pidx: khaltiData.pidx };

          // Use service client for updating transaction reference
          const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
          await serviceClient
            .from("payment_transactions")
            .update({ gateway_reference: khaltiData.pidx })
            .eq("id", transaction.id);
        } else {
          throw new Error("Khalti payment initiation failed");
        }
        break;
      }

      case "imepay":
        throw new Error("IME Pay integration requires merchant agreement. Please use another payment method.");

      default:
        throw new Error("Invalid payment gateway");
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transactionId,
        payment_url: paymentUrl,
        payment_data: paymentData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
