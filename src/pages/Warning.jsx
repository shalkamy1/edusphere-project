import React from 'react';
import { useLang } from '../App.jsx';

const WARNINGS = [
    {
        id: 1, type: 'Attendance Warning', subject: 'CS402 - Advanced Software Engineering',
        color: '#ff9100',
        desc: 'Your attendance in this course has dropped below 80%. Please ensure regular attendance to avoid being barred from the final exam.',
        date: 'Issued on 12 Oct 2025', severity: 'Medium',
    },
    {
        id: 2, type: 'Academic Warning', subject: 'Overall GPA',
        color: '#f44336',
        desc: 'Your current GPA is 2.1. Students with a GPA below 2.0 will be placed on academic probation next semester.',
        date: 'Issued on 05 Sep 2025', severity: 'High',
    },
];

export default function PageWarning({ setPage }) {
    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={() => setPage && setPage('students')} className="back-btn">←</button>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>Academic Warnings</h1>
                    <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>Important notifications regarding your academic standing</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 780 }}>
                {WARNINGS.map(w => (
                    <div key={w.id} className="warn-card" style={{ borderLeft: `4px solid ${w.color}` }}>
                        <div className="warn-hd">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div className="warn-dot" style={{ background: w.color }} />
                                <div>
                                    <div className="warn-type">{w.type}</div>
                                    <div className="warn-subject">{w.subject}</div>
                                </div>
                            </div>
                            <div className="warn-actions">
                                <button className="warn-appeal-btn">Request Appeal</button>
                                <button className="warn-policy-btn">View Policy</button>
                            </div>
                        </div>
                        <p className="warn-desc">{w.desc}</p>
                        <div className="warn-footer">
                            <span>📅 {w.date}</span>
                            <span>· Severity: <strong style={{ color: w.color }}>{w.severity}</strong></span>
                        </div>
                    </div>
                ))}

                {/* Policy Note */}
                <div className="warn-note">
                    <span style={{ color: '#2979ff', fontSize: 16, marginRight: 10 }}>ℹ️</span>
                    <div>
                        <div style={{ fontWeight: 700, color: '#2979ff', marginBottom: 4, fontSize: 13 }}>Academic Policy Note</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>
                            Warnings are issued automatically based on your academic performance and attendance records.
                            If you believe there is an error, please contact your academic advisor within 7 days of the issuance date.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
