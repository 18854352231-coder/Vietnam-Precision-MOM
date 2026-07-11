﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="success" @click="handleClockIn" style="margin-right: 15px">
              {{ isClockedIn ? `已上班 (${currentTeam} - ${clockInTime})` : '上班' }}
            </el-button>
            <el-button type="danger" @click="handleClockOut" style="margin-right: 15px" v-if="isClockedIn">
              下班
            </el-button>
            <el-dropdown @command="handleMachineChange" trigger="click">
              <span class="workbench-title clickable">
                锯切工作台 - 机台 #{{ currentMachine }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="m in machineList" :key="m" :command="m">
                    机台 #{{ m }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tag :type="currentTask ? 'success' : 'info'" style="margin-left: 15px">
              {{ currentTask ? '进行中' : '未开工' }}
            </el-tag>
          </div>
          <div style="display: flex; gap: 8px;">
            <el-button type="primary" v-if="!currentTask" @click="handleOpenTaskDialog">选择排程并开工</el-button>
          </div>
        </div>
      </template>

      <div class="workbench-content">
        <!-- 排程信息 -->
        <el-descriptions border :column="4" class="task-info">
          <el-descriptions-item label="排程编号">{{ currentTask?.scheduleNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ currentTask?.orderNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentTask?.productName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="合金牌号">{{ currentTask?.alloy || '-' }}</el-descriptions-item>
          <el-descriptions-item label="模具组号">{{ currentTask?.moldGroupNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划排程数">{{ currentTask?.issueQty || 0 }}</el-descriptions-item>
          <el-descriptions-item label="定尺长度">{{ currentTask?.fixedLength || '-' }} mm</el-descriptions-item>
        </el-descriptions>
        <div v-if="currentTask" style="display: flex; gap: 16px; margin-top: 12px;">
          <el-form-item label="模具编号" style="margin-bottom: 0;">
            <el-select
              v-model="taskSelectionForm.moldNo"
              placeholder="请选择模具编号"
              clearable
              filterable
              style="width: 220px"
              @change="handleTaskMoldChange"
            >
              <el-option
                v-for="option in moldNoOptions"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="挤压批次号" style="margin-bottom: 0;">
            <el-select
              v-model="taskSelectionForm.extrusionBatchNo"
              placeholder="请选择挤压批次号"
              clearable
              filterable
              style="width: 220px"
              :disabled="!taskSelectionForm.moldNo"
              @change="handleTaskBatchChange"
            >
              <el-option
                v-for="option in extrusionBatchOptions"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 队列区域 -->
        <div class="overview-grid">
          <el-row :gutter="12">
            <!-- 左侧：装框队列 -->
            <el-col :span="12">
              <div class="status-panel has-border left-panel">
                <div class="panel-header-row" style="margin-bottom: 8px;">
                  <div class="panel-title">
                    <el-icon><Box /></el-icon>
                    装框队列
                    <el-badge :value="currentTask ? frameListData.length : 0" class="title-badge" type="primary" />
                  </div>
                </div>
                <div class="loaded-rods-container">
                  <el-table :data="currentTask ? frameListData : []" size="small" border stripe height="100%">
                    <el-table-column type="index" label="序号" width="50" align="center" />
                    <el-table-column prop="frameNo" label="框号" min-width="130" show-overflow-tooltip />
                    <el-table-column prop="branchQty" label="装框数量" width="90" align="right" />
                    <el-table-column prop="status" label="状态" width="90" align="center">
                      <template #default="scope">
                        <el-tag :type="scope.row.status === '已完工' ? 'success' : 'warning'" size="small">
                          {{ scope.row.status }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="样品" width="70" align="center">
                      <template #default="scope">
                        <el-tag :type="hasSampleByFrameNo(scope.row.frameNo) ? 'danger' : 'info'" size="small">
                          {{ hasSampleByFrameNo(scope.row.frameNo) ? '是' : '否' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="hasCPK" label="CPK" width="70" align="center">
                      <template #default="scope">
                        <el-tag :type="scope.row.hasCPK === '是' ? 'warning' : 'info'" size="small">
                          {{ scope.row.hasCPK }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="isMergeMold" label="合模" width="70" align="center">
                      <template #default="scope">
                        <el-tag :type="scope.row.isMergeMold === '是' ? 'primary' : 'info'" size="small">
                          {{ scope.row.isMergeMold }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="netWeight" label="净重" width="90" align="right" />
                    <el-table-column prop="tareWeight" label="皮重" width="90" align="right" />
                    <el-table-column prop="grossWeight" label="总重" width="90" align="right" />
                    <el-table-column label="操作" width="150" align="center">
                      <template #default="scope">
                        <el-button size="small" type="danger" link @click="handleUndoFrame(scope.row)">撤销</el-button>
                        <el-button size="small" type="success" link @click="handleFrameCompleteFromList(scope.row)">完工</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-col>

            <!-- 右侧：取样队列 -->
            <el-col :span="12">
              <div class="status-panel has-border left-panel">
                <div class="panel-header-row" style="margin-bottom: 8px;">
                  <div class="panel-title">
                    <el-icon><DataAnalysis /></el-icon>
                    取样队列
                    <el-badge :value="currentTask ? sampleListData.length : 0" class="title-badge" type="primary" />
                  </div>
                </div>
                <div class="loaded-rods-container">
                  <el-table :data="currentTask ? sampleListData : []" size="small" border stripe height="100%">
                    <el-table-column type="index" label="序号" width="50" align="center" />
                    <el-table-column prop="frameNo" label="框号" min-width="120" show-overflow-tooltip />
                    <el-table-column label="样品码" prop="sampleCode" min-width="180" show-overflow-tooltip />
                    <el-table-column prop="sampleType" label="取样类型" width="130" align="center" show-overflow-tooltip />
                    <el-table-column prop="isPrinted" label="打印" width="70" align="center">
                      <template #default="scope">
                        <el-tag :type="scope.row.isPrinted ? 'success' : 'info'" size="small">
                          {{ scope.row.isPrinted ? '是' : '否' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="160" align="center">
                      <template #default="scope">
                        <el-button size="small" type="primary" link @click="printSampleCode(scope.row)">打印二维码</el-button>
                        <el-button size="small" type="danger" link @click="revokeSample(scope.row)">撤销</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 底部操作按钮 -->
        <div class="operation-board-new">
          <el-row :gutter="12">
            <el-col :span="4" v-for="operation in operationViews" :key="operation.key" class="op-btn-col">
              <el-button
                class="full-width-btn"
                type="primary"
                :disabled="!currentTask && operation.key !== 'processDoc'"
                @click="handleOperationClick(operation)"
              >
                {{ operation.label }}
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="clockInDialogVisible" title="上班签到" width="400px">
      <el-form :model="clockInForm" label-width="80px">
        <el-form-item label="上班班组">
          <el-select v-model="clockInForm.team" style="width: 100%">
            <el-option label="A班" value="A班" />
            <el-option label="B班" value="B班" />
            <el-option label="C班" value="C班" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitClockIn">确认</el-button>
      </template>
    </el-dialog>

    <!-- 选择排程弹窗 -->
    <el-dialog v-model="taskDialogVisible" title="选择待执行生产排程" width="1200px">
      <el-table :data="pendingSchedules" border highlight-current-row @current-change="handleSelectSchedule">
        <el-table-column prop="scheduleNo" label="排程编号" width="180" show-overflow-tooltip />
        <el-table-column prop="orderNo" label="订单编号" width="160" />
        <el-table-column prop="productName" label="产品名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="alloy" label="合金牌号" width="100" align="center" />
        <el-table-column prop="rodDiameter" label="棒径(mm)" width="100" align="right" />
        <el-table-column prop="rodLength" label="棒长(mm)" width="100" align="right" />
        <el-table-column prop="rodMaterialNo" label="铝棒料号" min-width="190" show-overflow-tooltip />
        <el-table-column prop="issueQty" label="排程数量" width="120" align="right" />
        <el-table-column prop="moldGroupNo" label="模具组号" width="140" show-overflow-tooltip />
        <el-table-column prop="moldNo" label="模具编号" width="140" />
        <el-table-column prop="extrusionBatchNo" label="挤压批次号" width="170" show-overflow-tooltip />
        <el-table-column prop="planDate" label="计划生产日期" width="120" align="center" />
      </el-table>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStartWork" :disabled="!selectedRow">确认并开工</el-button>
      </template>
    </el-dialog>

    <!-- 取样弹窗 -->
    <el-dialog v-model="samplingDialogVisible" title="取样" width="600px">
      <el-form :model="samplingForm" :rules="samplingRules" ref="samplingFormRef" label-width="140px">
        <el-form-item label="框号" prop="frameNo">
          <el-select v-model="samplingForm.frameNo" placeholder="请选择装框框号" style="width: 100%">
            <el-option v-for="frame in frameListData" :key="frame.frameNo" :label="frame.frameNo" :value="frame.frameNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="取样类型" prop="sampleType">
          <el-input v-model="samplingForm.sampleType" placeholder="请输入取样类型" style="width: 100%" />
        </el-form-item>
        <el-form-item label="取样位置" prop="samplePosition">
          <el-select v-model="samplingForm.samplePosition" placeholder="请选择取样位置" style="width: 100%">
            <el-option label="头" value="T" />
            <el-option label="中" value="Z" />
            <el-option label="尾" value="W" />
          </el-select>
        </el-form-item>
        <el-form-item label="取样份数" prop="sampleQuantity">
          <el-input-number v-model="samplingForm.sampleQuantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="每份取样长度(mm)" prop="sampleLength">
          <el-input-number v-model="samplingForm.sampleLength" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="samplingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSampling">确定</el-button>
      </template>
    </el-dialog>

    <!-- 装框弹窗 -->
    <el-dialog v-model="frameDialogVisible" title="装框" width="500px">
      <el-form :model="frameForm" label-width="120px">
        <el-form-item label="料框编号">
          <el-input v-model="frameForm.frameNo" placeholder="扫码或手动输入料框编号">
             <template #append><el-button :icon="Search">扫码</el-button></template>
          </el-input>
        </el-form-item>
        <el-form-item label="长支定长(mm)">
          <el-input-number v-model="frameForm.fixedLength" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="长支数量">
          <el-input-number v-model="frameForm.branchQty" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="重量(kg)">
          <el-input-number v-model="frameForm.weight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否有样品">
          <el-radio-group v-model="frameForm.hasSample">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否有CPK">
          <el-radio-group v-model="frameForm.hasCPK">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否合模">
          <el-radio-group v-model="frameForm.isMergeMold">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="frameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFrame">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="frameCompleteDialogVisible" title="装框完工确认" width="620px">
      <el-form :model="frameCompleteInfo" label-width="110px">
        <el-form-item label="框号">
          <el-input v-model="frameCompleteInfo.frameNo" disabled />
        </el-form-item>
        <el-form-item label="是否样品">
          <el-input v-model="frameCompleteInfo.hasSample" disabled />
        </el-form-item>
        <el-form-item label="是否CPK">
          <el-radio-group v-model="frameCompleteInfo.hasCPK">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否合模">
          <el-radio-group v-model="frameCompleteInfo.isMergeMold">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="净重 (kg)">
          <el-input-number
            v-model="frameCompleteInfo.netWeight"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
            @change="syncFrameCompleteGrossWeight"
          />
        </el-form-item>
        <el-form-item label="皮重 (kg)">
          <el-input-number
            v-model="frameCompleteInfo.tareWeight"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
            @change="syncFrameCompleteGrossWeight"
          />
        </el-form-item>
        <el-form-item label="总重 (kg)">
          <el-input-number
            v-model="frameCompleteInfo.grossWeight"
            :min="0"
            :precision="2"
            style="width: 100%"
            disabled
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="frameCompleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmFrameComplete">确认完工</el-button>
      </template>
    </el-dialog>

    <!-- 报废管理弹窗 (上下布局) -->
    <el-dialog v-model="scrapDialogVisible" title="报废管理" width="700px" top="5vh">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <!-- 上方：报废登记 -->
        <div>
          <h4 style="margin-top: 0; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ebeef5;">报废登记</h4>
          <el-form :model="scrapForm" :rules="scrapRules" ref="scrapFormRef" label-width="80px">
            <el-form-item label="报废原因" prop="scrapReason">
              <el-input type="textarea" v-model="scrapForm.scrapReason" placeholder="请输入报废原因" :rows="3" />
            </el-form-item>
            <el-form-item label="报废数量" prop="scrapQty">
              <el-input-number v-model="scrapForm.scrapQty" :min="1" style="width: 200px;" />
            </el-form-item>
          </el-form>
          <div style="text-align: right; margin-top: 10px;">
            <el-button @click="scrapDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="submitScrap">提交登记</el-button>
          </div>
        </div>

        <!-- 下方：报废历史 -->
        <div>
          <h4 style="margin-top: 0; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ebeef5;">报废历史</h4>
          <el-table :data="scrapHistoryData" border style="width: 100%;" height="250">
            <el-table-column prop="scrapTime" label="报废时间" width="160" />
            <el-table-column prop="scrapReason" label="报废原因" min-width="200" show-overflow-tooltip />
            <el-table-column prop="scrapQty" label="数量" width="100" align="center" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 通用表单弹窗 (如完工确认、查看工艺文件) -->
    <el-dialog v-model="genericDialogVisible" :title="genericDialogTitle" width="760px">
      <el-form :model="genericForm" label-width="120px">
        <el-row :gutter="18">
          <el-col :span="12" v-for="field in activeGenericFields" :key="field.key">
            <el-form-item :label="field.label">
              <span v-if="field.type === 'text'">{{ genericForm[field.key] }}</span>
              <el-input
                v-else-if="field.type === 'input'"
                v-model="genericForm[field.key]"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
              />
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="genericForm[field.key]"
                :min="0"
                style="width: 100%"
                :disabled="field.disabled"
              />
              <el-select
                v-else-if="field.type === 'select'"
                v-model="genericForm[field.key]"
                style="width: 100%"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
              >
                <el-option
                  v-for="option in field.options || []"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
              <el-date-picker
                v-else-if="field.type === 'datetime'"
                v-model="genericForm[field.key]"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
                :disabled="field.disabled"
              />
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="genericForm[field.key]"
                type="textarea"
                :rows="3"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="genericDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGenericOperation">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="completeDialogVisible" title="排程完工确认" width="700px">
      <el-descriptions border :column="2" style="margin-bottom: 20px;">
        <el-descriptions-item label="排程编号">{{ currentTask?.scheduleNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单编号">{{ currentTask?.orderNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ currentTask?.productName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="合金牌号">{{ currentTask?.alloy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="模具组号">{{ currentTask?.moldGroupNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="计划排程数">{{ currentTask?.issueQty || 0 }}</el-descriptions-item>
        <el-descriptions-item label="定尺长度">{{ currentTask?.fixedLength || '-' }} mm</el-descriptions-item>
        <el-descriptions-item label="挤压批次号">{{ currentTask?.extrusionBatchNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排程开始时间">{{ currentTask?.startTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排程结束时间">{{ new Date().toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="报废总数量">{{ totalScrapQty }}</el-descriptions-item>
        <el-descriptions-item label="实际完成数量">
          <el-input-number v-model="completeForm.actualQty" :min="0" style="width: 100%" />
        </el-descriptions-item>
        <el-descriptions-item label="备注说明" :span="2">
          <el-input
            v-model="completeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="如有特殊情况请说明"
          />
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmComplete">确认完工</el-button>
      </template>
    </el-dialog>

    <ProcessDocumentDialog
      v-model="processDocDialogVisible"
      process-type="extrusion"
      :product-no="processDocContext.productNo"
      :product-name="processDocContext.productName"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, List, Grid, Search, Box, DataAnalysis } from '@element-plus/icons-vue'
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

interface ScheduleRow {
  scheduleNo: string
  orderNo: string
  productName: string
  issueQty: number
  planDate: string
  moldGroupNo: string
  moldNo: string
  moldBindings?: Array<{
    moldNo: string
    extrusionBatchNo: string
  }>
  alloy: string
  rodDiameter?: number
  rodLength?: number
  rodMaterialNo?: string
  fixedLength: number
  extrusionBatchNo?: string
  alloyGrade?: string
  plannedQty?: number
  sawedQty?: number
  startTime?: string
  remark?: string
}

interface OperationField {
  key: string
  label: string
  type: 'input' | 'number' | 'select' | 'datetime' | 'textarea' | 'text'
  placeholder?: string
  options?: string[]
  disabled?: boolean
}

interface OperationDefinition {
  key: string
  label: string
  description: string
  fields: OperationField[]
}

const currentMachine = ref('S001')
const machineList = ['S001', 'S002', 'S003', 'S004']

const taskDialogVisible = ref(false)
const selectedRow = ref<ScheduleRow | null>(null)
const currentTask = ref<ScheduleRow | null>(null)
const taskSelectionForm = ref({
  moldNo: '',
  extrusionBatchNo: ''
})

const pendingSchedules = ref<ScheduleRow[]>([
  {
    scheduleNo: 'ARTI20260228000003',
    orderNo: 'ORD-2026-001',
    productName: 'FC114',
    issueQty: 800,
    planDate: '2026-04-11',
    moldGroupNo: 'M10-0649',
    moldNo: 'M10-0649-200',
    alloy: '6063',
    rodDiameter: 152,
    rodLength: 1000,
    rodMaterialNo: '20-X152-6063-0007-L1000',
    fixedLength: 2970,
    extrusionBatchNo: 'JY20260412-001',
    moldBindings: [
      { moldNo: 'M10-0649-200', extrusionBatchNo: 'JY20260412-001' },
      { moldNo: 'M10-0649-201', extrusionBatchNo: 'JY20260412-002' }
    ]
  },
  {
    scheduleNo: 'ARTI20260228000004',
    orderNo: 'ORD-2026-002',
    productName: 'FC39',
    issueQty: 500,
    planDate: '2026-04-12',
    moldGroupNo: 'M10-0650',
    moldNo: 'M10-0650-180',
    alloy: '6061',
    rodDiameter: 178,
    rodLength: 1200,
    rodMaterialNo: '20-X178-6061-0021-L1200',
    fixedLength: 6000,
    extrusionBatchNo: 'JY20260412-003',
    moldBindings: [
      { moldNo: 'M10-0650-180', extrusionBatchNo: 'JY20260412-003' },
      { moldNo: 'M10-0650-181', extrusionBatchNo: 'JY20260412-004' }
    ]
  }
])

const sawingQueue = ref<any[]>([
  // 订单1 (NK-00) 数据
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-1-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0212', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-2-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0213', frameTime: '2026-04-14 14:30:00', isSampled: '是', sampleType: 'B01-性能样', packageNo: 'PK-20260414-001' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-3-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0214', frameTime: '2026-04-14 14:35:00', isSampled: '否', sampleType: '-', packageNo: 'PK-20260414-001' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-4-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0215', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-5-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '是', frameNo: 'CV-A-A-L6000*W1250*H650*0216', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-6-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0217', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-7-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0218', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-8-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0219', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-9-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0220', frameTime: '2026-04-14 15:10:00', isSampled: '是', sampleType: 'B02-阳极样(单独取长支)', packageNo: 'PK-20260414-002' },
  { orderNo: 'ORD-2026-001', moldNo: 'M10-0649-200', rodNo: 'JY2604140002-02-10-Z1', extrusionBatchNo: 'JY20260412-001', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0221', frameTime: '2026-04-14 15:10:00', isSampled: '否', sampleType: '-', packageNo: 'PK-20260414-002' },
  // 订单2 (FC-32) 数据
  { orderNo: 'ORD-2026-002', moldNo: 'M10-0650-180', rodNo: 'JY2604150001-01-1-Z1', extrusionBatchNo: 'JY20260412-002', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0222', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
  { orderNo: 'ORD-2026-002', moldNo: 'M10-0650-180', rodNo: 'JY2604150001-01-2-Z1', extrusionBatchNo: 'JY20260412-002', isCPK: '否', frameNo: 'CV-A-A-L6000*W1250*H650*0223', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
  { orderNo: 'ORD-2026-002', moldNo: 'M10-0650-180', rodNo: 'JY2604150001-01-3-Z1', extrusionBatchNo: 'JY20260412-002', isCPK: '是', frameNo: 'CV-A-A-L6000*W1250*H650*0224', frameTime: '-', isSampled: '否', sampleType: '-', packageNo: '-' },
])

const selectedQueue = ref<any[]>([])

const moldNoOptions = computed(() => {
  if (!currentTask.value) return []
  return (currentTask.value.moldBindings || []).map(item => item.moldNo)
})

const extrusionBatchOptions = computed(() => {
  if (!currentTask.value || !taskSelectionForm.value.moldNo) {
    return []
  }
  return (currentTask.value.moldBindings || [])
    .filter(item => item.moldNo === taskSelectionForm.value.moldNo)
    .map(item => item.extrusionBatchNo)
})

const searchForm = ref({
  moldNo: '',
  rodNo: '',
  extrusionBatchNo: '',
  isCPKMarked: '',
  frameNo: '',
  isSampled: '',
  sampleType: ''
})

const filteredSawingQueue = computed(() => {
  if (!currentTask.value) return []
  return sawingQueue.value.filter(item => {
    if (item.orderNo !== currentTask.value?.orderNo) return false
    if (searchForm.value.moldNo && !item.moldNo.includes(searchForm.value.moldNo)) return false
    if (searchForm.value.rodNo && !item.rodNo.includes(searchForm.value.rodNo)) return false
    if (searchForm.value.extrusionBatchNo && !item.extrusionBatchNo.includes(searchForm.value.extrusionBatchNo)) return false
    if (searchForm.value.isCPKMarked && item.isCPK !== searchForm.value.isCPKMarked) return false
    if (searchForm.value.frameNo && !item.frameNo.includes(searchForm.value.frameNo)) return false
    if (searchForm.value.isSampled && item.isSampled !== searchForm.value.isSampled) return false
    if (searchForm.value.sampleType && !item.sampleType.includes(searchForm.value.sampleType)) return false
    return true
  })
})

const operationDefinitions: OperationDefinition[] = [
  { key: 'frame', label: '装框', description: '将长支装入料框', fields: [] },
  { key: 'sampling', label: '取样', description: '对长支进行取样', fields: [] },
  {
    key: 'scrap',
    label: '报废',
    description: '记录报废数量、报废原因等。',
    fields: [
      { key: 'scrapReason', label: '报废原因', type: 'textarea', placeholder: '请输入报废原因' },
      { key: 'scrapQty', label: '报废数量', type: 'number' }
    ]
  },
  {
    key: 'finishConfirm',
    label: '完工确认',
    description: '确认排程完工，转入下一工序。',
    fields: [
      { key: 'scheduleNo', label: '排程编号', type: 'text' },
      { key: 'orderNo', label: '订单编号', type: 'text' },
      { key: 'productName', label: '产品品名', type: 'text' },
      { key: 'alloyGrade', label: '合金牌号', type: 'text' },
      { key: 'moldNo', label: '模具组号', type: 'text' },
      { key: 'plannedQty', label: '计划排程数', type: 'text' },
      { key: 'extrusionBatchNo', label: '挤压批次号', type: 'text' },
      { key: 'startTime', label: '排程开始时间', type: 'text' },
      { key: 'endTime', label: '排程结束时间', type: 'text' },
      { key: 'scrapQty', label: '报废数量', type: 'text' },
      { key: 'actualQty', label: '实际完成数量', type: 'number' },
      { key: 'remark', label: '备注说明', type: 'textarea', placeholder: '如有特殊情况请说明' }
    ]
  },
  {
    key: 'processDoc',
    label: '查看工艺文件',
    description: '查看当前产品对应的锯切工艺文件。',
    fields: []
  }
]

const operationViews = computed(() => operationDefinitions)

const clockInDialogVisible = ref(false)
const isClockedIn = ref(false)
const currentTeam = ref('')
const clockInTime = ref('')
const clockInForm = ref({ team: '' })

const handleClockIn = () => {
  if (isClockedIn.value) {
    ElMessage.info('您已签到上班')
    return
  }
  clockInDialogVisible.value = true
}

const submitClockIn = () => {
  if (!clockInForm.value.team) {
    ElMessage.warning('请选择上班班组')
    return
  }
  ElMessageBox.confirm(`确认选择 ${clockInForm.value.team} 上班吗？`, '二次确认', {
    type: 'warning'
  }).then(() => {
    isClockedIn.value = true
    currentTeam.value = clockInForm.value.team
    const now = new Date()
    clockInTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    clockInDialogVisible.value = false
    ElMessage.success(`${currentTeam.value} 签到成功`)
  })
}

const handleClockOut = () => {
  ElMessageBox.confirm('确认现在打卡下班吗？', '下班确认', { type: 'warning' }).then(() => {
    isClockedIn.value = false
    currentTeam.value = ''
    clockInTime.value = ''
    ElMessage.success('打卡下班成功！')
  }).catch(() => {})
}

const handleOpenTaskDialog = () => {
  if (!isClockedIn.value) {
    ElMessage.warning('请先点击上班签到，再选择排程开工')
    return
  }
  if (currentTask.value) {
    ElMessage.warning('锯切工作台不支持切换排程，请先完成当前排程')
    return
  }
  selectedRow.value = null
  taskDialogVisible.value = true
}

const handleSelectSchedule = (val: ScheduleRow) => {
  selectedRow.value = val
}

const handleTaskMoldChange = (moldNo: string) => {
  if (!currentTask.value) return
  if (!moldNo) {
    taskSelectionForm.value.extrusionBatchNo = ''
    currentTask.value.moldNo = ''
    currentTask.value.extrusionBatchNo = ''
    return
  }
  const matchedBindings = (currentTask.value.moldBindings || []).filter(item => item.moldNo === moldNo)
  const defaultBatchNo = matchedBindings[0]?.extrusionBatchNo || ''
  taskSelectionForm.value.extrusionBatchNo = defaultBatchNo
  currentTask.value.moldNo = moldNo
  currentTask.value.extrusionBatchNo = defaultBatchNo
}

const handleTaskBatchChange = (extrusionBatchNo: string) => {
  if (!currentTask.value || !taskSelectionForm.value.moldNo || !extrusionBatchNo) {
    return
  }
  currentTask.value.moldNo = taskSelectionForm.value.moldNo
  currentTask.value.extrusionBatchNo = extrusionBatchNo
}

const confirmStartWork = () => {
  if (!selectedRow.value) return
  currentTask.value = { ...selectedRow.value }
  taskSelectionForm.value = {
    moldNo: currentTask.value.moldNo || '',
    extrusionBatchNo: currentTask.value.extrusionBatchNo || ''
  }
  taskDialogVisible.value = false
  selectedRow.value = null
  ElMessage.success(`已开工：${currentTask.value.scheduleNo}`)
}

const confirmComplete = () => {
  if (currentTask.value) {
    currentTask.value.sawedQty = Number(completeForm.value.actualQty || 0)
    currentTask.value.remark = completeForm.value.remark.trim()
  }
  currentTask.value = null
  sawingQueue.value = []
  // 在此处也可以根据需要更新总的完工状态
  ElMessage.success('当前排程已全部锯切完成，排程状态已结束并转交下工序')
  completeDialogVisible.value = false
}

const handleMachineChange = (machine: string) => {
  currentMachine.value = machine
  ElMessage.success(`已切换至机台 #${machine}`)
}

const handleQueueSelection = (val: any[]) => {
  selectedQueue.value = val
}

const handleMarkCPK = () => {
  if (selectedQueue.value.length === 0) return
  selectedQueue.value.forEach(item => {
    const target = sawingQueue.value.find(q => q.rodNo === item.rodNo)
    if (target) {
      target.isCPK = '是'
    }
  })
  ElMessage.success(`已成功标记 ${selectedQueue.value.length} 条记录为CPK`)
}

const handleRevokeCPK = () => {
  if (selectedQueue.value.length === 0) return
  selectedQueue.value.forEach(item => {
    const target = sawingQueue.value.find(q => q.rodNo === item.rodNo)
    if (target) {
      target.isCPK = '否'
    }
  })
  ElMessage.success(`已成功撤销 ${selectedQueue.value.length} 条记录的CPK标记`)
}

// 装框相关
const frameDialogVisible = ref(false)
const frameCompleteDialogVisible = ref(false)
const frameForm = ref({
  frameNo: '',
  fixedLength: 0,
  branchQty: 1,
  weight: 0,
  hasSample: '否',
  hasCPK: '否',
  isMergeMold: '否'
})
const frameCompleteInfo = ref<any>({
  frameNo: '',
  batchNo: '',
  branchQty: 0,
  fixedLength: 0,
  hasSample: '否',
  hasCPK: '否',
  isMergeMold: '否',
  grossWeight: 0,
  netWeight: 0,
  tareWeight: 0,
  status: '待完工'
})

const submitFrame = () => {
  if (!frameForm.value.frameNo) {
    ElMessage.warning('请输入或扫码料框编号')
    return
  }
  if (!frameForm.value.branchQty || frameForm.value.branchQty <= 0) {
    ElMessage.warning('请输入长支数量')
    return
  }
  if (!frameForm.value.fixedLength || frameForm.value.fixedLength <= 0) {
    ElMessage.warning('请输入定长')
    return
  }
  
  // 将新框信息添加到装框列表中
  const existingFrame = frameListData.value.find(f => f.frameNo === frameForm.value.frameNo)
  if (!existingFrame) {
    frameListData.value.push({
      frameNo: frameForm.value.frameNo,
      batchNo: currentTask.value?.extrusionBatchNo || '-',
      branchQty: frameForm.value.branchQty,
      fixedLength: frameForm.value.fixedLength,
      hasSample: hasSampleByFrameNo(frameForm.value.frameNo) ? '是' : '否',
      hasCPK: frameForm.value.hasCPK,
      isMergeMold: frameForm.value.isMergeMold,
      status: '待完工',
      grossWeight: 0,
      tareWeight: 0,
      netWeight: 0
    })
  } else {
    // 若框已存在，更新其信息
    existingFrame.branchQty = frameForm.value.branchQty
    existingFrame.fixedLength = frameForm.value.fixedLength
    existingFrame.weight = frameForm.value.weight
    existingFrame.hasSample = hasSampleByFrameNo(existingFrame.frameNo) ? '是' : '否'
    existingFrame.hasCPK = frameForm.value.hasCPK
    existingFrame.isMergeMold = frameForm.value.isMergeMold
  }

  ElMessage.success('装框成功')
  frameDialogVisible.value = false
}

// 取样相关
const samplingDialogVisible = ref(false)
const samplingFormRef = ref()

// --- 报废管理状态 ---
const scrapDialogVisible = ref(false)
const scrapActiveTab = ref('register')
const scrapFormRef = ref()
const scrapForm = ref({
  scrapReason: '',
  scrapQty: 1
})
const scrapRules = {
  scrapReason: [{ required: true, message: '请输入报废原因', trigger: 'blur' }],
  scrapQty: [{ required: true, message: '请输入报废数量', trigger: 'blur' }]
}
const scrapHistoryData = ref([
  { scrapTime: '2026-05-14 10:20:00', scrapReason: '尺寸超差', scrapQty: 2 },
  { scrapTime: '2026-05-13 14:15:00', scrapReason: '表面划伤严重', scrapQty: 1 }
])
const sampleTypeOptions = [
  'A01-试片',
  'A02-验证棒预阳极',
  'B02-阳极样(单独取长支)',
  'B03-OQC样',
  'B04-扫描样',
  'B05-扩口扩孔样',
  'B06-CMM',
  'B07-泡碱样',
  'B08-Cpk样',
  'B09-二维码样尺寸',
  'B10-二维码样深度',
  'B11-二维码样直径',
  'B12-投影样',
  'B13-粗糙度样',
  'B14-模线样',
  'B15-压痕压变样',
  'B16-翻边样',
  'B17-硬度长支',
  'B18-阳极留样',
  'B19-金相长支',
  'B20-成分长支',
  'B21-拉伸长支',
  'B22-电导率长支',
  'D01-产发验证样',
  'K01-客户寄回阳极样',
  'K02-客户寄回性能样',
  'K03-阳极客诉复测样',
  'K04-性能客诉复测样',
  'M01-MSA样'
]
const samplingForm = ref({
  frameNo: '',
  sampleType: '',
  samplePosition: 'T',
  sampleQuantity: 1,
  sampleLength: 200
})

const samplingRules = {
  frameNo: [{ required: true, message: '请选择框号', trigger: 'change' }],
  sampleType: [{ required: true, message: '请输入取样类型', trigger: 'blur' }],
  samplePosition: [{ required: true, message: '请选择取样位置', trigger: 'change' }],
  sampleQuantity: [{ required: true, message: '请输入取样份数', trigger: 'blur' }],
  sampleLength: [{ required: true, message: '请输入每份取样长度', trigger: 'blur' }]
}

const submitSampling = async () => {
  if (!samplingFormRef.value) return
  await samplingFormRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('取样成功')
      
      const batchNo = currentTask.value?.extrusionBatchNo || `B-${new Date().getTime().toString().slice(-6)}`
      
      // Add the sample to sampleListData
      for (let i = 0; i < samplingForm.value.sampleQuantity; i++) {
        // 规则: 产品名称 + 挤压批次 + 取样位置 + 序号（从01开始递增）
        const productName = currentTask.value?.productName || 'Unknown'
        const sampleSeq = String(sampleListData.value.length + 1).padStart(2, '0')
        const posStr = `${samplingForm.value.samplePosition}`
        
        sampleListData.value.unshift({
          frameNo: samplingForm.value.frameNo,
          batchNo: batchNo,
          sampleCode: `${productName}-${batchNo}-${posStr}-${sampleSeq}`,
          sampleLength: samplingForm.value.sampleLength,
          sampleType: samplingForm.value.sampleType,
          samplingTime: new Date().toLocaleString(),
          isPrinted: false
        })
      }
      syncFrameSampleStatus()
      syncSawingQueueSampleStatus()
      
      samplingDialogVisible.value = false
    }
  })
}

// 取样列表
const sampleListData = ref([
  { frameNo: 'CV-A-A-L6000*W1250*H650*0225', batchNo: 'JY20260412-001', sampleCode: 'NK-00-JY20260412-001-Z-01', sampleLength: 200, sampleType: 'B01-性能样', samplingTime: '2026-04-14 14:40:12', isPrinted: true },
  { frameNo: 'CV-A-A-L6000*W1250*H650*0226', batchNo: 'JY20260412-001', sampleCode: 'NK-00-JY20260412-001-Z-02', sampleLength: 250, sampleType: 'B19-金相长支', samplingTime: '2026-04-14 15:10:05', isPrinted: false }
])

const printSampleCode = (row: any) => {
  row.isPrinted = true
  ElMessage.success(`已打印样品码：${row.sampleCode}`)
}

const revokeSample = (row: any) => {
  ElMessageBox.confirm(`确认撤销样品 ${row.sampleCode} 吗?`, '警告', {
    type: 'warning'
  }).then(() => {
    const idx = sampleListData.value.findIndex(s => s.sampleCode === row.sampleCode)
    if (idx > -1) {
      sampleListData.value.splice(idx, 1)
      syncFrameSampleStatus()
      syncSawingQueueSampleStatus()
      ElMessage.success('已撤销取样')
    }
  })
}

// 装框列表
const frameListData = ref<any[]>([
  { 
    frameNo: 'CV-A-A-L6000*W1250*H650*0227', batchNo: 'B-260414-001', branchQty: 20, fixedLength: 2970, 
    hasSample: '是', hasCPK: '否', isMergeMold: '否', status: '待完工',
    grossWeight: 52.5, tareWeight: 2.0, netWeight: 50.5 
  },
  { 
    frameNo: 'CV-A-A-L6000*W1250*H650*0228', batchNo: 'B-260414-001', branchQty: 18, fixedLength: 2970,
    hasSample: '否', hasCPK: '是', isMergeMold: '是', status: '待完工',
    grossWeight: 50.0, tareWeight: 2.0, netWeight: 48.0 
  }
])

const hasSampleByFrameNo = (frameNo: string) => {
  return sampleListData.value.some(item => item.frameNo === frameNo)
}

const syncFrameSampleStatus = () => {
  frameListData.value.forEach(item => {
    item.hasSample = hasSampleByFrameNo(item.frameNo) ? '是' : '否'
  })
}

const syncSawingQueueSampleStatus = () => {
  sawingQueue.value.forEach(item => {
    if (!item.frameNo || item.frameNo === '-') {
      item.isSampled = '否'
      return
    }
    item.isSampled = hasSampleByFrameNo(item.frameNo) ? '是' : '否'
  })
}

syncFrameSampleStatus()
syncSawingQueueSampleStatus()

const handleUndoFrame = (row: any) => {
  ElMessageBox.confirm(`确认撤销框号 ${row.frameNo} 的装框吗？`, '撤销装框确认', {
    type: 'warning'
  }).then(() => {
    frameListData.value = frameListData.value.filter(item => item.frameNo !== row.frameNo)
    ElMessage.success(`框号 ${row.frameNo} 已撤销装框`)
  })
}

const handleFrameCompleteFromList = (row: any) => {
  frameCompleteInfo.value = {
    ...row,
    hasSample: hasSampleByFrameNo(row.frameNo) ? '是' : '否'
  }
  syncFrameCompleteGrossWeight()
  frameCompleteDialogVisible.value = true
}

const syncFrameCompleteGrossWeight = () => {
  const net = Number(frameCompleteInfo.value.netWeight || 0)
  const tare = Number(frameCompleteInfo.value.tareWeight || 0)
  frameCompleteInfo.value.grossWeight = Number((net + tare).toFixed(2))
}

const confirmFrameComplete = () => {
  const target = frameListData.value.find(item => item.frameNo === frameCompleteInfo.value.frameNo)
  if (target) {
    target.hasSample = hasSampleByFrameNo(target.frameNo) ? '是' : '否'
    target.hasCPK = frameCompleteInfo.value.hasCPK
    target.isMergeMold = frameCompleteInfo.value.isMergeMold
    target.grossWeight = frameCompleteInfo.value.grossWeight
    target.tareWeight = frameCompleteInfo.value.tareWeight
    target.netWeight = frameCompleteInfo.value.netWeight
    target.status = '已完工'
  }
  frameCompleteDialogVisible.value = false
  ElMessage.success(`框号 ${frameCompleteInfo.value.frameNo} 装框完成指令已提交`)
}

const totalScrapQty = computed(() => {
  return scrapHistoryData.value.reduce((sum, item) => sum + item.scrapQty, 0)
})

const totalCompletedQty = computed(() => {
  return frameListData.value
    .reduce((sum, item) => sum + item.branchQty, 0)
})

const completeDialogVisible = ref(false)
const completeForm = ref({
  actualQty: 0,
  remark: ''
})

// 通用操作弹窗
const genericDialogVisible = ref(false)
const genericDialogTitle = ref('')
const currentGenericOperation = ref<OperationDefinition | null>(null)
const genericForm = ref<Record<string, string | number>>({})
const activeGenericFields = computed(() => currentGenericOperation.value?.fields || [])
const processDocDialogVisible = ref(false)
const processDocContext = ref({
  productNo: '',
  productName: ''
})

const handleOperationClick = (operation: OperationDefinition) => {
  if (operation.key === 'frame') {
    frameForm.value = {
      frameNo: '',
      fixedLength: currentTask.value?.fixedLength || 0,
      branchQty: 1,
      weight: 0,
      hasSample: '否',
      hasCPK: '否',
      isMergeMold: '否'
    }
    frameDialogVisible.value = true
    return
  }

  if (operation.key === 'sampling') {
    if (!currentTask.value) {
      ElMessage.warning('请先开工排程后再进行取样操作')
      return
    }
    samplingForm.value = {
      frameNo: '',
      sampleType: '',
      samplePosition: 'T',
      sampleQuantity: 1,
      sampleLength: 200
    }
    samplingDialogVisible.value = true
    return
  }

  if (operation.key === 'scrap') {
    if (!currentTask.value) {
      ElMessage.warning('请先开工排程')
      return
    }
    scrapForm.value = { scrapReason: '', scrapQty: 1 }
    scrapDialogVisible.value = true
    return
  }

  if (operation.key === 'finishConfirm') {
    if (!currentTask.value) {
      ElMessage.warning('请先开工排程')
      return
    }
    completeForm.value = {
      actualQty: totalCompletedQty.value,
      remark: currentTask.value.remark || ''
    }
    completeDialogVisible.value = true
    return
  }

  if (operation.key === 'processDoc') {
    processDocContext.value = {
      productNo: String((currentTask.value as any)?.productNo || ''),
      productName: String(currentTask.value?.productName || '')
    }
    processDocDialogVisible.value = true
    return
  }

  currentGenericOperation.value = operation
  genericDialogTitle.value = operation.label
  genericForm.value = createDefaultForm(operation.fields)

  genericDialogVisible.value = true
}

const createDefaultForm = (fields: OperationField[]) => {
  const target: Record<string, string | number> = {}
  fields.forEach((field) => {
    target[field.key] = field.type === 'number' ? 0 : ''
  })
  return target
}

const submitGenericOperation = () => {
  if (!currentGenericOperation.value) return

  ElMessage.success(`${currentGenericOperation.value.label} 操作已完成`)
  genericDialogVisible.value = false
}

const submitScrap = async () => {
  if (!scrapFormRef.value) return
  await scrapFormRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('报废登记成功')
      
      // 添加到报废历史
      scrapHistoryData.value.unshift({
        scrapTime: new Date().toLocaleString(),
        scrapReason: scrapForm.value.scrapReason,
        scrapQty: scrapForm.value.scrapQty
      })
      
      // 清空表单以便继续登记
      scrapForm.value = { scrapReason: '', scrapQty: 1 }
    }
  })
}
</script>

<style scoped>
.page-container {
  padding: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.workbench-title {
  font-size: 16px;
  font-weight: bold;
}

.workbench-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-info {
  margin-bottom: 0;
}

.overview-grid {
  display: flex;
  flex-direction: column;
}



.status-panel {
  padding: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.has-border {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.left-panel {
  height: 540px;
}

.half-height {
  height: calc(270px - 6px);
}

.full-width-panel {
  width: 100%;
}

.panel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.title-badge {
  margin-top: 2px;
}

.loaded-rods-container {
  flex: 1;
  overflow: hidden;
}

.operation-board-new {
  margin-top: 0;
  padding: 8px 0;
}

.op-btn-col {
  margin-bottom: 12px;
}

.full-width-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
