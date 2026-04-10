import Link from "next/link";
import { CopyPrompt } from "./copy-prompt";

function Badge({ live }: { live?: boolean }) {
  return live ? (
    <span className="inline-block font-mono text-[9px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-px ml-1.5 tracking-widest align-middle relative -top-px">
      LIVE
    </span>
  ) : (
    <span className="inline-block font-mono text-[9px] text-zinc-600 bg-zinc-800/80 border border-zinc-700/60 px-1.5 py-px ml-1.5 tracking-widest align-middle relative -top-px">
      SOON
    </span>
  );
}

function Step({ num, title, tag, desc }: { num: string; title: string; tag: string; desc: string }) {
  return (
    <div className="grid grid-cols-[44px_1fr] py-7 border-t border-zinc-800/40">
      <span className="text-[28px] font-medium text-amber-500/40 leading-none pt-0.5 font-mono">{num}</span>
      <div>
        <p className="text-[17px] text-zinc-200 mb-1.5">
          {title}
          <span className="inline-block font-mono text-[10px] text-amber-500 bg-amber-500/[0.07] border border-amber-500/20 px-2 py-0.5 ml-2 align-middle relative -top-px tracking-wide">
            {tag}
          </span>
        </p>
        <p className="text-[14px] text-zinc-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="border-t border-zinc-800/40">
      <summary className="flex justify-between items-center py-5 select-none">
        <span className="text-[16px] text-zinc-300 leading-snug">{q}</span>
        <span className="faq-icon font-mono text-[18px] text-zinc-600 leading-none ml-6 shrink-0 transition-transform duration-200">
          +
        </span>
      </summary>
      <div className="pb-5 text-[14px] text-zinc-500 leading-relaxed max-w-[540px]">
        {children}
      </div>
    </details>
  );
}

