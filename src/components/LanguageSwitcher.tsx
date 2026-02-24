"use client";

import React, { useState, useRef, useEffect } from "react";
import { Language, LANGUAGE_META } from "@/i18n/translations";
import { useT } from "@/context/LanguageContext";
import { ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
    const { lang, setLanguage } = useT();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const current = LANGUAGE_META[lang];

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            {/* Trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
                id="language-switcher-btn"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "4px 8px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.2)";
                    e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                }}
            >
                <span style={{ fontSize: "14px", lineHeight: 1 }}>{current.flag}</span>
                <span>{current.label}</span>
                <ChevronDown
                    size={11}
                    style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 6px)",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-lg)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        overflow: "hidden",
                        zIndex: 1000,
                        minWidth: "150px",
                        animation: "dropdown-in 0.12s ease-out",
                    }}
                >
                    {(Object.keys(LANGUAGE_META) as Language[]).map((code) => {
                        const meta = LANGUAGE_META[code];
                        const isActive = lang === code;
                        return (
                            <button
                                key={code}
                                id={`lang-${code}-btn`}
                                onClick={() => {
                                    setLanguage(code);
                                    setOpen(false);
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "9px 14px",
                                    background: isActive
                                        ? "rgba(99,102,241,0.18)"
                                        : "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    fontSize: "13px",
                                    color: isActive
                                        ? "var(--text-primary)"
                                        : "var(--text-secondary)",
                                    textAlign: "left",
                                    transition: "background 0.12s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive)
                                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.background = "transparent";
                                }}
                            >
                                <span style={{ fontSize: "18px", lineHeight: 1 }}>
                                    {meta.flag}
                                </span>
                                <span>{meta.label}</span>
                                {isActive && (
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            fontSize: "11px",
                                            color: "var(--accent-primary)",
                                        }}
                                    >
                                        ✓
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
