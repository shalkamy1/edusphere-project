import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../i18n.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  getStudentCGPA,
  saveAuth,
  getToken,
} from '../api.js';

/* ── small icon helpers ─────────────────────────────────── */
const Ic = {
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  eye:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  edit:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  save:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  spin:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" style={{transformOrigin:'center',animation:'spin .8s linear infinite'}}/></svg>,
};

/* ── toggle component ───────────────────────────────────── */
function Toggle({ value, onChange }) {
  return (
    <button
      className={`set-toggle ${value ? 'on' : ''}`}
      onClick={() => onChange(!value)}
      type="button"
    >
      <div className="set-toggle-knob" />
    </button>
  );
}

/* ── password field ─────────────────────────────────────── */
function PwField({ label, value, onChange, placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          className="set-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex' }}
        >
          {show ? Ic.eyeOff : Ic.eye}
        </button>
      </div>
    </div>
  );
}

/* ── alert banner ───────────────────────────────────────── */
function Alert({ type, msg }) {
  if (!msg) return null;
  const colors = {
    success: { bg: 'rgba(0,200,83,.1)', border: 'rgba(0,200,83,.25)', text: '#00c853' },
    error:   { bg: 'rgba(229,57,53,.1)',  border: 'rgba(229,57,53,.25)',  text: '#e53935' },
    info:    { bg: 'rgba(41,121,255,.08)', border: 'rgba(41,121,255,.2)', text: '#2979ff' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
      {type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : 'ℹ️ '}{msg}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function PageSettings({ theme, setTheme, lang, setLang, t }) {
  const navigate = useNavigate();
  const g = t?.pages2 || {};
  const [sect, setSect] = useState('profile');

  /* ── profile state ── */
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameAlert, setNameAlert] = useState(null); // { type, msg }
  const [localPicUrl, setLocalPicUrl] = useState(null);

  /* ── password state ── */
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwAlert, setPwAlert] = useState(null);

  /* ── notifications (local prefs, stored in localStorage) ── */
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edusphere_notif_prefs')) || { email: true, push: true, grades: true, assign: false, attend: true }; }
    catch { return { email: true, push: true, grades: true, assign: false, attend: true }; }
  });
  const saveNotifPrefs = (prefs) => {
    setNotifPrefs(prefs);
    localStorage.setItem('edusphere_notif_prefs', JSON.stringify(prefs));
  };

  /* ── academic state ── */
  const [acadInfo, setAcadInfo] = useState({ gpa: '0.00', credits: 0, totalCredits: 120, standing: 'Good Standing', major: '—', level: '—' });

  /* ── load profile ── */
  useEffect(() => {
    setProfileLoading(true);
    getProfile()
      .then(res => {
        if (res.success) {
          setProfile(res.data);
          setEditName(res.data.name);
          setLocalPicUrl(res.data.profile_picture_url);
          // load academic info if student
          if (res.data.student) {
            setAcadInfo(prev => ({
              ...prev,
              credits: res.data.student.credit_hours || 0,
              major: res.data.student.program || '—',
              level: res.data.student.level ? `Level ${res.data.student.level}` : '—',
            }));
            // fetch CGPA too
            const sid = res.data.student.id;
            if (sid) {
              getStudentCGPA(sid).then(r => {
                if (r?.data) setAcadInfo(prev => ({
                  ...prev,
                  gpa: parseFloat(r.data.cgpa || 0).toFixed(2),
                  totalCredits: r.data.total_required_credits || 120,
                }));
              }).catch(() => {});
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  /* ── save name ── */
  const handleSaveName = async () => {
    if (!editName.trim() || editName.trim() === profile?.name) { setEditingName(false); return; }
    setNameSaving(true);
    setNameAlert(null);
    try {
      const res = await updateProfile(editName.trim());
      if (res.success) {
        setProfile(p => ({ ...p, name: res.data.name }));
        const token = getToken();
        saveAuth(token, { ...res.data });
        setNameAlert({ type: 'success', msg: 'Name updated successfully!' });
        setEditingName(false);
        setTimeout(() => setNameAlert(null), 3500);
      }
    } catch (err) {
      setNameAlert({ type: 'error', msg: err.message || 'Failed to update name.' });
    } finally {
      setNameSaving(false);
    }
  };

  /* ── change password ── */
  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwAlert(null);
    if (newPw.length < 8) { setPwAlert({ type: 'error', msg: 'New password must be at least 8 characters.' }); return; }
    if (newPw !== confPw) { setPwAlert({ type: 'error', msg: 'Passwords do not match.' }); return; }
    setPwSaving(true);
    try {
      const res = await changePassword(oldPw, newPw, confPw);
      if (res.success) {
        setPwAlert({ type: 'success', msg: 'Password changed successfully!' });
        setOldPw(''); setNewPw(''); setConfPw('');
        setTimeout(() => setPwAlert(null), 4000);
      }
    } catch (err) {
      setPwAlert({ type: 'error', msg: err.message || 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  };

  /* ── sidebar navs ── */
  const NAVS = [
    ['profile',       '👤', g.profProfile     || 'Profile'],
    ['security',      '🔒', g.profSecurity     || 'Security'],
    ['notifications', '🔔', t.ui?.notifications || 'Notifications'],
    ['appearance',    '🎨', g.profAppearance   || 'Appearance'],
    ['language',      '🌐', g.profLanguage     || 'Language'],
    ['academic',      '📊', g.profAcademic     || 'Academic'],
  ];

  const LANGS = Object.entries(TRANSLATIONS).map(([k]) => ({
    code: k,
    name: { en: 'English', ar: 'العربية', ru: 'Русский', fr: 'Français', de: 'Deutsch' }[k] || k.toUpperCase(),
    flag: { en: '🇬🇧', ar: '🇪🇬', ru: '🇷🇺', fr: '🇫🇷', de: '🇩🇪' }[k] || '🏳️',
  }));

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  /* ── strength indicator ── */
  const pwStrength = newPw.length === 0 ? 0 : newPw.length < 6 ? 1 : newPw.length < 10 ? 2 : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) ? 4 : 3;
  const pwStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const pwStrengthColor = ['', '#e53935', '#ff9800', '#2979ff', '#00c853'];

  return (
    <div className="page-enter">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .set-pic-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
        .set-pic-wrap img, .set-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: #fff; background: linear-gradient(135deg,#e53935,#c62828); }
        .pw-strength-bar { height: 4px; border-radius: 4px; background: var(--border); overflow: hidden; margin-top: 6px; }
        .pw-strength-fill { height: 100%; border-radius: 4px; transition: width .3s, background .3s; }
        .profile-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 600px) { .profile-info-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div className="pheader" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ marginTop: 4 }}>←</button>
        <div>
          <h1>{g.settingsTitle || '⚙️ Settings'}</h1>
          <p>{g.settingsSub || 'Manage your account and preferences'}</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Sidebar Nav */}
        <div className="set-nav">
          {NAVS.map(([k, ic, lbl]) => (
            <div key={k} className={`set-nav-item${sect === k ? ' act' : ''}`} onClick={() => setSect(k)}>
              <span className="set-nav-item-ic">{ic}</span>{lbl}
            </div>
          ))}
        </div>

        {/* Content */}
        <div>

          {/* ── PROFILE ── */}
          {sect === 'profile' && (
            <div className="set-section">
              {profileLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>Loading profile…</div>
              ) : (
                <>
                  {/* Avatar + name row */}
                  <div className="set-avatar-row" style={{ marginBottom: 20 }}>
                    <div className="set-pic-wrap">
                      {localPicUrl
                        ? <img src={localPicUrl} alt="Avatar" />
                        : <div className="set-avatar">{initials}</div>
                      }
                    </div>
                    <div className="set-avatar-info" style={{ flex: 1 }}>
                      {editingName ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            className="set-input"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{ flex: 1, fontSize: 15, fontWeight: 700 }}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setEditName(profile?.name || ''); } }}
                          />
                          <button className="set-save-btn" style={{ padding: '6px 14px', display: 'flex', gap: 6, alignItems: 'center' }} onClick={handleSaveName} disabled={nameSaving}>
                            {nameSaving ? Ic.spin : Ic.save} Save
                          </button>
                          <button onClick={() => { setEditingName(false); setEditName(profile?.name || ''); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--t3)', fontSize: 12 }}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--t1)' }}>{profile?.name}</div>
                          <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', padding: 2 }} title="Edit name">{Ic.edit}</button>
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{profile?.email}</div>
                      <div style={{ fontSize: 11, marginTop: 4, background: 'rgba(41,121,255,.1)', color: '#2979ff', display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'capitalize' }}>{profile?.role?.replace('_', ' ')}</div>
                    </div>
                  </div>

                  <Alert type={nameAlert?.type} msg={nameAlert?.msg} />

                  {/* Profile fields */}
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12, padding: '10px 14px', background: 'rgba(41,121,255,.07)', borderRadius: 10, border: '1px solid rgba(41,121,255,.15)' }}>
                    🔒 Profile information is managed by the university. Contact admin to update your photo.
                  </div>

                  <div className="profile-info-grid">
                    {[
                      ['Full Name',   profile?.name || '—'],
                      ['Email',       profile?.email || '—'],
                      ['Student ID',  profile?.student?.id ? String(profile.student.id) : 'N/A'],
                      ['Phone',       profile?.student?.phones?.[0] || '—'],
                      ['Program',     profile?.student?.program || '—'],
                      ['Level',       profile?.student?.level ? `Level ${profile.student.level}` : '—'],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                        <input className="set-input" value={v} readOnly style={{ cursor: 'not-allowed', opacity: 0.75 }} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── SECURITY ── */}
          {sect === 'security' && (
            <div>
              <div className="set-section" style={{ marginBottom: 16 }}>
                <div className="set-section-title">🔑 {g.profSecurity || 'Change Password'}</div>
                <div className="set-section-desc">{g.keepSecure || 'Keep your account secure by using a strong, unique password.'}</div>
                <Alert type={pwAlert?.type} msg={pwAlert?.msg} />
                <form onSubmit={handleChangePw} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <PwField label={g.currentPw || 'Current Password'} value={oldPw} onChange={setOldPw} />
                  <div>
                    <PwField label={g.newPw || 'New Password'} value={newPw} onChange={setNewPw} />
                    {newPw.length > 0 && (
                      <div>
                        <div className="pw-strength-bar">
                          <div className="pw-strength-fill" style={{ width: `${pwStrength * 25}%`, background: pwStrengthColor[pwStrength] }} />
                        </div>
                        <div style={{ fontSize: 11, color: pwStrengthColor[pwStrength], marginTop: 4, fontWeight: 700 }}>{pwStrengthLabel[pwStrength]}</div>
                      </div>
                    )}
                  </div>
                  <PwField label={g.confirmPw || 'Confirm New Password'} value={confPw} onChange={setConfPw} />
                  <button type="submit" className="set-save-btn" style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, alignItems: 'center' }} disabled={pwSaving}>
                    {pwSaving ? <>{Ic.spin} {g.saving || 'Saving…'}</> : <>{Ic.save} {g.changePw || 'Change Password'}</>}
                  </button>
                </form>
              </div>

              <div className="set-section">
                <div className="set-section-title">🛡️ {g.pwTips || 'Password Tips'}</div>
                <div className="set-section-desc">{g.pwTipsDesc || 'Follow these guidelines for a strong password.'}</div>
                {[
                  [g.pwTip1 || 'At least 8 characters',        newPw.length >= 8],
                  [g.pwTip2 || 'Contains uppercase letter',     /[A-Z]/.test(newPw)],
                  [g.pwTip3 || 'Contains a number',             /[0-9]/.test(newPw)],
                  [g.pwTip4 || 'New and confirm match',         newPw.length > 0 && newPw === confPw],
                ].map(([tip, ok]) => (
                  <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: ok ? '#00c853' : 'var(--t3)', flexShrink: 0 }}>{ok ? '✅' : '○'}</span>
                    <span style={{ color: ok ? 'var(--t1)' : 'var(--t3)' }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {sect === 'notifications' && (
            <div className="set-section">
              <div className="set-section-title">🔔 {t.ui?.notifications || 'Notification Preferences'}</div>
              <div className="set-section-desc">{g.notifDesc || "Choose which notifications you'd like to receive. Saved locally on this device."}</div>
              {[
                ['email',  g.notifEmail  || 'Email Notifications',   g.notifEmailSub  || 'Receive important updates via email'],
                ['push',   g.notifPush   || 'Push Notifications',    g.notifPushSub   || 'Browser alerts for urgent items'],
                ['grades', g.notifGrades || 'Grade Updates',          g.notifGradesSub || 'When new grades are posted'],
                ['assign', g.notifAssign || 'Assignment Reminders',   g.notifAssignSub || 'Reminders before due dates'],
                ['attend', g.notifAttend || 'Attendance Alerts',      g.notifAttendSub || 'Absence and late warnings'],
              ].map(([k, lbl, sub]) => (
                <div key={k} className="set-row">
                  <div>
                    <div className="set-row-lbl">{lbl}</div>
                    <div className="set-row-sub">{sub}</div>
                  </div>
                  <Toggle value={notifPrefs[k]} onChange={v => saveNotifPrefs({ ...notifPrefs, [k]: v })} />
                </div>
              ))}
              <div style={{ marginTop: 14, fontSize: 12, color: 'var(--t3)', background: 'rgba(0,0,0,.04)', borderRadius: 8, padding: '8px 12px' }}>
                💾 {g.notifSaved || 'Preferences are saved automatically to this browser.'}
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {sect === 'appearance' && (
            <div className="set-section">
              <div className="set-section-title">🎨 {g.profAppearance || 'Appearance'}</div>
              <div className="set-section-desc" style={{ marginBottom: 20 }}>{g.themeDesc || 'Choose a theme that suits your environment.'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                {[
                  ['light', '☀️', g.lightMode || 'Light Mode',  '#f8f9fa', '#1a1a2e'],
                  ['dark',  '🌙', g.darkMode  || 'Dark Mode',   '#0f172a', '#e2e8f0'],
                ].map(([k, ic, lbl, bg, fg]) => (
                  <div
                    key={k}
                    onClick={() => setTheme(k)}
                    style={{
                      padding: '20px 16px',
                      borderRadius: 14,
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: theme === k ? '2px solid var(--red)' : '1px solid var(--border)',
                      background: bg,
                      transition: 'all .2s',
                      position: 'relative',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{ic}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: fg }}>{lbl}</div>
                    {theme === k && (
                      <div style={{ position: 'absolute', top: 10, right: 12, color: 'var(--red)', fontSize: 11, fontWeight: 800 }}>✓ ACTIVE</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LANGUAGE ── */}
          {sect === 'language' && (
            <div className="set-section">
              <div className="set-section-title">🌐 {g.profLanguage || 'Language'}</div>
              <div className="set-section-desc" style={{ marginBottom: 20 }}>Select your preferred display language.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {LANGS.map(({ code, name, flag }) => (
                  <div
                    key={code}
                    onClick={() => setLang(code)}
                    className="card"
                    style={{ padding: '16px 18px', border: lang === code ? '2px solid var(--red)' : '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s' }}
                  >
                    <span style={{ fontSize: 24 }}>{flag}</span>
                    <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 14 }}>{name}</div>
                    {lang === code && <span style={{ marginLeft: 'auto', color: 'var(--red)', fontSize: 18 }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ACADEMIC ── */}
          {sect === 'academic' && (
            <div className="set-section">
              <div className="set-section-title">📊 {g.profAcademic || 'Academic Information'}</div>
              <div className="set-section-desc" style={{ marginBottom: 20 }}>Your current academic summary from the university system.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['🎓 Current GPA',        `${acadInfo.gpa} / 4.0`,                   '#00c853'],
                  ['📚 Credits Earned',      `${acadInfo.credits} / ${acadInfo.totalCredits}`, '#2979ff'],
                  ['🏅 Academic Standing',   acadInfo.standing,                          '#ff6d00'],
                  ['📖 Program',             profile?.student?.program || '—',           'var(--t1)'],
                  ['🎚 Level',               profile?.student?.level ? `Level ${profile.student.level}` : '—', 'var(--t1)'],
                  ['🏆 Honor Eligible',      profile?.student?.is_honor ? 'Yes' : 'No', profile?.student?.is_honor ? '#00c853' : 'var(--t3)'],
                ].map(([lbl, val, clr]) => (
                  <div key={lbl} className="card" style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6, fontWeight: 600 }}>{lbl}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: clr }}>{val}</div>
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