export default function Home() {
  return (
    <>
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-[1120px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-medium text-white tracking-tight no-underline">
            Mention<span className="text-amber-500">Watch</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/docs" className="hidden sm:flex items-center h-11 px-3 font-mono text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors no-underline">docs</Link>
            <a href="#pricing" className="hidden sm:flex items-center h-11 px-3 font-mono text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors no-underline">pricing</a>
            <Link href="/compare" className="hidden md:flex items-center h-11 px-3 font-mono text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors no-underline">compare</Link>
            <a href="#pricing" className="ml-2 flex items-center h-11 px-4 font-mono text-[12px] tracking-wider bg-amber-500 text-black hover:bg-amber-600 transition-colors no-underline">Get started</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-14 relative overflow-hidden">
        <div className="absolute top-[40%] left-[25%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.04)_0%,transparent_65%)] pointer-events-none z-0" />
        <div className="max-w-[1120px] mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-[1.15fr_1fr] gap-0 min-h-[520px]">
            <div className="py-20 md:py-24 md:pr-14 md:border-r border-zinc-800/50 enter">
              <p className="font-mono text-[11px] text-amber-500 uppercase tracking-[0.14em] mb-7">Developer API &middot; Webhooks &middot; $19/mo</p>
              <h1 className="text-[clamp(34px,5vw,52px)] font-semibold text-white leading-[1.08] tracking-[-0.035em] mb-6">
                Know when anyone<br />mentions <em className="not-italic text-zinc-300">your product</em>
              </h1>
              <p className="text-[16px] text-zinc-400 leading-[1.7] mb-8 max-w-[400px]">
                Set keywords via API. Get webhooks when they appear on Hacker&nbsp;News and more. No dashboard. No noise.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#pricing" className="flex items-center h-11 px-5 font-mono text-[13px] tracking-wider bg-amber-500 text-black hover:bg-amber-600 transition-colors no-underline">Start free trial</a>
                <Link href="/docs" className="flex items-center h-11 px-5 font-mono text-[13px] tracking-wider text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-600 transition-colors no-underline">Read the docs</Link>
              </div>
              <p className="mt-5 font-mono text-[11px] text-zinc-600 tracking-wide">7-day free trial — no credit card required</p>
            </div>

            <div className="py-10 md:py-24 md:pl-12 enter enter-d2">
              <div className="border border-zinc-800/70 bg-[#111113] shadow-2xl shadow-black/30">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800/50 bg-[#0c0c0e]">
                  <span className="w-[9px] h-[9px] rounded-full bg-[#2a1515]" />
                  <span className="w-[9px] h-[9px] rounded-full bg-[#2a2210]" />
                  <span className="w-[9px] h-[9px] rounded-full bg-[#102a10]" />
                  <span className="ml-2 font-mono text-[11px] text-zinc-600">webhook.sh</span>
                </div>
                <pre className="p-5 font-mono text-[12.5px] leading-[1.75] overflow-x-auto">{
`\x23 Add a keyword
$ curl -X POST mentionwatch.mlh.one/api/keywords \\
    -H "Authorization: Bearer mw_live_xxx" \\
    -d '{"keyword": "my-product"}'

\x23 You receive via webhook:
{
  "keyword":    "my-product",
  "source":     "hackernews",
  "title":      "Show HN: My Product is live",
  "url":        "https://news.ycombinator.com/...",
  "author":     "tptacek",
  "timestamp":  "2026-04-10T09:15:00Z"
}`
                }</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CopyPrompt />

      {/* Payload Preview */}
      <section className="border-t border-zinc-800/50 py-20">
        <div className="max-w-[860px] mx-auto px-6">
          <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-[0.14em] mb-3">Webhook payload</p>
          <p className="text-[17px] text-zinc-300 leading-relaxed mb-8 max-w-[500px]">
            What your endpoint receives on every mention match. Every delivery is signed with HMAC-SHA256.
          </p>
          <div className="border border-zinc-800/70 bg-[#111113] shadow-xl shadow-black/20">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/50 bg-[#0c0c0e]">
              <span className="font-mono text-[11px] text-zinc-600">POST your-app.com/webhook</span>
              <span className="font-mono text-[10px] text-zinc-700">application/json</span>
            </div>
            <pre className="p-5 font-mono text-[12.5px] leading-[1.75] overflow-x-auto">{
`{
  "id":           "mw_evt_2xKj9mPq",
  "keyword":      "my-product",
  "source":       "hackernews",
  "type":         "story",
  "title":        "Show HN: My Product — analytics for dev teams",
  "text":         "We just launched My Product, a tool that...",
  "author":       "tptacek",
  "url":          "https://news.ycombinator.com/item?id=41234567",
  "source_url":   "https://my-product.com",
  "timestamp":    "2026-04-10T09:15:00Z",
  "delivered_at": "2026-04-10T09:15:12Z"
}`
            }</pre>
          </div>
          <p className="mt-4 font-mono text-[11px] text-zinc-600">
            Header: <span className="text-amber-500/60">X-MentionWatch-Signature: sha256=&lt;hmac&gt;</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800/50 py-20">
        <div className="max-w-[660px] mx-auto px-6">
          <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-[0.14em] mb-10">How it works</p>
          <Step num="1" title="Add keywords" tag="POST /api/keywords" desc="Tell us what to monitor. Case-insensitive. Takes one curl call." />
          <Step num="2" title="Set your webhook URL" tag="POST /api/webhooks" desc="Point us at any HTTPS endpoint. We sign every request with HMAC-SHA256." />
          <div className="border-b border-zinc-800/40">
            <Step num="3" title="Receive mentions" tag="POST your-app/hook" desc="We poll continuously. You get a webhook POST within 15 minutes of any match." />
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="border-t border-zinc-800/50 bg-[#0c0c0e] py-14">
        <div className="max-w-[660px] mx-auto px-6">
          <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-[0.14em] mb-5">Sources we monitor</p>
          <p className="text-[18px] text-zinc-300 leading-[1.8]">
            <span className="text-zinc-100">Hacker News</span><Badge live /><span className="text-zinc-700">,&ensp;</span>
            <span className="text-zinc-500">Reddit</span><Badge /><span className="text-zinc-700">,&ensp;</span>
            <span className="text-zinc-500">Twitter/X</span><Badge /><span className="text-zinc-700">,&ensp;</span>
            <span className="text-zinc-500">LinkedIn</span><Badge /><span className="text-zinc-700">,&ensp;</span>
            <span className="text-zinc-500">Product Hunt</span><Badge /><span className="text-zinc-700">,&ensp;</span>
            <span className="text-zinc-500">Dev.to</span><Badge /><span className="text-zinc-700">,&ensp;</span>
            <span className="text-zinc-500">GitHub</span><Badge />
          </p>
          <p className="mt-4 font-mono text-[12px] text-zinc-600">
            More sources based on demand.{" "}
            <a href="mailto:mitia2022@gmail.com" className="text-amber-500 hover:text-amber-400 transition-colors no-underline">Request one &rarr;</a>
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-zinc-800/50 py-5">
        <div className="max-w-[860px] mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 font-mono text-[11px] text-zinc-600 tracking-wide">
            <span>HMAC-SHA256 signed</span>
            <span className="text-zinc-800">&middot;</span>
            <span>3x retry with backoff</span>
            <span className="text-zinc-800">&middot;</span>
            <span>&lt; 15 min delivery</span>
            <span className="text-zinc-800">&middot;</span>
            <span>99.9% uptime target</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-zinc-800/50 bg-[#0c0c0e] py-20">
        <div className="max-w-[1120px] mx-auto px-6">
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-semibold text-white tracking-[-0.03em] mb-3">Two plans. No dashboards. No noise.</h2>
          <p className="text-[15px] text-zinc-500 mb-12 max-w-[440px]">Competitors charge $41–800/month for UIs you don&apos;t need. You pay for the API.</p>
          <div className="max-w-[800px]">
            <div className="grid md:grid-cols-[1fr_1.4fr] gap-px bg-zinc-800/60">
              <div className="bg-[#09090b] p-8 md:p-9">
                <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-[0.1em] mb-5">Starter</p>
                <div className="text-[46px] font-semibold text-white tracking-[-0.03em] leading-none mb-1">$19<span className="font-mono text-[14px] font-normal text-zinc-600 tracking-normal">&thinsp;/mo</span></div>
                <p className="font-mono text-[11px] text-zinc-600 mb-7">7-day free trial</p>
                <hr className="border-zinc-800/50 mb-6" />
                <ul className="feat space-y-3 mb-8">
                  <li><span className="text-zinc-200">5 keywords</span></li>
                  <li><span className="text-zinc-200">5,000 mentions/mo</span></li>
                  <li>All live sources</li>
                  <li>Webhook delivery</li>
                  <li>HMAC signatures</li>
                  <li>Email support</li>
                </ul>
                <a href="CREEM_CHECKOUT_STARTER_URL" className="block text-center h-12 leading-[48px] font-mono text-[13px] tracking-wider text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-600 transition-colors no-underline">Start free trial</a>
              </div>
              <div className="bg-[#0b0b0d] p-8 md:p-9">
                <div className="mb-4"><span className="inline-block font-mono text-[10px] tracking-[0.1em] uppercase bg-amber-500 text-black px-2.5 py-1">Most popular</span></div>
                <p className="font-mono text-[11px] text-amber-500 uppercase tracking-[0.1em] mb-5">Pro</p>
                <div className="text-[46px] font-semibold text-white tracking-[-0.03em] leading-none mb-1">$49<span className="font-mono text-[14px] font-normal text-zinc-600 tracking-normal">&thinsp;/mo</span></div>
                <p className="font-mono text-[11px] text-zinc-600 mb-7">7-day free trial</p>
                <hr className="border-zinc-800/50 mb-6" />
                <ul className="feat space-y-3 mb-8">
                  <li><span className="text-zinc-200">25 keywords</span> — 5x more</li>
                  <li><span className="text-zinc-200">50,000 mentions/mo</span></li>
                  <li>All live sources</li>
                  <li>Webhook delivery</li>
                  <li>HMAC signatures</li>
                  <li>Priority support + early access to new sources</li>
                  <li>Priority support</li>
                </ul>
                <a href="CREEM_CHECKOUT_PRO_URL" className="block text-center h-12 leading-[48px] font-mono text-[13px] tracking-wider bg-amber-500 text-black hover:bg-amber-600 transition-colors no-underline">Start free trial</a>
              </div>
            </div>
            <p className="mt-5 font-mono text-[12px] text-zinc-600">Need more?{" "}<a href="mailto:mitia2022@gmail.com" className="text-amber-500 hover:text-amber-400 transition-colors no-underline">mitia2022@gmail.com</a> — we do custom plans.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-800/50 py-20">
        <div className="max-w-[660px] mx-auto px-6">
          <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-[0.14em] mb-8">Frequently asked</p>
          <Faq q="How fast are mentions delivered?">We poll continuously. Starter accounts see mentions within ~10 minutes; Pro accounts get priority polling at ~5 minutes. Most mentions arrive well under the maximum.</Faq>
          <Faq q="What happens if my webhook endpoint is down?">We retry three times with exponential backoff: 10s, 60s, then 5 minutes. After three failures the mention is stored and retrievable via <span className="font-mono text-[11px] text-amber-500 bg-amber-500/[0.07] px-1.5 py-0.5">GET /api/mentions</span> so nothing is lost.</Faq>
          <Faq q="How do I verify webhooks are from MentionWatch?">Every delivery includes an <span className="font-mono text-[11px] text-amber-500 bg-amber-500/[0.07] px-1.5 py-0.5">X-MentionWatch-Signature</span> header with an HMAC-SHA256 hash of the body. The <Link href="/docs#verification" className="text-amber-500 hover:text-amber-400 no-underline transition-colors">verification docs</Link> have copy-paste examples for Node.js and Python.</Faq>
          <Faq q="Which sources are available today?">Hacker News is live now. Reddit, Twitter/X, LinkedIn, Product Hunt, Dev.to, and GitHub are on the roadmap. Sources are prioritized by demand — <a href="mailto:mitia2022@gmail.com" className="text-amber-500 hover:text-amber-400 no-underline transition-colors">tell us what you need</a>.</Faq>
          <Faq q="Can I cancel anytime?">Yes. Cancel through your billing portal anytime. You keep access until the end of the billing period. No questions, no retention flows.</Faq>
          <details className="border-t border-zinc-800/40 border-b">
            <summary className="flex justify-between items-center py-5 select-none">
              <span className="text-[16px] text-zinc-300 leading-snug">Why is this cheaper than Mention.com or Brandwatch?</span>
              <span className="faq-icon font-mono text-[18px] text-zinc-600 leading-none ml-6 shrink-0 transition-transform duration-200">+</span>
            </summary>
            <div className="pb-5 text-[14px] text-zinc-500 leading-relaxed max-w-[540px]">We ship an API, not an analytics dashboard. No charts, no teams UI, no enterprise sales process. Less surface area means lower costs and a lower price.</div>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/50 py-24">
        <div className="max-w-[660px] mx-auto px-6">
          <h2 className="text-[clamp(28px,4vw,42px)] font-semibold text-white tracking-[-0.03em] leading-[1.1] mb-5">Start monitoring<br />in 90 seconds</h2>
          <p className="text-[16px] text-zinc-400 leading-[1.7] mb-8 max-w-[380px]">Get your API key, add a keyword, send a test webhook. That&apos;s the entire setup.</p>
          <div className="flex flex-wrap gap-3">
            <a href="#pricing" className="flex items-center h-12 px-6 font-mono text-[14px] tracking-wider bg-amber-500 text-black hover:bg-amber-600 transition-colors no-underline">Start free trial</a>
            <Link href="/docs" className="flex items-center h-12 px-6 font-mono text-[14px] tracking-wider text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-600 transition-colors no-underline">Read the docs</Link>
          </div>
          <p className="mt-5 font-mono text-[11px] text-zinc-600 tracking-wide">7-day free trial — no credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-6">
        <div className="max-w-[1120px] mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
          <span className="text-[14px] text-zinc-600">MentionWatch</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/docs" className="font-mono text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors no-underline py-2">docs</Link>
            <Link href="/compare" className="font-mono text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors no-underline py-2">compare</Link>
            <Link href="/agent-setup" className="font-mono text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors no-underline py-2">agent setup</Link>
            <Link href="/llms.txt" className="font-mono text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors no-underline py-2">llms.txt</Link>
            <a href="mailto:mitia2022@gmail.com" className="font-mono text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors no-underline py-2">contact</a>
            <a href="https://twitter.com/mentionwatch" className="font-mono text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors no-underline py-2">twitter</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
