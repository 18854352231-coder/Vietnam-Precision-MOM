<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="workbench-title">铸造工作台 - 1#铸造机</span>
            <el-tag :type="currentTask ? currentStatusTag : 'info'" style="margin-left: 15px">
              {{ currentTask ? currentStatus : '未开工' }}
            </el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleOpenTaskDialog" style="margin-right: 15px">
              {{ currentTask ? '切换铸造盘' : '选择铸造盘并开工' }}
            </el-button>
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
        <!-- 铸造盘信息 -->
        <el-descriptions border :column="4" class="task-info">
          <el-descriptions-item label="当前状态">
            <el-tag :type="currentTask ? currentStatusTag : 'info'">{{ currentTask ? currentStatus : '未开工' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前排程">{{ currentTask?.scheduleNo || '--' }}</el-descriptions-item>
          <el-descriptions-item label="合金牌号">{{ currentTask?.alloy || '--' }}</el-descriptions-item>
          <el-descriptions-item label="铸造规格">{{ currentTask?.spec || '--' }} (直径/尺寸)</el-descriptions-item>
          <el-descriptions-item label="铸棒支数">{{ currentTask?.rodCount ? currentTask.rodCount + ' 支' : '--' }}</el-descriptions-item>
          <el-descriptions-item label="计划长度">{{ currentTask?.targetLength ? currentTask.targetLength + ' mm' : '--' }}</el-descriptions-item>
          <el-descriptions-item label="目标重量">{{ currentTask?.targetWeight ? currentTask.targetWeight + ' kg' : '--' }}</el-descriptions-item>
          <el-descriptions-item label="来源熔炼炉">{{ currentTask?.sourceFurnace || '--' }}</el-descriptions-item>
          <el-descriptions-item label="结晶器编号">{{ currentTask?.crystallizerNo || '--' }}</el-descriptions-item>
          <el-descriptions-item label="当前进度">
            <el-progress :percentage="castingProgress" :stroke-width="10" status="success" />
          </el-descriptions-item>
        </el-descriptions>

        <div class="layout-grid">
          <div class="left-panel panel-box">
            <div class="panel-header">
              <span class="panel-title">操作记录</span>
              <el-button type="primary" size="small" @click="openOperationRecords">查看全部</el-button>
            </div>
            <div class="panel-body">
              <el-table :data="operationRecords" border stripe height="100%" size="small">
                <el-table-column type="index" label="序号" width="50" align="center" />
                <el-table-column prop="time" label="操作时间" width="150" align="center" />
                <el-table-column prop="action" label="操作动作" width="120" align="center">
                  <template #default="{ row }"><el-tag size="small" :type="row.type">{{ row.action }}</el-tag></template>
                </el-table-column>
                <el-table-column prop="content" label="内容说明" min-width="200" />
                <el-table-column prop="operator" label="操作人" width="100" align="center" />
              </el-table>
            </div>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="operation-board">
          <el-row :gutter="12" style="margin-bottom: 12px;">
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('铸造前点检', 'primary')">铸造前点检</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('在线细化', 'info')">在线细化</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('在线除气', 'info')">在线除气</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('管式过滤', 'info')">管式过滤</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('开始铸造', 'danger')">开始铸造</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('铸造过程', 'warning')">铸造过程</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="12">
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('取样', 'success')">取样</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('均质前取样', 'success')">均质前取样</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('完工确认', 'primary')">完工确认</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('铸造失败', 'danger')">铸造失败</el-button>
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
            <el-option label="熔铸A班" value="熔铸A班" />
            <el-option label="熔铸B班" value="熔铸B班" />
            <el-option label="熔铸C班" value="熔铸C班" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmClockIn">确定签到</el-button>
      </template>
    </el-dialog>
    
    <!-- 操作记录弹窗 -->
    <el-dialog v-model="recordsDialogVisible" title="操作记录" width="800px">
      <el-table :data="operationRecords" border stripe height="400px">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="time" label="操作时间" width="180" align="center" />
        <el-table-column prop="action" label="操作类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="操作内容" min-width="200" />
        <el-table-column prop="operator" label="操作人" width="100" align="center" />
      </el-table>
    </el-dialog>

    <!-- 选择铸造盘弹窗 -->
    <el-dialog v-model="taskDialogVisible" title="选择铸造盘并开工" width="800px">
      <el-table 
        :data="pendingCastingTasks" 
        border 
        stripe 
        highlight-current-row
        @current-change="handleTaskSelection"
      >
        <el-table-column prop="scheduleNo" label="排程编号" width="160" />
        <el-table-column prop="crystallizerNo" label="结晶器编号" width="140" />
        <el-table-column prop="alloy" label="合金牌号" width="100" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="rodCount" label="支数" width="80" />
        <el-table-column prop="targetWeight" label="目标重量(kg)" width="120" />
        <el-table-column prop="sourceFurnace" label="来源熔炼炉" min-width="120" />
      </el-table>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStartWork" :disabled="!selectedTask">确认并开工</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  List, Operation, WindPower, Filter, VideoPlay, 
  DataLine, Scissor, Aim, CircleCheck, CircleClose, Document 
} from '@element-plus/icons-vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

// ==== 签到状态 ====
const isClockedIn = ref(false)
const clockInTime = ref('')
const currentTeam = ref('')
const clockInDialogVisible = ref(false)
const selectedTeam = ref('')

const handleClockIn = () => {
  if (isClockedIn.value) {
    ElMessage.info('您已签到，请勿重复操作')
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
    type: 'warning',
    confirmButtonText: '确认下班',
    cancelButtonText: '取消'
  }).then(() => {
    isClockedIn.value = false
    currentTeam.value = ''
    clockInTime.value = ''
    ElMessage.success('已成功下班')
  }).catch(() => {})
}

