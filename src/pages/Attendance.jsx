import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../App.jsx';
import { Html5Qrcode } from 'html5-qrcode';
import { scanAttendanceQR } from '../api.js';

export default function PageAttendance() {
    const { t } = useLang();
    const a = t.attendance;
    const [clock, setClock] = useState(new Date());
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        const tm = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(tm);
    }, []);

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const fmt = d => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const handleStartScan = async () => {
        setError('');
        setScanResult(null);
        setIsScanning(true);

        try {
            // First get all available cameras (this also asks for permission)
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) {
                throw new Error("No cameras found on this device.");
            }

            // Default to first camera (usually front/user camera on laptops)
            let selectedCameraId = cameras[0].id;
            
            // Prefer back/environment camera if available
            const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
            if (backCamera) {
                selectedCameraId = backCamera.id;
            }

            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                selectedCameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // Stop scanning on success
                    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                        html5QrCodeRef.current.stop().then(() => {
                            setIsScanning(false);
                            processScan(decodedText);
                        }).catch(err => {
                            console.error("Failed to stop scanner", err);
                        });
                    }
                },
                (errorMessage) => {
                    // Ignore regular scan failures
                }
            );
        } catch (err) {
            console.error("Scanner error", err);
            setError("Could not start camera. Please ensure permissions are granted and device has a camera.");
            setIsScanning(false);
        }
    };

    const handleStopScan = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const processScan = async (token) => {
        setLoading(true);
        setError('');
        try {
            const response = await scanAttendanceQR(token);
            setScanResult({ success: true, message: response.message || 'Attendance recorded successfully!' });
        } catch (err) {
            console.error(err);
            setScanResult({ success: false, message: err.message || 'Failed to record attendance. Invalid or expired QR.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => { window.history.back() }} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</button>
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

            {/* Error / Success Messages */}
            {error && (
                <div style={{ padding: 12, marginBottom: 16, background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 14 }}>
                    {error}
                </div>
            )}
            
            {scanResult && (
                <div style={{ padding: 16, marginBottom: 16, background: scanResult.success ? '#dcfce7' : '#fee2e2', color: scanResult.success ? '#166534' : '#991b1b', borderRadius: 8, fontSize: 15, fontWeight: 'bold' }}>
                    {scanResult.success ? '✅ ' : '❌ '}{scanResult.message}
                </div>
            )}

            {/* Camera + Scan - full width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="aqr-cam" style={{ width: '100%', minHeight: isScanning ? '320px' : 'auto', position: 'relative', overflow: 'hidden' }}>
                    <div id="reader" style={{ width: '100%', display: isScanning ? 'block' : 'none' }}></div>
                    
                    {!isScanning && (
                        <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div className="aqr-cam-ic">📷</div>
                            <div className="aqr-cam-txt">{a.cameraReady}</div>
                            <div className="aqr-cam-sub">{a.cameraSub}</div>
                        </div>
                    )}
                    
                    {loading && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 'bold', zIndex: 10 }}>
                            Processing...
                        </div>
                    )}

                    {isScanning && <div className="scan-line" />}
                </div>

                {!isScanning ? (
                    <button className="aqr-scan-btn" onClick={handleStartScan} disabled={loading}>
                        <span>⬛</span> {loading ? 'Processing...' : a.scanBtn}
                    </button>
                ) : (
                    <button className="aqr-scan-btn" onClick={handleStopScan} style={{ background: 'var(--red)', borderColor: 'var(--red)' }}>
                        <span>⏹</span> Stop Scanning
                    </button>
                )}
            </div>
        </div>
    );
}
