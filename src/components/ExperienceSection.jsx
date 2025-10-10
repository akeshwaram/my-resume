import React from "react";
import "./ExperienceSection.css";

export default function ExperienceSection({ id, title, items = [] }) {
  return (
    <section id={id}>
      <h2>{title}</h2>
      <ul className="card-list">
        {items.map((x, i) => (
          <li key={i} className="card">
            <div style={{ fontWeight: 600 }}>
              {x.role} {x.company ? `· ${x.company}` : ""}
            </div>
            {x.period && <div className="meta">{x.period}</div>}
            {x.location && <div className="meta">{x.location}</div>}
            {x.summary && <p style={{ marginTop: ".5rem" }}>{x.summary}</p>}
            {!!(x.highlights || []).length && (
              <ul style={{ marginTop: ".5rem" }}>
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
