import React, { useState, useEffect } from 'react';
import { useLang } from '../App.jsx';

export default function PageAttendance() {
    const { t } = useLang();
    const a = t.attendance;
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const tm = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(tm);
    }, []);

    const fmt = d => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => { }} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', margin: 0, letterSpacing: -0.5 }}>{a.title}</h1>
                        <p style={{ color: 'var(--t3)', fontSize: 13, margin: '2px 0 0 0' }}>{a.sub}</p>
                    </div>
                </div>
                <div className="clock-badge">
                    <span style={{ color: 'var(--red)', marginRight: 6, fontSize: 14 }}>🕐</span>
                    {fmt(clock)}
                </div>
            </div>

            {/* Camera + Scan - full width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="aqr-cam" style={{ width: '100%' }}>
                    <div className="aqr-cam-ic">📷</div>
                    <div className="aqr-cam-txt">{a.cameraReady}</div>
                    <div className="aqr-cam-sub">{a.cameraSub}</div>
                    <div className="scan-line" />
                </div>
                <button className="aqr-scan-btn">
                    <span>⬛</span> {a.scanBtn}
                </button>
            </div>
        </div>
    );
}
