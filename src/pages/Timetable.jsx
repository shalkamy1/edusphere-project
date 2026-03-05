import React, { useState } from 'react';
import { useLang } from '../App.jsx';

const TTE = [
    { d: 0, n: "Advanced Web Dev", c: "CS431", r: "CS Lab 101", s: 9, dur: 1.5, clr: "#2979ff" },
    { d: 0, n: "Database Systems", c: "CS412", r: "Lab 103", s: 11, dur: 1.5, clr: "#e91e63" },
    { d: 1, n: "Linear Algebra", c: "MATH301", r: "Hall 201", s: 8, dur: 1.5, clr: "#ff6d00" },
    { d: 1, n: "Machine Learning", c: "CS302", r: "AI Lab", s: 10, dur: 1.5, clr: "#9c27b0" },
    { d: 2, n: "Advanced Web Dev", c: "CS431", r: "CS Lab 101", s: 9, dur: 1.5, clr: "#2979ff" },
    { d: 2, n: "Web Dev Lab", c: "CS431L", r: "Lab 101", s: 14, dur: 1.5, clr: "#00bcd4" },
    { d: 3, n: "Linear Algebra", c: "MATH301", r: "Hall 201", s: 8, dur: 1.5, clr: "#ff6d00" },
    { d: 3, n: "Database Systems", c: "CS412", r: "Lab 103", s: 11, dur: 1.5, clr: "#e91e63" },
    { d: 3, n: "Technical Writing", c: "ARBLEET", r: "ENG Room", s: 14.5, dur: 1.5, clr: "#607d8b" },
    { d: 4, n: "Advanced Web Dev", c: "CS431", r: "CS Lab 101", s: 9, dur: 1.5, clr: "#2979ff" },
    { d: 4, n: "Database Systems", c: "CS412", r: "Lab 103", s: 11, dur: 1.5, clr: "#e91e63" },
];

const COLORS = ["#2979ff", "#e91e63", "#ff6d00", "#9c27b0", "#00bcd4", "#607d8b", "#00c853", "#ff5722"];

