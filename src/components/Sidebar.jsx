import React from "react";
import "./Sidebar.css";
import VisitorCounter from "./VisitorCounter";

export default function Sidebar({ name = "Resume", links = [] }) {
  return (
    <aside className="sidebar">
      <div className="logo">{name}</div>
      <nav>
        {links.map((l) => (
          <a key={l.href} className="nav-item" href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <VisitorCounter />
    </aside>
  );
}
