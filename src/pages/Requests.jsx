import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLang, useToast } from '../App.jsx';
import { getStudentRequests, createStudentRequest } from '../api.js';

const DOCS = [
    { id: 1, name: 'Enrolment Certificate', price: '100 EGP', processing: 'Processing: 1-2 Days' },
    { id: 2, name: 'Official Transcript', price: '230 EGP', processing: 'Processing: 3-5 Days' },
    { id: 3, name: 'ID Card Replacement', price: '150 EGP', processing: 'Processing: Same Day' },
    { id: 4, name: 'Course Description', price: '50 EGP', processing: 'Processing: 1-2 Days' },
    { id: 5, name: 'Military Service Form', price: 'Free', processing: 'Processing: 3 Days' },
    { id: 6, name: 'Graduation Statement', price: '300 EGP', processing: 'Processing: 3 Days' },
];

const STATUS_MAP = {
    pending: { label: 'pending', color: '#ff9100' },
    approved: { label: 'approved', color: '#00e676' },
    completed: { label: 'completed', color: '#00e676' },
    rejected: { label: 'rejected', color: '#f44336' },
};

export default function PageRequests() {
  const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useLang();
    const ui = t.ui || {};
    const [trackId, setTrackId] = useState('ID: REQ-001');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(null);
    const [confirmDoc, setConfirmDoc] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getStudentRequests('certificate');
            if (res.success && res.data) {
                const mapped = res.data.map(req => {
                    let title = "Document Request";
                    if (req.details) {
                        const lines = req.details.split('\n');
                        title = lines[0].replace('Request for: ', '');
                    }
                    return {
                        id: req.id,
                        name: title,
                        status: req.status || 'pending',
                        date: new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    };
                });
                mapped.sort((a,b) => b.id - a.id);
                setOrders(mapped);
            }
        } catch (err) {
            console.error("Failed to load document requests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = async (doc) => {
        setConfirmDoc(null);
        setOrdering(doc.id);
        try {
            await createStudentRequest('certificate', `Request for: ${doc.name}\nPrice: ${doc.price}\nProcessing: ${doc.processing}`);
            loadData();
            showToast(`${doc.name} requested successfully.`, 'success');
        } catch (err) {
            showToast(err.message || 'Failed to request document.', 'error');
        } finally {
            setOrdering(null);
        }
    };

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => navigate('/students')} className="back-btn">←</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>{ui.reqTitle || 'Official Requests'}</h1>
                        <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>{ui.reqSub || 'Order certificates and academic documents'}</p>
                    </div>
                </div>
                <div className="med-search-wrap" style={{ width: 220 }}>
                    <span style={{ color: 'var(--t3)', fontSize: 14 }}>🔍</span>
                    <input className="med-search" placeholder={ui.reqSearch || 'Search documents...'} />
                </div>
            </div>

            <div className="req-layout">
                {/* Left: Document Grid */}
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>{ui.reqAvailDocs || 'Available Documents'}</div>
                    <div className="req-grid">
                        {DOCS.map(d => (
                            <div 
                                key={d.id} 
                                className="req-doc-card"
                                onClick={() => setConfirmDoc(d)}
                                style={{ cursor: ordering === d.id ? 'wait' : 'pointer', opacity: ordering === d.id ? 0.6 : 1 }}
                            >
                                <div className="req-price">{d.price}</div>
                                <div style={{ color: 'var(--red)', fontSize: 22, marginBottom: 10 }}>📄</div>
                                <div className="req-doc-name">{d.name}</div>
                                <div className="req-doc-proc">🕐 {d.processing}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{marginTop: 12, fontSize: 12, color: 'var(--t3)'}}>{ui.reqTip || '💡 Click on a document to order it.'}</p>
                </div>

                {/* Right: Orders & Track */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <span style={{ color: 'var(--org)' }}>🕐</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>{ui.reqRecentOrders || 'Recent Orders'}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {loading ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)' }}>{ui.reqLoading || 'Loading...'}</div>
                            ) : orders.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)', background: 'var(--card)', borderRadius: 12 }}>{ui.reqNoOrders || 'No recent orders.'}</div>
                            ) : orders.map(o => {
                                const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
                                return (
                                    <div key={o.id} className="req-order-item">
                                        <div className="req-order-hd">
                                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{o.name}</div>
                                            <span style={{ fontSize: 10, fontWeight: 800, color: st.color, textTransform: 'uppercase' }}>{st.label}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>{o.date}</div>
                                        {(o.status === 'completed' || o.status === 'approved') && (
                                            <button className="req-dl-btn" onClick={() => showToast("Downloading document...", "info")}>{ui.reqDownload || '⬇ Download E-Copy'}</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Track card */}
                    <div className="req-track-card">
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{ui.reqTrackTitle || 'Track Outside Requests?'}</div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 16, lineHeight: 1.5 }}>
                            {ui.reqTrackDesc || 'If you requested documents from the campus office, you can track their status using your request ID.'}
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                className="req-track-input"
                                value={trackId}
                                onChange={e => setTrackId(e.target.value)}
                            />
                            <button className="req-track-btn" onClick={() => showToast("Tracking feature coming soon.", "info")}>{ui.reqTrackBtn || 'Track'}</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Confirm Modal */}
            {confirmDoc && (
                <div className="modal-overlay" onClick={() => setConfirmDoc(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>{ui.reqConfirmTitle || 'Confirm Request'}</h2>
                        <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 24, lineHeight: 1.5 }}>
                            {ui.reqConfirmQ || 'Are you sure you want to request'} <strong>{confirmDoc.name}</strong>?<br/>
                            <span style={{ display: 'inline-block', marginTop: 8, padding: '4px 8px', background: 'var(--red-tnt)', color: 'var(--red)', borderRadius: 6, fontWeight: 700 }}>
                                {ui.reqPrice || 'Price:'} {confirmDoc.price}
                            </span>
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="back-btn" style={{ flex: 1, padding: '10px 0', width: 'auto', height: 'auto', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }} onClick={() => setConfirmDoc(null)}>
                                {ui.cancel || 'Cancel'}
                            </button>
                            <button className="submit-btn-red" style={{ flex: 1, margin: 0, padding: '10px 0' }} onClick={() => handleOrder(confirmDoc)}>
                                {ui.reqConfirmBtn || 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
