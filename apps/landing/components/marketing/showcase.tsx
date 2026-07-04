import { Check } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { SectionHeading } from "@/components/marketing/features"

export async function Showcase() {
  const t = await getTranslations("landing.showcase")
  const points = t.raw("points") as string[]

  return (
    <section
      id="stack"
      className="scroll-mt-20 border-y border-border bg-muted/30 py-24 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            align="left"
          />
          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="text-[15px] leading-relaxed text-foreground/90">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 -z-10 rounded-3xl bg-brand/10 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="font-mono text-xs text-muted-foreground">
                lib/auth-server.ts
              </span>
              <span className="font-mono text-[11px] text-brand">RSC</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed">
              <code>
                <span className="text-chart-4">import</span> {"{ "}
                getServerSession{" }"}{" "}
                <span className="text-chart-4">from</span>{" "}
                <span className="text-brand">
                  &quot;@/lib/auth-server&quot;
                </span>
                {"\n\n"}
                <span className="text-chart-4">export default async</span>{" "}
                <span className="text-chart-2">function</span> Page() {"{"}
                {"\n"}
                {"  "}
                <span className="text-chart-4">const</span> session ={" "}
                <span className="text-chart-4">await</span>{" "}
                <span className="text-chart-2">getServerSession</span>()
                {"\n"}
                {"  "}
                <span className="text-chart-4">if</span> (!session){" "}
                <span className="text-chart-2">redirect</span>(
                <span className="text-brand">&quot;/login&quot;</span>){"\n\n"}
                {"  "}
                <span className="text-chart-4">return</span> &lt;Dashboard user=
                {"{"}session.user{"}"} /&gt;{"\n"}
                {"}"}
              </code>
            </pre>
            <div className="border-t border-border bg-muted/40 px-5 py-3">
              <span className="font-mono text-[11px] text-muted-foreground">
                {t("codeCaption")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
