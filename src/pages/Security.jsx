import React, { useState } from 'react';

const SESSIONS = [
    { device: 'Chrome on Windows', ip: '192.168.1.5', time: 'Now', current: true },
    { device: 'Mobile - Safari iOS', ip: '41.234.12.80', time: '2 hours ago', current: false },
];

export default function PageSecurity({ onLogout }) {
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [conf, setConf] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        if (newPw.length >= 4 && newPw === conf) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            setOldPw(''); setNewPw(''); setConf('');
        }
    };

    return (
        <div className="page-enter" style={{ maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>
                        🔒 Security
                    </h1>
                    <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>Manage your account security and sessions</p>
                </div>
            </div>

            {/* Change Password */}
            <div className="card sec-section">
                <div className="sec-section-title">Change Password</div>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                        { label: 'Current Password', val: oldPw, set: setOldPw },
                        { label: 'New Password', val: newPw, set: setNewPw },
                        { label: 'Confirm Password', val: conf, set: setConf },
                    ].map(f => (
                        <div key={f.label} className="login-field" style={{ margin: 0 }}>
                            <label>{f.label}</label>
                            <div className="login-input-wrap">
                                <span className="login-ic">🔑</span>
                                <input type="password" value={f.val} onChange={e => f.set(e.target.value)}
                                    placeholder="••••••••" className="login-input" />
                            </div>
                        </div>
                    ))}
                    {saved && <div style={{ color: '#00e676', fontSize: 13, fontWeight: 700 }}>✅ Password updated successfully!</div>}
                    <button type="submit" className="submit-btn-red" style={{ alignSelf: 'flex-start' }}>
                        Save Password
                    </button>
                </form>
            </div>

            {/* Active Sessions */}
            <div className="card sec-section" style={{ marginTop: 20 }}>
                <div className="sec-section-title">Active Sessions</div>
                {SESSIONS.map((s, i) => (
                    <div key={i} className="sess-row">
                        <div className="sess-ic">{s.current ? '💻' : '📱'}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 2 }}>{s.device}</div>
                            <div style={{ fontSize: 12, color: 'var(--t3)' }}>IP: {s.ip} · {s.time}</div>
                        </div>
                        {s.current ? (
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#00e676', background: 'rgba(0,230,118,.1)', padding: '4px 10px', borderRadius: 20 }}>THIS DEVICE</span>
                        ) : (
                            <button className="warn-appeal-btn" style={{ fontSize: 11 }}>Revoke</button>
                        )}
                    </div>
                ))}
            </div>

            {/* Logout */}
            <div className="card sec-section" style={{ marginTop: 20 }}>
                <div className="sec-section-title" style={{ color: 'var(--red)' }}>Danger Zone</div>
                <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.6 }}>
                    Signing out will end your current session. You'll need to sign in again to access the portal.
                </p>
                <button onClick={onLogout} style={{
                    background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)',
                    padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit'
                }}
                    onMouseEnter={e => { e.target.style.background = 'var(--red)'; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--red)'; }}
                >
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
}
