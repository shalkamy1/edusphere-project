import React, { useState, useEffect } from 'react';
import { useLang } from '../App.jsx';

/* ── CONSTANTS ─────────────────────────────────────────────────── */
const ST = {
    done:     { label: 'Done',        dot: '#00c853', bg: 'rgba(0,200,83,0.12)',   border: 'rgba(0,200,83,0.3)',    text: '#00c853' },
    prog:     { label: 'In Progress', dot: '#2979ff', bg: 'rgba(41,121,255,0.12)', border: 'rgba(41,121,255,0.3)',  text: '#2979ff' },
    upcoming: { label: 'Upcoming',    dot: '#888',    bg: 'rgba(150,150,150,0.08)',border: 'rgba(150,150,150,0.25)',text: '#888888' },
    failed:   { label: 'Failed ❌',   dot: '#f44336', bg: 'rgba(244,67,54,0.12)',  border: 'rgba(244,67,54,0.35)',  text: '#f44336' },
    dropped:  { label: 'Dropped 🔶',  dot: '#ff9100', bg: 'rgba(255,145,0,0.12)',  border: 'rgba(255,145,0,0.35)',  text: '#ff9100' },
};

/* ── COMPONENT ───────────────────────────────────────────────── */
import { getStoredUser, getStudentCurriculum } from '../api.js';

export default function PageCurriculum() {
    const { t } = useLang();
    const [hoveredCode, setHoveredCode] = useState(null);
    
    // Dynamic states from backend
    const [courses, setCourses] = useState({});
    const [schedule, setSchedule] = useState([]);
    const [dynStatus, setDynStatus] = useState(null);
    const [failedCourses, setFailedCourses] = useState([]);
    const [droppedCourses, setDroppedCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [program, setProgram] = useState(null);

    useEffect(() => {
        const fetchCurriculum = async () => {
            try {
                const user = getStoredUser();
                if (!user || user.role !== 'student' || !user.student_id) {
                    setLoading(false);
                    return;
                }
                const res = await getStudentCurriculum(user.student_id);
                if (res && res.success && res.data) {
                    setCourses(res.data.courses || {});
                    setSchedule(res.data.schedule || []);
                    setDynStatus(res.data.statuses || {});
                    setFailedCourses(res.data.failed_courses || []);
                    setDroppedCourses(res.data.dropped_courses || []);
                    setProgram(res.data.program || null);
                }
            } catch (err) {
                console.error("Error fetching curriculum data:", err);
            }
            setLoading(false);
        };
        fetchCurriculum();
    }, []);

    if (loading) {
        return <div className="page-enter" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading curriculum data...</div>;
    }

    /* Build "is a prereq of" map */
    const isPrereqFor = {};
    Object.entries(courses).forEach(([code, info]) => {
        info.prereqs.forEach(p => {
            if (!isPrereqFor[p]) isPrereqFor[p] = [];
            isPrereqFor[p].push(code);
        });
    });

    const getStatus = code => {
        if (!dynStatus) return 'upcoming'; // while loading
        if (failedCourses.includes(code)) return 'failed';
        if (droppedCourses.includes(code)) return 'dropped';
        if (code in dynStatus) return dynStatus[code];
        return 'upcoming'; // Default for unconnected/unavailable courses
    };

    /* Highlight role relative to hovered code */
    const hlRole = code => {
        if (!hoveredCode) return null;
        if (code === hoveredCode) return 'active';
        if (courses[hoveredCode]?.prereqs.includes(code)) return 'prereq';
        if (isPrereqFor[hoveredCode]?.includes(code)) return 'dependent';
        return null;
    };

    /* Summer courses: failed/dropped from a year's semesters */
    const getSummerCourses = yearData => {
        const allCodes = yearData.sems.flatMap(s => s.courses);
        return allCodes.filter(c => failedCourses.includes(c) || droppedCourses.includes(c));
    };

    /* Stats */
    const allCodes = schedule.flatMap(y => y.sems.flatMap(s => s.courses));
    const totalCredits = allCodes.reduce((a, c) => a + (courses[c]?.credits || 0), 0);
    const doneCredits  = allCodes.filter(c => getStatus(c) === 'done').reduce((a, c) => a + (courses[c]?.credits || 0), 0);
    const doneCount    = allCodes.filter(c => getStatus(c) === 'done').length;
    const progCount    = allCodes.filter(c => getStatus(c) === 'prog').length;
    const progress     = Math.round(doneCredits / totalCredits * 100) || 0;

    /* Failed/dropped table list */
    const failedDropped = [...new Set([...failedCourses, ...droppedCourses])];

    /* ── Course card renderer ── */
    const renderCourse = (code, isSummer = false) => {
        const info = courses[code];
        if (!info) return null;
        const st   = getStatus(code);
        const cfg  = ST[isSummer ? (st === 'failed' ? 'failed' : 'dropped') : st];
        const role = hlRole(code);
        const hasPrereqs = info.prereqs && info.prereqs.length > 0;
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
                    <p className="cur-page-sub">{program || 'General (Level 1, 2)'}</p>
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
            {schedule.map(yearData => {
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
                                const info = courses[code] || {};
                                const st   = droppedCourses.includes(code) ? 'dropped' : 'failed';
                                const cfg  = ST[st];
                                const yearData = schedule.find(y => y.sems.some(s => s.courses.includes(code)));
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
