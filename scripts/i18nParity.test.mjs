import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const read = (relativePath) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8')

const enSource = read('src/i18n/locales/en-US.ts')
const viSource = read('src/i18n/locales/vi-VN.ts')
const task5Source = read('src/i18n/locales/task5Literals.ts')

test('recent route keys exist in en-US and vi-VN locale files', () => {
  const requiredRouteKeys = [
    'extrusion:',
    'aging:',
    'cuttingFeed:',
    'cutting:',
    'prePackaging:',
    'leaderReview:'
  ]

  const missingInEn = requiredRouteKeys.filter((key) => !enSource.includes(key))
  const missingInVi = requiredRouteKeys.filter((key) => !viSource.includes(key))

  assert.deepEqual(missingInEn, [])
  assert.deepEqual(missingInVi, [])
})

test('recent measuring and packaging literals exist in task5 locale rows', () => {
  const requiredLiterals = [
    '监视与测量设备管理',
    '模块开发中...',
    '台账管理',
    '校验项目管理',
    '校验模板管理',
    '校验任务管理',
    '校验提醒管理',
    '高级搜索/展开',
    '高级搜索/收起',
    '设备名称/管理编号',
    '生成校验任务',
    '批量修改',
    '报废/封存',
    '导出excel',
    '批量校验',
    '校验单录入',
    '规则列表',
    '自动生成校验任务',
    '量具类型',
    '管理类别',
    '校验模板',
    '管理编号',
    '出厂编号',
    '入厂日期',
    '规格型号',
    '量程',
    '分度值',
    '生产厂家',
    '计量周期',
    '校验日期',
    '有效日期',
    '校验单位',
    '证书编号',
    '计量方式',
    '使用部门',
    '使用车间',
    '具体位置',
    '责任人',
    '预警天数',
    '上传附件',
    '上传文件',
    '清空',
    '项目编号',
    '项目名称',
    '数据类型',
    '标准值',
    '测量值',
    '允许误差下限',
    '允许误差上限',
    '测量结果',
    '小数位数',
    '模板编号',
    '模板名称',
    '校准依据',
    '校验项目',
    '标准器具',
    '批量删除',
    '型号/规格',
    '提醒天数',
    '提醒颜色',
    '内部校验',
    '委外校验',
    '校验单编号',
    '量检具名称',
    '检验单状态',
    '校验结论',
    '审批人',
    '湿度',
    '来料报废'
  ]

  const missingLiterals = requiredLiterals.filter((key) => !task5Source.includes(`['${key}',`))

  assert.deepEqual(missingLiterals, [])
})
