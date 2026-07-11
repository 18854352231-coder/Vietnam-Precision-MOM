const fs = require('fs');
const path = 'd:/越南MOM/MOM/src/views/extrusion/SawingWorkbench.vue';
let content = fs.readFileSync(path, 'utf-8');

// Replace longBranchNo with rodNo
content = content.replace(/longBranchNo/g, 'rodNo');
content = content.replace(/长支号/g, '铝棒编号');

// Update frameList dialog fields
content = content.replace(
  /<el-table-column prop="frameTime" label="装框时间" width="150" align="center" \/>/,
  '<el-table-column prop="frameStartTime" label="装框开始时间" width="160" align="center" />\n        <el-table-column prop="frameEndTime" label="装框结束时间" width="160" align="center" />'
);

content = content.replace(
  /const frameListData = ref\(\[\n  \{ frameNo: 'F-1001', batchNo: 'B-260414-001', frameTime: '2026-04-14 14:35:00' \},\n  \{ frameNo: 'F-1002', batchNo: 'B-260414-001', frameTime: '2026-04-14 15:10:00' \}\n\]\)/,
  `const frameListData = ref([\n  { frameNo: 'F-1001', batchNo: 'B-260414-001', frameStartTime: '2026-04-14 14:30:00', frameEndTime: '2026-04-14 14:35:00', hasSample: '是' },\n  { frameNo: 'F-1002', batchNo: 'B-260414-001', frameStartTime: '2026-04-14 15:05:00', frameEndTime: '2026-04-14 15:10:00', hasSample: '否' }\n])`
);

// frame detail remove sampleType
content = content.replace(
  /        <el-table-column prop="isSampled" label="是否取样" width="100" align="center">[\s\S]*?<\/el-table-column>/,
  ''
);

fs.writeFileSync(path, content);
console.log('done');
