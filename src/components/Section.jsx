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

      {variant === "simple" && !!list.length && (
        <div className="simple-list">
          {list.map((it, i) => (
            <div key={i} className="simple-item">
              <div className="simple-content">
                {it.title && <strong>{it.title}</strong>}
                {it.sub && <span>{it.title ? ' - ' : ''}{it.sub}</span>}
                {it.meta && <span> ({it.meta})</span>}
                {it.link && (
                  <span>{it.title || it.sub ? ' - ' : ''}<a href={it.link} target="_blank" rel="noreferrer">{it.linkText || "View"}</a></span>
                )}
              </div>
              {it.description && <div style={{ marginTop: "4px", fontSize: "14px", color: "#666" }}>{it.description}</div>}
            </div>
          ))}
        </div>
      )}
      {variant === "experience" && !!list.length && (
        <div className="experience-simple-list">
          {list.map((exp, i) => (
            <div key={i} className="experience-simple-item">
              <div className="experience-simple-header">
                {exp.title && <strong>{exp.title}</strong>}
                {exp.sub && <span> at {exp.sub}</span>}
              </div>
              {exp.meta && <div style={{ fontSize: "14px", color: "#666", marginTop: "2px" }}>{exp.meta}</div>}
              {exp.description && <div style={{ marginTop: "6px", fontSize: "15px", color: "#374151" }}>{exp.description}</div>}
              {exp.highlights && exp.highlights.length > 0 && (
                <ul style={{ marginTop: "8px", paddingLeft: "20px", fontSize: "14px", color: "#4b5563" }}>
                  {exp.highlights.map((highlight, j) => (
                    <li key={j} style={{ marginBottom: "4px", lineHeight: "1.4" }}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      {variant === "compact" && !!list.length && (
        <ul className="compact-list">
          {list.map((it, i) => {
            // Check if there's any text content besides the link
            const hasTextContent = it.title || it.sub || it.meta;
            
            return (
              <li key={i} className="compact-item">
                <div className={`compact-content ${!hasTextContent ? 'compact-content-link-only' : ''}`}>
                  {it.title && <span className="compact-title">{it.title}</span>}
                  {it.sub && <span className="compact-sub">{it.sub}</span>}
                  {it.meta && <span className="compact-meta">{it.meta}</span>}
                  {it.link && (
                    <a href={it.link} target="_blank" rel="noreferrer" className="compact-link">
                      {it.linkText || "View"}
                    </a>
                  )}
                </div>
                {it.description && <div className="compact-description">{it.description}</div>}
                {it.tags && (
                  <div className="compact-tags">
                    {it.tags.map((t, j) => (
                      <span key={j} className="compact-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
