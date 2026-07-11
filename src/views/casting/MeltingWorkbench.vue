<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="success" @click="handleClockIn" style="margin-right: 15px">
              {{ isClockedIn ? `已上班 (${currentTeam} - ${clockInTime})` : '上班签到' }}
            </el-button>
            <el-button type="danger" @click="handleClockOut" style="margin-right: 15px" v-if="isClockedIn">
              下班
            </el-button>
            <span class="workbench-title">熔炼工作台 - {{ activeFurnace === 3 ? '1#保温炉' : activeFurnace + '#熔炼炉' }}</span>
            <el-tag :type="currentFurnaceData.scheduleNo ? 'success' : 'info'" style="margin-left: 15px">
              {{ currentFurnaceData.scheduleNo ? '排程进行中' : '暂无排程' }}
            </el-tag>
          </div>
          <el-button type="primary" v-if="!currentFurnaceData.scheduleNo && activeFurnace !== 3" @click="openScheduleDialog" :disabled="!isClockedIn">选择排程并开工</el-button>
          <el-button type="danger" v-if="currentFurnaceData.scheduleNo && activeFurnace !== 3" @click="handleFinishSchedule" :disabled="!isClockedIn">完成当前排程</el-button>
        </div>
      </template>

      <div class="workbench-content">
        <!-- 熔炼炉状态信息 -->
        <el-descriptions border :column="4" class="task-info">
          <el-descriptions-item label="炉台状态">
            <el-tag :type="getProcessTagType(currentFurnaceData.currentProcess)" effect="dark">{{ currentFurnaceData.currentProcess || '空闲' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="实时温度">
            <span class="temp-text" :class="{'hot': currentFurnaceData.currentTemp > 100}">{{ currentFurnaceData.currentTemp }} ℃</span>
          </el-descriptions-item>
          <el-descriptions-item label="当前排程">{{ currentFurnaceData.scheduleNo || '--' }}</el-descriptions-item>
          <el-descriptions-item label="目标合金">{{ currentFurnaceData.alloy || '--' }}</el-descriptions-item>
          <el-descriptions-item label="计划重量">{{ currentFurnaceData.planWeight ? currentFurnaceData.planWeight + ' kg' : '--' }}</el-descriptions-item>
          <el-descriptions-item label="已投料">{{ currentFurnaceData.loadedWeight ? currentFurnaceData.loadedWeight + ' kg' : '--' }}</el-descriptions-item>
          <el-descriptions-item label="目标温度">{{ currentFurnaceData.targetTemp ? currentFurnaceData.targetTemp + ' ℃' : '--' }}</el-descriptions-item>
          <el-descriptions-item label="操作员">{{ currentTeam || '--' }}</el-descriptions-item>
        </el-descriptions>

        <div class="layout-grid">
          <div class="left-panel panel-box">
            <div class="panel-header">
              <span class="panel-title">熔炼炉实时状态</span>
              <div>
                <el-button type="primary" size="small" @click="openOperationRecords">查看操作记录</el-button>
              </div>
            </div>
            <div class="panel-body">
              <div class="status-simple-container">
                <div class="furnaces-wrapper">
                  <!-- 1# 熔炼炉 -->
                  <fieldset class="simple-status-card" :class="{'is-active-furnace': activeFurnace === 1}" @click="activeFurnace = 1">
                        <legend class="card-title">
                          1# 熔炼炉 
                          <el-tag size="small" :type="getProcessTagType(furnace1.currentProcess)" style="margin-left: 8px;">
                            {{ furnace1.currentProcess === '空闲' ? '空闲' : '运行中' }}
                          </el-tag>
                        </legend>
                        <div class="info-row">
                          <span class="info-label">当前操作步骤：</span>
                          <span class="info-value">{{ furnace1.currentProcess || '空闲' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">实时温度：</span>
                          <span class="info-value">{{ furnace1.currentTemp }} ℃</span>
                        </div>
                        <div class="info-row" v-if="furnace1.scheduleNo">
                          <span class="info-label">当前排程：</span>
                          <span class="info-value">{{ furnace1.scheduleNo }} ({{ furnace1.alloy }})</span>
                        </div>
                      </fieldset>

                      <!-- 2# 熔炼炉 -->
                      <fieldset class="simple-status-card" :class="{'is-active-furnace': activeFurnace === 2}" @click="activeFurnace = 2">
                        <legend class="card-title">
                          2# 熔炼炉
                          <el-tag size="small" :type="getProcessTagType(furnace2.currentProcess)" style="margin-left: 8px;">
                            {{ furnace2.currentProcess === '空闲' ? '空闲' : '运行中' }}
                          </el-tag>
                        </legend>
                        <div class="info-row">
                          <span class="info-label">当前操作步骤：</span>
                          <span class="info-value">{{ furnace2.currentProcess || '空闲' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">实时温度：</span>
                          <span class="info-value">{{ furnace2.currentTemp }} ℃</span>
                        </div>
                        <div class="info-row" v-if="furnace2.scheduleNo">
                          <span class="info-label">当前排程：</span>
                          <span class="info-value">{{ furnace2.scheduleNo }} ({{ furnace2.alloy }})</span>
                        </div>
                      </fieldset>

                      <!-- 1# 保温炉 -->
                      <fieldset class="simple-status-card" :class="{'is-active-furnace': activeFurnace === 3}" @click="activeFurnace = 3">
                        <legend class="card-title">
                          1# 保温炉
                          <el-tag size="small" :type="getProcessTagType(furnace3.currentProcess)" style="margin-left: 8px;">
                            {{ furnace3.currentProcess === '空闲' ? '空闲' : '运行中' }}
                          </el-tag>
                        </legend>
                        <div class="info-row">
                          <span class="info-label">当前操作步骤：</span>
                          <span class="info-value">{{ furnace3.currentProcess || '空闲' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">实时温度：</span>
                          <span class="info-value">{{ furnace3.currentTemp }} ℃</span>
                        </div>
                        <div class="info-row" v-if="furnace3.scheduleNo">
                          <span class="info-label">当前排程：</span>
                          <span class="info-value">{{ furnace3.scheduleNo }} ({{ furnace3.alloy }})</span>
                        </div>
                      </fieldset>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="operation-board">
          <el-row :gutter="12" style="margin-bottom: 12px;">
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('清炉')">清炉</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" :disabled="activeFurnace === 3" @click="handleAction('装炉')">装炉</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" :disabled="activeFurnace === 3" @click="handleAction('点火')">点火</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('拔渣')">拔渣</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('取样')">取样</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('配料')">配料</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="12">
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('搅拌')">搅拌</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('精炼')">精炼</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('静置调温')">静置调温</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="viewProcessDocument">查看工艺文件</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="openOperationRecords">操作记录</el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 保温炉附加操作按钮（如需要特殊展示，可另行扩展，此处保留统一面板） -->
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

    <!-- 选择排程弹窗 -->
    <el-dialog v-model="scheduleDialogVisible" title="选择熔铸排程" width="800px">
      <el-table :data="scheduleList" border stripe @row-click="handleSelectSchedule">
        <el-table-column width="55" align="center">
          <template #default="{ row }">
            <el-radio v-model="selectedScheduleId" :label="row.id"><i></i></el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="scheduleNo" label="排程号" width="160" />
        <el-table-column prop="alloy" label="合金牌号" width="100" />
        <el-table-column prop="planWeight" label="计划重量(kg)" width="120" align="right" />
        <el-table-column prop="targetTemp" label="目标温度(℃)" width="120" align="right" />
        <el-table-column prop="planDate" label="计划生产日期" width="120" align="center" />
      </el-table>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBindSchedule">确认绑定</el-button>
      </template>
    </el-dialog>

    <ProcessDocumentDialog
      v-model="processDocDialogVisible"
      process-type="casting"
      :product-no="processDocContext.productNo"
      :product-name="processDocContext.productName"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Delete, Sell, Odometer, Scissor, Filter, 
  TakeawayBox, Refresh, MagicStick, Sunset, Document 
} from '@element-plus/icons-vue'
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'
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

// ==== 熔炼炉状态 ====
const activeFurnace = ref(1) // 当前操作的炉台 (1, 2 或 3(保温炉))

const furnace1 = ref<any>({
  currentTemp: 740,
  metalLevel: 60,
  currentProcess: '熔炼中',
  loadedWeight: 14500,
  scheduleNo: 'ARTI-20260415-001',
  alloy: '6063',
  planWeight: 15000,
  targetTemp: 745
})

const furnace2 = ref<any>({
  currentTemp: 25,
  metalLevel: 0,
  currentProcess: '空闲',
  loadedWeight: 0,
  scheduleNo: '',
  alloy: '',
  planWeight: 0,
  targetTemp: 0
})

const furnace3 = ref<any>({
  currentTemp: 735,
  metalLevel: 40,
  currentProcess: '保温中',
  loadedWeight: 10000,
  scheduleNo: '',
  alloy: '6063',
  planWeight: 10000,
  targetTemp: 740
})

const getTargetFurnace = () => {
  if (activeFurnace.value === 1) return furnace1.value
  if (activeFurnace.value === 2) return furnace2.value
  return furnace3.value
}

const currentFurnaceData = computed<any>(() => getTargetFurnace())

const getProcessTagType = (process: string) => {
  switch (process) {
    case '清炉': return 'info'
    case '点火': return 'danger'
    case '熔炼中': return 'danger'
    case '装炉': return 'primary'
    case '配料': return 'warning'
    case '静置调温': return 'success'
    case '空闲': return 'info'
    default: return 'primary'
  }
}

// ==== 操作控制 ====
const recordsDialogVisible = ref(false)
const processDocDialogVisible = ref(false)
const processDocContext = ref({
  productNo: '',
  productName: ''
})
const operationRecords = ref([
  { time: '2026-04-15 10:30:00', action: '搅拌', content: '开启电磁搅拌 15分钟', operator: '熔铸A班', type: 'primary' },
  { time: '2026-04-15 10:15:00', action: '配料', content: '加入纯镁锭 15kg', operator: '熔铸A班', type: 'warning' },
  { time: '2026-04-15 09:50:00', action: '取样', content: '炉前第一次取样', operator: '熔铸A班', type: 'success' },
  { time: '2026-04-15 08:30:00', action: '点火', content: '熔炼炉点火升温', operator: '熔铸A班', type: 'danger' },
  { time: '2026-04-15 08:00:00', action: '装炉', content: '装入废铝和铝锭共 14500kg', operator: '熔铸A班', type: 'primary' },
])

const handleAction = (action: string) => {
  if (!isClockedIn.value) {
    ElMessage.warning('请先进行上班签到！')
    return
  }

  ElMessageBox.confirm(`确认对 ${activeFurnace.value === 3 ? '1#保温炉' : activeFurnace.value + '#熔炼炉'} 执行【${action}】操作吗？`, '操作确认', {
    type: 'warning'
  }).then(() => {
    const targetFurnace = getTargetFurnace()
    targetFurnace.currentProcess = action
    
    // 模拟温度变化
    if (action === '点火') targetFurnace.currentTemp += 15
    if (action === '清炉') {
      targetFurnace.currentTemp = 200
      targetFurnace.currentProcess = '空闲'
      targetFurnace.scheduleNo = ''
      targetFurnace.alloy = ''
      targetFurnace.planWeight = 0
      targetFurnace.targetTemp = 0
    }
    
    // 静置调温逻辑：将排程转移到保温炉
    if (action === '静置调温') {
      furnace3.value.scheduleNo = targetFurnace.scheduleNo
      furnace3.value.alloy = targetFurnace.alloy
      furnace3.value.planWeight = targetFurnace.planWeight
      furnace3.value.targetTemp = targetFurnace.targetTemp
      furnace3.value.currentProcess = '保温中'
      
      targetFurnace.scheduleNo = ''
      targetFurnace.alloy = ''
      targetFurnace.planWeight = 0
      targetFurnace.targetTemp = 0
      targetFurnace.currentProcess = '空闲'
      
      ElMessage.success(`排程已成功转移至 1#保温炉，${activeFurnace.value}#熔炼炉已空闲`)
    }

    const now = new Date()
    const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
    
    operationRecords.value.unshift({
      time: timeStr,
      action: action,
      content: `[${activeFurnace.value === 3 ? '1#保温炉' : activeFurnace.value + '#熔炼炉'}] 执行${action}操作`,
      operator: currentTeam.value,
      type: getProcessTagType(action)
    })

    ElMessage.success(`${activeFurnace.value === 3 ? '1#保温炉' : activeFurnace.value + '#熔炼炉'} ${action}操作已记录`)
  }).catch(() => {})
}

const openOperationRecords = () => {
  recordsDialogVisible.value = true
}

const viewProcessDocument = () => {
  processDocContext.value = {
    productNo: '',
    productName: String((selectedScheduleRow.value as any)?.productName || '')
  }
  processDocDialogVisible.value = true
}

// ==== 排程绑定逻辑 ====
const scheduleDialogVisible = ref(false)
const selectedScheduleId = ref<number | null>(null)
const selectedScheduleRow = ref<any>(null)

const scheduleList = ref([
  { id: 1, scheduleNo: 'ARTI-20260515-001', alloy: '6063', planWeight: 15000, targetTemp: 745, planDate: '2026-05-15' },
  { id: 2, scheduleNo: 'ARTI-20260515-002', alloy: '6061', planWeight: 12000, targetTemp: 750, planDate: '2026-05-15' },
  { id: 3, scheduleNo: 'ARTI-20260516-001', alloy: '6082', planWeight: 10000, targetTemp: 760, planDate: '2026-05-16' }
])

const openScheduleDialog = () => {
  if (currentFurnaceData.value.scheduleNo) {
    ElMessage.warning(`当前 ${activeFurnace.value === 3 ? '1#保温炉' : activeFurnace.value + '#熔炼炉'} 已绑定排程 ${currentFurnaceData.value.scheduleNo}，请先完工或解绑。`)
    return
  }
  selectedScheduleId.value = null
  selectedScheduleRow.value = null
  scheduleDialogVisible.value = true
}

const handleSelectSchedule = (row: any) => {
  selectedScheduleId.value = row.id
  selectedScheduleRow.value = row
}

const confirmBindSchedule = () => {
  if (!selectedScheduleRow.value) {
    ElMessage.warning('请选择要绑定的排程')
    return
  }
  
  const targetFurnace = getTargetFurnace()
  targetFurnace.scheduleNo = selectedScheduleRow.value.scheduleNo
  targetFurnace.alloy = selectedScheduleRow.value.alloy
  targetFurnace.planWeight = selectedScheduleRow.value.planWeight
  targetFurnace.targetTemp = selectedScheduleRow.value.targetTemp
  
  ElMessage.success(`${activeFurnace.value === 3 ? '1#保温炉' : activeFurnace.value + '#熔炼炉'}成功绑定排程 ${selectedScheduleRow.value.scheduleNo}`)
  scheduleDialogVisible.value = false
}

const handleFinishSchedule = () => {
  ElMessageBox.confirm(`确认完成当前排程 [${currentFurnaceData.value.scheduleNo}] 吗？`, '完成确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success(`排程 ${currentFurnaceData.value.scheduleNo} 已完成`)
    const targetFurnace = getTargetFurnace()
    targetFurnace.scheduleNo = ''
    targetFurnace.alloy = ''
    targetFurnace.planWeight = 0
    targetFurnace.targetTemp = 0
    targetFurnace.loadedWeight = 0
    targetFurnace.currentProcess = '空闲'
  }).catch(() => {})
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

/* 简单状态展示 */
.status-simple-container {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  height: calc(100% - 32px);
  background: transparent;
  border-radius: 8px;
}
.furnaces-wrapper {
  display: flex;
  gap: 24px;
  width: 100%;
  height: 100%;
}
.simple-status-card {
  flex: 1;
  min-width: 320px;
  background: #fafafa;
  border: 2px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 20px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  cursor: pointer;
  transition: all 0.3s;
}
.simple-status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  background: #fff;
}
.is-active-furnace {
  background: #fff;
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 4px var(--el-color-primary-light-8);
}
.simple-status-card .card-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto;
  margin-bottom: 20px;
  padding: 0 16px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 12px;
}
.simple-status-card .info-row {
  font-size: 18px;
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 350px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  padding-bottom: 16px;
}
.simple-status-card .info-row:last-child {
  border-bottom: none;
}
.info-label {
  color: var(--el-text-color-regular);
}
.info-value {
  font-weight: bold;
  color: var(--el-text-color-primary);
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
