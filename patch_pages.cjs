const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // If setPage is not in this file, skip
  if (!content.includes('setPage')) return;

  // Add useNavigate import if not exists
  if (!content.includes('useNavigate')) {
    if (content.includes("import {") && content.includes("'react-router-dom'")) {
        // already has react router import, might not happen but safe
    } else {
        content = "import { useNavigate } from 'react-router-dom';\n" + content;
    }
  }

  // Inject const navigate = useNavigate(); right after the exported component function starts
  const funcMatch = content.match(/export default function\s+\w+\s*\({[^}]*}\)\s*\{/);
  if (funcMatch) {
    const matchedStr = funcMatch[0];
    // Remove setPage from destructured props
    let newMatchedStr = matchedStr.replace(/setPage\s*,?\s*/g, '');
    if (newMatchedStr.includes('{ }')) newMatchedStr = newMatchedStr.replace('{ }', '');
    if (newMatchedStr.includes('{ ,')) newMatchedStr = newMatchedStr.replace('{ ,', '{ ');

    if (!content.includes('const navigate = useNavigate();')) {
       content = content.replace(matchedStr, newMatchedStr + '\n  const navigate = useNavigate();');
    } else {
       content = content.replace(matchedStr, newMatchedStr);
    }
  }

  // Replace occurrences of setPage('...') with navigate('/...')
  // Handle setPage && setPage('dashboard')
  content = content.replace(/setPage\s*&&\s*setPage\('([^']+)'\)/g, "navigate('/$1')");
  // Handle setPage('dashboard')
  content = content.replace(/setPage\('([^']+)'\)/g, "navigate('/$1')");
  // Handle setPage(s.page)
  content = content.replace(/setPage\(([^)]+)\)/g, "navigate('/' + $1)");

  fs.writeFileSync(filePath, content, 'utf8');
});

// We also need to fix src/pages.jsx if it contains setPage
const pagesJsxPath = path.join(__dirname, 'src', 'pages.jsx');
if (fs.existsSync(pagesJsxPath)) {
  let pContent = fs.readFileSync(pagesJsxPath, 'utf8');
  if (pContent.includes('setPage')) {
      if (!pContent.includes('useNavigate')) {
          pContent = "import { useNavigate } from 'react-router-dom';\n" + pContent;
      }
      // Replace destructured setPage
      pContent = pContent.replace(/setPage\s*,?\s*/g, '');
      
      // Inject navigate hooks manually for pages.jsx since it has multiple components. Let's do it carefully.
      pContent = pContent.replace(/export function PageGrades\(\{\s*t\s*\}\) \{/g, "export function PageGrades({ t }) {\n  const navigate = useNavigate();");
      pContent = pContent.replace(/export function PageTimetable\(\{\s*t\s*\}\) \{/g, "export function PageTimetable({ t }) {\n  const navigate = useNavigate();");
      pContent = pContent.replace(/export function PageAddDrop\(\{([^}]+)\}\) \{/g, "export function PageAddDrop({$1}) {\n  const navigate = useNavigate();");
      pContent = pContent.replace(/export function PageSettings\(\{([^}]+)\}\) \{/g, "export function PageSettings({$1}) {\n  const navigate = useNavigate();");
      
      pContent = pContent.replace(/navigate\('\/' \+ (['"][^'"]+['"])\)/g, "navigate($1)");
      
      fs.writeFileSync(pagesJsxPath, pContent, 'utf8');
  }
}

console.log('Pages successfully refactored.');
