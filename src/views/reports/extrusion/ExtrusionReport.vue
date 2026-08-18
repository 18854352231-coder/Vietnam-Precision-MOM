<template>
  <div class="report-page extrusion-report">
    <el-card shadow="never" class="report-card">
      <el-form class="filter-form" :model="draftFilters" label-position="top">
        <el-form-item label="计划日期" class="date-field">
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
        <el-form-item label="订单编号">
          <el-input
            v-model="draftFilters.orderNo"
            clearable
            placeholder="请输入订单编号"
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
        <el-form-item label="挤压批次号">
          <el-input
            v-model="draftFilters.extrusionBatchNo"
            clearable
            placeholder="请输入挤压批次"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="合金牌号">
          <el-input
            v-model="draftFilters.alloy"
            clearable
            placeholder="请输入合金牌号"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <div class="filter-actions">
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button
            type="success"
            :icon="Download"
            :disabled="combinedRows.length === 0"
            @click="handleExport"
          >导出当前结果</el-button>
        </div>
      </el-form>

      <div class="table-container">
        <el-table
          :data="pagedCombinedRows"
          border
          stripe
          height="100%"
          empty-text="暂无符合条件的挤压与锯切数据"
          class="report-table"
        >
          <el-table-column type="index" label="序号" width="64" align="center" :index="tableIndex" />

          <el-table-column label="排程信息" align="center">
            <el-table-column prop="planDate" label="计划日期" width="112" align="center" />
            <el-table-column prop="scheduleNo" label="排程编号" width="176" show-overflow-tooltip>
              <template #default="{ row }"><span class="primary-cell">{{ row.scheduleNo }}</span></template>
            </el-table-column>
            <el-table-column prop="orderNo" label="订单编号" width="148" show-overflow-tooltip />
            <el-table-column prop="productName" label="产品名称" min-width="128" show-overflow-tooltip />
          </el-table-column>

          <el-table-column label="物料与模具" align="center">
            <el-table-column prop="alloy" label="合金牌号" width="92" align="center">
              <template #default="{ row }"><el-tag size="small" type="info" effect="plain">{{ row.alloy }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="rodMaterialNo" label="铝棒料号" width="208" show-overflow-tooltip>
              <template #default="{ row }">{{ row.hasExtrusion ? row.rodMaterialNo : '—' }}</template>
            </el-table-column>
            <el-table-column prop="rodDiameter" label="棒径(mm)" width="100" align="right">
              <template #default="{ row }">{{ row.hasExtrusion ? row.rodDiameter : '—' }}</template>
            </el-table-column>
            <el-table-column prop="rodLength" label="棒长(mm)" width="100" align="right">
              <template #default="{ row }">{{ row.hasExtrusion ? row.rodLength : '—' }}</template>
            </el-table-column>
            <el-table-column prop="moldGroupNo" label="模具组号" width="130" show-overflow-tooltip>
              <template #default="{ row }">{{ row.hasExtrusion ? row.moldGroupNo : '—' }}</template>
            </el-table-column>
            <el-table-column prop="moldNo" label="模具号" width="146" show-overflow-tooltip />
          </el-table-column>

          <el-table-column label="挤压执行" align="center">
            <el-table-column prop="extrusionBatchNo" label="挤压批次号" width="168" show-overflow-tooltip>
              <template #default="{ row }">{{ displayValue(row.extrusionBatchNo) }}</template>
            </el-table-column>
            <el-table-column prop="planQty" label="计划支数" width="100" align="right">
              <template #default="{ row }">{{ row.hasExtrusion ? formatNumber(row.planQty) : '—' }}</template>
            </el-table-column>
            <el-table-column prop="loadedQty" label="已上料" width="90" align="right">
              <template #default="{ row }">{{ row.hasExtrusion ? formatNumber(row.loadedQty) : '—' }}</template>
            </el-table-column>
            <el-table-column prop="extrudedQty" label="已挤压" width="90" align="right">
              <template #default="{ row }"><strong>{{ row.hasExtrusion ? formatNumber(row.extrudedQty) : '—' }}</strong></template>
            </el-table-column>
            <el-table-column label="待挤压" width="90" align="right">
              <template #default="{ row }">{{ row.hasExtrusion ? formatNumber(pendingQty(row)) : '—' }}</template>
            </el-table-column>
            <el-table-column prop="rejectedQty" label="剔料" width="82" align="right">
              <template #default="{ row }">
                <el-tag v-if="row.hasExtrusion && row.rejectedQty" type="danger" size="small" effect="light">{{ row.rejectedQty }}</el-tag>
                <span v-else>{{ row.hasExtrusion ? 0 : '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="挤压状态" width="96" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.hasExtrusion" :type="statusTagType(rowStatus(row))" effect="light">{{ rowStatus(row) }}</el-tag>
                <span v-else>—</span>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="锯切执行" align="center">
            <el-table-column label="锯台" width="82" align="center">
              <template #default="{ row }">{{ row.sawing?.machineNo || '—' }}</template>
            </el-table-column>
            <el-table-column label="定尺长度(mm)" width="118" align="right">
              <template #default="{ row }">{{ row.sawing?.fixedLength || '—' }}</template>
            </el-table-column>
            <el-table-column label="装框数量" width="96" align="right">
              <template #default="{ row }">{{ row.sawing ? formatNumber(row.sawing.framedQty) : '—' }}</template>
            </el-table-column>
            <el-table-column label="料框数" width="82" align="right">
              <template #default="{ row }">{{ row.sawing?.frameCount ?? '—' }}</template>
            </el-table-column>
            <el-table-column label="取样数" width="82" align="right">
              <template #default="{ row }">{{ row.sawing?.sampleCount ?? '—' }}</template>
            </el-table-column>
            <el-table-column label="报废数" width="82" align="right">
              <template #default="{ row }">{{ row.sawing?.scrapQty ?? '—' }}</template>
            </el-table-column>
            <el-table-column label="开始时间" width="168" align="center">
              <template #default="{ row }">{{ displayValue(row.sawing?.startTime || '') }}</template>
            </el-table-column>
            <el-table-column label="结束时间" width="168" align="center">
              <template #default="{ row }">{{ displayValue(row.sawing?.endTime || '') }}</template>
            </el-table-column>
            <el-table-column label="锯切状态" width="96" align="center" fixed="right">
              <template #default="{ row }">
                <el-tag v-if="row.sawing" :type="statusTagType(row.sawing.status)" effect="light">{{ row.sawing.status }}</el-tag>
                <span v-else>—</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>

      <div class="table-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="combinedRows.length"
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
import { loadSawingProductionRecords, type SawingProductionRecord } from '@/utils/sawingProductionFlow'

useTaskLiteralDomI18n()

type ExecutionStatus = '未开始' | '生产中' | '已完成'

interface ExtrusionReportRow {
  id: number
  planDate: string
  scheduleNo: string
  orderNo: string
  productName: string
  alloy: string
  rodMaterialNo: string
  rodDiameter: number
  rodLength: number
  moldGroupNo: string
  moldNo: string
  extrusionBatchNo: string
  planQty: number
  loadedQty: number
  extrudedQty: number
  rejectedQty: number
}

interface CombinedReportRow extends ExtrusionReportRow {
  hasExtrusion: boolean
  sawing: SawingProductionRecord | null
}

interface ReportFilters {
  dateRange: string[]
  scheduleNo: string
  orderNo: string
  productName: string
  extrusionBatchNo: string
  alloy: string
}

const createFilters = (): ReportFilters => ({
  dateRange: [],
  scheduleNo: '',
  orderNo: '',
  productName: '',
  extrusionBatchNo: '',
  alloy: ''
})

const sourceRows = ref<ExtrusionReportRow[]>([
  { id: 1, planDate: '2026-08-10', scheduleNo: 'JY-20260810-0001', orderNo: 'ORD-2026-0810-01', productName: 'FC18', alloy: '6063', rodMaterialNo: '20-X152-6063-0007-L1000', rodDiameter: 152, rodLength: 1000, moldGroupNo: 'M10-0649', moldNo: 'M10-0649-200', extrusionBatchNo: 'JY20260810-001', planQty: 80, loadedQty: 80, extrudedQty: 80, rejectedQty: 0 },
  { id: 2, planDate: '2026-08-10', scheduleNo: 'JY-20260810-0002', orderNo: 'ORD-2026-0810-02', productName: 'FC127', alloy: '6061', rodMaterialNo: '20-X178-6061-0021-L1200', rodDiameter: 178, rodLength: 1200, moldGroupNo: 'M10-0650', moldNo: 'M10-0650-180', extrusionBatchNo: 'JY20260810-002', planQty: 60, loadedQty: 60, extrudedQty: 55, rejectedQty: 1 },
  { id: 3, planDate: '2026-08-11', scheduleNo: 'JY-20260811-0001', orderNo: 'ORD-2026-0811-01', productName: 'FC66', alloy: '6063', rodMaterialNo: '20-X152-6063-0007-L1000', rodDiameter: 152, rodLength: 1000, moldGroupNo: 'M10-0721', moldNo: 'M10-0721-104', extrusionBatchNo: 'JY20260811-001', planQty: 45, loadedQty: 30, extrudedQty: 22, rejectedQty: 2 },
  { id: 4, planDate: '2026-08-11', scheduleNo: 'JY-20260811-0002', orderNo: 'ORD-2026-0811-02', productName: 'FC09', alloy: '6061', rodMaterialNo: '20-X178-6061-0021-L1200', rodDiameter: 178, rodLength: 1200, moldGroupNo: 'M09-0118', moldNo: 'M09-0118-773', extrusionBatchNo: '', planQty: 100, loadedQty: 0, extrudedQty: 0, rejectedQty: 0 },
  { id: 5, planDate: '2026-08-12', scheduleNo: 'JY-20260812-0001', orderNo: 'ORD-2026-0812-01', productName: 'FC140', alloy: '6063', rodMaterialNo: '20-X152-6063-0009-L1100', rodDiameter: 152, rodLength: 1100, moldGroupNo: 'M08-0312', moldNo: 'M08-0312-101', extrusionBatchNo: 'JY20260812-001', planQty: 72, loadedQty: 72, extrudedQty: 70, rejectedQty: 0 },
  { id: 6, planDate: '2026-08-12', scheduleNo: 'JY-20260812-0002', orderNo: 'ORD-2026-0812-02', productName: 'FC49', alloy: '6061', rodMaterialNo: '20-X178-6061-0025-L1200', rodDiameter: 178, rodLength: 1200, moldGroupNo: 'M11-0216', moldNo: 'M11-0216-202', extrusionBatchNo: 'JY20260812-002', planQty: 50, loadedQty: 50, extrudedQty: 50, rejectedQty: 0 },
  { id: 7, planDate: '2026-08-12', scheduleNo: 'JY-20260812-0003', orderNo: 'ORD-2026-0812-03', productName: 'FC113', alloy: '6063', rodMaterialNo: '20-X152-6063-0012-L1050', rodDiameter: 152, rodLength: 1050, moldGroupNo: 'M10-0735', moldNo: 'M10-0735-110', extrusionBatchNo: 'JY20260812-003', planQty: 64, loadedQty: 64, extrudedQty: 64, rejectedQty: 1 },
  { id: 8, planDate: '2026-08-12', scheduleNo: 'JY-20260812-0004', orderNo: 'ORD-2026-0812-04', productName: 'FC39', alloy: '6061', rodMaterialNo: '20-X178-6061-0028-L1180', rodDiameter: 178, rodLength: 1180, moldGroupNo: 'M09-0520', moldNo: 'M09-0520-088', extrusionBatchNo: 'JY20260812-004', planQty: 48, loadedQty: 48, extrudedQty: 48, rejectedQty: 0 },
  { id: 9, planDate: '2026-08-12', scheduleNo: 'JY-20260812-0005', orderNo: 'ORD-2026-0812-05', productName: 'FC114', alloy: '6063', rodMaterialNo: '20-X152-6063-0015-L1000', rodDiameter: 152, rodLength: 1000, moldGroupNo: 'M12-0108', moldNo: 'M12-0108-205', extrusionBatchNo: 'JY20260812-005', planQty: 72, loadedQty: 72, extrudedQty: 72, rejectedQty: 2 }
])

const draftFilters = ref<ReportFilters>(createFilters())
const appliedFilters = ref<ReportFilters>(createFilters())
const currentPage = ref(1)
const pageSize = ref(10)
const sawingRows = ref(loadSawingProductionRecords())

const pendingQty = (row: ExtrusionReportRow) => Math.max(row.loadedQty - row.extrudedQty, 0)
const rowStatus = (row: ExtrusionReportRow): ExecutionStatus => {
  if (row.planQty > 0 && row.extrudedQty >= row.planQty) return '已完成'
  if (row.loadedQty > 0 || row.extrudedQty > 0) return '生产中'
  return '未开始'
}

const filteredRows = computed(() => {
  const filters = appliedFilters.value
  const [startDate, endDate] = filters.dateRange
  const scheduleNo = filters.scheduleNo.trim().toLowerCase()
  const orderNo = filters.orderNo.trim().toLowerCase()
  const productName = filters.productName.trim().toLowerCase()
  const extrusionBatchNo = filters.extrusionBatchNo.trim().toLowerCase()
  const alloy = filters.alloy.trim().toLowerCase()

  return sourceRows.value.filter(row => {
    const matchesCompleted = rowStatus(row) === '已完成'
    const matchesDate = (!startDate || row.planDate >= startDate) && (!endDate || row.planDate <= endDate)
    const matchesScheduleNo = !scheduleNo || row.scheduleNo.toLowerCase().includes(scheduleNo)
    const matchesOrderNo = !orderNo || row.orderNo.toLowerCase().includes(orderNo)
    const matchesProductName = !productName || row.productName.toLowerCase().includes(productName)
    const matchesExtrusionBatchNo = !extrusionBatchNo || row.extrusionBatchNo.toLowerCase().includes(extrusionBatchNo)
    const matchesAlloy = !alloy || row.alloy.toLowerCase().includes(alloy)
    return matchesCompleted
      && matchesDate
      && matchesScheduleNo
      && matchesOrderNo
      && matchesProductName
      && matchesExtrusionBatchNo
      && matchesAlloy
  })
})

const filteredSawingRows = computed(() => {
  const filters = appliedFilters.value
  const [startDate, endDate] = filters.dateRange
  const scheduleNo = filters.scheduleNo.trim().toLowerCase()
  const orderNo = filters.orderNo.trim().toLowerCase()
  const productName = filters.productName.trim().toLowerCase()
  const extrusionBatchNo = filters.extrusionBatchNo.trim().toLowerCase()
  const alloy = filters.alloy.trim().toLowerCase()

  return sawingRows.value.filter(row => {
    const matchesCompleted = row.status === '已完成'
    const matchesDate = (!startDate || row.planDate >= startDate) && (!endDate || row.planDate <= endDate)
    const matchesScheduleNo = !scheduleNo || row.scheduleNo.toLowerCase().includes(scheduleNo)
    const matchesOrderNo = !orderNo || row.orderNo.toLowerCase().includes(orderNo)
    const matchesProductName = !productName || row.productName.toLowerCase().includes(productName)
    const matchesExtrusionBatchNo = !extrusionBatchNo || row.extrusionBatchNo.toLowerCase().includes(extrusionBatchNo)
    const matchesAlloy = !alloy || row.alloy.toLowerCase().includes(alloy)
    return matchesCompleted
      && matchesDate
      && matchesScheduleNo
      && matchesOrderNo
      && matchesProductName
      && matchesExtrusionBatchNo
      && matchesAlloy
  })
})

const combinedRows = computed<CombinedReportRow[]>(() => {
  const usedSawingSchedules = new Set<string>()
  const rows = filteredRows.value.map(row => {
    const sawing = filteredSawingRows.value.find(item => item.scheduleNo === row.scheduleNo)
      || filteredSawingRows.value.find(item => row.orderNo
        && row.extrusionBatchNo
        && item.orderNo === row.orderNo
        && item.extrusionBatchNo === row.extrusionBatchNo)
      || null
    if (sawing) usedSawingSchedules.add(sawing.scheduleNo)
    return { ...row, hasExtrusion: true, sawing }
  })

  filteredSawingRows.value.forEach((sawing, index) => {
    if (usedSawingSchedules.has(sawing.scheduleNo)) return
    rows.push({
      id: -(index + 1),
      planDate: sawing.planDate,
      scheduleNo: sawing.scheduleNo,
      orderNo: sawing.orderNo,
      productName: sawing.productName,
      alloy: sawing.alloy,
      rodMaterialNo: '',
      rodDiameter: 0,
      rodLength: 0,
      moldGroupNo: '',
      moldNo: sawing.moldNo,
      extrusionBatchNo: sawing.extrusionBatchNo,
      planQty: sawing.planQty,
      loadedQty: 0,
      extrudedQty: 0,
      rejectedQty: 0,
      hasExtrusion: false,
      sawing
    })
  })

  return rows
})

const pagedCombinedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return combinedRows.value.slice(start, start + pageSize.value)
})

