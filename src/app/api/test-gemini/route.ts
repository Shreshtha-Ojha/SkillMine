import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Gemini API with @google/genai SDK...");
    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: "GEMINI_API_KEY not configured in environment" 
      }, { status: 500 });
    }

    const testPrompt = `You are a test assistant. Simply respond with: "Hello, Gemini is working!"`;

    try {
      const response = await generateContent(testPrompt);
      
      return NextResponse.json({
        success: true,
        message: "Gemini API is working!",
        model: "gemini-2.5-flash-preview-09-2025",
        geminiResponse: response
      });
    } catch (error) {
      console.error("Gemini API error:", error);
      const message = error instanceof Error ? error.message : "An error occurred";
      return NextResponse.json({
        success: false,
        error: "Gemini API call failed",
        details: message
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Test Gemini Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }
}
