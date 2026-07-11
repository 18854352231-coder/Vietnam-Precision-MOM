# 工艺文件时效制度字段 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在工艺文件页面中，当 SOP 勾选“是否时效”时要求手动填写“时效制度”，并在列表中展示该字段。

**Architecture:** 继续沿用 `ProcessFiles.vue` 的单文件页面结构，在现有表单模型上新增 `agingProgram` 字段，通过条件渲染和提交校验实现业务规则，同时扩展 mock 数据和列表列展示。实现范围严格收敛在工艺文件页面，不引入新的状态管理、接口层或组件拆分。

**Tech Stack:** Vue 3 `script setup`、TypeScript、Element Plus

---

### Task 1: 扩展表格展示与表单模型

**Files:**
- Modify: `d:\越南MOM\MOM\src\views\system\process-docs\ProcessFiles.vue`
- Reference: `d:\越南MOM\MOM\docs\superpowers\specs\2026-05-24-process-files-aging-program-design.md`

- [ ] **Step 1: 在工艺文件列表中新增“时效制度”列**

将两处表格中的“是否时效”列后面插入新列，规则为仅在 SOP 上显示制度内容，否则显示 `-`：

```vue
<el-table-column label="时效制度" width="160" show-overflow-tooltip>
  <template #default="scope">
    <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">
      {{ scope.row.isAging ? (scope.row.agingProgram || '-') : '-' }}
    </span>
    <span v-else>-</span>
  </template>
</el-table-column>
```

- [ ] **Step 2: 扩展表单模型，新增 `agingProgram` 字段**

把当前表单模型从：

```ts
const form = ref({
  processType: 'extrusion',
  productName: '',
  type: 'SOP',
  isAging: false,
  isCutting: false,
  isHoldingFurnace: false,
  fileCategory: '正式文件',
  validUntil: '',
  files: []
})
```

改为：

```ts
const form = ref({
  processType: 'extrusion',
  productName: '',
  type: 'SOP',
  isAging: false,
  agingProgram: '',
  isCutting: false,
  isHoldingFurnace: false,
  fileCategory: '正式文件',
  validUntil: '',
  files: []
})
```

- [ ] **Step 3: 扩展新增与编辑时的表单初始化**

在 `handleAdd()` 中加入默认值：

```ts
form.value = {
  processType: processType.value,
  productName: '',
  type: docType.value,
  isAging: false,
  agingProgram: '',
  isCutting: false,
  isHoldingFurnace: false,
  fileCategory: '正式文件',
  validUntil: '',
  files: []
}
```

在 `handleEdit(row)` 中补齐回显：

```ts
form.value = {
  processType: processType.value,
  productName: row.productName,
  type: docType.value,
  isAging: row.isAging || false,
  agingProgram: row.agingProgram || '',
  isCutting: row.isCutting || false,
  isHoldingFurnace: row.isHoldingFurnace || false,
  fileCategory: row.fileCategory || '正式文件',
  validUntil: row.validUntil || '',
  files: []
}
```

- [ ] **Step 4: 运行诊断确认类型与模板引用无报错**

Run: 使用编辑器诊断检查 `d:\越南MOM\MOM\src\views\system\process-docs\ProcessFiles.vue`

Expected: 不出现 `agingProgram` 未定义或模板绑定报错

- [ ] **Step 5: Commit**

```bash
git add src/views/system/process-docs/ProcessFiles.vue
git commit -m "feat: add aging program field model and table display"
```

### Task 2: 增加工艺文件弹窗中的条件输入与自动清空行为

**Files:**
- Modify: `d:\越南MOM\MOM\src\views\system\process-docs\ProcessFiles.vue`

- [ ] **Step 1: 在 SOP 选项下增加“时效制度”输入框**

在现有 SOP 选项块后插入条件输入项：

```vue
<el-form-item label="时效制度" v-if="form.type === 'SOP' && form.isAging">
  <el-input
    v-model="form.agingProgram"
    placeholder="请输入该产品的时效制度"
  />
</el-form-item>
```

- [ ] **Step 2: 增加取消勾选时自动清空制度值的处理函数**

在脚本中新增一个统一处理函数：

```ts
const handleAgingChange = (checked: boolean) => {
  form.value.isAging = checked
  if (!checked) {
    form.value.agingProgram = ''
  }
}
```

- [ ] **Step 3: 将“是否时效”复选框改为显式使用变更事件**

把原来的：

```vue
<el-checkbox v-model="form.isAging">是否时效</el-checkbox>
```

改为：

```vue
<el-checkbox
  :model-value="form.isAging"
  @change="handleAgingChange"
>
  是否时效
</el-checkbox>
```

- [ ] **Step 4: 运行页面诊断，确认模板事件签名与绑定正常**

Run: 使用编辑器诊断检查 `d:\越南MOM\MOM\src\views\system\process-docs\ProcessFiles.vue`

Expected: 不出现 `handleAgingChange` 未定义或 `v-model`/`model-value` 冲突报错

- [ ] **Step 5: Commit**

```bash
git add src/views/system/process-docs/ProcessFiles.vue
git commit -m "feat: show aging program input for aging sop files"
```

### Task 3: 扩展 mock 数据与保存校验

**Files:**
- Modify: `d:\越南MOM\MOM\src\views\system\process-docs\ProcessFiles.vue`

- [ ] **Step 1: 为 mock 列表数据补充 `agingProgram` 字段**

将现有 mock 数据从：

