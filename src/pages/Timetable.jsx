import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLang } from '../App.jsx';
import { getStudentSchedule } from '../api.js';

const TTE = [
    { d: 0, n: "Advanced Web Dev",  c: "CS431",   r: "CS Lab 101", s: 9,    dur: 1.5, clr: "#2979ff", type: "Lecture",  instr: "Dr. Sarah Hassan" },
    { d: 0, n: "Database Systems",  c: "CS412",   r: "Lab 103",    s: 11,   dur: 1.5, clr: "#e91e63", type: "Lecture",  instr: "Dr. Ahmed Ali" },
    { d: 1, n: "Linear Algebra",    c: "MATH301", r: "Hall 201",   s: 8,    dur: 1.5, clr: "#ff6d00", type: "Lecture",  instr: "Dr. Layla Nour" },
    { d: 1, n: "Machine Learning",  c: "CS302",   r: "AI Lab",     s: 10,   dur: 1.5, clr: "#9c27b0", type: "Lab",      instr: "Dr. Layla Nour" },
    { d: 2, n: "Advanced Web Dev",  c: "CS431",   r: "CS Lab 101", s: 9,    dur: 1.5, clr: "#2979ff", type: "Lecture",  instr: "Dr. Sarah Hassan" },
    { d: 2, n: "Web Dev Lab",       c: "CS431L",  r: "Lab 101",    s: 14,   dur: 1.5, clr: "#00bcd4", type: "Lab",      instr: "Dr. Sarah Hassan" },
    { d: 3, n: "Linear Algebra",    c: "MATH301", r: "Hall 201",   s: 8,    dur: 1.5, clr: "#ff6d00", type: "Lecture",  instr: "Dr. Layla Nour" },
    { d: 3, n: "Database Systems",  c: "CS412",   r: "Lab 103",    s: 11,   dur: 1.5, clr: "#e91e63", type: "Tutorial", instr: "Dr. Ahmed Ali" },
    { d: 3, n: "Technical Writing", c: "ARBLEET", r: "ENG Room",   s: 14.5, dur: 1.5, clr: "#607d8b", type: "Lecture",  instr: "Dr. Omar Farouk" },
    { d: 4, n: "Advanced Web Dev",  c: "CS431",   r: "CS Lab 101", s: 9,    dur: 1.5, clr: "#2979ff", type: "Lecture",  instr: "Dr. Sarah Hassan" },
    { d: 4, n: "Database Systems",  c: "CS412",   r: "Lab 103",    s: 11,   dur: 1.5, clr: "#e91e63", type: "Lecture",  instr: "Dr. Ahmed Ali" },
];

const COLORS = ["#2979ff", "#e91e63", "#ff6d00", "#9c27b0", "#00bcd4", "#607d8b", "#00c853", "#ff5722"];

/* ── session type badge color ── */
const TYPE_COLORS = {
    Lecture:  { bg: 'rgba(0,0,0,0.22)', text: '#fff' },
    Lab:      { bg: 'rgba(0,188,212,0.35)', text: '#fff' },
    Tutorial: { bg: 'rgba(255,193,7,0.35)', text: '#fff' },
    Section:  { bg: 'rgba(76,175,80,0.35)', text: '#fff' },
};

// Teaching-assistant badge styling
const TA_BADGE_STYLE = {
    fontSize: 9, fontWeight: 800, marginTop: 2,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    background: 'rgba(255,152,0,0.4)', color: '#fff',
    display: 'inline-block', padding: '1px 5px', borderRadius: 4,
};

