import { env } from '../config/env.js';

/**
 * Provider-agnostic LLM access. Prefers Gemini, falls back to OpenAI.
 * Every caller must handle aiAvailable() === false with a heuristic fallback —
 * the platform stays fully functional without any API key.
 */

export const aiAvailable = () => Boolean(env.GEMINI_API_KEY || env.OPENAI_API_KEY);
export const aiProvider = () =>
  env.GEMINI_API_KEY ? 'gemini' : env.OPENAI_API_KEY ? 'openai' : null;

const TIMEOUT_MS = 20000;

const withTimeout = async (url, options) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

async function geminiChat({ system, messages, json, temperature, maxTokens }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
  const body = {
    ...(system && { systemInstruction: { parts: [{ text: system }] } }),
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(json && { responseMimeType: 'application/json' }),
    },
  };

  const res = await withTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function openaiChat({ system, messages, json, temperature, maxTokens }) {
  const res = await withTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature,
      max_tokens: maxTokens,
      ...(json && { response_format: { type: 'json_object' } }),
      messages: [...(system ? [{ role: 'system', content: system }] : []), ...messages],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OpenAI API error ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('OpenAI returned an empty response');
  return text;
}

export async function chat({ system, messages, json = false, temperature = 0.7, maxTokens = 1024 }) {
  const args = { system, messages, json, temperature, maxTokens };
  if (env.GEMINI_API_KEY) return geminiChat(args);
  if (env.OPENAI_API_KEY) return openaiChat(args);
  throw new Error('No AI provider configured');
}

export async function generate({ system, prompt, ...rest }) {
  return chat({ system, messages: [{ role: 'user', content: prompt }], ...rest });
}

// Extract a JSON object from an LLM response, tolerating markdown fences
export async function generateJson({ system, prompt, temperature = 0.2, maxTokens = 1024 }) {
  const raw = await generate({ system, prompt, json: true, temperature, maxTokens });
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI response contained no JSON');
  return JSON.parse(cleaned.slice(start, end + 1));
}
