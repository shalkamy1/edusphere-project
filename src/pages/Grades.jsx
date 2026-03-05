import React from 'react';
import { useLang } from '../App.jsx';

const GR = [
    { code: "CS431", name: "Advanced Web Dev", inst: "Dr. Sarah Johnson", ic: "💻", clr: "#2979ff", grade: "A", pct: 95, items: [["Project 1", 90, 100], ["Project 2", 86, 100], ["Midterm Exam", 82, 100], ["Final Project", 95, 100]] },
    { code: "MATH301", name: "Advanced Mathematics", inst: "Prof. Michael Chen", ic: "📐", clr: "#ff6d00", grade: "B+", pct: 88, items: [["Problem Set 1", 82, 100], ["Problem Set 2", 86, 100], ["Midterm Exam", 88, 100], ["Final Quiz", 87, 100]] },
    { code: "CS302", name: "Machine Learning", inst: "Dr. James Wilson", ic: "🤖", clr: "#9c27b0", grade: "A", pct: 92, items: [["Assignment 1", 88, 100], ["Assignment 2", 89, 100], ["Project", 92, 100], ["Final Exam", 95, 100]] },
];

export default function PageGrades({ t, setPage }) {
    const g = t ? t.pages2 : { gradesTitle: "📊 My Grades", gradesSub: "Track your academic performance", gpa: "Overall GPA", avg: "Avg Score", credits: "Credits", courses: "Courses", gradeBreakdown: "Grade Breakdown", improving: "▲ Improving" };
    return (
        <div className="page-enter">
            <div className="pheader" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <button onClick={() => setPage && setPage('dashboard')} className="back-btn" style={{ marginTop: 4 }}>←</button>
                <div><h1>{g.gradesTitle || "📊 My Grades"}</h1><p>{g.gradesSub || "Detailed breakdown of your academic performance"}</p></div>
            </div>
            <div className="sgrid">
                {[[g.gpa || "Overall GPA", "3.61", "red", "🎓"], [g.avg || "Avg Score", "90.4%", "grn", "📈"], [g.credits || "Credits", "16", "blu", "📚"], [g.courses || "Courses", "5", "org", "🏆"]].map(([lbl, val, cl, ic]) => (
                    <div key={lbl} className={`card scard ${cl}`}><div className={`sc-ic ${cl}`}>{ic}</div><div><div className="sc-lbl">{lbl}</div><div className="sc-val">{val}</div></div></div>
                ))}
            </div>
            {GR.map(c => (
                <div key={c.code} className="gr-course-card">
                    <div className="gr-course-hd">
                        <div className="gr-course-left">
                            <div className="gr-course-badge" style={{ background: c.clr + '22' }}>{c.ic}</div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="gr-course-code">{c.code}</span><span style={{ fontSize: 11, background: c.clr + '18', color: c.clr, padding: "1px 8px", borderRadius: 20, fontWeight: 600 }}>4 credits</span></div>
                                <div className="gr-course-name">{c.name}</div><div className="gr-course-inst">{c.inst}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div className="gr-pct-big" style={{ color: c.clr }}>{c.pct}%</div>
                            <div className="gr-grade-lbl">Grade {c.grade}</div>
                            <div style={{ fontSize: 10, color: "var(--grn)", fontWeight: 600 }}>{g.improving || "▲ Improving"}</div>
                        </div>
                    </div>
                    <div className="gr-breakdown">
                        <div className="gr-bd-title">{g.gradeBreakdown || "Grade Breakdown"}</div>
                        {c.items.map(([n, s, m]) => (
                            <div key={n} className="gr-bd-row">
                                <div className="gr-bd-name">{n}</div>
                                <div className="gr-bd-bar-wrap"><div className="gr-bd-bar" style={{ width: `${s / m * 100}%`, background: c.clr }} /></div>
                                <div className="gr-bd-score">{s}/{m}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
