import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Custom Vite plugin that proxies /api/anthropic/* → https://api.anthropic.com
 * The API key is injected server-side from .env.local and never reaches the browser bundle.
 */
function anthropicProxy(env) {
  return {
    name: 'anthropic-proxy',
    configureServer(server) {
      server.middlewares.use('/api/anthropic', async (req, res) => {
        // Check both loadEnv result and process.env (covers CI / system env vars)
        const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY

        if (!apiKey) {
          res.statusCode = 503
          res.setHeader('content-type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'ANTHROPIC_API_KEY not found — add it to .env.local and restart the dev server',
            })
          )
          return
        }

        // req.url is the path AFTER the mount point, e.g. "/v1/messages"
        const upstreamUrl = `https://api.anthropic.com${req.url ?? '/'}`

        // Collect request body
        const chunks = []
        await new Promise((resolve, reject) => {
          req.on('data', (c) => chunks.push(c))
          req.on('end', resolve)
          req.on('error', reject)
        })
        const rawBody = Buffer.concat(chunks).toString('utf-8')

        try {
          const upstream = await fetch(upstreamUrl, {
            method: req.method ?? 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            ...(rawBody ? { body: rawBody } : {}),
          })

          res.statusCode = upstream.status
          res.setHeader('content-type', 'application/json')
          res.end(await upstream.text())
        } catch (err) {
          res.statusCode = 502
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // '' prefix → load ALL env vars (not just VITE_*), so ANTHROPIC_API_KEY is accessible
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), anthropicProxy(env)],
  }
})