const summary = computed(() => {
  const rows = combinedRows.value.filter(row => row.hasExtrusion)
  const planQty = rows.reduce((sum, row) => sum + row.planQty, 0)
  const loadedQty = rows.reduce((sum, row) => sum + row.loadedQty, 0)
  const extrudedQty = rows.reduce((sum, row) => sum + row.extrudedQty, 0)
  const rejectedQty = rows.reduce((sum, row) => sum + row.rejectedQty, 0)
  return { planQty, loadedQty, extrudedQty, rejectedQty }
})

const formatNumber = (value: number) => new Intl.NumberFormat('zh-CN').format(value)
const displayValue = (value: string) => value || '—'
const statusTagType = (status: ExecutionStatus): 'success' | 'warning' | 'info' => {
  if (status === '已完成') return 'success'
  if (status === '生产中') return 'warning'
  return 'info'
}

const tableIndex = (index: number) => (currentPage.value - 1) * pageSize.value + index + 1

const handleSearch = () => {
  sawingRows.value = loadSawingProductionRecords()
  appliedFilters.value = { ...draftFilters.value, dateRange: [...draftFilters.value.dateRange] }
  currentPage.value = 1
  ElMessage.success(`已查询到 ${combinedRows.value.length} 条排程记录`)
}

const handleReset = () => {
  sawingRows.value = loadSawingProductionRecords()
  draftFilters.value = createFilters()
  appliedFilters.value = createFilters()
  currentPage.value = 1
}

