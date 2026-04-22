/**
 * Single-shot patch for student portal App.jsx:
 * 1. Adds api.js import (getCurrentUser, saveAuth)
 * 2. Adds ToastCtx/useToast exports
 * 3. Updates avatar in Topbar to show profile_picture_url
 * 4. Adds toasts state + showToast in App()
 * 5. Adds authLoading state + auto-login effect in App()
 * 6. Guards !loggedIn with authLoading check
 * 7. Wraps main return in ToastCtx.Provider
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// normalise line endings for matching, but preserve the original style
const isWin = content.includes('\r\n');

function r(from, to) {
  if (!content.includes(from)) {
    // Try with \r\n variants
    const fromWin = from.replace(/\n/g, '\r\n');
    if (content.includes(fromWin)) {
      content = content.replace(fromWin, to);
      return true;
    }
    return false;
  }
  content = content.replace(from, to);
  return true;
}

// ── 1. api.js import ────────────────────────────────────────────────────────
if (!content.includes('getCurrentUser')) {
  const ok = r(
    `import React, { useState, useEffect, useRef, createContext, useContext } from 'react';`,
    `import React, { useState, useEffect, useRef, createContext, useContext } from 'react';\nimport { logout as apiLogout, getToken, getStoredUser, clearAuth, getCurrentUser, saveAuth } from './api.js';`
  );
  console.log(ok ? '✓ Added api import' : '✗ FAILED api import');
}

// ── 2. ToastCtx export ──────────────────────────────────────────────────────
if (!content.includes('ToastCtx')) {
  const ok = r(
    `export const useLang = () => useContext(LangCtx);`,
    `export const useLang = () => useContext(LangCtx);\n\nexport const ToastCtx = createContext({ showToast: () => {} });\nexport const useToast = () => useContext(ToastCtx);`
  );
  console.log(ok ? '✓ Added ToastCtx' : '✗ FAILED ToastCtx');
}

// ── 3. Avatar with profile picture ──────────────────────────────────────────
if (!content.includes('profile_picture_url')) {
  // Find the line and replace just that line
  content = content.replace(
    /( +)<div className="uavt">\{initials\}<\/div>/,
    `$1{userInfo?.profile_picture_url ? (
$1  <img src={userInfo.profile_picture_url} className="uavt"
$1    style={{ padding: 0, objectFit: 'cover', background: 'white', borderRadius: '50%' }}
$1    alt="Avatar" />
$1) : (
$1  <div className="uavt">{initials}</div>
$1)}`
  );
  console.log(content.includes('profile_picture_url') ? '✓ Updated avatar' : '✗ FAILED avatar');
}

// ── 4. showToast state in App() ─────────────────────────────────────────────
if (!content.includes('showToast')) {
  const ok = r(
    `  const [failedCourses] = useState(['MATH102']); // demo: Calculus II failed`,
    `  const [failedCourses] = useState(['MATH102']); // demo: Calculus II failed
  const [toasts, setToasts] = useState([]);
  const showToast = (msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
  };`
  );
  console.log(ok ? '✓ Added showToast' : '✗ FAILED showToast');
}

// ── 5. authLoading + auto-login effect ──────────────────────────────────────
if (!content.includes('authLoading')) {
  const ok = r(
    `  // navigateTo handles all page navigation\n  const navigateTo = (p) => { setPage(p); };`,
    `  // navigateTo handles all page navigation
  const navigateTo = (p) => { setPage(p); };

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
          setUserInfo(storedUser);
          setLoggedIn(true);
        }
        if (token) {
          const latestUser = await getCurrentUser();
          if (latestUser) {
            setUserInfo(latestUser);
            setLoggedIn(true);
            saveAuth(token, latestUser);
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);`
  );
  console.log(ok ? '✓ Added authLoading' : '✗ FAILED authLoading');
}

// ── 6. authLoading guard ────────────────────────────────────────────────────
if (!content.includes('authLoading) return null')) {
  const ok = r(
    `  if (!loggedIn) {`,
    `  if (authLoading) return null;\n\n  if (!loggedIn) {`
  );
  console.log(ok ? '✓ Added authLoading guard' : '✗ FAILED guard');
}

// ── 7. ToastCtx.Provider wrap ───────────────────────────────────────────────
if (!content.includes('ToastCtx.Provider')) {
  // Replace ONLY the main (logged-in) return's LangCtx.Provider opening/closing
  // The login return is short, main return contains class="app"
  content = content.replace(
    `    <LangCtx.Provider value={{ t, lang, setLang }}>\n      <div className="app">`,
    `    <LangCtx.Provider value={{ t, lang, setLang }}>\n      <ToastCtx.Provider value={{ showToast }}>\n      <div className="app">`
  );
  // Close it — only in the section that has </div>\n    </LangCtx.Provider> at end of file
  content = content.replace(
    `      </div>\n    </LangCtx.Provider>\n  );\n}\n`,
    `      </div>\n      </ToastCtx.Provider>\n    </LangCtx.Provider>\n  );\n}\n`
  );
  console.log(content.includes('ToastCtx.Provider') ? '✓ Wrapped ToastCtx.Provider' : '✗ FAILED ToastCtx.Provider wrap');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ Done!');
