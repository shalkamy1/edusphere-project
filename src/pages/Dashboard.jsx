import React, { useState, useEffect } from 'react';
import { useLang } from '../App.jsx';

/* ── Modern SVG Icon components ── */
const IC = {
    book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    trendUp: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    trendDn: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
    arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
    clipBoard: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>,
    barChart: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    plusCircle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    tableIcon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /></svg>,
    qrIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5" rx="0.5" /><rect x="3" y="11" width="5" height="5" rx="0.5" /><rect x="11" y="3" width="5" height="5" rx="0.5" /><rect x="4" y="4" width="3" height="3" fill="currentColor" stroke="none" /><rect x="4" y="12" width="3" height="3" fill="currentColor" stroke="none" /><rect x="12" y="4" width="3" height="3" fill="currentColor" stroke="none" /><line x1="17" y1="11" x2="17" y2="11.01" /><line x1="11" y1="15" x2="11" y2="17" /><line x1="13" y1="15" x2="13" y2="19" /><line x1="15" y1="17" x2="17" y2="17" /><line x1="15" y1="19" x2="19" y2="19" /><line x1="17" y1="15" x2="21" y2="15" /><line x1="19" y1="11" x2="21" y2="11" /><line x1="19" y1="13" x2="21" y2="13" /><line x1="11" y1="11" x2="13" y2="11" /><line x1="11" y1="13" x2="13" y2="13" /></svg>,
};

function QRSvg() {
    const g = [[1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1], [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1], [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0], [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0], [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0], [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1]];
    const cells = 21, sz = 120, cs = sz / cells;
    return (
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ display: 'block' }}>
            <rect width={sz} height={sz} fill="#ffffff" rx={4} />
            {g.flatMap((row, r) => row.map((v, c) => v ? (
                <rect key={`${r}-${c}`} x={c * cs + 0.5} y={r * cs + 0.5} width={cs - 0.5} height={cs - 0.5} fill="#0f172a" rx={0.8} />
            ) : null).filter(Boolean))}
        </svg>
    );
}

function CountUp({ target, duration = 1500 }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(timer); }
            else setVal(Math.floor(start));
        }, duration / 60);
        return () => clearInterval(timer);
    }, [target, duration]);
    return <>{val}</>;
}

const CLASSES = [
    { name: "Advanced Web Development", sub: "Dr. Sarah Hassan • CS 431", time: "09:00 AM", status: "Live Now", sc: "st-live", dot: "#e53935" },
    { name: "Database Systems", sub: "Dr. Ahmed Ali • CS 412", time: "11:00 AM", status: "Upcoming", sc: "st-up", dot: "#2979ff" },
    { name: "Machine Learning", sub: "Dr. Layla Nour • IT Lab 411", time: "07:00 PM", status: "Scheduled", sc: "st-sch", dot: "#7c4dff" },
];

const GRADES = [
    { code: "CS431", name: "Project 3", pct: 95, color: "#00c853" },
    { code: "MATH301", name: "Midterm Exam", pct: 38, color: "#e53935" },
    { code: "ENG101", name: "Essay", pct: 92, color: "#00c853" },
];

