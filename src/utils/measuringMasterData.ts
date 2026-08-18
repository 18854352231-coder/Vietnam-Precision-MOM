import { ref } from 'vue'

export interface CalibrationProjectRecord {
  projectCode: string
  projectName: string
  dataType: string
  standardValue: string
  measuredValue: string
  lowerLimit: string
  upperLimit: string
  result: string
  decimals: string
  status: string
  remark: string
}

export interface MeasuringLedgerRecord {
  category: string
  usage: string
  manageClass: string
  template: string
  manageCode: string
  factoryCode: string
  inDate: string
  name: string
  spec: string
  range: string
  divValue: string
  material: string
  manufacturer: string
  cycle: string
  calibDate: string
  validDate: string
  calibOrg: string
  certNo: string
  method: string
  status: string
  department: string
  workshop: string
  team: string
  location: string
  owner: string
  warnDays: string
  remark: string
  [key: string]: unknown
}

// 监视与测量模块共用同一份主数据，确保模板选择结果与来源页面保持一致。
export const calibrationProjectRecords = ref<CalibrationProjectRecord[]>([
  { projectCode: '0504', projectName: 'B/C面垂直度/mm（A-底面；B-前竖面；C-侧面）', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '0.00', upperLimit: '0.03', result: '误差', decimals: '2', status: '确认', remark: '垂直度检具' },
  { projectCode: 'PJ-002', projectName: '示值误差', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '-0.02', upperLimit: '0.02', result: '误差', decimals: '2', status: '确认', remark: '游标卡尺' },
  { projectCode: 'PJ-003', projectName: '重复性', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '0.00', upperLimit: '0.01', result: '误差', decimals: '2', status: '确认', remark: '游标卡尺' },
  { projectCode: 'PJ-004', projectName: '称量误差', dataType: '数值', standardValue: '10.00', measuredValue: '-', lowerLimit: '-0.01', upperLimit: '0.01', result: '误差', decimals: '2', status: '确认', remark: '30kg电子秤' },
  { projectCode: 'PJ-005', projectName: '温度示值误差', dataType: '数值', standardValue: '25.0', measuredValue: '-', lowerLimit: '-0.5', upperLimit: '0.5', result: '误差', decimals: '1', status: '确认', remark: '温湿度计' }
])

export const measuringLedgerRecords = ref<MeasuringLedgerRecord[]>([
  {
    category: '长度', usage: '量具', manageClass: 'B', template: '游标卡尺', manageCode: 'LJ-001',
    factoryCode: 'YC240315', inDate: '2024-03-20', name: '数显游标卡尺', spec: '0-150mm', range: '0-150mm', divValue: '0.01mm',
    material: '不锈钢', manufacturer: '桂林广陆', cycle: '12', calibDate: '2026-03-18', validDate: '2027-03-17',
    calibOrg: '品保部', certNo: 'NJ26031801', method: '内校', status: '使用中', department: '生产部',
    workshop: '机加工', team: 'A班', location: '检验台1', owner: '阮文安', warnDays: '227', remark: '-'
  },
  {
    category: '质量', usage: '量具', manageClass: 'A', template: '电子秤30kg', manageCode: 'ZL-003',
    factoryCode: 'ES250108', inDate: '2025-01-12', name: '电子秤', spec: '30kg/10g', range: '0-30kg', divValue: '10g',
    material: '不锈钢', manufacturer: '英展', cycle: '6', calibDate: '2026-02-10', validDate: '2026-08-09',
    calibOrg: '越南计量院', certNo: 'VMI-260210-36', method: '外校', status: '使用中', department: '仓储部',
    workshop: '成品仓', team: '白班', location: '收货区', owner: '陈氏兰', warnDays: '7', remark: '即将到期'
  },
  {
    category: '温度', usage: '量具', manageClass: 'A', template: '数字温湿度计', manageCode: 'WD-002',
    factoryCode: 'TH230921', inDate: '2023-09-25', name: '数字温湿度计', spec: 'TH-101B', range: '-20-60℃', divValue: '0.1℃',
    material: '塑料', manufacturer: '德图', cycle: '12', calibDate: '2025-08-01', validDate: '2026-07-31',
    calibOrg: '越南计量院', certNo: 'VMI-250801-12', method: '外校', status: '校验中', department: '品保部',
    workshop: '实验室', team: '检测组', location: '环境监测点', owner: '黎明俊', warnDays: '0', remark: '已送外校'
  },
  {
    category: '专用检具', usage: '检具', manageClass: 'C', template: '垂直度检具', manageCode: 'JY-006',
    factoryCode: 'XC-JY-006', inDate: '2024-06-08', name: '垂直度检具', spec: '200×150mm', range: '-', divValue: '-',
    material: '工具钢', manufacturer: '创新精密', cycle: '12', calibDate: '2025-06-15', validDate: '2026-06-14',
    calibOrg: '品保部', certNo: 'NJ25061506', method: '内校', status: '封存', department: '品保部',
    workshop: '计量室', team: '检测组', location: '检具柜2', owner: '王若瑾', warnDays: '-', remark: '待维修确认'
  }
])
