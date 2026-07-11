import test from 'node:test'
import assert from 'node:assert/strict'

import { buildLiteralEntries, translateLiteralValue } from '../src/utils/taskLiteralTranslator.ts'

test('prefers exact full-text matches over short substring entries', () => {
  const entries = buildLiteralEntries({
    长: 'Length',
    长度: 'Length',
    量: 'Qty',
    订单数量: 'Order Qty'
  })

  assert.equal(translateLiteralValue('长度', entries), 'Length')
  assert.equal(translateLiteralValue('订单数量', entries), 'Order Qty')
})

test('does not partially translate when the whole string cannot be covered', () => {
  const entries = buildLiteralEntries({
    量: 'Qty'
  })

  assert.equal(translateLiteralValue('订单数量', entries), '订单数量')
})

test('translates dynamic text only when it can be fully decomposed', () => {
  const entries = buildLiteralEntries({
    '已查询': 'Queried',
    ' ': ' ',
    '1号时效炉': 'Aging Furnace 1',
    '的历史温度': 'temperature history'
  })

  assert.equal(
    translateLiteralValue('已查询 1号时效炉 的历史温度', entries),
    'Queried Aging Furnace 1 temperature history'
  )
})

test('leaves unrelated text unchanged', () => {
  const entries = buildLiteralEntries({
    查询: 'Search'
  })

  assert.equal(translateLiteralValue('ORD-2026-001', entries), 'ORD-2026-001')
})

test('translates known literals while preserving trailing machine identifiers', () => {
  const entries = buildLiteralEntries({
    '挤压工作台': 'Extrusion workbench',
    ' - ': ' - ',
    '机台 #': 'Machine #'
  })

  assert.equal(
    translateLiteralValue('挤压工作台 - 机台 #M001', entries),
    'Extrusion workbench - Machine #M001'
  )
})

test('translates exact slash-separated labels', () => {
  const entries = buildLiteralEntries({
    '成分料号/物料名称': 'Composition code/Material name'
  })

  assert.equal(
    translateLiteralValue('成分料号/物料名称', entries),
    'Composition code/Material name'
  )
})

test('translates dynamic confirmation text with safe identifiers', () => {
  const entries = buildLiteralEntries({
    '确认删除物料 ': 'Confirm deleting material ',
    ' 吗?': '?'
  })

  assert.equal(
    translateLiteralValue('确认删除物料 MAT-001 吗?', entries),
    'Confirm deleting material MAT-001?'
  )
})
