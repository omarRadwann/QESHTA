"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./filter-dropdown.module.css";

type FilterDropdownProps = {
  label: string;
  summary?: string;
  badge?: number;
  align?: "left" | "right";
  children: ReactNode;
};

export function FilterDropdown({
  label,
  summary,
  badge,
  align = "left",
  children,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    function onDocPointer(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
  }, []);

  function clearHoverTimer() {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  // Hover is a progressive enhancement; click/focus is the primary interaction.
  function handleEnter() {
    clearHoverTimer();
    hoverTimer.current = window.setTimeout(() => setOpen(true), 110);
  }
  function handleLeave() {
    clearHoverTimer();
    hoverTimer.current = window.setTimeout(() => setOpen(false), 160);
  }

  return (
    <div
      className={styles.dropdown}
      ref={containerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={`${styles.trigger} ${badge ? styles.active : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.triggerLabel}>
          {label}
          {summary ? <em>{summary}</em> : null}
        </span>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
        <svg
          className={styles.caret}
          viewBox="0 0 12 8"
          width="11"
          height="8"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M1 1.5 6 6.5 11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <div
          className={`${styles.panel} ${align === "right" ? styles.panelRight : ""}`}
          role="group"
          aria-label={label}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
