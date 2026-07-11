<template>
  <div class="page-container">
    <div class="search-wrapper">
      <el-card shadow="never">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="统计周期">
            <el-date-picker 
              v-model="searchForm.dateRange" 
              type="daterange" 
              range-separator="至" 
              start-placeholder="开始日期" 
              end-placeholder="结束日期" 
              class="date-range"
            />
          </el-form-item>
          <el-form-item label="所属车间">
            <el-select v-model="searchForm.workshop" placeholder="全部" clearable class="workshop-select">
              <el-option label="一车间" value="1" />
              <el-option label="二车间" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
            <el-button icon="Download" @click="handleExport">导出</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 核心指标概览 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6" v-for="(stat, idx) in statistics" :key="idx">
        <el-card shadow="hover" class="stat-card" :class="`stat-card-${idx}`">
          <div class="stat-content">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-data">
              <span class="stat-value" style="color: #303133;">{{ stat.value }}</span>
              <span class="stat-unit">{{ stat.unit }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-row">
      <!-- 图表区域 -->
      <el-col :span="16" class="chart-col">
        <!-- 实时模具加热队列 (关联挤压工作台) -->
        <el-card shadow="never" class="chart-card chart-card-gap">
          <template #header>
            <div class="card-header">
              <span class="live-title"><el-icon><Monitor /></el-icon> 实时模具加热与使用状态</span>
              <div class="header-actions">
                <el-tag type="info" effect="plain" round size="small">共 {{ filteredHeatingQueue.length }} 套</el-tag>
              </div>
            </div>
          </template>
          <el-form :inline="true" :model="heatingFilter" class="mini-filter">
            <el-form-item label="机台">
              <el-select v-model="heatingFilter.machineNo" placeholder="全部" clearable class="mini-select">
                <el-option label="M001" value="M001" />
                <el-option label="M002" value="M002" />
                <el-option label="M003" value="M003" />
                <el-option label="M004" value="M004" />
                <el-option label="M005" value="M005" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="heatingFilter.status" placeholder="全部" clearable class="mini-select">
                <el-option label="加热中" value="加热中" />
                <el-option label="到温待用" value="到温待用" />
                <el-option label="使用中" value="使用中" />
              </el-select>
            </el-form-item>
            <el-form-item label="模具">
              <el-input v-model="heatingFilter.keyword" placeholder="模具编号" clearable class="mini-input" />
            </el-form-item>
          </el-form>

          <el-table :data="filteredHeatingQueue" size="small" stripe class="live-table" border>
            <el-table-column prop="moldNo" label="模具编号" width="140" />
            <el-table-column prop="machineNo" label="上机机台" width="100" align="center">
              <template #default="{ row }">
                <span v-if="row.machineNo">{{ row.machineNo }}</span>
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="当前状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="heatingStatusTag(row.status)" effect="light">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="furnaceNo" label="所在加热炉" width="120" align="center" />
            <el-table-column label="温度进度 (当前/目标)" min-width="180">
              <template #default="{ row }">
                <div class="temp-progress">
                  <span class="temp-text">{{ row.currentTemp }}℃ / {{ row.targetTemp }}℃</span>
                  <el-progress :percentage="row.progress" :color="getProgressColor(row.status)" class="progress" />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="extrudedCount" label="已挤压数" width="100" align="center" />
          </el-table>
        </el-card>

        <el-row :gutter="16" class="sub-row">
          <el-col :span="12">
            <el-card shadow="never" header="模具状态分布" class="chart-card sub-chart">
              <div class="simple-list">
                <div v-for="item in statusDistribution" :key="item.label" class="simple-item">
                  <div class="simple-left">
                    <el-tag :type="item.tagType" effect="light" size="small">{{ item.label }}</el-tag>
                    <span class="simple-num">{{ item.value }}</span>
                  </div>
                  <el-progress :percentage="item.percent" :stroke-width="10" :color="item.color" class="simple-progress" />
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" header="氮化次数统计" class="chart-card sub-chart">
              <el-table :data="nitridingTop" size="small" stripe class="mini-table" border>
                <el-table-column prop="moldNo" label="模具编号" min-width="120" />
                <el-table-column prop="times" label="累计次数" width="90" align="center" />
                <el-table-column prop="lastTime" label="最近一次" width="120" align="center" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <!-- 预警与异常区域 -->
      <el-col :span="8" class="warning-col">
        <el-card shadow="never" class="chart-card list-card">
          <template #header>
            <div class="card-header">
              <span class="danger-title" style="color: #303133"><el-icon><Location /></el-icon> 模具位置及状态监控</span>
              <el-tag type="primary" effect="dark" round size="small">共 {{ moldLocations.length }} 条</el-tag>
            </div>
          </template>
          
          <div class="warning-list">
            <div v-for="(item, index) in moldLocations" :key="index" class="warning-item">
              <div class="warning-item-header">
                <span class="warning-mold-no">{{ item.moldNo }}</span>
                <el-tag :type="item.statusType" size="small" effect="light">{{ item.status }}</el-tag>
              </div>
              <div class="warning-item-desc">
                所在线体: <span style="font-weight: bold; color: #303133">{{ item.line }}</span>
              </div>
              <div class="warning-item-footer">
                <span class="warning-time">最近更新: {{ item.time }}</span>
                <el-button type="primary" link size="small" @click="handleProcess(item)">查看详情</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor, Location } from '@element-plus/icons-vue'
