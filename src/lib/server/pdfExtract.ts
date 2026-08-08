/**
 * Purpose
 * -------
 * Server-side PDF text extraction for resume processing, with an optional
 * OCR fallback for image-based PDFs.
 *
 * Responsibilities
 * - Extract selectable text from a PDF buffer using pdfjs-dist.
 * - Fall back to OCR (tesseract.js + canvas) when the PDF contains scanned images
 *   with no embedded text layer.
 *
 * Used by
 * - /api/resume/extract-text — powers the ATS checker and resume screening flows.
 * - /api/ats/process — extracts raw text before sending to Gemini for analysis.
 *
 * Interview Talking Points
 * - `eval('require')` is used instead of a top-level `require` because Next.js
 *   bundles server code through webpack, and optional peer dependencies like
 *   `pdfjs-dist` and `tesseract.js` are not guaranteed to be installed. Dynamic
 *   require lets the module load successfully even if those packages are absent,
 *   returning an empty result instead of crashing the server.
 * - The function returns `{ text: '', pages: 0 }` on failure rather than throwing
 *   so callers can degrade gracefully (e.g. show a "could not extract" message)
 *   without wrapping every call in try/catch.
 *
 * TODO: Replace eval-based dynamic require with a proper optional import pattern
 * or move PDF extraction to a dedicated microservice to avoid bundling pdfjs
 * in the main Next.js server bundle.
 */

import type { Buffer } from 'buffer';

// Server-side PDF extraction using pdfjs-dist when available.
export async function extractTextFromPDF(buffer: Buffer) {
  let pdfjsLib: any = null;
  try {
    const r = eval('require');
    pdfjsLib = r('pdfjs-dist/legacy/build/pdf');
  } catch (e) {
    try {
      const r = eval('require');
      pdfjsLib = r('pdfjs-dist');
    } catch (e2) {
      // If pdfjs isn't installed or resolvable, return empty text so callers can handle gracefully
      return { text: '', pages: 0 };
    }
  }

  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((it: any) => (it.str || '')).join(' ');
    fullText += pageText + '\n\n';
  }
  return { text: fullText.trim(), pages: doc.numPages };
}

// OCR fallback using canvas + tesseract.js if installed. If not available, indicate OCR is unavailable.
export async function extractTextWithOCR(buffer: Buffer) {
  let pdfjsLib: any = null;
  try {
    const r = eval('require');
    pdfjsLib = r('pdfjs-dist/legacy/build/pdf');
  } catch (e) {
    try { const r = eval('require'); pdfjsLib = r('pdfjs-dist'); } catch (e2) { return { text: '', pages: 0, ocrUnavailable: true } as any; }
  }

  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  let fullText = '';
  let createCanvas: any = null;
  let Tesseract: any = null;
  try {
    const r = eval('require');
    const canvasMod = r('canvas');
    createCanvas = canvasMod.createCanvas;
    const tmod = r('tesseract.js');
    Tesseract = tmod?.default || tmod;
  } catch (e) {
    return { text: '', pages: doc.numPages, ocrUnavailable: true } as any;
  }

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx as any, viewport }).promise;
    const imgBuf = canvas.toBuffer('image/png');
    const res = await Tesseract.recognize(imgBuf, 'eng', { logger: () => {} });
    fullText += (res.data?.text || '') + '\n\n';
  }
  return { text: fullText.trim(), pages: doc.numPages };
}
