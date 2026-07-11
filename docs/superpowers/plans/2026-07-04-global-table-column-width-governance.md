# Global Table Column Width Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变业务逻辑的前提下，统一优化全系统主要表格页面的列宽、常见列顺序和长字段 tooltip 表现。

**Architecture:** 本次改造直接在各页面现有 `el-table-column` 模板上做保守调整，不抽离公共配置，不改数据流。按模块分组推进：先主表和高频页面，再多表页和报表页，最后统一执行诊断与构建验证。

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite

---

### Task 1: 统一高频工作台页的主表列宽

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PendingStorageList.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/CuttingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue`

- [ ] **Step 1: 按统一规则调整长字段与短字段宽度**

```vue
<el-table-column prop="orderNo" label="订单号" width="160" show-overflow-tooltip />
<el-table-column prop="batchNo" label="挤压批次号" width="160" show-overflow-tooltip />
<el-table-column prop="customerName" label="客户名称" width="140" show-overflow-tooltip />
<el-table-column prop="productNo" label="产品号" width="140" show-overflow-tooltip />
<el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
<el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
<el-table-column prop="alloy" label="牌号" width="80" />
```

### Task 2: 统一挤压与质量多表页的宽度策略

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/IssueScheduling.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/SawingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/AgingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/CNCSamplePreparation.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/LabTesting.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessQualityInspection.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/InspectionConfig.vue`

- [ ] **Step 1: 优先处理主列表与明显拥挤的长字段**

```vue
<el-table-column prop="productName" label="产品名称" width="160" show-overflow-tooltip />
<el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
<el-table-column prop="status" label="状态" width="90" align="center" />
<el-table-column prop="completionTime" label="完工时间" width="160" />
<el-table-column prop="quantity" label="数量" width="90" align="right" />
```

### Task 3: 统一计划、报表、主数据页面列宽

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/plan/MasterPlan.vue`
- Modify: `D:/越南MOM/MOM/src/views/plan/Overview.vue`
- Modify: `D:/越南MOM/MOM/src/views/plan/ProductionPlan.vue`
- Modify: `D:/越南MOM/MOM/src/views/reports/extrusion/ExtrusionReport.vue`
- Modify: `D:/越南MOM/MOM/src/views/reports/extrusion/CuttingReport.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/master-data/Material.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/master-data/Component.vue`

- [ ] **Step 1: 对高密度单表页补齐宽度和 tooltip**

```vue
<el-table-column prop="materialName" label="物料名称" width="180" show-overflow-tooltip />
<el-table-column prop="specification" label="规格" width="160" show-overflow-tooltip />
<el-table-column prop="remark" label="备注" width="180" show-overflow-tooltip />
<el-table-column prop="reportDate" label="日期" width="140" />
<el-table-column label="操作" width="240" align="center" />
```

### Task 4: 全量检查

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PendingStorageList.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/CuttingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/IssueScheduling.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/SawingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/AgingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/CNCSamplePreparation.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/LabTesting.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessQualityInspection.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/InspectionConfig.vue`
- Modify: `D:/越南MOM/MOM/src/views/plan/MasterPlan.vue`
- Modify: `D:/越南MOM/MOM/src/views/plan/Overview.vue`
- Modify: `D:/越南MOM/MOM/src/views/plan/ProductionPlan.vue`
- Modify: `D:/越南MOM/MOM/src/views/reports/extrusion/ExtrusionReport.vue`
- Modify: `D:/越南MOM/MOM/src/views/reports/extrusion/CuttingReport.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/master-data/Material.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/master-data/Component.vue`

- [ ] **Step 1: 检查修改文件诊断**

Run:

```bash
GetDiagnostics
```

Expected:

```text
修改文件无新增诊断错误
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
