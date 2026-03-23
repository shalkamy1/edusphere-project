import React, { useState } from 'react';

/* School building illustration SVG */
function SchoolIllustration() {
    return (
        <div className="login-illustration">
            <img
                src="https://i.imgur.com/7JNnCap.png"
                alt="EduSphere Campus"
                className="login-school-img"
                onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px">
              <svg width="160" height="160" viewBox="0 0 200 200" fill="none">
                <rect x="40" y="100" width="120" height="80" fill="#c62828" rx="4"/>
                <rect x="20" y="85" width="160" height="20" fill="#b71c1c" rx="2"/>
                <rect x="70" y="130" width="60" height="50" fill="#7f1717"/>
                <rect x="85" y="140" width="12" height="20" fill="#1a237e" rx="1"/>
                <rect x="103" y="140" width="12" height="20" fill="#1a237e" rx="1"/>
                <polygon points="100,30 30,90 170,90" fill="#8d1515"/>
                <circle cx="100" cy="68" r="12" fill="#ffd54f" stroke="#b71c1c" stroke-width="2"/>
                <rect x="78" y="66" width="44" height="2" fill="#b71c1c"/>
                <rect x="98" y="46" width="4" height="24" fill="#b71c1c"/>
              </svg>
              <div style="color:#c62828;font-weight:700;font-size:18px;font-family:Inter,sans-serif">EduSphere University</div>
            </div>`;
                }}
            />
        </div>
    );
}

export default function PageLogin({ onLogin }) {
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr('');
        await new Promise(r => setTimeout(r, 900));
        if (email && pass.length >= 4) {
            onLogin({ name: 'Rawda Ayman', role: 'Student', email });
        } else {
            setErr('Invalid credentials. Use any email + password (min 4 chars)');
        }
        setLoading(false);
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        setCodeSent(true);
        setLoading(false);
        setTimeout(() => setView('reset'), 1200);
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (newPass !== confirmPass) { setErr('Passwords do not match'); return; }
        setLoading(true);
        setErr('');
        await new Promise(r => setTimeout(r, 800));
        setResetSuccess(true);
        setLoading(false);
        setTimeout(() => { setView('login'); setResetSuccess(false); setResetCode(''); setNewPass(''); setConfirmPass(''); }, 2000);
    };

    return (
        <div className="login-screen-v2">
            {/* Left: Illustration */}
            <div className="login-left">

                {/* Logo pinned top-left */}
                <div className="login-left-logo">
                    <img src="/logo.png" alt="EduSphere" className="login-top-logo" />
                    <div>
                        <div className="login-brand-title">EduSphere</div>
                        <div className="login-brand-sub">University Portal</div>
                    </div>
                </div>

                {/* Building image — full height, centered */}
                <div className="login-building-wrap">
                    <img src="/university.png"   alt="University Campus" className="login-campus-img login-campus-light" />
                    <img src="/university_t.png" alt="University Campus" className="login-campus-img login-campus-dark" />
                </div>

                {/* Bottom gradient overlay + tagline */}
                <div className="login-left-footer">
                    <div className="login-tagline">"Empowering minds, shaping futures"</div>
                    <div className="login-left-dots">
                        <span /><span className="active-dot" /><span />
                    </div>
                </div>

            </div>

            {/* Right: Auth Card */}
            <div className="login-right">
                <div className="login-card-v2">
                    {view === 'login' && (
                        <>
                            <div className="login-card-header">
                                <h1 className="login-card-title">Welcome at EduSphere</h1>
                                <div className="login-divider" />
                            </div>


                            <form onSubmit={handleLogin}>
                                <div className="lf-group">
                                    <label className="lf-label">Email</label>
                                    <input
                                        type="email"
                                        className="lf-input"
                                        placeholder="Enter here"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="lf-group">
                                    <label className="lf-label">Password</label>
                                    <div className="lf-pass-wrap">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className="lf-input"
                                            placeholder="Enter password here"
                                            value={pass}
                                            onChange={e => setPass(e.target.value)}
                                            required
                                        />
                                        <button type="button" className="lf-eye" onClick={() => setShowPass(v => !v)}>
                                            {showPass ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>

                                <div className="lf-row-between">
                                    <label className="lf-remember">
                                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                        <span>Remember me</span>
                                    </label>
                                </div>

                                {err && <div className="lf-err">{err}</div>}

                                <button type="submit" className="lf-btn-primary" disabled={loading}>
                                    {loading ? <span className="login-spinner" /> : 'Sign In'}
                                </button>
                            </form>

                            <button className="lf-forgot-link" onClick={() => { setView('forgot'); setErr(''); }}>
                                Forget your password?
                            </button>
                        </>
                    )}

                    {view === 'forgot' && (
                        <>
                            <div className="login-card-header">
                                <h1 className="login-card-title">Forgot Password</h1>
                                <p className="login-card-sub">Enter your email to receive a reset code</p>
                            </div>
                            <form onSubmit={handleForgotSubmit}>
                                <div className="lf-group">
                                    <label className="lf-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="lf-input"
                                        placeholder="Enter your email"
                                        value={resetEmail}
                                        onChange={e => setResetEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                {codeSent && <div style={{ color: '#00c853', fontSize: 13, fontWeight: 600, textAlign: 'center', padding: '8px 0' }}>✅ Code sent! Redirecting...</div>}
                                <button type="submit" className="lf-btn-primary" disabled={loading || codeSent}>
                                    {loading ? <span className="login-spinner" /> : 'Send Reset Code'}
                                </button>
                            </form>
                            <button className="lf-back-link" onClick={() => { setView('login'); setCodeSent(false); setResetEmail(''); setErr(''); }}>
                                ← Back to Login
                            </button>
                        </>
                    )}

                    {view === 'reset' && (
                        <>
                            <div className="login-card-header">
                                <h1 className="login-card-title">Reset Password</h1>
                                <p className="login-card-sub">Enter the code and your new password</p>
                            </div>
                            {resetSuccess ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                                    <div style={{ fontWeight: 800, color: '#00c853', marginBottom: 6 }}>Password Reset!</div>
                                    <div style={{ fontSize: 13, color: '#888' }}>Redirecting to login...</div>
                                </div>
                            ) : (
                                <form onSubmit={handleResetSubmit}>
                                    <div className="lf-group">
                                        <label className="lf-label">Verification Code</label>
                                        <input type="text" className="lf-input" placeholder="Enter 6-digit code" value={resetCode} onChange={e => setResetCode(e.target.value)} required />
                                    </div>
                                    <div className="lf-group">
                                        <label className="lf-label">New Password</label>
                                        <input type="password" className="lf-input" placeholder="Enter new password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
                                    </div>
                                    <div className="lf-group">
                                        <label className="lf-label">Confirm Password</label>
                                        <input type="password" className="lf-input" placeholder="Confirm new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                                    </div>
                                    {err && <div className="lf-err">{err}</div>}
                                    <button type="submit" className="lf-btn-primary" disabled={loading}>
                                        {loading ? <span className="login-spinner" /> : 'Reset Password'}
                                    </button>
                                </form>
                            )}
                            <button className="lf-back-link" onClick={() => { setView('login'); setErr(''); }}>
                                ← Back to Login
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
