import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import crypto from "crypto";
import { getPricing } from "@/helpers/getPricing";

connect();

// POST - Handle Instamojo webhook
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract all fields
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("Webhook received:", data);

    const {
      payment_id,
      payment_request_id,
      status,
      amount,
      buyer,
      purpose,
      mac,
    } = data;

    // Validate MAC (Message Authentication Code)
    const salt = process.env.INSTAMOJO_SALT;
    if (salt && mac) {
      // Create message string from sorted keys (excluding mac)
      const sortedKeys = Object.keys(data)
        .filter(k => k !== 'mac')
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      
      const message = sortedKeys.map(k => data[k]).join('|');
      const calculatedMac = crypto
        .createHmac('sha1', salt)
        .update(message)
        .digest('hex');

      if (mac !== calculatedMac) {
        console.error("Invalid MAC signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    // Check payment status
    if (status !== "Credit") {
      console.log("Payment failed or pending:", status);
      return NextResponse.json({ message: "Payment not successful" }, { status: 200 });
    }

    // Verify the amount paid is correct using dynamic pricing
    const pricing = await getPricing();
    const paidAmount = parseFloat(amount);

    // Handle premium purchase purpose only
    if (purpose?.startsWith("PREMIUM_")) {
      const EXPECTED_AMOUNT = pricing.premium;
      if (paidAmount < EXPECTED_AMOUNT) {
        console.error(`Invalid amount: expected ₹${EXPECTED_AMOUNT}, got ₹${paidAmount}`);
        return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
      }

      const userId = purpose.replace("PREMIUM_", "");
      if (!userId) {
        console.error("Invalid purpose format:", purpose);
        return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            "purchases.premium": {
              purchased: true,
              purchasedAt: new Date(),
              paymentId: payment_id,
              paymentRequestId: payment_request_id,
              amount: parseFloat(amount) || pricing.premium,
            }
          }
        },
        { new: true }
      );

      if (!user) {
        console.error("User not found:", userId);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log(`Premium payment successful for user ${userId}, payment_id: ${payment_id}`);

      return NextResponse.json({ success: true, message: "Payment recorded successfully" });
    }



    // Unknown purpose
    console.error("Unknown payment purpose:", purpose);
    return NextResponse.json({ error: "Unknown purpose" }, { status: 400 });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
