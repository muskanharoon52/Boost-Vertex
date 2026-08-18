import { useMemo, useState } from "react";
import { Banknote, Building2, Cloud, HeartPulse, ShoppingBag, Truck } from "lucide-react";
import { MarketingFooter, MarketingHeader, MobileFastTrack } from "@/components/MarketingChrome";
import { caseStudies } from "@/data/marketingContent";

// Case Studies desktop Figma contract: centered lime-arc hero, compact control rail, 3×2 proof grid, impact band, industry evidence, client-provided quote, and conversion panel.

const industryCards = [
  { title: "Fintech", description: "Navigating complex regulatory landscapes to scale user acquisition and trust for financial platforms.", icon: Banknote },
  { title: "SaaS", description: "Optimizing the full funnel from MQL to expansion revenue for enterprise software solutions.", icon: Cloud },
  { title: "E-commerce", description: "Driving high-intent traffic and maximizing LTV through data-driven retention and conversion strategies.", icon: ShoppingBag },
  { title: "Healthcare", description: "Building authority in YMYL niches with expert-led content and HIPAA-compliant lead generation.", icon: HeartPulse },
  { title: "Real Estate", description: "Capturing high-value leads in competitive local markets through hyper-targeted search strategies.", icon: Building2 },
  { title: "Logistics", description: "Scaling B2B visibility for global supply chain and transportation infrastructure providers.", icon: Truck },
];

const industryOptions = ["All Industries", "Fintech", "SaaS", "E-commerce", "Healthcare", "Logistics", "EdTech", "Real Estate", "B2B"];
const serviceOptions = ["All Services", "SEO", "Paid Social", "Search", "Analytics", "Content", "Landing Pages", "Creative"];
const desktopFastTrackActions = [
  { label: "Call", icon: "/46-537.svg" },
  { label: "Chat", icon: "/46-542.svg" },
  { label: "Book", icon: "/46-547.svg" },
  { label: "Inquiry", icon: "/46-552.svg" },
] as const;

