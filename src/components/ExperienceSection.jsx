import React from "react";
import "./ExperienceSection.css";

export default function ExperienceSection({ id, title, items = [] }) {
  return (
    <section id={id} className="experience-section">
      <h2>{title}</h2>
      <ul className="experience-list">
        {items.map((x, i) => (
          <li key={i} className="experience-card">
            <div className="experience-header">
              <div className="experience-title">{x.role}</div>
              {x.company && <div className="experience-company">{x.company}</div>}
            </div>
            
            <div className="experience-meta">
              {x.period && <div className="experience-period">{x.period}</div>}
              {x.location && <div className="experience-location">{x.location}</div>}
            </div>
            
            {x.summary && <p className="experience-summary">{x.summary}</p>}
            
            {!!(x.highlights || []).length && (
              <ul className="experience-highlights">
                {x.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
