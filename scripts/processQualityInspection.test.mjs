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
  assert.ok(content.includes('1. 基础信息'), 'Missing base info section')
  assert.ok(content.includes('2. 质检参数'), 'Missing inspection params section')
  assert.ok(content.includes('3. 结果判定'), 'Missing result section')
  assert.ok(content.includes('4. 备注及签字'), 'Missing remark and sign section')

  // 4. 表单区：关键字段与只读逻辑
  assert.ok(content.includes('<el-descriptions'), 'Should use el-descriptions for base info')
  assert.ok(content.includes('v-model="inspectionForm.result"'), 'Missing form result model')
  assert.ok(content.includes('v-model="inspectionForm.remark"'), 'Missing form remark model')
  assert.ok(content.includes('disabled'), 'Should have disabled attributes for readonly fields')
})
