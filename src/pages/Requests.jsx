import React, { useState } from 'react';
import { useLang } from '../App.jsx';

const DOCS = [
    { id: 1, name: 'Enrolment Certificate', price: '100 EGP', processing: 'Processing: 1-2 Days' },
    { id: 2, name: 'Official Transcript', price: '230 EGP', processing: 'Processing: 3-5 Days' },
    { id: 3, name: 'ID Card Replacement', price: '150 EGP', processing: 'Processing: Same Day' },
    { id: 4, name: 'Course Description', price: '50 EGP', processing: 'Processing: 1-2 Days' },
    { id: 5, name: 'Military Service Form', price: 'Free', processing: 'Processing: 3 Days' },
    { id: 6, name: 'Graduation Statement', price: '300 EGP', processing: 'Processing: 3 Days' },
];

const ORDERS = [
    { id: 1, name: 'Official Transcript', date: '14 Oct 2025', status: 'completed', statusColor: '#00e676' },
    { id: 2, name: 'Enrolment Certificate', date: '14 Oct 2025', status: 'in progress', statusColor: '#ff9100' },
];

export default function PageRequests({ setPage }) {
    const [trackId, setTrackId] = useState('ID: REQ-001');

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => setPage && setPage('students')} className="back-btn">←</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>Official Requests</h1>
                        <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>Order certificates and academic documents</p>
                    </div>
                </div>
                <div className="med-search-wrap" style={{ width: 220 }}>
                    <span style={{ color: 'var(--t3)', fontSize: 14 }}>🔍</span>
                    <input className="med-search" placeholder="Search documents..." />
                </div>
            </div>

            <div className="req-layout">
                {/* Left: Document Grid */}
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>Available Documents</div>
                    <div className="req-grid">
                        {DOCS.map(d => (
                            <div key={d.id} className="req-doc-card">
                                <div className="req-price">{d.price}</div>
                                <div style={{ color: 'var(--red)', fontSize: 22, marginBottom: 10 }}>📄</div>
                                <div className="req-doc-name">{d.name}</div>
                                <div className="req-doc-proc">🕐 {d.processing}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Orders & Track */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <span style={{ color: 'var(--org)' }}>🕐</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>Recent Orders</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {ORDERS.map(o => (
                                <div key={o.id} className="req-order-item">
                                    <div className="req-order-hd">
                                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{o.name}</div>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: o.statusColor, textTransform: 'uppercase' }}>{o.status}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>{o.date}</div>
                                    {o.status === 'completed' && (
                                        <button className="req-dl-btn">⬇ Download E-Copy</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Track card */}
                    <div className="req-track-card">
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Track Outside Requests?</div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 16, lineHeight: 1.5 }}>
                            If you requested documents from the campus office, you can track their status using your request ID.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                className="req-track-input"
                                value={trackId}
                                onChange={e => setTrackId(e.target.value)}
                            />
                            <button className="req-track-btn">Track</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
