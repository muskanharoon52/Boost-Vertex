import { FormEvent, useMemo, useState } from "react";
import { blogCategories, blogPosts } from "@/data/blogContent";
import { MarketingFooter, MarketingHeader } from "@/components/MarketingChrome";
import { BarChart3, Box, Cloud, Landmark, ShieldCheck } from "lucide-react";

// Blog List style contract: desktop retains paired evidence cards; mobile shifts to a short image-led hero and single-column editorial card flow from the Figma frame.

const fastTrack = [
  ["Call", "tel:+18002667889"],
  ["Chat", "#chat"],
  ["Book", "#book"],
  ["Inquiry", "#inquiry"],
] as const;

const trustedBrands = [
  { name: "TECHFLOW", Icon: Box },
  { name: "NEXUS CAPITAL", Icon: Landmark },
  { name: "SAAS CORE", Icon: Cloud },
  { name: "DATAVANTAGE", Icon: BarChart3 },
  { name: "SENTINEL", Icon: ShieldCheck },
] as const;

export default function BlogList() {
  const [activeCategory, setActiveCategory] = useState<(typeof blogCategories)[number]>("All");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const visiblePosts = useMemo(
    () => activeCategory === "All" ? blogPosts : blogPosts.filter((post) => post.category === activeCategory),
    [activeCategory],
  );

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setMessage("Enter a valid work email to subscribe.");
      return;
    }
    setMessage("Subscription request is ready for backend connection.");
    setEmail("");
  };

  return (
    <main className="mv-blog-page">
      <MarketingHeader active="blog" />
      <section className="mv-blog-hero" aria-label="Boost Vertex blogs">
        <div className="mv-blog-hero__image" role="img" aria-label="Dark executive workspace overlooking a mountain valley" />
        <div className="mv-blog-hero__scrim" />
        <p className="mv-blog-hero__eyebrow">OUR BLOGS</p>
      </section>

      <section className="mv-blog-editorial mv-wrap" data-page-reveal>
        <div className="mv-blog-trust" aria-label="Trusted by industry leaders">
          <p>TRUSTED BY INDUSTRY LEADERS</p>
          <div>{trustedBrands.map(({ name, Icon }) => <span key={name}><Icon aria-hidden="true" />{name}</span>)}</div>
        </div>
        <aside className="mv-blog-fast-track" aria-label="Fast Track actions">
          <span>Fast Track</span>
          {fastTrack.map(([label, href]) => (
            <a key={label} href={href} aria-label={`${label} Boost Vertex`} data-action={`blog-fast-track-${label.toLowerCase()}`} onClick={(event) => {
              if (href.startsWith("#")) event.preventDefault();
              setMessage(`${label} action is ready for backend connection.`);
            }}>
              <img src={label === "Call" ? "/46-537.svg" : label === "Chat" ? "/46-542.svg" : label === "Book" ? "/46-547.svg" : "/46-552.svg"} alt="" />
            </a>
          ))}
        </aside>
        <div className="mv-blog-intro">
          <h1>Insights &amp; Growth Strategies</h1>
          <p>Expert perspectives, tactical playbooks, and industry analysis to scale your digital presence.</p>
        </div>

        <div className="mv-blog-filters" role="tablist" aria-label="Blog categories">
          {blogCategories.map((category) => (
            <button key={category} type="button" role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? "is-active" : ""} onClick={() => setActiveCategory(category)} data-action={`blog-filter-${category.toLowerCase().replaceAll(" ", "-")}`}>
              {category}
            </button>
          ))}
        </div>

        <div className="mv-blog-grid" aria-live="polite">
          {visiblePosts.map((post) => (
            <article className="mv-blog-card" key={post.id}>
              <img src={post.image} alt="" />
              <div>
                <div className="mv-blog-card__meta"><p>{post.category}</p><small>{post.readTime}</small></div>
                <h2>{post.title}</h2>
                <span>{post.summary}</span>
                <button type="button" data-action={`read-blog-${post.slug}`} onClick={() => setMessage(`${post.title} is ready for the Blog Detail route.`)}><span className="mv-blog-read-desktop">Read More</span><span className="mv-blog-read-mobile">Read Article</span> <b>→</b></button>
              </div>
            </article>
          ))}
        </div>

        <button type="button" className="mv-blog-load" data-action="load-more-posts" onClick={() => setMessage("More posts will load from the backend content service.")}>LOAD MORE ARTICLES <span>↓</span></button>
      </section>

      <section className="mv-blog-newsletter" data-page-reveal>
        <div className="mv-wrap mv-blog-newsletter__inner">
          <div><h2>Get smarter about<br />growth.</h2><span>Join 10,000+ executives receiving our weekly strategy teardowns and actionable marketing insights.</span></div>
          <form onSubmit={subscribe} noValidate>
            <label className="mv-sr-only" htmlFor="blog-email">Work email</label>
            <div className="mv-blog-newsletter__fields"><input id="blog-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your work email" /><button type="submit" data-action="subscribe-vertex-brief">Subscribe</button></div>
            <small>We respect your inbox. Unsubscribe at any time.</small>
          </form>
        </div>
      </section>

      <section className="mv-blog-conversion" data-page-reveal>
        <div className="mv-wrap"><h2>Ready to scale?</h2><p>Stop leaving revenue on the table. Partner with Boost Vertex to build a data-driven growth engine that outpaces the competition.</p><a href="/#contact" className="mv-button" data-action="blog-conversion-call">Book Your Discovery Call <span>→</span></a></div>
      </section>
      <MarketingFooter />
      <p className="mv-sr-status" aria-live="polite">{message}</p>
      <div className={`mv-action-feedback ${message ? "is-visible" : ""}`} role="status" aria-live="polite">{message}</div>
    </main>
  );
}