const handleExport = () => {
  if (!combinedRows.value.length) {
    ElMessage.warning('当前筛选条件下没有可导出的数据')
    return
  }

  exportReportWorkbook(`挤压生产报表_${new Date().toISOString().slice(0, 10)}`, [
    {
      name: '指标汇总',
      rows: [
        { 指标: '联合排程数', 数值: combinedRows.value.length, 单位: '个' },
        { 指标: '计划支数', 数值: summary.value.planQty, 单位: '支' },
        { 指标: '已上料支数', 数值: summary.value.loadedQty, 单位: '支' },
        { 指标: '已挤压支数', 数值: summary.value.extrudedQty, 单位: '支' },
        { 指标: '当前剔料数', 数值: summary.value.rejectedQty, 单位: '支' }
      ],
      columnWidths: [18, 16, 10]
    },
    {
      name: '挤压锯切联合明细',
      rows: combinedRows.value.map(row => ({
        计划日期: row.planDate,
        排程编号: row.scheduleNo,
        订单编号: row.orderNo,
        产品名称: row.productName,
        合金牌号: row.alloy,
        铝棒料号: row.hasExtrusion ? row.rodMaterialNo : '',
        棒径_mm: row.hasExtrusion ? row.rodDiameter : '',
        棒长_mm: row.hasExtrusion ? row.rodLength : '',
        模具组号: row.hasExtrusion ? row.moldGroupNo : '',
        模具号: row.moldNo,
        挤压批次号: row.extrusionBatchNo,
        挤压计划支数: row.hasExtrusion ? row.planQty : '',
        已上料: row.hasExtrusion ? row.loadedQty : '',
        已挤压: row.hasExtrusion ? row.extrudedQty : '',
        待挤压: row.hasExtrusion ? pendingQty(row) : '',
        剔料: row.hasExtrusion ? row.rejectedQty : '',
        挤压状态: row.hasExtrusion ? rowStatus(row) : '',
        锯台: row.sawing?.machineNo || '',
        定尺长度_mm: row.sawing?.fixedLength || '',
        锯切计划数量: row.sawing?.planQty ?? '',
        装框数量: row.sawing?.framedQty ?? '',
        料框数: row.sawing?.frameCount ?? '',
        取样数: row.sawing?.sampleCount ?? '',
        报废数: row.sawing?.scrapQty ?? '',
        锯切开始时间: row.sawing?.startTime || '',
        锯切结束时间: row.sawing?.endTime || '',
        锯切状态: row.sawing?.status || '',
        锯切备注: row.sawing?.remark || ''
      })),
      columnWidths: [12, 20, 18, 14, 10, 28, 10, 10, 16, 18, 20, 12, 12, 12, 12, 10, 12, 10, 14, 12, 12, 10, 10, 10, 20, 20, 12, 24]
    }
  ])
  ElMessage.success('挤压生产报表已导出')
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
