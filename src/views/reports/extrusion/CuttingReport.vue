<template>
  <div class="report-page cutting-report">
    <el-card shadow="never" class="report-card">
      <el-form class="filter-form" :model="draftFilters" label-position="top">
        <el-form-item label="生产日期" class="date-field">
          <el-date-picker
            v-model="draftFilters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            unlink-panels
          />
        </el-form-item>
        <el-form-item label="排程编号">
          <el-input
            v-model="draftFilters.scheduleNo"
            clearable
            placeholder="请输入排程编号"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="来源料框">
          <el-input
            v-model="draftFilters.frameNo"
            clearable
            placeholder="请输入来源料框"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input
            v-model="draftFilters.productName"
            clearable
            placeholder="请输入产品名称"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="挤压批次">
          <el-input
            v-model="draftFilters.extrusionBatch"
            clearable
            placeholder="请输入挤压批次"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="排程类型">
          <el-select v-model="draftFilters.scheduleType" clearable placeholder="全部类型">
            <el-option v-for="item in scheduleTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <div class="filter-actions">
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button
            type="success"
            :icon="Download"
            :disabled="filteredRows.length === 0"
            @click="handleExport"
          >导出当前结果</el-button>
        </div>
      </el-form>

      <div class="table-container">
        <el-table
          :data="pagedRows"
          border
          stripe
          height="100%"
          empty-text="暂无符合条件的裁切生产数据"
          class="report-table"
        >
          <el-table-column type="index" label="序号" width="64" align="center" :index="tableIndex" />

          <el-table-column label="排程与料框" align="center">
            <el-table-column prop="productionDate" label="生产日期" width="112" align="center" />
            <el-table-column prop="scheduleNo" label="排程编号" width="176" show-overflow-tooltip>
              <template #default="{ row }"><span class="primary-cell">{{ row.scheduleNo }}</span></template>
            </el-table-column>
            <el-table-column prop="scheduleType" label="排程类型" width="108" align="center">
              <template #default="{ row }"><el-tag size="small" type="info" effect="plain">{{ row.scheduleType }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="frameNo" label="来源料框" width="228" show-overflow-tooltip />
            <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
          </el-table-column>

          <el-table-column label="来源追溯" align="center">
            <el-table-column prop="extrusionBatch" label="挤压批次" width="166" show-overflow-tooltip />
            <el-table-column prop="furnaceNo" label="炉次号" width="158" show-overflow-tooltip />
            <el-table-column prop="moldNo" label="模具号" width="132" show-overflow-tooltip />
            <el-table-column prop="sawMachine" label="锯台" width="118" align="center" />
            <el-table-column prop="fixedLength" label="定长(mm)" width="96" align="right" />
            <el-table-column prop="netWeight" label="来料净重(kg)" width="118" align="right">
              <template #default="{ row }">{{ formatDecimal(row.netWeight) }}</template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="裁切实绩" align="center">
            <el-table-column prop="quantity" label="来料支数" width="92" align="right">
              <template #default="{ row }">{{ formatNumber(row.quantity) }}</template>
            </el-table-column>
            <el-table-column label="已裁切" width="88" align="right">
              <template #default="{ row }"><strong>{{ formatNumber(cutQty(row)) }}</strong></template>
            </el-table-column>
            <el-table-column label="剩余未裁" width="94" align="right">
              <template #default="{ row }">{{ formatNumber(remainingQty(row)) }}</template>
            </el-table-column>
            <el-table-column prop="goodQty" label="良品" width="78" align="right" />
            <el-table-column prop="defectiveQty" label="不良品" width="82" align="right">
              <template #default="{ row }">
                <el-tag v-if="row.defectiveQty" type="danger" size="small" effect="light">{{ row.defectiveQty }}</el-tag>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column label="良品率" width="102" align="right">
              <template #default="{ row }">
                <span :class="yieldClass(rowYield(row))">{{ cutQty(row) ? formatRate(rowYield(row)) : '—' }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="时间与状态" align="center">
            <el-table-column prop="feedingTime" label="上料时间" width="168" align="center">
              <template #default="{ row }">{{ displayValue(row.feedingTime) }}</template>
            </el-table-column>
            <el-table-column prop="completionTime" label="完工时间" width="168" align="center">
              <template #default="{ row }">{{ displayValue(row.completionTime) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="96" align="center" fixed="right">
              <template #default="{ row }"><el-tag :type="statusTagType(row.status)" effect="light">{{ row.status }}</el-tag></template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>

      <div class="table-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredRows.length"
          layout="sizes, prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshRight, Download } from '@element-plus/icons-vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { exportReportWorkbook } from '@/utils/reportExport'

useTaskLiteralDomI18n()

type CuttingStatus = '待收料' | '已收料' | '已完工'
type ScheduleType = '产发物料' | '量产物料' | '重工物料'

interface CuttingReportRow {
  id: number
  productionDate: string
  scheduleNo: string
  scheduleType: ScheduleType
  frameNo: string
  productName: string
  extrusionBatch: string
  furnaceNo: string
  moldNo: string
  sawMachine: string
  fixedLength: number
  netWeight: number
  quantity: number
  goodQty: number
  defectiveQty: number
  feedingTime: string
  completionTime: string
  status: CuttingStatus
}

interface ReportFilters {
  dateRange: string[]
  scheduleNo: string
  frameNo: string
  productName: string
  extrusionBatch: string
  scheduleType: string
}

const createFilters = (): ReportFilters => ({
  dateRange: [],
  scheduleNo: '',
  frameNo: '',
  productName: '',
  extrusionBatch: '',
  scheduleType: ''
})

const sourceRows = ref<CuttingReportRow[]>([
  { id: 1, productionDate: '2026-08-10', scheduleNo: 'CQ-20260810-0001', scheduleType: '量产物料', frameNo: 'CV-A-A-L6000*W1250*H650*0251', productName: 'FC140', extrusionBatch: 'JY20260810-001', furnaceNo: '26-810-02-24-01', moldNo: 'M10-0649-200', sawMachine: 'JY-01', fixedLength: 342, netWeight: 78.4, quantity: 40, goodQty: 39, defectiveQty: 1, feedingTime: '2026-08-10 08:20:00', completionTime: '2026-08-10 10:05:00', status: '已完工' },
  { id: 2, productionDate: '2026-08-10', scheduleNo: 'CQ-20260810-0001', scheduleType: '量产物料', frameNo: 'CV-A-A-L6000*W1250*H650*0252', productName: 'FC140', extrusionBatch: 'JY20260810-001', furnaceNo: '26-810-02-24-01', moldNo: 'M10-0649-200', sawMachine: 'JY-01', fixedLength: 342, netWeight: 75.8, quantity: 38, goodQty: 38, defectiveQty: 0, feedingTime: '2026-08-10 09:10:00', completionTime: '2026-08-10 11:35:00', status: '已完工' },
  { id: 3, productionDate: '2026-08-11', scheduleNo: 'CQ-20260811-0001', scheduleType: '产发物料', frameNo: 'CV-A-A-L6000*W1250*H650*0253', productName: 'FC113', extrusionBatch: 'JY20260811-001', furnaceNo: '26-811-03-05-02', moldNo: 'M10-0721-104', sawMachine: 'JY-02', fixedLength: 130, netWeight: 52.2, quantity: 30, goodQty: 24, defectiveQty: 2, feedingTime: '2026-08-11 08:45:00', completionTime: '', status: '已收料' },
  { id: 4, productionDate: '2026-08-11', scheduleNo: 'CQ-20260811-0002', scheduleType: '重工物料', frameNo: 'CV-A-A-L6000*W1250*H650*0254', productName: 'FC49', extrusionBatch: 'JY20260810-002', furnaceNo: '26-810-06-11-03', moldNo: 'M10-0650-180', sawMachine: 'JY-07', fixedLength: 130, netWeight: 42.0, quantity: 20, goodQty: 0, defectiveQty: 0, feedingTime: '', completionTime: '', status: '待收料' },
  { id: 5, productionDate: '2026-08-11', scheduleNo: 'CQ-20260811-0003', scheduleType: '量产物料', frameNo: 'CV-A-A-L6000*W1250*H650*0255', productName: 'FC18', extrusionBatch: 'JY20260811-002', furnaceNo: '26-811-03-05-04', moldNo: 'M08-0312-101', sawMachine: 'JY-03', fixedLength: 6000, netWeight: 95.6, quantity: 32, goodQty: 31, defectiveQty: 1, feedingTime: '2026-08-11 13:20:00', completionTime: '2026-08-11 16:40:00', status: '已完工' },
  { id: 6, productionDate: '2026-08-12', scheduleNo: 'CQ-20260812-0001', scheduleType: '量产物料', frameNo: 'CV-A-A-L6000*W1250*H650*0256', productName: 'FC127', extrusionBatch: 'JY20260812-001', furnaceNo: '26-812-02-24-01', moldNo: 'M11-0216-202', sawMachine: 'JY-04', fixedLength: 5000, netWeight: 88.3, quantity: 36, goodQty: 34, defectiveQty: 2, feedingTime: '2026-08-12 07:55:00', completionTime: '2026-08-12 10:25:00', status: '已完工' },
  { id: 7, productionDate: '2026-08-12', scheduleNo: 'CQ-20260812-0002', scheduleType: '产发物料', frameNo: 'CV-A-A-L6000*W1250*H650*0257', productName: 'FC66', extrusionBatch: 'JY20260812-002', furnaceNo: '26-812-03-05-02', moldNo: 'M09-0118-773', sawMachine: 'JY-05', fixedLength: 1200, netWeight: 63.5, quantity: 28, goodQty: 18, defectiveQty: 1, feedingTime: '2026-08-12 09:30:00', completionTime: '', status: '已收料' },
  { id: 8, productionDate: '2026-08-12', scheduleNo: 'CQ-20260812-0003', scheduleType: '重工物料', frameNo: 'CV-A-A-L6000*W1250*H650*0258', productName: 'FC09', extrusionBatch: 'JY20260811-003', furnaceNo: '26-811-06-11-05', moldNo: 'M09-0441-008', sawMachine: 'JY-07', fixedLength: 850, netWeight: 37.6, quantity: 18, goodQty: 0, defectiveQty: 0, feedingTime: '', completionTime: '', status: '待收料' }
])

const draftFilters = ref<ReportFilters>(createFilters())
const appliedFilters = ref<ReportFilters>(createFilters())
const currentPage = ref(1)
const pageSize = ref(10)

const scheduleTypeOptions: ScheduleType[] = ['产发物料', '量产物料', '重工物料']

const cutQty = (row: CuttingReportRow) => row.goodQty + row.defectiveQty
const remainingQty = (row: CuttingReportRow) => Math.max(row.quantity - cutQty(row), 0)
const rowYield = (row: CuttingReportRow) => cutQty(row) > 0
  ? Number(((row.goodQty / cutQty(row)) * 100).toFixed(1))
  : 0

const filteredRows = computed(() => {
  const filters = appliedFilters.value
  const [startDate, endDate] = filters.dateRange
  const scheduleNo = filters.scheduleNo.trim().toLowerCase()
  const frameNo = filters.frameNo.trim().toLowerCase()
  const productName = filters.productName.trim().toLowerCase()
  const extrusionBatch = filters.extrusionBatch.trim().toLowerCase()

  return sourceRows.value.filter(row => {
    const matchesCompleted = row.status === '已完工'
    const matchesDate = (!startDate || row.productionDate >= startDate) && (!endDate || row.productionDate <= endDate)
    const matchesScheduleNo = !scheduleNo || row.scheduleNo.toLowerCase().includes(scheduleNo)
    const matchesFrameNo = !frameNo || row.frameNo.toLowerCase().includes(frameNo)
    const matchesProductName = !productName || row.productName.toLowerCase().includes(productName)
    const matchesExtrusionBatch = !extrusionBatch || row.extrusionBatch.toLowerCase().includes(extrusionBatch)
    const matchesType = !filters.scheduleType || row.scheduleType === filters.scheduleType
    return matchesCompleted
      && matchesDate
      && matchesScheduleNo
      && matchesFrameNo
      && matchesProductName
      && matchesExtrusionBatch
      && matchesType
  })
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const summary = computed(() => {
  const rows = filteredRows.value
  const inputQty = rows.reduce((sum, row) => sum + row.quantity, 0)
  const goodQty = rows.reduce((sum, row) => sum + row.goodQty, 0)
  const defectiveQty = rows.reduce((sum, row) => sum + row.defectiveQty, 0)
  const totalCutQty = goodQty + defectiveQty
  const yieldRate = totalCutQty > 0 ? Number(((goodQty / totalCutQty) * 100).toFixed(1)) : 0
  const completedFrames = rows.filter(row => row.status === '已完工').length
  const netWeight = rows.reduce((sum, row) => sum + row.netWeight, 0)
  return { inputQty, goodQty, defectiveQty, totalCutQty, yieldRate, completedFrames, netWeight }
})

const formatNumber = (value: number) => new Intl.NumberFormat('zh-CN').format(value)
const formatDecimal = (value: number) => new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
const formatRate = (value: number) => `${value.toFixed(1)}%`
const displayValue = (value: string) => value || '—'
const yieldClass = (rate: number) => rate >= 98 ? 'rate-good' : rate >= 95 ? 'rate-warning' : 'rate-danger'

const statusTagType = (status: CuttingStatus): 'success' | 'warning' | 'info' => {
  if (status === '已完工') return 'success'
  if (status === '已收料') return 'warning'
  return 'info'
}

const tableIndex = (index: number) => (currentPage.value - 1) * pageSize.value + index + 1

const handleSearch = () => {
  appliedFilters.value = { ...draftFilters.value, dateRange: [...draftFilters.value.dateRange] }
  currentPage.value = 1
  ElMessage.success(`已查询到 ${filteredRows.value.length} 条料框记录`)
}

const handleReset = () => {
  draftFilters.value = createFilters()
  appliedFilters.value = createFilters()
  currentPage.value = 1
}

const handleExport = () => {
  if (!filteredRows.value.length) {
    ElMessage.warning('当前筛选条件下没有可导出的数据')
    return
  }

  exportReportWorkbook(`裁切生产报表_${new Date().toISOString().slice(0, 10)}`, [
    {
      name: '指标汇总',
      rows: [
        { 指标: '来源料框数', 数值: filteredRows.value.length, 单位: '框' },
        { 指标: '来料总数', 数值: summary.value.inputQty, 单位: '支' },
        { 指标: '已裁切总数', 数值: summary.value.totalCutQty, 单位: '支' },
        { 指标: '良品数', 数值: summary.value.goodQty, 单位: '支' },
        { 指标: '不良品数', 数值: summary.value.defectiveQty, 单位: '支' },
        { 指标: '综合良品率', 数值: summary.value.yieldRate, 单位: '%' },
        { 指标: '完工料框', 数值: summary.value.completedFrames, 单位: '框' },
        { 指标: '来料净重', 数值: Number(summary.value.netWeight.toFixed(1)), 单位: 'kg' }
      ],
      columnWidths: [18, 16, 10]
    },
    {
      name: '料框生产明细',
      rows: filteredRows.value.map(row => ({
        生产日期: row.productionDate,
        排程编号: row.scheduleNo,
        排程类型: row.scheduleType,
        来源料框: row.frameNo,
        产品名称: row.productName,
        挤压批次: row.extrusionBatch,
        炉次号: row.furnaceNo,
        模具号: row.moldNo,
        锯台: row.sawMachine,
        定长_mm: row.fixedLength,
        来料净重_kg: row.netWeight,
        来料支数: row.quantity,
        已裁切: cutQty(row),
        剩余未裁: remainingQty(row),
        良品: row.goodQty,
        不良品: row.defectiveQty,
        良品率: cutQty(row) ? rowYield(row) : '',
        上料时间: row.feedingTime,
        完工时间: row.completionTime,
        状态: row.status
      })),
      columnWidths: [12, 20, 14, 32, 14, 20, 20, 18, 16, 10, 14, 12, 12, 12, 10, 10, 10, 20, 20, 12]
    }
  ])
  ElMessage.success('裁切生产报表已导出')
}
</script>

<style scoped>
.report-page {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  background: var(--bg-primary);
}

.report-card { height: 100%; border: 1px solid var(--border-subtle); border-radius: 4px; }
:deep(.report-card > .el-card__body) { min-height: 0; height: 100%; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; }
.filter-form { display: grid; grid-template-columns: minmax(260px, 1.35fr) repeat(4, minmax(150px, 1fr)); gap: 12px; align-items: end; }
.filter-form :deep(.el-form-item) { margin-bottom: 14px; }
.filter-form :deep(.el-form-item__label) { padding-bottom: 6px; color: var(--text-secondary); line-height: 1.2; }
.filter-form :deep(.el-date-editor), .filter-form :deep(.el-select), .filter-form :deep(.el-input) { width: 100%; }
.filter-actions { grid-column: span 3; display: flex; justify-content: flex-end; gap: 8px; padding-bottom: 14px; white-space: nowrap; }

.table-container { min-height: 0; flex: 1; }
.report-table { width: 100%; }
:deep(.report-table .el-table__row td) { height: 46px; }
.primary-cell { color: var(--text-primary); font-weight: 500; }
.rate-good { color: #15803d; font-weight: 600; }
.rate-warning { color: #b45309; font-weight: 600; }
.rate-danger { color: #dc2626; font-weight: 600; }
.table-footer { margin-top: 16px; display: flex; justify-content: flex-end; }

@media (max-width: 1280px) {
  .filter-form { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .filter-actions { grid-column: 1 / -1; justify-content: flex-start; }
}

@media (max-width: 900px) {
  .report-page { padding: 12px; }
  .filter-form { grid-template-columns: 1fr 1fr; }
  .date-field { grid-column: span 2; }
}

@media (max-width: 560px) {
  .filter-form { grid-template-columns: 1fr; }
  .date-field { grid-column: auto; }
  .filter-actions { grid-column: auto; }
  .filter-actions { flex-wrap: wrap; }
}
</style>
