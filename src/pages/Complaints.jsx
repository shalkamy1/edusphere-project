import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLang, useToast } from '../App.jsx';
import { getStudentRequests, createStudentRequest } from '../api.js';

const CATS = ['Academic', 'Facilities', 'Financial', 'Administrative'];

const STATUS_MAP = {
    resolved: { label: 'RESOLVED', color: '#00e676' },
    pending: { label: 'PENDING', color: '#ff9100' },
    approved: { label: 'APPROVED', color: '#00e676' },
    rejected: { label: 'REJECTED', color: '#f44336' },
};

export default function PageComplaints() {
  const navigate = useNavigate();
    const { showToast } = useToast();
    const [cat, setCat] = useState('Academic');
    const [msg, setMsg] = useState('');
    
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getStudentRequests('complaint');
            if (res.success && res.data) {
                const mapped = res.data.map(req => {
                    // Extract category if it's prepended, or just use the first line
                    let title = "Complaint";
                    if (req.details) {
                        const lines = req.details.split('\n');
                        if (lines[0].startsWith('[')) {
                            title = lines[0];
                        } else {
                            title = lines[0].substring(0, 40) + (lines[0].length > 40 ? '...' : '');
                        }
                    }
                    return {
                        id: req.id,
                        title: title,
                        status: req.status || 'pending',
                        date: `Submitted on ${new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
                        response: req.comment || null
                    };
                });
                mapped.sort((a,b) => b.id - a.id);
                setHistory(mapped);
            }
        } catch (err) {
            console.error("Failed to load complaints", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!msg.trim()) {
            showToast("Please provide a message.", "error");
            return;
        }
        
        setSubmitting(true);
        try {
            const details = `[${cat}]\n${msg}`;
            await createStudentRequest('complaint', details);
            setMsg('');
            setCat('Academic');
            loadData(); // reload
            showToast("Complaint submitted successfully.", "success");
        } catch (err) {
            showToast(err.message || "Failed to submit complaint.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={() => navigate('/students')} className="back-btn">←</button>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>Complaints</h1>
                    <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>Voice your concerns anonymously or officially</p>
                </div>
            </div>

            <div className="cmp-layout">
                {/* Left: New Complaint Form */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                        <span style={{ color: 'var(--red)', fontSize: 18 }}>📣</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>New Complaint</span>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</div>
                        <div className="cmp-cats">
                            {CATS.map(c => (
                                <button key={c} className={`cmp-cat${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Message</div>
                        <textarea
                            className="cmp-textarea"
                            placeholder="Describe your issue in detail..."
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            rows={6}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button 
                            className="submit-btn-red" 
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            <span>📤</span> {submitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                        <button className="cmp-attach-btn">📎</button>
                    </div>

                    <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 14, lineHeight: 1.5, fontStyle: 'italic' }}>
                        All complaints are treated with strict confidentiality and will be addressed by the relevant department within 3-5 working days.
                    </p>
                </div>

                {/* Right: History */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{ color: 'var(--org)' }}>🕐</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>Complaint History</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {loading ? (
                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)' }}>Loading...</div>
                        ) : history.length === 0 ? (
                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)', background: 'var(--card)', borderRadius: 12 }}>No complaint history found.</div>
                        ) : history.map(h => {
                            const st = STATUS_MAP[h.status] || STATUS_MAP.pending;
                            return (
                                <div key={h.id} className="cmp-hist-item">
                                    <div className="cmp-hist-hd">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ color: 'var(--red)', fontSize: 16 }}>📣</span>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{h.title}</span>
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: st.color }}>{st.label}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: h.response ? 12 : 0 }}>{h.date}</div>
                                    {h.response && (
                                        <div className="cmp-response">
                                            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Official Response</div>
                                            <p style={{ fontSize: 12, color: 'var(--t2)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>"{h.response}"</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
