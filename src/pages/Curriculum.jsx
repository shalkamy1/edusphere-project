import React, { useState } from 'react';
import { useLang } from '../App.jsx';

/* ── COURSE DATABASE ─────────────────────────────────────────── */
const COURSES = {
    CS101:   { name: 'Intro to CS',          credits: 3, prereqs: [],                 color: '#e53935' },
    MATH101: { name: 'Calculus I',            credits: 3, prereqs: [],                 color: '#ff6d00' },
    ENG101:  { name: 'English I',             credits: 2, prereqs: [],                 color: '#2979ff' },
    PHYS101: { name: 'Physics I',             credits: 3, prereqs: [],                 color: '#9c27b0' },

    CS102:   { name: 'Programming Basics',    credits: 3, prereqs: ['CS101'],          color: '#e53935' },
    MATH102: { name: 'Calculus II',           credits: 3, prereqs: ['MATH101'],        color: '#ff6d00' },
    ENG102:  { name: 'English II',            credits: 2, prereqs: ['ENG101'],         color: '#2979ff' },
    PHYS102: { name: 'Physics II',            credits: 3, prereqs: ['PHYS101'],        color: '#9c27b0' },

    CS201:   { name: 'Data Structures',       credits: 3, prereqs: ['CS102'],          color: '#e53935' },
    CS203:   { name: 'OOP',                   credits: 3, prereqs: ['CS102'],          color: '#e53935' },
    MATH201: { name: 'Linear Algebra',        credits: 3, prereqs: ['MATH102'],        color: '#ff6d00' },
    SOC201:  { name: 'Society & Tech',        credits: 2, prereqs: [],                 color: '#607d8b' },

    CS211:   { name: 'Algorithms',            credits: 3, prereqs: ['CS201'],          color: '#e53935' },
    CS214:   { name: 'OS Concepts',           credits: 3, prereqs: ['CS201'],          color: '#e53935' },
    MATH204: { name: 'Discrete Math',         credits: 3, prereqs: ['MATH201'],        color: '#ff6d00' },
    HUM206:  { name: 'Humanities',            credits: 2, prereqs: [],                 color: '#607d8b' },

    CS301:   { name: 'Database Systems',      credits: 3, prereqs: ['CS211'],          color: '#e53935' },
    CS302:   { name: 'Software Engineering',  credits: 3, prereqs: ['CS211'],          color: '#e53935' },
    CS303:   { name: 'Networks',              credits: 3, prereqs: ['CS214'],          color: '#e53935' },
    HUM301:  { name: 'Research Methods',      credits: 2, prereqs: [],                 color: '#607d8b' },

    CS311:   { name: 'AI Fundamentals',       credits: 3, prereqs: ['CS301'],          color: '#e53935' },
    CS321:   { name: 'Web Development',       credits: 3, prereqs: ['CS302'],          color: '#e53935' },
    MATH301: { name: 'Prob & Stats',          credits: 3, prereqs: ['MATH204'],        color: '#ff6d00' },
    ENG301:  { name: 'Technical Writing',     credits: 2, prereqs: [],                 color: '#2979ff' },

    CS401:   { name: 'Graduation Project',    credits: 6, prereqs: ['CS311', 'CS321'], color: '#e53935' },
    CS411:   { name: 'Machine Learning',      credits: 3, prereqs: ['CS311'],          color: '#e53935' },
    CS421:   { name: 'Cloud Computing',       credits: 3, prereqs: ['CS303'],          color: '#e53935' },

    CS431:   { name: 'Adv Web Dev',           credits: 3, prereqs: ['CS321'],          color: '#e53935' },
    CS441:   { name: 'Security',              credits: 3, prereqs: ['CS303'],          color: '#e53935' },
    CS451:   { name: 'Capstone',              credits: 3, prereqs: ['CS401'],          color: '#e53935' },
};

