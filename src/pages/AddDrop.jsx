import React, { useState } from 'react';
import { useLang } from '../App.jsx';

/* ── COURSE DATA ─────────────────────────────────────────────── */
const ALL_COURSES = [
    { code: "CS412",   name: "Database Systems",      inst: "Dr. Bob Rodriguez",  sched: "MWF 11:00–12:30", enrolled: 20, total: 30, full: false, credits: 3, gpaImpact: 3.8, difficulty: "Medium", tags: ["CMPE", "Available"], ic: "🗄️",  clr: "#2979ff" },
    { code: "CS302",   name: "Machine Learning",       inst: "Dr. James Wilson",   sched: "TTH 10:00–11:30", enrolled: 30, total: 30, full: true,  credits: 3, gpaImpact: 2.9, difficulty: "Hard",   tags: ["CMPE", "Full"],      ic: "🤖",  clr: "#e53935" },
    { code: "ARBLEET", name: "Technical Writing",      inst: "Prof. Laila Ahmadi", sched: "MWF 1:00–2:00",   enrolled: 20, total: 30, full: false, credits: 2, gpaImpact: 3.9, difficulty: "Easy",   tags: ["ENGL", "Available"], ic: "✍️",  clr: "#ff6d00" },
    { code: "IT205",   name: "IT Ethics & Society",    inst: "Dr. Sara North",     sched: "TTH 2:00–3:30",   enrolled: 15, total: 35, full: false, credits: 2, gpaImpact: 4.0, difficulty: "Easy",   tags: ["IT",   "Available"], ic: "⚖️",  clr: "#00c853" },
    { code: "MATH401", name: "Discrete Mathematics",   inst: "Dr. Ahmed Khalil",   sched: "MWF 8:00–9:30",   enrolled: 22, total: 30, full: false, credits: 4, gpaImpact: 2.7, difficulty: "Hard",   tags: ["MATH", "Available"], ic: "📐",  clr: "#7c4dff" },
    { code: "CS350",   name: "Software Engineering",   inst: "Dr. Chen Liu",       sched: "TTH 11:00–12:30", enrolled: 18, total: 25, full: false, credits: 4, gpaImpact: 3.4, difficulty: "Medium", tags: ["CMPE", "Available"], ic: "💻",  clr: "#0097a7" },
    { code: "ENG201",  name: "Business English",       inst: "Prof. Mark Adams",   sched: "MWF 3:00–4:00",   enrolled: 10, total: 40, full: false, credits: 3, gpaImpact: 3.7, difficulty: "Easy",   tags: ["ENGL", "Available"], ic: "📝",  clr: "#f57c00" },
];

const INIT_ENROLLED = [
    { code: "CS431",   name: "Advanced Web Development", sched: "MWF 9:00–10:30", room: "CS Lab 101", ic: "💻", clr: "#2979ff" },
    { code: "MATH301", name: "Linear Algebra",            sched: "TTH 8:00–9:30",  room: "Hall 201",   ic: "📐", clr: "#ff6d00" },
];

const DIFFICULTY_COLOR = { Easy: "#00c853", Medium: "#ff9100", Hard: "#e53935" };

