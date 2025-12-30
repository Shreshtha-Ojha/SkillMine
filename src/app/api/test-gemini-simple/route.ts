import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// NOTE: This is a debug/test endpoint - consider removing in production
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY not set in environment",
      }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-09-2025",
      contents: "Say 'Hello, the API is working!' in exactly those words.",
    });

    return NextResponse.json({
      success: true,
      message: "Gemini API is working!",
      response: response.text,
    });

  } catch (error: any) {
    console.error("[TestGemini] Error:", error.message);

    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
    }, { status: 500 });
  }
}
