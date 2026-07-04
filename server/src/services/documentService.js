/**
 * AI Lease & Property Document Analyzer: extracts text from an uploaded
 * PDF/DOCX and produces a structured, professional analysis via Gemini —
 * with a keyword-based heuristic fallback when no AI key is configured,
 * matching the rest of the platform's "always functional" AI pattern.
 */

// pdf-parse@1's index.js has a debug-mode branch guarded by `!module.parent`
// that (a) crashes on its own test fixture and (b) is only reliably skipped
// when required through a real CJS module context — which a plain ESM
// `import` under Node's interop doesn't provide. createRequire gives it one.
import { createRequire } from 'module';
import mammoth from 'mammoth';

const pdfParse = createRequire(import.meta.url)('pdf-parse');
import { aiAvailable, generateJson } from './aiService.js';

const MAX_TEXT_CHARS = 12000;

/**
 * @param {Buffer} buffer
 * @param {'pdf'|'docx'} fileType
 * @returns {Promise<string>}
 */
export async function extractText(buffer, fileType) {
  if (fileType === 'pdf') {
    const { text } = await pdfParse(buffer);
    return text.trim();
  }
  if (fileType === 'docx') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim();
  }
  throw new Error('Unsupported file type');
}

const RISK_KEYWORDS = [
  { pattern: /non[-\s]?refundable/i, clause: 'Non-refundable payment clause', level: 'risky', explanation: 'Money paid under this clause will not be returned under any circumstances — confirm exactly what it covers before signing.' },
  { pattern: /automatic(ally)?\s+renew/i, clause: 'Automatic renewal', level: 'attention', explanation: 'The lease renews without action unless you opt out in time — note the exact opt-out deadline.' },
  { pattern: /as[-\s]?is/i, clause: '"As-is" condition clause', level: 'attention', explanation: 'You may be accepting the property\'s current condition, including undisclosed issues — inspect thoroughly first.' },
  { pattern: /waiv(e|er)/i, clause: 'Waiver of rights', level: 'risky', explanation: 'You may be giving up a legal right or protection — have this reviewed before agreeing.' },
  { pattern: /sole\s+discretion/i, clause: 'Landlord/seller sole discretion', level: 'risky', explanation: 'A one-sided decision-making clause with no defined standard — ask for clearer, mutual criteria.' },
  { pattern: /late\s+(fee|payment|penalty)/i, clause: 'Late payment penalty', level: 'attention', explanation: 'Check the fee amount and grace period are reasonable and clearly capped.' },
  { pattern: /eviction/i, clause: 'Eviction terms', level: 'attention', explanation: 'Review the exact conditions and notice required before eviction proceedings can start.' },
  { pattern: /early\s+termination/i, clause: 'Early termination penalty', level: 'attention', explanation: 'Confirm the exact cost of ending the agreement early.' },
  { pattern: /security\s+deposit/i, clause: 'Security deposit terms', level: 'safe', explanation: 'Standard clause — confirm the deposit amount and refund conditions are clearly stated.' },
  { pattern: /maintenance/i, clause: 'Maintenance responsibility', level: 'safe', explanation: 'Confirm which repairs fall to the tenant versus the landlord.' },
];

/**
 * Best-effort field extraction without an LLM — used only when no AI
 * provider is configured. Deliberately conservative; flags itself as such.
 * @param {string} text
 */
