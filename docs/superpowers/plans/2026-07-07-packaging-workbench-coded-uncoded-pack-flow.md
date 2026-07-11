# Packaging Workbench Coded Uncoded Pack Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在包装工作台中实现有码料必须勾选短支装托、无码料无需选短支而在弹窗中直接输入装托数量的统一装托流程。

**Architecture:** 仅修改 `src/views/extrusion/PackagingWorkbench.vue`。保留右上角 `装托` 入口和现有装托弹窗，通过 `selectedPackRow.isCoded` 在弹窗展示和确认逻辑中分支：有码料继续依赖子表选中短支，无码料改为直接填写数量并按该数量扣减主表 `qty`。

**Tech Stack:** Vue 3, `<script setup>`, TypeScript, Element Plus, Vite

---

### Task 1: 为无码料增加装托数量状态

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 扩展装托弹窗表单状态**

```ts
const shortBarPackForm = ref({
  palletNo: '',
  team: '',
  goodQty: 0,
  packQty: 1
})
```

- [ ] **Step 2: 打开装托弹窗时按物料类型初始化数量**

```ts
shortBarPackForm.value = {
  palletNo: '',
  team: currentTeam.value || '包装现场',
  goodQty: row.isCoded
    ? selectedDetails.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)
    : Number(row.qty || 0),
  packQty: row.isCoded
    ? selectedDetails.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)
    : Number(row.qty || 0)
}
```

### Task 2: 调整装托入口分支

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 让有码料继续校验短支，无码料直接进入弹窗**

```ts
const openShortBarPackDialog = (row: any) => {
  const selectedDetails = row.isCoded ? getSelectedDetailsByRow(row) : []
  if (row.isCoded && selectedDetails.length === 0) {
    ElMessage.warning('请先选择短支')
    return
  }

  selectedPackRow.value = row
  shortBarPackForm.value = {
    palletNo: '',
    team: currentTeam.value || '包装现场',
    goodQty: row.isCoded
      ? selectedDetails.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)
      : Number(row.qty || 0),
    packQty: row.isCoded
      ? selectedDetails.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)
      : Number(row.qty || 0)
  }
  shortBarPackDialogVisible.value = true
}
```

- [ ] **Step 2: 保持右上角装托主表单选规则不变**

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

### Task 3: 按物料类型切换弹窗字段

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 有码料显示只读良品数量**

```vue
<div v-if="selectedPackRow.isCoded" class="short-bar-pack-line">
  良品数量：{{ shortBarPackForm.goodQty }}
</div>
```

- [ ] **Step 2: 无码料显示可编辑装托数量**

```vue
<div v-else class="short-bar-pack-qty-row">
  <span class="short-bar-pack-label">装托数量：</span>
  <el-input-number
    v-model="shortBarPackForm.packQty"
    :min="1"
    :max="Number(selectedPackRow.qty || 0)"
    style="width: 220px"
  />
</div>
```

- [ ] **Step 3: 为无码料数量输入补最小样式**

```css
.short-bar-pack-qty-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
```

### Task 4: 按有码/无码分别完成扣减逻辑

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 提交前增加无码料数量校验**

```ts
if (!selectedPackRow.value.isCoded) {
  const packQty = Number(shortBarPackForm.value.packQty || 0)
  const maxQty = Number(selectedPackRow.value.qty || 0)
  if (!packQty || packQty < 1 || packQty > maxQty) {
    ElMessage.warning('请输入正确的装托数量')
    return
  }
}
```

- [ ] **Step 2: 有码料沿用短支扣减，无码料改为直接按输入数量扣减**

```ts
let packedQty = 0

if (selectedPackRow.value.isCoded) {
  const selectedIds = new Set(getSelectedDetailIds(selectedPackRow.value.id))
  if (selectedIds.size === 0) {
    ElMessage.warning('请先选择短支')
    return
  }

  packedQty = selectedPackRow.value.details
    .filter((item: any) => selectedIds.has(item.id))
    .reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)

  selectedPackRow.value.details = selectedPackRow.value.details.filter((item: any) => !selectedIds.has(item.id))
  selectedDetailIdsByRow.value[selectedPackRow.value.id] = []
} else {
  packedQty = Number(shortBarPackForm.value.packQty || 0)
}

selectedPackRow.value.qty = Math.max(0, Number(selectedPackRow.value.qty || 0) - packedQty)
```

- [ ] **Step 3: 保留统一收尾逻辑**

```ts
if (selectedPackRow.value.qty <= 0) {
  const index = tableData.value.findIndex(item => item.id === selectedPackRow.value.id)
  if (index > -1) {
    tableData.value.splice(index, 1)
  }
}

shortBarPackDialogVisible.value = false
selectedPackRow.value = null
ElMessage.success('装托完成')
```

### Task 5: 验证改动

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
1. 切到“包装中”页签
2. 勾选1条有码料主表数据但不勾选短支，点击右上角装托，出现“请先选择短支”
3. 勾选有码料短支后点击装托，弹窗显示只读良品数量
4. 勾选1条无码料主表数据后点击装托，可直接弹窗
5. 无码料弹窗中可输入装托数量，且不能超过主表剩余支数
6. 有码料确认后主表数量减少，已选短支从子表移除
7. 无码料确认后主表数量按输入值减少
8. 数量减到0时，该行从包装中列表移除
```
