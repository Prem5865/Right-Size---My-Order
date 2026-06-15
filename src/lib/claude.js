const MODEL   = 'claude-sonnet-4-6'
const API_URL = '/api/anthropic/v1/messages'

/**
 * Call the Claude API through the Vite dev-server proxy.
 * The proxy injects `x-api-key` server-side — the key never reaches the browser bundle.
 *
 * @param {Array<{role: 'user' | 'assistant', content: string}>} messages
 * @param {{ max_tokens?: number }} [opts]
 * @returns {Promise<string>} The text of the first content block.
 */
export async function complete(messages, opts = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.max_tokens ?? 512,
      messages,
    }),
  })

  // Proxy returns 503 when ANTHROPIC_API_KEY is not configured
  if (res.status === 503) {
    throw new Error('API_KEY_MISSING')
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText)
    throw new Error(`Claude ${res.status}: ${detail}`)
  }

  const data = await res.json()
  const block = data?.content?.[0]

  if (!block || block.type !== 'text') {
    throw new Error('Unexpected response shape from Claude')
  }

  return block.text
}

/**
 * Tolerantly extract the first JSON object from a possibly-markdown-wrapped string.
 * Tries three strategies before giving up:
 *   1. Direct JSON.parse of the trimmed string
 *   2. Unwrap a ```json … ``` or ``` … ``` fenced block
 *   3. Find the first balanced { … } substring
 *
 * @param {string} raw
 * @returns {object | null}
 */
export function parseJsonObject(raw) {
  if (!raw || typeof raw !== 'string') return null

  // 1. Direct parse
  try { return JSON.parse(raw.trim()) } catch { /* fall through */ }

  // 2. Unwrap fenced code block
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()) } catch { /* fall through */ }
  }

  // 3. Find first balanced { … }
  const start = raw.indexOf('{')
  if (start !== -1) {
    let depth = 0
    for (let i = start; i < raw.length; i++) {
      if (raw[i] === '{') depth++
      else if (raw[i] === '}') {
        depth--
        if (depth === 0) {
          try { return JSON.parse(raw.slice(start, i + 1)) } catch { break }
        }
      }
    }
  }

  return null
}
