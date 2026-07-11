# Process Document Dialog Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一各工作台里的“查看工艺文件”按钮，使其都复用包装工作台的工艺文件弹窗交互。

**Architecture:** 直接复用现有的 `ProcessDocumentDialog.vue`，不新增弹窗组件，不改系统管理页 `ProcessFiles.vue`。每个工作台只补充自己的弹窗可见状态、产品上下文和打开逻辑，并移除旧的提示框或假表单分支。

**Tech Stack:** Vue 3, `<script setup>`, TypeScript, Element Plus, Node built-in test runner (`node --test`)

---

### Task 1: 建立统一回归检查

**Files:**
- Create: `D:/越南MOM/MOM/scripts/processDocumentDialogIntegration.test.mjs`
- Test: `D:/越南MOM/MOM/scripts/processDocumentDialogIntegration.test.mjs`

- [ ] **Step 1: 写一个会先失败的静态回归测试**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (relativePath) =>
  readFileSync(resolve('D:/越南MOM/MOM', relativePath), 'utf8')

test('all targeted workbenches reuse ProcessDocumentDialog', () => {
  const files = [
    ['src/views/extrusion/PackagingWorkbench.vue', 'process-type="extrusion"'],
    ['src/views/extrusion/CuttingWorkbench.vue', 'process-type="extrusion"'],
    ['src/views/extrusion/SawingWorkbench.vue', 'process-type="extrusion"'],
    ['src/views/extrusion/ExtrusionWorkbench.vue', 'process-type="extrusion"'],
    ['src/views/casting/MeltingWorkbench.vue', 'process-type="casting"']
  ]

  for (const [file, processTypeMarker] of files) {
    const source = read(file)
    assert.equal(source.includes("import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'"), true, `${file} should import ProcessDocumentDialog`)
    assert.equal(source.includes('<ProcessDocumentDialog'), true, `${file} should render ProcessDocumentDialog`)
    assert.equal(source.includes(processTypeMarker), true, `${file} should pass ${processTypeMarker}`)
  }
})

