import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { extractTextWithOCR } from '@/lib/server/pdfExtract';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Convert File to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log(`Extracting text from: ${file.name}, size: ${uint8Array.length} bytes`);

    // Extract text using unpdf
    const result = await extractText(uint8Array, { mergePages: true });

    // Handle both array and string response
    let textContent = Array.isArray(result.text) ? result.text.join("\n") : String(result.text || "");
    let pageCount = result.totalPages || 0;

    console.log(`Extracted ${textContent.length} characters from ${pageCount} pages`);

    // Check if OCR is requested or suggested
    const useOCR = String(formData.get('useOCR') || '') === '1' || String(formData.get('useOCR') || '').toLowerCase() === 'true';
    let ocrSuggested = false;
    let ocrUsed = false;
    let ocrUnavailable = false;

    if ((textContent || '').replace(/\s+/g, '').length < 200) {
      ocrSuggested = true;
    }

    if (useOCR || ocrSuggested && useOCR) {
      // Try OCR fallback
      try {
        const ocrRes: any = await extractTextWithOCR(Buffer.from(uint8Array));
        if (ocrRes?.ocrUnavailable) {
          ocrUnavailable = true;
        } else {
          textContent = ocrRes.text || textContent;
          pageCount = ocrRes.pages || pageCount;
          ocrUsed = true;
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('OCR extraction failed:', message);
        ocrUnavailable = true;
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      pageCount,
      textLength: textContent.length,
      text: textContent,
      ocrSuggested,
      ocrUsed,
      ocrUnavailable,
    });

  } catch (error) {
    console.error("PDF extraction error:", error);
    const message = error instanceof Error ? error.message : "Failed to extract text from PDF";
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}
