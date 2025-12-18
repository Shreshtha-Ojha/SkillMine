import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import PricingSettings from "@/models/pricingSettingsModel";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

connect();

// Helper to verify admin
async function verifyAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isAdmin) return null;
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Get current pricing (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    let pricing = await PricingSettings.findOne({ key: "pricing" });
    
    const origin = request.headers.get("origin") || "*";

    return NextResponse.json(
      {
        success: true,
        pricing: pricing ? { premium: pricing.premium ?? null, updatedAt: pricing.updatedAt } : null,
      },
      { headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache", "Expires": "0" } }
    );
  } catch (error: any) {
    console.error("Error fetching pricing:", error);
    const origin = request.headers.get("origin") || "*";
    return NextResponse.json(
      { error: "Failed to fetch pricing" },
      { status: 500, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache", "Expires": "0" } }
    );
  }
}

// PUT - Update pricing (admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { premium } = body;

    // Validate minimum price (Instamojo requires minimum ₹9)
    const minPrice = 9;
    if ((premium || 0) < minPrice) {
      return NextResponse.json(
        { error: `Minimum price is ₹${minPrice} (payment gateway requirement)` },
        { status: 400 }
      );
    }

    // Update or create pricing
    let pricing = await PricingSettings.findOne({ key: "pricing" });
    
    // Log incoming update for diagnostics
    console.log(`Admin ${admin._id} requested pricing update -> ${premium}`);

    // Use findOneAndUpdate with upsert to avoid pre-save hook issues and ensure atomic update
    const updated = await PricingSettings.findOneAndUpdate(
      { key: "pricing" },
      { $set: { premium, updatedBy: admin._id.toString() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    // Log post-update value
    console.log("Pricing after update:", updated);

    const origin = request.headers.get("origin") || "*";
    return NextResponse.json({
      success: true,
      message: "Pricing updated successfully",
      pricing: {
        premium: updated?.premium,
        updatedAt: updated?.updatedAt,
        id: updated?._id
      },
    }, { headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache", "Expires": "0" } });
  } catch (error: any) {
    console.error("Error updating pricing:", error);
    const origin = request.headers.get("origin") || "*";
    return NextResponse.json(
      { error: "Failed to update pricing" },
      { status: 500, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache", "Expires": "0" } }
    );
  }
}

// OPTIONS - handle preflight CORS checks (browsers send OPTIONS before PUT with JSON)
export async function OPTIONS(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || "*";
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to handle preflight" }, { status: 500 });
  }
}
