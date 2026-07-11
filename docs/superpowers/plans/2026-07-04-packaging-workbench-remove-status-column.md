# Packaging Workbench Remove Status Column Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除包装工作台表格中的状态列，同时保留页签筛选与内部状态流转逻辑不变。

**Architecture:** 仅修改 `PackagingWorkbench.vue` 的表格模板，删除 `状态` 列定义，不触碰 `status` 数据字段、`activeTab` 页签筛选或按钮显隐逻辑。通过诊断和构建验证确保该调整不会影响开工、装托、报废流程。

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite

---

### Task 1: 删除状态列表列

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 删除表格中的状态列定义**

```vue
<el-table :data="paginatedData" border stripe height="calc(100vh - 330px)" @selection-change="handleSelectionChange">
  <el-table-column type="selection" width="55" align="center" />
  <el-table-column type="index" label="序号" width="60" align="center" />
  <el-table-column prop="frameNo" label="框号" width="120" />
  <el-table-column prop="orderNo" label="订单号" width="140" />
</el-table>
```

### Task 2: 验证页面逻辑未受影响

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 检查诊断**

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