// ==== 铸造状态 ====
const currentStatus = ref('准备就绪') // 准备就绪, 铸造中, 铸造完成, 铸造失败
const castingProgress = ref(0) // 0-100%

const currentStatusTag = computed(() => {
  switch (currentStatus.value) {
    case '准备就绪': return 'info'
    case '铸造中': return 'warning'
    case '铸造完成': return 'success'
    case '铸造失败': return 'danger'
    default: return 'info'
  }
})

// ==== 铸造盘/排程信息 ====
const currentTask = ref<any>(null)

const taskDialogVisible = ref(false)
const selectedTask = ref<any>(null)

const pendingCastingTasks = ref([
  {
    scheduleNo: 'CAST-20260524-001',
    crystallizerNo: 'CRY-178-01',
    alloy: '6063',
    spec: 'Φ178',
    rodCount: 24,
    targetLength: 6000,
    targetWeight: 12000,
    sourceFurnace: '1#熔炼炉',
  },
  {
    scheduleNo: 'CAST-20260524-002',
    crystallizerNo: 'CRY-152-02',
    alloy: '6061',
    spec: 'Φ152',
    rodCount: 30,
    targetLength: 6000,
    targetWeight: 10000,
    sourceFurnace: '2#熔炼炉',
  },
  {
    scheduleNo: 'CAST-20260524-003',
    crystallizerNo: 'CRY-120-03',
    alloy: '6082',
    spec: 'Φ120',
    rodCount: 40,
    targetLength: 6000,
    targetWeight: 8000,
    sourceFurnace: '3#熔炼炉',
  }
])

const handleOpenTaskDialog = () => {
  if (!isClockedIn.value) {
    ElMessage.warning('请先进行上班签到！')
    return
  }
  selectedTask.value = null
  taskDialogVisible.value = true
}

const handleTaskSelection = (val: any) => {
  selectedTask.value = val
}

const confirmStartWork = () => {
  if (!selectedTask.value) return
  
  currentTask.value = { ...selectedTask.value }
  currentStatus.value = '准备就绪'
  castingProgress.value = 0
  taskDialogVisible.value = false
  
  ElMessage.success(`已开工，当前铸造盘：${currentTask.value.crystallizerNo}`)
  
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
  
  operationRecords.value.unshift({
    time: timeStr,
    action: '排程开工',
    content: `选择铸造盘并开工，排程：${currentTask.value.scheduleNo}`,
    operator: currentTeam.value,
    type: 'success'
  })
}

// ==== 操作控制 ====
const recordsDialogVisible = ref(false)
const operationRecords = ref([
  { time: '2026-04-16 08:30:00', action: '排程下发', content: '接收铸造排程 CAST-20260416-002', operator: '系统', type: 'info' }
])

const handleAction = (action: string, type: string) => {
  if (!isClockedIn.value) {
    ElMessage.warning('请先进行上班签到！')
    return
  }
  if (!currentTask.value) {
    ElMessage.warning('请先选择铸造盘并开工！')
    return
  }

  ElMessageBox.confirm(`确认执行【${action}】操作吗？`, '操作确认', {
    type: 'warning'
  }).then(() => {
    // 模拟状态变化
    if (action === '开始铸造') {
      currentStatus.value = '铸造中'
      castingProgress.value = 10
    } else if (action === '铸造过程') {
      if (currentStatus.value === '铸造中') {
        castingProgress.value = Math.min(100, castingProgress.value + 30)
      }
    } else if (action === '完工确认') {
      currentStatus.value = '铸造完成'
      castingProgress.value = 100
    } else if (action === '铸造失败') {
      currentStatus.value = '铸造失败'
    }

    const now = new Date()
    const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
    
    operationRecords.value.unshift({
      time: timeStr,
      action: action,
      content: `执行${action}操作`,
      operator: currentTeam.value,
      type: type
    })

    ElMessage.success(`${action}操作已记录`)
  }).catch(() => {})
}

const openOperationRecords = () => {
  recordsDialogVisible.value = true
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
  padding: 20px;
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

/* 主体布局 */
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
  flex: 1;
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
