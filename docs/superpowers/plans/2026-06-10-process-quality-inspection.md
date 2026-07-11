# 工序质检页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Vue3 和 Element Plus，完全按照参考图重构工序质检的列表页，并按照四分区要求实现质检填报表单。

**Architecture:** 
1. 列表页采用标准上下结构（搜索区 + 表格区），摒弃原有的 Tabs 结构，支持批量 OK/NG 交互。
2. 弹窗表单采用“四分区”设计（基础信息、检验项目、结果判定、备注签字），通过 `el-descriptions`、`el-table`、`el-form` 等组件组合实现清晰的填报流程。
3. 数据层目前使用 Mock 数据，提供完整的结构以支持未来接口对接。

**Tech Stack:** Vue 3 (Composition API), TypeScript, Element Plus, vue-i18n

---

### Task 1: 编写自动化回归测试脚本

**Files:**
- Create: `scripts/processQualityInspection.test.mjs`

- [ ] **Step 1: 编写测试脚本**

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const targetFile = path.resolve(__dirname, '../src/views/quality/ipqc/ProcessQualityInspection.vue')

test('ProcessQualityInspection.vue 应该包含正确的列表和表单结构', () => {
  const content = fs.readFileSync(targetFile, 'utf8')

  // 1. 列表区：搜索与按钮
  assert.ok(content.includes('v-model="searchForm.dateRange"'), 'Missing dateRange search field')
  assert.ok(content.includes('v-model="searchForm.batchNo"'), 'Missing batchNo search field')
  assert.ok(content.includes('v-model="searchForm.productName"'), 'Missing productName search field')
  assert.ok(content.includes('v-model="searchForm.lineName"'), 'Missing lineName search field')
  assert.ok(content.includes('批量 OK'), 'Missing batch OK button')
  assert.ok(content.includes('批量 NG'), 'Missing batch NG button')

  // 2. 列表区：表格字段
  assert.ok(content.includes('type="selection"'), 'Missing selection column')
  assert.ok(content.includes('label="料框编号"'), 'Missing frameNo column')
  assert.ok(content.includes('label="成品料号"'), 'Missing finishedProductNo column')
  assert.ok(content.includes('label="装框时间"'), 'Missing frameTime column')
  assert.ok(content.includes('label="质检时间"'), 'Missing inspectionTime column')

  // 3. 表单区：四分区结构
  assert.ok(content.includes('基础信息'), 'Missing base info section')
  assert.ok(content.includes('质检参数'), 'Missing inspection params section')
  assert.ok(content.includes('结果判定'), 'Missing result section')
  assert.ok(content.includes('备注及签字'), 'Missing remark and sign section')

  // 4. 表单区：关键字段与只读逻辑
  assert.ok(content.includes('<el-descriptions'), 'Should use el-descriptions for base info')
  assert.ok(content.includes('v-model="inspectionForm.result"'), 'Missing form result model')
  assert.ok(content.includes('v-model="inspectionForm.remark"'), 'Missing form remark model')
  assert.ok(content.includes('disabled'), 'Should have disabled attributes for readonly fields')
})
```

- [ ] **Step 2: 运行测试确保其失败**

Run: `node --test scripts/processQualityInspection.test.mjs`
Expected: FAIL (因为目前页面还是个空壳)

---

### Task 2: 重构列表页面 UI 及 Mock 数据

**Files:**
- Modify: `src/views/quality/ipqc/ProcessQualityInspection.vue`

- [ ] **Step 1: 替换现有的 template 结构为标准列表布局**

```vue
<template>
  <div class="page-container">
    <el-card class="full-card" shadow="never">
      <div class="search-bar">
        <el-form :model="searchForm" inline size="small">
          <el-form-item label="日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="批次号">
            <el-input v-model="searchForm.batchNo" clearable style="width: 140px" />
          </el-form-item>
          <el-form-item label="产品名称">
            <el-input v-model="searchForm.productName" clearable style="width: 140px" />
          </el-form-item>
          <el-form-item label="线体名称">
            <el-select v-model="searchForm.lineName" placeholder="请选择" clearable style="width: 140px">
              <el-option label="挤压19#线体" value="挤压19#线体" />
              <el-option label="挤压20#线体" value="挤压20#线体" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="primary" plain @click="handleBatchOK">批量 OK</el-button>
            <el-button type="danger" plain @click="handleBatchNG">批量 NG</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-container">
        <el-table :data="tableData" border stripe style="width: 100%" height="100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" fixed="left" />
          <el-table-column type="index" label="序号" width="60" align="center" fixed="left" />
          <el-table-column prop="frameNo" label="料框编号" width="120" fixed="left" />
          <el-table-column prop="batchNo" label="批次号" width="150" />
          <el-table-column prop="productName" label="产品名称" width="120" />
          <el-table-column prop="finishedProductNo" label="成品料号" width="150" />
          <el-table-column prop="process" label="工序" width="100" align="center" />
          <el-table-column prop="lineName" label="线体名称" width="130" />
          <el-table-column prop="frameTime" label="装框时间" width="160" align="center" />
          <el-table-column prop="inspectionTime" label="质检时间" width="160" align="center" />
          <el-table-column prop="latestStatus" label="最新状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.latestStatus" :type="row.latestStatus === 'OK' ? 'success' : 'danger'">
                {{ row.latestStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openInspectionDialog(row)">质检</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 弹窗占位 -->
    <el-dialog v-model="dialogVisible" title="工序质检录入" width="900px" top="5vh">
      <div class="inspection-form-placeholder">基础信息、质检参数、结果判定、备注签字区</div>
    </el-dialog>
  </div>
</template>
```

- [ ] **Step 2: 补充 Script 部分的基础逻辑**

在 `<script setup lang="ts">` 中添加响应式数据：

```typescript
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

// 列表查询
const searchForm = ref({
  dateRange: [],
  batchNo: '',
  productName: '',
  lineName: ''
})

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(13)

const selectedRows = ref<any[]>([])

// 列表数据 (Mock)
const tableData = ref([
  { id: 1, frameNo: '6m-1278', batchNo: 'JY2606120143', productName: 'BA-18', finishedProductNo: '13-C001-1367', process: '挤压', lineName: '挤压19#线体', frameTime: '2026-06-13 11:59:51', inspectionTime: '', latestStatus: 'OK' },
  { id: 2, frameNo: '6m-1305', batchNo: 'JY2606130006', productName: 'A25-02', finishedProductNo: 'P18P00-0616NZ', process: '挤压', lineName: '挤压20#线体', frameTime: '2026-06-13 11:53:12', inspectionTime: '', latestStatus: 'OK' },
  { id: 3, frameNo: '6m-0051', batchNo: 'JY2606130030', productName: 'A26-15', finishedProductNo: 'P18P01-0B02NZ', process: '挤压', lineName: '挤压16#线体', frameTime: '2026-06-13 11:47:47', inspectionTime: '', latestStatus: 'OK' },
  { id: 4, frameNo: '6m-1985', batchNo: 'JY2606130045', productName: 'A29-04', finishedProductNo: 'P18P02-0B07NZ', process: '挤压', lineName: '挤压18#线体', frameTime: '2026-06-13 11:47:29', inspectionTime: '', latestStatus: 'OK' }
])

const handleSearch = () => {}
const resetSearch = () => {
  searchForm.value = { dateRange: [], batchNo: '', productName: '', lineName: '' }
}
const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleBatchOK = () => {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要操作的数据')
  ElMessage.success('批量判定 OK 成功')
}
const handleBatchNG = () => {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要操作的数据')
  ElMessage.error('批量判定 NG 成功')
}

// 弹窗控制
const dialogVisible = ref(false)
const openInspectionDialog = (row: any) => {
  dialogVisible.value = true
}
```

- [ ] **Step 3: 补充基础 CSS 样式**

```css
<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}
.search-bar {
  margin-bottom: 16px;
}
.table-container {
  flex: 1;
  overflow: hidden;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

- [ ] **Step 4: 执行编译检查**

Run: `npm run build`
Expected: 编译通过，无语法错误。

---

### Task 3: 实现四分区质检弹窗

**Files:**
- Modify: `src/views/quality/ipqc/ProcessQualityInspection.vue`

- [ ] **Step 1: 替换 dialog 内的占位符为真实的四分区 UI**

```vue
    <el-dialog v-model="dialogVisible" title="工序质检录入" width="900px" top="5vh" destroy-on-close>
      <el-form ref="formRef" :model="inspectionForm" :rules="rules" label-width="90px">
        
        <!-- 分区一：基础信息 -->
        <div class="section-title">1. 基础信息</div>
        <el-descriptions border :column="3" size="small" class="info-desc">
          <el-descriptions-item label="料框编号">{{ currentRecord?.frameNo }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentRecord?.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentRecord?.productName }}</el-descriptions-item>
          <el-descriptions-item label="成品料号">{{ currentRecord?.finishedProductNo }}</el-descriptions-item>
          <el-descriptions-item label="工序">{{ currentRecord?.process }}</el-descriptions-item>
          <el-descriptions-item label="线体名称">{{ currentRecord?.lineName }}</el-descriptions-item>
          <el-descriptions-item label="装框时间">{{ currentRecord?.frameTime }}</el-descriptions-item>
        </el-descriptions>

        <!-- 分区二：质检参数 -->
        <div class="section-title">2. 质检参数</div>
        <el-table :data="inspectionForm.items" border size="small" style="margin-bottom: 20px;">
          <el-table-column prop="itemName" label="检验项目" width="150" />
          <el-table-column label="标准值" width="120" align="center">
            <template #default="{ row }">
              {{ row.standard }} ± {{ row.tolerance }}
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="80" align="center" />
          <el-table-column label="实际测量值" align="center">
            <template #default="{ row }">
              <el-input-number 
                v-model="row.actualValue" 
                :controls="false" 
                size="small" 
                style="width: 100%" 
                placeholder="请输入" 
                @change="calculateItemStatus(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单项判定" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'OK' ? 'success' : (row.status === 'NG' ? 'danger' : 'info')">
                {{ row.status || '-' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分区三：结果判定 -->
        <div class="section-title">3. 结果判定</div>
        <div class="result-area">
          <el-form-item label="综合判定" prop="result">
            <el-radio-group v-model="inspectionForm.result">
              <el-radio label="OK" border>OK (合格)</el-radio>
              <el-radio label="NG" border>NG (不合格)</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 分区四：备注及签字 -->
        <div class="section-title">4. 备注及签字</div>
        <div class="sign-area">
          <el-form-item label="备注说明" prop="remark">
            <el-input v-model="inspectionForm.remark" type="textarea" :rows="2" placeholder="请输入异常说明或备注信息" />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="质检人">
                <el-input v-model="inspectionForm.inspector" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="质检时间">
                <el-input v-model="inspectionForm.inspectTime" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInspection">提交质检</el-button>
      </template>
    </el-dialog>
```

- [ ] **Step 2: 在 script 中补充表单数据模型和校验逻辑**

```typescript
// 导入需要的类型
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const currentRecord = ref<any>(null)

const inspectionForm = ref({
  items: [] as any[],
  result: '',
  remark: '',
  inspector: '当前用户',
  inspectTime: ''
})

const rules = ref<FormRules>({
  result: [{ required: true, message: '请选择综合判定结果', trigger: 'change' }]
})

// 计算单项判定
const calculateItemStatus = (row: any) => {
  if (row.actualValue === undefined || row.actualValue === null) {
    row.status = ''
    return
  }
  const val = Number(row.actualValue)
  if (val >= (row.standard - row.tolerance) && val <= (row.standard + row.tolerance)) {
    row.status = 'OK'
  } else {
    row.status = 'NG'
  }
  
  // 联动综合判定
  const allFilled = inspectionForm.value.items.every(item => item.status)
  if (allFilled) {
    const hasNg = inspectionForm.value.items.some(item => item.status === 'NG')
    inspectionForm.value.result = hasNg ? 'NG' : 'OK'
  }
}

// 模拟质检项配置
const mockInspectionConfig = [
  { itemName: '长度', standard: 6000, tolerance: 5, unit: 'mm', actualValue: null, status: '' },
  { itemName: '壁厚', standard: 2.5, tolerance: 0.2, unit: 'mm', actualValue: null, status: '' },
  { itemName: '表面平整度', standard: 0.5, tolerance: 0.1, unit: 'mm/m', actualValue: null, status: '' }
]

// 修改打开弹窗逻辑
const openInspectionDialog = (row: any) => {
  currentRecord.value = row
  
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  inspectionForm.value = {
    items: JSON.parse(JSON.stringify(mockInspectionConfig)),
    result: '',
    remark: '',
    inspector: 'Admin',
    inspectTime: timeStr
  }
  dialogVisible.value = true
}

const submitInspection = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // 检查是否有未填写的实测值
      const hasEmpty = inspectionForm.value.items.some(item => item.actualValue === null || item.actualValue === undefined)
      if (hasEmpty) {
        ElMessage.warning('请填写所有检验项目的实际测量值')
        return
      }

      if (currentRecord.value) {
        currentRecord.value.latestStatus = inspectionForm.value.result
        currentRecord.value.inspectionTime = inspectionForm.value.inspectTime
      }
      ElMessage.success('质检录入成功')
      dialogVisible.value = false
    }
  })
}
```

- [ ] **Step 3: 补充四分区样式**

```css
.section-title {
  font-size: 15px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin: 20px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.section-title:first-child {
  margin-top: 0;
}
.info-desc {
  margin-bottom: 15px;
}
.result-area, .sign-area {
  background-color: var(--el-fill-color-light);
  padding: 15px 15px 1px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}
```

- [ ] **Step 4: 运行自动化测试验证需求覆盖**

Run: `node --test scripts/processQualityInspection.test.mjs`
Expected: PASS

---

### Task 4: 代码规范检查与清理

**Files:**
- Modify: `src/views/quality/ipqc/ProcessQualityInspection.vue`

- [ ] **Step 1: 清理遗留代码**

确保 `<template>` 中没有了遗留的空状态（`el-empty`），检查 `imports` 是否有未使用的变量，确保 `useTaskLiteralDomI18n()` 正常调用。

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 构建成功，无编译错误。

- [ ] **Step 3: Commit 所有更改**

```bash
git add src/views/quality/ipqc/ProcessQualityInspection.vue scripts/processQualityInspection.test.mjs
git commit -m "feat(quality): implement process quality inspection list and 4-section dialog form"
```
