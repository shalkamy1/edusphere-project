import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { TRANSLATIONS } from './i18n.js';
import PageDashboard from './pages/Dashboard.jsx';
import PageAttendance from './pages/Attendance.jsx';
import PageStudentServices from './pages/StudentServices.jsx';
import PageMedical from './pages/Medical.jsx';
import PageComplaints from './pages/Complaints.jsx';
import PageWarning from './pages/Warning.jsx';
import PageRequests from './pages/Requests.jsx';
import PageCurriculum from './pages/Curriculum.jsx';
import PageRecords from './pages/Records.jsx';
import PageLogin from './pages/Login.jsx';
import PageSecurity from './pages/Security.jsx';
import PageChatbot from './pages/Chatbot.jsx';
import { PageGrades, PageTimetable, PageAddDrop, PageSettings } from './pages.jsx';

export const LangCtx = createContext({ t: TRANSLATIONS.en, lang: 'en', setLang: () => { } });
export const useLang = () => useContext(LangCtx);

/* ── SVG ICONS (MODERN PREMIUM) ─────────────────────────────── */
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  attendance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>,
  students: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
  curriculum: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="12" y1="7" x2="16" y2="7" /><line x1="12" y1="11" x2="16" y2="11" /><line x1="9" y1="7" x2="9.01" y2="7" /><line x1="9" y1="11" x2="9.01" y2="11" /></svg>,
  records: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  admin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  gear: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  chatbot: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10-1.74 0-3.37-.45-4.79-1.23L2 22l1.23-5.21A9.97 9.97 0 0 1 2 12 10 10 0 0 1 12 2z" /><circle cx="8.5" cy="12" r="1.25" fill="currentColor" /><circle cx="12" cy="12" r="1.25" fill="currentColor" /><circle cx="15.5" cy="12" r="1.25" fill="currentColor" /></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
};


const NAV = [
  { key: 'dashboard', icon: 'dashboard' },
  { key: 'attendance', icon: 'attendance', badge: '3' },
  { key: 'students', icon: 'students' },
  { key: 'curriculum', icon: 'curriculum' },
  { key: 'records', icon: 'records' },
  { key: 'chatbot', icon: 'chatbot' },
  { key: 'settings', icon: 'settings', hasChevron: true },
];

const NAV_LABELS = {
  dashboard: ['Dashboard', 'لوحة القيادة', 'Главная', 'Tableau de bord', 'Dashboard'],
  attendance: ['Attendance QR', 'الحضور QR', 'Посещаемость QR', 'Présence QR', 'Anwesenheit QR'],
  students: ['Student Services', 'خدمات الطلاب', 'Службы студентов', 'Services Étudiants', 'Studentendienste'],
  curriculum: ['Curriculum Management', 'إدارة المناهج', 'Программа', 'Gestion du Programme', 'Lehrplanverwaltung'],
  records: ['Records', 'السجلات', 'Записи', 'Dossiers', 'Akten'],
  chatbot: ['AI Assistant', 'المساعد الذكي', 'ИИ Ассистент', 'Assistant IA', 'KI Assistent'],
  settings: ['Settings', 'الإعدادات', 'Настройки', 'Paramètres', 'Einstellungen'],
};

const LANG_IDX = { en: 0, ar: 1, ru: 2, fr: 3, de: 4 };

const NOTIFS = [
  { ic: "📅", title: "Class Starting Soon", desc: "Advanced Web Development starts in 15 min", time: "10 min ago", page: 'attendance' },

  { ic: "📊", title: "Grade Posted", desc: "MATH301 Midterm Exam: 38%", time: "3 hours ago", page: 'grades' },
  { ic: "⚠️", title: "Attendance Warning", desc: "You missed 2 sessions in ENG101", time: "Yesterday", page: 'warning' },
];

