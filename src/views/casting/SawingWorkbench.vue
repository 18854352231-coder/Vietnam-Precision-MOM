<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="workbench-title">锯切工作台 - 1#锯切线</span>
            <el-tag :type="machineStatus === '运行中' ? 'success' : 'info'" style="margin-left: 15px">
              {{ machineStatus }}
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
        <!-- 排程与任务信息 -->
        <el-descriptions border :column="4" class="task-info">
          <el-descriptions-item label="当前状态">
            <el-tag :type="machineStatus === '运行中' ? 'success' : 'info'">{{ machineStatus }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前作业批次">{{ currentTask?.batchNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="合金牌号">{{ currentTask?.alloy || '-' }}</el-descriptions-item>
          <el-descriptions-item label="定尺要求">{{ currentTask?.targetLength ? currentTask.targetLength + ' mm' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="原棒长度">{{ currentTask?.length ? currentTask.length + ' mm' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="剩余待切长度">{{ currentTask ? remainingLength + ' mm' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="已切短棒数">{{ outputList.length }} 支</el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress 
              v-if="currentTask"
              :percentage="Math.round(((currentTask.length - remainingLength) / currentTask.length) * 100)" 
              :stroke-width="10" 
              status="success" 
            />
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="layout-grid">
          <!-- 左侧：待锯切任务 -->
          <div class="left-panel panel-box">
            <div class="panel-header">
              <span class="panel-title">待锯切任务</span>
            </div>
            <div class="panel-body">
              <el-table :data="pendingList" border stripe height="100%" size="small">
                <el-table-column type="index" label="序号" width="50" align="center" />
                <el-table-column prop="batchNo" label="批次/棒号" min-width="140" show-overflow-tooltip />
                <el-table-column prop="alloy" label="合金" width="70" align="center" />
                <el-table-column prop="length" label="原长(mm)" width="80" align="right" />
                <el-table-column label="操作" width="70" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleLoad(row)" :disabled="currentTask !== null">
                      上料
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 右侧：明细与记录 -->
          <div class="right-panel panel-box">
            <el-tabs v-model="activeTab" class="custom-tabs">
              <el-tab-pane label="产出明细" name="output">
                <el-table :data="outputList" border stripe height="100%" size="small">
                  <el-table-column type="index" label="序号" width="50" align="center" />
                  <el-table-column prop="parentBatch" label="来源母棒" min-width="150" />
                  <el-table-column prop="billetNo" label="短棒编号" min-width="160" />
                  <el-table-column prop="alloy" label="合金" width="70" align="center" />
                  <el-table-column prop="length" label="定尺(mm)" width="80" align="right" />
                  <el-table-column prop="weight" label="重量(kg)" width="80" align="right" />
                  <el-table-column prop="time" label="产出时间" width="140" align="center" />
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="printLabel(row)">打印标示</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="废料登记" name="scrap">
                <div class="tab-toolbar">
                  <el-button type="primary" size="small" @click="scrapDialogVisible = true">手工登记废料</el-button>
                </div>
                <el-table :data="scrapList" border stripe height="calc(100% - 40px)" size="small">
                  <el-table-column type="index" label="序号" width="50" align="center" />
                  <el-table-column prop="type" label="废料类型" width="120" align="center">
                    <template #default="{ row }"><el-tag size="small" type="danger">{{ row.type }}</el-tag></template>
                  </el-table-column>
                  <el-table-column prop="sourceBatch" label="来源批次" min-width="150" />
                  <el-table-column prop="weight" label="重量(kg)" width="100" align="right" />
                  <el-table-column prop="time" label="登记时间" width="150" align="center" />
                  <el-table-column prop="operator" label="登记人" width="100" align="center" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="操作记录" name="records">
                <el-table :data="operationRecords" border stripe height="100%" size="small">
                  <el-table-column type="index" label="序号" width="50" align="center" />
                  <el-table-column prop="time" label="操作时间" width="150" align="center" />
                  <el-table-column prop="action" label="操作动作" width="120" align="center">
                    <template #default="{ row }"><el-tag size="small" :type="row.type">{{ row.action }}</el-tag></template>
                  </el-table-column>
                  <el-table-column prop="content" label="内容说明" min-width="200" />
                  <el-table-column prop="operator" label="操作人" width="100" align="center" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="operation-board">
          <el-row :gutter="12">
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('启动锯切', 'primary')" :disabled="!currentTask || isSawing">启动锯切</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('暂停锯切', 'warning')" :disabled="!isSawing">暂停锯切</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('切头切尾', 'info')" :disabled="!currentTask">切头切尾</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('产出单支', 'success')" :disabled="!isSawing || remainingLength <= 0">产出单支</el-button>
            </el-col>
            <el-col :span="4">
              <el-button class="full-width-btn" color="#303133" @click="handleAction('完工下料', 'danger')" :disabled="!currentTask">完工下料</el-button>
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
            <el-option label="锯切A班" value="锯切A班" />
            <el-option label="锯切B班" value="锯切B班" />
            <el-option label="锯切C班" value="锯切C班" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmClockIn">确定签到</el-button>
      </template>
    </el-dialog>

    <!-- 废料登记弹窗 -->
    <el-dialog v-model="scrapDialogVisible" title="废料登记" width="400px">
      <el-form :model="scrapForm" label-width="80px">
        <el-form-item label="废料类型">
          <el-select v-model="scrapForm.type" style="width: 100%">
            <el-option label="锯切铝屑" value="锯切铝屑" />
            <el-option label="切头切尾料" value="切头切尾料" />
            <el-option label="不合格短棒" value="不合格短棒" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源批次">
          <el-input v-model="scrapForm.sourceBatch" placeholder="选填" />
        </el-form-item>
        <el-form-item label="重量(kg)">
          <el-input-number v-model="scrapForm.weight" :min="0.1" :precision="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scrapDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitScrap">确 定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, VideoPause, Scissor, Finished, CircleCheck } from '@element-plus/icons-vue'
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

// ==== 数据定义 ====
const pendingList = ref([
  { id: 1, batchNo: 'CAST-20260416-001', alloy: '6063', spec: 'Φ178', length: 6000 },
  { id: 2, batchNo: 'CAST-20260416-002', alloy: '6063', spec: 'Φ178', length: 6000 },
  { id: 3, batchNo: 'CAST-20260416-003', alloy: '6061', spec: 'Φ152', length: 5800 },
])

const currentTask = ref<any>(null)
const machineStatus = ref('空闲') // 空闲, 运行中
const isSawing = ref(false)
const remainingLength = ref(0)
const currentBillets = ref<number[]>([]) // 用于动画显示的短棒

const outputList = ref<any[]>([])
const scrapList = ref<any[]>([])
const operationRecords = ref<any[]>([])
const activeTab = ref('output')

// 废料登记
const scrapDialogVisible = ref(false)
const scrapForm = ref({
  type: '切头切尾料',
  sourceBatch: '',
  weight: 5.0
})

// ==== 操作逻辑 ====
const logOperation = (action: string, content: string, type: string = 'info') => {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
  operationRecords.value.unshift({
    time: timeStr,
    action,
    content,
    operator: currentTeam.value || '系统',
    type
  })
}

const handleLoad = (row: any) => {
  if (!checkClockIn()) return
  if (currentTask.value) {
    ElMessage.warning('当前有正在作业的铝棒，请先完工下料')
    return
  }
  
  currentTask.value = {
    ...row,
    targetLength: 800 // 假设默认定尺切800mm
  }
  remainingLength.value = row.length
  currentBillets.value = []
  
  // 从列表中移除
  const idx = pendingList.value.findIndex(p => p.id === row.id)
  if (idx > -1) pendingList.value.splice(idx, 1)

  logOperation('上料装机', `装入铝棒批次：${row.batchNo}`, 'primary')
  ElMessage.success('上料成功，准备就绪')
}

const handleAction = (action: string, type: string) => {
  if (!checkClockIn()) return

  if (['启动锯切', '暂停锯切', '切头切尾', '产出单支', '完工下料'].includes(action)) {
    // 处理各种控制逻辑
    if (action === '启动锯切') {
      isSawing.value = true
      machineStatus.value = '运行中'
      logOperation(action, '启动锯切机运行', type)
    } 
    else if (action === '暂停锯切') {
      isSawing.value = false
      machineStatus.value = '空闲'
      logOperation(action, '暂停锯切机运行', type)
    }
    else if (action === '切头切尾') {
      remainingLength.value -= 100 // 假设切掉100mm
      logOperation(action, `切除头尾料，扣减原棒长度100mm`, type)
      ElMessage.success('切头尾完成，已自动记录废料预估量')
    }
    else if (action === '产出单支') {
      if (remainingLength.value < currentTask.value.targetLength) {
        ElMessage.warning('剩余长度不足以切一支定尺短棒')
        return
      }
      
      // 动画展示
      if (currentBillets.value.length > 4) currentBillets.value.shift()
      currentBillets.value.push(Date.now())
      
      // 数据处理
      remainingLength.value -= currentTask.value.targetLength
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
      
      const billetNo = `${currentTask.value.batchNo}-${outputList.value.length + 1}`
      outputList.value.unshift({
        parentBatch: currentTask.value.batchNo,
        billetNo: billetNo,
        alloy: currentTask.value.alloy,
        length: currentTask.value.targetLength,
        weight: 45.5, // 模拟计算重量
        time: timeStr
      })
      
      logOperation(action, `产出短棒: ${billetNo}`, type)
      ElMessage.success('单支产出成功')
    }
    else if (action === '完工下料') {
      ElMessageBox.confirm('确定将当前长棒标记为加工完成并下料吗？', '完工确认', {
        type: 'warning'
      }).then(() => {
        logOperation(action, `批次 ${currentTask.value.batchNo} 锯切完工，剩余长度 ${remainingLength.value}mm 计入余料/废料`, type)
        isSawing.value = false
        machineStatus.value = '空闲'
        currentTask.value = null
        remainingLength.value = 0
        currentBillets.value = []
        ElMessage.success('已完工下料')
      }).catch(() => {})
    }
  }
}

const submitScrap = () => {
  if (!checkClockIn()) return
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
  
  scrapList.value.unshift({
    type: scrapForm.value.type,
    sourceBatch: scrapForm.value.sourceBatch || '--',
    weight: scrapForm.value.weight,
    time: timeStr,
    operator: currentTeam.value
  })
  
  logOperation('废料登记', `登记 ${scrapForm.value.type} ${scrapForm.value.weight}kg`, 'danger')
  scrapDialogVisible.value = false
  ElMessage.success('废料登记成功')
}

const printLabel = (row: any) => {
  ElMessage.success(`正在打印短棒 ${row.billetNo} 的标识码...`)
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
  min-width: 300px;
}
.right-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  min-width: 0;
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
