import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Documentation — MentionWatch",
  description: "REST API documentation for MentionWatch social media monitoring.",
};

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const color = method === "POST" ? "text-amber-500" : method === "GET" ? "text-green-400" : "text-red-400";
  return (
    <div className="py-4 border-t border-zinc-800/40">
      <p className="mb-1">
        <span className={`font-mono text-[12px] ${color} font-medium`}>{method}</span>
        <span className="font-mono text-[13px] text-zinc-200 ml-2">{path}</span>
      </p>
      <p className="text-[14px] text-zinc-500">{desc}</p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="pt-14">
      <div className="max-w-[760px] mx-auto px-6 py-20">
        <p className="font-mono text-[11px] text-amber-500 uppercase tracking-[0.14em] mb-4">Documentation</p>
        <h1 className="text-[36px] font-semibold text-white tracking-tight mb-4">API Reference</h1>
        <p className="text-zinc-400 mb-12 max-w-[500px]">
          All endpoints require <span className="font-mono text-[12px] text-amber-500 bg-amber-500/[0.07] px-1.5 py-0.5">Authorization: Bearer mw_live_xxx</span> except webhooks and auth.
        </p>

        <section id="auth" className="mb-12">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-2">Authentication</h2>
          <p className="text-[14px] text-zinc-500 mb-4">Include your API key in every request header:</p>
          <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto mb-4">
{`curl -H "Authorization: Bearer mw_live_xxx" \\
  https://mentionwatch.mlh.one/api/me`}
          </pre>
        </section>

        <section id="endpoints" className="mb-12">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">Endpoints</h2>
          <Endpoint method="GET" path="/api/me" desc="Your account info: plan, keyword count, mention usage, webhook URL." />
          <Endpoint method="POST" path="/api/keywords" desc='Create a keyword to monitor. Body: {"keyword": "my-product"}' />
          <Endpoint method="GET" path="/api/keywords" desc="List all your keywords." />
          <Endpoint method="DELETE" path="/api/keywords/:id" desc="Delete a keyword by ID." />
          <Endpoint method="POST" path="/api/webhooks" desc='Set your webhook URL. Body: {"url": "https://..."}' />
          <Endpoint method="GET" path="/api/webhooks" desc="Get your current webhook configuration." />
          <Endpoint method="POST" path="/api/webhooks/test" desc="Send a test webhook payload to your configured URL." />
          <Endpoint method="GET" path="/api/mentions" desc="List recent mentions. Optional: ?limit=50" />
        </section>

        <section id="payload" className="mb-12">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">Webhook Payload</h2>
          <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
{`{
  "id": "mw_evt_2xKj9mPq",
  "keyword": "my-product",
  "source": "hackernews",
  "type": "story",
  "title": "Show HN: My Product",
  "text": "...",
  "author": "username",
  "url": "https://news.ycombinator.com/item?id=...",
  "source_url": "https://my-product.com",
  "timestamp": "2026-04-10T09:15:00Z",
  "delivered_at": "2026-04-10T09:15:12Z"
}`}
          </pre>
        </section>

        <section id="verification" className="mb-12">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">Webhook Verification</h2>
          <p className="text-[14px] text-zinc-500 mb-4">
            Every webhook includes an <span className="font-mono text-[12px] text-amber-500 bg-amber-500/[0.07] px-1.5 py-0.5">X-MentionWatch-Signature</span> header.
          </p>
          <p className="font-mono text-[11px] text-zinc-600 mb-2">Node.js</p>
          <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto mb-4">
{`const crypto = require('crypto');
const signature = req.headers['x-mentionwatch-signature'];
const expected = 'sha256=' + crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
const valid = signature === expected;`}
          </pre>
          <p className="font-mono text-[11px] text-zinc-600 mb-2">Python</p>
          <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
{`import hmac, hashlib
signature = request.headers.get('X-MentionWatch-Signature')
expected = 'sha256=' + hmac.new(
    WEBHOOK_SECRET.encode(), request.data, hashlib.sha256
).hexdigest()
valid = hmac.compare_digest(signature, expected)`}
          </pre>
        </section>

        <section id="errors" className="mb-12">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">Error Codes</h2>
          <div className="space-y-2 text-[14px]">
            <p><span className="font-mono text-zinc-200">auth_required</span> <span className="text-zinc-600">401</span> — Missing or invalid API key</p>
            <p><span className="font-mono text-zinc-200">invalid_keyword</span> <span className="text-zinc-600">400</span> — Keyword validation failed</p>
            <p><span className="font-mono text-zinc-200">keyword_limit_exceeded</span> <span className="text-zinc-600">403</span> — Plan keyword limit reached</p>
            <p><span className="font-mono text-zinc-200">duplicate_keyword</span> <span className="text-zinc-600">409</span> — Keyword already exists</p>
            <p><span className="font-mono text-zinc-200">keyword_not_found</span> <span className="text-zinc-600">404</span> — Keyword ID not found</p>
            <p><span className="font-mono text-zinc-200">invalid_webhook_url</span> <span className="text-zinc-600">400</span> — URL must be public HTTPS</p>
            <p><span className="font-mono text-zinc-200">webhook_not_configured</span> <span className="text-zinc-600">400</span> — Set webhook URL first</p>
          </div>
        </section>

        <section id="limits">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">Limits</h2>
          <div className="grid grid-cols-3 gap-px bg-zinc-800/60 text-[14px] mb-4">
            <div className="bg-[#09090b] p-3 font-mono text-zinc-600 text-[12px]">Limit</div>
            <div className="bg-[#09090b] p-3 font-mono text-zinc-600 text-[12px]">Starter</div>
            <div className="bg-[#09090b] p-3 font-mono text-zinc-600 text-[12px]">Pro</div>
            <div className="bg-[#0b0b0d] p-3 text-zinc-400">Keywords</div>
            <div className="bg-[#0b0b0d] p-3 text-zinc-200">5</div>
            <div className="bg-[#0b0b0d] p-3 text-zinc-200">25</div>
            <div className="bg-[#09090b] p-3 text-zinc-400">Mentions/mo</div>
            <div className="bg-[#09090b] p-3 text-zinc-200">5,000</div>
            <div className="bg-[#09090b] p-3 text-zinc-200">50,000</div>
            <div className="bg-[#0b0b0d] p-3 text-zinc-400">Polling</div>
            <div className="bg-[#0b0b0d] p-3 text-zinc-200">~10 min</div>
            <div className="bg-[#0b0b0d] p-3 text-zinc-200">~5 min</div>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <Link href="/" className="text-amber-500 hover:text-amber-400 no-underline font-mono text-[13px]">&larr; Back to home</Link>
        </div>
      </div>
    </div>
  );
}
