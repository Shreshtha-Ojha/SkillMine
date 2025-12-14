import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { extractTextFromPDF, extractTextWithOCR } from '@/lib/server/pdfExtract';

function simpleGrammarScore(text: string) {
  if (!text) return 0;
  const sentences = text.split(/\.|\n|\?|!/).map(s => s.trim()).filter(Boolean);
  const avgLen = sentences.length ? Math.round(text.split(/\s+/).length / sentences.length) : 0;
  const penalty = Math.min(30, Math.max(0, (avgLen - 20) * 2));
  const issues = (text.match(/\.{2,}|,,+|!!+/g) || []).length * 2;
  const score = Math.max(0, 100 - penalty - issues);
  return score;
}

function simpleATSScore(resume: string, jd: string) {
  if (!resume) return 0;
  const jdWords = (jd || '').toLowerCase().split(/\W+/).filter(Boolean);
  const resumeWords = resume.toLowerCase();
  const matches = jdWords.filter(w => resumeWords.includes(w)).length;
  const pct = jdWords.length ? Math.round((matches / jdWords.length) * 100) : 30;
  const lengthScore = Math.min(100, Math.max(20, Math.round(Math.min(1, resume.split(/\s+/).length / 300) * 100)));
  return Math.round((pct * 0.7) + (lengthScore * 0.3));
}

export async function POST(req: NextRequest) {
  try {
    // Accept either form-data file or JSON body with resumeText
    const contentType = req.headers.get('content-type') || '';
    let resumeText = '';
    let jd = '';
    let pages = 0;
    let ocrPerformed = false;

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      const f = fd.get('file') as File | null;
      jd = String(fd.get('jd') || '');
      const extractOnlyFlag = Boolean(fd.get('extractOnly'));
      if (!f) return NextResponse.json({ error: 'file required' }, { status: 400 });
      const ab = await f.arrayBuffer();
      const buf = Buffer.from(ab);
      let res = await extractTextFromPDF(buf) as { text: string; pages: number };
      resumeText = res.text || '';
      pages = res.pages || 0;

      // If PDF extraction returns very little text, try OCR
      if ((resumeText || '').replace(/\s+/g, '').length < 200) {
        const o: any = await extractTextWithOCR(buf);
        if (o.ocrUnavailable) {
          // OCR not available on this host; keep extracted text (may be empty)
        } else {
          resumeText = o.text || '';
          pages = o.pages || pages;
          ocrPerformed = true;
        }
      }

      // Fallbacks: try UTF-8 decode or DOCX XML extraction for common docx/text files
      if ((resumeText || '').replace(/\s+/g, '').length < 80) {
        try {
          const maybe = buf.toString('utf8');
          if ((maybe || '').replace(/\s+/g, '').length > 80) {
            resumeText = maybe;
          }
        } catch (_) {}
      }

      // If buffer contains DOCX XML-like tags, try to extract <w:t> text nodes
      try {
        const asStr = buf.toString('utf8');
        if (asStr.includes('<w:t')) {
          const matches = Array.from(asStr.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)).map(m => m[1].replace(/<[^>]+>/g, ''));
          if (matches.length > 0) {
            const docxText = matches.join('\n');
            if (docxText.replace(/\s+/g, '').length > (resumeText || '').replace(/\s+/g, '').length) {
              resumeText = docxText;
            }
          }
        }
      } catch (_) {}

    } else {
      // Try JSON body: { resumeText, jd }
      const body = await req.json().catch(() => ({}));
      resumeText = String(body.resumeText || '');
      jd = String(body.jd || '');
      if (!resumeText) return NextResponse.json({ error: 'resumeText required' }, { status: 400 });
    }

    const { scoreResume } = await import('@/lib/server/atsScorer');
    const report = scoreResume(resumeText, jd);

    return NextResponse.json({ ...report, extractedText: resumeText, extractedTextLength: resumeText.length, ocrPerformed, pages });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'processing failed' }, { status: 500 });
  }
}

