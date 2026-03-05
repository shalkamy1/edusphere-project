import React, { useState } from 'react';
import { useLang } from '../App.jsx';

const INIT_ENROLLED = [
    { code: "CS431", name: "Advanced Web Development", sched: "MWF 9:00–10:30", room: "CS Lab 101", ic: "💻", clr: "#2979ff" },
    { code: "MATH301", name: "Linear Algebra", sched: "TTH 8:00–9:30", room: "Hall 201", ic: "📐", clr: "#ff6d00" },
];
const INIT_AVAIL = [
    { code: "CS412", name: "Database Systems", inst: "Dr. Bob Rodriguez", sched: "MWF 11:00–12:30", enrolled: 20, total: 30, full: false, credits: 3, tags: ["CMPE", "Available"] },
    { code: "CS302", name: "Machine Learning", inst: "Dr. James Wilson", sched: "TTH 10:00–11:30", enrolled: 30, total: 30, full: true, credits: 3, tags: ["CMPE", "Full"] },
    { code: "ARBLEET", name: "Technical Writing", inst: "Prof. Laila Ahmadi", sched: "MWF 1:00–2:00", enrolled: 20, total: 30, full: false, credits: 2, tags: ["ENGL", "Available"] },
];

export default function PageAddDrop({ setPage, t }) {
    const { lang } = useLang();
    const isRTL = lang === 'ar';
    const g = t ? t.pages2 : {};
    const [enrolled, setEnrolled] = useState(INIT_ENROLLED);
    const [avail, setAvail] = useState(INIT_AVAIL);
    const [toast, setToast] = useState(null);
    const [removing, setRemoving] = useState(null);
    const [adding, setAdding] = useState(null);
    const [search, setSearch] = useState('');

    const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

    const handleDrop = (code) => {
        setRemoving(code);
        setTimeout(() => {
            const course = enrolled.find(e => e.code === code);
            setEnrolled(prev => prev.filter(e => e.code !== code));
            setAvail(prev => {
                const exists = prev.find(a => a.code === code);
                if (exists) return prev.map(a => a.code === code ? { ...a, enrolled: Math.max(0, a.enrolled - 1), full: false } : a);
                return [...prev, { code: course.code, name: course.name, inst: "—", sched: course.sched, enrolled: 19, total: 30, full: false, credits: 3, tags: ["Available"] }];
            });
            setRemoving(null);
            showToast(`Dropped: ${code}`, "#e53935");
        }, 400);
    };

    const handleAdd = (code) => {
        const course = avail.find(a => a.code === code);
        if (course.full) return;
        setAdding(code);
        setTimeout(() => {
            setEnrolled(prev => [...prev, { code: course.code, name: course.name, sched: course.sched, room: "—", ic: "📘", clr: "#00c853" }]);
            setAvail(prev => prev.map(a => a.code === code ? { ...a, enrolled: a.enrolled + 1, full: a.enrolled + 1 >= a.total } : a).filter(a => a.code !== code));
            setAdding(null);
            showToast(`Added: ${code}`, "#00c853");
        }, 400);
    };

    const filteredAvail = avail.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        a.inst.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-enter" dir={isRTL ? 'rtl' : 'ltr'}>
            {toast && <div className="toast-msg" style={{ background: toast.color }}>{toast.msg}</div>}

            {/* Header with back button */}
            <div className="pheader" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <button onClick={() => setPage && setPage('dashboard')} className="back-btn" style={{ marginTop: 4 }}>
                    {isRTL ? '→' : '←'}
                </button>
                <div style={{ flex: 1 }}>
                    <h1>{g.addDropTitle || "Add / Drop Courses"}</h1>
                    <p>{g.addDropSub || "Manage your course enrollment for Spring 2024"}</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                {[["📚", g.myEnrolled || "Enrolled Courses", String(enrolled.length), "red"], ["⚡", "Lab Credits", "7", "blu"], ["✅", g.availCourses || "Available Courses", String(avail.filter(a => !a.full).length), "grn"]].map(([ic, lbl, val, cl]) => (
                    <div key={lbl} className={`card scard ${cl}`}>
                        <div className={`sc-ic ${cl}`}>{ic}</div>
                        <div>
                            <div className="sc-lbl">{lbl}</div>
                            <div className="sc-val">{val}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ad-grid">
                {/* My Courses */}
                <div className="ad-card">
                    <div className="ad-card-hd">
                        <span>{g.myEnrolled || "My Courses"}</span>
                        <span className="ad-badge-enrolled">{enrolled.length} enrolled</span>
                    </div>
                    {enrolled.length === 0 && <div className="ad-empty">No courses enrolled yet.</div>}
                    {enrolled.map(e => (
                        <div
                            key={e.code}
                            className={`ad-enrolled-item${removing === e.code ? ' ad-removing' : ''}`}
                        >
                            <div className="ad-enr-ic" style={{ background: e.clr + '22' }}>{e.ic}</div>
                            <div style={{ flex: 1 }}>
                                <div className="ad-enr-code">{e.code} — {e.name}</div>
                                <div className="ad-enr-sched">🕐 {e.sched} &nbsp;📍 {e.room}</div>
                            </div>
                            <button
                                className="ad-drop-btn-new"
                                title="Drop course"
                                onClick={() => handleDrop(e.code)}
                                disabled={removing === e.code}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                {g.dropBtn || "Drop"}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Available Courses */}
                <div className="ad-card">
                    <div className="ad-card-hd">
                        <span>{g.availCourses || "Available Courses"}</span>
                        <div className="ad-search-wrap">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input
                                className="ad-search-input"
                                placeholder="Search courses..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    {filteredAvail.length === 0 && <div className="ad-empty">No available courses.</div>}
                    {filteredAvail.map(a => (
                        <div key={a.code} className={`ad-avail-item${adding === a.code ? ' ad-adding' : ''}`}>
                            <div className="ad-avail-top">
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <div className="ad-avail-code">{a.code}</div>
                                        {a.tags && a.tags.map(tag => (
                                            <span key={tag} className={`ad-tag${tag === 'Full' ? ' ad-tag-full' : tag === 'Available' ? ' ad-tag-avail' : ''}`}>{tag}</span>
                                        ))}
                                    </div>
                                    <div className="ad-avail-name">{a.name}</div>
                                    <div className="ad-avail-meta">
                                        <span>👤 {a.inst}</span>
                                        <span>🕐 {a.sched}</span>
                                        <span>📚 {a.credits} cr</span>
                                    </div>
                                </div>
                                <button
                                    className={a.full ? "ad-add-btn-disabled" : "ad-add-btn-new"}
                                    disabled={a.full || adding === a.code}
                                    onClick={() => handleAdd(a.code)}
                                >
                                    {a.full ? (
                                        "Full"
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                            {g.addBtn || "Add"}
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="ad-enroll-bar">
                                <div className={`ad-enroll-fill${a.full ? " full" : ""}`} style={{ width: `${a.enrolled / a.total * 100}%` }} />
                            </div>
                            <div className="ad-enroll-count">{a.enrolled}/{a.total} enrolled</div>
                        </div>
                    ))}
                    <div className="ad-footer">
                        <button className="ad-cancel-btn" onClick={() => setPage('dashboard')}>
                            {g.cancelBtn || "Cancel Changes"}
                        </button>
                        <button className="ad-save-btn" onClick={() => showToast("Enrollment Saved!", "#00c853")}>
                            {g.saveBtn || "Save Enrollment"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