/* ── ADD/DROP GOAL SELECTION MODAL ─────────────────────────── */
function GoalModal({ onSelect, onClose }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="goal-modal" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="goal-modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="goal-modal-header">
          <div className="goal-modal-icon">🎓</div>
          <h2 className="goal-modal-title">What's your goal?</h2>
          <p className="goal-modal-sub">Choose a scenario and we'll recommend the best courses for you</p>
        </div>

        {/* Options */}
        <div className="goal-modal-options">
          {/* Option 1: Improve GPA */}
          <div
            className={`goal-option${hovered === 'gpa' ? ' goal-option-hovered' : ''}`}
            onMouseEnter={() => setHovered('gpa')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('gpa')}
          >
            <div className="goal-option-icon goal-icon-gpa">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="goal-option-body">
              <div className="goal-option-title">Improve My GPA</div>
              <div className="goal-option-desc">We'll suggest easier, high-impact courses that can boost your GPA this semester</div>
              <div className="goal-option-tags">
                <span className="goal-tag goal-tag-blue">High GPA Impact</span>
                <span className="goal-tag goal-tag-green">Easier Workload</span>
              </div>
            </div>
            <div className="goal-option-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          {/* Divider */}
          <div className="goal-modal-divider"><span>or</span></div>

          {/* Option 2: Complete Requirements */}
          <div
            className={`goal-option${hovered === 'req' ? ' goal-option-hovered' : ''}`}
            onMouseEnter={() => setHovered('req')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('req')}
          >
            <div className="goal-option-icon goal-icon-req">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="goal-option-body">
              <div className="goal-option-title">Complete My Requirements</div>
              <div className="goal-option-desc">We'll recommend courses with the most credit hours to help you graduate faster</div>
              <div className="goal-option-tags">
                <span className="goal-tag goal-tag-orange">More Credits</span>
                <span className="goal-tag goal-tag-purple">Faster Graduation</span>
              </div>
            </div>
            <div className="goal-option-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>

        <p className="goal-modal-note">💡 You can always browse all courses after selecting a goal</p>
      </div>
    </div>
  );
}

