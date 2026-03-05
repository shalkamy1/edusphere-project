import React, { useState } from 'react';
import { useLang } from '../App.jsx';

const CATS = ['Academic', 'Facilities', 'Financial', 'Administrative'];

const HISTORY = [
    {
        id: 1, title: 'Library Noise Level', status: 'resolved', date: 'Submitted on 26 Sep 2025',
        response: '"Security has been notified to patrol the quiet zones more frequently."'
    },
    { id: 2, title: 'Portal Login Issue', status: 'pending', date: 'Submitted on 13 Sep 2025', response: null },
];

const STATUS_MAP = {
    resolved: { label: 'RESOLVED', color: '#00e676' },
    pending: { label: 'PENDING', color: '#ff9100' },
};

export default function PageComplaints({ setPage }) {
    const [cat, setCat] = useState('Academic');
    const [msg, setMsg] = useState('');

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={() => setPage('students')} className="back-btn">←</button>
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
                        <button className="submit-btn-red" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <span>📤</span> Submit Complaint
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
                        {HISTORY.map(h => {
                            const st = STATUS_MAP[h.status];
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
                                            <p style={{ fontSize: 12, color: 'var(--t2)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>{h.response}</p>
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