/* ── SCHEDULE ────────────────────────────────────────────────── */
const SCHEDULE = [
    {
        year: 1, label: 'First Year',
        sems: [
            { id: 'f22', label: 'Fall 2022',   courses: ['CS101', 'MATH101', 'ENG101', 'PHYS101'] },
            { id: 's23', label: 'Spring 2023', courses: ['CS102', 'MATH102', 'ENG102', 'PHYS102'] },
        ],
        summerLabel: 'Summer 2023',
    },
    {
        year: 2, label: 'Second Year',
        sems: [
            { id: 'f23', label: 'Fall 2023',   courses: ['CS201', 'CS203', 'MATH201', 'SOC201'] },
            { id: 's24', label: 'Spring 2024', courses: ['CS211', 'CS214', 'MATH204', 'HUM206'] },
        ],
        summerLabel: 'Summer 2024',
    },
    {
        year: 3, label: 'Third Year',
        sems: [
            { id: 'f24', label: 'Fall 2024',   courses: ['CS301', 'CS302', 'CS303', 'HUM301'] },
            { id: 's25', label: 'Spring 2025', courses: ['CS311', 'CS321', 'MATH301', 'ENG301'] },
        ],
        summerLabel: 'Summer 2025',
    },
    {
        year: 4, label: 'Fourth Year',
        sems: [
            { id: 'f25', label: 'Fall 2025',   courses: ['CS401', 'CS411', 'CS421'] },
            { id: 's26', label: 'Spring 2026', courses: ['CS431', 'CS441', 'CS451'] },
        ],
        summerLabel: null,
    },
];

/* ── BASE STATUS ─────────────────────────────────────────────── */
const BASE_STATUS = {
    CS101: 'done', MATH101: 'done', ENG101: 'done', PHYS101: 'done',
    CS102: 'done', MATH102: 'done', ENG102: 'done', PHYS102: 'done',
    CS201: 'done', CS203: 'done', MATH201: 'done', SOC201: 'done',
    CS211: 'done', CS214: 'done', MATH204: 'done', HUM206: 'done',
    CS301: 'done', CS302: 'done', CS303: 'done', HUM301: 'done',
    CS311: 'prog', CS321: 'prog', MATH301: 'prog', ENG301: 'prog',
    CS401: 'upcoming', CS411: 'upcoming', CS421: 'upcoming',
    CS431: 'upcoming', CS441: 'upcoming', CS451: 'upcoming',
};

const ST = {
    done:     { label: 'Done',        dot: '#00c853', bg: 'rgba(0,200,83,0.12)',   border: 'rgba(0,200,83,0.3)',    text: '#00c853' },
    prog:     { label: 'In Progress', dot: '#2979ff', bg: 'rgba(41,121,255,0.12)', border: 'rgba(41,121,255,0.3)',  text: '#2979ff' },
    upcoming: { label: 'Upcoming',    dot: '#888',    bg: 'rgba(150,150,150,0.08)',border: 'rgba(150,150,150,0.25)',text: '#888888' },
    failed:   { label: 'Failed ❌',   dot: '#f44336', bg: 'rgba(244,67,54,0.12)',  border: 'rgba(244,67,54,0.35)',  text: '#f44336' },
    dropped:  { label: 'Dropped 🔶',  dot: '#ff9100', bg: 'rgba(255,145,0,0.12)',  border: 'rgba(255,145,0,0.35)',  text: '#ff9100' },
};

