import * as JSON5 from 'json5';

type ParseResult = {
  parsed: any | null;
  parseMethod: string | null;
  parsedSnippet: string | null;
  parseError: string | null;
};

function normalizeParsed(p: any) {
  if (!p || typeof p !== 'object') return p;
  const out: any = { ...p };
  out.scores = out.scores || {};
  const scoreAliases: Record<string, string[]> = {
    atsCompatibility: ['ats', 'atsCompatibility', 'atsScore'],
    grammarQuality: ['grammar', 'grammarQuality'],
    keywordMatch: ['keywordMatch', 'keywords', 'keyword_score'],
    impactAndMetrics: ['impactAndMetrics', 'impact'],
    readability: ['readability'],
    formattingStructure: ['formattingStructure', 'formatting']
  };

  for (const target of Object.keys(scoreAliases)) {
    if (out.scores[target] == null) {
      const aliases = scoreAliases[target];
      for (const a of aliases) {
        if (out.scores[a] != null) { out.scores[target] = out.scores[a]; break; }
        if ((p as any)[a] != null) { out.scores[target] = (p as any)[a]; break; }
      }
    }
    const v = out.scores[target];
    if (v != null && typeof v !== 'number') {
      const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
      out.scores[target] = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : out.scores[target];
    }
  }

  out.finalATSReadySummary = out.finalATSReadySummary || out.overallVerdict || '';
  out.detailedGuidelines = Array.isArray(out.detailedGuidelines) ? out.detailedGuidelines : (out.detailedGuidelines ? [out.detailedGuidelines] : []);
  out.missingCriticalKeywords = Array.isArray(out.missingCriticalKeywords) ? out.missingCriticalKeywords : (out.missingCriticalKeywords ? [out.missingCriticalKeywords] : []);
  out.topActionItems = Array.isArray(out.topActionItems) ? out.topActionItems : (out.topActionItems ? [out.topActionItems] : []);
  out.jobDescriptionReview = out.jobDescriptionReview || {};
  // Normalize detailedGuidelines entries into expected shape
  out.detailedGuidelines = (out.detailedGuidelines || []).map((g: any) => {
    const heading = g.heading || g.section || g.title || g.name || '';
    let whatATSLooksFor = g.whatATSLooksFor || g.feedback || g.whatToLookFor || g.description || '';

    // Extract explicit Action items embedded in feedback like '**Action:** ...'
    const actionMatches: string[] = [];
    if (typeof whatATSLooksFor === 'string') {
      const actionRe = /\*\*Action:\*\*\s*([^\n\r]+(?:[\n\r](?!\*\*Action\*\*).*)?)/gi;
      whatATSLooksFor = whatATSLooksFor.replace(actionRe, (_m, a) => { actionMatches.push(a.trim()); return ''; }).trim();
    }

    const whatToAdd = Array.isArray(g.whatToAdd) ? g.whatToAdd : (g.add ? (Array.isArray(g.add) ? g.add : String(g.add).split(/[,;]\s*/)) : (g.recommendations ? (Array.isArray(g.recommendations) ? g.recommendations : String(g.recommendations).split(/[,;]\s*/)) : []));
    const whatToAvoid = Array.isArray(g.whatToAvoid) ? g.whatToAvoid : (g.avoid ? (Array.isArray(g.avoid) ? g.avoid : String(g.avoid).split(/[,;]\s*/)) : []);
    const recommendedVocabulary = Array.isArray(g.recommendedVocabulary) ? g.recommendedVocabulary : (g.vocabulary ? (Array.isArray(g.vocabulary) ? g.vocabulary : String(g.vocabulary).split(/[,;]\s*/)) : (g.recommendedWords ? (Array.isArray(g.recommendedWords) ? g.recommendedWords : String(g.recommendedWords).split(/[,;]\s*/)) : []));

    let exampleImprovement = null;
    if (g.exampleImprovement) exampleImprovement = g.exampleImprovement;
    else if (g.example) {
      if (typeof g.example === 'object' && (g.example.before || g.example.after)) exampleImprovement = g.example;
      else if (typeof g.example === 'string') {
        const before = (g.example.match(/Before:\s*([\s\S]*?)\s*(?:After:|$)/i) || [])[1];
        const after = (g.example.match(/After:\s*([\s\S]*?)$/i) || [])[1];
        if (before || after) exampleImprovement = { before: (before||'').trim(), after: (after||'').trim() };
      }
    }

    // Push any found actionMatches to topActionItems
    if (actionMatches.length) out.topActionItems = Array.from(new Set([...(out.topActionItems||[]), ...actionMatches]));

    return {
      heading,
      whatATSLooksFor,
      whatToAdd,
      whatToAvoid,
      recommendedVocabulary,
      exampleImprovement
    };
  });

  // Normalize missingCriticalKeywords and topActionItems to arrays of strings
  const toStringArray = (v:any) => {
    if (!v && v !== 0) return [];
    if (Array.isArray(v)) return v.map(String);
    return String(v).split(/[;,\n]+/).map(s => s.trim()).filter(Boolean);
  };
  out.missingCriticalKeywords = toStringArray(out.missingCriticalKeywords);
  out.topActionItems = Array.isArray(out.topActionItems) ? out.topActionItems.map(String) : toStringArray(out.topActionItems);

  // Normalize jobDescriptionReview fields (aliases -> canonical keys)
  const jd = out.jobDescriptionReview || {};
  jd.jdClarityScore = jd.jdClarityScore ?? jd.clarityScore ?? jd.clarity ?? jd.jdClarity ?? null;
  jd.jdATSQuality = jd.jdATSQuality ?? jd.atsQuality ?? jd.jdATS ?? jd.atsQuality ?? null;
  jd.jdRealism = jd.jdRealism ?? jd.realism ?? jd.jdRealism ?? null;
  jd.jdRedFlags = jd.jdRedFlags || jd.redFlags || jd.criticalKeywords || jd.warn || jd.warnings || jd.flags || [];
  jd.jdMissingDetails = jd.jdMissingDetails || jd.missingDetails || jd.missing || [];
  jd.jdImprovementSuggestions = jd.jdImprovementSuggestions || jd.improvementSuggestions || jd.improvements || jd.suggestions || [];

  // Ensure arrays
  jd.jdRedFlags = Array.isArray(jd.jdRedFlags) ? jd.jdRedFlags.map(String) : toStringArray(jd.jdRedFlags);
  jd.jdMissingDetails = Array.isArray(jd.jdMissingDetails) ? jd.jdMissingDetails.map(String) : toStringArray(jd.jdMissingDetails);
  jd.jdImprovementSuggestions = Array.isArray(jd.jdImprovementSuggestions) ? jd.jdImprovementSuggestions.map(String) : toStringArray(jd.jdImprovementSuggestions);
  out.jobDescriptionReview = jd;
  return out;
}

