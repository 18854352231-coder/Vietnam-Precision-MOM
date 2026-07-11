const fs = require('fs');
const path = require('path');

function getRandomProduct() {
  const num = Math.floor(Math.random() * 140) + 1;
  return `FC${String(num).padStart(2, '0')}`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace productName: '...' or productName: "..." or productName: `...`
  // Also handle the processType ternary: productName: processType === 'extrusion' ? '铝型材-6063' : '铝棒-A级'
  // Let's just do a simpler approach: find any `productName: <something>,` and replace it with `productName: 'FCXX',`
  // But we have to be careful not to replace `productName: string` or variables.
  
  // First, replace simple strings
  content = content.replace(/productName:\s*['"]([^'"]+)['"]/g, (match, p1) => {
    return `productName: '${getRandomProduct()}'`;
  });
  
  // Second, replace the specific ternary in processDocuments.ts
  content = content.replace(/productName:\s*processType\s*===\s*'extrusion'\s*\?\s*'[^']+'\s*:\s*'[^']+'/g, () => {
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