export default function PageTimetable({ t: tProp }) {
    const navigate = useNavigate();
    const { lang, t: tCtx } = useLang();
    const t = tCtx || tProp;  // prefer context (always fresh), fall back to prop
    const isRTL = lang === 'ar';
    const g = t ? t.pages2 : {};
    const DAYS = [
        g.daySat || 'Saturday',
        g.daySun || 'Sunday',
        g.dayMon || 'Monday',
        g.dayTue || 'Tuesday',
        g.dayWed || 'Wednesday',
        g.dayThu || 'Thursday',
    ];
    const DATES = ["Jan 10", "Jan 11", "Jan 12", "Jan 13", "Jan 14", "Jan 15"];
    const HRS = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    const RH = 58;
    const getTop = s => (s - 8) * RH;
    const getH = d => d * RH - 4;

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderSet, setReminderSet] = useState(false);
    const [reminderTime, setReminderTime] = useState('15');
    const [newEvent, setNewEvent] = useState({ n: '', c: '', r: '', d: 0, s: 9, dur: 1.5, clr: '#2979ff' });
    const [toast, setToast] = useState(null);

    const legend = [...new Map(events.map(e => [e.c, { c: e.c, n: e.n, clr: e.clr }])).values()];

    useEffect(() => {
        getStudentSchedule().then(res => {
            if (res && res.data) {
                const fetchedEvents = [];
                let colorIdx = 0;
                const courseColors = {};

                Object.entries(res.data).forEach(([dayId, classes]) => {
                    const map = { saturday: 0, sunday: 1, monday: 2, tuesday: 3, wednesday: 4, thursday: 5, friday: 6 };
                    const dNum = map[dayId.toLowerCase()];
                    if (dNum === undefined || dNum < 0) return;

                    classes.forEach(c => {
                        if (!courseColors[c.course_code]) {
                            courseColors[c.course_code] = COLORS[colorIdx % COLORS.length];
                            colorIdx++;
                        }

                        let sHour = 9;
                        if (c.time && c.time !== 'TBA') {
                            const [h, m] = c.time.split(':');
                            sHour = parseInt(h) + (parseInt(m || 0) / 60);
                        }

                        fetchedEvents.push({
                            d: dNum,
                            n: c.course_name,
                            c: c.course_code,
                            r: c.room || 'TBA',
                            instr: c.instructor || '',
                            type: c.session_type || 'Lecture',
                            instructorType: c.instructor_type || 'professor',
                            s: sHour,
                            dur: c.duration ? (c.duration / 60) : 1.5,
                            clr: courseColors[c.course_code],
                        });
                    });
                });

                setEvents(fetchedEvents);
            }
        }).catch(err => {
            console.error('Schedule fetch error:', err);
            setEvents(TTE); // fallback to demo data
        }).finally(() => setLoading(false));
    }, []);

    const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

    const handleDownload = () => {
        const content = ['EduSphere - My Timetable', 'Spring Semester 2026', '',
            ...events.map(e => `${DAYS[e.d] || 'Day'} ${e.s}:00 - ${e.c} ${e.n} (${e.r}) - ${e.instr || ''}`)
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'timetable.txt'; a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddEvent = () => {
        if (!newEvent.n || !newEvent.c) return;
        setEvents(prev => [...prev, { ...newEvent, type: 'Lecture', instr: '' }]);
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
            <div className="pheader" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ marginTop: 4 }}>
                        {isRTL ? '→' : '←'}
                    </button>
                    <div>
                        <h1>{g.timetableTitle || 'My Timetable'}</h1>
                        <p>{g.timetableSub || 'Spring Semester 2024 • Week 1'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                        className="tt-reminder-btn"
                        onClick={() => setShowReminderModal(true)}
                        style={{ background: reminderSet ? 'rgba(41,121,255,0.15)' : 'var(--red)', color: reminderSet ? 'var(--blu)' : '#fff' }}
                    >
                        🔔 {reminderSet ? 'Reminder Set' : (g.setReminder || 'Set Reminder')}
                    </button>
                    <button className="tt-add-btn" onClick={() => setShowAddModal(true)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <button className="tt-download-btn" onClick={handleDownload}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        {g.downloadPdf || 'Download'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="sgrid" style={{ marginBottom: 18 }}>
                {[
                    [g.thisWeek || 'This Week', String(events.length),  'red', '📚'],
                    [g.sections  || 'Sections',  String([...new Set(events.map(e => e.c))].length), 'blu', '📖'],
                    [g.lectureStat || 'Lectures',   String(events.filter(e => e.type === 'Lecture').length),   'org', '🎓'],
                    [g.labsStat   || 'Labs / Tut', String(events.filter(e => e.type !== 'Lecture').length),  'pur', '🔬'],
                ].map(([l, v, cl, ic]) => (
                    <div key={l} className={`card scard ${cl}`}>
                        <div className={`sc-ic ${cl}`}>{ic}</div>
                        <div><div className="sc-lbl">{l}</div><div className="sc-val">{v}</div></div>
                    </div>
                ))}
            </div>

            {/* Timetable grid */}
            <div className="tt-wrap">
                <div className="tt-header">
                    <div className="tt-time-hd">{g.time || 'TIME'}</div>
                    {DAYS.map((d, i) => (
                        <div key={d} className="tt-day-hd">
                            <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 13 }}>{d}</div>
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
                            {events.filter(e => e.d === di).map((e, idx) => {
                                const typeCfg = TYPE_COLORS[e.type] || TYPE_COLORS.Lecture;
                                const isTA = e.instructorType === 'teaching_assistant';
                                return (
                                    <div
                                        key={e.c + e.s + idx}
                                        className="tt-event"
                                        style={{
                                            top: getTop(e.s),
                                            height: getH(e.dur),
                                            background: e.clr,
                                            ...(isTA ? {
                                                border: '2px dashed rgba(255,255,255,0.6)',
                                                opacity: 0.88,
                                            } : {}),
                                        }}
                                    >
                                        <div className="tt-event-code">{e.c}</div>
                                        <div className="tt-event-name">{e.n}</div>
                                        {isTA ? (
                                            <div style={TA_BADGE_STYLE}>👤 TA Section</div>
                                        ) : (
                                            e.type && (
                                                <div style={{
                                                    fontSize: 9, fontWeight: 800, marginTop: 2,
                                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                                    background: typeCfg.bg, color: typeCfg.text,
                                                    display: 'inline-block', padding: '1px 5px', borderRadius: 4,
                                                }}>
                                                    {e.type}
                                                </div>
                                            )
                                        )}
                                        {e.instr && (
                                            <div style={{ fontSize: 9.5, opacity: 0.9, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {isTA ? '🎓' : '👤'} {e.instr}
                                            </div>
                                        )}
                                        <div className="tt-event-room">📍 {e.r}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="tt-legend">
                    {legend.map(e => (
                        <div key={e.c} className="tt-leg-item">
                            <div className="tt-leg-dot" style={{ background: e.clr }} />
                            <span>{e.c} – {e.n}</span>
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
                                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>📅 {g.addClassModal || 'Add Class to Timetable'}</div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{g.scheduleNew || 'Schedule a new class session'}</div>
                            </div>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                [g.courseName || 'Course Name', 'n', 'e.g. Advanced Web Development'],
                                [g.courseCode || 'Course Code', 'c', 'e.g. CS431'],
                                [g.roomLocation || 'Room / Location', 'r', 'e.g. CS Lab 101']
                            ].map(([lbl, key, ph]) => (
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
                                    <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>{g.day || 'Day'}</div>
                                    <select className="set-input" value={newEvent.d} onChange={e => setNewEvent(p => ({ ...p, d: +e.target.value }))}>
                                        {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>{g.startHour || 'Start Hour'}</div>
                                    <select className="set-input" value={newEvent.s} onChange={e => setNewEvent(p => ({ ...p, s: +e.target.value }))}>
                                        {HRS.map(h => <option key={h} value={h}>{h}:00</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>{g.duration || 'Duration (hrs)'}</div>
                                    <select className="set-input" value={newEvent.dur} onChange={e => setNewEvent(p => ({ ...p, dur: +e.target.value }))}>
                                        {[1, 1.5, 2, 2.5, 3].map(d => <option key={d} value={d}>{d}h</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 8 }}>{g.color || 'Color'}</div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {COLORS.map(clr => (
                                        <div
                                            key={clr}
                                            onClick={() => setNewEvent(p => ({ ...p, clr }))}
                                            style={{
                                                width: 28, height: 28, borderRadius: '50%', background: clr, cursor: 'pointer',
                                                border: newEvent.clr === clr ? '3px solid var(--t1)' : '2px solid transparent',
                                                transition: 'transform 0.2s', transform: newEvent.clr === clr ? 'scale(1.2)' : 'scale(1)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button className="ad-cancel-btn" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>{g.cancel || 'Cancel'}</button>
                                <button className="submit-btn-red" onClick={handleAddEvent} style={{ flex: 2 }}>✓ {g.addToTimetable || 'Add to Timetable'}</button>
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
                                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>🔔 {g.reminderTitle || 'Set Reminder'}</div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{g.reminderSub || 'Get notified before your classes'}</div>
                            </div>
                            <button className="modal-close" onClick={() => setShowReminderModal(false)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ fontSize: 13, color: 'var(--t2)' }}>{g.reminderQuestion || 'How many minutes before class should we remind you?'}</div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {['5', '10', '15', '20', '30', '60'].map(min => (
                                    <button
                                        key={min}
                                        onClick={() => setReminderTime(min)}
                                        style={{
                                            padding: '10px 18px', borderRadius: 10,
                                            border: reminderTime === min ? '2px solid var(--red)' : '1px solid var(--border)',
                                            background: reminderTime === min ? 'var(--red-tnt)' : 'var(--bg2)',
                                            color: reminderTime === min ? 'var(--red)' : 'var(--t1)',
                                            fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all .2s',
                                        }}
                                    >{min} min</button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button className="ad-cancel-btn" onClick={() => setShowReminderModal(false)} style={{ flex: 1 }}>{g.cancel || 'Cancel'}</button>
                                <button className="submit-btn-red" onClick={handleSetReminder} style={{ flex: 2 }}>🔔 {g.reminderTitle || 'Set Reminder'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
