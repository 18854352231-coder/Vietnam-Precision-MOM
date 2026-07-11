# Packaging Workbench Search Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为包装工作台增加时间范围、客户名称、模具号、炉次号搜索，同时保留现有框号和挤压批次号搜索能力。

**Architecture:** 仅修改 `PackagingWorkbench.vue` 的搜索表单、`searchForm` 模型、`filteredTableData` 过滤逻辑和 mock 数据字段。不接后端接口，继续沿用本地计算属性过滤，并为时间范围搜索补充 `finishTime` 数据字段。

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite

---

### Task 1: 扩展顶部搜索表单

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 在搜索区增加客户名称、模具号、炉次号、时间范围**

```vue
<el-form-item label="客户名称">
  <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
</el-form-item>
<el-form-item label="模具号">
  <el-input v-model="searchForm.moldNo" placeholder="请输入模具号" clearable />
</el-form-item>
<el-form-item label="炉次号">
  <el-input v-model="searchForm.furnaceNo" placeholder="请输入炉次号" clearable />
</el-form-item>
<el-form-item label="时间范围">
  <el-date-picker
    v-model="searchForm.timeRange"
    type="datetimerange"
    start-placeholder="开始时间"
    end-placeholder="结束时间"
    value-format="YYYY-MM-DD HH:mm:ss"
  />
</el-form-item>
```

### Task 2: 扩展搜索模型和过滤逻辑

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 扩展 searchForm 默认结构**

```ts
const searchForm = ref({
  frameNo: '',
  batchNo: '',
  customerName: '',
  moldNo: '',
  furnaceNo: '',
  timeRange: [] as string[]
})
```

- [ ] **Step 2: 在 filteredTableData 中增加关键字和时间范围过滤**

```ts
if (searchForm.value.customerName && !keywordMatch(item.customerName, searchForm.value.customerName)) return false
if (searchForm.value.moldNo && !keywordMatch(item.moldNo, searchForm.value.moldNo)) return false
if (searchForm.value.furnaceNo && !keywordMatch(item.furnaceNo, searchForm.value.furnaceNo)) return false

if (searchForm.value.timeRange.length === 2) {
  const [start, end] = searchForm.value.timeRange
  const current = new Date(item.finishTime).getTime()
  if (current < new Date(start).getTime() || current > new Date(end).getTime()) return false
}
```

- [ ] **Step 3: 重置时清空新增字段**

```ts
searchForm.value = {
  frameNo: '',
  batchNo: '',
  customerName: '',
  moldNo: '',
  furnaceNo: '',
  timeRange: []
}
```

### Task 3: 为包装工作台 mock 数据补充 finishTime

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 为 tableData 每条记录增加 finishTime**

```ts
{
  id: 1,
  frameNo: 'F-2605001',
  ...,
  finishTime: '2026-07-04 08:30:00'
}
```

### Task 4: 验证

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
