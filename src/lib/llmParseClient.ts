export function extractBalanced(s: string): string | null {
  const startBrace = s.indexOf('{');
  const startBracket = s.indexOf('[');
  if (startBrace === -1 && startBracket === -1) return null;
  let start = -1;
  let open = '{';
  let close = '}';
  if (startBrace === -1) { start = startBracket; open = '['; close = ']'; }
  else if (startBracket === -1) start = startBrace;
  else { start = Math.min(startBrace, startBracket); open = s[start] === '[' ? '[' : '{'; close = open === '[' ? ']' : '}' }

  let depth = 0;
  let inString = false;
  let escapeNext = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === open) depth++;
    if (ch === close) {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function sanitizeForJson(candidate: string) {
  // Remove JS-style comments
  candidate = candidate.replace(/\/\/.*$/gm, '');
  candidate = candidate.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove trailing commas
  candidate = candidate.replace(/,\s*([}\]])/g, '$1');
  // Quote unquoted keys: { key: -> { "key":
  candidate = candidate.replace(/([,{\s])([a-zA-Z0-9_\-]+)\s*:/g, '$1"$2":');
  // Convert single-quoted strings to double-quoted
  candidate = candidate.replace(/'([^']*?)'/g, '"$1"');
  return candidate;
}

export function parseLLMJsonClient(text: string) {
  let parsed: any = null;
  let method: string | null = null;
  let snippet: string | null = null;

  // Try direct parse
  try { parsed = JSON.parse(text); method = 'direct'; snippet = text; return { parsed, method, snippet }; } catch (_) {}

  // Try code fence
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (m) {
    const candidate = m[1].trim();
    try { parsed = JSON.parse(candidate); method = 'code-fence'; snippet = candidate; return { parsed, method, snippet }; } catch (_) {
      try {
        const cleaned = sanitizeForJson(candidate);
        parsed = JSON.parse(cleaned); method = 'code-fence-sanitized'; snippet = cleaned; return { parsed, method, snippet };
      } catch (_) {}
    }
  }

  // Balanced braces
  const bal = extractBalanced(text);
  if (bal) {
    try { parsed = JSON.parse(bal); method = 'balanced'; snippet = bal; return { parsed, method, snippet }; } catch (_) {
      try { const cleaned = sanitizeForJson(bal); parsed = JSON.parse(cleaned); method = 'balanced-sanitized'; snippet = cleaned; return { parsed, method, snippet }; } catch (_) {}
    }
  }

  // Last resort: try to sanitize whole text
  try { const cleaned = sanitizeForJson(text); parsed = JSON.parse(cleaned); method = 'sanitized-all'; snippet = cleaned; return { parsed, method, snippet }; } catch (_) {}

  return { parsed: null, method: null, snippet: null };
}

export function normalizeParsedClient(p: any) {
  if (!p || typeof p !== 'object') return p;
  const out: any = { ...p };
  out.scores = out.scores || {};
  const aliases = { atsCompatibility: ['ats','atsCompatibility','atsScore','ats_score'], grammarQuality: ['grammar','grammarQuality'], keywordMatch: ['keywordMatch','keywords'] };
  for (const k of Object.keys(aliases)) {
    if (out.scores[k] == null) {
      for (const a of (aliases as any)[k]) if (out.scores[a] != null) { out.scores[k] = out.scores[a]; break; }
    }
    if (out.scores[k] != null && typeof out.scores[k] !== 'number') {
      const n = parseFloat(String(out.scores[k]).replace(/[^0-9.\-]/g, ''));
      out.scores[k] = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : out.scores[k];
    }
  }
  out.finalATSReadySummary = out.finalATSReadySummary || out.overallVerdict || '';
  out.detailedGuidelines = Array.isArray(out.detailedGuidelines) ? out.detailedGuidelines : (out.detailedGuidelines ? [out.detailedGuidelines] : []);
  out.missingCriticalKeywords = Array.isArray(out.missingCriticalKeywords) ? out.missingCriticalKeywords : (out.missingCriticalKeywords ? [out.missingCriticalKeywords] : []);
  out.topActionItems = Array.isArray(out.topActionItems) ? out.topActionItems : (out.topActionItems ? [out.topActionItems] : []);
  out.jobDescriptionReview = out.jobDescriptionReview || {};
  return out;
}
