import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const file = readFileSync(new URL('../src/views/extrusion/PackagingWorkbench.vue', import.meta.url), 'utf8')

test('packaging list includes key material tag fields', () => {
  const labels = ['客户名称', '炉次号', '模具号', '挤压机台', '牌号', '班组']

  for (const label of labels) {
    assert.equal(file.includes(`label="${label}"`), true, `missing column: ${label}`)
  }
})

test('uncoded rows fully hide expand arrow icon', () => {
  assert.equal(
    file.includes('.uncoded-row :deep(.el-table__expand-icon) {\n  display: none !important;'),
    true,
    'uncoded expand arrow should be fully hidden'
  )
})
