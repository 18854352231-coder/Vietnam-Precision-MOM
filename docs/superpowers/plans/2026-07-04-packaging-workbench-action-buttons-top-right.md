# Packaging Workbench Action Buttons Top Right Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将包装工作台的批量开工和来料报废按钮移动到搜索区同一行最右侧，保留现有业务行为不变。

**Architecture:** 仅调整 `PackagingWorkbench.vue` 的搜索区模板与 scoped 样式。搜索表单作为左侧自适应区域，按钮组作为右侧固定区域，实现顶部右对齐，同时维持查询、重置和批量业务逻辑不变。

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite

---

### Task 1: 调整搜索区模板结构

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 为搜索表单增加独立类名，作为左侧自适应容器**

```vue
<el-form class="search-form" :inline="true" :model="searchForm">
```

- [ ] **Step 2: 保留按钮组在搜索区内，但作为右侧独立容器**

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

### Task 2: 调整搜索区样式

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 为搜索区设置左右布局，避免按钮被挤到下一行**

```css
.search-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.search-form {
  flex: 1;
  min-width: 0;
}
```

- [ ] **Step 2: 保持按钮组右对齐且不被压缩**

```css
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}
```

### Task 3: 验证

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
