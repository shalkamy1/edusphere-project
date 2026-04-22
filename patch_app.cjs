const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add react-router imports
content = content.replace(
  /import React, { useState, useEffect, useRef, createContext, useContext } from 'react';/,
  "import React, { useState, useEffect, useRef, createContext, useContext } from 'react';\nimport { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';"
);

// 2. Refactor App() component start using regex to ignore spaces
content = content.replace(
  /export default function App\(\) \{\s*const \[page, setPage\] = useState\('dashboard'\);\s*const \[theme, setTheme\] = useState\('light'\);/,
  "export default function App() {\n  const navigate = useNavigate();\n  const location = useLocation();\n  const page = location.pathname.split('/')[1] || 'dashboard';\n  const setPage = (p) => navigate('/' + p);\n  const [theme, setTheme] = useState('light');"
);

// 3. navigateTo handle parameter
content = content.replace(
  /const navigateTo = \(p\) => \{ setPage\(p\); \};/,
  "const navigateTo = setPage;"
);

// 4. Logout / Login redirects
content = content.replace(
  /setPage\('dashboard'\);\s*\};\s*const handleLogin = \(info\) => \{ setUserInfo\(info\); setLoggedIn\(true\); \};/,
  "navigate('/');\n  };\n  const handleLogin = (info) => { setUserInfo(info); setLoggedIn(true); navigate('/dashboard'); };"
);

// 5. Replace renderPage() with Routes component tree
const renderPageRegex = /const renderPage = \(\) => \{[\s\S]*?default: return <PageDashboard setPage=\{setPage\} \/>;\s*\}\s*\};/;
const routesBlock = `              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<PageDashboard setPage={navigateTo} />} />
                <Route path="/attendance" element={<PageAttendance setPage={navigateTo} />} />
                <Route path="/students" element={<PageStudentServices setPage={navigateTo} />} />
                <Route path="/curriculum" element={<PageCurriculum setPage={navigateTo} />} />
                <Route path="/records" element={<PageRecords setPage={navigateTo} />} />
                <Route path="/medical" element={<PageMedical setPage={navigateTo} />} />
                <Route path="/complaints" element={<PageComplaints setPage={navigateTo} />} />
                <Route path="/warning" element={<PageWarning setPage={navigateTo} />} />
                <Route path="/requests" element={<PageRequests setPage={navigateTo} />} />
                <Route path="/grades" element={<PageGrades t={t} setPage={navigateTo} />} />
                <Route path="/timetable" element={<PageTimetable t={t} setPage={navigateTo} />} />
                <Route path="/adddrop" element={<PageAddDrop setPage={navigateTo} t={t} goal={addDropGoal} onGoalSelect={(g) => setAddDropGoal(g)} onRequestGoal={() => setShowGoalModal(true)} onCourseDrop={(code) => setDroppedCourses(prev => prev.includes(code) ? prev : [...prev, code])} />} />
                <Route path="/settings" element={<PageSettings theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} t={t} setPage={navigateTo} />} />
                <Route path="/chatbot" element={<PageChatbot />} />
                <Route path="/security" element={<PageSecurity onLogout={handleLogout} setPage={navigateTo} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>`;

content = content.replace(renderPageRegex, '');
content = content.replace('{renderPage()}', routesBlock);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('App.jsx successfully patched.');