function heuristicExtraction(text) {
  const find = (regex) => {
    const m = text.match(regex);
    return m ? m[0].replace(/\s+/g, ' ').trim().slice(0, 150) : 'Not specified — review document manually';
  };

  const extraction = {
    rentAmount: find(/rent[^.\n]{0,80}?[$£€]\s?[\d,]+(\.\d+)?|[$£€]\s?[\d,]+(\.\d+)?\s?(per\s+month|\/mo|monthly)?[^.\n]{0,40}?rent/i),
    securityDeposit: find(/security\s+deposit[^.\n]{0,100}/i),
    leaseDuration: find(/(lease|term)[^.\n]{0,20}(of|is|shall be)?[^.\n]{0,40}?(\d+\s?(month|year)s?)/i),
    noticePeriod: find(/notice\s+(period|of)[^.\n]{0,100}/i),
    renewalTerms: find(/renew(al|s)?[^.\n]{0,120}/i),
    maintenanceResponsibility: find(/maintenance[^.\n]{0,150}/i),
    utilityResponsibility: find(/utilit(y|ies)[^.\n]{0,150}/i),
    hiddenCharges: find(/(additional|extra|hidden)\s+(fee|charge)s?[^.\n]{0,120}/i),
    latePaymentPenalty: find(/late\s+(fee|payment|penalty)[^.\n]{0,120}/i),
    terminationConditions: find(/terminat(e|ion)[^.\n]{0,150}/i),
  };

  const riskAnalysis = [];
  let score = 78;
  for (const rule of RISK_KEYWORDS) {
    if (rule.pattern.test(text)) {
      riskAnalysis.push({ clause: rule.clause, level: rule.level, explanation: rule.explanation });
      if (rule.level === 'risky') score -= 12;
      else if (rule.level === 'attention') score -= 5;
    }
  }
  const safetyScore = Math.max(10, Math.min(95, score));

  return {
    extraction,
    riskAnalysis,
    safetyScore,
    summary:
      'This is an automated keyword-based scan (no AI key configured), so treat it as a starting point, not legal advice. ' +
      'It flags common risk phrases found in the document and extracts likely values for key terms — always verify against the full text.',
    importantClauses: riskAnalysis.map((r) => r.clause),
    negotiationPoints: riskAnalysis.filter((r) => r.level !== 'safe').map((r) => `Ask to clarify or amend: ${r.clause}`),
    questionsForLandlord: [
      'Can you confirm the exact rent amount and what is included?',
      'What is the process and timeline for getting the security deposit back?',
      'What counts as normal wear and tear versus tenant damage?',
      'Who is responsible for each specific utility and maintenance item?',
    ],
    aiGenerated: false,
  };
}

const SYSTEM_PROMPT = `You are a professional real-estate legal analyst reviewing a lease, rental agreement, or property sale document for a tenant/buyer (not a lawyer, but a careful, plain-English advisor).

Analyze the provided document text and respond with ONLY a JSON object matching exactly this shape (no markdown, no extra keys):

{
  "extraction": {
    "rentAmount": string,
    "securityDeposit": string,
    "leaseDuration": string,
    "noticePeriod": string,
    "renewalTerms": string,
    "maintenanceResponsibility": string,
    "utilityResponsibility": string,
    "hiddenCharges": string,
    "latePaymentPenalty": string,
    "terminationConditions": string
  },
  "riskAnalysis": [
    { "clause": string, "level": "safe" | "attention" | "risky", "explanation": string }
  ],
  "safetyScore": number,
  "summary": string,
  "importantClauses": [string],
  "negotiationPoints": [string],
  "questionsForLandlord": [string]
}

Rules:
- If a field isn't in the document, use "Not specified in this document" — never invent numbers or terms.
- riskAnalysis should cover 4-10 of the most relevant clauses, mixing safe/attention/risky based on real content.
- safetyScore is 0-100 (100 = extremely tenant/buyer-friendly, 0 = very risky), based on the actual clauses found.
- summary is 3-5 sentences in plain English, no legal jargon.
- importantClauses: 3-8 short bullet-style phrases (not full sentences).
- negotiationPoints: 3-6 concrete, actionable points the user could raise.
- questionsForLandlord: 4-8 direct questions the user should ask before signing.
- Never provide legal advice as fact — this is informational analysis, not a legal opinion.`;

/**
 * @param {string} text extracted document text
 * @param {string} [documentType]
 */
export async function analyzeLeaseDocument(text, documentType = 'other') {
  if (!aiAvailable()) return heuristicExtraction(text);

  const truncated = text.slice(0, MAX_TEXT_CHARS);
  try {
    const result = await generateJson({
      system: SYSTEM_PROMPT,
      prompt: `Document type: ${documentType}\n\nDocument text:\n"""\n${truncated}\n"""`,
      temperature: 0.3,
      maxTokens: 2048,
    });

    return {
      extraction: { ...heuristicExtraction(truncated).extraction, ...result.extraction },
      riskAnalysis: Array.isArray(result.riskAnalysis) ? result.riskAnalysis.slice(0, 12) : [],
      safetyScore: Math.max(0, Math.min(100, Number(result.safetyScore) || 50)),
      summary: result.summary || '',
      importantClauses: Array.isArray(result.importantClauses) ? result.importantClauses.slice(0, 10) : [],
      negotiationPoints: Array.isArray(result.negotiationPoints) ? result.negotiationPoints.slice(0, 8) : [],
      questionsForLandlord: Array.isArray(result.questionsForLandlord) ? result.questionsForLandlord.slice(0, 10) : [],
      aiGenerated: true,
    };
  } catch (error) {
    console.error('AI document analysis failed, using heuristic fallback:', error.message);
    return heuristicExtraction(text);
  }
}
