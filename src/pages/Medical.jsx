import React, { useState } from 'react';
import { useLang } from '../App.jsx';

const EXCUSES = [
    { id: 1, title: 'Severe Flu and Fever', date: '15 Oct 2025', status: 'pending' },
    { id: 2, title: 'Dental Emergency', date: '05 Oct 2025', status: 'approved' },
    { id: 3, title: 'Food Poisoning', date: '01 Oct 2025', status: 'rejected' },
];

const STATUS_MAP = {
    pending: { label: 'Pending', color: '#ff9100', icon: '🕐' },
    approved: { label: 'Approved', color: '#00e676', icon: '✅' },
    rejected: { label: 'Rejected', color: '#f44336', icon: '❌' },
};

export default function PageMedical({ setPage }) {
    const { t } = useLang();
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => setPage('students')} className="back-btn">←</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>Medical Excuses</h1>
                        <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>Manage and submit your medical reports</p>
                    </div>
                </div>
                <button className="submit-btn-red" onClick={() => setShowForm(true)}>+ Submit New Excuse</button>
            </div>

            <div className="med-layout">
                {/* Left: List */}
                <div>
                    {/* Search */}
                    <div className="med-search-wrap">
                        <span style={{ color: 'var(--t3)', fontSize: 15 }}>🔍</span>
                        <input className="med-search" placeholder="Search excuses..." />
                        <span style={{ color: 'var(--t3)', fontSize: 15, marginLeft: 'auto', cursor: 'pointer' }}>⊟</span>
                    </div>

                    {/* List */}
                    <div className="med-list">
                        {EXCUSES.map(ex => {
                            const st = STATUS_MAP[ex.status];
                            return (
                                <div
                                    key={ex.id}
                                    className={`med-item${selected === ex.id ? ' med-item-active' : ''}`}
                                    onClick={() => setSelected(ex.id)}
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
                        })}
                    </div>
                </div>

                {/* Right: Detail Panel */}
                <div className="card med-detail">
                    {selected ? (
                        (() => {
                            const ex = EXCUSES.find(e => e.id === selected);
                            const st = STATUS_MAP[ex.status];
                            return (
                                <div style={{ padding: 24 }}>
                                    <div style={{ marginBottom: 20 }}>
                                        <div className="med-item-title" style={{ fontSize: 18, marginBottom: 6 }}>{ex.title}</div>
                                        <div className="med-item-date">📅 {ex.date}</div>
                                    </div>
                                    <div className="med-status-badge" style={{ color: st.color, borderColor: st.color, display: 'inline-flex', marginBottom: 20 }}>
                                        {st.icon} {st.label}
                                    </div>
                                    <p style={{ color: 'var(--t2)', fontSize: 13, lineHeight: 1.6 }}>
                                        This medical excuse has been submitted and is currently under review. You will be notified once a decision has been made.
                                    </p>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="med-empty">
                            <div className="med-empty-icon">📋</div>
                            <div className="med-empty-title">No Excuse Selected</div>
                            <div className="med-empty-sub">
                                Select an excuse from the list to view its{' '}
                                <span style={{ color: 'var(--red)' }}>status and details</span>.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
