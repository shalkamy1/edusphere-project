import React, { useState, useEffect } from 'react';
import { useLang } from '../App.jsx';

function CountUp({ target, duration = 1500 }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0, step = target / 60, timer = setInterval(() => {
            start += step; if (start >= target) { setVal(target); clearInterval(timer); } else setVal(Math.floor(start));
        }, duration / 60);
        return () => clearInterval(timer);
    }, [target, duration]);
    return <>{val}</>;
}

const ADM_EXCUSES = [
    { sname: "Ahmed Ali", sid: "ID: 20-2341", issue: "Severe Flu", type: "MEDICAL", date: "15 Oct" },
    { sname: "Sarah Smith", sid: "ID: 20-4122", issue: "Medical Surgery", type: "MEDICAL", date: "14 Oct" },
    { sname: "Omar Hassan", sid: "ID: 20-5532", issue: "Dental Appointment", type: "MEDICAL", date: "14 Oct" },
];

const ADM_COMPLAINTS = [
    { sname: "Mona Farouk", sid: "ID: 20-1102", issue: "Library Noise", type: "ACADEMIC", date: "26 Sep", status: "resolved" },
    { sname: "Khaled Saber", sid: "ID: 20-3341", issue: "Portal Login", type: "TECHNICAL", date: "13 Sep", status: "pending" },
];

const ADM_STUDENTS = [
    { name: "Rawda Ayman", id: "21at41", gpa: "3.82", year: "4th Year", status: "Active" },
    { name: "Ahmed Ali", id: "20-2341", gpa: "3.10", year: "3rd Year", status: "Active" },
    { name: "Mona Farouk", id: "20-1102", gpa: "2.75", year: "3rd Year", status: "Probation" },
    { name: "Omar Hassan", id: "20-5532", gpa: "3.40", year: "2nd Year", status: "Active" },
    { name: "Khaled Saber", id: "20-3341", gpa: "1.85", year: "2nd Year", status: "Warning" },
];

const LOGS = [
    { dot: "#00c853", when: "2 MIN AGO", who: "Admin Sarah", what: "Approved Course #92" },
    { dot: "#ff6d00", when: "19 MIN AGO", who: "System", what: "Flagged Pending Attendance" },
    { dot: "#2979ff", when: "31 MIN AGO", who: "Admin Mike", what: "Responded to Complaint" },
];

const STATUS_COLORS = { Active: '#00e676', Probation: '#ff9100', Warning: '#f44336' };

