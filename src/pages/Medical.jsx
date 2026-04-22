import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLang, useToast } from '../App.jsx';
import { getStudentRequests, createStudentRequest } from '../api.js';

export default function PageMedical() {
  const navigate = useNavigate();
    const { t } = useLang();
    const { showToast } = useToast();
    const m = t.medical || {};
    const [excuses, setExcuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Status labels from translation
    const STATUS_MAP = {
        pending:  { label: m.pending  || 'Pending',  color: '#ff9100', icon: '🕐' },
        approved: { label: m.approved || 'Approved', color: '#00e676', icon: '✅' },
        rejected: { label: m.rejected || 'Rejected', color: '#f44336', icon: '❌' },
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getStudentRequests('leave');
            if (res.success && res.data) {
                const mapped = res.data.map(req => ({
                    id: req.id,
                    title: req.details ? (req.details.split('\n')[0].substring(0, 50) + (req.details.length > 50 ? '...' : '')) : (m.title || 'Medical Excuse'),
                    fullDetails: req.details,
                    date: new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: req.status || 'pending',
                    comment: req.comment
                }));
                mapped.sort((a, b) => b.id - a.id);
                setExcuses(mapped);
            }
        } catch (err) {
            console.error("Failed to load medical excuses", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !details.trim()) {
            showToast("Please provide both title and details.", "error");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const combinedDetails = `${title}\n\n${details}`;
            await createStudentRequest('leave', combinedDetails);
            setShowForm(false);
            setTitle('');
            setDetails('');
            loadData();
            showToast("Medical excuse submitted successfully.", "success");
        } catch (err) {
            showToast(err.message || 'Failed to submit medical excuse.', "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => navigate('/students')} className="back-btn">←</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>{m.title || 'Medical Excuses'}</h1>
                        <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>{m.sub || 'Manage and submit your medical reports'}</p>
                    </div>
                </div>
                <button className="submit-btn-red" onClick={() => setShowForm(true)}>{m.submitNew || '+ Submit New Excuse'}</button>
            </div>

            <div className="med-layout">
                {/* Left: List */}
                <div>
                    {/* Search */}
                    <div className="med-search-wrap">
                        <span style={{ color: 'var(--t3)', fontSize: 15 }}>🔍</span>
                        <input className="med-search" placeholder={m.search || 'Search excuses...'} />
                        <span style={{ color: 'var(--t3)', fontSize: 15, marginLeft: 'auto', cursor: 'pointer' }}>⊟</span>
                    </div>

                    {/* List */}
                    <div className="med-list">
                        {loading ? (
                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)' }}>Loading...</div>
                        ) : excuses.length === 0 ? (
                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)' }}>{m.noExcuse || 'No excuses found.'}</div>
                        ) : (
                            excuses.map(ex => {
                                const st = STATUS_MAP[ex.status] || STATUS_MAP.pending;
                                return (
                                    <div
                                        key={ex.id}
                                        className={`med-item${selected?.id === ex.id ? ' med-item-active' : ''}`}
                                        onClick={() => setSelected(ex)}
                                    >
                                        <div className="med-item-icon">📄</div>
                                        <div className="med-item-body">
                                            <div className="med-item-title">{ex.title}</div>
                                            <div className="med-item-date">📅 {ex.date}</div>
                                        </div>
                                        <div className="med-status-badge" style={{ color: st.color, borderColor: st.color }}>
                                            {st.icon} {st.label}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Detail Panel */}
                <div className="card med-detail">
                    {selected ? (
                        (() => {
                            const st = STATUS_MAP[selected.status] || STATUS_MAP.pending;
                            return (
                                <div style={{ padding: 24 }}>
                                    <div style={{ marginBottom: 20 }}>
                                        <div className="med-item-title" style={{ fontSize: 18, marginBottom: 6 }}>{selected.title}</div>
                                        <div className="med-item-date">📅 {selected.date}</div>
                                    </div>
                                    <div className="med-status-badge" style={{ color: st.color, borderColor: st.color, display: 'inline-flex', marginBottom: 20 }}>
                                        {st.icon} {st.label}
                                    </div>
                                    <p style={{ color: 'var(--t2)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                        {selected.fullDetails}
                                    </p>
                                    {selected.comment && (
                                        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>Admin Comment</div>
                                            <div style={{ fontSize: 13, color: 'var(--t2)' }}>{selected.comment}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    ) : (
                        <div className="med-empty">
                            <div className="med-empty-icon">📋</div>
                            <div className="med-empty-title">{m.noExcuse || 'No Excuse Selected'}</div>
                            <div className="med-empty-sub">{m.noExcuseSub || 'Select an excuse from the list to view its status and details'}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-hd">
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>{m.submitModal || 'Submit Medical Excuse'}</div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{m.uploadDoc || 'Upload details for review'}</div>
                            </div>
                            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {error && <div style={{ color: 'var(--red)', fontSize: 13, background: '#f4433615', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

                            <div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 700, marginBottom: 8 }}>{m.description || 'TITLE / REASON'}</div>
                                <input
                                    type="text"
                                    className="cmp-textarea"
                                    style={{ padding: '10px 14px', height: 'auto' }}
                                    placeholder={m.descPlaceholder || 'e.g. Severe Flu'}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 700, marginBottom: 8 }}>DETAILS / NOTES</div>
                                <textarea
                                    className="cmp-textarea"
                                    rows={4}
                                    placeholder="Provide dates and additional details..."
                                    value={details}
                                    onChange={e => setDetails(e.target.value)}
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-btn-red" disabled={submitting}>
                                {submitting ? 'Submitting...' : (m.submit || 'Submit Request')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
