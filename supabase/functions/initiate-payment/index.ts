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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { gateway, student_fee_id, amount, student_name, fee_type, return_url }: PaymentRequest = await req.json();

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Get student_id from student_fees
    const { data: feeData, error: feeError } = await supabase
      .from("student_fees")
      .select("student_id")
      .eq("id", student_fee_id)
      .single();

    if (feeError || !feeData) {
      throw new Error("Student fee not found");
    }

    // Store transaction in database
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
      case "esewa":
        // eSewa payment integration
        // In production, use actual eSewa merchant credentials
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

      case "khalti":
        // Khalti payment integration
        // In production, use actual Khalti secret key
        const khaltiResponse = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
          method: "POST",
          headers: {
            "Authorization": `Key ${Deno.env.get("KHALTI_SECRET_KEY") || "test_secret_key"}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            return_url: `${return_url}?gateway=khalti&tx_id=${transactionId}`,
            website_url: return_url.split("/").slice(0, 3).join("/"),
            amount: amount * 100, // Khalti expects paisa
            purchase_order_id: transactionId,
            purchase_order_name: `${fee_type} Fee - ${student_name}`,
          }),
        });

        if (khaltiResponse.ok) {
          const khaltiData = await khaltiResponse.json();
          paymentUrl = khaltiData.payment_url;
          paymentData = { url: paymentUrl, pidx: khaltiData.pidx };

          // Update transaction with Khalti reference
          await supabase
            .from("payment_transactions")
            .update({ gateway_reference: khaltiData.pidx })
            .eq("id", transaction.id);
        } else {
          // For testing, create a mock URL
          paymentUrl = `${return_url}?gateway=khalti&status=mock&tx_id=${transactionId}`;
          paymentData = { url: paymentUrl, mock: true };
        }
        break;

      case "imepay":
        // IME Pay integration
        // In production, use actual IME Pay credentials
        const imepayUrl = "https://stg.imepay.com.np:7979/api/Web/GetToken";
        paymentUrl = `${return_url}?gateway=imepay&status=mock&tx_id=${transactionId}`;
        paymentData = { 
          url: paymentUrl, 
          mock: true,
          note: "IME Pay integration requires merchant agreement"
        };
        break;

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
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
