const JSON5 = require('json5');

function parseLLMJson(text) {
  let parsed = null;
  let parseMethod = null;
  let parsedSnippet = null;
  let parseError = null;

  try { parsed = JSON.parse(text); parseMethod = 'direct'; parsedSnippet = text; }
  catch (e) {
    try { parsed = JSON5.parse(text); parseMethod = 'json5-direct'; parsedSnippet = text; } catch (_) {}
  }

  if (!parsed) {
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      const candidate = fence[1].trim();
      try { parsed = JSON.parse(candidate); parseMethod = 'code-fence'; parsedSnippet = candidate; }
      catch (e2) { try { parsed = JSON5.parse(candidate); parseMethod = 'json5-code-fence'; parsedSnippet = candidate; } catch (e3) { parseError = String(e2); } }
    }
  }

  if (!parsed) {
    const extractBalanced = (s) => {
      const startBrace = s.indexOf('{');
      const startBracket = s.indexOf('[');
      let start = -1; let open = '{'; let close = '}';
      if (startBrace === -1 && startBracket === -1) return null;
      if (startBrace === -1) { start = startBracket; open = '['; close = ']'; }
      else if (startBracket === -1) start = startBrace;
      else { start = Math.min(startBrace, startBracket); open = s[start] === '[' ? '[' : '{'; close = open === '[' ? ']' : '}' }
      let depth = 0; let inString = false; let escapeNext = false;
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
    };
    const candidate = extractBalanced(text);
    if (candidate) {
      parsedSnippet = candidate;
      try { parsed = JSON.parse(candidate); parseMethod = 'balanced-braces'; }
      catch (e3) { try { parsed = JSON5.parse(candidate); parseMethod = 'json5-balanced'; } catch (e4) { parseError = String(e3); } }
    }
  }

  return { parsed, parseMethod, parsedSnippet, parseError };
}

const samples = [
  '```json { "scores": { "atsCompatibility": 65, "grammarQuality": 88, "keywordMatch": 5 } }',
  'Some text ```json\n{ "scores": { "atsCompatibility": 65 } }\n```',
  '{ scores: { atsCompatibility: 65, grammarQuality: 88 }, overallVerdict: "OK" }',
  '```json\n{\n  "scores": { "atsCompatibility": "85" , },\n}\n```',
  // Complex guideline sample similar to screenshot
  `{"scores": { "atsCompatibility": 65, "grammarQuality": 88, "keywordMatch": 5 }, "detailedGuidelines": [ { "section": "General Resume Strategy (Given JD Mismatch)", "feedback": "This resume is for a student seeking an internship or junior role, while the JD explicitly asks for an 'ML eng with 10 y rexp'. This is a fundamental mismatch that will lead to immediate rejection by both ATS and human screeners. **Action:** Do NOT apply to this specific job description. Focus on applying to roles that align with your actual experience level (intern, junior developer, junior ML engineer)." } ], "jobDescriptionReview": { "role": "Machine Learning Engineer", "experienceLevel": "10 years", "criticalKeywords": ["ML eng","10 y rexp","Machine Learning"] } }`
];

function normalizeLocal(p) {
  if (!p || typeof p !== 'object') return p;
  const out = { ...p };
  out.detailedGuidelines = (out.detailedGuidelines || []).map(g => {
    const heading = g.section || g.heading || g.title || '';
    let whatATSLooksFor = g.feedback || g.whatATSLooksFor || g.description || '';
    const actionMatches = [];
    if (typeof whatATSLooksFor === 'string') {
      const actionRe = /\*\*Action:\*\*\s*([^\n\r]+(?:[\n\r](?!\*\*Action\*\*).*)?)/gi;
      whatATSLooksFor = whatATSLooksFor.replace(actionRe, (_m, a) => { actionMatches.push(a.trim()); return ''; }).trim();
    }
    return { heading, whatATSLooksFor, whatToAdd: [], whatToAvoid: [], recommendedVocabulary: [], exampleImprovement: null, _extractedActions: actionMatches };
  });
  if (out.detailedGuidelines) {
    out.topActionItems = Array.from(new Set([...(out.topActionItems||[]), ...out.detailedGuidelines.flatMap(g => g._extractedActions || [])]));
  }
  if (out.jobDescriptionReview) {
    const jd = out.jobDescriptionReview;
    jd.jdRedFlags = jd.redFlags || jd.criticalKeywords || [];
    jd.jdMissingDetails = jd.missingDetails || [];
    out.jobDescriptionReview = jd;
  }
  return out;
}

for (const s of samples) {
  console.log('--- SAMPLE ---');
  const r = parseLLMJson(String(s));
  console.log('method:', r.parseMethod);
  console.log('error:', r.parseError);
  const normalized = normalizeLocal(r.parsed || {});
  console.log('normalized:', JSON.stringify(normalized, null, 2));
}
