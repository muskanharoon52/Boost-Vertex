import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

// Boost Vertex About Page style contract: obsidian editorial canvas, electric-lime conversion accents,
// Chivo display hierarchy, grayscale people photography, asymmetric hero, and compact data-led cards.

const team = [
  {
    name: "Sarah Jenkins",
    role: "CEO & Founder",
    summary: "Expert in data-driven strategies and scaling businesses.",
    image: "/about/sarah-jenkins.png",
  },
  {
    name: "David Chen",
    role: "Head of Strategy",
    summary: "Specializes in technical SEO and conversion optimization.",
    image: "/about/david-chen.png",
  },
  {
    name: "Markus Rodriguez",
    role: "Creative / Paid Media",
    summary: "Leads our paid media team with a focus on high ROAS.",
    image: "/about/markus-rodriguez.png",
  },
  {
    name: "Elena Vance",
    role: "Lead Data Analyst",
    summary: "Expert in data-driven strategies and scaling client revenue.",
    image: "/about/elena-vance.png",
  },
];

const principles = [
  {
    icon: "◎",
    title: "Outcomes Over Activity",
    mobileTitle: "Data-Driven Precision",
    copy: "We don’t just execute tasks. Every action is tied to a measurable goal.",
  },
  {
    icon: "↯",
    title: "Strategy Before Spend",
    copy: "Deep analysis precedes execution. We align campaigns with your overarching business objectives first.",
  },
  {
    icon: "◉",
    title: "Transparent Reporting",
    copy: "Clear, accessible dashboards show exactly where your budget is going and the returns it generates.",
  },
  {
    icon: "↗",
    title: "Continuous Optimization",
    copy: "The market changes, and so do we. Constant A/B testing and refinement ensure peak performance.",
  },
];

const process = [
  {
    number: "01",
    title: "Strategy First",
    copy: "We start with business goals, audience insight, and the right growth opportunity.",
  },
  {
    number: "02",
    title: "Test & Learn",
    copy: "We continuously test campaigns, creative, messaging, and channels.",
  },
  {
    number: "03",
    title: "Transparent Reporting",
    copy: "Clear reporting keeps decisions focused on what actually matters.",
  },
  {
    number: "04",
    title: "Shared Accountability",
    copy: "We work as an extension of the client team and stay focused on outcomes.",
  },
];

const heroRail = [
  { label: "Call", icon: "/46-537.svg" },
  { label: "Chat", icon: "/46-542.svg" },
  { label: "Book", icon: "/46-547.svg" },
  { label: "Inquiry", icon: "/46-552.svg" },
];

const trustedBrands = [
  { name: "TECHFLOW", mark: "cube", mobileSymbol: "◉" },
  { name: "NEXUS CAPITAL", mark: "bank", mobileSymbol: "♜" },
  { name: "SAAS CORE", mark: "cloud", mobileSymbol: "☁" },
  { name: "DATAVANTAGE", mark: "chart", mobileSymbol: "⌁" },
  { name: "SENTINEL", mark: "shield", mobileSymbol: "◉" },
] as const;

const mobileTrustedBrands = [
  { name: "ACME CORP", mark: "acme" },
  { name: "GLOBEX", mark: "globex" },
  { name: "INITECH", mark: "initech" },
  { name: "SOYLENT CORP", mark: "soylent" },
] as const;

function TrustMark({ mark }: { mark: (typeof trustedBrands)[number]["mark"] }) {
  if (mark === "cube") return <svg className="about-trust__mark" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 8 4.6v9.1L12 22 4 15.7V6.6L12 2Z" /><path d="m4 6.6 8 4.7 8-4.7M12 11.3V22" /></svg>;
  if (mark === "bank") return <svg className="about-trust__mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9 12 3l9 6M4 10h16M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18" /></svg>;
  if (mark === "cloud") return <svg className="about-trust__mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 18.5h10.1a4.2 4.2 0 0 0 .7-8.3A6.3 6.3 0 0 0 6 8.1a5.2 5.2 0 0 0 1.2 10.4Z" /></svg>;
  if (mark === "chart") return <svg className="about-trust__mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V12m5 8V8m5 12v-6m5 6V4" /><path d="m3 11 5-4 5 3 7-7" /></svg>;
  return <svg className="about-trust__mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 20 5v6c0 5.3-3.4 8.9-8 11-4.6-2.1-8-5.7-8-11V5l8-3Z" /><path d="m8.8 12 2.1 2.1 4.4-4.4" /></svg>;
}

