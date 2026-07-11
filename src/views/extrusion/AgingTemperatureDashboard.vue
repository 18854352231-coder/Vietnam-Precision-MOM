<template>
  <div class="dashboard-container">
    <div class="card-header">
      <span>时效温度看板</span>
      <div class="summary-stats">
        <el-tag type="info">总炉数: 4</el-tag>
        <el-tag type="success">运行中: 2</el-tag>
        <el-tag type="warning">空闲中: 2</el-tag>
        <el-tag type="danger">异常: 0</el-tag>
      </div>
    </div>

    <el-row :gutter="20">
        <el-col :span="12" v-for="furnace in furnaces" :key="furnace.id" style="margin-bottom: 20px;">
          <el-card shadow="hover" class="furnace-card">
            <template #header>
              <div class="furnace-header">
                <span class="furnace-name">{{ furnace.name }}</span>
                <div>
                  <el-tag :type="getStatusType(furnace.status)" effect="dark" style="margin-right: 10px;">
                    {{ furnace.status }}
                  </el-tag>
                  <el-button type="primary" link icon="View" @click="goToFurnaceDetail(furnace.name)" v-if="furnace.frameCount > 0" style="margin-right: 10px;">
                    炉内详情
                  </el-button>
                  <el-button type="primary" link icon="TrendCharts" @click="openHistoryDialog(furnace)">
                    历史温度曲线
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="furnace-body">
              <div class="gauge-container">
                <el-progress 
                  type="dashboard" 
                  :percentage="getPercentage(furnace)" 
                  :color="getColor(furnace.status)"
                  :width="150"
                  :stroke-width="12"
                >
                  <template #default>
                    <div class="temp-text">
                      <span class="current-temp">{{ furnace.currentTemp }}°C</span>
                      <span class="target-temp">目标: {{ furnace.targetTemp }}°C</span>
                    </div>
                  </template>
                </el-progress>
              </div>
              
              <div class="info-container">
                <el-descriptions :column="1" size="small" border>
                  <el-descriptions-item label="当前阶段">{{ furnace.phase || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="已运行时长">{{ furnace.runningTime || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="预计结束时间">{{ furnace.estimatedEndTime || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="当前料框数">
                    <span v-if="furnace.frameCount > 0" class="frame-count">{{ furnace.frameCount }} 框</span>
                    <span v-else>-</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>

            <!-- 操作与明细区域 (已移至右上角) -->
          </el-card>
        </el-col>
      </el-row>

    <!-- 历史温度弹窗 -->
    <el-dialog v-model="historyDialogVisible" :title="`${currentHistoryFurnace?.name || ''} - 历史温度查询`" width="700px">
      <div style="margin-bottom: 20px;">
        <span style="margin-right: 10px;">选择时间范围:</span>
        <el-date-picker
          v-model="historyTimeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          @change="handleTimeRangeChange"
        />
        <el-button type="primary" style="margin-left: 10px;" @click="handleTimeRangeChange">查询</el-button>
      </div>

      <div class="history-chart-container" style="margin-top: 20px; padding: 10px 20px;" v-if="currentHistoryFurnace">
        <div class="chart-title" style="text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 15px;">历史温度曲线</div>
        
        <div style="display: flex;">
          <!-- Y轴标题 -->
          <div style="writing-mode: vertical-rl; text-align: center; font-size: 12px; color: #999; letter-spacing: 2px; padding-right: 5px;">温度(℃)</div>
          
          <!-- Y轴刻度 -->
          <div style="display: flex; flex-direction: column; justify-content: space-between; padding-right: 8px; font-size: 11px; color: #666; text-align: right; width: 35px;">
            <span>250 -</span>
            <span>200 -</span>
            <span>150 -</span>
            <span>100 -</span>
            <span>50 -</span>
            <span>0 -</span>
          </div>
          
          <!-- 图表区 -->
          <div style="flex: 1; display: flex; flex-direction: column;">
            <div style="border-left: 1px solid #ccc; border-bottom: 1px solid #ccc; position: relative; height: 180px;">
              <!-- 水平辅助线 -->
              <div style="position: absolute; top: 20%; left: 0; width: 100%; border-top: 1px dashed #ebeef5; z-index: 1;"></div>
              <div style="position: absolute; top: 40%; left: 0; width: 100%; border-top: 1px dashed #ebeef5; z-index: 1;"></div>
              <div style="position: absolute; top: 60%; left: 0; width: 100%; border-top: 1px dashed #ebeef5; z-index: 1;"></div>
              <div style="position: absolute; top: 80%; left: 0; width: 100%; border-top: 1px dashed #ebeef5; z-index: 1;"></div>
              
              <svg 
                class="temp-chart" 
                viewBox="0 0 400 180" 
                preserveAspectRatio="none" 
                style="height: 100%; width: 100%; display: block; position: relative; z-index: 2;"
                @mousemove="handleChartMouseMove"
                @mouseleave="handleChartMouseLeave"
              >
                <polyline 
                  fill="none" 
                  :stroke="getColor(currentHistoryFurnace.status)" 
                  stroke-width="2" 
                  :points="getPolylinePoints(currentHistoryFurnace.history)"
                />
                <!-- 渐变填充背景 -->
                <polygon 
                  :fill="getColor(currentHistoryFurnace.status)" 
                  fill-opacity="0.1"
                  :points="getPolygonPoints(currentHistoryFurnace.history)"
                />
              </svg>
              <!-- 悬浮提示框 -->
              <div 
                v-if="hoverInfo.visible" 
                class="chart-tooltip" 
                :style="{ left: hoverInfo.x + 'px', top: hoverInfo.y + 'px' }"
              >
                <div class="tooltip-temp">{{ hoverInfo.temp }}℃</div>
              </div>
            </div>
            
            <!-- X轴刻度 -->
            <div class="chart-labels" style="display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-top: 6px;">
              <span style="position: relative; left: -10px;">| {{ historyTimeRange ? historyTimeRange[0] : '开始' }}</span>
              <span style="position: relative; right: -10px;">{{ historyTimeRange ? historyTimeRange[1] : '结束' }} |</span>
            </div>
            <!-- X轴标题 -->
            <div style="text-align: center; font-size: 12px; color: #999; margin-top: 8px;">时间</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const switchTab = inject('switchTab') as (tabName: string, furnaceNo?: string) => void

const goToFurnaceDetail = (furnaceName: string) => {
  if (switchTab) {
    switchTab('furnace', furnaceName)
  }
}

const generateMockHistory = (baseTemp: number, trend: string) => {
  const history = []
  let current = baseTemp > 100 ? 30 : baseTemp
  for (let i = 0; i < 30; i++) {
    if (trend === 'up') {
      current += Math.random() * 5
      if (current > baseTemp) current = baseTemp - Math.random() * 5
    } else if (trend === 'stable') {
      current = baseTemp + (Math.random() - 0.5) * 4
    } else {
      current = baseTemp
    }
    history.push(Math.round(current))
  }
  return history
}

const furnaces = ref([
  {
    id: 1,
    name: '1号时效炉',
    status: '升温中',
    phase: '升温',
    currentTemp: 125,
    targetTemp: 200,
    runningTime: '1小时20分',
    estimatedEndTime: '2026-05-11 16:00',
    frameCount: 2,
    history: generateMockHistory(125, 'up'),
    frames: [
      { frameNo: 'CV-A-A-L6000*W1250*H650*0183', productNo: 'P-1001', quantity: 150 },
      { frameNo: 'CV-A-A-L6000*W1250*H650*0184', productNo: 'P-1001', quantity: 150 }
    ]
  },
  {
    id: 2,
    name: '2号时效炉',
    status: '保温中',
    phase: '保温',
    currentTemp: 198,
    targetTemp: 200,
    runningTime: '3小时10分',
    estimatedEndTime: '2026-05-11 14:30',
    frameCount: 3,
    history: generateMockHistory(198, 'stable'),
    frames: [
      { frameNo: 'CV-A-A-L6000*W1250*H650*0185', productNo: 'P-1002', quantity: 120 },
      { frameNo: 'CV-A-A-L6000*W1250*H650*0186', productNo: 'P-1002', quantity: 120 },
      { frameNo: 'CV-A-A-L6000*W1250*H650*0187', productNo: 'P-1003', quantity: 80 }
    ]
  },
  {
    id: 3,
    name: '3号时效炉',
    status: '空闲中',
    phase: '',
    currentTemp: 45,
    targetTemp: 0,
    runningTime: '',
    estimatedEndTime: '',
    frameCount: 0,
    history: generateMockHistory(45, 'none'),
    frames: []
  },
  {
    id: 4,
    name: '4号时效炉',
    status: '空闲中',
    phase: '',
    currentTemp: 42,
    targetTemp: 0,
    runningTime: '',
    estimatedEndTime: '',
    frameCount: 0,
    history: generateMockHistory(42, 'none'),
    frames: []
  }
])

let timer: any = null

onMounted(() => {
  // 模拟温度实时变化
  timer = setInterval(() => {
    furnaces.value.forEach(f => {
      if (f.status === '升温中') {
        f.currentTemp += Math.floor(Math.random() * 3)
        if (f.currentTemp >= f.targetTemp) {
          f.currentTemp = f.targetTemp
          f.status = '保温中'
          f.phase = '保温'
        }
      } else if (f.status === '保温中') {
        // 在目标温度上下波动
        const diff = (Math.random() - 0.5) * 4
        f.currentTemp = Math.round(f.targetTemp + diff)
      } else if (f.status === '空闲中' && f.currentTemp > 40) {
        f.currentTemp -= Math.floor(Math.random() * 2)
      }
      
      // 更新历史记录
      f.history.shift()
      f.history.push(f.currentTemp)
    })
  }, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// --- 历史温度弹窗逻辑 ---
const historyDialogVisible = ref(false)
const currentHistoryFurnace = ref<any>(null)
const historyTimeRange = ref<string[]>([])

const openHistoryDialog = (furnace: any) => {
  currentHistoryFurnace.value = furnace
  
  // 默认设置时间范围为最近24小时
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 3600 * 1000 * 24)
  
  // 简单的格式化函数 YYYY-MM-DD HH:mm:ss
  const format = (d: Date) => {
    return d.getFullYear() + '-' + 
      String(d.getMonth() + 1).padStart(2, '0') + '-' + 
      String(d.getDate()).padStart(2, '0') + ' ' + 
      String(d.getHours()).padStart(2, '0') + ':' + 
      String(d.getMinutes()).padStart(2, '0') + ':' + 
      String(d.getSeconds()).padStart(2, '0')
  }
  
  historyTimeRange.value = [format(start), format(end)]
  historyDialogVisible.value = true
}

const handleTimeRangeChange = () => {
  if (!historyTimeRange.value || historyTimeRange.value.length !== 2) {
    ElMessage.warning('请选择完整的时间范围')
    return
  }
  
  ElMessage.success(`已查询 ${historyTimeRange.value[0]} 至 ${historyTimeRange.value[1]} 的历史温度`)
  // 这里可以加入重新生成 mock 数据的逻辑，为了简单起见，当前我们只需给出提示，SVG图表仍然使用原先生成的历史数组
  if (currentHistoryFurnace.value) {
    // 模拟数据刷新
    let trend = 'none'
    if (currentHistoryFurnace.value.status === '升温中') trend = 'up'
    if (currentHistoryFurnace.value.status === '保温中') trend = 'stable'
    currentHistoryFurnace.value.history = generateMockHistory(currentHistoryFurnace.value.currentTemp, trend)
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case '升温中': return 'warning'
    case '保温中': return 'danger'
    case '空闲中': return 'info'
    default: return 'info'
  }
}

const getColor = (status: string) => {
  switch (status) {
    case '升温中': return '#E6A23C'
    case '保温中': return '#F56C6C'
    case '空闲中': return '#909399'
    default: return '#909399'
  }
}

const getPercentage = (furnace: any) => {
  if (furnace.targetTemp === 0) return 0
  const p = Math.floor((furnace.currentTemp / furnace.targetTemp) * 100)
  return p > 100 ? 100 : p
}

// SVG 图表点位计算
const getPolylinePoints = (history: number[]) => {
  if (!history || history.length === 0) return ''
  const maxTemp = 250 // Y轴最大值
  const width = 400
  const height = 180
  const step = width / (history.length - 1)
  
  return history.map((temp, index) => {
    const x = index * step
    const y = height - (temp / maxTemp) * height
    return `${x},${y}`
  }).join(' ')
}

const getPolygonPoints = (history: number[]) => {
  if (!history || history.length === 0) return ''
  const polyline = getPolylinePoints(history)
  return `0,180 ${polyline} 400,180`
}

// 悬浮提示框状态
const hoverInfo = ref({
  visible: false,
  x: 0,
  y: 0,
  temp: 0
})

const handleChartMouseMove = (e: MouseEvent) => {
  if (!currentHistoryFurnace.value || !currentHistoryFurnace.value.history) return
  
  const history = currentHistoryFurnace.value.history
  if (history.length === 0) return
  
  const svgRect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
  // 计算鼠标在SVG内的相对X坐标 (0~1)
  const relativeX = (e.clientX - svgRect.left) / svgRect.width
  
  // 映射到数组索引
  const maxIndex = history.length - 1
  let index = Math.round(relativeX * maxIndex)
  if (index < 0) index = 0
  if (index > maxIndex) index = maxIndex
  
  const temp = history[index]
  
  hoverInfo.value = {
    visible: true,
    x: e.clientX - svgRect.left,
    y: e.clientY - svgRect.top - 30, // 提示框显示在鼠标上方一点
    temp: temp
  }
}

const handleChartMouseLeave = () => {
  hoverInfo.value.visible = false
}
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-weight: bold;
}

.summary-stats {
  display: flex;
  gap: 12px;
}

.furnace-card {
  height: 100%;
}

.furnace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.furnace-name {
  font-size: 16px;
}

.furnace-body {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 0;
}

.gauge-container {
  flex: 0 0 160px;
  display: flex;
  justify-content: center;
}

.info-container {
  flex: 1;
}

.temp-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.current-temp {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.target-temp {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.frame-count {
  color: var(--el-color-primary);
  font-weight: bold;
}

/* 历史曲线样式 */
.history-chart-container {
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
.chart-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.temp-chart {
  width: 100%;
  display: block;
}
.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none; /* 防止提示框遮挡鼠标事件 */
  transform: translateX(-50%); /* 水平居中 */
  z-index: 10;
  white-space: nowrap;
}
.tooltip-temp {
  font-weight: bold;
}

.furnace-footer {
  margin-top: 10px;
}

:deep(.el-collapse-item__header) {
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
