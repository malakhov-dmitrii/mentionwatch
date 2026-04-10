import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MentionWatch — Social Media Monitoring API for Developers",
  description:
    "Monitor keyword mentions across social media via API and webhooks. Developer-first. Set up in 90 seconds. $19/mo.",
  openGraph: {
    title: "MentionWatch — Social Media Monitoring API",
    description:
      "Get webhooks when your product is mentioned on HN, Reddit, and more. Set up in 90 seconds.",
    type: "website",
    url: "https://mentionwatch.mlh.one",
  },
  twitter: { card: "summary_large_image" },
  keywords:
    "social media monitoring API, mention monitoring webhooks, brand monitoring API, keyword monitoring, HN monitoring, Reddit monitoring",
  alternates: {
    types: { "text/plain": "/llms.txt" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "MentionWatch",
              description:
                "Social media keyword monitoring API with webhook delivery. Developer-first. AI-agent friendly.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web API",
              offers: [
                {
                  "@type": "Offer",
                  name: "Starter",
                  price: "19",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "49",
                  priceCurrency: "USD",
                },
              ],
              url: "https://mentionwatch.mlh.one",
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_BxcPuNDw8yjg3Ne4ufxPayt8H3Gto9nFQn9LtTtgkavP',{api_host:'https://us.i.posthog.com',person_profiles:'identified_only'})`,
          }}
        />
      </head>
      <body className="bg-[#09090b] text-zinc-400 font-sans text-base leading-relaxed antialiased">
        {children}
      </body>
    </html>
  );
}
