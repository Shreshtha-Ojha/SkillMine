// Simple script to call OpenRouter chat completions using fetch
// Usage: set OPENROUTER_API_KEY in env, then `node zztest.ts`

// Load .env if present
try { require('dotenv').config(); } catch (e) {}
const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error('Missing OPENROUTER_API_KEY environment variable.');
  console.error('Set it with (PowerShell): $env:OPENROUTER_API_KEY="sk-..."; node zztest.ts');
  console.error('Or add a .env file with: OPENROUTER_API_KEY=sk-...');
  process.exit(1);
}

(async () => {
  try {
    // Use OpenRouter SDK streaming API
    try {
      const { OpenRouter } = await import('@openrouter/sdk');
      const openrouter = new OpenRouter({ apiKey: API_KEY });

      const stream = await openrouter.chat.send({
        model: 'mistralai/devstral-2512:free',
        messages: [{ role: 'user', content: 'What is the meaning of life?' }],
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk?.choices?.[0]?.delta?.content;
        if (content) process.stdout.write(content);
      }
      console.log();
    } catch (sdkErr:any) {
      console.error('OpenRouter SDK stream failed:', sdkErr?.message || sdkErr);
      console.error('Falling back to HTTP request (non-streaming)');

      // Fallback to HTTP POST (non-streaming)
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/devstral-2512:free',
          messages: [{ role: 'user', content: 'What is the meaning of life?' }],
        }),
      });
      const data = await res.json().catch(() => ({ error: 'invalid json response' }));
      console.log('HTTP response status:', res.status);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err:any) {
    console.error('Request failed:', err?.message || err);
    process.exit(1);
  }
})();
