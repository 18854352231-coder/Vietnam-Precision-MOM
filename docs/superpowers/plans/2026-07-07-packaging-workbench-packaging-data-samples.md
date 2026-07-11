# Packaging Workbench Packaging Data Samples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在包装工作台 `包装中` 列表中补充有码料与无码料测试数据，便于验证两种装托流程。

**Architecture:** 仅修改 `src/views/extrusion/PackagingWorkbench.vue` 中的 `tableData` Mock 数据。保留现有 `id: 2` 的无码料包装中样例不动，追加 `2` 条有码料包装中样例和 `1` 条无码料包装中样例，字段结构完全对齐现有数据。

**Tech Stack:** Vue 3, `<script setup>`, TypeScript, Element Plus, Vite

---

### Task 1: 追加包装中有码料样例

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 在 `tableData` 中新增第一条有码料包装中数据**

```ts
{
  id: 7,
  frameNo: 'F-2605007',
  orderNo: 'ORD-20260501-007',
  batchNo: 'EB-20260502-007',
  customerCode: 'CUST-G',
  customerName: '客户G',
  productNo: 'P-7007',
  productName: '门框型材G',
  length: '6.2',
  fixedLength: 6200,
  qty: 72,
  source: '时效',
  status: '包装中',
  furnaceNo: 'F-2026-007',
  moldNo: 'M15-0428-117',
  extrusionMachine: 'JY-11',
  alloy: '6063-T5',
  shiftTeam: '包装二班',
  productionType: '量产',
  finishTime: '2026-07-05 09:20:00',
  isCoded: true,
  details: [
    { id: 71, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260541', productNo: 'P-7007', length: '6.2', qty: 12, status: '包装中', fixedLength: 6200 },
    { id: 72, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260542', productNo: 'P-7007', length: '6.2', qty: 24, status: '包装中', fixedLength: 6200 },
    { id: 73, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260543', productNo: 'P-7007', length: '6.2', qty: 36, status: '包装中', fixedLength: 6200 }
  ]
}
```

- [ ] **Step 2: 在 `tableData` 中新增第二条有码料包装中数据**

```ts
{
  id: 8,
  frameNo: 'F-2605008',
  orderNo: 'ORD-20260501-008',
  batchNo: 'EB-20260502-008',
  customerCode: 'CUST-H',
  customerName: '客户H',
  productNo: 'P-8008',
  productName: '窗扇型材H',
  length: '5.9',
  fixedLength: 5900,
  qty: 54,
  source: '时效',
  status: '包装中',
  furnaceNo: 'F-2026-008',
  moldNo: 'M16-0386-204',
  extrusionMachine: 'JY-22',
  alloy: '6005A',
  shiftTeam: '包装一班',
  productionType: '试产',
  finishTime: '2026-07-05 11:05:00',
  isCoded: true,
  details: [
    { id: 81, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260544', productNo: 'P-8008', length: '5.9', qty: 18, status: '包装中', fixedLength: 5900 },
    { id: 82, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260545', productNo: 'P-8008', length: '5.9', qty: 18, status: '包装中', fixedLength: 5900 },
    { id: 83, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260546', productNo: 'P-8008', length: '5.9', qty: 18, status: '包装中', fixedLength: 5900 }
  ]
}
```

### Task 2: 追加包装中无码料样例

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 在 `tableData` 中新增一条无码料包装中数据**

```ts
{
  id: 9,
  frameNo: 'F-2605009',
  orderNo: 'ORD-20260501-009',
  batchNo: 'EB-20260502-009',
  customerCode: 'CUST-I',
  customerName: '客户I',
  productNo: 'P-9009',
  productName: '无码料测试I',
  length: '5.4',
  fixedLength: 5400,
  qty: 96,
  source: '时效',
  status: '包装中',
  furnaceNo: 'F-2026-009',
  moldNo: 'M13-0158-602',
  extrusionMachine: 'JY-09',
  alloy: '6061RS',
  shiftTeam: '包装三班',
  productionType: '量产',
  finishTime: '2026-07-05 14:10:00',
  isCoded: false,
  details: []
}
```

### Task 3: 验证改动

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 获取文件诊断**

Run tool:

```text
GetDiagnostics(file:///d:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue)
```

Expected:

```text
diagnostics: []
```

- [ ] **Step 2: 运行构建**

Run:

```bash
npm run build
```

Expected:

```text
vite build 成功
```

- [ ] **Step 3: 手工验证**

```text
1. 切到包装工作台“包装中”页签
2. 确认列表中出现多条包装中测试数据
3. 至少有2条有码料可展开并勾选短支
4. 至少有2条无码料可直接测试输入数量装托
5. 右上角装托入口能分别覆盖有码料与无码料流程
```
