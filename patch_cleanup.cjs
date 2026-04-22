const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The remnant of the old GoalModal that needs to be removed (lines 285-366)
// It starts with "}) {" which is the broken artifact of the old function
// and ends before "/* ── GET SUPPORT MODAL */

// Find the broken artifact start point: }) { right after the new function closes
const remnantStart = '}) {\r\nconst [hovered, setHovered] = useState(null);';
const remnantIdx = content.indexOf('}) {\r\n  const [hovered, setHovered] = useState(null);');

// Alternative: find just the end of new GoalModal and start of GetSupportModal
// New GoalModal ends at "  );\n}"  then there's the remnant
// GetSupportModal starts at "/* ── GET SUPPORT MODAL"

const newGoalEnd = '  );\n}';
const getSupportStart = '/* ── GET SUPPORT MODAL ──────────────────────────────────────── */';

const endIdx = content.indexOf(newGoalEnd);
const supportIdx = content.indexOf(getSupportStart);

if (endIdx !== -1 && supportIdx !== -1) {
    // The new GoalModal ends at endIdx + newGoalEnd.length
    const goalModalEnd = endIdx + newGoalEnd.length;
    
    // Between goalModalEnd and supportIdx is the remnant we want to remove
    const between = content.slice(goalModalEnd, supportIdx);
    console.log('Content between new GoalModal end and GetSupportModal start:');
    console.log(JSON.stringify(between.slice(0, 200)));
    
    // Remove the remnant
    const fixed = content.slice(0, goalModalEnd) + '\n\n' + content.slice(supportIdx);
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log('Remnant removed! File saved.');
    console.log('New total length:', fixed.length);
} else {
    console.log('Could not find markers:');
    console.log('newGoalEnd found at:', endIdx);
    console.log('getSupportStart found at:', supportIdx);
}
