# Packaging Workbench Pack Button Top Right Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将包装工作台 `包装中` 页签的 `装托` 入口从主表行内操作列调整到页面右上角操作区，并保留现有短支装托弹窗和扣减逻辑。

**Architecture:** 仅修改 `src/views/extrusion/PackagingWorkbench.vue`。在顶部 `action-buttons` 中新增 `装托` 按钮，按钮基于主表单条勾选触发，并复用现有 `openShortBarPackDialog()` 进入短支装托流程；同时删除主表操作列内的 `装托` 按钮，避免重复入口。

**Tech Stack:** Vue 3, `<script setup>`, TypeScript, Element Plus, Vite

---

### Task 1: 调整顶部操作区按钮

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 在右上角按钮区新增包装中专用装托按钮**

```vue
<el-button
  v-if="activeTab === '包装中'"
  type="primary"
  :disabled="selectedRows.length !== 1"
  @click="handleTopPack"
>
  装托
</el-button>
```

- [ ] **Step 2: 保留待包装和报废按钮原有显示逻辑**

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
  <el-button
    v-if="activeTab === '包装中'"
    type="primary"
    :disabled="selectedRows.length !== 1"
    @click="handleTopPack"
  >
    装托
  </el-button>
  <el-button type="danger" :disabled="selectedRows.length === 0" @click="openScrapDialog">来料报废</el-button>
</div>
```

### Task 2: 接入右上角装托入口逻辑

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 新增顶部装托入口函数**

```ts
const handleTopPack = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择一条包装中数据')
    return
  }
  if (selectedRows.value.length > 1) {
    ElMessage.warning('装托时只能选择一条数据')
    return
  }

  const [row] = selectedRows.value
  if (row.status !== '包装中') {
    ElMessage.warning('仅包装中数据可装托')
    return
  }

  openShortBarPackDialog(row)
}
```

- [ ] **Step 2: 复用现有短支校验和弹窗入口**

```ts
const openShortBarPackDialog = (row: any) => {
  const selectedDetails = getSelectedDetailsByRow(row)
  if (selectedDetails.length === 0) {
    ElMessage.warning('请先选择短支')
    return
  }

  selectedPackRow.value = row
  shortBarPackForm.value = {
    palletNo: '',
    team: currentTeam.value || '包装现场',
    goodQty: selectedDetails.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)
  }
  shortBarPackDialogVisible.value = true
}
```

### Task 3: 删除主表行内装托入口

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 从主表操作列中移除行内装托按钮**

```vue
<el-table-column label="操作" width="300" align="center">
  <template #default="{ row }">
    <el-button
      v-if="row.status === '待包装'"
      type="primary"
      link
      size="small"
      @click="handleSingleStartWork(row)"
    >
      开工
    </el-button>
    <el-button type="primary" link size="small" @click="viewProcessDocument(row)">查看工艺文件</el-button>
  </template>
</el-table-column>
```

### Task 4: 验证改动

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
2. 确认右上角出现“装托”按钮
3. 未勾选主表数据时按钮置灰
4. 勾选1条包装中主表数据后，按钮可点击
5. 勾选多条主表数据后，按钮置灰或点击提示不可装托
6. 未勾选短支时点击右上角装托，提示“请先选择短支”
7. 勾选短支后点击右上角装托，正常弹出装托弹窗
8. 主表操作列中不再出现行内“装托”按钮
```