import { useMoldQueueStore } from '@/store/moldQueue'
import { storeToRefs } from 'pinia'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const moldQueueStore = useMoldQueueStore()
const { heatingQueue } = storeToRefs(moldQueueStore)

const searchForm = ref({ dateRange: [], workshop: '' })

const resetSearch = () => {
  searchForm.value = { dateRange: [], workshop: '' }
  ElMessage.success('已重置筛选条件')
}

const heatingFilter = ref({ machineNo: '', status: '', keyword: '' })

const filteredHeatingQueue = computed(() => {
  const machineNo = (heatingFilter.value.machineNo || '').trim()
  const status = (heatingFilter.value.status || '').trim()
  const keyword = (heatingFilter.value.keyword || '').trim()

  return (heatingQueue.value || []).filter(row => {
    const okMachine = !machineNo || row.machineNo === machineNo
    const okStatus = !status || row.status === status
    const okKeyword = !keyword || String(row.moldNo || '').includes(keyword)
    return okMachine && okStatus && okKeyword
  })
})

const statusDistribution = computed(() => {
  const rows = filteredHeatingQueue.value
  const total = rows.length || 1
  const count = (s: string) => rows.filter(r => r.status === s).length

  const map = [
    { label: '使用中', value: count('使用中'), color: '#F56C6C', tagType: 'danger' },
    { label: '到温待用', value: count('到温待用'), color: '#67C23A', tagType: 'success' },
    { label: '加热中', value: count('加热中'), color: '#E6A23C', tagType: 'warning' }
  ]

  return map.map(item => ({
    ...item,
    percent: Math.round((item.value / total) * 100)
  }))
})

const nitridingTop = ref([
  { moldNo: 'M10-0649-002', times: 3, lastTime: '2026-04-10' },
  { moldNo: 'M08-0122-005', times: 5, lastTime: '2026-04-02' },
  { moldNo: 'M12-0505-003', times: 2, lastTime: '2026-03-28' },
  { moldNo: 'M09-0888-001', times: 4, lastTime: '2026-03-18' },
  { moldNo: 'M10-0731-001', times: 1, lastTime: '2026-03-12' }
])

const handleSearch = () => {
  ElMessage.success('查询完成')
}

const handleExport = () => {
  ElMessage.success('导出任务已提交，请稍后在下载中心查看')
}

const handleProcess = (item: any) => {
  ElMessage.info(`正在查看模具 ${item.moldNo} 的详细位置及状态`)
}

const statistics = ref([
  { title: '总模具数', value: 1256, unit: '套', trend: 2.5, icon: 'DataBoard', color: '#409EFF' },
  { title: '生产可用', value: 980, unit: '套', trend: 1.2, icon: 'Check', color: '#67C23A' },
  { title: '维修中', value: 45, unit: '套', trend: -5.0, icon: 'Wrench', color: '#E6A23C' },
  { title: '预警状态', value: 12, unit: '套', trend: 15.3, icon: 'Warning', color: '#F56C6C' }
])

