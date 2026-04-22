import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLang } from '../App.jsx';
import { getStoredUser, getStudentCGPA, getStudentTranscript } from '../api.js';

const GRADE_COLORS = {
    'A+': '#00c853', 'A': '#00c853', 'A-': '#2e7d32',
    'B+': '#2979ff', 'B': '#2979ff', 'B-': '#1565c0',
    'C+': '#ff9100', 'C': '#ff9100', 'C-': '#e65100',
    'D+': '#f44336', 'D': '#f44336', 'D-': '#b71c1c',
    'F': '#b71c1c', '-': '#666'
};

export default function PageGrades() {
  const navigate = useNavigate();
    const { t, lang } = useLang();
    const isRTL = lang === 'ar';
    const g = t && t.pages2 ? t.pages2 : {};

    const [semesters, setSemesters] = useState([]);
    const [stats, setStats] = useState({ gpa: 0, avg: 0, credits: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [openSem, setOpenSem] = useState(null); // which semester is expanded

    useEffect(() => {
        const fetchData = async () => {
            const user = getStoredUser();
            if (!user || user.role !== 'student' || !user.student_id) {
                setLoading(false);
                return;
            }

            try {
                const [cgpaRes, transcriptRes] = await Promise.all([
                    getStudentCGPA(user.student_id).catch(() => null),
                    getStudentTranscript(user.student_id).catch(() => null)
                ]);

                let gpaVal = 0, creditsVal = 0;

                if (cgpaRes && cgpaRes.data) {
                    gpaVal = cgpaRes.data.cgpa || 0;
                    creditsVal = cgpaRes.data.total_credits || 0;
                }

                const colors = ["#2979ff", "#ff6d00", "#9c27b0", "#00c853", "#f50057", "#00b0ff", "#0097a7", "#7c4dff"];
                const icons = ["💻", "📐", "🤖", "📝", "⚡", "🔬", "📊", "🌐"];

                let semesterList = [];
                let totalAvg = 0, totalCount = 0;

                if (transcriptRes && transcriptRes.data && transcriptRes.data.semesters) {
                    // Reverse to show newest first
                    const semsRev = [...transcriptRes.data.semesters].reverse();

                    semsRev.forEach((sem, semIdx) => {
                        const semCourses = (sem.courses || []).map((c, i) => {
                            const totalS = parseFloat(c.total_score || 0);
                            totalAvg += totalS;
                            totalCount++;
                            return {
                                id: `${sem.semester_id}_${c.course_code}`,
                                code: c.course_code,
                                name: c.course_title,
                                grade: c.letter_grade || "-",
                                pct: totalS.toFixed(1),
                                credits: c.credit_hours || 0,
                                gradePoints: c.grade_points || 0,
                                ic: icons[(semIdx * 3 + i) % icons.length],
                                clr: colors[(semIdx * 2 + i) % colors.length],
                            };
                        });

                        semesterList.push({
                            id: sem.semester_id,
                            name: sem.semester_name || `Semester ${sem.semester_id}`,
                            year: sem.academic_year || '',
                            gpa: sem.gpa || 0,
                            totalCredits: sem.total_credits || semCourses.reduce((s, c) => s + c.credits, 0),
                            courses: semCourses,
                            color: colors[semIdx % colors.length]
                        });
                    });
                }

                const avgVal = totalCount > 0 ? (totalAvg / totalCount).toFixed(1) : 0;

                setStats({ gpa: gpaVal, avg: avgVal, credits: creditsVal, count: totalCount });
                setSemesters(semesterList);
                // Auto-open newest semester
                if (semesterList.length > 0) setOpenSem(semesterList[0].id);
            } catch (error) {
                console.error("Failed to load grades data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getGradeColor = (grade) => GRADE_COLORS[grade] || '#666';

    if (loading) {
        return <div className="page-enter" style={{ padding: '40px', textAlign: 'center' }}>{t.ui?.reqLoading || 'Loading grades...'}</div>;
    }

    return (
        <div className="page-enter" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="pheader" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ marginTop: 4 }}>
                    {isRTL ? '→' : '←'}
                </button>
                <div>
                    <h1>{g.gradesTitle || "📊 My Grades"}</h1>
                    <p>{g.gradesSub || "Detailed breakdown of your academic performance"}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="sgrid">
                {[
                    [g.gpa || "Overall GPA", parseFloat(stats.gpa).toFixed(2), "red", "🎓"],
                    [g.avg || "Avg Score", `${stats.avg}%`, "grn", "📈"],
                    [g.credits || "Credits", stats.credits, "blu", "📚"],
                    [g.courses || "Courses", stats.count, "org", "🏆"]
                ].map(([lbl, val, cl, ic]) => (
                    <div key={lbl} className={`card scard ${cl}`}>
                        <div className={`sc-ic ${cl}`}>{ic}</div>
                        <div>
                            <div className="sc-lbl">{lbl}</div>
                            <div className="sc-val">{val}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Semesters */}
            {semesters.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>{t.ui?.reqNoOrders || 'No courses or grades found.'}</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {semesters.map(sem => {
                        const isOpen = openSem === sem.id;
                        const gpaColor = sem.gpa >= 3.0 ? '#00c853' : sem.gpa >= 2.0 ? '#ff9100' : '#e53935';
                        return (
                            <div key={sem.id} style={{
                                background: 'var(--card)',
                                borderRadius: 16,
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                                transition: 'all .3s ease',
                                boxShadow: isOpen ? '0 4px 24px rgba(0,0,0,0.08)' : 'none'
                            }}>
                                {/* Semester Header */}
                                <div
                                    onClick={() => setOpenSem(isOpen ? null : sem.id)}
                                    style={{
                                        padding: '16px 20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        background: isOpen ? `linear-gradient(135deg, ${sem.color}08, ${sem.color}15)` : 'transparent',
                                        borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                                        transition: 'all .2s ease'
                                    }}
                                >
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 12,
                                        background: `${sem.color}18`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 20, flexShrink: 0
                                    }}>
                                        📅
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>
                                            {sem.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                                            {sem.courses.length} courses · {sem.totalCredits} credits
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: gpaColor }}>
                                            {parseFloat(sem.gpa).toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            GPA
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: 14, color: 'var(--t3)',
                                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform .3s ease'
                                    }}>
                                        ▼
                                    </div>
                                </div>

                                {/* Semester Courses */}
                                {isOpen && (
                                    <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {sem.courses.map(c => {
                                            const gradeClr = getGradeColor(c.grade);
                                            const pctNum = parseFloat(c.pct);
                                            return (
                                                <div key={c.id} style={{
                                                    display: 'flex', alignItems: 'center', gap: 12,
                                                    padding: '12px 14px',
                                                    background: 'var(--bg)',
                                                    borderRadius: 12,
                                                    border: '1px solid var(--border)',
                                                    transition: 'all .2s ease'
                                                }}>
                                                    <div style={{
                                                        width: 38, height: 38, borderRadius: 10,
                                                        background: `${c.clr}18`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 18, flexShrink: 0
                                                    }}>
                                                        {c.ic}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)' }}>{c.code}</span>
                                                            <span style={{
                                                                fontSize: 10, fontWeight: 600,
                                                                padding: '1px 8px', borderRadius: 20,
                                                                background: `${c.clr}15`, color: c.clr
                                                            }}>
                                                                {c.credits}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {c.name}
                                                        </div>
                                                        {/* Score bar */}
                                                        <div style={{
                                                            marginTop: 6,
                                                            height: 4, borderRadius: 4,
                                                            background: 'var(--border)',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                height: '100%', borderRadius: 4,
                                                                width: `${Math.min(pctNum, 100)}%`,
                                                                background: `linear-gradient(90deg, ${gradeClr}, ${gradeClr}cc)`,
                                                                transition: 'width .6s ease'
                                                            }} />
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'center', minWidth: 50, flexShrink: 0 }}>
                                                        <div style={{
                                                            fontSize: 18, fontWeight: 800, color: gradeClr,
                                                            lineHeight: 1
                                                        }}>
                                                            {c.grade}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, marginTop: 2 }}>
                                                            {c.pct}%
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