export function parseLLMJson(text: string): ParseResult {
  let parsed: any = null;
  let parseMethod: string | null = null;
  let parsedSnippet: string | null = null;
  let parseError: string | null = null;

  // Strategy 1: strict JSON, then lenient JSON5 on full text
  try {
    parsed = JSON.parse(text);
    parseMethod = 'direct';
    parsedSnippet = text;
  } catch (e) {
    try {
      parsed = JSON5.parse(text);
      parseMethod = 'json5-direct';
      parsedSnippet = text;
    } catch (eJson5) {
      // continue
    }
  }

  // Strategy 2: code fence
  if (!parsed) {
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      const candidate = fence[1].trim();
      try { parsed = JSON.parse(candidate); parseMethod = 'code-fence'; parsedSnippet = candidate; }
      catch (e2) {
        try { parsed = JSON5.parse(candidate); parseMethod = 'json5-code-fence'; parsedSnippet = candidate; }
        catch (e3) { parseError = String(e2); }
      }
    }
  }

  // Strategy 3: balanced braces
  if (!parsed) {
    try {
      const extractBalanced = (s: string): string | null => {
        const startBrace = s.indexOf('{');
        const startBracket = s.indexOf('[');
        let start = -1;
        let open = '{';
        let close = '}';
        if (startBrace === -1 && startBracket === -1) return null;
        if (startBrace === -1) { start = startBracket; open = '['; close = ']'; }
        else if (startBracket === -1) { start = startBrace; }
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
            if (depth === 0) {
              return s.slice(start, i + 1);
            }
          }
        }
        return null;
      };

      const candidate = extractBalanced(text);
      if (candidate) {
        parsedSnippet = candidate;
        try { parsed = JSON.parse(candidate); parseMethod = 'balanced-braces'; }
        catch (e3) {
          try { parsed = JSON5.parse(candidate); parseMethod = 'json5-balanced'; }
          catch (e4) { parseError = String(e3); }
        }
      }
    } catch (balErr: any) {
      // ignore
    }
  }

  if (parsed) {
    return { parsed: normalizeParsed(parsed), parseMethod, parsedSnippet, parseError };
  }

  return { parsed: null, parseMethod: parseMethod || null, parsedSnippet, parseError };
}

export default parseLLMJson;
