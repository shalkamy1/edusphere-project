import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLang } from '../App.jsx';
import { getStoredUser, getStudentCGPA, getStudentTranscript, getProfile } from '../api.js';

const TRANSCRIPT_FALLBACK = [
    { sem: 'Fall 2022', gpa: '3.8', credits: 18, honor: "Dean's List" },
    { sem: 'Spring 2023', gpa: '3.9', credits: 18, honor: "Dean's List" },
    { sem: 'Fall 2023', gpa: '3.7', credits: 18, honor: null },
    { sem: 'Spring 2024', gpa: '3.8', credits: 18, honor: null },
    { sem: 'Fall 2024', gpa: '3.9', credits: 15, honor: "Dean's List" },
];

export default function PageRecords() {
    const navigate = useNavigate();
    const { t } = useLang();
    const r = t.records;
    const user = getStoredUser();
    const fullName = user?.name || 'Student Name';
    const stdId = user?.student_id || 'N/A';

    const [cgpaData, setCgpaData] = useState({ cgpa: '0.00', credits: 0, totalRequired: 120 });
    const [transcript, setTranscript] = useState(TRANSCRIPT_FALLBACK);
    const [profileData, setProfileData] = useState({
        faculty: '—',
        program: '—',
        level: '—',
        isHonor: false,
        loading: true,
    });

    useEffect(() => {
        // Fetch profile (faculty, program, level)
        getProfile()
            .then(res => {
                if (res.success && res.data) {
                    const st = res.data.student || {};
                    setProfileData({
                        faculty: res.data.faculty || st.faculty || 'Engineering & Technology',
                        program: st.program || '—',
                        level: st.level ? `Level ${st.level}` : '—',
                        isHonor: !!st.is_honor,
                        loading: false,
                    });
                }
            })
            .catch(() => setProfileData(p => ({ ...p, loading: false })));

        // Fetch CGPA
        if (user?.student_id) {
            getStudentCGPA(user.student_id)
                .then(res => {
                    if (res && res.data) {
                        setCgpaData({
                            cgpa: parseFloat(res.data.cgpa || 0).toFixed(2),
                            credits: res.data.total_credits || 0,
                            totalRequired: res.data.total_required_credits || 120,
                        });
                    }
                })
                .catch(console.error);

            // Fetch transcript
            getStudentTranscript(user.student_id)
                .then(res => {
                    if (res && res.data && res.data.semesters) {
                        const sems = res.data.semesters.map(s => ({
                            sem: s.semester_name || `Semester ${s.semester_id}`,
                            gpa: parseFloat(s.gpa || 0).toFixed(2),
                            credits: s.total_credits || 0,
                            honor: parseFloat(s.gpa) >= 3.8 ? "Dean's List" : null,
                        }));
                        if (sems.length > 0) setTranscript(sems);
                    }
                })
                .catch(console.error);
        }
    }, [user?.student_id]);

    const infoRows = [
        { icon: '🏛️', lbl: r.faculty || 'FACULTY',  val: profileData.faculty },
        { icon: '📚', lbl: r.program || 'PROGRAM',  val: profileData.program },
        { icon: '🎓', lbl: r.year    || 'YEAR',     val: profileData.level },
        { icon: '⭐', lbl: r.gpa     || 'CUMULATIVE GPA', val: `${cgpaData.cgpa} / 4.0` },
        { icon: '📋', lbl: r.credits || 'CREDITS',  val: `${cgpaData.credits} / ${cgpaData.totalRequired}` },
    ];

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={() => navigate('/dashboard')} className="back-btn">←</button>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>
                        {r.title || 'Records'}
                    </h1>
                    <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>
                        {r.sub || 'Your official academic record and status'}
                    </p>
                </div>
            </div>

            <div className="rec-wrap">
                {/* Left: Student Profile Card */}
                <div className="rec-profile-card">
                    <div className="rec-av" style={{ overflow: 'hidden', padding: user?.profile_picture_url ? 0 : '', background: user?.profile_picture_url ? 'transparent' : '' }}>
                        {user?.profile_picture_url ? (
                            <img 
                                src={user.profile_picture_url} 
                                alt="Profile" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'block';
                                }} 
                            />
                        ) : null}
                        <svg 
                            style={{ display: user?.profile_picture_url ? 'none' : 'block' }}
                            width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="rec-name">{fullName}</div>
                    <div className="rec-id">ID: {stdId}</div>

                    <div className="rec-info-rows">
                        {profileData.loading ? (
                            <div style={{ textAlign: 'center', padding: 16, color: 'var(--t3)', fontSize: 13 }}>Loading...</div>
                        ) : (
                            infoRows.map(row => (
                                <div key={row.lbl} className="rec-row">
                                    <span className="rec-row-ic">{row.icon}</span>
                                    <div>
                                        <div className="rec-row-lbl">{row.lbl}</div>
                                        <div className="rec-row-val">{row.val}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="enroll-badge">
                        <span style={{ color: '#00e676' }}>● Active Status</span>
                        <span className="enroll-valid">VALID</span>
                    </div>
                </div>

                {/* Right: Academic Records */}
                <div className="rec-right">
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
                            {transcript.map(row => (
                                <div key={row.sem}
                                    style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background .15s', cursor: 'default' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)' }}>{row.sem}</span>
                                    <span style={{ fontWeight: 800, color: '#00c853', fontSize: 14 }}>{row.gpa}</span>
                                    <span style={{ fontSize: 13, color: 'var(--t2)' }}>{row.credits}</span>
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
