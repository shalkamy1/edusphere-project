import React, { useState } from 'react';
import { useLang } from '../App.jsx';

const ASGN = [
    { id: 1, code: "CS431", clr: "#e53935", name: "Web Development Project 3", desc: "Build a full-stack web app using React and Node.js", due: "Dec 15, 2024", pts: 60, st: "pending" },
    { id: 2, code: "MATH301", clr: "#ff6d00", name: "Linear Algebra Problem Set", desc: "Complete problems 1–13 from Chapter 3", due: "Dec 16, 2024", pts: 30, st: "pending" },
    { id: 3, code: "ARBLEET", clr: "#607d8b", name: "Technical Writing Essay", desc: "Write a 2,000 word essay on emerging technologies", due: "Dec 20, 2024", pts: 75, st: "pending" },
    { id: 4, code: "CS302", clr: "#9c27b0", name: "Machine Learning Assignment 2", desc: "Implement and train a neural network model", due: "Dec 12, 2024", pts: 100, st: "submitted" },
    { id: 5, code: "CS412", clr: "#e91e63", name: "Database Design Project", desc: "Design and implement a relational database", due: "Dec 22, 2024", pts: 80, st: "pending" },
    { id: 6, code: "CS431", clr: "#2979ff", name: "Semester Repo Draft", desc: "Submit a draft of your final repository documentation", due: "Nov 30, 2024", pts: 50, st: "graded", grade: "93/100" },
];

export default function PageAssignments({ t, setPage }) {
    const g = t ? t.pages2 : {};
    const [filt, setFilt] = useState("all");
    const [assignments, setAssignments] = useState(ASGN);
    const stM = {
        pending: { cls: "stbdg-pending", lbl: g.filterPending || "Pending" },
        submitted: { cls: "stbdg-submitted", lbl: g.filterSubmitted || "Submitted" },
        graded: { cls: "stbdg-graded", lbl: g.filterGraded || "Graded" }
    };
    const list = filt === "all" ? assignments : assignments.filter(a => a.st === filt);
    const handleSubmit = (id) => setAssignments(prev => prev.map(a => a.id === id ? { ...a, st: "submitted" } : a));

    return (
        <div className="page-enter">
            <div className="pheader" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <button onClick={() => setPage && setPage('dashboard')} className="back-btn" style={{ marginTop: 4 }}>←</button>
                <div><h1>{g.assignmentsTitle || "📋 Assignments"}</h1><p>{g.assignmentsSub || "Manage and track all your course assignments"}</p></div>
            </div>
            <div className="asgn-stats">
                {[[g.total || "Total", assignments.length, "var(--t1)"], [g.filterPending || "Pending", assignments.filter(a => a.st === "pending").length, "var(--org)"], [g.filterSubmitted || "Submitted", assignments.filter(a => a.st === "submitted").length, "var(--blu)"], [g.filterGraded || "Graded", assignments.filter(a => a.st === "graded").length, "var(--grn)"]].map(([l, v, c]) => (
                    <div key={l} className="asgn-stat card"><div className="asgn-stat-val" style={{ color: c }}>{v}</div><div className="asgn-stat-lbl">{l} Assignments</div></div>
                ))}
            </div>
            <div className="asgn-toolbar">
                <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
                    <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 14 }}>🔍</span>
                    <input className="asgn-search" placeholder={g.searchPlaceholder || "Search assignments..."} style={{ paddingLeft: 34 }} />
                </div>
                {["all", "pending", "submitted", "graded"].map(f => (
                    <button key={f} className="asgn-filter" onClick={() => setFilt(f)} style={filt === f ? { borderColor: "var(--red)", color: "var(--red)", background: "var(--redg)" } : {}}>
                        {{ all: "🗂 " + (g.filterAll || "All"), pending: "⏳ " + (g.filterPending || "Pending"), submitted: "📤 " + (g.filterSubmitted || "Submitted"), graded: "✅ " + (g.filterGraded || "Graded") }[f]}
                    </button>
                ))}
            </div>
            {list.map(a => (
                <div key={a.id} className="asgn-item">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <span className="asgn-course-tag" style={{ background: a.clr + '18', color: a.clr }}>{a.code}</span>
                            <div className="asgn-title" style={{ marginTop: 6 }}>{a.name}</div>
                            <div className="asgn-desc">{a.desc}</div>
                            <div className="asgn-meta"><span>📅 {a.due}</span><span>⭐ {a.pts} pts</span>{a.grade && <span style={{ color: "var(--grn)", fontWeight: 600 }}>🏆 {a.grade}</span>}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                            <span className={`stbdg ${stM[a.st].cls}`}>{stM[a.st].lbl}</span>
                            {a.st === "pending" && <button className="asgn-submit-btn sbtn-submit" onClick={() => handleSubmit(a.id)}>{g.submitBtn || "Submit"}</button>}
                            {a.st !== "pending" && <button className="asgn-submit-btn" style={{ background: "var(--bg1)", color: "var(--t2)", border: "1px solid var(--border)" }}>{g.viewFeedback || "View"}</button>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
