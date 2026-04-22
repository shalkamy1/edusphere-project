const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');
const oldImport = "import { logout as apiLogout, getToken, getStoredUser, clearAuth } from './api.js';";
const newImport = "import { logout as apiLogout, getToken, getStoredUser, clearAuth, adviseStudent } from './api.js';";
if (content.includes(oldImport)) {
    content = content.replace(oldImport, newImport);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Import patched successfully');
} else {
    console.log('Pattern not found, checking content:');
    const idx = content.indexOf('apiLogout');
    console.log('Found apiLogout at:', idx);
    console.log('Surrounding text:', JSON.stringify(content.slice(Math.max(0,idx-10), idx+80)));
}