/* ── COMPONENT ───────────────────────────────────────────────── */
export default function PageCurriculum({ droppedCourses = [], failedCourses = [] }) {
    const { t } = useLang();
    const [hoveredCode, setHoveredCode] = useState(null);

    /* Build "is a prereq of" map */
    const isPrereqFor = {};
    Object.entries(COURSES).forEach(([code, info]) => {
        info.prereqs.forEach(p => {
            if (!isPrereqFor[p]) isPrereqFor[p] = [];
            isPrereqFor[p].push(code);
        });
    });

    const getStatus = code => {
        if (failedCourses.includes(code)) return 'failed';
        if (droppedCourses.includes(code)) return 'dropped';
        return BASE_STATUS[code] || 'upcoming';
    };

    /* Highlight role relative to hovered code */
    const hlRole = code => {
        if (!hoveredCode) return null;
        if (code === hoveredCode) return 'active';
        if (COURSES[hoveredCode]?.prereqs.includes(code)) return 'prereq';
        if (isPrereqFor[hoveredCode]?.includes(code)) return 'dependent';
        return null;
    };

    /* Summer courses: failed/dropped from a year's semesters */
    const getSummerCourses = yearData => {
        const allCodes = yearData.sems.flatMap(s => s.courses);
        return allCodes.filter(c => failedCourses.includes(c) || droppedCourses.includes(c));
    };

    /* Stats */
    const allCodes = SCHEDULE.flatMap(y => y.sems.flatMap(s => s.courses));
    const totalCredits = allCodes.reduce((a, c) => a + (COURSES[c]?.credits || 0), 0);
    const doneCredits  = allCodes.filter(c => getStatus(c) === 'done').reduce((a, c) => a + (COURSES[c]?.credits || 0), 0);
    const doneCount    = allCodes.filter(c => getStatus(c) === 'done').length;
    const progCount    = allCodes.filter(c => getStatus(c) === 'prog').length;
    const progress     = Math.round(doneCredits / totalCredits * 100);

    /* Failed/dropped table list */
    const failedDropped = [...new Set([...failedCourses, ...droppedCourses])];

    /* ── Course card renderer ── */
    const renderCourse = (code, isSummer = false) => {
        const info = COURSES[code];
        if (!info) return null;
        const st   = getStatus(code);
        const cfg  = ST[isSummer ? (st === 'failed' ? 'failed' : 'dropped') : st];
        const role = hlRole(code);
        const hasPrereqs = info.prereqs.length > 0;
        const isLinked   = hasPrereqs || (isPrereqFor[code]?.length > 0);

        const borderColor = role === 'active'    ? 'var(--red)'   :
                            role === 'prereq'    ? '#ff9100'      :
                            role === 'dependent' ? '#2979ff'      : cfg.border;
        const glow = role === 'active'    ? '0 0 0 2px rgba(229,57,53,0.35)'   :
                     role === 'prereq'    ? '0 0 0 2px rgba(255,145,0,0.35)'   :
                     role === 'dependent' ? '0 0 0 2px rgba(41,121,255,0.35)'  : 'none';

        return (
            <div
                key={code}
                className="cur3-card"
                style={{
                    background: cfg.bg,
                    border: `1.5px solid ${borderColor}`,
                    boxShadow: glow,
                    opacity: hoveredCode && role === null ? 0.45 : 1,
                    transform: role === 'active' ? 'translateY(-2px) scale(1.02)' : 'none',
                    transition: 'all 0.18s ease',
                    cursor: isLinked ? 'pointer' : 'default',
                    position: 'relative',
                }}
                onMouseEnter={() => isLinked && setHoveredCode(code)}
                onMouseLeave={() => setHoveredCode(null)}
            >
                {/* Prereq lock icon */}
                {hasPrereqs && (
                    <span
                        className="cur3-prereq-icon"
                        title={`Requires: ${info.prereqs.join(', ')}`}
                        style={{ color: role === 'active' ? 'var(--red)' : '#ff9100' }}
                    >🔗</span>
                )}
                <div className="cur3-card-top">
                    <span className="cur3-code" style={{ color: info.color }}>{code}</span>
                    <span className="cur3-badge" style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                    </span>
                </div>
                <div className="cur3-name">{info.name}</div>
                <div className="cur3-meta">
                    <span>{info.credits} cr</span>
                    {hasPrereqs && <span style={{ color: '#ff9100', fontSize: 10 }}>⬆ {info.prereqs.join(', ')}</span>}
                    {(isPrereqFor[code]?.length > 0) && !hasPrereqs && (
                        <span style={{ color: '#888', fontSize: 10 }}>➡ {isPrereqFor[code].join(', ')}</span>
                    )}
                </div>
            </div>
        );
    };

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
                    <h1 className="cur-page-title">{t.curriculum?.title || 'Curriculum Plan'}</h1>
                    <p className="cur-page-sub">Bachelor of Science in Computer Science · 4 Years</p>
                </div>
            </div>

            {/* Stats */}
            <div className="cur3-stats">
                {[
                    { icon: '📈', label: 'Overall Progress', val: `${progress}%`,             color: 'var(--red)' },
                    { icon: '✅', label: 'Completed',        val: `${doneCount} courses`,      color: '#00c853'    },
                    { icon: '🔵', label: 'In Progress',      val: `${progCount} courses`,      color: '#2979ff'    },
                    { icon: '⚠️', label: 'Failed / Dropped', val: failedDropped.length,        color: '#f44336'    },
                    { icon: '📚', label: 'Credits Done',     val: `${doneCredits}/${totalCredits}`, color: 'var(--org)' },
                ].map(s => (
                    <div key={s.label} className="cur3-stat-card">
                        <div className="cur3-stat-icon" style={{ color: s.color }}>{s.icon}</div>
                        <div className="cur3-stat-val" style={{ color: s.color }}>{s.val}</div>
                        <div className="cur3-stat-lbl">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="cur2-prog-bar-wrap">
                <div className="cur2-prog-label">
                    <span>Curriculum Progress</span>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>{progress}%</span>
                </div>
                <div className="cur2-prog-track">
                    <div className="cur2-prog-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Legend */}
            <div className="cur3-legend">
                <span className="cur3-legend-title">Legend:</span>
                {Object.entries(ST).map(([k, v]) => (
                    <span key={k} className="cur3-legend-item">
                        <span className="cur3-legend-dot" style={{ background: v.dot }} />
                        {v.label}
                    </span>
                ))}
                <span className="cur3-legend-item">
                    <span style={{ fontSize: 13 }}>🔗</span> Has Prerequisites
                    <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 4 }}>(hover to highlight)</span>
                </span>
            </div>

            {/* Years */}
            {SCHEDULE.map(yearData => {
                const summerCourses = getSummerCourses(yearData);
                return (
                    <div key={yearData.year} className="cur3-year-block">

                        {/* Year header */}
                        <div className="cur3-year-header">
                            <div className="cur3-year-dot" />
                            <h2 className="cur3-year-title">{yearData.label}</h2>
                        </div>

                        {/* Semesters grid */}
                        <div className="cur3-sem-grid">
                            {yearData.sems.map(sem => (
                                <div key={sem.id} className="cur3-sem-card">
                                    <div className="cur3-sem-header">{sem.label}</div>
                                    <div className="cur3-courses-list">
                                        {sem.courses.map(code => renderCourse(code))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summer semester */}
                        {yearData.summerLabel && (
                            <div className={`cur3-summer${summerCourses.length > 0 ? ' cur3-summer-active' : ''}`}>
                                <div className="cur3-summer-hd">
                                    <span className="cur3-summer-sun">☀️</span>
                                    <span className="cur3-summer-lbl">{yearData.summerLabel}</span>
                                    {summerCourses.length === 0
                                        ? <span className="cur3-summer-break">No courses — On Break</span>
                                        : <span className="cur3-summer-count">{summerCourses.length} course{summerCourses.length > 1 ? 's' : ''} (retake)</span>
                                    }
                                </div>
                                {summerCourses.length > 0 && (
                                    <div className="cur3-summer-body">
                                        <div className="cur3-summer-note">
                                            📌 Retaking failed / dropped courses from {yearData.label}:
                                        </div>
                                        <div className="cur3-courses-list cur3-courses-summer">
                                            {summerCourses.map(code => renderCourse(code, true))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Failed & Dropped Summary Table */}
            {failedDropped.length > 0 && (
                <div className="cur3-fail-wrap">
                    <div className="cur3-fail-title">
                        <span>⚠️</span> Failed &amp; Dropped Courses Summary
                    </div>
                    <div className="cur3-fail-note">
                        These courses will appear in the corresponding Summer semester for retaking.
                    </div>
                    <table className="cur3-fail-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Course Name</th>
                                <th>Credits</th>
                                <th>Status</th>
                                <th>Retake In</th>
                            </tr>
                        </thead>
                        <tbody>
                            {failedDropped.map(code => {
                                const info = COURSES[code] || {};
                                const st   = droppedCourses.includes(code) ? 'dropped' : 'failed';
                                const cfg  = ST[st];
                                const yearData = SCHEDULE.find(y => y.sems.some(s => s.courses.includes(code)));
                                return (
                                    <tr key={code}>
                                        <td><span style={{ color: info.color, fontWeight: 700 }}>{code}</span></td>
                                        <td>{info.name || '—'}</td>
                                        <td style={{ textAlign: 'center' }}>{info.credits || '—'}</td>
                                        <td>
                                            <span className="cur3-tbl-badge" style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td style={{ color: '#ffd600', fontWeight: 600 }}>
                                            {yearData?.summerLabel || 'N/A'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
