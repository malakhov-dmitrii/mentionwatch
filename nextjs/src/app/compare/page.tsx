import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compare — MentionWatch vs Mention.com vs Brand24 vs Brandwatch",
  description: "Compare MentionWatch with Mention.com, Brand24, and Brandwatch. API-first, webhook delivery, 2-40x cheaper.",
};

function Row({ feature, mw, mention, brand24, brandwatch }: { feature: string; mw: string; mention: string; brand24: string; brandwatch: string }) {
  return (
    <div className="grid grid-cols-5 gap-px">
      <div className="bg-[#09090b] p-3 text-[13px] text-zinc-400">{feature}</div>
      <div className="bg-[#0b0b0d] p-3 text-[13px] text-amber-500 font-medium">{mw}</div>
      <div className="bg-[#09090b] p-3 text-[13px] text-zinc-500">{mention}</div>
      <div className="bg-[#09090b] p-3 text-[13px] text-zinc-500">{brand24}</div>
      <div className="bg-[#09090b] p-3 text-[13px] text-zinc-500">{brandwatch}</div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="pt-14">
      <div className="max-w-[900px] mx-auto px-6 py-20">
        <p className="font-mono text-[11px] text-amber-500 uppercase tracking-[0.14em] mb-4">Compare</p>
        <h1 className="text-[36px] font-semibold text-white tracking-tight mb-4">MentionWatch vs the rest</h1>
        <p className="text-zinc-400 mb-12 max-w-[500px]">Built for developers who want an API, not a dashboard.</p>

        <div className="bg-zinc-800/60 gap-px overflow-x-auto">
          <div className="grid grid-cols-5 gap-px min-w-[700px]">
            <div className="bg-[#0c0c0e] p-3 font-mono text-[11px] text-zinc-600 uppercase tracking-wider">Feature</div>
            <div className="bg-[#0c0c0e] p-3 font-mono text-[11px] text-amber-500 uppercase tracking-wider">MentionWatch</div>
            <div className="bg-[#0c0c0e] p-3 font-mono text-[11px] text-zinc-600 uppercase tracking-wider">Mention.com</div>
            <div className="bg-[#0c0c0e] p-3 font-mono text-[11px] text-zinc-600 uppercase tracking-wider">Brand24</div>
            <div className="bg-[#0c0c0e] p-3 font-mono text-[11px] text-zinc-600 uppercase tracking-wider">Brandwatch</div>
          </div>
          <Row feature="Starting price" mw="$19/mo" mention="$41/mo" brand24="$79/mo" brandwatch="$800+/mo" />
          <Row feature="Interface" mw="REST API" mention="Dashboard" brand24="Dashboard" brandwatch="Dashboard" />
          <Row feature="Delivery" mw="Webhooks" mention="Email/Dashboard" brand24="Email/Dashboard" brandwatch="Dashboard" />
          <Row feature="Setup time" mw="90 seconds" mention="~30 min" brand24="~30 min" brandwatch="Sales call" />
          <Row feature="Auth" mw="API key" mention="OAuth" brand24="OAuth" brandwatch="Enterprise SSO" />
          <Row feature="Signatures" mw="HMAC-SHA256" mention="No" brand24="No" brandwatch="No" />
          <Row feature="Retry policy" mw="3x backoff" mention="No" brand24="No" brandwatch="N/A" />
          <Row feature="AI-agent friendly" mw="Yes (llms.txt)" mention="No" brand24="No" brandwatch="No" />
          <Row feature="Free trial" mw="7 days" mention="14 days" brand24="14 days" brandwatch="Demo only" />
          <Row feature="Contract" mw="Monthly" mention="Annual" brand24="Annual" brandwatch="Annual" />
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-[18px] font-semibold text-white tracking-tight mb-3">When to choose MentionWatch</h2>
            <ul className="space-y-2 text-[14px] text-zinc-400">
              <li>You want webhooks, not a dashboard</li>
              <li>You want to integrate mentions into your own app</li>
              <li>You want to automate responses via code</li>
              <li>You want an AI agent to manage monitoring for you</li>
              <li>You don&apos;t want to pay for features you won&apos;t use</li>
            </ul>
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-white tracking-tight mb-3">When NOT to choose MentionWatch</h2>
            <ul className="space-y-2 text-[14px] text-zinc-400">
              <li>You need a visual analytics dashboard</li>
              <li>You need sentiment analysis (coming later)</li>
              <li>You need team collaboration features</li>
              <li>You need 20+ sources on day one</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <Link href="/#pricing" className="text-amber-500 hover:text-amber-400 no-underline font-mono text-[13px]">See pricing &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
