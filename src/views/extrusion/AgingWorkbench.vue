﻿﻿<template>
  <div class="page-container">
    <el-card class="full-card" shadow="never">
      <el-tabs v-model="activeTab" class="workbench-tabs">
        <el-tab-pane label="温度看板" name="dashboard">
          <AgingTemperatureDashboard />
        </el-tab-pane>

        <el-tab-pane label="炉内详情" name="furnace">
          <div class="furnace-detail-container">
            <el-form :inline="true" class="furnace-selector">
              <el-form-item label="选择时效炉：">
                <el-select v-model="selectedFurnaceNo" placeholder="请选择时效炉" style="width: 200px">
                  <el-option v-for="f in furnaceBoards" :key="f.furnaceNo" :label="f.furnaceNo" :value="f.furnaceNo" />
                </el-select>
              </el-form-item>
            </el-form>

            <div v-if="selectedFurnace" class="furnace-info-card">
              <el-descriptions border :column="3" title="当前炉内状态">
                <el-descriptions-item label="时效炉号">
                  <el-tag size="small">{{ selectedFurnace.furnaceNo }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="时效批次号">{{ selectedFurnace.agingBatch }}</el-descriptions-item>
                <el-descriptions-item label="时效制度">{{ selectedFurnace.agingProgram }}</el-descriptions-item>
                <el-descriptions-item label="入炉时间">{{ selectedFurnace.inTime }}</el-descriptions-item>
                <el-descriptions-item label="时效时长">{{ selectedFurnace.agingDuration }}</el-descriptions-item>
                <el-descriptions-item label="框数量">
                  <span style="font-weight: bold; color: #409EFF">{{ selectedFurnace.frames.length }}</span> 框
                </el-descriptions-item>
                <el-descriptions-item label="长支总数">
                  <span style="font-weight: bold; color: #67C23A">{{ currentFurnaceTotalBranches }}</span> 支
                </el-descriptions-item>
              </el-descriptions>

              <div class="frames-table-wrapper" style="margin-top: 16px;">
                <div style="margin-bottom: 10px; font-weight: bold; font-size: 14px;">炉内料框明细</div>
                <el-table :data="selectedFurnace.frames" border stripe style="width: 100%">
                  <el-table-column type="expand" width="60">
                    <template #default="{ row }">
                      <div class="expand-content">
                        <div class="expand-title">长支明细</div>
                        <el-table :data="row.longBranches" border size="small" style="width: 100%; margin-top: 10px;">
                          <el-table-column type="index" label="序号" width="60" align="center" />
                          <el-table-column prop="moldNo" label="模具编号" width="150" align="center" />
                          <el-table-column prop="longBranchNo" label="长支号" min-width="200" align="center" show-overflow-tooltip />
                          <el-table-column prop="productLength" label="定尺长度(mm)" width="120" align="right" />
                          <el-table-column prop="sawTime" label="锯切时间" width="160" align="center" />
                        </el-table>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column prop="frameNo" label="框号" width="150" align="center" show-overflow-tooltip />
                  <el-table-column prop="extrusionBatch" label="挤压批次号" min-width="180" align="center" show-overflow-tooltip />
                  <el-table-column prop="longBranchCount" label="框内长支数量" width="110" align="center">
                    <template #default="{ row }">
                      {{ row.longBranchCount }} 支
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <el-empty v-else description="请选择时效炉以查看详情" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="出炉实绩" name="out">
          <el-table :data="outFurnaceData" border stripe style="width: 100%">
            <el-table-column type="expand" width="60">
              <template #default="{ row }">
                <div class="expand-content">
                  <div class="expand-title">长支明细</div>
                  <el-table :data="row.longBranches" border size="small" style="width: 100%; margin-top: 10px;">
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="moldNo" label="模具编号" width="150" align="center" show-overflow-tooltip />
                    <el-table-column prop="longBranchNo" label="长支号" min-width="200" align="center" show-overflow-tooltip />
                    <el-table-column prop="productLength" label="定尺长度(mm)" width="120" align="right" />
                    <el-table-column prop="sawTime" label="锯切时间" width="160" align="center" />
                  </el-table>
                </div>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="frameNo" label="框号" width="140" align="center" show-overflow-tooltip />
            <el-table-column prop="agingBatch" label="时效批次号" width="160" show-overflow-tooltip />
            <el-table-column prop="agingProgram" label="时效制度" width="140" show-overflow-tooltip />
            <el-table-column prop="furnaceNo" label="时效炉号" width="110" align="center" />
            <el-table-column prop="inTime" label="入炉时间" width="160" align="center" />
            <el-table-column prop="outTime" label="出炉时间" width="160" align="center" />
            <el-table-column prop="longBranchCount" label="长支数量" width="110" align="center">
              <template #default="{ row }">
                {{ row.longBranchCount }} 支
              </template>
            </el-table-column>
            <el-table-column prop="location" label="所在位置" width="140" show-overflow-tooltip />
            <el-table-column prop="storageBin" label="库位号" width="120" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="AGV流转追踪" name="agv">
          <el-alert
            title="数据由 AGV/WCS 自动同步，本页面仅展示流转状态，不提供人工入库操作。"
            type="info"
            :closable="false"
            show-icon
            class="agv-alert"
          />

          <div class="agv-summary">
            <div v-for="item in agvSummary" :key="item.label" class="summary-item">
              <div class="summary-label">{{ item.label }}</div>
              <div class="summary-value" :class="item.className">{{ item.value }}</div>
            </div>
          </div>

          <div class="agv-search-wrapper">
            <el-form :inline="true" :model="agvSearchForm">
              <el-form-item label="料框码">
                <el-input v-model="agvSearchForm.frameNo" placeholder="请输入或扫描料框码" clearable style="width: 250px" />
              </el-form-item>
              <el-form-item label="挤压批次">
                <el-input v-model="agvSearchForm.batchNo" placeholder="请输入挤压批次" clearable style="width: 180px" />
              </el-form-item>
              <el-form-item label="流转状态">
                <el-select v-model="agvSearchForm.status" placeholder="全部状态" clearable style="width: 140px">
                  <el-option v-for="status in agvStatusOptions" :key="status" :label="status" :value="status" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleAgvSearch">查询</el-button>
                <el-button icon="Refresh" @click="resetAgvSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="filteredAgvRecords" border stripe height="calc(100vh - 430px)" style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="taskNo" label="AGV任务号" width="170" show-overflow-tooltip />
            <el-table-column prop="frameNo" label="料框码" min-width="220" show-overflow-tooltip />
            <el-table-column prop="batchNo" label="挤压批次" width="150" show-overflow-tooltip />
            <el-table-column prop="agvNo" label="AGV编号" width="100" align="center" />
            <el-table-column label="流转状态" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="getAgvStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="route" label="搬运路线" min-width="210" show-overflow-tooltip />
            <el-table-column prop="currentPosition" label="当前位置" width="150" show-overflow-tooltip />
            <el-table-column prop="lastSyncTime" label="最后同步时间" width="170" align="center" />
            <el-table-column label="同步结果" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="row.syncResult === '正常' ? 'success' : 'danger'" effect="plain" size="small">
                  {{ row.syncResult }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="exceptionMessage" label="异常信息" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <span :class="{ 'error-text': row.syncResult === '异常' }">{{ row.exceptionMessage || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openTraceability(row)">查看追溯</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import AgingTemperatureDashboard from './AgingTemperatureDashboard.vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const router = useRouter()

const activeTab = ref('dashboard')

const switchTab = (tabName: string, furnaceNo?: string) => {
  activeTab.value = tabName
  if (furnaceNo) {
    // 确保值改变时能触发更新，并去除名称中可能多余的空格
    selectedFurnaceNo.value = furnaceNo.trim()
  }
}
provide('switchTab', switchTab)

const selectedFurnaceNo = ref('1号时效炉')

const furnaceBoards = ref([
  { furnaceNo: '1号时效炉', agingBatch: 'A-20260511-001', agingProgram: '标准时效制度A', inTime: '2026-05-11 08:30:00', agingDuration: '1小时20分', status: '升温', frames: [ { frameNo: 'CV-A-A-L6000*W1250*H650*0188', extrusionBatch: 'JY-260511-001', longBranchCount: 30, longBranches: [ { moldNo: 'M10-0649-001', longBranchNo: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260524', productLength: 6000, sawTime: '2026-05-11 08:00' }, { moldNo: 'M10-0649-001', longBranchNo: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260525', productLength: 6000, sawTime: '2026-05-11 08:05' } ] }, { frameNo: 'CV-A-A-L6000*W1250*H650*0189', extrusionBatch: 'JY-260511-002', longBranchCount: 28, longBranches: [ { moldNo: 'M10-0731-002', longBranchNo: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260526', productLength: 5800, sawTime: '2026-05-11 08:15' } ] } ] },
  { furnaceNo: '2号时效炉', agingBatch: 'A-20260511-002', agingProgram: '标准时效制度B', inTime: '2026-05-11 11:20:00', agingDuration: '3小时10分', status: '保温', frames: [ { frameNo: 'CV-A-A-L6000*W1250*H650*0190', extrusionBatch: 'JY-260511-003', longBranchCount: 35, longBranches: [ { moldNo: 'M10-0805-001', longBranchNo: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260527', productLength: 6200, sawTime: '2026-05-11 10:30' } ] }, { frameNo: 'CV-A-A-L6000*W1250*H650*0191', extrusionBatch: 'JY-260511-004', longBranchCount: 32, longBranches: [] }, { frameNo: 'CV-A-A-L6000*W1250*H650*0192', extrusionBatch: 'JY-260511-005', longBranchCount: 30, longBranches: [] } ] },
  { furnaceNo: '3号时效炉', agingBatch: '-', agingProgram: '-', inTime: '-', agingDuration: '-', status: '空闲', frames: [] },
  { furnaceNo: '4号时效炉', agingBatch: '-', agingProgram: '-', inTime: '-', agingDuration: '-', status: '空闲', frames: [] },
  ...Array.from({ length: 5 }, (_, index) => ({ furnaceNo: `${index + 5}号时效炉`, agingBatch: '-', agingProgram: '-', inTime: '-', agingDuration: '-', status: '空闲', frames: [] })),
  { furnaceNo: '淬火炉', agingBatch: '-', agingProgram: '-', inTime: '-', agingDuration: '-', status: '空闲', frames: [] }
])

const selectedFurnace = computed(() => {
  return furnaceBoards.value.find(f => f.furnaceNo === selectedFurnaceNo.value)
})

const currentFurnaceTotalBranches = computed(() => {
  if (!selectedFurnace.value) return 0
  return selectedFurnace.value.frames.reduce((sum, frame) => sum + frame.longBranchCount, 0)
})

const outFurnaceData = ref([
  {
    frameNo: 'CV-A-A-L6000*W1250*H650*0193',
    agingBatch: 'AGE-260416-01',
    agingProgram: 'T6 185℃×6h',
    furnaceNo: 'T-001',
    inTime: '2026-04-16 08:00:00',
    outTime: '2026-04-16 14:10:00',
    longBranchCount: 20,
    longBranches: [
      { moldNo: 'M10-0649-200', longBranchNo: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260528', productLength: 2970, sawTime: '2026-04-16 07:00:00' },
      { moldNo: 'M10-0649-200', longBranchNo: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260529', productLength: 2970, sawTime: '2026-04-16 07:05:00' }
    ],
    location: '时效区-出炉缓存位',
    storageBin: 'BIN-A-01'
  },
  {
    frameNo: 'CV-A-A-L6000*W1250*H650*0194',
    agingBatch: 'AGE-260415-03',
    agingProgram: 'T5 170℃×3h',
    furnaceNo: 'T-002',
    inTime: '2026-04-15 12:10:00',
    outTime: '2026-04-15 15:30:00',
    longBranchCount: 18,
    longBranches: [
      { moldNo: 'M10-0649-200', longBranchNo: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260530', productLength: 2970, sawTime: '2026-04-15 11:30:00' },
      { moldNo: 'M10-0649-200', longBranchNo: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260531', productLength: 2970, sawTime: '2026-04-15 11:35:00' }
    ],
    location: '时效区-出炉缓存位',
    storageBin: 'BIN-B-02'
  }
])

const agvSearchForm = ref({
  frameNo: '',
  batchNo: '',
  status: ''
})

const agvStatusOptions = ['待接收', '已接收', '运输中', '已到炉', '已入炉', '已出炉', '同步异常']

const agvRecords = ref([
  {
    taskNo: 'AGV-20260724-001',
    frameNo: 'CV-A-A-L6000*W1250*H650*0199',
    batchNo: 'JY2603070002',
    agvNo: 'AGV-03',
    status: '已入炉',
    route: '锯切缓存区 → 2号时效炉',
    currentPosition: '2号时效炉',
    lastSyncTime: '2026-07-24 09:40:16',
    syncResult: '正常',
    exceptionMessage: ''
  },
  {
    taskNo: 'AGV-20260724-002',
    frameNo: 'CV-A-A-L6000*W1250*H650*0200',
    batchNo: 'JY2603070002',
    agvNo: 'AGV-05',
    status: '运输中',
    route: '锯切缓存区 → 1号时效炉',
    currentPosition: '主通道 M2',
    lastSyncTime: '2026-07-24 16:48:32',
    syncResult: '正常',
    exceptionMessage: ''
  },
  {
    taskNo: 'AGV-20260724-003',
    frameNo: 'CV-A-A-L6000*W1250*H650*0201',
    batchNo: 'JY2603070002',
    agvNo: '-',
    status: '待接收',
    route: '锯切缓存区 → 待分配',
    currentPosition: '锯切缓存区',
    lastSyncTime: '2026-07-24 16:46:05',
    syncResult: '正常',
    exceptionMessage: ''
  },
  {
    taskNo: 'AGV-20260724-004',
    frameNo: 'CV-A-A-L6000*W1250*H650*0193',
    batchNo: 'JY-260511-006',
    agvNo: 'AGV-02',
    status: '已出炉',
    route: '1号时效炉 → 出炉缓存位',
    currentPosition: '出炉缓存位',
    lastSyncTime: '2026-07-24 15:42:10',
    syncResult: '正常',
    exceptionMessage: ''
  },
  {
    taskNo: 'AGV-20260724-005',
    frameNo: 'CV-A-A-L6000*W1250*H650*0194',
    batchNo: 'JY-260511-007',
    agvNo: 'AGV-06',
    status: '同步异常',
    route: '2号时效炉 → 出炉缓存位',
    currentPosition: '2号时效炉出口',
    lastSyncTime: '2026-07-24 16:43:27',
    syncResult: '异常',
    exceptionMessage: 'WCS 状态回传超时，请检查设备连接'
  },
  {
    taskNo: 'AGV-20260724-006',
    frameNo: 'CV-A-A-L6000*W1250*H650*0190',
    batchNo: 'JY-260511-003',
    agvNo: 'AGV-01',
    status: '已到炉',
    route: '锯切缓存区 → 2号时效炉',
    currentPosition: '2号时效炉入口',
    lastSyncTime: '2026-07-24 16:39:11',
    syncResult: '正常',
    exceptionMessage: ''
  }
])

const filteredAgvRecords = computed(() => {
  const frameKeyword = agvSearchForm.value.frameNo.trim().toLowerCase()
  const batchKeyword = agvSearchForm.value.batchNo.trim().toLowerCase()
  return agvRecords.value.filter(item => {
    if (frameKeyword && !item.frameNo.toLowerCase().includes(frameKeyword)) return false
    if (batchKeyword && !item.batchNo.toLowerCase().includes(batchKeyword)) return false
    if (agvSearchForm.value.status && item.status !== agvSearchForm.value.status) return false
    return true
  })
})

const agvSummary = computed(() => [
  { label: '任务总数', value: agvRecords.value.length, className: '' },
  { label: '运输中', value: agvRecords.value.filter(item => ['已接收', '运输中', '已到炉'].includes(item.status)).length, className: 'primary-value' },
  { label: '已入炉/出炉', value: agvRecords.value.filter(item => ['已入炉', '已出炉'].includes(item.status)).length, className: 'success-value' },
  { label: '同步异常', value: agvRecords.value.filter(item => item.syncResult === '异常').length, className: 'danger-value' }
])

const getAgvStatusType = (status: string) => {
  if (['已入炉', '已出炉'].includes(status)) return 'success'
  if (['已接收', '运输中', '已到炉'].includes(status)) return 'primary'
  if (status === '同步异常') return 'danger'
  return 'info'
}

const handleAgvSearch = () => {
  // 筛选条件由计算属性实时应用，此处保留按钮以匹配系统统一查询交互。
}

const resetAgvSearch = () => {
  agvSearchForm.value = { frameNo: '', batchNo: '', status: '' }
}

const openTraceability = (row: any) => {
  router.push({ name: 'ProductionTraceability', query: { code: row.frameNo } })
}

const furnaceSummary = computed(() => {
  const list = furnaceBoards.value
  return {
    furnaceCount: list.length,
    frameCount: list.reduce((acc, item) => acc + item.frames.length, 0)
  }
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.workbench-tabs {
  margin-top: 8px;
}

.agv-alert { margin-bottom: 16px; }
.agv-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.summary-item {
  padding: 14px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}
.summary-label { font-size: 13px; color: var(--text-secondary); }
.summary-value { margin-top: 6px; font-size: 24px; font-weight: 600; color: var(--text-primary); }
.summary-value.primary-value { color: var(--el-color-primary); }
.summary-value.success-value { color: var(--el-color-success); }
.summary-value.danger-value { color: var(--el-color-danger); }
.agv-search-wrapper {
  padding: 16px 16px 0;
  margin-bottom: 16px;
  background: var(--bg-tertiary);
  border-radius: 6px;
}
.error-text { color: var(--el-color-danger); }

.furnace-detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.furnace-selector {
  margin-bottom: 0;
  padding: 16px 16px 0 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.furnace-info-card {
  padding: 0;
}

.expand-content {
  padding: 4px 12px;
}

.expand-title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.branch-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.branch-tag {
  margin: 0;
}

:deep(.el-descriptions__label) {
  width: 120px;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .agv-summary { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
}
</style>
