import React from "react";
import "./Section.css";

export default function Section({ id, title, children, list = [], variant }) {
  return (
    <section id={id}>
      <h2>{title}</h2>
      {children}
      {variant === "tags" && !!list.length && (
        <div className="tag-list">
          {list.map((t, i) => (
            <span className="tag" key={i}>
              {t}
            </span>
          ))}
        </div>
      )}
      {variant === "cards" && !!list.length && (
        <ul className="card-list">
          {list.map((it, i) => (
            <li key={i} className="card">
              {it.title && <div style={{ fontWeight: 600 }}>{it.title}</div>}
              {it.sub && <div className="meta">{it.sub}</div>}
              {it.meta && <div className="meta">{it.meta}</div>}
              {it.description && <div className="meta">{it.description}</div>}
              {it.tags && (
                <div className="tag-list" style={{ marginTop: ".5rem" }}>
                  {it.tags.map((t, j) => (
                    <span key={j} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {it.link && (
                <div style={{ marginTop: ".5rem" }}>
                  <a href={it.link} target="_blank" rel="noreferrer">
                    {it.linkText || "View"}
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
