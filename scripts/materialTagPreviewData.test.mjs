import test from 'node:test'
import assert from 'node:assert/strict'

import { buildMaterialTagPreviewData } from '../src/utils/materialTagPreviewData.ts'

test('normalizes packaging rows into the same material tag fields used by cutting labels', () => {
  const preview = buildMaterialTagPreviewData({
    source: {
      frameNo: 'F-2605003',
      batchNo: 'EB-20260502-003',
      customerCode: 'CUST-C',
      customerName: '客户C',
      productNo: 'P-3003',
      productName: '边框型材B',
      qty: 80,
      fixedLength: 6000,
      furnaceNo: 'F-2026-003',
      moldNo: 'M09-0118-773',
      extrusionMachine: 'JY-21',
      alloy: '6005A',
      productionType: '量产'
    },
    shiftTeam: '包装甲班'
  })

  assert.deepEqual(preview, {
    customerCode: 'CUST-C',
    customerName: '客户C',
    productName: '边框型材B',
    extrusionBatch: 'EB-20260502-003',
    furnaceNo: 'F-2026-003',
    moldNo: 'M09-0118-773',
    materialQty: 80,
    frameNo: 'F-2605003',
    fixedLength: 6000,
    extrusionMachine: 'JY-21',
    shiftTeam: '包装甲班',
    alloy: '6005A',
    productionType: '量产',
    isPD: false,
    isMassProduction: true,
    isHeavyIndustry: false
  })
})

test('falls back to alternate field names so cutting and packaging can share one schema', () => {
  const preview = buildMaterialTagPreviewData({
    source: {
      frameNo: '6m-0979',
      extrusionBatchNo: 'JY2603070002',
      customerCode: 'C009887',
      customerName: '客户A',
      productName: 'SR-34',
      materialQty: 100,
      fixedLength: 130,
      furnaceNo: '25-412-06-11-03',
      moldNo: '999#',
      extrusionMachine: 'JY-07',
      alloy: '6R02',
      productionType: '试产'
    },
    shiftTeam: '裁切A06班'
  })

  assert.equal(preview.extrusionBatch, 'JY2603070002')
  assert.equal(preview.materialQty, 100)
  assert.equal(preview.shiftTeam, '裁切A06班')
  assert.equal(preview.isPD, true)
  assert.equal(preview.isMassProduction, false)
})