export default function CaseStudies() {
  const [industry, setIndustry] = useState("All Industries");
  const [service, setService] = useState("All Services");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches ? 4 : 6);
  const [fastTrackMessage, setFastTrackMessage] = useState("");

  const visibleCases = useMemo(() => {
    const term = query.trim().toLowerCase();
    return caseStudies
      .filter((item) => industry === "All Industries" || item.industry === industry)
      .filter((item) => service === "All Services" || item.services.some((itemService) => itemService.toLowerCase().includes(service.toLowerCase())))
      .filter((item) => !term || [item.clientName, item.industry, item.metricValue, item.summary, ...item.services].join(" ").toLowerCase().includes(term))
      .slice(0, visibleCount);
  }, [industry, query, service, visibleCount]);

  const resetVisibleCount = () => setVisibleCount(typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches ? 4 : 6);

  return (
    <div className="mv-page mv-cases-page">
      <MarketingHeader active="case-studies" />
      <main>
        <section className="mv-cases-hero" data-page-reveal>
          <div className="mv-wrap">
            <h1><span>Proven</span> <span>Performance.</span><br /><em>Quantifiable<br />Growth.</em></h1>
            <p><span className="mv-cases-copy--desktop">Explore our portfolio of successful digital marketing campaigns. We leverage data-driven strategies and technical precision to deliver measurable ROI for enterprise clients across competitive industries.</span><span className="mv-cases-copy--mobile">Explore how we&apos;ve engineered exponential growth for clients and leaders through precision data and strategic marketing.</span></p>
            <div className="mv-cases-hero__mobile-actions">
              <a href="/#contact" className="mv-button" data-action="case-studies-mobile-growth-plan">Get My Free Growth Plan</a>
              <a href="#case-studies-results" className="mv-button mv-button--ghost" data-action="case-studies-mobile-see-work">See Our Work</a>
            </div>
          </div>
          <aside className="mv-cases-fast-track" aria-label="Fast Track actions">
            <span>Fast Track</span>
            <div>
              {desktopFastTrackActions.map((item) => (
                <button key={item.label} type="button" aria-label={`${item.label} Boost Vertex`} data-action={`case-studies-fast-track-${item.label.toLowerCase()}`} onClick={() => setFastTrackMessage(`${item.label} action is ready for backend connection.`)}>
                  <img src={item.icon} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </aside>
        </section>
        <div className={`mv-action-feedback ${fastTrackMessage ? "is-visible" : ""}`} role="status" aria-live="polite">{fastTrackMessage}</div>

        <section className="mv-cases-results" id="case-studies-results" data-page-reveal>
          <div className="mv-wrap">
            <div className="mv-cases-filterbar" aria-label="Filter case studies">
              <span>Filter by:</span>
              <label>
                <span className="mv-sr-only">Industry</span>
                <select value={industry} onChange={(event) => { setIndustry(event.target.value); resetVisibleCount(); }}>
                  {industryOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>
                <span className="mv-sr-only">Service</span>
                <select value={service} onChange={(event) => { setService(event.target.value); resetVisibleCount(); }}>
                  {serviceOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="mv-cases-search">
                <span className="mv-sr-only">Search case studies</span>
                <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); resetVisibleCount(); }} placeholder="Search case studies..." />
              </label>
            </div>

            <div className="mv-case-grid">
              {visibleCases.map((study) => (
                <article className="mv-case-card" key={study.id}>
                  <span>{study.industry}</span>
                  <h3>{study.clientName}</h3>
                  <strong>{study.metricValue}</strong>
                  <b>{study.metricLabel}</b>
                  <p>{study.summary}</p>
                  <a href={`/case-studies/${study.slug}`} data-action="case-study-detail">Explore in Detail <i>→</i></a>
                </article>
              ))}
            </div>

            {!visibleCases.length && <p className="mv-cases-empty">No case studies match the selected filters.</p>}
            {visibleCount < caseStudies.length && industry === "All Industries" && service === "All Services" && !query && (
              <button type="button" className="mv-load-more" onClick={() => setVisibleCount(caseStudies.length)} data-action="load-more-case-studies">Load More Case Studies</button>
            )}
          </div>
        </section>

        <section className="mv-impact-band" data-page-reveal>
          <div><strong>$7M+</strong><span>Ad Spend Managed</span></div>
          <div><strong>4.8x</strong><span>Average ROI</span></div>
          <div><strong>98%</strong><span>Client Retention</span></div>
        </section>

        <section className="mv-industry-section" data-page-reveal>
          <div className="mv-wrap">
            <div className="mv-section-heading">
              <h2>Expertise Across High-Volume Industries</h2>
              <p>We specialize in driving growth for complex business models and competitive markets.</p>
            </div>
            <div className="mv-industry-grid">
              {industryCards.map(({ title, description, icon: Icon }) => (
                <article key={title}>
                  <i aria-hidden="true"><Icon strokeWidth={1.8} /></i>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mv-cases-quote" data-page-reveal>
          <div className="mv-wrap">
            <span aria-hidden="true">“</span>
            <blockquote>Boost Vertex completely re-engineered our digital approach. The technical rigor they brought to our SEO and paid campaigns resulted in a level of growth we previously thought unattainable in our highly saturated market.</blockquote>
            <div className="mv-cases-quote__author"><i aria-hidden="true" /><div><strong>Marcus Vance</strong><small>CMO, Nexus Capital Partners</small></div></div>
          </div>
        </section>

        <section className="mv-cases-convert" data-page-reveal>
          <div>
            <h2>Ready to Boost Your Business?</h2>
            <p>Stop guessing with your digital strategy. Partner with us to deliver quantifiable growth.</p>
            <div className="mv-actions mv-actions--center">
              <a href="/#contact" className="mv-button" data-action="case-studies-growth-plan"><span className="mv-cases-convert__desktop-copy">Get My Free Growth Plan</span><span className="mv-cases-convert__mobile-copy">Book a Strategy Call</span></a>
              <a href="/services" className="mv-button mv-button--ghost" data-action="case-studies-consultation"><span className="mv-cases-convert__desktop-copy">Schedule a Consultation</span><span className="mv-cases-convert__mobile-copy">View Our Services</span></a>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <MobileFastTrack />
    </div>
  );
}