/* ── GET SUPPORT MODAL ──────────────────────────────────────── */
function GetSupportModal({ onClose }) {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const send = (e) => { e.preventDefault(); setSent(true); setTimeout(onClose, 2000); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>🎓 Get Support</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>EduSphere IT & Academic Support</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>Ticket Submitted!</div>
            <div style={{ fontSize: 13, color: 'var(--t3)' }}>Our team will respond within 24 hours.</div>
          </div>
        ) : (
          <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 700, marginBottom: 8 }}>ISSUE TYPE</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Technical', 'Academic', 'Other'].map(t => (
                  <button key={t} type="button" className="cmp-cat" style={{ padding: '6px 14px', fontSize: 12 }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 700, marginBottom: 8 }}>DESCRIBE YOUR ISSUE</div>
              <textarea className="cmp-textarea" rows={4} placeholder="Describe your problem..."
                value={msg} onChange={e => setMsg(e.target.value)} />
            </div>
            <button type="submit" className="submit-btn-red">📤 Submit Ticket</button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── LOGOUT CONFIRM MODAL ────────────────────────────────────── */
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚪</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Sign Out?</div>
          <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 24 }}>
            You'll be signed out of EduSphere. Make sure you've saved your work.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onCancel} style={{ padding: '10px 28px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--t1)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button onClick={onConfirm} className="submit-btn-red" style={{ padding: '10px 28px' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SIDEBAR ─────────────────────────────────────────────────── */
function Sidebar({ page, setPage, lang, onSupport, onLogout, isOpen, onClose }) {
  const { t } = useLang();
  const idx = LANG_IDX[lang] || 0;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNav = (key) => { setPage(key); onClose && onClose(); };

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="slogo" onClick={() => setPage('dashboard')}>
        <div className="slogo-av" style={{ background: 'transparent', padding: 0, overflow: 'hidden' }}>
          <img src="/logo.png" alt="EduSphere Logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 10 }} />
        </div>
        <div>
          <div className="logo-txt">EduSphere</div>
          <span className="logo-sub">Student Portal</span>
        </div>
      </div>

      <nav className="snav">
        {NAV.map(n => {
          const label = NAV_LABELS[n.key][idx];
          const active = page === n.key || (n.key === 'students' && ['medical', 'complaints', 'warning', 'requests'].includes(page));
          return (
            <div key={n.key} className={`nitem${active ? ' active' : ''}`} onClick={() => handleNav(n.key)}>
              <span className="nic">{Icons[n.icon]}</span>
              <span className="nlabel">{label}</span>
              {n.badge && <span className="nbadge">{n.badge}</span>}
            </div>
          );
        })}
      </nav>

      {/* Logout button - standalone at bottom of nav */}
      <div className="sidebar-logout-wrap">
        <div className="sidebar-divider" />
        <div className="nitem nitem-logout" onClick={() => setShowLogoutModal(true)}>
          <span className="nic">{Icons.logout}</span>
          <span className="nlabel">Sign Out</span>
        </div>
      </div>

      <div className="sfooter">
        <div className="sup-card">
          <p>{t.support.needHelp}</p>
          <small>{t.support.contactSupport}</small>
          <button className="sbtn" onClick={onSupport}>{t.support.getSupport}</button>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={() => { setShowLogoutModal(false); onLogout(); }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </aside>
  );
}

/* ── NOTIFICATION PANEL ─────────────────────────────────────── */
function NotifPanel({ onClose, setPage }) {
  return (
    <div className="notif-panel">
      <div className="notif-hd">
        <span style={{ fontWeight: 800, color: 'var(--t1)' }}>Notifications</span>
        <button className="notif-close" onClick={onClose}>✕</button>
      </div>
      {NOTIFS.map((n, i) => (
        <div key={i} className="notif-item" onClick={() => { setPage(n.page); onClose(); }}>
          <div className="notif-ic">{n.ic}</div>
          <div>
            <div className="notif-title">{n.title}</div>
            <div className="notif-desc">{n.desc}</div>
            <div className="notif-time">{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── SEARCH BAR with functional results ─────────────────────── */
const SEARCH_INDEX = [
  { label: 'Dashboard', page: 'dashboard', icon: '📊', desc: 'Main overview' },
  { label: 'Attendance QR', page: 'attendance', icon: '📷', desc: 'QR code attendance' },
  { label: 'Student Services', page: 'students', icon: '👥', desc: 'Medical, complaints, requests' },
  { label: 'Medical Request', page: 'medical', icon: '🏥', desc: 'Submit medical excuse' },
  { label: 'Complaints', page: 'complaints', icon: '📢', desc: 'File a complaint' },
  { label: 'Warning Letters', page: 'warning', icon: '⚠️', desc: 'Academic warnings' },
  { label: 'Requests', page: 'requests', icon: '📋', desc: 'Official requests' },
  { label: 'Curriculum Management', page: 'curriculum', icon: '📚', desc: 'Course plan' },
  { label: 'Records & Documents', page: 'records', icon: '📄', desc: 'Academic records' },
  { label: 'Admin Panel', page: 'admin', icon: '🛡️', desc: 'Administration' },
  { label: 'AI Assistant / Chatbot', page: 'chatbot', icon: '🤖', desc: 'AI help' },
  { label: 'Settings', page: 'settings', icon: '⚙️', desc: 'Account preferences' },
  { label: 'Grades', page: 'grades', icon: '📊', desc: 'View your grades' },

  { label: 'Timetable', page: 'timetable', icon: '📅', desc: 'Weekly schedule' },
  { label: 'Add / Drop Courses', page: 'adddrop', icon: '➕', desc: 'Manage enrollment' },
  { label: 'Advanced Web Development', page: 'timetable', icon: '💻', desc: 'CS431 • MWF 9:00' },
  { label: 'Database Systems', page: 'timetable', icon: '💾', desc: 'CS412 • MWF 11:00' },
  { label: 'Machine Learning', page: 'timetable', icon: '🤖', desc: 'CS302 • TTH 10:00' },
  { label: 'Linear Algebra', page: 'timetable', icon: '📐', desc: 'MATH301 • TTH 8:00' },
  { label: 'Technical Writing', page: 'timetable', icon: '✍️', desc: 'ARBLEET • MWF 1:00' },
  { label: 'Security', page: 'security', icon: '🔒', desc: 'Password & sessions' },
];

function Topbar({ theme, setTheme, showNotif, setShowNotif, setPage, lang, userInfo, hasUnread, onBellClick, onHamburger }) {
  const { t } = useLang();
  const initials = userInfo?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'RA';
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const searchResults = searchVal.trim().length > 0
    ? SEARCH_INDEX.filter(item =>
      item.label.toLowerCase().includes(searchVal.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchVal.toLowerCase())
    ).slice(0, 7)
    : [];

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="topbar">
      <button className="hamburger-btn" onClick={onHamburger} title="Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="srchwrap" ref={searchRef}>
        <span className="srchic">{Icons.search}</span>
        <input
          className="srch"
          placeholder={t.topbar.search}
          value={searchVal}
          onChange={e => { setSearchVal(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
        />
        {searchOpen && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((item, i) => (
              <div key={i} className="search-result-item" onClick={() => { setPage(item.page); setSearchVal(''); setSearchOpen(false); }}>
                <span className="search-result-icon">{item.icon}</span>
                <div>
                  <div className="search-result-label">{item.label}</div>
                  <div className="search-result-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="tbactions">
        <button className="tb-icon-btn" onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')} title="Toggle Theme">
          {theme === 'dark' ? Icons.sun : Icons.moon}
        </button>
        <button className="tb-icon-btn" onClick={() => setPage('settings')} title="Settings">
          {Icons.gear}
        </button>
        <button className="tb-icon-btn tb-bell" onClick={onBellClick} title="Notifications">
          {Icons.bell}
          {hasUnread && <span className="tb-badge">2</span>}
        </button>
        <div className="tb-user">
          <div className="uavt">{initials}</div>
          <div className="uinfo">
            <div className="uname">{userInfo?.name || t.topbar.name}</div>
            <div className="urole">{userInfo?.role || t.topbar.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── APP ROOT ───────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [showNotif, setShowNotif] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [lang, setLang] = useState('en');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [hasUnread, setHasUnread] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [addDropGoal, setAddDropGoal] = useState(null);
  const [droppedCourses, setDroppedCourses] = useState([]);
  const [failedCourses] = useState(['MATH102']); // demo: Calculus II failed

  // navigateTo handles all page navigation
  const navigateTo = (p) => { setPage(p); };

  // System theme detection
  useEffect(() => {
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
      const handler = (e) => document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  useEffect(() => {
    const tr = TRANSLATIONS[lang];
    document.documentElement.setAttribute('dir', tr.dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const playNotifSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; o.type = 'sine';
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start(); o.stop(ctx.currentTime + 0.4);
    } catch (_) { }
  };

  const handleLogout = () => { setLoggedIn(false); setUserInfo(null); setPage('dashboard'); };
  const handleLogin = (info) => { setUserInfo(info); setLoggedIn(true); };

  if (!loggedIn) {
    return (
      <LangCtx.Provider value={{ t, lang, setLang }}>
        <PageLogin onLogin={handleLogin} />
      </LangCtx.Provider>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <PageDashboard setPage={navigateTo} />;
      case 'attendance': return <PageAttendance setPage={setPage} />;
      case 'students': return <PageStudentServices setPage={setPage} />;
      case 'curriculum': return <PageCurriculum setPage={setPage} droppedCourses={droppedCourses} failedCourses={failedCourses} />;
      case 'records': return <PageRecords setPage={setPage} />;
      case 'medical': return <PageMedical setPage={setPage} />;
      case 'complaints': return <PageComplaints setPage={setPage} />;
      case 'warning': return <PageWarning setPage={setPage} />;
      case 'requests': return <PageRequests setPage={setPage} />;
      case 'grades': return <PageGrades t={t} setPage={setPage} />;

      case 'timetable': return <PageTimetable t={t} setPage={setPage} />;
      case 'adddrop': return <PageAddDrop setPage={navigateTo} t={t} goal={addDropGoal} onGoalSelect={(g) => setAddDropGoal(g)} onRequestGoal={() => setShowGoalModal(true)} onCourseDrop={(code) => setDroppedCourses(prev => prev.includes(code) ? prev : [...prev, code])} />;
      case 'settings': return <PageSettings theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} t={t} setPage={setPage} />;
      case 'chatbot': return <PageChatbot />;
      case 'security': return <PageSecurity onLogout={handleLogout} setPage={setPage} />;
      default: return <PageDashboard setPage={setPage} />;
    }
  };

  return (
    <LangCtx.Provider value={{ t, lang, setLang }}>
      <div className="app">
        {sidebarOpen && <div className="sidebar-overlay visible" onClick={() => setSidebarOpen(false)} />}
        {showGoalModal && (
          <GoalModal
            onClose={() => setShowGoalModal(false)}
            onSelect={(gl) => { setAddDropGoal(gl); setShowGoalModal(false); }}
          />
        )}
        <Sidebar page={page} setPage={navigateTo} lang={lang}
          onSupport={() => setShowSupport(true)} onLogout={handleLogout}
          isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main">
          <Topbar theme={theme} setTheme={setTheme} showNotif={showNotif}
            setShowNotif={setShowNotif} setPage={navigateTo} lang={lang} userInfo={userInfo}
            hasUnread={hasUnread}
            onBellClick={() => { const opening = !showNotif; if (opening) { playNotifSound(); setHasUnread(false); } setShowNotif(opening); }}
            onHamburger={() => setSidebarOpen(v => !v)} />
          {showNotif && (
            <>
              <div className="notif-overlay" onClick={() => setShowNotif(false)} />
              <NotifPanel onClose={() => setShowNotif(false)} setPage={setPage} />
            </>
          )}
          {showSupport && <GetSupportModal onClose={() => setShowSupport(false)} />}
          <div className="pbody" key={page}>
            {renderPage()}
          </div>
        </div>
      </div>
    </LangCtx.Provider>
  );
}
