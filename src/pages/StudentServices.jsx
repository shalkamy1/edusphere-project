import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useLang } from '../App.jsx';

/* SVG icons matching the screenshot */
const SvgMedical = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
);
const SvgComplaints = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
const SvgWarning = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const SvgRequests = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const SS_SERVICES = [
    { Ic: SvgMedical, name: "medical", color: "#26c6da", page: "medical" },
    { Ic: SvgComplaints, name: "complaints", color: "#ff9100", page: "complaints" },
    { Ic: SvgWarning, name: "warning", color: "#ffd600", page: "warning" },
    { Ic: SvgRequests, name: "requests", color: "#aa00ff", page: "requests" },
];

export default function PageStudentServices() {
  const navigate = useNavigate();
    const { t } = useLang();
    const sv = t.services;
    const snames = { medical: sv.medical, complaints: sv.complaints, warning: sv.warning, requests: sv.requests };
    const sdescs = {
        medical: sv.medicalDesc,
        complaints: sv.complaintsDesc,
        warning: sv.warningDesc,
        requests: sv.requestsDesc,
    };

    return (
        <div className="page-enter">
            <div className="pheader">
                <h1>{t.students.title}</h1>
                <p style={{ maxWidth: 540 }}>
                    {t.students.sub1} <span style={{ color: 'var(--red)', fontWeight: 700 }}>{t.students.sub2}</span>
                </p>
            </div>
            <div className="ss-grid">
                {SS_SERVICES.map(s => {
                    const { Ic } = s;
                    return (
                        <div key={s.name} className="ss-card" onClick={() => navigate('/' + s.page)}>
                            <div className="ss-ic" style={{ color: s.color }}>
                                <Ic />
                            </div>
                            <div className="ss-name">{snames[s.name]}</div>
                            <div className="ss-desc">{sdescs[s.name]}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
