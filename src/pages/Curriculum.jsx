import React from 'react';
import { useLang } from '../App.jsx';

const CUR_YEARS = [
    {
        year: "First Year", sems: [
            { sem: "Fall 2022", courses: [{ code: "CS101", name: "Intro to CS", st: "done" }, { code: "MATH101", name: "Calculus I", st: "done" }, { code: "ENG101", name: "English I", st: "done" }, { code: "PHYS101", name: "Physics I", st: "done" }] },
            { sem: "Spring 2023", courses: [{ code: "CS102", name: "Programming Basics", st: "done" }, { code: "MATH102", name: "Calculus II", st: "done" }, { code: "ENG102", name: "English II", st: "done" }, { code: "PHYS102", name: "Physics II", st: "done" }] },
        ]
    },
    {
        year: "Second Year", sems: [
            { sem: "Fall 2023", courses: [{ code: "CS201", name: "Data Structures", st: "done" }, { code: "CS203", name: "OOP", st: "done" }, { code: "MATH201", name: "Linear Algebra", st: "done" }, { code: "SOC201", name: "Society & Tech", st: "done" }] },
            { sem: "Spring 2024", courses: [{ code: "CS211", name: "Algorithms", st: "done" }, { code: "CS214", name: "OS Concepts", st: "done" }, { code: "MATH204", name: "Discrete Math", st: "done" }, { code: "HUM206", name: "Humanities", st: "done" }] },
        ]
    },
    {
        year: "Third Year", sems: [
            { sem: "Fall 2024", courses: [{ code: "CS301", name: "Database Systems", st: "done" }, { code: "CS302", name: "Software Eng", st: "done" }, { code: "CS303", name: "Networks", st: "done" }, { code: "HUM301", name: "Research Methods", st: "done" }] },
            { sem: "Spring 2025", courses: [{ code: "CS311", name: "AI Fundamentals", st: "prog" }, { code: "CS321", name: "Web Development", st: "prog" }, { code: "MATH301", name: "Prob & Stats", st: "prog" }, { code: "ENG301", name: "Technical Writing", st: "prog" }] },
        ]
    },
    {
        year: "Fourth Year", sems: [
            { sem: "Fall 2025", courses: [{ code: "CS401", name: "Graduation Project", st: "pend" }, { code: "CS411", name: "Machine Learning", st: "pend" }, { code: "CS421", name: "Cloud Computing", st: "pend" }] },
            { sem: "Spring 2026", courses: [{ code: "CS431", name: "Adv Web Dev", st: "pend" }, { code: "CS441", name: "Security", st: "pend" }, { code: "CS451", name: "Capstone", st: "pend" }] },
        ]
    },
];

const ST_CFG = {
    done: { label: "Done", cls: "crs-done", dot: "#00c853" },
    prog: { label: "In Progress", cls: "crs-prog", dot: "#2979ff" },
    pend: { label: "Pending", cls: "crs-pend", dot: "#888" },
};

export default function PageCurriculum() {
    const { t } = useLang();
    const c = t.curriculum;

    const STATS = [
        { label: c.overallProgress, val: "63%", sub: c.ofCurriculum, color: "var(--red)", icon: "📈" },
        { label: c.creditHours, val: "75", sub: c.completed, color: "var(--blu)", icon: "📚" },
        { label: c.currentGpa, val: "3.8", sub: c.outOf, color: "#00c853", icon: "⭐" },
        { label: c.remaining, val: "45", sub: c.creditLeft, color: "var(--org)", icon: "🎯" },
    ];

    return (
        <div className="page-enter">
            {/* Header */}
            <div className="cur-page-header">
                <div className="cur-header-ic">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                </div>
                <div>
                    <h1 className="cur-page-title">{c.title}</h1>
                    <p className="cur-page-sub">Bachelor of Science in Computer Science</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="cur2-stats">
                {STATS.map(s => (
                    <div key={s.label} className="cur2-stat-card">
                        <div className="cur2-stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
                        <div>
                            <div className="cur2-stat-val" style={{ color: s.color }}>{s.val}</div>
                            <div className="cur2-stat-label">{s.label}</div>
                            <div className="cur2-stat-sub">{s.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="cur2-prog-bar-wrap">
                <div className="cur2-prog-label">
                    <span>Curriculum Progress</span>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>63%</span>
                </div>
                <div className="cur2-prog-track">
                    <div className="cur2-prog-fill" style={{ width: '63%' }} />
                </div>
            </div>

            {/* Years */}
            {CUR_YEARS.map(y => (
                <div key={y.year} className="cur2-year-block">
                    <div className="cur2-year-title">{y.year}</div>
                    <div className="cur2-sem-grid">
                        {y.sems.map(s => (
                            <div key={s.sem} className="cur2-sem-card">
                                <div className="cur2-sem-header">{s.sem}</div>
                                <div className="cur2-crs-list">
                                    {s.courses.map(cr => {
                                        const cfg = ST_CFG[cr.st];
                                        return (
                                            <div key={cr.code} className="cur2-crs-row">
                                                <div className="cur2-crs-dot" style={{ background: cfg.dot }} />
                                                <div className="cur2-crs-info">
                                                    <span className="cur2-crs-code">{cr.code}</span>
                                                    <span className="cur2-crs-name">{cr.name}</span>
                                                </div>
                                                <span className={`cur2-crs-badge ${cfg.cls}`}>{cfg.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
