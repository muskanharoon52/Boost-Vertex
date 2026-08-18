import { useState } from "react";
import { Link } from "wouter";

// Marketing chrome style contract: compact obsidian navigation, electric-lime conversion accents,
// Chivo display typography, accessible mobile routing, and route-scoped footer variants that preserve approved pages.

type ActiveRoute = "services" | "case-studies" | "about" | "blog";

const fastTrackActions = [
  { label: "Call", icon: "/46-537.svg" },
  { label: "Chat", icon: "/46-542.svg" },
  { label: "Book", icon: "/46-547.svg" },
  { label: "Inquiry", icon: "/46-552.svg" },
] as const;

export function MarketingHeader({ active }: { active: ActiveRoute }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="mv-header">
      <div className="mv-header__inner">
        <Link href="/" className="mv-brand" aria-label="Boost Vertex home">BOOST VERTEX</Link>
        <nav className="mv-nav" aria-label="Primary navigation">
          <Link href="/services" aria-current={active === "services" ? "page" : undefined}>Services</Link>
          <Link href="/case-studies" aria-current={active === "case-studies" ? "page" : undefined}>Case Studies</Link>
          <Link href="/about" aria-current={active === "about" ? "page" : undefined}>About</Link>
          <Link href="/blog" aria-current={active === "blog" ? "page" : undefined}>Blog</Link>
          <a href="/#contact">Contact</a>
        </nav>
        <div className="mv-header__actions">
          <span>+1 (800) BOOST-VX</span>
          <a href="/#contact" className="mv-button mv-button--compact" data-action="book-strategy-call">Book a Strategy Call</a>
        </div>
        <button className="mv-menu-toggle" type="button" aria-label="Toggle primary navigation" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
          <span /><span /><span />
        </button>
      </div>
      <nav className={`mv-mobile-nav ${isOpen ? "is-open" : ""}`} aria-label="Mobile primary navigation">
        <Link href="/" onClick={closeMenu}>Home</Link>
        <Link href="/services" onClick={closeMenu}>Services</Link>
        <Link href="/case-studies" onClick={closeMenu}>Case Studies</Link>
        <Link href="/about" onClick={closeMenu}>About</Link>
        <Link href="/blog" onClick={closeMenu}>Blog</Link>
        <a href="/#contact" onClick={closeMenu}>Contact</a>
        <a href="/#contact" className="mv-button" data-action="book-strategy-call" onClick={closeMenu}>Book a Strategy Call</a>
      </nav>
    </header>
  );
}

export function MarketingFooter({ variant = "default" }: { variant?: "default" | "services" }) {
  const isServices = variant === "services";

  return (
    <footer className={`mv-footer ${isServices ? "mv-footer--services" : ""}`} data-page-reveal>
      <div className="mv-wrap mv-footer__grid">
        <div className="mv-footer__brand">
          <Link href="/">BOOST VERTEX</Link>
          <p>Precision marketing for high-growth enterprises. We engineer measurable, scalable digital growth.</p>
        </div>
        <div>
          <h2>SERVICES</h2>
          <span className="mv-footer__pending-link">SEO Strategy</span>
          <span className="mv-footer__pending-link">Paid Social</span>
          <span className="mv-footer__pending-link">Performance Media</span>
          <span className="mv-footer__pending-link">Web Development</span>
          {isServices && <div className="mv-footer__mobile-copy"><span>SEO Strategy</span><span>PPC Management</span><span>Content Marketing</span><span>Web Development</span></div>}
        </div>
        <div>
          <h2>COMPANY</h2>
          <Link href="/about">About Us</Link>
          <Link href="/case-studies">Case Studies</Link>
          <Link href="/blog">Resources</Link>
          <a href="/#contact">Contact</a>
          {isServices && <div className="mv-footer__mobile-copy"><Link href="/about">About Us</Link><a href="/#careers">Careers</a><Link href="/case-studies">Case Studies</Link><a href="/#contact">Contact</a></div>}
        </div>
        <div>
          <h2>CONNECT</h2>
          <a href="mailto:hello@boostvertex.com">hello@boostvertex.com</a>
          <a href="tel:+18002667889">+1 (800) BOOST-VX</a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
        </div>
      </div>
      <div className="mv-wrap mv-footer__legal">© 2026 Boost Vertex Digital. All rights reserved.{isServices && <span className="mv-footer__mobile-legal-links"><a href="/#privacy">Privacy Policy</a><a href="/#terms">Terms of Service</a></span>}</div>
    </footer>
  );
}

export function MobileFastTrack() {
  const [active, setActive] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  return (
    <>
      <aside className="mv-mobile-fast-track" aria-label="Fast Track actions">
        {fastTrackActions.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-label={`${item.label} Boost Vertex`}
            aria-pressed={active === item.label}
            data-action={`mobile-fast-track-${item.label.toLowerCase()}`}
            onClick={() => {
              setActive((value) => value === item.label ? null : item.label);
              setMessage(`${item.label} action is ready for backend connection.`);
            }}
          >
            <img src={item.icon} alt="" aria-hidden="true" />
            <span>{item.label.toUpperCase()}</span>
          </button>
        ))}
      </aside>
      <p className="mv-sr-status" aria-live="polite">{message}</p>
      <div className={`mv-action-feedback ${message ? "is-visible" : ""}`} role="status" aria-live="polite">{message}</div>
    </>
  );
}
