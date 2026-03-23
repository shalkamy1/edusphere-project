import React, { useState } from 'react';
import { TRANSLATIONS } from '../i18n.js';

export default function PageSettings({ theme, setTheme, lang, setLang, t, setPage, systemTheme, setSystemTheme }) {
    const g = t ? t.pages2 : {};
    const [sect, setSect] = useState("profile");
    const [tog, setTog] = useState({ email: true, push: true, grades: true, assign: false, attend: true });

    // Security state
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [conf, setConf] = useState('');
    const [saved, setSaved] = useState(false);
    const SESSIONS = [
        { device: 'Chrome on Windows', ip: '192.168.1.5', time: 'Now', current: true },
        { device: 'Mobile - Safari iOS', ip: '41.234.12.80', time: '2 hours ago', current: false },
    ];
    const handleSavePw = (e) => {
        e.preventDefault();
        if (newPw.length >= 4 && newPw === conf) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            setOldPw(''); setNewPw(''); setConf('');
        }
    };

    const Tog = ({ k }) => (
        <button className={`set-toggle ${tog[k] ? "on" : ""}`} onClick={() => setTog(p => ({ ...p, [k]: !p[k] }))}>
            <div className="set-toggle-knob" />
        </button>
    );

    const NAVS = [
        ["profile", "👤", "Profile"],
        ["security", "🔒", "Security"],
        ["notifications", "🔔", "Notifications"],
        ["appearance", "🎨", g.profAppearance || "Appearance"],
        ["language", "🌐", g.profLanguage || "Language"],
        ["academic", "📊", g.profAcademic || "Academic"],
    ];

    const LANGS = Object.entries(TRANSLATIONS).map(([k]) => ({ code: k, name: k.toUpperCase(), flag: k === 'en' ? '🇬🇧' : k === 'ar' ? '🇪🇬' : k === 'ru' ? '🇷🇺' : k === 'fr' ? '🇫🇷' : '🇩🇪' }));

    const [acadInfo] = useState({ gpa: "3.82", credits: "75", totalCredits: "120", standing: "Good Standing", advisor: "Dr. Ahmed Hassan", gradDate: "June 2026", major: "Computer Science", minor: "Mathematics" });

    return (
        <div className="page-enter">
            <div className="pheader" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <button onClick={() => setPage && setPage('dashboard')} className="back-btn" style={{ marginTop: 4 }}>←</button>
                <div><h1>{g.settingsTitle || "⚙️ Settings"}</h1><p>{g.settingsSub || "Manage your account and preferences"}</p></div>
            </div>
            <div className="settings-grid">
                <div className="set-nav">
                    {NAVS.map(([k, ic, lbl]) => (
                        <div key={k} className={`set-nav-item${sect === k ? " act" : ""}`} onClick={() => setSect(k)}>
                            <span className="set-nav-item-ic">{ic}</span>{lbl}
                        </div>
                    ))}
                </div>
                <div>
                    {sect === "profile" && (
                        <div className="set-section">
                            <div className="set-avatar-row">
                                <div className="set-avatar">RA</div>
                                <div className="set-avatar-info">
                                    <div style={{ fontSize: 17, fontWeight: 700, color: "var(--t1)" }}>Rawda Ayman</div>
                                    <div style={{ fontSize: 12, color: "var(--t3)" }}>rawda.ayman@edusphere.edu</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 14, padding: '10px 14px', background: 'rgba(41,121,255,0.07)', borderRadius: 10, border: '1px solid rgba(41,121,255,0.15)' }}>
                                🔒 Your profile information is managed by the university and cannot be edited.
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                                {[["Full Name", "Rawda Ayman"], ["Student ID", "21at41"], ["Email", "rawda@edusphere.edu"], ["Phone", "+20 100 000 0000"], ["Faculty", "Engineering & Technology"], ["Program", "B.Sc. Computer Science"]].map(([l, v]) => (
                                    <div key={l}><div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>{l}</div><input className="set-input" value={v} readOnly style={{ cursor: 'not-allowed', opacity: 0.75 }} /></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sect === "security" && (
                        <div>
                            {/* Change Password */}
                            <div className="set-section" style={{ marginBottom: 16 }}>
                                <div className="set-section-title">🔑 Change Password</div>
                                <div className="set-section-desc">Update your account password regularly to keep it secure.</div>
                                <form onSubmit={handleSavePw} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {[['Current Password', oldPw, setOldPw], ['New Password', newPw, setNewPw], ['Confirm Password', conf, setConf]].map(([lbl, val, set]) => (
                                        <div key={lbl}>
                                            <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600, marginBottom: 6 }}>{lbl}</div>
                                            <input type="password" className="set-input" value={val} onChange={e => set(e.target.value)} placeholder="••••••••" />
                                        </div>
                                    ))}
                                    {saved && <div style={{ color: '#00c853', fontSize: 13, fontWeight: 700 }}>✅ Password updated successfully!</div>}
                                    <button type="submit" className="set-save-btn" style={{ alignSelf: 'flex-start' }}>Save Password</button>
                                </form>
                            </div>

                            {/* Active Sessions */}
                            <div className="set-section" style={{ marginBottom: 16 }}>
                                <div className="set-section-title">💻 Active Sessions</div>
                                <div className="set-section-desc">Manage devices that are currently signed in to your account.</div>
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

                            {/* 2FA */}
                            <div className="set-section">
                                <div className="set-section-title">🛡️ Two-Factor Authentication</div>
                                <div className="set-section-desc">Add an extra layer of security to your account.</div>
                                <div className="set-row">
                                    <div>
                                        <div className="set-row-lbl">Authenticator App</div>
                                        <div className="set-row-sub">Use Google Authenticator or similar</div>
                                    </div>
                                    <Tog k="email" />
                                </div>
                                <div className="set-row">
                                    <div>
                                        <div className="set-row-lbl">SMS Verification</div>
                                        <div className="set-row-sub">Receive codes via text message</div>
                                    </div>
                                    <Tog k="push" />
                                </div>
                            </div>
                        </div>
                    )}

                    {sect === "notifications" && (
                        <div className="set-section">
                            <div className="set-section-title">🔔 Notification Preferences</div>
                            <div className="set-section-desc">Choose which notifications you want to receive.</div>
                            {[['email', 'Email Notifications', 'Receive updates via email'], ['push', 'Push Notifications', 'Browser alerts'], ['grades', 'Grade Updates', 'When new grades are posted'], ['assign', 'Assignment Reminders', 'Before due dates'], ['attend', 'Attendance Alerts', 'Absence warnings']].map(([k, lbl, sub]) => (
                                <div key={k} className="set-row">
                                    <div>
                                        <div className="set-row-lbl">{lbl}</div>
                                        <div className="set-row-sub">{sub}</div>
                                    </div>
                                    <Tog k={k} />
                                </div>
                            ))}
                        </div>
                    )}

                    {sect === "appearance" && (
                        <div className="set-section">
                            <div className="set-section-title">🎨 {g.profAppearance || "Appearance"}</div>
                            <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>THEME</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 24 }}>
                                {[["🌙", g.darkMode || "Dark Mode", "dark"], ["☀️", g.lightMode || "Light Mode", "light"]].map(([ic, lbl, k]) => (
                                    <div key={k} className="card" onClick={() => setTheme(k)} style={{ padding: "20px 12px", cursor: "pointer", textAlign: "center", border: theme === k ? "2px solid var(--red)" : "1px solid var(--border)", transition: 'all .2s' }}>
                                        <div style={{ fontSize: 28, marginBottom: 8 }}>{ic}</div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)" }}>{lbl}</div>
                                        {theme === k && <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700, marginTop: 6 }}>✓ Active</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sect === "language" && (
                        <div className="set-section">
                            <div className="set-section-title">🌐 {g.profLanguage || "Language"}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {LANGS.map(({ code, name, flag }) => (
                                    <div key={code} onClick={() => setLang(code)} className="card" style={{ padding: "16px 18px", border: lang === code ? "2px solid var(--red)" : "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .2s" }}>
                                        <span style={{ fontSize: 24 }}>{flag}</span>
                                        <div style={{ fontWeight: 700, color: "var(--t1)", fontSize: 14 }}>{name}</div>
                                        {lang === code && <span style={{ marginLeft: "auto", color: "var(--red)", fontSize: 18 }}>✓</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sect === "academic" && (
                        <div className="set-section">
                            <div className="set-section-title">📊 {g.profAcademic || "Academic Information"}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                                {[["🎓 Current GPA", acadInfo.gpa + " / 4.0", "#00c853"], ["📚 Credits Earned", acadInfo.credits + " / " + acadInfo.totalCredits, "#2979ff"], ["🏅 Academic Standing", acadInfo.standing, "#ff6d00"], ["📅 Expected Graduation", acadInfo.gradDate, "var(--t1)"], ["📖 Major", acadInfo.major, "var(--t1)"], ["📌 Minor", acadInfo.minor, "var(--t1)"]].map(([lbl, val, clr]) => (
                                    <div key={lbl} className="card" style={{ padding: "16px 18px" }}>
                                        <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>{lbl}</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: clr }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
