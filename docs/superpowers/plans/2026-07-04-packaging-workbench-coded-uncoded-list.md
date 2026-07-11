# Packaging Workbench Coded Uncoded List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在包装工作台列表中区分有码料与无码料，让有码料支持展开查看明细，无码料只显示数量。

**Architecture:** 仅修改 `PackagingWorkbench.vue` 的表格结构、展开模板、mock 数据和少量辅助判断逻辑。保留现有搜索、页签、开工、装托、报废、打印等业务流程不变，先完成纯展示层分流。

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite

---

### Task 1: 扩展包装工作台 mock 数据结构

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 为主表数据补充 isCoded 和 details 字段**

```ts
{
  id: 1,
  frameNo: 'F-2605001',
  qty: 100,
  isCoded: true,
  details: [
    { id: 1, code: 'BC-001', productNo: 'P-1001', length: '6.0', qty: 20, status: '待包装' },
    { id: 2, code: 'BC-002', productNo: 'P-1001', length: '6.0', qty: 30, status: '待包装' }
  ]
}
```

- [ ] **Step 2: 为无码料记录设置空明细数组**

```ts
{
  id: 2,
  frameNo: 'F-2605002',
  qty: 120,
  isCoded: false,
  details: []
}
```

### Task 2: 调整主表列结构

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 在主表新增展开列**

```vue
<el-table-column type="expand">
  <template #default="{ row }">
    <div v-if="row.isCoded" class="coded-detail-wrapper">
      <!-- 明细子表 -->
    </div>
  </template>
</el-table-column>
```

- [ ] **Step 2: 新增料框类型列**

```vue
<el-table-column label="料框类型" width="100">
  <template #default="{ row }">
    <el-tag :type="row.isCoded ? 'success' : 'info'">
      {{ row.isCoded ? '有码料' : '无码料' }}
    </el-tag>
  </template>
</el-table-column>
```

### Task 3: 增加有码料明细子表

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 在展开区域渲染有码料明细表**

```vue
<el-table :data="row.details" border stripe>
  <el-table-column type="index" label="序号" width="60" />
  <el-table-column prop="code" label="条码/标识码" min-width="160" />
  <el-table-column prop="productNo" label="产品号" min-width="120" />
  <el-table-column prop="length" label="长度" width="100" />
  <el-table-column prop="qty" label="数量" width="100" />
  <el-table-column prop="status" label="状态" width="100" />
</el-table>
```

- [ ] **Step 2: 为无码料行保持空展开区域**

```vue
<div v-if="row.isCoded" class="coded-detail-wrapper">
  ...
</div>
```

### Task 4: 控制无码料不参与无效展开

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 增加是否允许展开的判断函数**

```ts
const canExpandRow = (row: PackagingRow) => row.isCoded
```

- [ ] **Step 2: 通过样式弱化无码料的展开入口**

```css
.uncoded-row :deep(.el-table__expand-icon) {
  visibility: hidden;
  pointer-events: none;
}
```

### Task 5: 验证

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 检查文件诊断**

Run:

```bash
GetDiagnostics file:///d:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue
```

Expected:

```text
无新增诊断错误
```

- [ ] **Step 2: 执行构建验证**

Run:

```bash
npm run build
```

Expected:

```text
vite build 成功
```