export default function PageAdmin() {
    const { t } = useLang();
    const a = t.admin;
    const [tab, setTab] = useState("excuses");
    const ADM_STATS = [
        { ic: "👥", lbl: a.totalStudents, val: 2450, cl: "cya" },
        { ic: "📋", lbl: a.pendingExcuses, val: 18, cl: "org" },
        { ic: "💬", lbl: a.newComplaints, val: 5, cl: "red" },
        { ic: "⚠️", lbl: a.warningIssued, val: 12, cl: "pur" },
    ];

    return (
        <div className="page-enter">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--t1)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#7c3aed' }}>🛡️</span> {a.title}
                    </h1>
                    <p style={{ color: 'var(--t3)', fontSize: 13, marginTop: 2 }}>{a.sub}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="med-search-wrap" style={{ width: 200, marginBottom: 0 }}>
                        <span style={{ color: 'var(--t3)', fontSize: 14 }}>🔍</span>
                        <input className="med-search" placeholder="Search records..." />
                    </div>
                    <button className="tb-icon-btn" style={{ position: 'relative' }}>
                        🔔 <span className="tb-badge" style={{ top: 4, right: 4 }}>3</span>
                    </button>
                </div>
            </div>

            <div className="adm-stats">
                {ADM_STATS.map(s => (
                    <div key={s.lbl} className={`card scard`}>
                        <div className={`sc-ic ${s.cl}`}>{s.ic}</div>
                        <div>
                            <div className="sc-lbl">{s.lbl}</div>
                            <div className="sc-val"><CountUp target={s.val} /></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="adm-wrap">
                <div>
                    <div className="adm-tabs">
                        <button className={`adm-tab${tab === "excuses" ? " act" : ""}`} onClick={() => setTab("excuses")}>{a.medExcuses}</button>
                        <button className={`adm-tab${tab === "complaints" ? " act" : ""}`} onClick={() => setTab("complaints")}>{a.complaints}</button>
                        <button className={`adm-tab${tab === "students" ? " act" : ""}`} onClick={() => setTab("students")}>{a.studentsList}</button>
                    </div>

                    {/* Medical Excuses */}
                    {tab === "excuses" && (
                        <div className="adm-table">
                            <div className="adm-thead">
                                <span>{a.student}</span><span>{a.issue}</span>
                                <span>{a.date}</span><span>{a.document}</span><span>{a.actions}</span>
                            </div>
                            {ADM_EXCUSES.map(e => (
                                <div key={e.sname} className="adm-row">
                                    <div>
                                        <div className="adm-sname">{e.sname}</div>
                                        <div className="adm-sid">{e.sid}</div>
                                    </div>
                                    <div><span className="medib">{e.type} </span>{e.issue}</div>
                                    <span style={{ color: "var(--t2)" }}>{e.date}</span>
                                    <span className="view-link">📎 View</span>
                                    <div className="act-icons">
                                        <span className="act-ic" title="Approve">✅</span>
                                        <span className="act-ic" title="Reject">❌</span>
                                        <span className="act-ic" title="More">⋮</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Complaints */}
                    {tab === "complaints" && (
                        <div className="adm-table">
                            <div className="adm-thead" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>
                                <span>STUDENT</span><span>ISSUE</span><span>DATE</span><span>STATUS</span>
                            </div>
                            {ADM_COMPLAINTS.map(c => (
                                <div key={c.sname} className="adm-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>
                                    <div>
                                        <div className="adm-sname">{c.sname}</div>
                                        <div className="adm-sid">{c.sid}</div>
                                    </div>
                                    <div><span className="medib" style={{ background: 'rgba(41,121,255,.12)', color: 'var(--blu)' }}>{c.type} </span>{c.issue}</div>
                                    <span style={{ color: 'var(--t2)' }}>{c.date}</span>
                                    <span style={{ color: c.status === 'resolved' ? '#00e676' : '#ff9100', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                                        {c.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Students List */}
                    {tab === "students" && (
                        <div className="adm-table">
                            <div className="adm-thead" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1.2fr' }}>
                                <span>STUDENT</span><span>ID</span><span>GPA</span><span>YEAR</span><span>STATUS</span>
                            </div>
                            {ADM_STUDENTS.map(s => (
                                <div key={s.id} className="adm-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1.2fr' }}>
                                    <div className="adm-sname">{s.name}</div>
                                    <div className="adm-sid">{s.id}</div>
                                    <span style={{ fontWeight: 700 }}>{s.gpa}</span>
                                    <span style={{ color: 'var(--t2)' }}>{s.year}</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 800,
                                        color: STATUS_COLORS[s.status] || 'var(--t2)',
                                        background: (STATUS_COLORS[s.status] || '#555') + '18',
                                        padding: '3px 10px', borderRadius: 20
                                    }}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel */}
                <div>
                    <div className="logs-card">
                        <div className="logs-hd">{a.recentLogs}</div>
                        {LOGS.map((l, i) => (
                            <div key={i} className="log-item">
                                <div className="log-dot" style={{ background: l.dot }} />
                                <div>
                                    <div className="log-when">{l.when}</div>
                                    <div className="log-who">{l.who}</div>
                                    <div className="log-what">{l.what}</div>
                                </div>
                            </div>
                        ))}
                        <div style={{ padding: "11px 16px", fontSize: 12, color: "var(--blu)", cursor: "pointer", textAlign: "center" }}>
                            {a.viewAll}
                        </div>
                    </div>
                    <div className="policy-card">
                        <div className="pt">{a.uniPolicy}</div>
                        <div className="pd">{a.policyDesc}</div>
                        <button className="policy-btn">{a.downloadCharter}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
