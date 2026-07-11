const fs = require('fs');
const path = require('path');

function getRandomProduct() {
  const num = Math.floor(Math.random() * 140) + 1;
  return `FC-${String(num).padStart(2, '0')}`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace productName: '...' or productName: "..."
  content = content.replace(/productName:\s*['"]([^'"]+)['"]/g, (match, p1) => {
    return `productName: '${getRandomProduct()}'`;
  });

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