function MobileTrustMark({ mark }: { mark: (typeof mobileTrustedBrands)[number]["mark"] }) {
  if (mark === "acme") return <svg className="about-trust__mobile-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 16H4L12 3Z" /><path d="m8.4 14.2 3.6-7.1 3.6 7.1M10.3 11.6h3.4" /></svg>;
  if (mark === "globex") return <svg className="about-trust__mobile-mark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M3.9 12h16.2M12 3.5c2.1 2.3 3.3 5.2 3.3 8.5S14.1 18.2 12 20.5C9.9 18.2 8.7 15.3 8.7 12S9.9 5.8 12 3.5Z" /></svg>;
  if (mark === "initech") return <svg className="about-trust__mobile-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5h4v14M10 19V9h4v10M16 19V3h4v16" /><path d="M3 20h18" /></svg>;
  return <svg className="about-trust__mobile-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 9-8 9-8-9 8-9Z" /><path d="m8 12 4 4 4-4-4-4-4 4Z" /></svg>;
}

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileFastTrack, setActiveMobileFastTrack] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = page.querySelectorAll<HTMLElement>("[data-about-reveal]");
    page.classList.add("about-motion-ready");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8%" });

    sections.forEach((section) => {
      if (!section.classList.contains("is-visible")) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const announceAction = (message: string) => {
    setActionMessage(message);
  };

  return (
    <div ref={pageRef} className="about-page">
      <header className="about-header">
        <div className="about-header__inner">
          <Link href="/" className="about-brand" aria-label="Boost Vertex home">
            BOOST VERTEX
          </Link>
          <nav className="about-nav" aria-label="Primary navigation">
            <a href="/#services">Services</a>
            <a href="/#case-studies">Case Studies</a>
            <Link href="/about" aria-current="page">About</Link>
            <a href="/#blog">Blog</a>
            <a href="/#contact">Contact</a>
          </nav>
          <div className="about-header__actions">
            <span>+1 (800) BOOST-VX</span>
            <a href="/#contact" className="about-button about-button--compact" data-action="book-strategy-call">
              Book a Call
            </a>
          </div>
          <button
            className="about-menu-toggle"
            type="button"
            aria-label="Toggle primary navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <nav className={`about-mobile-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Mobile primary navigation">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <a href="/#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="/#case-studies" onClick={() => setMobileMenuOpen(false)}>Case Studies</a>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} aria-current="page">About</Link>
          <a href="/#blog" onClick={() => setMobileMenuOpen(false)}>Blog</a>
          <a href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <a href="/#contact" className="about-button" data-action="book-strategy-call" onClick={() => setMobileMenuOpen(false)}>Book a Call</a>
        </nav>
      </header>

      <main>
        <section className="about-hero is-visible" data-about-reveal aria-labelledby="about-hero-heading">
          <div className="about-hero__glow" aria-hidden="true" />
          <div className="about-wrap about-hero__grid">
            <div className="about-hero__copy">
              <p className="about-eyebrow">OUR STORY</p>
              <h1 id="about-hero-heading">Built for growth.<br /><em>Focused on<br />outcomes.</em></h1>
              <p className="about-hero__lede">
                Boost Vertex combines SEO, paid media, content, web design, social marketing, and lead generation to turn attention into qualified opportunities and business growth.
              </p>
              <div className="about-hero__cta">
                <a href="/#contact" className="about-button" data-action="free-growth-plan">Get My Free Growth Plan</a>
                <a href="/#case-studies" className="about-button about-button--ghost" data-action="view-case-studies">See Our Work</a>
              </div>
            </div>
            <figure className="about-hero__visual">
              <img src="/about/hero-office.png" alt="Boost Vertex strategists working together in a meeting" />
              <aside className="about-fast-track" aria-label="Fast Track actions">
                <span>Fast Track</span>
                {heroRail.map((item) => (
                  <button key={item.label} type="button" aria-label={item.label} data-action={`fast-track-${item.label.toLowerCase()}`} onClick={() => announceAction(`${item.label} action is ready for backend connection.`)}>
                    <img src={item.icon} alt="" aria-hidden="true" />
                    <i>{item.label}</i>
                  </button>
                ))}
              </aside>
            </figure>
          </div>
        </section>

        <section className="about-origins" data-about-reveal aria-labelledby="origins-heading">
          <div className="about-wrap about-origins__inner">
            <p className="about-eyebrow">OUR ORIGINS</p>
            <h2 id="origins-heading" className="about-section-title">Our Origins</h2>
            <blockquote>
              “We started Boost Vertex in [FOUNDING YEAR] because most agencies sell hours, not outcomes. We believed businesses deserved a partner accountable to their bottom line.”
            </blockquote>
            <span className="about-quote-rule" aria-hidden="true" />
            <cite>— [FOUNDER NAME], FOUNDER</cite>
          </div>
        </section>

        <section className="about-values" data-about-reveal aria-labelledby="values-heading">
          <div className="about-wrap">
            <div className="about-trust" aria-label="Trusted by industry leaders">
              <p>TRUSTED BY INDUSTRY LEADERS</p>
              <div className="about-trust__desktop-list">
                {trustedBrands.map((brand) => (
                  <span key={brand.name} className="about-trust__brand">
                    <TrustMark mark={brand.mark} />
                    <span className="about-trust__mobile-symbol" aria-hidden="true">{brand.mobileSymbol}</span>
                    <span>{brand.name}</span>
                  </span>
                ))}
              </div>
              <div className="about-trust__mobile-list">
                {mobileTrustedBrands.map((brand) => (
                  <span key={brand.name} className="about-trust__mobile-brand">
                    <MobileTrustMark mark={brand.mark} />
                    <span>{brand.name}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="about-values__intro">
              <h2 id="values-heading" className="about-section-title">Outcomes over activity.</h2>
              <p>Our methodology is rooted in absolute transparency and relentless optimization.</p>
            </div>
            <div className="about-principles">
              {principles.map((principle) => (
                <article key={principle.title} className="about-principle">
                  <span aria-hidden="true">{principle.icon}</span>
                  <h3 data-mobile-title={principle.mobileTitle}>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-process" data-about-reveal aria-labelledby="process-heading">
          <div className="about-wrap">
            <p className="about-eyebrow">PROCESS</p>
            <h2 id="process-heading" className="about-section-title">HOW WE BOOST</h2>
            <div className="about-process__grid">
              {process.map((step) => (
                <article key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-team" data-about-reveal aria-labelledby="team-heading">
          <div className="about-wrap">
            <p className="about-eyebrow about-team__eyebrow about-section-title">Leadership</p>
            <h2 id="team-heading">The Minds Behind the Metrics</h2>
            <p className="about-team__subhead">The minds behind the growth.</p>
            <div className="about-team__grid">
              {team.map((member) => (
                <article key={member.name} className="about-member">
                  <img src={member.image} alt={`${member.name}, ${member.role}`} />
                  <h3>{member.name}</h3>
                  <p className="about-member__role">{member.role}</p>
                  <p className="about-member__summary">{member.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-recruit" data-about-reveal aria-labelledby="recruit-heading">
          <div className="about-wrap">
            <div className="about-recruit__card">
              <span className="about-recruit__icon" aria-hidden="true">↗</span>
              <div>
                <h2 id="recruit-heading">Build what’s next with us.</h2>
                <p>We’re always looking for top talent to join our mission and help engineer the future of performance marketing.</p>
              </div>
              <button type="button" className="about-button about-button--compact" data-action="view-open-roles" onClick={() => announceAction("Open roles will be available here when the careers API is connected.")}>View Open Roles</button>
            </div>
          </div>
        </section>

        <section className="about-conversion" data-about-reveal aria-labelledby="conversion-heading">
          <div className="about-conversion__desktop">
            <h2 id="conversion-heading">Let’s build a plan around your<br />goals.</h2>
            <div>
              <a href="/#contact" className="about-button about-button--dark" data-action="free-growth-plan">Get My Free Growth Plan</a>
              <a href="/#contact" className="about-button about-button--lime-outline" data-action="book-strategy-call">Book a Strategy Call</a>
            </div>
          </div>
          <div className="about-conversion__mobile">
            <h2>Ready to scale?</h2>
            <p>Join the ranks of high-growth enterprises dominating their markets.</p>
            <a href="/#contact" className="about-button about-button--dark" data-action="start-project">Start Your Project</a>
          </div>
        </section>
      </main>

      <footer className="about-footer" data-about-reveal>
        <div className="about-wrap about-footer__grid">
          <div className="about-footer__brand">
            <Link href="/">BOOST VERTEX</Link>
            <p>Precision Marketing for High-Growth Enterprises. We engineer sustainable, scalable digital growth.</p>
          </div>
          <div>
            <h2>SERVICES</h2>
            <a href="/#services">SEO Strategy</a>
            <a href="/#services">PPC Management</a>
            <a href="/#services">Content Marketing</a>
            <a href="/#services">Web Development</a>
          </div>
          <div>
            <h2>COMPANY</h2>
            <Link href="/about">About Us</Link>
            <a href="/#case-studies">Careers</a>
            <a href="/#case-studies">Case Studies</a>
            <a href="/#contact">Contact</a>
          </div>
          <div className="about-footer__connect">
            <h2>CONNECT</h2>
            <div className="about-footer__mobile-contact">
              <a href="mailto:hello@boostvertex.com" data-action="contact-email">hello@boostvertex.com</a>
              <a href="tel:+18002667889" data-action="contact-phone">+1 (800) BOOST-VX</a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" data-action="linkedin">LinkedIn</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" data-action="twitter">Twitter</a>
            </div>
            <div className="about-footer__policy-links">
              <a href="/#contact">Privacy Policy</a>
              <a href="/#contact">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="about-wrap about-footer__legal">© 2026 Boost Vertex Digital. All rights reserved.</div>
      </footer>
      <aside className="about-mobile-fast-track" aria-label="Fast Track actions">
        {heroRail.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-label={`${item.label} Boost Vertex`}
            aria-pressed={activeMobileFastTrack === item.label}
            data-action={`mobile-fast-track-${item.label.toLowerCase()}`}
            onClick={() => {
              setActiveMobileFastTrack((active) => active === item.label ? null : item.label);
              announceAction(`${item.label} action is ready for backend connection.`);
            }}
          >
            <img src={item.icon} alt="" aria-hidden="true" />
            <span>{item.label.toUpperCase()}</span>
          </button>
        ))}
      </aside>
      <p className="about-sr-status" aria-live="polite">{actionMessage}</p>
      <div className={`about-action-feedback ${actionMessage ? "is-visible" : ""}`} role="status" aria-live="polite">
        {actionMessage}
      </div>
    </div>
  );
}
