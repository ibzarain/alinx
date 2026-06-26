"use client";

import { useEffect } from "react";

const GREG_BIO = {
  paragraphs: [
    "Greg is a construction and modular manufacturing professional with over 25 years of experience, including 10+ years focused on modular and offsite construction. He has a strong background in delivering large-scale projects across residential, hospitality, care, and industrial sectors, with a focus on integrating manufacturing and construction processes.",
    "His extensive experience in modular manufacturing operations includes early involvement in the development of one of the largest steel modular manufacturing platforms in the Western Hemisphere. He contributed to product design and system development during the establishment of that operation, with a focus on aligning structural systems and building components with scalable factory production.",
    "His experience in modular project delivery includes",
    "Greg also brings a practical, operations-focused perspective that is grounded in both construction delivery and factory-based manufacturing, supporting the implementation of scalable modular building programs.",
  ],
  bullets: [
    "coordination of design, manufacturing, and site execution",
    "managing production planning, installation sequencing, and constructability",
    "providing comprehensive support for efficient and predictable outcomes across a range of building types.",
    "CSAA277-16 modular certification, including implementation, compliance, and operational oversight of certified manufacturing facilities",
    "familiarity with regulatory requirements, inspection processes, and quality control systems required to maintain compliant modular production environments.",
  ],
} as const;

export default function GregBioModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="bio-modal" role="dialog" aria-modal="true" aria-labelledby="greg-bio-title">
      <button
        type="button"
        className="bio-modal-backdrop"
        onClick={onClose}
        aria-label="Close bio"
      />
      <div className="bio-modal-panel">
        <button
          type="button"
          className="bio-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M2 2L12 12M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="team-bio-panel">
          <h3 className="team-bio-title" id="greg-bio-title">
            Greg Geml
            <br />
            General Manager
          </h3>
          <p>{GREG_BIO.paragraphs[0]}</p>
          <p>{GREG_BIO.paragraphs[1]}</p>
          <p>{GREG_BIO.paragraphs[2]}</p>
          <ul>
            {GREG_BIO.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{GREG_BIO.paragraphs[3]}</p>
        </div>
      </div>
    </div>
  );
}