```ts
tableData.value = [
  { code: `${prefix}-${typeStr}-001`, productName: processType.value === 'extrusion' ? '铝型材-6063' : '铝棒-A级', fileName: `${typeStr}指导书_${prefix}.pdf`, version: 'V1.0', status: '有效', uploadTime: '2026-04-01 10:00', fileCategory: '正式文件', isHoldingFurnace: false, isAging: true, isCutting: true, type: typeStr },
  { code: `${prefix}-${typeStr}-002`, productName: processType.value === 'extrusion' ? '铝型材-6063' : '铝棒-A级', fileName: `临时测试${typeStr}_${prefix}.pdf`, version: 'V0.1', uploadTime: '2026-04-09 09:00', fileCategory: '临时文件', validUntil: '2026-05-09', isHoldingFurnace: false, isAging: false, isCutting: true, type: typeStr },
  { code: `${prefix}-${typeStr}-003`, productName: '特殊定制铝材-HT', fileName: `进保温炉专用${typeStr}_${prefix}.pdf`, version: 'V1.0', status: '有效', uploadTime: '2026-05-06 08:30', fileCategory: '正式文件', isHoldingFurnace: true, isAging: true, isCutting: false, type: typeStr }
]
```

改为：

```ts
tableData.value = [
  {
    code: `${prefix}-${typeStr}-001`,
    productName: processType.value === 'extrusion' ? '铝型材-6063' : '铝棒-A级',
    fileName: `${typeStr}指导书_${prefix}.pdf`,
    version: 'V1.0',
    status: '有效',
    uploadTime: '2026-04-01 10:00',
    fileCategory: '正式文件',
    isHoldingFurnace: false,
    isAging: true,
    agingProgram: 'T6 185℃×6h',
    isCutting: true,
    type: typeStr
  },
  {
    code: `${prefix}-${typeStr}-002`,
    productName: processType.value === 'extrusion' ? '铝型材-6063' : '铝棒-A级',
    fileName: `临时测试${typeStr}_${prefix}.pdf`,
    version: 'V0.1',
    uploadTime: '2026-04-09 09:00',
    fileCategory: '临时文件',
    validUntil: '2026-05-09',
    isHoldingFurnace: false,
    isAging: false,
    agingProgram: '',
    isCutting: true,
    type: typeStr
  },
  {
    code: `${prefix}-${typeStr}-003`,
    productName: '特殊定制铝材-HT',
    fileName: `进保温炉专用${typeStr}_${prefix}.pdf`,
    version: 'V1.0',
    status: '有效',
    uploadTime: '2026-05-06 08:30',
    fileCategory: '正式文件',
    isHoldingFurnace: true,
    isAging: true,
    agingProgram: 'T5 190℃×4h',
    isCutting: false,
    type: typeStr
  }
]
```

- [ ] **Step 2: 在保存逻辑中增加“时效制度必填”校验**

把当前简单保存逻辑：

```ts
const handleSave = () => {
  ElMessage.success('操作成功')
  dialogVisible.value = false
  loadTableData()
}
```

改为：

```ts
const handleSave = () => {
  if (form.value.type === 'SOP' && form.value.isAging && !form.value.agingProgram.trim()) {
    ElMessage.warning('请输入时效制度')
    return
  }

  if (form.value.type !== 'SOP' || !form.value.isAging) {
    form.value.agingProgram = ''
  }

  ElMessage.success('操作成功')
  dialogVisible.value = false
  loadTableData()
}
```

- [ ] **Step 3: 手动验证关键交互**

手动验证以下场景：

```text
1. 新建 SOP 文件，勾选“是否时效”，不填写“时效制度”，点击提交
   预期：提示“请输入时效制度”，弹窗不关闭

2. 新建 SOP 文件，勾选“是否时效”，填写“时效制度”
   预期：允许提交

3. 已填写“时效制度”后取消勾选“是否时效”
   预期：输入框消失，字段值被清空

4. 查看列表中的“时效制度”列
   预期：需要时效的 SOP 显示制度文本，不需要时效或非 SOP 显示 "-"
```

- [ ] **Step 4: 运行诊断确认无新增错误**

Run: 使用编辑器诊断检查 `d:\越南MOM\MOM\src\views\system\process-docs\ProcessFiles.vue`

Expected: 诊断为 0；保存校验与模板条件渲染均无报错

- [ ] **Step 5: Commit**

```bash
git add src/views/system/process-docs/ProcessFiles.vue
git commit -m "feat: require aging program for aging sop process files"
```

### Task 4: 最终回归与交付说明

**Files:**
- Modify: `d:\越南MOM\MOM\src\views\system\process-docs\ProcessFiles.vue`
- Reference: `d:\越南MOM\MOM\docs\superpowers\specs\2026-05-24-process-files-aging-program-design.md`

- [ ] **Step 1: 对照规格逐项回归**

逐项核对：

```text
- 勾选“是否时效”后显示“时效制度”
- 未勾选时隐藏“时效制度”
- 已勾选但未填时阻止提交
- 取消勾选时自动清空制度值
- 列表新增“时效制度”列
- 非 SOP 或不时效时显示 "-"
```

- [ ] **Step 2: 清理实现中可能残留的不一致命名**

确认以下命名保持一致：

```ts
form.value.agingProgram
row.agingProgram
handleAgingChange
```

Expected: 不出现 `agingPolicy`、`agingRule`、`agingSystem` 等混用命名

- [ ] **Step 3: 准备交付说明**

交付说明应覆盖：

```text
- 新增字段位置
- 触发规则
- 保存校验
- 列表展示规则
- 已完成的诊断检查
```

- [ ] **Step 4: Commit**

```bash
git add src/views/system/process-docs/ProcessFiles.vue docs/superpowers/specs/2026-05-24-process-files-aging-program-design.md docs/superpowers/plans/2026-05-24-process-files-aging-program.md
git commit -m "docs: finalize implementation plan for process file aging program"
```
