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
    const [mode, setMode] = useState('student'); // 'student' | 'admin'
    const [view, setView] = useState('login'); // 'login' | 'forgot' | 'reset'
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
        if (mode === 'admin') {
            if (email === 'admin@edusphere.edu' && pass === 'admin123') {
                onLogin({ name: 'Admin User', role: 'Admin', email });
            } else if (pass.length >= 4) {
                onLogin({ name: 'Admin User', role: 'Admin', email });
            } else {
                setErr('Invalid admin credentials');
            }
        } else {
            if (email && pass.length >= 4) {
                onLogin({ name: 'Rawda Ayman', role: 'Student', email });
            } else {
                setErr('Invalid credentials. Use any email + password (min 4 chars)');
            }
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
                <div className="login-school-wrap">
                    <div className="login-school-bg">
                        <div className="login-school-cloud cloud1" />
                        <div className="login-school-cloud cloud2" />
                        <div className="login-school-cloud cloud3" />
                    </div>
                    <svg className="login-building-svg" viewBox="0 0 520 380" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Sky clouds */}
                        <ellipse cx="80" cy="60" rx="55" ry="22" fill="#dde8f0" opacity="0.7" />
                        <ellipse cx="120" cy="50" rx="35" ry="16" fill="#eef3f8" opacity="0.8" />
                        <ellipse cx="420" cy="70" rx="50" ry="20" fill="#dde8f0" opacity="0.6" />
                        <ellipse cx="460" cy="58" rx="32" ry="14" fill="#eef3f8" opacity="0.7" />

                        {/* Ground */}
                        <rect x="0" y="310" width="520" height="70" fill="#8aaa6a" rx="0" />
                        <rect x="0" y="300" width="520" height="14" fill="#a5bf82" />

                        {/* Trees left */}
                        <rect x="45" y="240" width="10" height="60" fill="#5d4037" />
                        <ellipse cx="50" cy="230" rx="28" ry="35" fill="#4caf50" />
                        <ellipse cx="50" cy="220" rx="20" ry="25" fill="#66bb6a" />

                        <rect x="95" y="255" width="8" height="45" fill="#5d4037" />
                        <ellipse cx="99" cy="245" rx="22" ry="28" fill="#43a047" />

                        {/* Trees right */}
                        <rect x="430" y="245" width="10" height="55" fill="#5d4037" />
                        <ellipse cx="435" cy="235" rx="26" ry="32" fill="#4caf50" />
                        <ellipse cx="435" cy="225" rx="18" ry="22" fill="#66bb6a" />

                        <rect x="475" y="255" width="8" height="45" fill="#5d4037" />
                        <ellipse cx="479" cy="245" rx="22" ry="28" fill="#43a047" />

                        {/* Main building body */}
                        <rect x="100" y="155" width="320" height="160" fill="#c8917a" rx="4" />

                        {/* Windows row 1 */}
                        {[130, 175, 240, 305, 355].map((x, i) => (
                            <rect key={i} x={x} y="175" width="28" height="36" rx="3" fill="#87CEEB" stroke="#a0785e" strokeWidth="1.5" />
                        ))}

                        {/* Windows row 2 */}
                        {[130, 175, 355].map((x, i) => (
                            <rect key={i} x={x} y="235" width="28" height="36" rx="3" fill="#87CEEB" stroke="#a0785e" strokeWidth="1.5" />
                        ))}

                        {/* Door arch */}
                        <rect x="218" y="235" width="84" height="80" fill="#7f4f2a" rx="4" />
                        <ellipse cx="260" cy="235" rx="42" ry="18" fill="#7f4f2a" />
                        <rect x="230" y="245" width="26" height="50" rx="3" fill="#87CEEB" opacity="0.7" />
                        <rect x="264" y="245" width="26" height="50" rx="3" fill="#87CEEB" opacity="0.7" />

                        {/* Front porch columns */}
                        <rect x="175" y="210" width="16" height="110" fill="#bf8065" rx="3" />
                        <rect x="329" y="210" width="16" height="110" fill="#bf8065" rx="3" />
                        <rect x="205" y="210" width="16" height="110" fill="#bf8065" rx="3" />
                        <rect x="299" y="210" width="16" height="110" fill="#bf8065" rx="3" />

                        {/* Porch roof/overhang */}
                        <rect x="165" y="198" width="190" height="16" fill="#a0725a" rx="3" />

                        {/* Main roof */}
                        <polygon points="80,158 260,65 440,158" fill="#8b3a2a" />
                        <polygon points="100,158 260,72 420,158" fill="#a0453a" />

                        {/* Pediment / triangle detail */}
                        <polygon points="200,158 260,110 320,158" fill="#b85040" />

                        {/* Clock tower */}
                        <rect x="228" y="30" width="64" height="90" fill="#b85040" rx="3" />
                        <rect x="220" y="88" width="80" height="12" fill="#a0453a" />
                        {/* Clock face */}
                        <circle cx="260" cy="62" r="22" fill="#f5f5dc" stroke="#8b3a2a" strokeWidth="3" />
                        <circle cx="260" cy="62" r="18" fill="#fffde7" stroke="#8b3a2a" strokeWidth="1" />
                        <line x1="260" y1="62" x2="260" y2="48" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="260" y1="62" x2="270" y2="66" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                        {/* Tower cap */}
                        <polygon points="228,34 292,34 260,8" fill="#8b1111" />
                        {/* Tower windows */}
                        <rect x="242" y="92" width="36" height="22" rx="2" fill="#1a237e" opacity="0.7" />

                        {/* Dome/finial on top */}
                        <ellipse cx="260" cy="8" rx="6" ry="4" fill="#ffd54f" />
                        <rect x="258" y="2" width="4" height="10" fill="#777" />
                    </svg>
                </div>
                <div className="login-brand-name">EduSphere University</div>
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

                            {/* Mode toggle: Student / Admin */}
                            <div className="login-mode-tabs">
                                <button className={`login-mode-tab${mode === 'student' ? ' active' : ''}`} onClick={() => setMode('student')}>
                                    Student
                                </button>
                                <button className={`login-mode-tab${mode === 'admin' ? ' active' : ''}`} onClick={() => setMode('admin')}>
                                    Admin
                                </button>
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