test('legacy process document placeholder logic is removed from targeted workbenches', () => {
  const cutting = read('src/views/extrusion/CuttingWorkbench.vue')
  const sawing = read('src/views/extrusion/SawingWorkbench.vue')
  const extrusion = read('src/views/extrusion/ExtrusionWorkbench.vue')
  const melting = read('src/views/casting/MeltingWorkbench.vue')

  assert.equal(cutting.includes("ElMessageBox.alert('此处展示工艺文件PDF或图片'"), false)
  assert.equal(melting.includes("ElMessageBox.alert('此处展示工艺文件PDF或图片'"), false)
  assert.equal(sawing.includes("currentGenericOperation.value.key === 'processDoc'"), false)
  assert.equal(extrusion.includes("currentGenericOperation.value.key === 'processDoc'"), false)
})
```

- [ ] **Step 2: 运行测试并确认它先失败**

Run:

```bash
node --test scripts/processDocumentDialogIntegration.test.mjs
```

Expected:

```text
FAIL
... should import ProcessDocumentDialog
... ElMessageBox.alert('此处展示工艺文件PDF或图片'
... currentGenericOperation.value.key === 'processDoc'
```

- [ ] **Step 3: 提交测试脚手架**

```bash
git add scripts/processDocumentDialogIntegration.test.mjs
git commit -m "test: add process document dialog integration checks"
```

### Task 2: 将裁切工作台切换到统一弹窗

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/CuttingWorkbench.vue`
- Test: `D:/越南MOM/MOM/scripts/processDocumentDialogIntegration.test.mjs`

- [ ] **Step 1: 在模板中挂接统一弹窗**

在 `CuttingWorkbench.vue` 的根模板末尾加入：

```vue
<ProcessDocumentDialog
  v-model="processDocDialogVisible"
  process-type="extrusion"
  :product-no="processDocContext.productNo"
  :product-name="processDocContext.productName"
/>
```

- [ ] **Step 2: 在脚本中引入组件并补充状态**

在 `script setup` 中加入：

```ts
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'

const processDocDialogVisible = ref(false)
const processDocContext = ref({
  productNo: '',
  productName: ''
})
```

- [ ] **Step 3: 用真实弹窗替换旧提示框**

将原来的：

```ts
const viewProcessDocument = () => {
  ElMessageBox.alert('此处展示工艺文件PDF或图片', '工艺文件查看', { confirmButtonText: '关闭' })
}
```

替换为：

```ts
const viewProcessDocument = () => {
  processDocContext.value = {
    productNo: String((scheduleInfo.value as any).productNo || ''),
    productName: String(scheduleInfo.value.productName || '')
  }
  processDocDialogVisible.value = true
}
```

- [ ] **Step 4: 跑回归测试确认裁切页已接入**

Run:

```bash
node --test scripts/processDocumentDialogIntegration.test.mjs
```

Expected:

```text
FAIL
```

并且失败点只剩锯切、挤压、熔铸页面。

- [ ] **Step 5: 提交裁切页面改动**

```bash
git add src/views/extrusion/CuttingWorkbench.vue scripts/processDocumentDialogIntegration.test.mjs
git commit -m "feat: use shared process document dialog in cutting workbench"
```

### Task 3: 将锯切工作台从假表单切换到统一弹窗

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/SawingWorkbench.vue`
- Test: `D:/越南MOM/MOM/scripts/processDocumentDialogIntegration.test.mjs`

- [ ] **Step 1: 从通用操作定义中移除 processDoc 假字段**

把原来的：

```ts
{
  key: 'processDoc',
  label: '查看工艺文件',
  description: '查看当前产品对应的锯切工艺文件。',
  fields: [
    { key: 'docName', label: '文件名称', type: 'input' },
    { key: 'docVersion', label: '文件版本', type: 'input' },
    { key: 'issueDept', label: '发布部门', type: 'input' },
    { key: 'docRemark', label: '文件说明', type: 'textarea', placeholder: '文件内容说明' }
  ]
}
```

改成：

```ts
{
  key: 'processDoc',
  label: '查看工艺文件',
  description: '查看当前产品对应的锯切工艺文件。',
  fields: []
}
```

- [ ] **Step 2: 新增独立弹窗状态与打开逻辑**

在 `script setup` 中加入：

```ts
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'

const processDocDialogVisible = ref(false)
const processDocContext = ref({
  productNo: '',
  productName: ''
})
```

并在 `handleOperationClick` 中优先处理：

```ts
if (operation.key === 'processDoc') {
  processDocContext.value = {
    productNo: String((currentTask.value as any)?.productNo || ''),
    productName: String(currentTask.value?.productName || '')
  }
  processDocDialogVisible.value = true
  return
}
```

- [ ] **Step 3: 删除旧的 processDoc 假表单分支**

删除这段旧逻辑：

```ts
if (operation.key === 'processDoc') {
  genericForm.value.docName = currentTask.value ? `${currentTask.value.productName}_锯切工艺.pdf` : '通用锯切工艺.pdf'
  genericForm.value.docVersion = 'V1.0'
  genericForm.value.issueDept = '工艺管理部'
  genericForm.value.docRemark = '当前产品对应锯切SOP文件。'
}
```

以及这段提交分支：

```ts
if (currentGenericOperation.value.key === 'processDoc') {
  ElMessage.success('工艺文件已打开查看')
} else {
  ElMessage.success(`${currentGenericOperation.value.label} 操作已完成`)
}
```

替换为：

```ts
ElMessage.success(`${currentGenericOperation.value.label} 操作已完成`)
```

- [ ] **Step 4: 在模板末尾挂接共享弹窗**

```vue
<ProcessDocumentDialog
  v-model="processDocDialogVisible"
  process-type="extrusion"
  :product-no="processDocContext.productNo"
  :product-name="processDocContext.productName"
/>
```

- [ ] **Step 5: 跑回归测试确认锯切页通过**

Run:

```bash
node --test scripts/processDocumentDialogIntegration.test.mjs
```

Expected:

```text
FAIL
```

并且失败点只剩挤压、熔铸页面。

- [ ] **Step 6: 提交锯切页面改动**

```bash
git add src/views/extrusion/SawingWorkbench.vue scripts/processDocumentDialogIntegration.test.mjs
git commit -m "feat: use shared process document dialog in sawing workbench"
```

### Task 4: 将挤压工作台从假表单切换到统一弹窗

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue`
- Test: `D:/越南MOM/MOM/scripts/processDocumentDialogIntegration.test.mjs`

- [ ] **Step 1: 收缩 processDoc 定义为纯入口**

将：

```ts
{
  key: 'processDoc',
  label: '查看工艺文件',
  description: '查看当前产品对应的挤压 SOP、SIP、POP 或临时文件。',
  fields: [
    { key: 'docName', label: '文件名称', type: 'input' },
    { key: 'docVersion', label: '文件版本', type: 'input' },
    { key: 'issueDept', label: '发布部门', type: 'input' },
    { key: 'docRemark', label: '文件说明', type: 'textarea', placeholder: '文件内容说明' }
  ]
}
```

改为：

```ts
{
  key: 'processDoc',
  label: '查看工艺文件',
  description: '查看当前产品对应的挤压 SOP、SIP、POP 或临时文件。',
  fields: []
}
```

- [ ] **Step 2: 加入共享弹窗状态和上下文**

```ts
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'

const processDocDialogVisible = ref(false)
const processDocContext = ref({
  productNo: '',
  productName: ''
})
```

- [ ] **Step 3: 在操作点击入口中独立打开弹窗**

在 `handleOperationClick` 中加入：

```ts
if (operation.key === 'processDoc') {
  processDocContext.value = {
    productNo: String((currentTask.value as any)?.productNo || ''),
    productName: String(currentTask.value?.productName || '')
  }
  processDocDialogVisible.value = true
  return
}
```

并删除旧的默认值分支：

```ts
if (operation.key === 'processDoc') {
  genericForm.value.docName = currentTask.value ? `${currentTask.value.productName}_挤压工艺.pdf` : '通用挤压工艺.pdf'
  genericForm.value.docVersion = 'V1.2'
  genericForm.value.issueDept = '工艺管理部'
  genericForm.value.docRemark = '当前产品对应挤压 SOP/SIP/POP 合集。'
}
```

- [ ] **Step 4: 删除旧提交提示并挂接共享弹窗**

把：

```ts
if (currentGenericOperation.value.key === 'processDoc') {
  ElMessage.success('工艺文件已打开查看')
} else {
  operationState.value[currentGenericOperation.value.key] = true
  ElMessage.success(`${currentGenericOperation.value.label} 已完成`)
}
```

改为：

```ts
operationState.value[currentGenericOperation.value.key] = true
ElMessage.success(`${currentGenericOperation.value.label} 已完成`)
```

并在模板末尾加入：

```vue
<ProcessDocumentDialog
  v-model="processDocDialogVisible"
  process-type="extrusion"
  :product-no="processDocContext.productNo"
  :product-name="processDocContext.productName"
/>
```

- [ ] **Step 5: 跑回归测试确认挤压页通过**

Run:

```bash
node --test scripts/processDocumentDialogIntegration.test.mjs
```

Expected:

```text
FAIL
```

并且失败点只剩熔铸页面。

- [ ] **Step 6: 提交挤压页面改动**

```bash
git add src/views/extrusion/ExtrusionWorkbench.vue scripts/processDocumentDialogIntegration.test.mjs
git commit -m "feat: use shared process document dialog in extrusion workbench"
```

### Task 5: 将熔铸工作台切换到统一弹窗并完成验收

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/casting/MeltingWorkbench.vue`
- Test: `D:/越南MOM/MOM/scripts/processDocumentDialogIntegration.test.mjs`

- [ ] **Step 1: 在模板中挂接 casting 弹窗**

```vue
<ProcessDocumentDialog
  v-model="processDocDialogVisible"
  process-type="casting"
  :product-no="processDocContext.productNo"
  :product-name="processDocContext.productName"
/>
```

- [ ] **Step 2: 引入共享组件并补充上下文状态**

```ts
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'

const processDocDialogVisible = ref(false)
const processDocContext = ref({
  productNo: '',
  productName: ''
})
```

- [ ] **Step 3: 替换提示框逻辑为真实弹窗**

将：

```ts
const viewProcessDocument = () => {
  ElMessageBox.alert('此处展示工艺文件PDF或图片', '工艺文件查看', { confirmButtonText: '关闭' })
}
```

改为：

```ts
const viewProcessDocument = () => {
  processDocContext.value = {
    productNo: '',
    productName: String((selectedScheduleRow.value as any)?.productName || '')
  }
  processDocDialogVisible.value = true
}
```

如果后续发现当前文件内已有稳定的产品名称来源，可把 `selectedScheduleRow.value?.productName` 换成实际字段，但空值打开必须保留。

- [ ] **Step 4: 跑最终回归和基础构建**

Run:

```bash
node --test scripts/processDocumentDialogIntegration.test.mjs
npm run build
```

Expected:

```text
PASS
vite build completed successfully
```

- [ ] **Step 5: 检查改动文件诊断**

检查以下文件无新增诊断错误：

```text
src/views/extrusion/CuttingWorkbench.vue
src/views/extrusion/SawingWorkbench.vue
src/views/extrusion/ExtrusionWorkbench.vue
src/views/casting/MeltingWorkbench.vue
```

- [ ] **Step 6: 提交最终改动**

```bash
git add src/views/extrusion/CuttingWorkbench.vue src/views/extrusion/SawingWorkbench.vue src/views/extrusion/ExtrusionWorkbench.vue src/views/casting/MeltingWorkbench.vue scripts/processDocumentDialogIntegration.test.mjs
git commit -m "feat: unify process document dialogs across workbenches"
```

## Self-Review

- 规格覆盖检查：计划覆盖了裁切、锯切、挤压、熔铸四个需要改造的工作台，保留包装工作台为基准实现，未触碰系统管理页，符合规格范围。
- 占位符检查：没有使用 TBD、TODO 或“后续补充”类空步骤；每个任务都给了明确文件、命令和代码片段。
- 一致性检查：所有工作台统一使用 `ProcessDocumentDialog`、`processDocDialogVisible`、`processDocContext` 和对应 `process-type` 传参，命名保持一致。
