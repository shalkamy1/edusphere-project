import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLang, useToast } from '../App.jsx';
import { getStudentWarnings, createStudentRequest } from '../api.js';

export default function PageWarning() {
  const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useLang();
    const ui = t.ui || {};
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appealingId, setAppealingId] = useState(null);
    const [appealedIds, setAppealedIds] = useState(new Set());

    useEffect(() => {
        const loadWarnings = async () => {
            setLoading(true);
            try {
                const res = await getStudentWarnings();
                if (res.success && res.data) {
                    setWarnings(res.data);
                }
            } catch (err) {
                console.error("Failed to load warnings", err);
            } finally {
                setLoading(false);
            }
        };
        loadWarnings();
    }, []);

    const handleAppeal = async (warning) => {
        if (appealedIds.has(warning.id)) return;
        setAppealingId(warning.id);
        
        try {
            const details = `[Appeal: ${warning.type}]\nSubject: ${warning.subject}\nDate Issued: ${warning.date}\nI am requesting an appeal for this warning.`;
            await createStudentRequest('other', details);
            setAppealedIds(prev => {
                const newSet = new Set(prev);
                newSet.add(warning.id);
                return newSet;
            });
            showToast("Your appeal request has been submitted successfully.", "success");
        } catch (err) {
            showToast(err.message || "Failed to submit appeal.", "error");
        } finally {
            setAppealingId(null);
        }
    };

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={() => navigate('/students')} className="back-btn">←</button>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>{ui.warnTitle || 'Academic Warnings'}</h1>
                    <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>{ui.warnSub || 'Important notifications regarding your academic standing'}</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', background: 'var(--card)', borderRadius: 16 }}>{ui.warnLoading || 'Loading warnings...'}</div>
                ) : warnings.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', background: 'var(--card)', borderRadius: 16 }}>{ui.warnNone || "You have no academic or attendance warnings. Keep up the good work! 🎉"}</div>
                ) : (
                    warnings.map(w => (
                        <div key={w.id} className="warn-card" style={{ borderLeft: `4px solid ${w.color || '#ff9100'}` }}>
                            <div className="warn-hd">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="warn-dot" style={{ background: w.color || '#ff9100' }} />
                                    <div>
                                        <div className="warn-type">{w.type}</div>
                                        <div className="warn-subject">{w.subject}</div>
                                    </div>
                                </div>
                                <div className="warn-actions">
                                    <button 
                                        className="warn-appeal-btn" 
                                        onClick={() => handleAppeal(w)}
                                        disabled={appealedIds.has(w.id) || appealingId === w.id}
                                    >
                                        {appealedIds.has(w.id)
                                            ? (ui.warnAppealPending || 'Appeal Pending')
                                            : (appealingId === w.id
                                                ? (ui.warnSubmitting || 'Submitting...')
                                                : (ui.warnRequestAppeal || 'Request Appeal'))}
                                    </button>
                                    <button className="warn-policy-btn">{ui.warnViewPolicy || 'View Policy'}</button>
                                </div>
                            </div>
                            <p className="warn-desc">{w.desc}</p>
                            <div className="warn-footer">
                                <span>📅 {ui.warnIssued || 'Issued:'} {w.date}</span>
                                <span>· {ui.warnSeverity || 'Severity:'} <strong style={{ color: w.color || '#ff9100' }}>{w.severity || 'Normal'}</strong></span>
                            </div>
                        </div>
                    ))
                )}

                {/* Policy Note */}
                <div className="warn-note">
                    <span style={{ color: '#2979ff', fontSize: 16, marginRight: 10 }}>ℹ️</span>
                    <div>
                        <div style={{ fontWeight: 700, color: '#2979ff', marginBottom: 4, fontSize: 13 }}>{ui.warnPolicyTitle || 'Academic Policy Note'}</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>
                            {ui.warnPolicyDesc || 'Warnings are issued automatically based on your academic performance and attendance records. If you believe there is an error, please contact your academic advisor within 7 days of the issuance date.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
