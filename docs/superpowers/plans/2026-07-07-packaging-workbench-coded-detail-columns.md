# Packaging Workbench Coded Detail Columns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将包装工作台 `包装中` 页签下有码料展开明细调整为“多选、序号、长支码、长支长度、挤压批次”的展示结构。

**Architecture:** 仅修改 `src/views/extrusion/PackagingWorkbench.vue` 的有码料展开子表模板。通过列名和字段映射调整完成图片同款展示，其中 `长支码` 复用 `details.code`，`长支长度` 复用 `details.fixedLength`，`挤压批次` 直接读取主表 `row.batchNo`，不改动现有勾选与装托逻辑。

**Tech Stack:** Vue 3, `<script setup>`, TypeScript, Element Plus, Vite

---

### Task 1: 调整有码料展开明细列

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 将二维码编号列改为长支码**

```vue
<el-table-column prop="code" label="长支码" min-width="280" show-overflow-tooltip />
```

- [ ] **Step 2: 将定长列改为长支长度**

```vue
<el-table-column prop="fixedLength" label="长支长度" width="140" align="right" />
```

- [ ] **Step 3: 新增挤压批次列**

```vue
<el-table-column label="挤压批次" min-width="180" show-overflow-tooltip>
  <template #default>
    {{ row.batchNo }}
  </template>
</el-table-column>
```

### Task 2: 验证改动

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
2. 展开有码料明细
3. 确认字段顺序为：多选、序号、长支码、长支长度、挤压批次
4. 确认长支码支持超长省略悬浮查看
5. 确认勾选短支后仍可正常走右上角装托流程
```
