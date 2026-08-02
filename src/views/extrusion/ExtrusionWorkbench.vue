﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
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
                挤压工作台 - 机台 #{{ currentMachine }}
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
            <el-button type="primary" @click="handleOpenTaskDialog">
              {{ currentTask ? '切换排程' : '选择排程并开工' }}
            </el-button>
          </div>
        </div>
      </template>

      <div class="workbench-content">
        <el-descriptions border :column="4" class="task-info">
          <el-descriptions-item label="排程编号">{{ currentTask?.scheduleNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="当前订单">{{ currentTask?.orderNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="产品品名">{{ currentTask?.productName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="合金牌号">{{ currentTask?.alloy || '-' }}</el-descriptions-item>
          <el-descriptions-item label="模具组号">{{ currentTask?.moldGroupNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划排程数">{{ currentTask?.issueQty || 0 }}</el-descriptions-item>
          <el-descriptions-item label="棒径">{{ currentTask?.rodDiameter || '-' }} mm</el-descriptions-item>
          <el-descriptions-item label="棒长">{{ currentTask?.rodLength || '-' }} mm</el-descriptions-item>
        </el-descriptions>

        <div class="overview-grid">
          <div class="status-panel">
            <div class="panel-header-row">
              <div class="panel-title">
                <el-icon><Fries /></el-icon>
                模具加热队列
                <el-badge :value="heatingQueue.length" class="title-badge" type="info" />
              </div>
              <div class="panel-subtitle">支持多模具并行</div>
            </div>

            <div class="search-bar" style="padding: 8px 12px; border-bottom: 1px solid #ebeef5; display: flex; gap: 10px;">
              <el-input v-model="searchFormMold.moldNo" placeholder="模具编号" size="small" clearable style="width: 150px;" />
              <el-select v-model="searchFormMold.status" placeholder="状态" size="small" clearable style="width: 100px;">
                <el-option label="加热中" value="加热中" />
                <el-option label="到温待用" value="到温待用" />
                <el-option label="使用中" value="使用中" />
              </el-select>
            </div>
            
            <div class="heating-cards-container">
              <div v-for="item in filteredHeatingQueue" :key="item.moldNo" class="heating-card">
                <div class="card-left">
                  <div class="card-row-top">
                    <span class="mold-id">{{ item.moldNo }}</span>
                    <el-tag :type="heatingStatusTag(item.status)" size="small" effect="light" class="status-tag">
                      <el-icon><component :is="getStatusIcon(item.status)" /></el-icon>
                      {{ item.status }}
                    </el-tag>
                    <el-tag size="small" type="info" effect="plain" class="alloy-tag">已挤: {{ item.extrudedCount || 0 }} / {{ item.extrusionLimit || 0 }}</el-tag>
                  </div>
                  <div class="temp-info">
                    <div>当前 <span class="temp-val">{{ item.currentTemp }}℃</span> · 目标 <span class="temp-val">{{ item.targetTemp }}℃</span></div>
                    <div style="margin-top: 4px; font-size: 12px; color: #666;">
                      炉号: {{ item.furnaceNo || '-' }} | 方位: {{ item.furnacePosition || '-' }} | 排程编号: {{ item.scheduleNo || '-' }} | 挤压批次号: {{ item.extrusionBatchNo || '-' }}
                    </div>
                  </div>
                  <el-progress 
                    :percentage="item.progress" 
                    :color="getProgressColor(item.status)"
                    :show-text="false" 
                    :stroke-width="6"
                    class="card-progress"
                  />
                </div>
                <div class="card-right">
                  <el-button 
                    v-if="item.status === '加热中'"
                    size="small" 
                    class="black-border-btn"
                    @click="handleMoldAction(item, '到温')"
                  >模具到温</el-button>
                  <el-button 
                    v-else-if="item.status === '到温待用'"
                    size="small" 
                    class="black-border-btn"
                    @click="handleMoldAction(item, '上模')"
                  >上模</el-button>
                  <el-button 
                    v-else-if="item.status === '使用中'"
                    size="small" 
                    class="black-border-btn"
                    @click="handleMoldAction(item, '卸模')"
                  >卸模</el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="status-panel">
            <div class="panel-header-row">
              <div class="panel-title">
                <el-icon><List /></el-icon>
                铝棒队列
                <el-badge :value="currentTask ? filteredLoadedRods.length : 0" class="title-badge" type="primary" />
              </div>
              <div class="panel-actions" v-if="currentTask">
                <el-button size="small" type="warning" @click="handleRodRejection">剔料</el-button>
                <el-button size="small" type="info" @click="rejectionDetailVisible = true">剔料明细</el-button>
              </div>
            </div>
            
            <div class="search-bar" v-if="currentTask" style="padding: 8px 12px; border-bottom: 1px solid #ebeef5; display: flex; gap: 10px;">
              <el-input v-model="searchFormRod.rodNo" placeholder="铝棒编号" size="small" clearable style="width: 150px;" />
              <el-input v-model="searchFormRod.extrusionBatchNo" placeholder="挤压批次号" size="small" clearable style="width: 150px;" />
              <el-select v-model="searchFormRod.status" placeholder="状态" size="small" clearable style="width: 100px;">
                <el-option label="待挤压" value="待挤压" />
                <el-option label="已挤压" value="已挤压" />
              </el-select>
            </div>

            <div class="loaded-rods-container">
              <el-table :data="currentTask ? filteredLoadedRods : []" size="small" border stripe height="100%" @selection-change="handleRodSelection">
                <el-table-column type="selection" width="50" align="center" />
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column prop="rodNo" label="铝棒编号" min-width="180" show-overflow-tooltip />
                <el-table-column prop="extrusionBatchNo" label="挤压批次号" width="160" align="center" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === '已挤压' ? 'success' : 'warning'" size="small">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="loadTime" label="上料时间" width="160" align="center" />
                <el-table-column prop="extrusionTime" label="挤压时间" width="160" align="center" />
              </el-table>
            </div>
          </div>
        </div>

        <div class="operation-board-new">
          <el-row :gutter="12">
            <el-col :span="4" v-for="operation in operationViews" :key="operation.key" class="op-btn-col">
              <el-button
                class="full-width-btn"
                type="primary"
                :disabled="isOperationDisabled(operation)"
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
            <el-option v-for="team in extrusionSawingTeams" :key="team" :label="team" :value="team" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitClockIn">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="taskDialogVisible" :title="currentTask ? '切换执行生产排程' : '选择待执行生产排程'" width="1200px">
      <el-table :data="pendingSchedules" border highlight-current-row @current-change="handleSelectSchedule">
        <el-table-column prop="scheduleNo" label="排程编号" width="180" show-overflow-tooltip />
        <el-table-column prop="orderNo" label="订单编号" width="160" show-overflow-tooltip />
        <el-table-column prop="productName" label="产品名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="alloy" label="合金牌号" width="100" align="center" />
        <el-table-column prop="rodDiameter" label="棒径(mm)" width="100" align="right" />
        <el-table-column prop="rodLength" label="棒长(mm)" width="100" align="right" />
        <el-table-column prop="rodMaterialNo" label="铝棒料号" min-width="190" show-overflow-tooltip />
        <el-table-column prop="issueQty" label="排程数量" width="120" align="right" />
        <el-table-column prop="moldGroupNo" label="模具组号" width="120" show-overflow-tooltip />
        <el-table-column prop="planDate" label="计划生产日期" width="140" align="center" />
      </el-table>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStartWork" :disabled="!selectedRow">
          {{ currentTask ? '确认切换排程' : '确认并开工' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="pickingDialogVisible" title="领料申请" width="980px">
      <div class="dialog-info-grid">
        <div>排程编号：{{ currentTask?.scheduleNo }}</div>
        <div>合金牌号：{{ currentTask?.alloy }}</div>
        <div>产品名称：{{ currentTask?.productName }}</div>
        <div>棒径(MM)：{{ currentTask?.rodDiameter }}</div>
        <div>铝棒料号：{{ currentTask?.rodMaterialNo }}</div>
        <div>棒长(MM)：{{ currentTask?.rodLength }}</div>
      </div>
      <el-table :data="pickingRows" border>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="furnaceBatch" label="铝棒炉次号" min-width="140" show-overflow-tooltip />
        <el-table-column prop="scheduleQty" label="排程数量" width="110" align="right" />
        <el-table-column prop="stockQty" label="仓库数量" width="110" align="right" />
        <el-table-column prop="appliedQty" label="已申请数量" width="110" align="right" />
        <el-table-column prop="issuedQty" label="已发料数量" width="110" align="right" />
        <el-table-column prop="receivedQty" label="已收料数量" width="110" align="right" />
        <el-table-column label="本次申请数量" width="140" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.requestQty" :min="0" :max="scope.row.scheduleQty" style="width: 100%" />
          </template>
        </el-table-column>
      </el-table>
      <div class="record-title">申请记录</div>
      <el-table :data="pickingRecords" border>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="pickOrderNo" label="申请单号" width="180" />
        <el-table-column prop="furnaceBatch" label="铝棒炉次号" />
        <el-table-column prop="team" label="班组" width="100" align="center" />
        <el-table-column prop="qty" label="申请数量" width="100" align="right" />
        <el-table-column prop="applyTime" label="申请时间" align="center" />
      </el-table>
      <template #footer>
        <el-button @click="pickingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPicking">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="receivingDialogVisible" title="收料" width="980px">
      <div class="dialog-info-grid">
        <div>排程编号：{{ currentTask?.scheduleNo }}</div>
        <div>合金牌号：{{ currentTask?.alloy }}</div>
        <div>产品名称：{{ currentTask?.productName }}</div>
        <div>棒径(MM)：{{ currentTask?.rodDiameter }}</div>
        <div>铝棒料号：{{ currentTask?.rodMaterialNo }}</div>
        <div>棒长(MM)：{{ currentTask?.rodLength }}</div>
      </div>
      <div class="inline-form">
        <span>领料单号</span>
        <el-select v-model="receivingForm.pickOrderNo" placeholder="请选择" style="width: 220px">
          <el-option label="MO202602280001" value="MO202602280001" />
          <el-option label="MO202603020002" value="MO202603020002" />
        </el-select>
      </div>
      <template v-if="receivingForm.pickOrderNo">
        <el-table :data="receivingRows" border>
          <el-table-column type="index" label="序号" width="70" align="center" />
          <el-table-column prop="furnaceBatch" label="铝棒炉次号" />
          <el-table-column prop="scheduleQty" label="排程数量" width="110" align="right" />
          <el-table-column prop="appliedQty" label="已申请数量" width="110" align="right" />
          <el-table-column prop="issuedQty" label="已发料数量" width="110" align="right" />
          <el-table-column prop="receivedQty" label="已收料数量" width="110" align="right" />
          <el-table-column label="本次收料数量" width="140" align="center">
            <template #default="scope">
              <el-input-number v-model="scope.row.currentQty" :min="0" :max="scope.row.issuedQty" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="本次收料重量" width="140" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.currentWeight" />
            </template>
          </el-table-column>
        </el-table>
        <div class="record-title">收料记录</div>
        <el-table :data="receivingRecords" border>
          <el-table-column type="index" label="序号" width="70" align="center" />
          <el-table-column prop="pickOrderNo" label="申请单号" />
          <el-table-column prop="team" label="班组" width="100" align="center" />
          <el-table-column prop="issuedQty" label="实发数量" width="100" align="right" />
          <el-table-column prop="issueTime" label="发料时间" align="center" />
          <el-table-column prop="receivedQty" label="实收数量" width="100" align="right" />
          <el-table-column prop="receiveTime" label="收料时间" align="center" />
        </el-table>
      </template>
      <template #footer>
        <el-button @click="receivingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReceiving">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="heatingDialogVisible" title="模具加热" width="1150px">
      <el-form :model="heatingForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="模具编号" required>
              <el-select v-model="heatingForm.moldNo" placeholder="请选择">
                <el-option v-for="m in receivedMolds" :key="m" :label="m" :value="m" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="加热炉号" required>
              <el-select v-model="heatingForm.furnaceNo" placeholder="请选择">
                <el-option label="1#加热炉" value="1#加热炉" />
                <el-option label="2#加热炉" value="2#加热炉" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="炉内方位" required>
              <el-select v-model="heatingForm.furnacePosition" placeholder="请选择">
                <el-option label="左" value="左" />
                <el-option label="右" value="右" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="入炉时间" required>
              <el-date-picker
                v-model="heatingForm.inTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="record-title">加热记录</div>
      <el-table :data="heatingRecords" border>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="moldNo" label="模具编号" />
        <el-table-column prop="furnaceNo" label="加热炉号" />
        <el-table-column prop="furnacePosition" label="炉内方位" />
        <el-table-column prop="inTime" label="入炉时间" />
        <el-table-column prop="reachTime" label="到温时间" />
        <el-table-column prop="outTime" label="出炉时间" />
      </el-table>
      <template #footer>
        <el-button @click="heatingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHeating">确认</el-button>
      </template>
    </el-dialog>

    <!-- 上料弹窗 -->
    <el-dialog v-model="feedingDialogVisible" title="铝棒上料" width="600px">
      <el-form :model="feedingForm" label-width="100px">
        <el-form-item label="上料模式">
          <el-radio-group v-model="feedingMode">
            <el-radio label="coded">有码上料 (PDA)</el-radio>
            <el-radio label="uncoded">无码上料 (自动生成)</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <template v-if="feedingMode === 'coded'">
          <el-form-item label="扫码编号">
            <el-input v-model="feedingForm.scanRodNo" placeholder="请使用PDA扫码或手动输入铝棒编号">
              <template #append>
                <el-button :icon="Search" @click="appendCodedFeedingQueue">模拟扫码</el-button>
              </template>
            </el-input>
          </el-form-item>
          <div class="record-title">上料队列</div>
          <el-table :data="codedFeedingQueue" border size="small" max-height="240">
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column prop="rodNo" label="二维码编号" min-width="260" show-overflow-tooltip />
          </el-table>
        </template>
        
        <template v-else>
          <el-form-item label="炉次号">
            <el-select v-model="feedingForm.furnaceBatch" placeholder="请选择炉次号" style="width: 100%">
              <el-option v-for="item in pickingRows" :key="item.furnaceBatch" :label="item.furnaceBatch" :value="item.furnaceBatch" />
            </el-select>
          </el-form-item>
          <el-form-item label="上料数量">
            <el-input-number v-model="feedingForm.uncodedQty" :min="1" :max="100" />
            <div class="help-text">确定后将使用炉次号自动生成铝棒编号</div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseFeedingDialog">取消</el-button>
        <el-button type="primary" @click="submitFeeding">确认上料</el-button>
      </template>
    </el-dialog>

    <!-- 挤压详细弹窗 -->
    <el-dialog v-model="extrusionDetailVisible" :title="'挤压实绩 数量：' + extrusionDetailData.length" width="900px">
      <el-table :data="extrusionDetailData" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="moldNo" label="模具编号" />
        <el-table-column prop="rodNo" label="铝棒编号" />
        <el-table-column prop="team" label="班组" width="100" align="center" />
        <el-table-column prop="extrusionTime" label="挤压时间" width="160" align="center" />
      </el-table>
    </el-dialog>

    <!-- 卸模原因弹窗 -->
    <el-dialog v-model="unloadDialogVisible" title="卸模确认" width="400px">
      <el-form :model="unloadForm" label-width="80px">
        <el-form-item label="模具编号">
          <el-input v-model="unloadForm.moldNo" disabled />
        </el-form-item>
        <el-form-item label="卸模原因">
          <el-select v-model="unloadForm.reason" placeholder="请选择卸模原因" style="width: 100%">
            <el-option label="正常完成" value="正常完成" />
            <el-option label="模具损坏" value="模具损坏" />
            <el-option label="产品质量异常" value="产品质量异常" />
            <el-option label="设备故障" value="设备故障" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="unloadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUnload">确认</el-button>
      </template>
    </el-dialog>

    <!-- 剔料原因弹窗 -->
    <el-dialog v-model="rejectionDialogVisible" title="剔料" width="400px">
      <el-form :model="rejectionForm" label-width="80px">
        <el-form-item label="剔料原因">
          <el-select v-model="rejectionForm.reason" placeholder="请选择原因" style="width: 100%">
            <el-option label="模具异常" value="模具异常" />
            <el-option label="正常剔料" value="正常剔料" />
            <el-option label="设备故障" value="设备故障" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRejection">确认</el-button>
      </template>
    </el-dialog>

    <!-- 剔料明细弹窗 -->
    <el-dialog v-model="rejectionDetailVisible" title="剔料明细" width="800px">
      <el-table :data="rejectedRods" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="rodNo" label="铝棒编号" min-width="180" />
        <el-table-column prop="reason" label="剔料原因" width="120" />
        <el-table-column prop="rejectTime" label="剔料时间" width="160" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleReFeed(scope.row)">上料</el-button>
            <el-button size="small" type="warning" link @click="handleRejectReturn(scope.row)">退料</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 退料弹窗 -->
    <el-dialog v-model="returnDialogVisible" title="退料" width="500px">
      <el-form :model="returnForm" label-width="100px">
        <el-form-item label="已选铝棒">
          <div style="max-height: 120px; overflow-y: auto; width: 100%;">
            <el-tag v-for="rod in returnForm.rods" :key="rod" style="margin-right: 8px; margin-bottom: 8px;">
              {{ rod }}
            </el-tag>
          </div>
        </el-form-item>
        
        <el-form-item label="退库位置">
          <el-input v-model="returnForm.returnWarehouse" placeholder="请输入退库位置" />
        </el-form-item>
        <el-form-item label="退料原因">
          <el-input v-model="returnForm.returnReason" type="textarea" placeholder="请输入退料原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReturn">确认退料</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="genericDialogVisible" :title="genericDialogTitle" width="760px">
      <el-form :model="genericForm" label-width="120px">
        <el-row :gutter="18">
          <el-col :span="12" v-for="field in activeGenericFields" :key="field.key">
            <el-form-item :label="field.label">
              <el-input
                v-if="field.type === 'input'"
                v-model="genericForm[field.key]"
                :placeholder="field.placeholder"
              />
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="genericForm[field.key]"
                :min="0"
                style="width: 100%"
              />
              <el-select
                v-else-if="field.type === 'select'"
                v-model="genericForm[field.key]"
                style="width: 100%"
                :placeholder="field.placeholder"
                filterable
                clearable
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
              />
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="genericForm[field.key]"
                type="textarea"
                :rows="3"
                :placeholder="field.placeholder"
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

    <ProcessDocumentDialog
      v-model="processDocDialogVisible"
      process-type="extrusion"
      :product-no="processDocContext.productNo"
      :product-name="processDocContext.productName"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Check, Fries, Clock, Sunny, VideoPlay, List, Search } from '@element-plus/icons-vue'
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'
import { useMoldQueueStore } from '@/store/moldQueue'
import { storeToRefs } from 'pinia'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { extrusionSawingMachines, extrusionSawingTeams, useExtrusionSawingShift } from '@/composables/useExtrusionSawingShift'

useTaskLiteralDomI18n()

type OperationStatus = 'pending' | 'running' | 'done' | 'blocked'

interface ScheduleRow {
  scheduleNo: string
  orderNo: string
  productName: string
  issueQty: number
  planDate: string
  moldNo: string
  alloy: string
  rodDiameter: number
  rodLength: number
  rodMaterialNo: string
  extrusionBatchNo?: string
  isHoldingFurnace?: boolean
  extrudedQty?: number
  moldGroupNo?: string
}

interface OperationField {
  key: string
  label: string
  type: 'input' | 'number' | 'select' | 'datetime' | 'textarea'
  placeholder?: string
  options?: string[]
}

interface OperationDefinition {
  key: string
  label: string
  description: string
  fields: OperationField[]
}

const currentMachine = ref('1')
const machineList = extrusionSawingMachines
const extrusionBatchSeed = ref(2)

const moldQueueStore = useMoldQueueStore()
const { heatingQueue } = storeToRefs(moldQueueStore)

const searchFormMold = ref({
  moldNo: '',
  status: ''
})

const filteredHeatingQueue = computed(() => {
  return heatingQueue.value.filter(mold => {
    const matchMoldNo = !searchFormMold.value.moldNo || mold.moldNo.includes(searchFormMold.value.moldNo)
    const matchStatus = !searchFormMold.value.status || mold.status === searchFormMold.value.status
    return matchMoldNo && matchStatus
  })
})

const cloneQueueRows = <T extends Record<string, any>>(rows: T[]) => rows.map(row => ({ ...row }))

const scheduleLoadedRodsMap = ref<Record<string, any[]>>({
  ARTI20260228000003: [
    { rodNo: 'ALU-6063-20260412-001', extrusionBatchNo: 'JY20260412-001', status: '已挤压', loadTime: '2026-04-12 08:30', extrusionTime: '2026-04-12 08:45' },
    { rodNo: 'ALU-6063-20260412-002', extrusionBatchNo: 'JY20260412-001', status: '待挤压', loadTime: '2026-04-12 09:15', extrusionTime: '' },
    { rodNo: 'ALU-6063-20260412-003', extrusionBatchNo: 'JY20260412-001', status: '待挤压', loadTime: '2026-04-12 09:28', extrusionTime: '' }
  ],
  ARTI20260228000004: [
    { rodNo: 'ALU-6061-20260412-001', extrusionBatchNo: 'JY20260412-002', status: '已挤压', loadTime: '2026-04-12 10:05', extrusionTime: '2026-04-12 10:24' },
    { rodNo: 'ALU-6061-20260412-002', extrusionBatchNo: 'JY20260412-002', status: '待挤压', loadTime: '2026-04-12 10:18', extrusionTime: '' },
    { rodNo: 'ALU-6061-20260412-003', extrusionBatchNo: 'JY20260412-002', status: '待挤压', loadTime: '2026-04-12 10:32', extrusionTime: '' }
  ]
})

const scheduleHeatingQueueMap = ref<Record<string, any[]>>({
  ARTI20260228000003: [
    { moldNo: 'M10-0649-200', furnaceNo: '1#加热炉', furnacePosition: '左', productName: 'FC113', status: '到温待用', extrudedCount: 150, extrusionLimit: 200, currentTemp: 480, targetTemp: 480, progress: 100, extrusionBatchNo: 'JY20260412-001', machineNo: 'M001', scheduleNo: 'ARTI20260228000003' },
    { moldNo: 'M10-0721-104', furnaceNo: '1#加热炉', furnacePosition: '右', productName: 'FC66', status: '加热中', extrudedCount: 80, extrusionLimit: 200, currentTemp: 468, targetTemp: 480, progress: 92, extrusionBatchNo: '', machineNo: '', scheduleNo: 'ARTI20260228000003' }
  ],
  ARTI20260228000004: [
    { moldNo: 'M10-0650-180', furnaceNo: '2#加热炉', furnacePosition: '左', productName: 'FC66', status: '到温待用', extrudedCount: 60, extrusionLimit: 180, currentTemp: 480, targetTemp: 480, progress: 100, extrusionBatchNo: 'JY20260412-002', machineNo: 'M001', scheduleNo: 'ARTI20260228000004' },
    { moldNo: 'M09-0118-773', furnaceNo: '2#加热炉', furnacePosition: '右', productName: 'FC09', status: '加热中', extrudedCount: 0, extrusionLimit: 150, currentTemp: 462, targetTemp: 500, remainingTime: '8 min', progress: 92, extrusionBatchNo: '', machineNo: '', scheduleNo: 'ARTI20260228000004' }
  ]
})

const saveCurrentScheduleQueues = () => {
  if (!currentTask.value) return
  scheduleLoadedRodsMap.value[currentTask.value.scheduleNo] = cloneQueueRows(loadedRods.value)
  scheduleHeatingQueueMap.value[currentTask.value.scheduleNo] = cloneQueueRows(heatingQueue.value)
}

const resetQueueFiltersAndSelection = () => {
  selectedRods.value = []
  searchFormRod.value = { rodNo: '', extrusionBatchNo: '', status: '' }
  searchFormMold.value = { moldNo: '', status: '' }
}

const loadScheduleQueues = (scheduleNo?: string) => {
  loadedRods.value = cloneQueueRows(scheduleNo ? scheduleLoadedRodsMap.value[scheduleNo] || [] : [])
  heatingQueue.value = cloneQueueRows(scheduleNo ? scheduleHeatingQueueMap.value[scheduleNo] || [] : [])
  resetQueueFiltersAndSelection()
}

// 上料实际数据
const loadedRods = ref<any[]>([
  { rodNo: 'ALU-6063-20260412-001', extrusionBatchNo: 'JY20260412-001', status: '已挤压', loadTime: '2026-04-12 08:30', extrusionTime: '2026-04-12 08:45' },
  { rodNo: 'ALU-6063-20260412-002', extrusionBatchNo: 'JY20260412-001', status: '待挤压', loadTime: '2026-04-12 09:15', extrusionTime: '' },
])

const selectedRods = ref<any[]>([])

const searchFormRod = ref({
  rodNo: '',
  extrusionBatchNo: '',
  status: ''
})

const filteredLoadedRods = computed(() => {
  return loadedRods.value.filter(rod => {
    const matchRodNo = !searchFormRod.value.rodNo || rod.rodNo.includes(searchFormRod.value.rodNo)
    const matchBatch = !searchFormRod.value.extrusionBatchNo || (rod.extrusionBatchNo && rod.extrusionBatchNo.includes(searchFormRod.value.extrusionBatchNo))
    const matchStatus = !searchFormRod.value.status || rod.status === searchFormRod.value.status
    return matchRodNo && matchBatch && matchStatus
  })
})

const handleRodSelection = (val: any[]) => {
  selectedRods.value = val
}

const rejectedRods = ref<any[]>([])
const rejectionDialogVisible = ref(false)
const rejectionDetailVisible = ref(false)
const rejectionForm = ref({ reason: '' })

const handleRodRejection = () => {
  if (selectedRods.value.length === 0) {
    ElMessage.warning('请先在铝棒队列中选择要剔料的铝棒')
    return
  }
  if (selectedRods.value.some(r => r.status === '已挤压')) {
    ElMessage.warning('已挤压的铝棒不能剔料，请重新选择')
    return
  }
  rejectionForm.value = { reason: '' }
  rejectionDialogVisible.value = true
}

const submitRejection = () => {
  if (!rejectionForm.value.reason) {
    ElMessage.warning('请填写剔料原因')
    return
  }
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  
  selectedRods.value.forEach(rod => {
    const idx = loadedRods.value.findIndex(r => r.rodNo === rod.rodNo)
    if (idx > -1) {
      const removed = loadedRods.value.splice(idx, 1)[0]
      rejectedRods.value.push({
        ...removed,
        rejectTime: now,
        reason: rejectionForm.value.reason
      })
    }
  })
  
  rejectionDialogVisible.value = false
  ElMessage.success(`已成功剔料 ${selectedRods.value.length} 根铝棒`)
  selectedRods.value = []
}

const handleReFeed = (row: any) => {
  const idx = rejectedRods.value.findIndex(r => r.rodNo === row.rodNo)
  if (idx > -1) {
    const rod = rejectedRods.value.splice(idx, 1)[0]
    loadedRods.value.push({
      rodNo: rod.rodNo,
      extrusionBatchNo: row.extrusionBatchNo || currentTask.value?.extrusionBatchNo || '',
      status: '待挤压',
      loadTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      extrusionTime: ''
    })
    ElMessage.success(`铝棒 ${rod.rodNo} 已重新上料`)
  }
}

const handleRejectReturn = (row: any) => {
  returnForm.value = {
    rods: [row.rodNo],
    returnReason: '',
    returnWarehouse: '铝棒存储库'
  }
  returnDialogVisible.value = true
}

const generateExtrusionBatchNo = () => {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const seed = String(extrusionBatchSeed.value).padStart(3, '0')
  extrusionBatchSeed.value += 1
  return `JY${datePart}-${seed}`
}

const getCurrentUsingMold = () => heatingQueue.value.find(m => m.status === '使用中' && m.machineNo === currentMachine.value)

const getStatusIcon = (status: string) => {
  if (status === '加热中') return Fries
  if (status === '到温待用') return Sunny
  if (status === '使用中') return VideoPlay
  return Fries
}

const heatingStatusTag = (status: string) => {
  const map: Record<string, string> = {
    '加热中': 'warning',
    '到温待用': 'success',
    '使用中': 'danger'
  }
  return map[status] || 'info'
}

const getProgressColor = (status: string) => {
  if (status === '到温待用') return '#67C23A'
  if (status === '使用中') return '#F56C6C'
  return '#409EFF'
}

const handleMoldAction = (item: any, action: string) => {
  if (action === '到温') {
    item.status = '到温待用'
    item.progress = 100
    ElMessage.success(`模具 ${item.moldNo} 已到温`)
  } else if (action === '上模') {
    if (!currentTask.value) {
      ElMessage.warning('请先选择排程后再上模')
      return
    }
    
    // 查找当前机台是否已经有"使用中"的模具
    const usingMolds = heatingQueue.value.filter(m => m.status === '使用中' && m.machineNo === currentMachine.value)
    let batchNo = ''
    
    if (usingMolds.length > 0) {
      // 如果已有多模上模，则使用已有的挤压批次号
      batchNo = usingMolds[0].extrusionBatchNo || currentTask.value.extrusionBatchNo || generateExtrusionBatchNo()
    } else {
      // 否则生成新的挤压批次号
      batchNo = generateExtrusionBatchNo()
    }
    
    item.status = '使用中'
    item.scheduleNo = currentTask.value.scheduleNo
    item.extrusionBatchNo = batchNo
    item.productName = currentTask.value.productName
    item.machineNo = currentMachine.value
    
    // 更新当前任务的模具编号(多模具用逗号分隔)和挤压批次号
    currentTask.value.extrusionBatchNo = batchNo
    const allUsingMoldNos = heatingQueue.value.filter(m => m.status === '使用中' && m.machineNo === currentMachine.value).map(m => m.moldNo)
    currentTask.value.moldNo = allUsingMoldNos.join(', ')
    
    currentTask.value.moldGroupNo = allUsingMoldNos.map(m => {
      const parts = m.split('-')
      if (parts.length > 2) {
        parts.pop()
        return parts.join('-')
      }
      return m
    }).join(', ')
    
    ElMessage.success(`模具 ${item.moldNo} 已上模并关联排程，挤压批次号为 ${batchNo}`)
  } else if (action === '卸模') {
    if (item.machineNo && item.machineNo !== currentMachine.value) {
      ElMessage.warning(`该模具已在机台 ${item.machineNo} 上模，只能在本机台卸模`)
      return
    }
    unloadDialogVisible.value = true
    unloadForm.value = { moldNo: item.moldNo, reason: '' }
  }
}

const unloadDialogVisible = ref(false)
const unloadForm = ref({ moldNo: '', reason: '' })

const submitUnload = () => {
  if (!unloadForm.value.reason) {
    ElMessage.warning('请选择卸模原因')
    return
  }
  const index = heatingQueue.value.findIndex(m => m.moldNo === unloadForm.value.moldNo)
  if (index > -1) {
    heatingQueue.value.splice(index, 1)
    
    // 如果还有其他使用中的模具，更新 currentTask 的 moldNo 显示
    if (currentTask.value) {
      const allUsingMoldNos = heatingQueue.value.filter(m => m.status === '使用中' && m.machineNo === currentMachine.value).map(m => m.moldNo)
      currentTask.value.moldNo = allUsingMoldNos.length > 0 ? allUsingMoldNos.join(', ') : '-'
      currentTask.value.moldGroupNo = allUsingMoldNos.length > 0 ? allUsingMoldNos.map(m => {
        const parts = m.split('-')
        if (parts.length > 2) {
          parts.pop()
          return parts.join('-')
        }
        return m
      }).join(', ') : '-'
    }
    
    ElMessage.success(`模具 ${unloadForm.value.moldNo} 已卸模并移出队列，原因：${unloadForm.value.reason}`)
  }
  unloadDialogVisible.value = false
}

const handleMachineChange = (machine: string) => {
  currentMachine.value = machine
  ElMessage.success(`已切换至机台 #${machine}`)
}

const stepSequence = [
  { key: 'materialRequest', label: '领料' },
  { key: 'materialReceive', label: '收料' },
  { key: 'dieReceive', label: '收模' },
  { key: 'dieHeat', label: '模具加热' },
  { key: 'feeding', label: '上料' },
  { key: 'extrusion', label: '挤压' },
  { key: 'returnMaterial', label: '退料' }
]

const operationDefinitions: OperationDefinition[] = [
  {
    key: 'materialRequest',
    label: '领料',
    description: '根据排程申请铝棒物料，支持普通领料和特殊领料。',
    fields: [
      { key: 'furnaceBatch', label: '铝棒炉次号', type: 'input' },
      { key: 'requestQty', label: '本次申请数量', type: 'number' }
    ]
  },
  {
    key: 'materialReceive',
    label: '收料',
    description: '按领料单确认实收数量、重量与炉次信息。',
    fields: [
      { key: 'pickOrderNo', label: '领料单号', type: 'select', options: ['MO202602280001', 'MO202603020002'] },
      { key: 'currentQty', label: '本次收料数量', type: 'number' },
      { key: 'currentWeight', label: '本次收料重量', type: 'input' }
    ]
  },
  {
    key: 'dieReceive',
    label: '收模',
    description: '记录接收模具的来源、编号和接收时间。',
    fields: [
      { key: 'sourceLocation', label: '模具编号', type: 'select', options: ['M10-0649-200', 'M10-0650-180', 'M09-0118-100', 'M08-0110-150'] },
      { key: 'receiveTime', label: '接收时间', type: 'datetime' }
    ]
  },
  {
    key: 'dieHeat',
    label: '模具加热',
    description: '登记模具加热炉、炉内方位、入炉时间和加热记录。',
    fields: [
      { key: 'moldNo', label: '模具编号', type: 'select', options: ['M10-0649-200', 'M10-0650-180'] },
      { key: 'furnaceNo', label: '加热炉号', type: 'select', options: ['1#加热炉', '2#加热炉'] },
      { key: 'furnacePosition', label: '炉内方位', type: 'input' },
      { key: 'inTime', label: '入炉时间', type: 'datetime' }
    ]
  },
  {
    key: 'feeding',
    label: '上料',
    description: '支持有码上料（PDA扫码）和无码上料（自动生成编号）。',
    fields: [] // 自定义弹窗
  },
  {
    key: 'rodHolding',
    label: '铝棒保温',
    description: '记录该产品铝棒进炉和出炉的时间。',
    fields: [
      { key: 'inFurnaceTime', label: '进炉时间', type: 'datetime' },
      { key: 'outFurnaceTime', label: '出炉时间', type: 'datetime' },
      { key: 'holdingTemp', label: '保温温度(℃)', type: 'number' }
    ]
  },
  {
    key: 'extrusion',
    label: '挤压',
    description: '选择已上料铝棒进行挤压作业。',
    fields: [] // 自定义弹窗
  },
  {
    key: 'returnMaterial',
    label: '退料',
    description: '支持有码退料和无码退料。',
    fields: [] // 自定义弹窗
  },
  {
    key: 'processDoc',
    label: '查看工艺文件',
    description: '查看当前产品对应的挤压 SOP、SIP、POP 或临时文件。',
    fields: []
  }
]

const taskDialogVisible = ref(false)
const selectedRow = ref<ScheduleRow | null>(null)
const currentTask = ref<ScheduleRow | null>(null)

watch(
  () => currentTask.value?.scheduleNo,
  (scheduleNo) => {
    loadScheduleQueues(scheduleNo)
  }
)

const pickingDialogVisible = ref(false)
const receivingDialogVisible = ref(false)
const heatingDialogVisible = ref(false)
const feedingDialogVisible = ref(false)
const returnDialogVisible = ref(false)
const genericDialogVisible = ref(false)
const extrusionDetailVisible = ref(false)
const extrusionDetailData = ref<any[]>([])

const handleExtrusionDetail = (row: any) => {
  extrusionDetailVisible.value = true
  extrusionDetailData.value = [
    { moldNo: 'M10-0649-200', sequenceNo: 11, rodNo: row.rodNo, exitMaterialNo: 'JY2604140002-11-3', team: 'A15', extrusionTime: '2026-04-14 16:04:51' },
    { moldNo: 'M10-0649-200', sequenceNo: 11, rodNo: row.rodNo, exitMaterialNo: 'JY2604140002-11-2', team: 'A15', extrusionTime: '2026-04-14 16:04:51' },
    { moldNo: 'M10-0649-200', sequenceNo: 11, rodNo: row.rodNo, exitMaterialNo: 'JY2604140002-11-4', team: 'A15', extrusionTime: '2026-04-14 16:04:51' },
    { moldNo: 'M10-0649-200', sequenceNo: 11, rodNo: row.rodNo, exitMaterialNo: 'JY2604140002-11-1', team: 'A15', extrusionTime: '2026-04-14 16:04:51' },
  ]
}

const receivedMolds = ref<string[]>(['M10-0649-200', 'M10-0650-180'])
const feedingMode = ref('coded')
const feedingForm = ref({
  scanRodNo: '',
  furnaceBatch: '',
  uncodedQty: 1
})
const codedFeedingQueue = ref<Array<{ rodNo: string }>>([])

const resetCodedFeedingState = () => {
  feedingForm.value.scanRodNo = ''
  codedFeedingQueue.value = []
}

const returnForm = ref({
  rods: [] as string[],
  returnReason: '',
  returnWarehouse: '铝棒存储库'
})

const extrusionForm = ref({
  selectedRodNo: '',
  startTime: '',
  endTime: ''
})

const currentGenericOperation = ref<OperationDefinition | null>(null)
const genericDialogTitle = ref('')
const processDocDialogVisible = ref(false)
const processDocContext = ref({
  productNo: '',
  productName: ''
})

const operationState = ref<Record<string, boolean>>({})

const pendingSchedules = ref<ScheduleRow[]>([
  {
    scheduleNo: 'ARTI20260228000003',
    orderNo: 'ORD-2026-001',
    productName: 'FC113',
    issueQty: 800,
    planDate: '2026-04-11',
    moldGroupNo: 'M10-0649',
    moldNo: 'M10-0649-200',
    alloy: '6063',
    rodDiameter: 152,
    rodLength: 1000,
    rodMaterialNo: '20-X152-6063-0007-L1000',
    isHoldingFurnace: true
  },
  {
    scheduleNo: 'ARTI20260228000004',
    orderNo: 'ORD-2026-002',
    productName: 'FC15',
    issueQty: 500,
    planDate: '2026-04-12',
    moldGroupNo: 'M10-0650',
    moldNo: 'M10-0650-180',
    alloy: '6061',
    rodDiameter: 178,
    rodLength: 1200,
    rodMaterialNo: '20-X178-6061-0021-L1200',
    isHoldingFurnace: false
  }
])

const pickingRows = ref([
  {
    furnaceBatch: '26-423-02-24-02',
    scheduleQty: 10,
    stockQty: 0,
    appliedQty: 6,
    issuedQty: 6,
    receivedQty: 6,
    requestQty: 0
  }
])

const pickingRecords = ref([
  { pickOrderNo: 'LL20260228144509001', furnaceBatch: '26-423-02-24-02', team: 'A09', qty: 2, applyTime: '2026-02-28 14:45:09' },
  { pickOrderNo: 'LL20260228173017002', furnaceBatch: '26-423-02-24-02', team: 'A09', qty: 1, applyTime: '2026-02-28 17:30:17' },
  { pickOrderNo: 'LL20260302114607003', furnaceBatch: '26-423-02-24-02', team: 'A09', qty: 1, applyTime: '2026-03-02 11:46:07' }
])

const receivingForm = ref({
  pickOrderNo: ''
})

const receivingRows = ref([
  {
    furnaceBatch: '26-423-02-24-02',
    scheduleQty: 10,
    appliedQty: 6,
    issuedQty: 6,
    receivedQty: 6,
    currentQty: 0,
    currentWeight: ''
  }
])

const receivingRecords = ref([
  {
    pickOrderNo: 'MO202602280001',
    team: 'A09',
    issuedQty: 2,
    issueTime: '2026-02-28 14:45:09',
    receivedQty: 2,
    receiveTime: '2026-02-28 14:48:33'
  },
  {
    pickOrderNo: 'MO202603020002',
    team: 'A09',
    issuedQty: 1,
    issueTime: '2026-03-02 11:46:07',
    receivedQty: 1,
    receiveTime: '2026-03-02 11:48:08'
  }
])

const heatingForm = ref({
  moldNo: '',
  furnaceNo: '1#加热炉',
  furnacePosition: '',
  inTime: '2026-04-12 11:31'
})

const heatingRecords = ref([
  {
    moldNo: 'M10-0649-200',
    furnaceNo: '1#加热炉',
    furnacePosition: '',
    inTime: '2026-02-28 14:44:00',
    reachTime: '',
    outTime: '2026-02-28 14:45:01'
  }
])

const genericForm = ref<Record<string, string | number>>({})

const operationViews = computed(() =>
  operationDefinitions.map((definition) => ({
    ...definition,
    status: getOperationStatus(definition.key)
  }))
)

const progressPercentage = computed(() => {
  if (!currentTask.value || currentTask.value.issueQty === 0) {
    return 0
  }
  return Math.min(100, Math.round(((currentTask.value.extrudedQty || 0) / currentTask.value.issueQty) * 100))
})

const moldStatusText = computed(() => {
  const currentMold = heatingQueue.value.find(m => m.status === '使用中' && m.machineNo === currentMachine.value)
  if (currentMold) return `使用中: ${currentMold.moldNo}`
  return '未上模'
})

const moldStatusTag = computed(() => {
  const currentMold = heatingQueue.value.find(m => m.status === '使用中' && m.machineNo === currentMachine.value)
  return currentMold ? 'danger' : 'info'
})

const activeGenericFields = computed(() => currentGenericOperation.value?.fields || [])

const clockInDialogVisible = ref(false)
const { isClockedIn, currentTeam, clockInTime } = useExtrusionSawingShift()
const clockInForm = ref({ team: '' })

const handleClockIn = () => {
  if (isClockedIn.value) {
    ElMessage.info('您已签到上班')
    return
  }
  clockInDialogVisible.value = true
}

const handleClockOut = () => {
  ElMessageBox.confirm('确认下班吗？', '交接班确认', {
    type: 'warning'
  }).then(() => {
    isClockedIn.value = false
    currentTeam.value = ''
    clockInTime.value = ''
    ElMessage.success('已下班')
  })
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

const handleOpenTaskDialog = () => {
  if (!isClockedIn.value) {
    ElMessage.warning('请先点击上班签到，再选择排程开工')
    return
  }
  selectedRow.value = null
  taskDialogVisible.value = true
}

const handleSelectSchedule = (val: ScheduleRow) => {
  selectedRow.value = val
}

const confirmStartWork = () => {
  if (!selectedRow.value) return
  const previousScheduleNo = currentTask.value?.scheduleNo
  if (currentTask.value) {
    saveCurrentScheduleQueues()
  }
  currentTask.value = { ...selectedRow.value }
  loadScheduleQueues(currentTask.value.scheduleNo)
  taskDialogVisible.value = false
  selectedRow.value = null
  operationState.value = {}
  if (previousScheduleNo && previousScheduleNo !== currentTask.value.scheduleNo) {
    ElMessage.success(`已切换排程：${previousScheduleNo} -> ${currentTask.value.scheduleNo}`)
    return
  }
  ElMessage.success(`已开工：${currentTask.value.scheduleNo}`)
}

const getOperationStatus = (key: string): OperationStatus => {
  if (!currentTask.value) return 'blocked'
  if (operationState.value[key]) return 'done'
  return 'pending'
}

const isOperationDisabled = (operation: OperationDefinition) => {
  if (operation.key === 'rodHolding') {
    return !currentTask.value || !currentTask.value.isHoldingFurnace
  }
  return !currentTask.value && operation.key !== 'processDoc' && operation.key !== 'dieReceive' && operation.key !== 'dieHeat'
}

const currentPickOrderNo = ref('')
const generatePickOrderNo = () => {
  const now = new Date()
  const timeStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `LL${timeStr}${seq}`
}

const getOperationLabel = (key: string) => operationDefinitions.find((item) => item.key === key)?.label || key

const handleOperationClick = (operation: OperationDefinition) => {
  if (!currentTask.value && operation.key !== 'processDoc' && operation.key !== 'dieReceive' && operation.key !== 'dieHeat') {
    ElMessage.warning('请先选择排程')
    return
  }

  if (operation.key === 'materialRequest') {
    currentPickOrderNo.value = generatePickOrderNo()
    pickingDialogVisible.value = true
    return
  }
  if (operation.key === 'materialReceive') {
    receivingDialogVisible.value = true
    return
  }
  if (operation.key === 'dieHeat') {
    const now = new Date()
    heatingForm.value.inTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    heatingDialogVisible.value = true
    return
  }
  if (operation.key === 'feeding') {
    feedingForm.value = { scanRodNo: '', furnaceBatch: pickingRows.value[0]?.furnaceBatch || '', uncodedQty: 1 }
    resetCodedFeedingState()
    feedingDialogVisible.value = true
    return
  }
  if (operation.key === 'extrusion') {
    if (selectedRods.value.length === 0) {
      ElMessage.warning('请先在铝棒队列中选择要挤压的铝棒')
      return
    }
    const currentMold = getCurrentUsingMold()
    if (!currentMold?.extrusionBatchNo) {
      ElMessage.warning('请先上模并生成挤压批次号，再进行挤压')
      return
    }
    
    let processedCount = 0
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    selectedRods.value.forEach(rod => {
      const target = loadedRods.value.find(r => r.rodNo === rod.rodNo)
      if (target && target.status !== '已挤压') {
        target.status = '已挤压'
        target.extrusionBatchNo = currentMold.extrusionBatchNo
        target.extrusionTime = now
        processedCount++
      }
    })
    
    if (processedCount > 0) {
      if (currentTask.value) {
        currentTask.value.extrudedQty = (currentTask.value.extrudedQty || 0) + processedCount
      }
      operationState.value.extrusion = true
      ElMessage.success(`已成功挤压 ${processedCount} 根铝棒`)
    } else {
      ElMessage.warning('所选铝棒均已处于已挤压状态')
    }
    return
  }

  if (operation.key === 'returnMaterial') {
    if (selectedRods.value.length === 0) {
      ElMessage.warning('请先在铝棒队列中选择要退料的铝棒')
      return
    }
    if (selectedRods.value.some(r => r.status === '已挤压')) {
      ElMessage.warning('已挤压的铝棒不能退料，请重新选择')
      return
    }
    returnForm.value = {
      rods: selectedRods.value.map(r => r.rodNo),
      returnReason: '',
      returnWarehouse: '铝棒存储库'
    }
    returnDialogVisible.value = true
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

  if (operation.key === 'dieReceive') {
    genericForm.value.sourceLocation = receivedMolds.value[0] || ''
    genericForm.value.receiveTime = new Date().toISOString().slice(0, 16).replace('T', ' ')
  }

  if (operation.key === 'rodHolding') {
    genericForm.value.inFurnaceTime = new Date().toISOString().slice(0, 16).replace('T', ' ')
    genericForm.value.holdingTemp = 480 // 默认温度
  }

  genericDialogVisible.value = true
}

const submitReturn = () => {
  if (!returnForm.value.returnWarehouse) {
    ElMessage.warning('请输入退库位置')
    return
  }
  if (!returnForm.value.returnReason) {
    ElMessage.warning('请输入退料原因')
    return
  }

  returnForm.value.rods.forEach(rodNo => {
    // 从铝棒队列中移除
    const idx = loadedRods.value.findIndex(r => r.rodNo === rodNo)
    if (idx > -1) {
      loadedRods.value.splice(idx, 1)
    }
    // 如果是在剔料明细里退料的，也从剔料明细中移除
    const rejectIdx = rejectedRods.value.findIndex(r => r.rodNo === rodNo)
    if (rejectIdx > -1) {
      rejectedRods.value.splice(rejectIdx, 1)
    }
  })

  operationState.value.returnMaterial = true
  ElMessage.success(`已成功完成 ${returnForm.value.rods.length} 根铝棒的退料登记`)
  returnDialogVisible.value = false
  selectedRods.value = [] // 清空勾选
}

const createDefaultForm = (fields: OperationField[]) => {
  const target: Record<string, string | number> = {}
  fields.forEach((field) => {
    target[field.key] = field.type === 'number' ? 0 : ''
  })
  return target
}

const submitPicking = () => {
  operationState.value.materialRequest = true
  pickingDialogVisible.value = false
  
  let totalReq = 0
  pickingRows.value.forEach(row => {
    if (row.requestQty > 0) {
      totalReq += row.requestQty
    }
  })
  
  if (totalReq > 0) {
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    pickingRecords.value.unshift({
      pickOrderNo: currentPickOrderNo.value,
      furnaceBatch: pickingRows.value[0].furnaceBatch,
      team: currentTeam.value || '系统',
      qty: totalReq,
      applyTime: timeStr
    })
    pickingRows.value.forEach(row => { row.requestQty = 0 })
  }

  ElMessage.success('领料申请已提交')
}

const submitReceiving = () => {
  operationState.value.materialReceive = true
  receivingDialogVisible.value = false
  ElMessage.success('收料已确认')
}

const submitHeating = () => {
  const moldNo = heatingForm.value.moldNo.trim()
  if (!moldNo) {
    ElMessage.warning('请选择模具编号')
    return
  }
  if (!heatingForm.value.furnaceNo) {
    ElMessage.warning('请选择加热炉号')
    return
  }
  if (!heatingForm.value.furnacePosition) {
    ElMessage.warning('请选择炉内方位')
    return
  }
  if (!heatingForm.value.inTime) {
    ElMessage.warning('请选择入炉时间')
    return
  }

  const existingMold = heatingQueue.value.find(item => item.moldNo === moldNo)
  if (existingMold) {
    ElMessage.warning(`模具 ${moldNo} 已在加热队列中，当前状态：${existingMold.status}`)
    return
  }

  const newHeatingMold = {
    moldNo,
    furnaceNo: heatingForm.value.furnaceNo,
    furnacePosition: heatingForm.value.furnacePosition,
    productName: currentTask.value?.productName || '-',
    status: '加热中',
    extrudedCount: 0,
    extrusionLimit: currentTask.value?.issueQty || 0,
    currentTemp: 25,
    targetTemp: 480,
    progress: 5,
    extrusionBatchNo: '',
    machineNo: '',
    remainingTime: '待计算',
    scheduleNo: currentTask.value?.scheduleNo || ''
  }

  heatingQueue.value.unshift(newHeatingMold)
  heatingRecords.value.unshift({
    moldNo,
    furnaceNo: heatingForm.value.furnaceNo,
    furnacePosition: heatingForm.value.furnacePosition,
    inTime: heatingForm.value.inTime,
    reachTime: '',
    outTime: ''
  })
  saveCurrentScheduleQueues()
  operationState.value.dieHeat = true
  heatingDialogVisible.value = false
  heatingForm.value = {
    moldNo: '',
    furnaceNo: heatingForm.value.furnaceNo,
    furnacePosition: '',
    inTime: ''
  }
  ElMessage.success(`模具 ${moldNo} 已加入加热队列，状态：加热中`)
}

const appendCodedFeedingQueue = () => {
  const rodNo = feedingForm.value.scanRodNo.trim()
  if (!rodNo) {
    ElMessage.warning('请扫码或输入铝棒编号')
    return
  }
  if (codedFeedingQueue.value.some(item => item.rodNo === rodNo)) {
    ElMessage.warning('该二维码已在上料队列中')
    return
  }
  codedFeedingQueue.value.push({ rodNo })
  feedingForm.value.scanRodNo = ''
}

const handleCloseFeedingDialog = () => {
  feedingDialogVisible.value = false
  resetCodedFeedingState()
}

const submitFeeding = () => {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  if (feedingMode.value === 'coded') {
    if (codedFeedingQueue.value.length === 0) {
      ElMessage.warning('请先扫码加入上料队列')
      return
    }
    codedFeedingQueue.value.forEach(item => {
      loadedRods.value.push({
        rodNo: item.rodNo,
        extrusionBatchNo: currentTask.value?.extrusionBatchNo || '',
        status: '待挤压',
        loadTime: now,
        extrusionTime: ''
      })
    })
  } else {
    if (!feedingForm.value.furnaceBatch) {
      ElMessage.warning('请选择炉次号')
      return
    }
    for (let i = 0; i < feedingForm.value.uncodedQty; i++) {
      const autoNo = `${feedingForm.value.furnaceBatch}-${Date.now().toString().slice(-4)}-${i + 1}`
      loadedRods.value.push({
        rodNo: autoNo,
        extrusionBatchNo: currentTask.value?.extrusionBatchNo || '',
        status: '待挤压',
        loadTime: now,
        extrusionTime: ''
      })
    }
  }
  operationState.value.feeding = true
  feedingDialogVisible.value = false
  resetCodedFeedingState()
  ElMessage.success('上料完成')
}

const submitGenericOperation = () => {
  if (!currentGenericOperation.value) return

  operationState.value[currentGenericOperation.value.key] = true
  ElMessage.success(`${currentGenericOperation.value.label} 已完成`)
  genericDialogVisible.value = false
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

.task-info {
  margin-bottom: 12px;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.status-panel {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 420px; /* 减小高度以适配笔记本屏幕 */
}

.operation-board-new {
  margin-top: 0;
  padding: 8px 0;
}

.black-border-btn {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #000 !important;
  border-radius: 4px;
}

.black-border-btn:hover {
  background-color: #f5f5f5 !important;
  border-color: #333 !important;
}

.work-steps {
  padding: 16px 0;
}

.panel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0;
}

.title-badge {
  margin-left: 4px;
}

.panel-subtitle {
  font-size: 12px;
  color: #909399;
}

.loaded-rods-container {
  flex: 1;
  margin-top: 8px;
  overflow: hidden;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.heating-cards-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

/* 自定义滚动条 */
.heating-cards-container::-webkit-scrollbar,
.operation-board-inner::-webkit-scrollbar {
  width: 4px;
}
.heating-cards-container::-webkit-scrollbar-thumb,
.operation-board-inner::-webkit-scrollbar-thumb {
  background: #e4e7ed;
  border-radius: 4px;
}

.heating-card {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid #f0f2f5;
  border-radius: 10px;
  margin-bottom: 10px;
  background: #fff;
  transition: all 0.3s;
}

.heating-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #e4e7ed;
}

.card-left {
  flex: 1;
}

.card-row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mold-id {
  font-weight: 700;
  font-size: 13px;
  color: #303133;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  transform: scale(0.9);
  transform-origin: left;
}

.alloy-tag {
  background-color: #f4f4f5;
  border: none;
  transform: scale(0.9);
  transform-origin: left;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #409eff;
  margin-left: auto;
}

.temp-info {
  font-size: 12px;
  color: #606266;
  margin-bottom: 6px;
}

.temp-val {
  font-weight: 600;
  color: #303133;
}

.card-progress {
  width: 90%;
}

.card-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 6px;
  margin-left: 12px;
}

.set-current-btn {
  border-radius: 8px;
  padding: 6px 10px;
}

.op-btn-col {
  margin-bottom: 8px;
}

.full-width-btn {
  width: 100%;
  height: 42px;
  font-size: 13px;
}

.clickable {
  cursor: pointer;
  transition: color 0.3s;
}

.clickable:hover {
  color: #409eff;
}

.qty-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.dialog-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  padding: 8px 0 18px;
  color: #303133;
}

.record-title {
  margin: 18px 0 10px;
  font-size: 16px;
  font-weight: 600;
}

.inline-form {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 1400px) {
  .op-btn-col {
    flex: 0 0 25%;
    max-width: 25%;
  }
}

@media (max-width: 1200px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
  .status-panel {
    height: auto;
    min-height: 400px;
  }
  .op-btn-col {
    flex: 0 0 33.3333%;
    max-width: 33.3333%;
  }
}

@media (max-width: 768px) {
  .op-btn-col {
    flex: 0 0 50%;
    max-width: 50%;
  }
  .task-info :deep(.el-descriptions__cell) {
    display: block;
  }
}

@media (max-width: 480px) {
  .op-btn-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
