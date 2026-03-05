import React from 'react';
import { useLang } from '../App.jsx';

const MILESTONES = [
    { name: 'Freshman Year', date: 'June 2023', pct: 100, st: 'COMPLETED', color: '#00c853' },
    { name: 'Sophomore Year', date: 'June 2024', pct: 100, st: 'COMPLETED', color: '#00c853' },
    { name: 'Junior Year', date: '1-4 June 2025', pct: 65, st: 'IN PROGRESS', color: '#2979ff' },
    { name: 'Senior Project', date: 'Pending', pct: 0, st: 'PENDING', color: '#555b72' },
];

const TRANSCRIPT = [
    { sem: 'Fall 2022', gpa: '3.8', credits: 18, honor: 'Dean\'s List' },
    { sem: 'Spring 2023', gpa: '3.9', credits: 18, honor: 'Dean\'s List' },
    { sem: 'Fall 2023', gpa: '3.7', credits: 18, honor: null },
    { sem: 'Spring 2024', gpa: '3.8', credits: 18, honor: null },
    { sem: 'Fall 2024', gpa: '3.9', credits: 15, honor: 'Dean\'s List' },
];

export default function PageRecords({ setPage }) {
    const { t } = useLang();
    const r = t.records;

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={() => setPage && setPage('dashboard')} className="back-btn">←</button>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>Records</h1>
                    <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>Your official academic record and status</p>
                </div>
            </div>

            <div className="rec-wrap">
                {/* Left: Student Profile Card */}
                <div className="rec-profile-card">
                    <div className="rec-av">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="rec-name">Rawda Ayman</div>
                    <div className="rec-id">ID: 21at41</div>

                    <div className="rec-info-rows">
                        {[
                            { icon: '🏛️', lbl: r.faculty || 'FACULTY', val: 'Engineering & Technology' },
                            { icon: '📚', lbl: r.program || 'PROGRAM', val: 'B.Sc. in Computer Science' },
                            { icon: '🎓', lbl: r.year || 'YEAR', val: '4th Year' },
                            { icon: '⭐', lbl: r.gpa || 'GPA', val: '3.82 / 4.0' },
                            { icon: '📋', lbl: 'CREDITS', val: '75 / 120' },
                        ].map(row => (
                            <div key={row.lbl} className="rec-row">
                                <span className="rec-row-ic">{row.icon}</span>
                                <div>
                                    <div className="rec-row-lbl">{row.lbl}</div>
                                    <div className="rec-row-val">{row.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="enroll-badge">
                        <span style={{ color: '#00e676' }}>● Active Status</span>
                        <span className="enroll-valid">VALID</span>
                    </div>
                </div>

                {/* Right: Academic Records */}
                <div className="rec-right">

                    {/* Academic Milestones */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                            <span style={{ color: 'var(--cya)', fontSize: 18 }}>🎓</span>
                            <span style={{ fontWeight: 800, fontSize: 15 }}>Academic Milestones</span>
                        </div>
                        <div className="milestones-grid">
                            {MILESTONES.map(m => (
                                <div key={m.name} className="mcard">
                                    <div className="mcard-top" style={{ borderLeft: `3px solid ${m.color}` }}>
                                        <div className="m-name">{m.name}</div>
                                        <div className="m-date">{m.date}</div>
                                        <span className="mst" style={{ color: m.color, fontSize: 10, fontWeight: 800 }}>{m.st}</span>
                                    </div>
                                    <div className="mbar">
                                        <div className="mfill" style={{ width: `${m.pct}%`, background: m.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Semester Transcript */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: 'var(--blu)', fontSize: 16 }}>📊</span>
                                <span style={{ fontWeight: 800, fontSize: 14 }}>Semester Transcript</span>
                            </div>
                            <button className="rec-dl-btn">⬇ Download PDF</button>
                        </div>
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '10px 20px', background: 'var(--bg2)', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--border)' }}>
                                <span>SEMESTER</span><span>GPA</span><span>CREDITS</span><span>HONOR</span>
                            </div>
                            {TRANSCRIPT.map(row => (
                                <div key={row.sem} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background .15s', cursor: 'default' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)' }}>{row.sem}</span>
                                    <span style={{ fontWeight: 800, color: '#00c853', fontSize: 14 }}>{row.gpa}</span>
                                    <span style={{ fontSize: 13, color: 'var(--t2)' }}>{row.credits} cr</span>
                                    <span>
                                        {row.honor ? (
                                            <span style={{ fontSize: 10, fontWeight: 800, color: '#ff9100', background: 'rgba(255,145,0,.12)', padding: '3px 8px', borderRadius: 20 }}>{row.honor}</span>
                                        ) : (
                                            <span style={{ color: 'var(--t3)', fontSize: 12 }}>—</span>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