export default function PageDashboard({ setPage }) {
    const { t, lang } = useLang();
    const isRTL = lang === 'ar';
    const d = t.dashboard;
    const STATS = [
        { icon: IC.book, lbl: d.totalCourses, val: 6, tr: d.thisSem, dir: "up", cl: "red" },
        { icon: IC.star, lbl: d.avgGpa, val: "3.8", tr: "+0.2 pts", dir: "up", cl: "blu" },
        { icon: IC.calendar, lbl: d.classesToday, val: 4, tr: d.onTrack, dir: "up", cl: "org" },
        { icon: IC.clock, lbl: d.pendingTasks, val: 8, tr: d.overdue, dir: "dn", cl: "pur" },
    ];

    return (
        <div className="page-enter" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="pheader db-header">
                <div>
                    <h1>{d.welcome}</h1>
                    <p>{d.sub}</p>
                </div>
                <div className="db-header-actions">
                    <button className="db-quick-btn" onClick={() => setPage('timetable')}>
                        {IC.tableIcon} {lang === 'ar' ? 'الجدول' : 'Timetable'}
                    </button>
                    <button className="db-quick-btn db-quick-btn-red" onClick={() => setPage('adddrop')}>
                        {IC.plusCircle} {lang === 'ar' ? 'إضافة مادة' : 'Add Course'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="sgrid">
                {STATS.map((s, i) => (
                    <div key={s.lbl} className={`card card-hover scard ${s.cl}`} style={{ animationDelay: `${i * 0.06}s` }}>
                        <div className={`sc-ic ${s.cl}`}>{s.icon}</div>
                        <div style={{ flex: 1, paddingRight: '76px' }}>
                            <div className="sc-lbl">{s.lbl}</div>
                            <div className="sc-val">{typeof s.val === 'number' ? <CountUp target={s.val} /> : s.val}</div>
                        </div>
                        <div className={`sc-tr ${s.dir}`}>
                            {s.dir === 'up' ? IC.trendUp : IC.trendDn}
                            <span>{s.tr}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cgrid">
                {/* Left column */}
                <div className="lcol">
                    {/* Today's Classes */}
                    <div className="card sec db-section">
                        <div className="sec-hd">
                            <span className="sec-ttl">{d.todayClasses}</span>
                            <span className="sec-act sec-act-arrow" onClick={() => setPage('timetable')}>
                                {d.viewSchedule} {IC.arrowRight}
                            </span>
                        </div>
                        <div className="clist">
                            {CLASSES.map((c, i) => (
                                <div key={c.name} className="citem" style={{ animationDelay: `${i * 0.07 + 0.15}s` }}>
                                    <span className="cdot" style={{ background: c.dot }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                                    </span>
                                    <div className="ci">
                                        <div className="cn">{c.name}</div>
                                        <div className="cs">{c.sub}</div>
                                    </div>
                                    <div className="cm">
                                        <div className="ct">{c.time}</div>
                                        <span className={`cst ${c.sc}`}>{c.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right column */}
                <div className="rcol">
                    {/* Grades */}
                    <div className="card sec db-section">
                        <div className="sec-hd">
                            <span className="sec-ttl">{d.recentGrades}</span>
                            <span className="sec-act sec-act-arrow" onClick={() => setPage('grades')}>
                                {d.all} {IC.arrowRight}
                            </span>
                        </div>
                        <div className="glist">
                            {GRADES.map((g, i) => (
                                <div key={g.code} className="gitem" style={{ animationDelay: `${i * 0.07 + 0.1}s` }}>
                                    <div className="gh">
                                        <div>
                                            <div className="gcode">{g.code}</div>
                                            <div className="gname">{g.name}</div>
                                        </div>
                                        <div className="gpct" style={{ color: g.color }}>{g.pct}%</div>
                                    </div>
                                    <div className="gbg">
                                        <div className="gbar" style={{ width: `${g.pct}%`, background: g.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* QR Card */}
                    <div className="card qrcard-pro">
                        <div className="qrhd-pro">
                            <span className="qrtit-pro">Smart Attendance</span>
                            <span className="qr-subtitle">Scan QR to mark attendance</span>
                        </div>
                        <div className="qrbox-pro">
                            <div className="qrsvg-wrap qr-pulse">
                                <QRSvg />
                            </div>
                            <div className="qrcourse-pro">CURRENT: CS402</div>
                            <div className="qr-timer-badge">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                Expires in 5:00
                            </div>
                        </div>
                        <button className="qrbtn-pro" onClick={() => setPage('attendance')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5" rx="0.5" /><rect x="3" y="11" width="5" height="5" rx="0.5" /><rect x="11" y="3" width="5" height="5" rx="0.5" /></svg>
                            Scan Now
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="card sec db-section" style={{ padding: '20px 24px' }}>
                        <div className="sec-hd"><span className="sec-ttl">Quick Actions</span></div>
                        <div className="qalist-pro">

                            <button className="qaitem-pro" onClick={() => setPage('grades')}>
                                <span className="qa-icon">{IC.barChart}</span>
                                Check My Grades
                                <span className="qa-arrow">{IC.arrowRight}</span>
                            </button>
                            <button className="qaitem-pro" onClick={() => setPage('adddrop')}>
                                <span className="qa-icon">{IC.plusCircle}</span>
                                Add/Drop Courses
                                <span className="qa-arrow">{IC.arrowRight}</span>
                            </button>
                            <button className="qaitem-pro qaitem-red" onClick={() => setPage('timetable')}>
                                <span className="qa-icon">{IC.tableIcon}</span>
                                View Timetable
                                <span className="qa-arrow">{IC.arrowRight}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