/* ── MAIN COMPONENT ──────────────────────────────────────────── */
export default function PageAddDrop({ setPage, t, goal: initialGoal, onGoalSelect, onRequestGoal, onCourseDrop }) {
    const { lang } = useLang();
    const isRTL = lang === 'ar';
    const g = t ? t.pages2 : {};

    const enrolledCodes = INIT_ENROLLED.map(e => e.code);
    const [enrolled, setEnrolled] = useState(INIT_ENROLLED);
    const [avail, setAvail] = useState(ALL_COURSES.filter(c => !enrolledCodes.includes(c.code)));
    const [toast, setToast] = useState(null);
    const [removing, setRemoving] = useState(null);
    const [adding, setAdding] = useState(null);
    const [search, setSearch] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [goal, setGoal] = useState(initialGoal || null);

    const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

    // When goal is selected from the App-level modal
    const handleGoalSelect = (g) => {
        setGoal(g);
        setShowAll(false);
        if (onGoalSelect) onGoalSelect(g);
    };

    // Sync goal prop when changed from outside
    React.useEffect(() => {
        if (initialGoal !== undefined) setGoal(initialGoal);
    }, [initialGoal]);

    const getRecommended = () => {
        const available = avail.filter(a => !a.full);
        if (goal === 'gpa') return [...available].sort((a, b) => b.gpaImpact - a.gpaImpact).slice(0, 3);
        if (goal === 'req') return [...available].sort((a, b) => b.credits - a.credits).slice(0, 3);
        return [];
    };
    const recommended = getRecommended();
    const recommendedCodes = new Set(recommended.map(r => r.code));

    const handleDrop = (code) => {
        setRemoving(code);
        setTimeout(() => {
            setEnrolled(prev => prev.filter(e => e.code !== code));
            setAvail(prev => {
                const exists = prev.find(a => a.code === code);
                if (exists) return prev.map(a => a.code === code ? { ...a, enrolled: Math.max(0, a.enrolled - 1), full: false } : a);
                const full = ALL_COURSES.find(c => c.code === code) || {};
                return [...prev, { ...full, enrolled: 19, total: 30, full: false }];
            });
            setRemoving(null);
            if (onCourseDrop) onCourseDrop(code);
            showToast(`Dropped: ${code}`, "#e53935");
        }, 400);
    };

    const handleAdd = (code) => {
        const course = avail.find(a => a.code === code);
        if (!course || course.full) return;
        setAdding(code);
        setTimeout(() => {
            setEnrolled(prev => [...prev, { code: course.code, name: course.name, sched: course.sched, room: "—", ic: course.ic || "📘", clr: course.clr || "#00c853" }]);
            setAvail(prev => prev.map(a => a.code === code ? { ...a, enrolled: a.enrolled + 1, full: a.enrolled + 1 >= a.total } : a).filter(a => a.code !== code));
            setAdding(null);
            showToast(`Added: ${code}`, "#00c853");
        }, 400);
    };

    const filteredAvail = avail.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        (a.inst || '').toLowerCase().includes(search.toLowerCase())
    );

    const displayList = goal && !showAll && !search
        ? [...filteredAvail.filter(a => recommendedCodes.has(a.code)), ...filteredAvail.filter(a => !recommendedCodes.has(a.code))]
        : filteredAvail;

    const goalMeta = goal === 'gpa'
        ? { label: 'Improve GPA', color: '#2979ff', bg: 'rgba(41,121,255,0.1)', icon: '📈', tip: 'Sorted by GPA impact — easiest courses first' }
        : goal === 'req'
        ? { label: 'Complete Requirements', color: '#00c853', bg: 'rgba(0,200,83,0.1)', icon: '🎯', tip: 'Sorted by credit hours — fastest path to graduation' }
        : null;

    return (
        <div className="page-enter" dir={isRTL ? 'rtl' : 'ltr'}>
            {toast && <div className="toast-msg" style={{ background: toast.color }}>{toast.msg}</div>}

            {/* Header */}
            <div className="pheader" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => setPage && setPage('dashboard')} className="back-btn" style={{ marginTop: 4 }}>
                    {isRTL ? '→' : '←'}
                </button>
                <div style={{ flex: 1 }}>
                    <h1>{g.addDropTitle || "Add / Drop Courses"}</h1>
                    <p>{g.addDropSub || "Manage your course enrollment for Spring 2024"}</p>
                </div>
                {/* Smart Recommendation button — triggers App-level modal */}
                <button
                    onClick={() => onRequestGoal && onRequestGoal()}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 20, background: goalMeta ? goalMeta.bg : 'rgba(124,77,255,0.1)', border: `1.5px solid ${goalMeta ? goalMeta.color + '40' : 'rgba(124,77,255,0.3)'}`, color: goalMeta ? goalMeta.color : '#7c4dff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                >
                    {goalMeta ? goalMeta.icon : '✨'} {goalMeta ? goalMeta.label : 'Smart Recommendations'}
                    {goalMeta && <span style={{ fontSize: 11, opacity: .7, fontWeight: 500 }}>&nbsp;Change</span>}
                </button>
            </div>

            {/* Goal active banner */}
            {goalMeta && (
                <div style={{ background: goalMeta.bg, border: `1px solid ${goalMeta.color}30`, borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 24 }}>{goalMeta.icon}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: goalMeta.color, fontSize: 14, marginBottom: 2 }}>Goal: {goalMeta.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)' }}>{goalMeta.tip} — <strong style={{ color: 'var(--t1)' }}>{recommended.length} courses recommended</strong></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowAll(v => !v)} style={{ background: 'transparent', border: `1px solid ${goalMeta.color}50`, color: goalMeta.color, borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {showAll ? 'Show Recommended' : 'Show All'}
                        </button>
                        <button onClick={() => { setGoal(null); setShowAll(false); if (onGoalSelect) onGoalSelect(null); }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--t3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Clear ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                {[
                    ["📚", g.myEnrolled || "Enrolled Courses", String(enrolled.length), "red"],
                    ["⚡", "Total Credits", String(enrolled.length * 3), "blu"],
                    ["✅", g.availCourses || "Available Courses", String(avail.filter(a => !a.full).length), "grn"]
                ].map(([ic, lbl, val, cl]) => (
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
                        <div key={e.code} className={`ad-enrolled-item${removing === e.code ? ' ad-removing' : ''}`}>
                            <div className="ad-enr-ic" style={{ background: e.clr + '22' }}>{e.ic}</div>
                            <div style={{ flex: 1 }}>
                                <div className="ad-enr-code">{e.code} — {e.name}</div>
                                <div className="ad-enr-sched">🕐 {e.sched} &nbsp;📍 {e.room}</div>
                            </div>
                            <button className="ad-drop-btn-new" title="Drop course" onClick={() => handleDrop(e.code)} disabled={removing === e.code}>
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
                            <input className="ad-search-input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {displayList.length === 0 && <div className="ad-empty">No available courses.</div>}

                    {displayList.map(a => {
                        const isRec = recommendedCodes.has(a.code) && goal && !showAll && !search;
                        return (
                            <div key={a.code} className={`ad-avail-item${adding === a.code ? ' ad-adding' : ''}${isRec ? ' ad-recommended' : ''}`}>
                                {isRec && (
                                    <div className="ad-rec-banner" style={{ background: goalMeta?.color }}>
                                        ⭐ Recommended for you
                                    </div>
                                )}
                                <div className="ad-avail-top">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <div className="ad-avail-code">{a.code}</div>
                                            {a.tags && a.tags.map(tag => (
                                                <span key={tag} className={`ad-tag${tag === 'Full' ? ' ad-tag-full' : tag === 'Available' ? ' ad-tag-avail' : ''}`}>{tag}</span>
                                            ))}
                                            {a.difficulty && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: DIFFICULTY_COLOR[a.difficulty] + '20', color: DIFFICULTY_COLOR[a.difficulty] }}>{a.difficulty}</span>
                                            )}
                                        </div>
                                        <div className="ad-avail-name">{a.name}</div>
                                        <div className="ad-avail-meta">
                                            <span>👤 {a.inst}</span>
                                            <span>🕐 {a.sched}</span>
                                            <span>📚 {a.credits} cr</span>
                                            {goal === 'gpa' && <span style={{ color: '#2979ff', fontWeight: 700 }}>GPA+{a.gpaImpact}</span>}
                                        </div>
                                    </div>
                                    <button
                                        className={a.full ? "ad-add-btn-disabled" : "ad-add-btn-new"}
                                        disabled={a.full || adding === a.code}
                                        onClick={() => handleAdd(a.code)}
                                    >
                                        {a.full ? "Full" : (
                                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{g.addBtn || "Add"}</>
                                        )}
                                    </button>
                                </div>
                                <div className="ad-enroll-bar">
                                    <div className={`ad-enroll-fill${a.full ? " full" : ""}`} style={{ width: `${a.enrolled / a.total * 100}%` }} />
                                </div>
                                <div className="ad-enroll-count">{a.enrolled}/{a.total} enrolled</div>
                            </div>
                        );
                    })}

                    <div className="ad-footer">
                        <button className="ad-cancel-btn" onClick={() => setPage('dashboard')}>{g.cancelBtn || "Cancel Changes"}</button>
                        <button className="ad-save-btn" onClick={() => showToast("Enrollment Saved!", "#00c853")}>{g.saveBtn || "Save Enrollment"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
