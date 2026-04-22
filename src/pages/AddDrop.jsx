import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLang } from '../App.jsx';
import { getStoredUser, getAvailableCourses, getStudentCourses, registerCourse, dropCourse, adviseStudent } from '../api.js';

const DIFFICULTY_COLOR = { Easy: "#00c853", Medium: "#ff9100", Hard: "#e53935" };

export default function PageAddDrop({ t, goal: initialGoal, onGoalSelect, onRequestGoal, onCourseDrop }) {
  const navigate = useNavigate();
    const { lang } = useLang();
    const isRTL = lang === 'ar';
    const g = t ? t.pages2 : {};

    const [enrolled, setEnrolled] = useState([]);
    const [avail, setAvail] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [toast, setToast] = useState(null);
    const [removing, setRemoving] = useState(null);
    const [adding, setAdding] = useState(null);
    const [search, setSearch] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [goal, setGoal] = useState(initialGoal || null);
    const [aiLoading, setAiLoading] = useState(false);
    
    // Fallback UI icons/colors since DB might lack them
    const getFallbackArt = (code) => {
        const hash = [...code].reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const clrs = ["#2979ff", "#e53935", "#ff6d00", "#00c853", "#7c4dff", "#0097a7", "#f57c00"];
        const icons = ["📘", "📐", "💻", "🤖", "🗄️", "✍️", "⚖️", "📊", "🧪", "🌐"];
        return { ic: icons[hash % icons.length], clr: clrs[hash % clrs.length] };
    };

    const getCourseAttributes = (code) => {
        const hash = [...code].reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const difficulties = ["Easy", "Medium", "Hard"];
        const difficulty = difficulties[hash % 3];
        const gpaImpact = difficulty === 'Easy' ? 4.0 : (difficulty === 'Medium' ? 3.0 : 2.0);
        return { difficulty, gpaImpact };
    };

    const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = getStoredUser();
                if (!user || user.role !== 'student' || !user.student_id) return;
                
                // 1. Fetch available sections
                const availData = await getAvailableCourses().catch(() => ({ data: { sections: [] } }));
                const sections = availData?.data?.sections || [];
                
                // 2. Fetch my currently enrolled courses
                const myCoursesData = await getStudentCourses(user.student_id).catch(() => ({ data: [] }));
                const allMy = myCoursesData?.data || [];
                
                // Filter active enrollments for the current UI
                // Usually we filter by status 'enrolled' or current semester
                const activeEnrollments = allMy.filter(e => e.status === 'enrolled' || e.status === 'registered');
                
                // Form enrolled array
                const enrolledMapped = activeEnrollments.map(e => {
                    const code = e.teacher_course?.course?.code || `C${e.teacher_course_id}`;
                    const art = getFallbackArt(code);
                    return {
                        id: e.id, // StudentCourse PK for dropping
                        teacher_course_id: e.teacher_course_id,
                        code: code,
                        name: e.teacher_course?.course?.title || e.teacher_course?.course?.name || "Unknown",
                        sched: e.teacher_course?.schedule || "TBA",
                        room: e.teacher_course?.room || "TBA",
                        ic: art.ic,
                        clr: art.clr,
                        credits: e.teacher_course?.course?.credit_hours || 3
                    };
                });
                
                setEnrolled(enrolledMapped);
                
                // Form available array
                const enrolledSectionIds = new Set(enrolledMapped.map(e => e.teacher_course_id));
                const availMapped = sections.filter(s => !enrolledSectionIds.has(s.teacher_course_id)).map(s => {
                    const code = s.course?.code || "UKN";
                    const art = getFallbackArt(code);
                    const attrs = getCourseAttributes(code);
                    const isFull = s.enrolled_count >= s.capacity;
                    return {
                        teacher_course_id: s.teacher_course_id,
                        code: code,
                        name: s.course?.title || s.course?.name || "Unknown Course",
                        inst: s.teacher?.name || "TBA",
                        sched: s.schedule || "TBA",
                        room: s.room || "TBA",
                        enrolled: s.enrolled_count || 0,
                        total: s.capacity || 30,
                        full: isFull,
                        credits: s.course?.credit_hours || 3,
                        gpaImpact: attrs.gpaImpact,
                        difficulty: attrs.difficulty,
                        tags: [isFull ? "Full" : "Available"],
                        ic: art.ic,
                        clr: art.clr,
                        can_register: s.can_register,
                        validation_errors: s.validation_errors || []
                    };
                });
                setAvail(availMapped);
            } catch (e) {
                console.error("Error fetching add/drop data", e);
                showToast("Failed to load registration data", "#e53935");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleGoal = async () => {
            if (typeof initialGoal === 'string') {
                setAiLoading(true);
                try {
                    const user = getStoredUser();
                    const prompt = initialGoal === 'gpa' 
                        ? "Please recommend the best available courses to improve my GPA this semester. Mention course codes explicitly."
                        : "Please recommend available courses that will help me complete my requirements faster. Mention course codes explicitly.";
                    
                    const res = await adviseStudent(user.student_id, prompt);
                    const aiText = res?.data?.recommendation || "";
                    const newGoal = { goal: initialGoal, aiText };
                    setGoal(newGoal);
                    if (onGoalSelect) onGoalSelect(newGoal);
                } catch (e) {
                    showToast("AI Recommendations failed. Showing local suggestions.", "#e53935");
                    setGoal(initialGoal);
                } finally {
                    setAiLoading(false);
                }
            } else if (initialGoal) {
                setGoal(initialGoal);
            } else {
                setGoal(null);
            }
        };
        handleGoal();
    }, [initialGoal]);

    const activeGoalType = typeof goal === 'object' ? goal?.goal : goal;

    const getRecommended = () => {
        const available = avail.filter(a => !a.full && a.can_register);
        
        const uniqueAvailable = [];
        const seenCodes = new Set();
        for (const a of available) {
            if (!seenCodes.has(a.code)) {
                seenCodes.add(a.code);
                uniqueAvailable.push(a);
            }
        }
        
        if (typeof goal === 'object' && goal?.aiText) {
            const aiText = goal.aiText.toLowerCase();
            const recommendedAvail = uniqueAvailable.filter(a => 
                aiText.includes(a.code.toLowerCase()) || 
                aiText.includes(a.name.toLowerCase())
            );
            if (recommendedAvail.length > 0) return recommendedAvail;
        }

        if (activeGoalType === 'gpa') return [...uniqueAvailable].sort((a, b) => b.gpaImpact - a.gpaImpact).slice(0, 3);
        if (activeGoalType === 'req') return [...uniqueAvailable].sort((a, b) => b.credits - a.credits).slice(0, 3);
        return [];
    };
    const recommended = getRecommended();
    const recommendedTids = new Set(recommended.map(r => r.teacher_course_id));

    const handleDrop = async (eItem) => {
        setRemoving(eItem.teacher_course_id);
        try {
            await dropCourse(eItem.id);
            setEnrolled(prev => prev.filter(e => e.id !== eItem.id));
            
            // Re-fetch available courses so server recalculates credit limits
            try {
                const availData = await getAvailableCourses();
                const sections = availData?.data?.sections || [];
                const newEnrolledIds = new Set(
                    enrolled.filter(e => e.id !== eItem.id).map(e => e.teacher_course_id)
                );
                const availMapped = sections.filter(s => !newEnrolledIds.has(s.teacher_course_id)).map(s => {
                    const code = s.course?.code || "UKN";
                    const art = getFallbackArt(code);
                    const attrs = getCourseAttributes(code);
                    const isFull = s.enrolled_count >= s.capacity;
                    return {
                        teacher_course_id: s.teacher_course_id,
                        code: code,
                        name: s.course?.title || s.course?.name || "Unknown Course",
                        inst: s.teacher?.name || "TBA",
                        sched: s.schedule || "TBA",
                        room: s.room || "TBA",
                        enrolled: s.enrolled_count || 0,
                        total: s.capacity || 30,
                        full: isFull,
                        credits: s.course?.credit_hours || 3,
                        gpaImpact: attrs.gpaImpact,
                        difficulty: attrs.difficulty,
                        tags: [isFull ? "Full" : "Available"],
                        ic: art.ic,
                        clr: art.clr,
                        can_register: s.can_register,
                        validation_errors: s.validation_errors || []
                    };
                });
                setAvail(availMapped);
            } catch (_) {
                // Fallback: just add the dropped course back as available
                setAvail(prev => [...prev, {
                    teacher_course_id: eItem.teacher_course_id,
                    code: eItem.code, name: eItem.name, inst: "TBA",
                    sched: eItem.sched, room: eItem.room,
                    enrolled: 1, total: 30, full: false, credits: eItem.credits,
                    tags: ["Available"], ic: eItem.ic, clr: eItem.clr,
                    can_register: true, validation_errors: []
                }]);
            }
            showToast(`Dropped: ${eItem.code}`, "#e53935");
            if (onCourseDrop) onCourseDrop(eItem.code);
        } catch (err) {
            showToast(err.message || "Failed to drop course", "#e53935");
        } finally {
            setRemoving(null);
        }
    };

    const handleAdd = async (section) => {
        if (!section.can_register) {
            showToast(section.validation_errors?.[0] || 'Cannot register for this course', '#e53935');
            return;
        }
        if (section.full) return;
        setAdding(section.teacher_course_id);
        try {
            const res = await registerCourse(section.teacher_course_id);
            const enrData = res.data; // gives enrollment_id, etc.
            
            const newEnrolled = [...enrolled, { 
                id: enrData.enrollment_id,
                teacher_course_id: section.teacher_course_id,
                code: section.code, 
                name: section.name, 
                sched: section.sched, 
                room: section.room, 
                ic: section.ic, 
                clr: section.clr,
                credits: section.credits
            }];
            setEnrolled(newEnrolled);
            
            // Re-fetch available courses so server recalculates credit limits
            try {
                const availData = await getAvailableCourses();
                const sections2 = availData?.data?.sections || [];
                const enrolledIds = new Set(newEnrolled.map(e => e.teacher_course_id));
                const availMapped = sections2.filter(s => !enrolledIds.has(s.teacher_course_id)).map(s => {
                    const code = s.course?.code || "UKN";
                    const art = getFallbackArt(code);
                    const attrs = getCourseAttributes(code);
                    const isFull = s.enrolled_count >= s.capacity;
                    return {
                        teacher_course_id: s.teacher_course_id,
                        code: code,
                        name: s.course?.title || s.course?.name || "Unknown Course",
                        inst: s.teacher?.name || "TBA",
                        sched: s.schedule || "TBA",
                        room: s.room || "TBA",
                        enrolled: s.enrolled_count || 0,
                        total: s.capacity || 30,
                        full: isFull,
                        credits: s.course?.credit_hours || 3,
                        gpaImpact: attrs.gpaImpact,
                        difficulty: attrs.difficulty,
                        tags: [isFull ? "Full" : "Available"],
                        ic: art.ic,
                        clr: art.clr,
                        can_register: s.can_register,
                        validation_errors: s.validation_errors || []
                    };
                });
                setAvail(availMapped);
            } catch (_) {
                // Fallback: just remove the added course
                setAvail(prev => prev.filter(a => a.teacher_course_id !== section.teacher_course_id));
            }
            showToast(`Registered: ${section.code}`, "#00c853");
        } catch (err) {
            showToast(err.message || 'Registration failed', '#e53935');
        } finally {
            setAdding(null);
        }
    };

    const filteredAvail = avail.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        (a.inst || '').toLowerCase().includes(search.toLowerCase())
    );

    const displayList = filteredAvail;

    const goalMeta = activeGoalType === 'gpa'
        ? { label: 'Improve GPA', color: '#2979ff', bg: 'rgba(41,121,255,0.1)', icon: '📈', tip: 'AI recommended courses to boost your GPA' }
        : activeGoalType === 'req'
        ? { label: 'Complete Requirements', color: '#00c853', bg: 'rgba(0,200,83,0.1)', icon: '🎯', tip: 'AI recommended courses for faster graduation' }
        : null;

    if (loading) {
        return <div className="page-enter" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading courses...</div>;
    }

    const totalCredits = enrolled.reduce((sum, e) => sum + (e.credits || 0), 0);

    return (
        <div className="page-enter" dir={isRTL ? 'rtl' : 'ltr'}>
            {toast && <div className="toast-msg" style={{ background: toast.color }}>{toast.msg}</div>}

            {/* Header */}
            <div className="pheader" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ marginTop: 4 }}>
                    {isRTL ? '→' : '←'}
                </button>
                <div style={{ flex: 1 }}>
                    <h1>{g.addDropTitle || "Add / Drop Courses"}</h1>
                    <p>{g.addDropSub || "Manage your course enrollment instantly"}</p>
                </div>
                {/* Smart Recommendation button */}
                <button
                    onClick={() => onRequestGoal && onRequestGoal()}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 20, background: goalMeta ? goalMeta.bg : 'rgba(124,77,255,0.1)', border: `1.5px solid ${goalMeta ? goalMeta.color + '40' : 'rgba(124,77,255,0.3)'}`, color: goalMeta ? goalMeta.color : '#7c4dff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                >
                    {goalMeta ? goalMeta.icon : '✨'} {goalMeta ? goalMeta.label : 'Smart Recommendations'}
                    {goalMeta && <span style={{ fontSize: 11, opacity: .7, fontWeight: 500 }}>&nbsp;Change</span>}
                </button>
            </div>

            {/* Goal active banner */}
            {aiLoading ? (
                <div style={{ background: 'rgba(124,77,255,0.05)', border: '1px solid rgba(124,77,255,0.2)', borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="spinner" style={{ width: 24, height: 24, border: '3px solid rgba(124,77,255,0.3)', borderTopColor: '#7c4dff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ flex: 1, color: '#7c4dff', fontWeight: 600, fontSize: 14 }}>✨ AI Agent is analyzing your records and generating recommendations...</div>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : goalMeta && (
                <div style={{ background: goalMeta.bg, border: `1px solid ${goalMeta.color}30`, borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 24 }}>{goalMeta.icon}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: goalMeta.color, fontSize: 14, marginBottom: 2 }}>Goal: {goalMeta.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)' }}>{goalMeta.tip} — <strong style={{ color: 'var(--t1)' }}>{recommended.length} courses recommended</strong></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowAll(v => !v)} style={{ background: 'transparent', border: `1px solid ${goalMeta.color}50`, color: goalMeta.color, borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {showAll ? 'Show Recommended' : 'Show All'}
                        </button>
                        <button onClick={() => { setGoal(null); setShowAll(false); if (onGoalSelect) onGoalSelect(null); }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--t3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Clear ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                {[
                    ["📚", g.myEnrolled || "Enrolled Courses", String(enrolled.length), "red"],
                    ["⚡", "Total Credits", String(totalCredits), "blu"],
                    ["✅", g.availCourses || "Available Courses", String(avail.filter(a => !a.full).length), "grn"]
                ].map(([ic, lbl, val, cl]) => (
                    <div key={lbl} className={`card scard ${cl}`}>
                        <div className={`sc-ic ${cl}`}>{ic}</div>
                        <div>
                            <div className="sc-lbl">{lbl}</div>
                            <div className="sc-val">{val}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ad-grid">
                {/* My Courses */}
                <div className="ad-card">
                    <div className="ad-card-hd">
                        <span>{g.myEnrolled || "My Courses"}</span>
                        <span className="ad-badge-enrolled">{enrolled.length} enrolled</span>
                    </div>
                    {enrolled.length === 0 && <div className="ad-empty">No courses enrolled yet.</div>}
                    {enrolled.map(e => (
                        <div key={e.teacher_course_id} className={`ad-enrolled-item${removing === e.teacher_course_id ? ' ad-removing' : ''}`}>
                            <div className="ad-enr-ic" style={{ background: e.clr + '22' }}>{e.ic}</div>
                            <div style={{ flex: 1 }}>
                                <div className="ad-enr-code">{e.code} — {e.name}</div>
                                <div className="ad-enr-sched">🕐 {e.sched} &nbsp;📍 {e.room}</div>
                            </div>
                            <button className="ad-drop-btn-new" title="Drop course" onClick={() => handleDrop(e)} disabled={removing === e.teacher_course_id}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                {g.dropBtn || "Drop"}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Available Courses */}
                <div className="ad-card">
                    <div className="ad-card-hd">
                        <span>{g.availCourses || "Available Courses"}</span>
                        <div className="ad-search-wrap">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input className="ad-search-input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {displayList.length === 0 && <div className="ad-empty">No available courses match your criteria.</div>}

                    {displayList.map(a => {
                        const isRec = recommendedTids.has(a.teacher_course_id) && goal;
                        const disabled = a.full || !a.can_register || adding === a.teacher_course_id;
                        return (
                            <div key={a.teacher_course_id} className={`ad-avail-item${adding === a.teacher_course_id ? ' ad-adding' : ''}${isRec ? ' ad-recommended' : ''}`}>
                                <div className="ad-avail-top">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <div className="ad-avail-code">{a.code}</div>
                                            {isRec && (
                                                <span className="ad-tag" style={{ background: goalMeta?.color || '#7c4dff', color: '#fff', border: 'none' }}>
                                                    ⭐ Recommended
                                                </span>
                                            )}
                                            {a.tags && a.tags.map(tag => (
                                                <span key={tag} className={`ad-tag${tag === 'Full' ? ' ad-tag-full' : tag === 'Available' ? ' ad-tag-avail' : ''}`}>{tag}</span>
                                            ))}
                                            {a.difficulty && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: DIFFICULTY_COLOR[a.difficulty] + '20', color: DIFFICULTY_COLOR[a.difficulty] }}>{a.difficulty}</span>
                                            )}
                                        </div>
                                        <div className="ad-avail-name">{a.name}</div>
                                        <div className="ad-avail-meta">
                                            <span>👤 {a.inst}</span>
                                            <span>🕐 {a.sched}</span>
                                            <span>📚 {a.credits} cr</span>
                                            {activeGoalType === 'gpa' && <span style={{ color: '#2979ff', fontWeight: 700 }}>GPA+{a.gpaImpact}</span>}
                                        </div>
                                        {!a.can_register && a.validation_errors?.length > 0 && (
                                            <div style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>
                                                {a.validation_errors[0]}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className={a.full ? "ad-add-btn-disabled" : (a.can_register ? "ad-add-btn-new" : "ad-add-btn-disabled")}
                                        disabled={disabled}
                                        onClick={() => handleAdd(a)}
                                    >
                                        {a.full ? "Full" : (a.can_register ? (
                                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{g.addBtn || "Add"}</>
                                        ) : "Locked")}
                                    </button>
                                </div>
                                <div className="ad-enroll-bar">
                                    <div className={`ad-enroll-fill${a.full ? " full" : ""}`} style={{ width: `${a.total > 0 ? (a.enrolled / a.total * 100) : 0}%` }} />
                                </div>
                                <div className="ad-enroll-count">{a.enrolled}/{a.total} enrolled</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
