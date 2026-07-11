# Packaging Workbench Table Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化包装工作台列表列宽与字段顺序，让高频字段显示更均衡，同时保持现有业务逻辑不变。

**Architecture:** 仅修改 `PackagingWorkbench.vue` 表格模板中的列顺序和宽度配置，不引入新组件、不修改数据模型。通过保留所有原字段和操作列逻辑，确保页签筛选、开工、装托、报废等流程不受影响。

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite

---

### Task 1: 重排包装工作台列表列

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 调整字段顺序与列宽**

```vue
<el-table-column prop="frameNo" label="框号" width="120" />
<el-table-column prop="orderNo" label="订单号" width="160" />
<el-table-column prop="batchNo" label="挤压批次号" width="160" />
<el-table-column prop="customerCode" label="客户代码" width="90" />
<el-table-column prop="customerName" label="客户名称" width="140" />
<el-table-column prop="productNo" label="产品号" width="140" />
<el-table-column prop="moldNo" label="模具号" width="140" />
<el-table-column prop="furnaceNo" label="炉次号" width="110" />
<el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
<el-table-column prop="alloy" label="牌号" width="80" />
<el-table-column prop="shiftTeam" label="班组" width="80" />
<el-table-column prop="length" label="长度(m)" width="90" align="right" />
<el-table-column prop="qty" label="支数" width="80" align="right" />
<el-table-column prop="source" label="来源工序" width="100" align="center" />
<el-table-column label="操作" width="300" align="center">
```

### Task 2: 验证构建与诊断

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
