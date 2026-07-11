const fs = require('fs');
const path = require('path');

let counter = 179;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Regex to match frameNo: '...' or frameNo: "..."
  // Also match furnaceNo if the user might mean that? Wait, user said 框号 (frameNo).
  content = content.replace(/frameNo:\s*['"]([^'"]+)['"]/g, (match, p1) => {
    // If it's already in the correct format, skip
    if (p1.startsWith('CV-A-A-L6000*W1250*H650*')) {
      return match;
    }
    const newFrameNo = `CV-A-A-L6000*W1250*H650*${String(counter++).padStart(4, '0')}`;
    return `frameNo: '${newFrameNo}'`;
  });
  
  // Sometimes it's a field in an object without 'frameNo:' prefix in templates, but mostly in mock data.
  // We also have cases like { frameNo: 'F-1001' ... }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, '..', 'src'));