const moldLocations = ref([
  { moldNo: 'M10-0649-002', line: '挤压 1#线', status: '使用中', statusType: 'success', time: '10分钟前' },
  { moldNo: 'M10-0731-001', line: '模具库位 A区', status: '空闲', statusType: 'info', time: '1小时前' },
  { moldNo: 'M08-0122-005', line: '挤压 2#线 加热炉', status: '加热中', statusType: 'warning', time: '3小时前' },
  { moldNo: 'M12-0505-003', line: '模具维修区', status: '维修中', statusType: 'danger', time: '1天前' },
  { moldNo: 'M09-0888-001', line: '氮化车间', status: '保养中', statusType: 'warning', time: '1天前' }
])

const getProgressColor = (status: string) => {
  if (status === '到温待用') return '#67C23A'
  if (status === '使用中') return '#F56C6C'
  return '#409EFF'
}

const heatingStatusTag = (status: string) => {
  const map: Record<string, string> = {
    '加热中': 'warning',
    '到温待用': 'success',
    '使用中': 'danger'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.page-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  min-height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.search-wrapper {
  margin-bottom: 16px;
}

.search-wrapper .el-card {
  border: none;
  border-radius: 8px;
}

.search-wrapper :deep(.el-card__body) {
  padding: 16px 16px 0 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.date-range {
  width: 260px;
}

.workshop-select {
  width: 120px;
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 20px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

:deep(.stat-card .el-card__body) {
  padding: 0;
  display: flex;
  width: 100%;
  align-items: center;
}

.stat-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  margin-right: 20px;
}

.stat-card-0 .stat-icon-wrapper { background-color: #ecf5ff; }
.stat-card-1 .stat-icon-wrapper { background-color: #f0f9eb; }
.stat-card-2 .stat-icon-wrapper { background-color: #fdf6ec; }
.stat-card-3 .stat-icon-wrapper { background-color: #fef0f0; }

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-data {
  margin-bottom: 8px;
  display: flex;
  align-items: baseline;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
  margin-right: 4px;
}

.stat-unit {
  font-size: 14px;
  color: #606266;
}

.stat-trend {
  font-size: 13px;
  color: #909399;
  display: flex;
  align-items: center;
}

.trend-up { color: #F56C6C; margin-left: 8px; display: flex; align-items: center; font-weight: bold; }
.trend-down { color: #67C23A; margin-left: 8px; display: flex; align-items: center; font-weight: bold; }

.main-row {
  flex: 1;
  display: flex;
  align-items: stretch;
}

.chart-col, .warning-col {
  display: flex;
  flex-direction: column;
}

.chart-card {
  border: none;
  border-radius: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sub-chart {
  height: 250px;
}

.list-card {
  flex: none;
}

.warning-col .list-card:first-child {
  flex: 1;
}

:deep(.chart-card .el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.chart-card .el-card__body) {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.live-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
}

.chart-card-gap {
  margin-bottom: 16px;
}

.sub-row {
  margin-top: 16px;
  flex: 1;
}

.mini-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.mini-select {
  width: 120px;
}

.mini-input {
  width: 160px;
}

.live-table {
  width: 100%;
}

.muted {
  color: #999;
}

.temp-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.temp-text {
  width: 92px;
  font-size: 12px;
  color: #606266;
}

.progress {
  flex: 1;
}

.danger-title {
  color: #F56C6C;
  display: flex;
  align-items: center;
  gap: 6px;
}


.simple-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.simple-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.simple-left {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.simple-num {
  font-weight: bold;
  color: #303133;
}

.simple-progress {
  width: 100%;
}

.mini-table {
  width: 100%;
}

.list-gap {
  margin-top: 16px;
}

.warning-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.warning-list::-webkit-scrollbar {
  width: 6px;
}
.warning-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.warning-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 12px;
  background-color: #fff;
  transition: all 0.3s;
}

.warning-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  border-color: #c6e2ff;
}

.warning-item:last-child {
  margin-bottom: 0;
}

.warning-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.warning-mold-no {
  font-weight: bold;
  color: #303133;
  font-size: 14px;
}

.warning-item-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 10px;
}

.warning-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warning-time {
  font-size: 12px;
  color: #909399;
}
</style>

