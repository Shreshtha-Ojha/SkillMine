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
