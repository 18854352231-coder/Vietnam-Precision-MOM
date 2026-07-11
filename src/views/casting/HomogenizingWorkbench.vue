<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="workbench-title">均质工作台 - 1#均质炉</span>
            <el-tag :type="furnaceStatusTag" style="margin-left: 15px">
              {{ furnaceStatus }}
            </el-tag>
          </div>
          <div class="header-right">
            <el-button type="success" @click="handleClockIn" style="margin-right: 15px">
              {{ isClockedIn ? `已上班 (${currentTeam} - ${clockInTime})` : '上班签到' }}
            </el-button>
            <el-button type="danger" @click="handleClockOut" v-if="isClockedIn">
              下班
            </el-button>
          </div>
        </div>
      </template>

      <div class="workbench-content">
        <!-- 均质炉状态信息 -->
        <el-descriptions border :column="4" class="task-info">
          <el-descriptions-item label="炉台状态">
            <el-tag :type="furnaceStatusTag">{{ furnaceStatus }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="实时温度">
            <span class="temp-text" :class="{'hot': currentTemp > 100}">{{ currentTemp }} ℃</span>
          </el-descriptions-item>
          <el-descriptions-item label="目标温度">{{ targetTemp }} ℃</el-descriptions-item>
          <el-descriptions-item label="设定保温时间">{{ holdTime }} 小时</el-descriptions-item>
          <el-descriptions-item label="已运行时长">{{ runTime }}</el-descriptions-item>
          <el-descriptions-item label="炉内总数">{{ totalInsideQty }} 支</el-descriptions-item>
          <el-descriptions-item label="炉内总重">{{ totalInsideWeight }} kg</el-descriptions-item>
        </el-descriptions>

        <div class="layout-grid">
          <!-- 左侧：待收料列表 -->
          <div class="left-panel panel-box">
            <div class="panel-header">
              <span class="panel-title">待收料列表</span>
              <el-button type="primary" size="small" @click="handleBatchLoad" :disabled="!selectedPending.length">
                批量装炉
              </el-button>
            </div>
            <div class="panel-body">
              <el-table :data="pendingList" border stripe height="100%" size="small" @selection-change="handlePendingSelection">
                <el-table-column type="selection" width="45" align="center" />
                <el-table-column prop="batchNo" label="铸造批次" min-width="140" show-overflow-tooltip />
                <el-table-column prop="alloy" label="合金" width="80" align="center" />
                <el-table-column prop="spec" label="规格" width="80" align="center" />
                <el-table-column prop="qty" label="数量" width="70" align="right" />
                <el-table-column label="操作" width="80" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleLoadFurnace(row)">装炉</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 右侧区域 -->
          <div class="right-panel panel-box">
            <el-tabs v-model="activeDetailTab" class="custom-tabs">
              <el-tab-pane label="均质炉内详情" name="inside">
                <div class="tab-toolbar">
                  <el-button type="success" size="small" @click="handleBatchUnload" :disabled="!selectedInside.length || furnaceStatus !== '空闲'">批量出炉</el-button>
                  <span class="toolbar-tip" v-if="furnaceStatus !== '空闲'">（需等均质完成并处于空闲状态才能出炉）</span>
                </div>
                <el-table :data="insideList" border stripe height="calc(100% - 40px)" size="small" @selection-change="handleInsideSelection">
                  <el-table-column type="selection" width="45" align="center" :selectable="() => furnaceStatus === '空闲'" />
                  <el-table-column type="index" label="序号" width="50" align="center" />
                  <el-table-column prop="batchNo" label="铸造批次" min-width="150" />
                  <el-table-column prop="alloy" label="合金" width="80" align="center" />
                  <el-table-column prop="spec" label="规格" width="80" align="center" />
                  <el-table-column prop="qty" label="数量(支)" width="80" align="right" />
                  <el-table-column prop="weight" label="重量(kg)" width="90" align="right" />
                  <el-table-column prop="loadTime" label="装炉时间" width="140" align="center" />
                  <el-table-column label="操作" width="80" align="center">
                    <template #default="{ row }">
                      <el-button type="success" link size="small" @click="handleUnload(row)" :disabled="furnaceStatus !== '空闲'">出炉</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="出炉实绩" name="records">
                <el-table :data="recordList" border stripe height="100%" size="small">
                  <el-table-column type="index" label="序号" width="50" align="center" />
                  <el-table-column prop="batchNo" label="铸造批次" min-width="150" />
                  <el-table-column prop="alloy" label="合金" width="80" align="center" />
                  <el-table-column prop="qty" label="数量(支)" width="80" align="right" />
                  <el-table-column prop="weight" label="重量(kg)" width="90" align="right" />
                  <el-table-column prop="homogenizeEndTime" label="均质完成时间" width="150" align="center" />
                  <el-table-column prop="unloadTime" label="出炉时间" width="150" align="center" />
                  <el-table-column prop="operator" label="操作人" width="100" align="center" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="operation-board">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-button class="full-width-btn" color="#303133" @click="handleFurnaceAction('开始加热')" :disabled="furnaceStatus !== '空闲' && furnaceStatus !== '冷却中'">开始加热</el-button>
            </el-col>
            <el-col :span="6">
              <el-button class="full-width-btn" color="#303133" @click="handleFurnaceAction('开始保温')" :disabled="furnaceStatus !== '加热中'">开始保温</el-button>
            </el-col>
            <el-col :span="6">
              <el-button class="full-width-btn" color="#303133" @click="handleFurnaceAction('开始冷却')" :disabled="furnaceStatus !== '保温中'">开始冷却</el-button>
            </el-col>
            <el-col :span="6">
              <el-button class="full-width-btn" color="#303133" @click="handleFurnaceAction('均质完成')" :disabled="furnaceStatus !== '冷却中'">均质完成</el-button>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>

    <!-- 签到弹窗 -->
    <el-dialog v-model="clockInDialogVisible" title="上班签到" width="400px">
      <el-form label-width="80px">
        <el-form-item label="班组">
          <el-select v-model="selectedTeam" placeholder="请选择班组" style="width: 100%">
            <el-option label="均质A班" value="均质A班" />
            <el-option label="均质B班" value="均质B班" />
            <el-option label="均质C班" value="均质C班" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmClockIn">确定签到</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

// ==== 签到逻辑 ====
const isClockedIn = ref(false)
const clockInTime = ref('')
const currentTeam = ref('')
const clockInDialogVisible = ref(false)
const selectedTeam = ref('')

const handleClockIn = () => {
  if (isClockedIn.value) {
    ElMessage.info('您已签到')
    return
  }
  selectedTeam.value = ''
  clockInDialogVisible.value = true
}

const confirmClockIn = () => {
  if (!selectedTeam.value) {
    ElMessage.warning('请选择班组')
    return
  }
  isClockedIn.value = true
  currentTeam.value = selectedTeam.value
  const now = new Date()
  clockInTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  clockInDialogVisible.value = false
  ElMessage.success(`签到成功！当前班组：${currentTeam.value}`)
}

const handleClockOut = () => {
  ElMessageBox.confirm('确定要下班吗？下班后将无法进行工作台操作。', '下班确认', {
    type: 'warning'
  }).then(() => {
    isClockedIn.value = false
    currentTeam.value = ''
    clockInTime.value = ''
    ElMessage.success('已成功下班')
  }).catch(() => {})
}

const checkClockIn = () => {
  if (!isClockedIn.value) {
    ElMessage.warning('请先进行上班签到！')
    return false
  }
  return true
}

// ==== 炉子运行状态 ====
const furnaceStatus = ref('空闲') // 空闲, 加热中, 保温中, 冷却中
const currentTemp = ref(25)
const targetTemp = ref(580)
const holdTime = ref(8)
const runTime = ref('00:00:00')

const furnaceStatusTag = computed(() => {
  switch (furnaceStatus.value) {
    case '空闲': return 'info'
    case '加热中': return 'danger'
    case '保温中': return 'warning'
    case '冷却中': return 'primary'
    default: return 'info'
  }
})

let timer: any = null
const startTimer = () => {
  if (timer) clearInterval(timer)
  let seconds = 0
  timer = setInterval(() => {
    seconds++
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    runTime.value = `${h}:${m}:${s}`
    
    if (furnaceStatus.value === '加热中' && currentTemp.value < targetTemp.value) {
      currentTemp.value += 5
    } else if (furnaceStatus.value === '冷却中' && currentTemp.value > 25) {
      currentTemp.value -= 5
    }
  }, 1000)
}

const handleFurnaceAction = (action: string) => {
  if (!checkClockIn()) return
  
  if (action === '开始加热' && insideList.value.length === 0) {
    ElMessage.warning('炉内为空，请先装炉')
    return
  }

  ElMessageBox.confirm(`确认执行【${action}】操作吗？`, '操作确认', {
    type: 'warning'
  }).then(() => {
    if (action === '开始加热') {
      furnaceStatus.value = '加热中'
      startTimer()
    } else if (action === '开始保温') {
      furnaceStatus.value = '保温中'
      currentTemp.value = targetTemp.value
    } else if (action === '开始冷却') {
      furnaceStatus.value = '冷却中'
    } else if (action === '均质完成') {
      furnaceStatus.value = '空闲'
      currentTemp.value = 25
      if (timer) clearInterval(timer)
      runTime.value = '00:00:00'
      // 记录均质完成时间
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
      insideList.value.forEach(item => {
        item.homogenizeEndTime = timeStr
      })
    }
    ElMessage.success(`${action}指令已下发`)
  }).catch(() => {})
}

// ==== 数据列表 ====
const pendingList = ref([
  { id: 1, batchNo: 'CAST-20260416-001', alloy: '6063', spec: 'Φ178', qty: 24, weight: 12000 },
  { id: 2, batchNo: 'CAST-20260416-002', alloy: '6061', spec: 'Φ152', qty: 30, weight: 11500 },
  { id: 3, batchNo: 'CAST-20260415-008', alloy: '6063', spec: 'Φ200', qty: 18, weight: 10800 },
])

const insideList = ref<any[]>([])
const recordList = ref<any[]>([
  { id: 99, batchNo: 'CAST-20260414-005', alloy: '6063', qty: 24, weight: 12000, homogenizeEndTime: '2026-04-15 14:00', unloadTime: '2026-04-15 15:30', operator: '均质A班' }
])

const activeDetailTab = ref('inside')
const selectedPending = ref<any[]>([])
const selectedInside = ref<any[]>([])

const totalInsideQty = computed(() => insideList.value.reduce((sum, item) => sum + item.qty, 0))
const totalInsideWeight = computed(() => insideList.value.reduce((sum, item) => sum + item.weight, 0))

// ==== 操作方法 ====
const handlePendingSelection = (val: any[]) => { selectedPending.value = val }
const handleInsideSelection = (val: any[]) => { selectedInside.value = val }

const loadToFurnace = (items: any[]) => {
  if (furnaceStatus.value !== '空闲') {
    ElMessage.warning('均质炉正在运行中，无法装炉')
    return false
  }
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
  
  items.forEach(item => {
    insideList.value.push({
      ...item,
      loadTime: timeStr,
      homogenizeEndTime: ''
    })
    const index = pendingList.value.findIndex(p => p.id === item.id)
    if (index > -1) pendingList.value.splice(index, 1)
  })
  return true
}

const handleLoadFurnace = (row: any) => {
  if (!checkClockIn()) return
  if (loadToFurnace([row])) {
    ElMessage.success('装炉成功')
  }
}

const handleBatchLoad = () => {
  if (!checkClockIn()) return
  if (loadToFurnace(selectedPending.value)) {
    ElMessage.success(`批量装炉成功，共 ${selectedPending.value.length} 批次`)
    selectedPending.value = []
  }
}

const unloadFromFurnace = (items: any[]) => {
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
  
  items.forEach(item => {
    recordList.value.unshift({
      ...item,
      unloadTime: timeStr,
      operator: currentTeam.value
    })
    const index = insideList.value.findIndex(i => i.id === item.id)
    if (index > -1) insideList.value.splice(index, 1)
  })
}

const handleUnload = (row: any) => {
  if (!checkClockIn()) return
  unloadFromFurnace([row])
  ElMessage.success('出炉成功')
}

const handleBatchUnload = () => {
  if (!checkClockIn()) return
  unloadFromFurnace(selectedInside.value)
  ElMessage.success(`批量出炉成功，共 ${selectedInside.value.length} 批次`)
  selectedInside.value = []
}

</script>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--bg-primary);
}
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.el-card__body) {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.workbench-title {
  font-size: 18px;
  font-weight: bold;
}
.header-left, .header-right {
  display: flex;
  align-items: center;
}

.workbench-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  gap: 16px;
}
.task-info {
  margin-bottom: 0px;
}
:deep(.task-info .el-descriptions__label) {
  width: 120px;
  background-color: var(--el-fill-color-light);
}

.layout-grid {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

/* 面板通用样式 */
.panel-box {
  background: #fff;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-title {
  font-size: 15px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  border-left: 4px solid var(--el-color-primary);
  padding-left: 8px;
}
.panel-body {
  flex: 1;
  padding: 12px;
  overflow: hidden;
}

/* 左右分栏 */
.left-panel {
  flex: 3;
  min-width: 350px;
}
.right-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.temp-text {
  font-size: 20px;
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
}
.temp-text.hot {
  color: #F56C6C;
}
:deep(.el-descriptions__label) {
  width: 110px;
  background: var(--el-fill-color-light);
}

/* 右侧Tabs */
.custom-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.custom-tabs > .el-tabs__header) {
  margin: 0;
  padding: 0 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
}
:deep(.custom-tabs > .el-tabs__content) {
  flex: 1;
  padding: 12px;
  overflow: hidden;
}
:deep(.el-tab-pane) {
  height: 100%;
}
.tab-toolbar {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.toolbar-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 10px;
}

/* 底部操作按钮 */
.operation-board {
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  flex-shrink: 0;
}
.full-width-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}
</style>