export default function PageTimetable({ t, setPage }) {
    const { lang } = useLang();
    const isRTL = lang === 'ar';
    const g = t ? t.pages2 : {};
    const dnames = t ? t.pages2 : {};
    const DAYS = [dnames.dayMon || "Monday", dnames.dayTue || "Tuesday", dnames.dayWed || "Wednesday", dnames.dayThu || "Thursday", dnames.dayFri || "Friday"];
    const DATES = ["Jan 13", "Jan 14", "Jan 15", "Jan 16", "Jan 17"];
    const HRS = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    const RH = 58;
    const getTop = s => (s - 8) * RH;
    const getH = d => d * RH - 4;
    const legend = [...new Map(TTE.map(e => [e.c, { c: e.c, n: e.n, clr: e.clr }])).values()];

    const [events, setEvents] = useState(TTE);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderSet, setReminderSet] = useState(false);
    const [reminderTime, setReminderTime] = useState('15');
    const [newEvent, setNewEvent] = useState({ n: '', c: '', r: '', d: 0, s: 9, dur: 1.5, clr: '#2979ff' });
    const [toast, setToast] = useState(null);

    const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

    const handleDownload = () => {
        const content = ['EduSphere - My Timetable', 'Spring Semester 2026', '', ...events.map(e => `${DAYS[e.d] || "Day"} ${e.s}:00 - ${e.c} ${e.n} (${e.r})`)].join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'timetable.txt'; a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddEvent = () => {
        if (!newEvent.n || !newEvent.c) return;
        setEvents(prev => [...prev, { ...newEvent }]);
        setShowAddModal(false);
        setNewEvent({ n: '', c: '', r: '', d: 0, s: 9, dur: 1.5, clr: '#2979ff' });
        showToast('Class added to timetable!', '#00c853');
    };

    const handleSetReminder = () => {
        setReminderSet(true);
        setShowReminderModal(false);
        showToast(`Reminder set: ${reminderTime} min before each class`, '#2979ff');
    };

    return (
        <div className="page-enter" dir={isRTL ? 'rtl' : 'ltr'}>
            {toast && <div className="toast-msg" style={{ background: toast.color }}>{toast.msg}</div>}

            {/* Header */}
            <div className="pheader" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <button onClick={() => setPage && setPage('dashboard')} className="back-btn" style={{ marginTop: 4 }}>
                        {isRTL ? '→' : '←'}
                    </button>
                    <div>
                        <h1>{g.timetableTitle || "My Timetable"}</h1>
                        <p>{g.timetableSub || "Spring Semester 2024 • Week 1"}</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: 'center' }}>
                    <button
                        className="tt-reminder-btn"
                        onClick={() => setShowReminderModal(true)}
                        style={{ background: reminderSet ? 'rgba(41,121,255,0.15)' : 'var(--red)', color: reminderSet ? 'var(--blu)' : '#fff' }}
                    >
                        🔔 {reminderSet ? 'Reminder Set' : (g.setReminder || "Set Reminder")}
                    </button>
                    <button className="tt-add-btn" onClick={() => setShowAddModal(true)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <button className="tt-download-btn" onClick={handleDownload}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        {g.downloadPdf || "Download"}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="sgrid" style={{ marginBottom: 18 }}>
                {[[g.thisWeek || "This Week", String(events.length), "red", "📚"], [g.sections || "Sections", "8", "blu", "📖"], [g.online || "Online", "2", "org", "💻"], [g.tutorials || "Tutorials", "1", "pur", "📝"]].map(([l, v, cl, ic]) => (
                    <div key={l} className={`card scard ${cl}`}>
                        <div className={`sc-ic ${cl}`}>{ic}</div>
                        <div><div className="sc-lbl">{l}</div><div className="sc-val">{v}</div></div>
                    </div>
                ))}
            </div>

            {/* Timetable grid */}
            <div className="tt-wrap">
                <div className="tt-header">
                    <div className="tt-time-hd">{g.time || "TIME"}</div>
                    {DAYS.map((d, i) => (
                        <div key={d} className="tt-day-hd">
                            <div style={{ fontWeight: 700, color: "var(--t1)", fontSize: 13 }}>{d}</div>
                            <div className="tt-day-date">{DATES[i]}</div>
                        </div>
                    ))}
                </div>
                <div className="tt-body">
                    <div className="tt-time-col">{HRS.map(h => <div key={h} className="tt-time-slot">{h}:00</div>)}</div>
                    {DAYS.map((d, di) => (
                        <div key={d} className="tt-day-col">
                            {HRS.map((_, i) => <div key={i} className="tt-grid-line" style={{ top: i * RH }} />)}
                            {/* Add (+) cell */}
                            <div className="tt-add-cell" onClick={() => { setNewEvent(p => ({ ...p, d: di })); setShowAddModal(true); }}>
                                <span>+</span>
                            </div>
                            {events.filter(e => e.d === di).map(e => (
                                <div key={e.c + e.s} className="tt-event" style={{ top: getTop(e.s), height: getH(e.dur), background: e.clr }}>
                                    <div className="tt-event-code">{e.c}</div>
                                    <div className="tt-event-name">{e.n}</div>
                                    <div className="tt-event-room">{e.r}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="tt-legend">
                    {legend.map(e => (
                        <div key={e.c} className="tt-leg-item">
                            <div className="tt-leg-dot" style={{ background: e.clr }} />
                            <span>{e.c}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Class Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-card" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-hd">
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>📅 Add Class to Timetable</div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Schedule a new class session</div>
                            </div>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[['Course Name', 'n', 'e.g. Advanced Web Development'], ['Course Code', 'c', 'e.g. CS431'], ['Room / Location', 'r', 'e.g. CS Lab 101']].map(([lbl, key, ph]) => (
                                <div key={key}>
                                    <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>{lbl}</div>
                                    <input
                                        className="set-input"
                                        placeholder={ph}
                                        value={newEvent[key]}
                                        onChange={e => setNewEvent(p => ({ ...p, [key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>Day</div>
                                    <select className="set-input" value={newEvent.d} onChange={e => setNewEvent(p => ({ ...p, d: +e.target.value }))}>
                                        {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>Start Hour</div>
                                    <select className="set-input" value={newEvent.s} onChange={e => setNewEvent(p => ({ ...p, s: +e.target.value }))}>
                                        {HRS.map(h => <option key={h} value={h}>{h}:00</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>Duration (hrs)</div>
                                    <select className="set-input" value={newEvent.dur} onChange={e => setNewEvent(p => ({ ...p, dur: +e.target.value }))}>
                                        {[1, 1.5, 2, 2.5, 3].map(d => <option key={d} value={d}>{d}h</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 8 }}>Color</div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {COLORS.map(clr => (
                                        <div
                                            key={clr}
                                            onClick={() => setNewEvent(p => ({ ...p, clr }))}
                                            style={{
                                                width: 28, height: 28, borderRadius: '50%', background: clr, cursor: 'pointer',
                                                border: newEvent.clr === clr ? '3px solid var(--t1)' : '2px solid transparent',
                                                transition: 'transform 0.2s', transform: newEvent.clr === clr ? 'scale(1.2)' : 'scale(1)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button className="ad-cancel-btn" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button className="submit-btn-red" onClick={handleAddEvent} style={{ flex: 2 }}>✓ Add to Timetable</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Set Reminder Modal */}
            {showReminderModal && (
                <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
                    <div className="modal-card" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-hd">
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>🔔 Set Reminder</div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Get notified before your classes</div>
                            </div>
                            <button className="modal-close" onClick={() => setShowReminderModal(false)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ fontSize: 13, color: 'var(--t2)' }}>How many minutes before class should we remind you?</div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {['5', '10', '15', '20', '30', '60'].map(min => (
                                    <button
                                        key={min}
                                        onClick={() => setReminderTime(min)}
                                        style={{
                                            padding: '10px 18px', borderRadius: 10, border: reminderTime === min ? '2px solid var(--red)' : '1px solid var(--border)',
                                            background: reminderTime === min ? 'var(--red-tnt)' : 'var(--bg2)', color: reminderTime === min ? 'var(--red)' : 'var(--t1)',
                                            fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all .2s'
                                        }}
                                    >{min} min</button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button className="ad-cancel-btn" onClick={() => setShowReminderModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button className="submit-btn-red" onClick={handleSetReminder} style={{ flex: 2 }}>🔔 Set Reminder</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
