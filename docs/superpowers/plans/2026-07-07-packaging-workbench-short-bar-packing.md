# Packaging Workbench Short Bar Packing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在包装工作台 `包装中` 页签支持短支多选装托，点击主表 `装托` 后弹出新的截图样式装托弹窗，并在确认后扣减主表与子表数据。

**Architecture:** 仅修改 `src/views/extrusion/PackagingWorkbench.vue`。在有码料展开子表中增加短支选择状态，在主表 `包装中` 行的 `装托` 按钮前增加选择校验，并新增一套独立于旧标识卡预览流程的短支装托弹窗与确认逻辑。旧的整框装托与标识卡相关代码先保留，不作为本次主流程入口。

**Tech Stack:** Vue 3, `<script setup>`, TypeScript, Element Plus, Vite

---

### Task 1: 为包装中子表增加短支多选能力

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 在脚本区新增短支选中状态**

```ts
const selectedDetailIdsByRow = ref<Record<number, number[]>>({})

const getSelectedDetailIds = (rowId: number) => selectedDetailIdsByRow.value[rowId] || []

const handleDetailSelectionChange = (parentRowId: number, rows: any[]) => {
  selectedDetailIdsByRow.value[parentRowId] = rows.map(item => item.id)
}
```

- [ ] **Step 2: 在展开子表中仅对包装中页签显示多选框**

```vue
<el-table :data="row.details" border stripe size="small" @selection-change="rows => handleDetailSelectionChange(row.id, rows)">
  <el-table-column v-if="activeTab === '包装中'" type="selection" width="55" align="center" />
  <el-table-column type="index" label="序号" width="60" align="center" />
  <el-table-column prop="code" label="二维码编号" min-width="320" show-overflow-tooltip />
  <el-table-column prop="fixedLength" label="定长(mm)" width="100" align="right" />
</el-table>
```

- [ ] **Step 3: 约束选择仅按主行维度存储**

```ts
const getSelectedDetailsByRow = (row: any) => {
  const selectedIds = new Set(getSelectedDetailIds(row.id))
  return row.details.filter((item: any) => selectedIds.has(item.id))
}
```

### Task 2: 接管包装中主表装托入口

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 为新装托弹窗新增状态**

```ts
const selectedPackRow = ref<any>(null)
const shortBarPackDialogVisible = ref(false)
const shortBarPackForm = ref({
  palletNo: '',
  team: '',
  goodQty: 0
})
```

- [ ] **Step 2: 新增包装中短支装托入口函数**

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

- [ ] **Step 3: 将包装中按钮切到新入口**

```vue
<el-button
  v-if="row.status === '包装中'"
  link
  type="primary"
  size="small"
  @click="openShortBarPackDialog(row)"
>
  装托
</el-button>
```

### Task 3: 新增截图样式短支装托弹窗

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 在模板中新增短支装托弹窗**

```vue
<el-dialog v-model="shortBarPackDialogVisible" title="装托" width="860px">
  <div v-if="selectedPackRow" class="short-bar-pack-dialog">
    <div class="short-bar-pack-line">来料框号/栈板编号：{{ selectedPackRow.frameNo }}</div>
    <div class="short-bar-pack-line">良品数量：{{ shortBarPackForm.goodQty }}</div>
    <div class="short-bar-pack-line">班组：{{ shortBarPackForm.team }}</div>
    <div class="short-bar-pack-input-row">
      <span class="short-bar-pack-label">完工框号/栈板编号：</span>
      <el-input v-model="shortBarPackForm.palletNo" placeholder="请扫描/手工录入料框二维码" />
      <el-button type="primary" @click="generateShortBarPalletNo">生成栈板号</el-button>
    </div>
  </div>
  <template #footer>
    <el-button @click="shortBarPackDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="confirmShortBarPack">确定</el-button>
  </template>
</el-dialog>
```

- [ ] **Step 2: 补充最小样式，使其接近现场截图**

```css
.short-bar-pack-dialog {
  padding: 8px 16px 24px;
}

.short-bar-pack-line {
  margin-bottom: 24px;
  color: #606266;
  font-size: 16px;
}

.short-bar-pack-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.short-bar-pack-label {
  flex-shrink: 0;
  color: #606266;
}
```

- [ ] **Step 3: 提供生成栈板号的最小逻辑**

```ts
const generateShortBarPalletNo = () => {
  shortBarPackForm.value.palletNo = `JM-${String(Date.now()).slice(-4)}`
}
```

### Task 4: 实现确认装托后的扣减与清理

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 编写确认装托逻辑**

```ts
const confirmShortBarPack = () => {
  if (!selectedPackRow.value) return
  if (!shortBarPackForm.value.palletNo) {
    ElMessage.warning('请输入完工框号/栈板编号')
    return
  }

  const selectedIds = new Set(getSelectedDetailIds(selectedPackRow.value.id))
  if (selectedIds.size === 0) {
    ElMessage.warning('请先选择短支')
    return
  }

  const packedQty = selectedPackRow.value.details
    .filter((item: any) => selectedIds.has(item.id))
    .reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)

  selectedPackRow.value.details = selectedPackRow.value.details.filter((item: any) => !selectedIds.has(item.id))
  selectedPackRow.value.qty = Math.max(0, Number(selectedPackRow.value.qty || 0) - packedQty)
  selectedDetailIdsByRow.value[selectedPackRow.value.id] = []

  if (selectedPackRow.value.qty <= 0 || selectedPackRow.value.details.length === 0) {
    const index = tableData.value.findIndex(item => item.id === selectedPackRow.value.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
  }

  shortBarPackDialogVisible.value = false
  selectedPackRow.value = null
  ElMessage.success('装托完成')
}
```

- [ ] **Step 2: 关闭弹窗时避免残留状态**

```ts
const closeShortBarPackDialog = () => {
  shortBarPackDialogVisible.value = false
  selectedPackRow.value = null
}
```

- [ ] **Step 3: 将弹窗取消按钮切到统一关闭逻辑**

```vue
<el-button @click="closeShortBarPackDialog">取消</el-button>
```

### Task 5: 回归验证

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

- [ ] **Step 2: 运行构建验证**

Run:

```bash
npm run build
```

Expected:

```text
vite build 成功
```

- [ ] **Step 3: 手工验证关键路径**

```text
1. 切到包装工作台“包装中”页签
2. 展开有码料行，确认子表出现多选框
3. 勾选多根短支后点击主表“装托”
4. 确认弹出新的截图样式装托弹窗
5. 不填写完工框号/栈板编号时点击确定，出现提示
6. 生成或录入栈板号后点击确定，提示“装托完成”
7. 确认主表支数减少，子表已选短支被移除
8. 若该行短支清空，确认该行从包装中列表消失
```
