import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Section from "./components/Section.jsx";
import ResumeMatcherSection from "./components/ResumeMatcherSection.jsx";
import "./App.css";

export default function App({ resumeData }) {
  const about = resumeData?.about || {};
  const [showTop, setShowTop] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current || window;
    const getScrollTop = () =>
      scrollRef.current
        ? scrollRef.current.scrollTop
        : window.pageYOffset || document.documentElement.scrollTop;

    const onScroll = () => setShowTop(getScrollTop() > 300);

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Sidebar
        name={about?.name}
        links={[
          { href: "#about", label: "About" },
          { href: "#resume-matcher", label: "AI Job Match" },
          { href: "#skills", label: "Skills" },
          { href: "#certs", label: "Certifications" },
          { href: "#experience", label: "Experience" },
          // { href: "#projects", label: "Projects" },
          { href: "#education", label: "Education" },
          { href: "#contact", label: "Contact" },
        ]}
      />

      <main id="main-content" className="app-content" role="main">
        <Section id="about" title="About">
          {about?.content && <p>{about.content}</p>}
          {about?.location && (
            <p className="meta">Location: {about.location}</p>
          )}
        </Section>
        <ResumeMatcherSection resumeData={resumeData} />
        <Section
          id="skills"
          title="Skills"
          variant="tags"
          list={resumeData?.skills?.list || []}
        />
        <Section
          id="certs"
          title="Certifications"
          variant="simple"
          list={(resumeData?.certifications?.list || []).map((c) => ({
            title: c.name,
            sub: c.issuer,
            meta: c.date,
            link: c.url,
          }))}
        />
        <Section
          id="experience"
          title="Experience"
          variant="experience"
          list={(resumeData?.experience?.list || []).map((exp) => ({
            title: exp.role,
            sub: exp.company,
            meta: `${exp.period}${exp.location ? ' • ' + exp.location : ''}`,
            description: exp.summary,
            highlights: exp.highlights || []
          }))}
        />

        {/* <Section
          id="projects"
          title="Projects"
          variant="cards"
          list={(resumeData?.projects?.list || []).map((p) => {
            if (typeof p === "string") return { title: p };
            return {
              title: p.title || p.name,
              description: p.description,
              tags: p.stack || p.tags,
              link: p.url,
            };
          })}
        /> */}

        <Section
          id="education"
          title="Education"
          variant="simple"
          list={(resumeData?.education?.list || []).map((e) => ({
            title: e.degree,
            sub: [e.college, e.location].filter(Boolean).join(", "),
            meta: e.period,
          }))}
        />

        <Section
          id="contact"
          title="Contact"
          variant="simple"
          list={(resumeData?.contact?.items || []).map((c) => ({
            title: c.label,
            linkText: c.value,
            link: c.href,
          }))}
        />
      </main>

      {showTop && (
        <button
          type="button"
          className="go-top"
          aria-label="Go to top"
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}
    </div>
  );
}
