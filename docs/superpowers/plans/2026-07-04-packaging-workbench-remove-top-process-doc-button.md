# Packaging Workbench Remove Top Process Doc Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除包装工作台右上角工具栏中的查看工艺文件按钮，同时保留列表操作列中的同名入口。

**Architecture:** 仅修改 `PackagingWorkbench.vue` 顶部工具栏模板，删除调用 `viewProcessDocument()` 的按钮，不调整操作列或工艺文件弹窗逻辑。通过诊断与构建确认页面行为不受影响。

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite

---

### Task 1: 删除顶部查看工艺文件按钮

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 从顶部工具栏中删除查看工艺文件按钮**

```vue
<div class="action-buttons">
  <el-button
    v-if="activeTab === '待包装'"
    type="primary"
    :disabled="selectedRows.length === 0"
    @click="handleStartWork"
  >
    批量开工
  </el-button>
  <el-button type="danger" :disabled="selectedRows.length === 0" @click="openScrapDialog">来料报废</el-button>
</div>
```

### Task 2: 验证顶部入口删除且行内入口保留

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
