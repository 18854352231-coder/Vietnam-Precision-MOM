# 制程检验班长审核页签 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有制程检验页面中增加“班长审核”页签，使质检记录先进入待审核，再由班长修改检测项目数值并提交为已完成。

**Architecture:** 继续在单文件组件 [ProcessInspection.vue](file:///D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue) 内完成改造，不新增菜单或独立页面。通过扩展记录数据结构保存真实检测项目明细、增加“班长审核”页签和审核弹窗，形成“工序质检 -> 班长审核 -> 已完成”的闭环。

**Tech Stack:** Vue 3 script setup、TypeScript、Element Plus、现有 Mock 数据结构

---

### Task 1: 扩展记录数据结构并保存真实检测项目

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- Test: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`

- [ ] **Step 1: 统一记录字段命名**

在 `tableData`、`formData`、`detailData` 相关读写逻辑中统一新增以下字段：

```ts
leaderReviewer: ''
leaderReviewTime: ''
inspectionItems: [] as any[]
```

并统一 `completionStatus` 为以下三个状态：

```ts
'未完成'
'待班长审核'
'已完成'
```

- [ ] **Step 2: 扩展 Mock 列表数据**

把 `tableData` 中至少补出一条 `待班长审核` 记录和一条 `已完成` 记录，且这两类记录都带真实 `inspectionItems`。单条示例结构应类似：

```ts
{
  id: 2,
  inspectionNo: 'IPQC-20260424-102',
  batchNo: 'JY260424002',
  productName: '标准边框型材',
  moldNo: 'M18-002',
  lineName: 'JY-30',
  generateTime: '2026-04-24 09:00:00',
  inspector: '张三',
  updateTime: '2026-04-24 10:30:00',
  inspectionCount: 1,
  result: '合格',
  completionStatus: '待班长审核',
  process: '预包装',
  leaderReviewer: '',
  leaderReviewTime: '',
  inspectionItems: [
    { item: '外观', standard: 0, tolerance: 0, unit: '-', actualValue: 0, status: 'OK' }
  ]
}
```

- [ ] **Step 3: 质检提交时保存真实检测明细**

在 `submitRecord` 中提交质检时，把当前 `formData.rules` 深拷贝后写入记录的 `inspectionItems`，并为每一项补上 `status`：

```ts
const inspectionItems = formData.value.rules.map(rule => ({
  ...rule,
  status: getItemStatus(rule)
}))
```

写回时同时设置：

```ts
completionStatus: '待班长审核'
leaderReviewer: ''
leaderReviewTime: ''
inspectionItems
```

- [ ] **Step 4: 保持新增与编辑分支一致**

在 `dialogMode === 'add'` 与已有记录更新分支中都使用相同的 `inspectionItems` 写回逻辑，避免新增记录和质检记录结构不一致。

- [ ] **Step 5: 提交本任务**

```bash
git add src/views/quality/ipqc/ProcessInspection.vue
git commit -m "feat: persist inspection items for leader review"
```

### Task 2: 增加班长审核页签和列表切换逻辑

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- Test: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`

- [ ] **Step 1: 在 Tabs 中新增班长审核页签**

在现有页签后面新增：

```vue
<el-tab-pane label="班长审核" name="班长审核" />
```

位置要求：

```text
挤压IPQC -> 时效IPQC -> 裁切上料IPQC -> 裁切IPQC -> 预包装IPQC -> 班长审核
```

- [ ] **Step 2: 改造表格数据源过滤逻辑**

把 `filteredTableData` 改成：

```ts
const filteredTableData = computed(() => {
  if (activeTab.value === '班长审核') {
    return tableData.value.filter(item => item.completionStatus === '待班长审核')
  }
  return tableData.value.filter(item => item.process === activeTab.value)
})
```

- [ ] **Step 3: 在班长审核页签中展示工序字段**

给表格新增“检验工序”列，并在 `activeTab.value === '班长审核'` 时正常显示，以区分待审核记录来源：

```vue
<el-table-column prop="process" label="检验工序" width="120" align="center" />
```

- [ ] **Step 4: 调整操作列分支**

把操作列改成：

```vue
<template #default="{ row }">
  <el-button
    v-if="activeTab.value === '班长审核'"
    link
    type="warning"
    size="small"
    @click="openLeaderReviewDialog(row)"
  >
    审核
  </el-button>
  <el-button
    v-else-if="row.completionStatus === '未完成'"
    link
    type="primary"
    size="small"
    @click="openInspectDialog(row)"
  >
    质检
  </el-button>
  <el-button
    v-else
    link
    type="info"
    size="small"
    @click="viewDetail(row)"
  >
    查看
  </el-button>
</template>
```

- [ ] **Step 5: 提交本任务**

```bash
git add src/views/quality/ipqc/ProcessInspection.vue
git commit -m "feat: add leader review tab to process inspection"
```

### Task 3: 新增班长审核弹窗并支持修改检测项目数值

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- Test: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`

- [ ] **Step 1: 新增审核弹窗状态**

在脚本区新增：

```ts
const reviewDialogVisible = ref(false)
const reviewForm = ref({
  id: 0,
  inspectionNo: '',
  process: '',
  batchNo: '',
  productName: '',
  result: '',
  inspectionItems: [] as any[]
})
```

- [ ] **Step 2: 新增打开审核弹窗方法**

增加方法：

```ts
const openLeaderReviewDialog = (row: any) => {
  reviewForm.value = {
    id: row.id,
    inspectionNo: row.inspectionNo,
    process: row.process,
    batchNo: row.batchNo,
    productName: row.productName,
    result: row.result,
    inspectionItems: JSON.parse(JSON.stringify(row.inspectionItems || []))
  }
  reviewDialogVisible.value = true
}
```

- [ ] **Step 3: 新增审核结果重算方法**

新增用于班长审核弹窗的单项判定和综合判定重算：

```ts
const calculateReviewResult = () => {
  reviewForm.value.inspectionItems = reviewForm.value.inspectionItems.map(item => ({
    ...item,
    status: getItemStatus(item)
  }))

  const hasNg = reviewForm.value.inspectionItems.some(item => item.status === 'NG')
  reviewForm.value.result = hasNg ? '不合格' : '合格'
}
```

- [ ] **Step 4: 新增提交审核方法**

增加方法：

```ts
const submitLeaderReview = () => {
  const target = tableData.value.find(item => item.id === reviewForm.value.id)
  if (!target) {
    ElMessage.warning('记录不存在或已被更新')
    return
  }

  if (target.completionStatus !== '待班长审核') {
    ElMessage.warning('当前记录不能执行班长审核')
    return
  }

  if (!reviewForm.value.inspectionItems.length) {
    ElMessage.warning('缺少检测项目数据')
    return
  }

  calculateReviewResult()

  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  target.result = reviewForm.value.result
  target.inspectionItems = JSON.parse(JSON.stringify(reviewForm.value.inspectionItems))
  target.completionStatus = '已完成'
  target.leaderReviewer = '当前班长'
  target.leaderReviewTime = timeStr
  target.updateTime = timeStr

  ElMessage.success('班长审核成功')
  reviewDialogVisible.value = false
}
```

- [ ] **Step 5: 在模板中新增班长审核弹窗**

添加弹窗：

```vue
<el-dialog v-model="reviewDialogVisible" title="班长审核" width="900px" top="5vh">
  <el-descriptions border :column="2" style="margin-bottom: 20px">
    <el-descriptions-item label="质检单号">{{ reviewForm.inspectionNo }}</el-descriptions-item>
    <el-descriptions-item label="检验工序">{{ reviewForm.process }}</el-descriptions-item>
    <el-descriptions-item label="批次号">{{ reviewForm.batchNo }}</el-descriptions-item>
    <el-descriptions-item label="产品名称">{{ reviewForm.productName }}</el-descriptions-item>
    <el-descriptions-item label="质检结果">{{ reviewForm.result }}</el-descriptions-item>
  </el-descriptions>

  <div class="section-title">检测项目审核</div>
  <el-table :data="reviewForm.inspectionItems" border size="small">
    <el-table-column label="检验项目" prop="item" width="120" />
    <el-table-column label="标准值" width="120" align="center">
      <template #default="{ row }">
        {{ row.standard }} ± {{ row.tolerance }}
      </template>
    </el-table-column>
    <el-table-column label="单位" prop="unit" width="60" align="center" />
    <el-table-column label="实际测量值" align="center">
      <template #default="{ row }">
        <el-input-number
          v-model="row.actualValue"
          :controls="false"
          size="small"
          style="width: 100%"
          @change="calculateReviewResult"
        />
      </template>
    </el-table-column>
    <el-table-column label="单项判定" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 'OK' ? 'success' : row.status === 'NG' ? 'danger' : 'info'">
          {{ row.status || '-' }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>

  <template #footer>
    <el-button @click="reviewDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="submitLeaderReview">提交审核</el-button>
  </template>
</el-dialog>
```

- [ ] **Step 6: 提交本任务**

```bash
git add src/views/quality/ipqc/ProcessInspection.vue
git commit -m "feat: add leader review dialog to process inspection"
```

### Task 4: 用真实检测明细改造详情弹窗

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- Test: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`

- [ ] **Step 1: 详情优先读取 inspectionItems**

把 `viewDetail` 中随机生成规则明细的逻辑改成优先读取记录自带的 `inspectionItems`：

```ts
const viewDetail = (row: any) => {
  detailData.value = {
    ...row,
    remark: row.remark || '无异常',
    leaderReviewer: row.leaderReviewer || '',
    leaderReviewTime: row.leaderReviewTime || '',
    rules: JSON.parse(JSON.stringify(row.inspectionItems || []))
  }
  detailVisible.value = true
}
```

- [ ] **Step 2: 在详情中增加班长审核信息**

在 `el-descriptions` 中新增：

```vue
<el-descriptions-item label="班长">{{ detailData.leaderReviewer || '-' }}</el-descriptions-item>
<el-descriptions-item label="审核时间">{{ detailData.leaderReviewTime || '-' }}</el-descriptions-item>
```

- [ ] **Step 3: 让未审核记录也能正常查看**

确认 `inspectionItems` 为空时表格不报错，必要时把明细表格数据源写成：

```vue
<el-table :data="detailData.rules || []" border size="small">
```

- [ ] **Step 4: 提交本任务**

```bash
git add src/views/quality/ipqc/ProcessInspection.vue
git commit -m "feat: show leader review data in process inspection detail"
```

### Task 5: 验证流转并检查诊断

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- Test: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`

- [ ] **Step 1: 检查页面诊断**

运行最近文件诊断，确认 [ProcessInspection.vue](file:///D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue) 无新的语法或类型错误。

预期：

```text
ProcessInspection.vue diagnostics: []
```

- [ ] **Step 2: 执行构建验证**

运行：

```bash
& "D:\Node\npm.cmd" run build
```

预期：

```text
vue-tsc && vite build 成功
```

- [ ] **Step 3: 手工回归主流程**

验证以下路径：

```text
1. 工序页签未完成记录 -> 质检 -> 待班长审核
2. 班长审核页签出现该记录，并展示检验工序
3. 点击审核 -> 可修改检测项目数值 -> 提交审核
4. 记录从班长审核页签消失
5. 原工序页签中该记录变为已完成
6. 查看详情时展示真实检测项目、班长、审核时间
```

- [ ] **Step 4: 提交本任务**

```bash
git add src/views/quality/ipqc/ProcessInspection.vue
git commit -m "feat: complete leader review tab flow for process inspection"
```

## Self-Review

- **Spec coverage:** 已覆盖新增班长审核页签、待审核聚合、质检转待审核、审核弹窗修改数值、审核后回主列表、详情展示真实检测明细和班长信息。
- **Placeholder scan:** 无 TBD/TODO 类占位描述；每个任务都明确了目标字段、方法名、模板结构和验证方式。
- **Type consistency:** 全文统一使用 `leaderReviewer`、`leaderReviewTime`、`inspectionItems`、`completionStatus`，与设计文档一致。
