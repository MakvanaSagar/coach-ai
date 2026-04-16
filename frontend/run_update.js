const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');
const lines = code.split('\n');
let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes("{view === 'dashboard' && (")) {
       startIndex = i;
       break;
   }
}

if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

const beforeCode = lines.slice(0, startIndex).join('\n');
const newDashboardCode = fs.readFileSync('new_dash.txt', 'utf8');

const finalCode = beforeCode + '\n' + newDashboardCode;
fs.writeFileSync('src/App.jsx', finalCode);
console.log('Successfully updated App.jsx completely!');
