# Packaging Workbench Hide Shift Team In Pending Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 仅在包装工作台的待包装页签隐藏班组列，同时保留其他页签和打印预览中的班组信息。

**Architecture:** 只修改 `PackagingWorkbench.vue` 中表格模板的 `shiftTeam` 列定义，将其改为基于 `activeTab` 的条件渲染。数据模型、打印预览、业务流程保持不变，并通过诊断和构建确认无回归。

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite

---

### Task 1: 条件隐藏待包装页签的班组列

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 将班组列改为按页签条件显示**

```vue
<el-table-column
  v-if="activeTab !== '待包装'"
  prop="shiftTeam"
  label="班组"
  width="80"
/>
```

### Task 2: 验证不影响其他逻辑

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
