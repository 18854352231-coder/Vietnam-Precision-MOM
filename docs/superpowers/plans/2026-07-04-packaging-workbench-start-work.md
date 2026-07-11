# Packaging Workbench Start Work Entry Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 调整包装工作台的开工入口，使操作列支持单条开工，顶部操作区支持批量开工，并统一把待包装数据流转到包装中队列。

**Architecture:** 在 `PackagingWorkbench.vue` 现有页签和本地 `tableData` 状态基础上实现，不引入新组件、不改后端接口。通过把顶部按钮重命名为 `批量开工`、在操作列增加单条 `开工`，并复用同一套状态更新逻辑完成 `待包装 -> 包装中` 的流转。

**Tech Stack:** Vue 3, `<script setup>`, TypeScript, Element Plus, Vite

---

### Task 1: 调整开工入口

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 将操作区按钮改为“批量开工”**

```vue
<el-button
  v-if="activeTab === '待包装'"
  type="primary"
  :disabled="selectedRows.length === 0"
  @click="handleStartWork"
>
  批量开工
</el-button>
```

- [ ] **Step 2: 在操作列增加单条“开工”按钮**

```vue
<el-button
  v-if="row.status === '待包装'"
  type="primary"
  link
  size="small"
  @click="handleSingleStartWork(row)"
>
  开工
</el-button>
```

- [ ] **Step 3: 保留现有“查看工艺文件”“来料报废”“装托”顺序**

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
  <el-button type="primary" link @click="viewProcessDocument()">查看工艺文件</el-button>
  <el-button type="danger" :disabled="selectedRows.length === 0" @click="openScrapDialog">来料报废</el-button>
</div>
```

### Task 2: 实现单条和批量状态流转

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 保留批量开工方法并用于顶部按钮**

```ts
const handleStartWork = () => {
  const selectedIds = new Set(selectedRows.value.map(row => row.id))
  let updatedCount = 0

  tableData.value.forEach(item => {
    if (selectedIds.has(item.id) && item.status === '待包装') {
      item.status = '包装中'
      updatedCount += 1
    }
  })

  selectedRows.value = []
  if (updatedCount > 0) {
    ElMessage.success(`已开工 ${updatedCount} 条数据`)
  }
}
```

- [ ] **Step 2: 新增单条开工方法**

```ts
const handleSingleStartWork = (row: any) => {
  if (row.status !== '待包装') {
    ElMessage.warning('仅待包装数据可开工')
    return
  }

  row.status = '包装中'
  ElMessage.success('已开工 1 条数据')
}
```

- [ ] **Step 3: 让开工入口都只影响“待包装”数据**

```ts
if (selectedIds.has(item.id) && item.status === '待包装') {
  item.status = '包装中'
  updatedCount += 1
}
```

- [ ] **Step 4: 批量开工后清空勾选，避免误操作**

```ts
selectedRows.value = []
```

### Task 3: 回归验证

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 构建检查**

Run:

```bash
npm run build
```

Expected:

```text
vite build 成功
```

- [ ] **Step 2: 手工确认状态流转**

```text
1. 打开包装工作台“待包装”页签
2. 点击某一条待包装行的“开工”
3. 该条数据从待包装进入包装中
4. 再勾选多条待包装数据点击“批量开工”
5. 切到“包装中”页签可看到刚开工的数据
```
