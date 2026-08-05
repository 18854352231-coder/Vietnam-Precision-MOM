﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>下发排程</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="warning" @click="handleBatchIssue" :disabled="selectedRows.length === 0">批量下发</el-button>
            <el-button type="info" @click="handleBatchRevoke" :disabled="selectedRows.length === 0">撤回</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">删除</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="issue-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="挤压排程" name="extrusion" />
        <el-tab-pane label="裁切排程" name="cutting" />
      </el-tabs>

      <div class="search-row">
        <el-input v-model="searchForm.lineNo" :placeholder="activeTab === 'extrusion' ? '生产线体' : '锯台'" clearable style="width: 140px" />
        <el-input v-model="searchForm.productName" placeholder="产品名称" clearable style="width: 140px" />
        <el-input v-model="searchForm.moldNo" placeholder="模具组号" clearable style="width: 140px" />
        <el-input v-model="searchForm.furnaceNo" placeholder="炉次号" clearable style="width: 140px" />
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="草稿" value="草稿" />
          <el-option label="已下发" value="已下发" />
          <el-option label="已撤回" value="已撤回" />
        </el-select>
        <el-date-picker
          v-model="searchForm.estimatedStartTimeRange"
          type="datetimerange"
          start-placeholder="预计开始-开始"
          end-placeholder="预计开始-结束"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 340px"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table
        :data="filteredSchedules"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <template v-if="activeTab === 'extrusion'">
          <el-table-column prop="scheduleNo" label="排程编号" width="170" show-overflow-tooltip />
          <el-table-column prop="orderNo" label="订单编号" width="160" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="category" label="产品类型" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.category === '交通类' ? 'success' : 'primary'" size="small">
                {{ scope.row.category }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="furnaceNo" label="炉次号" width="130" show-overflow-tooltip />
          <el-table-column prop="inputQtyRods" label="投入数量(棒)" width="120" align="right" />
          <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
          <el-table-column prop="usedHours" label="用时(H)" width="100" align="right" />
          <el-table-column prop="yieldRate" label="成材率(%)" width="110" align="right" />
          <el-table-column prop="estimatedOutputKg" label="预计产出(kg)" width="130" align="right" />
        </template>
        <template v-else>
          <el-table-column prop="scheduleNo" label="排程编号" width="170" show-overflow-tooltip />
          <el-table-column prop="scheduleType" label="排程类型" width="110" align="center" />
          <el-table-column prop="orderNo" label="订单编号" width="140" show-overflow-tooltip />
          <el-table-column prop="customerCode" label="客户代码" width="100" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="length" label="长度(mm)" width="100" align="right" />
          <el-table-column label="挤压批次号" min-width="220" show-overflow-tooltip>
            <template #default="scope">{{ formatBatchNos(scope.row) }}</template>
          </el-table-column>
          <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
          <el-table-column prop="furnaceNo" label="炉次号" width="130" show-overflow-tooltip />
          <el-table-column prop="lineNo" label="锯台" width="110" align="center" />
          <el-table-column prop="planQty" label="计划量" width="100" align="right" />
          <el-table-column prop="capacityPerHour" label="产能/小时" width="110" align="right" />
          <el-table-column prop="planHours" label="计划小时" width="110" align="right" />
          <el-table-column prop="bomPlanWeightT" label="BOM计划量(T)" width="130" align="right" />
          <el-table-column prop="bomTotal" label="BOM合计" width="120" align="right" />
        </template>
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="scope">
            <div class="status-cell">
              <el-tag :type="statusTagType(scope.row.status)" size="small">
                {{ scope.row.status }}
              </el-tag>
              <span v-if="activeTab === 'extrusion'" class="status-sub">{{ scope.row.lineNo }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" align="center" />
        <el-table-column prop="estimatedStartTime" label="预计开始时间" width="170" align="center" />
        <el-table-column label="操作" width="220" align="center" class-name="action-col">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleIssue(scope.row)" :disabled="scope.row.status === '已下发'">
              下发
            </el-button>
            <el-button size="small" type="warning" link @click="handleRevoke(scope.row)" :disabled="scope.row.status !== '已下发'">
              撤回
            </el-button>
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)" :disabled="scope.row.status === '已下发'">
              编辑
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)" :disabled="scope.row.status === '已下发'">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addDialogVisible" :title="addDialogTitle" width="1260px">
      <el-form
        v-if="activeTab === 'extrusion'"
        :model="extrusionAddForm"
        :rules="extrusionAddRules"
        ref="extrusionAddFormRef"
        label-width="120px"
      >
        <el-row :gutter="18">
          <el-col :span="6">
            <el-form-item label="排程编号" prop="scheduleNo">
              <el-input v-model="extrusionAddForm.scheduleNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单编号" prop="orderNo">
              <el-select v-model="extrusionAddForm.orderNo" placeholder="请选择订单" filterable style="width: 100%" @change="handleSelectExtrusionOrder">
                <el-option v-for="m in masterPlanData" :key="m.orderNo" :label="m.orderNo" :value="m.orderNo" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="产品名称">
              <el-input v-model="extrusionAddForm.productName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="产品类型">
              <el-input v-model="extrusionAddForm.category" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="炉次号" prop="furnaceNo">
              <el-input v-model="extrusionAddForm.furnaceNo" placeholder="请输入炉次号" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="成分料号" prop="rodMaterialNo">
              <el-select v-model="extrusionAddForm.rodMaterialNo" placeholder="请选择成分料号" filterable style="width: 100%" @change="handleRodMaterialChange">
                <el-option v-for="m in ingredientMaterials" :key="m.materialNo" :label="m.materialNo" :value="m.materialNo" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="棒径">
              <el-input v-model="extrusionAddForm.rodDiameter" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="棒长">
              <el-input v-model="extrusionAddForm.rodLength" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="成品料号">
              <el-select v-model="extrusionAddForm.materialNo" placeholder="请选择成品料号" filterable style="width: 100%">
                <el-option v-for="m in finishedMaterials" :key="m.materialNo" :label="m.materialNo" :value="m.materialNo" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="生产线体" prop="lineNo">
              <el-select v-model="extrusionAddForm.lineNo" placeholder="请选择生产线体" style="width: 100%">
                <el-option v-for="l in extrusionLineOptions" :key="l.value" :label="l.label" :value="l.value" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="投入数量(棒)" prop="inputQtyRods">
              <el-input-number v-model="extrusionAddForm.inputQtyRods" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="模具组号" prop="moldNo">
              <el-input v-model="extrusionAddForm.moldNo" placeholder="请输入模具组号" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用时(H)" prop="usedHours">
              <el-input-number v-model="extrusionAddForm.usedHours" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="成材率(%)" prop="yieldRate">
              <el-input-number v-model="extrusionAddForm.yieldRate" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="预计产出(kg)" prop="estimatedOutputKg">
              <el-input-number v-model="extrusionAddForm.estimatedOutputKg" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="预计开始时间" prop="estimatedStartTime">
              <el-date-picker v-model="extrusionAddForm.estimatedStartTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="extrusionAddForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <el-form
        v-else
        :model="cuttingAddForm"
        :rules="cuttingAddRules"
        ref="cuttingAddFormRef"
        label-width="120px"
      >
        <el-row :gutter="18">
          <el-col :span="6">
            <el-form-item label="排程类型" prop="scheduleType">
              <el-select v-model="cuttingAddForm.scheduleType" placeholder="请选择排程类型" style="width: 100%">
                <el-option v-for="item in cuttingScheduleTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单编号" prop="orderNo">
              <el-select v-model="cuttingAddForm.orderNo" placeholder="请选择订单" filterable style="width: 100%" @change="handleSelectCuttingOrder">
                <el-option v-for="m in masterPlanData" :key="m.orderNo" :label="m.orderNo" :value="m.orderNo" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="产品名称">
              <el-input v-model="cuttingAddForm.productName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户代码">
              <el-input v-model="cuttingAddForm.customerCode" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="长度(mm)">
              <el-input v-model="cuttingAddForm.length" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="锯台" prop="lineNo">
              <el-select v-model="cuttingAddForm.lineNo" placeholder="请选择锯台" style="width: 100%">
                <el-option v-for="l in cuttingLineOptions" :key="l.value" :label="l.label" :value="l.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="挤压批次号" prop="extrusionBatchNos">
              <el-select
                v-model="cuttingAddForm.extrusionBatchNos"
                placeholder="请选择挤压批次号"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="1"
                style="width: 100%"
                @change="handleSelectExtrusionSchedules"
              >
                <el-option v-for="s in extrusionScheduleOptions" :key="s.scheduleNo" :label="s.scheduleNo" :value="s.scheduleNo" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="模具号">
              <el-input v-model="cuttingAddForm.moldNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="炉次号">
              <el-input v-model="cuttingAddForm.furnaceNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="计划量" prop="planQty">
              <el-input-number v-model="cuttingAddForm.planQty" :min="0" style="width: 100%" @change="recalcCuttingPlanHours" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="单重(kg)" prop="unitWeight">
              <el-input v-model="cuttingAddForm.unitWeight" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="产能/小时" prop="capacityPerHour">
              <el-input-number v-model="cuttingAddForm.capacityPerHour" :min="0" style="width: 100%" @change="recalcCuttingPlanHours" />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="计划小时">
              <el-input v-model="cuttingAddForm.planHours" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="BOM计划量(T)" prop="bomPlanWeightT">
              <el-input-number v-model="cuttingAddForm.bomPlanWeightT" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="BOM合计" prop="bomTotal">
              <el-input-number v-model="cuttingAddForm.bomTotal" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="预计开始时间" prop="estimatedStartTime">
              <el-date-picker v-model="cuttingAddForm.estimatedStartTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <div v-if="cuttingAddForm.extrusionBatchNos.length" class="related-frames-section">
          <div class="related-frames-header">
            <div class="related-frames-title">
              <span>挤压批次关联料框与检验结果</span>
              <span class="related-frames-subtitle">当前所选批次可用于裁切排程的料框明细</span>
            </div>
            <div class="related-frames-summary">
              <span>料框数 <strong>{{ relatedFrames.length }}</strong></span>
              <el-divider direction="vertical" />
              <span>数量合计 <strong>{{ relatedFrameTotalQty }}</strong></span>
            </div>
          </div>

          <el-table :data="relatedFrames" border size="small" class="related-frames-table" empty-text="暂无关联料框">
            <el-table-column prop="extrusionBatchNo" label="挤压批次号" min-width="170" show-overflow-tooltip />
            <el-table-column prop="frameNo" label="料框编号" min-width="180" show-overflow-tooltip />
            <el-table-column prop="location" label="所在位置" min-width="150" show-overflow-tooltip />
            <el-table-column prop="furnaceBatch" label="铝棒炉次号" min-width="160" show-overflow-tooltip />
            <el-table-column prop="qty" label="数量" min-width="90" align="right" />
            <el-table-column prop="agingInTime" label="时效入炉时间" min-width="180" align="center" />
            <el-table-column prop="agingOutTime" label="时效出炉时间" min-width="180" align="center" />
            <el-table-column prop="qcResult" label="检验结果" min-width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.qcResult === 'OK' ? 'success' : 'danger'" size="small">
                  {{ scope.row.qcResult }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-form-item label="备注" class="cutting-remark-item">
          <el-input v-model="cuttingAddForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import {
  removeIssuedCuttingSchedule,
  upsertIssuedCuttingSchedule,
  type CuttingScheduleMaterialType,
  type IssuedCuttingSourceFrame
} from '@/utils/cuttingScheduleFlow'

useTaskLiteralDomI18n()

type IssueTab = 'extrusion' | 'cutting'
type IssueStatus = '草稿' | '已下发' | '已撤回'
type CuttingScheduleType = CuttingScheduleMaterialType

interface MasterPlanRow {
  orderNo: string
  productName: string
  customerCode: string
  customerName: string
  category: string
  materialNo: string
  productCode: string
  moldNo: string
  alloy: string
  rodMaterialNo: string
  rodDiameter: number
  rodLength: number
  hourlyCapacity: number
  remark: string
  length: string
  unitWeight: string
  orderQty: number
  remainingQty: number
}

interface ExtrusionScheduleRow {
  id: string
  type: 'extrusion'
  scheduleNo: string
  orderNo: string
  productName: string
  lineNo: string
  rodMaterialNo: string
  rodDiameter: number
  rodLength: number
  furnaceNo: string
  inputQtyRods: number
  materialNo: string
  category: string
  productCode: string
  moldNo: string
  alloy: string
  hourlyCapacity: number
  usedHours: number
  yieldRate: number
  estimatedOutputKg: number
  remark: string
  status: IssueStatus
  createdAt: string
  estimatedStartTime: string
}

interface CuttingScheduleRow {
  id: string
  type: 'cutting'
  scheduleType: CuttingScheduleType
  scheduleNo: string
  orderNo: string
  productName: string
  lineNo: string
  extrusionBatchNo: string
  extrusionBatchNos: string[]
  moldNo: string
  moldNos: string[]
  furnaceNo: string
  furnaceNos: string[]
  sourceFrames: IssuedCuttingSourceFrame[]
  customerCode: string
  customerName: string
  length: string
  remark: string
  planQty: number
  unitWeight: string
  capacityPerHour: number
  planHours: number
  bomPlanWeightT: number
  bomTotal: number
  status: IssueStatus
  createdAt: string
  estimatedStartTime: string
}

const activeTab = ref<IssueTab>('extrusion')

const searchForm = ref({
  lineNo: '',
  productName: '',
  moldNo: '',
  furnaceNo: '',
  status: '',
  estimatedStartTimeRange: [] as string[]
})

const masterPlanData = ref<MasterPlanRow[]>([
  {
    orderNo: 'ORD-2026-001',
    productName: 'FC61',
    customerCode: 'CUST001',
    customerName: '客户A',
    category: '电子类',
    materialNo: 'MAT-6063-001',
    productCode: 'P-6063-T5-A',
    moldNo: 'M10-0649-200',
    alloy: '6063',
    rodMaterialNo: '20-X152-6063-0007-L1000',
    rodDiameter: 152,
    rodLength: 1000,
    hourlyCapacity: 500,
    remark: '急单',
    length: '6000',
    unitWeight: '2.5',
    orderQty: 1000,
    remainingQty: 800
  },
  {
    orderNo: 'ORD-2026-002',
    productName: 'FC43',
    customerCode: 'CUST002',
    customerName: '客户B',
    category: '交通类',
    materialNo: 'MAT-6061-002',
    productCode: 'P-6061-T6-B',
    moldNo: 'M10-0650-180',
    alloy: '6061',
    rodMaterialNo: '20-X178-6061-0021-L1200',
    rodDiameter: 178,
    rodLength: 1200,
    hourlyCapacity: 420,
    remark: '',
    length: '6000',
    unitWeight: '2.9',
    orderQty: 500,
    remainingQty: 500
  }
])

const schedules = ref<Array<ExtrusionScheduleRow | CuttingScheduleRow>>([
  {
    id: 'E-001',
    type: 'extrusion',
    scheduleNo: 'JY-20260416-0001',
    orderNo: 'ORD-2026-001',
    productName: 'FC18',
    lineNo: 'L001',
    rodMaterialNo: '20-X152-6063-0007-L1000',
    rodDiameter: 152,
    rodLength: 1000,
    furnaceNo: '26-412-03-05-04',
    inputQtyRods: 80,
    materialNo: 'MAT-6063-001',
    category: '电子类',
    productCode: 'P-6063-T5-A',
    moldNo: 'M10-0649-200',
    alloy: '6063',
    hourlyCapacity: 500,
    usedHours: 1.6,
    yieldRate: 92,
    estimatedOutputKg: 1200,
    remark: '急单',
    status: '已下发',
    createdAt: '2026-04-16 08:30:00',
    estimatedStartTime: '2026-04-16 09:00:00'
  },
  {
    id: 'E-002',
    type: 'extrusion',
    scheduleNo: 'JY-20260416-0002',
    orderNo: 'ORD-2026-002',
    productName: 'FC127',
    lineNo: 'L002',
    rodMaterialNo: '20-X178-6061-0021-L1200',
    rodDiameter: 178,
    rodLength: 1200,
    furnaceNo: '26-412-03-05-05',
    inputQtyRods: 60,
    materialNo: 'MAT-6061-002',
    category: '交通类',
    productCode: 'P-6061-T6-B',
    moldNo: 'M10-0650-180',
    alloy: '6061',
    hourlyCapacity: 420,
    usedHours: 2.2,
    yieldRate: 89,
    estimatedOutputKg: 980,
    remark: '',
    status: '草稿',
    createdAt: '2026-04-16 10:10:00',
    estimatedStartTime: '2026-04-16 11:00:00'
  },
  {
    id: 'E-003',
    type: 'extrusion',
    scheduleNo: 'JY-20260416-0003',
    orderNo: 'ORD-2026-001',
    productName: 'FC18',
    lineNo: 'L001',
    rodMaterialNo: '20-X152-6063-0007-L1000',
    rodDiameter: 152,
    rodLength: 1000,
    furnaceNo: '26-412-03-05-06',
    inputQtyRods: 45,
    materialNo: 'MAT-6063-001',
    category: '电子类',
    productCode: 'P-6063-T5-A',
    moldNo: 'M10-0649-200',
    alloy: '6063',
    hourlyCapacity: 500,
    usedHours: 1.1,
    yieldRate: 91,
    estimatedOutputKg: 680,
    remark: '',
    status: '已下发',
    createdAt: '2026-04-16 10:30:00',
    estimatedStartTime: '2026-04-16 11:30:00'
  },
  {
    id: 'C-001',
    type: 'cutting',
    scheduleType: '量产物料',
    scheduleNo: 'CQ-20260416-0001',
    orderNo: 'ORD-2026-001',
    productName: 'FC47',
    lineNo: 'JT-1',
    extrusionBatchNo: 'JY-20260416-0001',
    extrusionBatchNos: ['JY-20260416-0001'],
    moldNo: 'M10-0649-200',
    moldNos: ['M10-0649-200'],
    furnaceNo: '26-412-03-05-04',
    furnaceNos: ['26-412-03-05-04'],
    sourceFrames: [],
    customerCode: 'CUST001',
    customerName: '客户A',
    length: '6000',
    remark: '',
    planQty: 600,
    unitWeight: '2.5',
    capacityPerHour: 260,
    planHours: 2.31,
    bomPlanWeightT: 1.2,
    bomTotal: 18.5,
    status: '草稿',
    createdAt: '2026-04-16 09:15:00',
    estimatedStartTime: '2026-04-16 13:00:00'
  }
])

const selectedRows = ref<Array<ExtrusionScheduleRow | CuttingScheduleRow>>([])

const formatBatchNos = (row: Partial<CuttingScheduleRow>) =>
  row.extrusionBatchNos?.length ? row.extrusionBatchNos.join('、') : row.extrusionBatchNo || '-'

const filteredSchedules = computed(() => {
  const { lineNo, productName, moldNo, furnaceNo, status, estimatedStartTimeRange } = searchForm.value

  const inRange = (val: string, range: string[]) => {
    if (!range || range.length !== 2) return true
    const [start, end] = range
    return (!start || val >= start) && (!end || val <= end)
  }

  return schedules.value
    .filter(r => r.type === activeTab.value)
    .filter(r => !lineNo || r.lineNo.includes(lineNo))
    .filter(r => !productName || r.productName.includes(productName))
    .filter(r => !moldNo || r.moldNo.includes(moldNo))
    .filter(r => !furnaceNo || r.furnaceNo.includes(furnaceNo))
    .filter(r => !status || r.status === status)
    .filter(r => inRange(r.estimatedStartTime, estimatedStartTimeRange))
})

const statusTagType = (status: IssueStatus) => {
  if (status === '已下发') return 'success'
  if (status === '已撤回') return 'info'
  return 'warning'
}

const handleTabChange = () => {
  selectedRows.value = []
}

const handleSelectionChange = (val: Array<ExtrusionScheduleRow | CuttingScheduleRow>) => {
  selectedRows.value = val
}

const handleSearch = () => {
  ElMessage.success('查询完成')
}

const handleReset = () => {
  searchForm.value = { lineNo: '', productName: '', moldNo: '', furnaceNo: '', status: '', estimatedStartTimeRange: [] }
  selectedRows.value = []
}

const createNowString = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const createScheduleNo = (prefix: string) => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const rand = String(Math.floor(Math.random() * 9000) + 1000)
  return `${prefix}-${y}${m}${day}-${rand}`
}

const addDialogVisible = ref(false)
const isEditingExtrusion = ref(false)
const addDialogTitle = computed(() => {
  if (activeTab.value === 'extrusion') {
    return isEditingExtrusion.value ? '编辑挤压排程' : '新增挤压排程'
  }
  return '新增裁切排程'
})

const extrusionLineOptions = [
  { label: '挤压1号线', value: 'L001' },
  { label: '挤压2号线', value: 'L002' },
  { label: '挤压3号线', value: 'L003' }
]

const cuttingLineOptions = [
  { label: '锯台1', value: 'S001' },
  { label: '锯台2', value: 'S002' },
  { label: '锯台3', value: 'S003' }
]

const cuttingScheduleTypeOptions: CuttingScheduleType[] = ['产发物料', '量产物料', '重工物料']

const extrusionAddFormRef = ref()
const cuttingAddFormRef = ref()

const extrusionAddForm = ref({
  scheduleNo: '',
  orderNo: '',
  productName: '',
  lineNo: '',
  rodMaterialNo: '',
  rodDiameter: 0,
  rodLength: 0,
  furnaceNo: '',
  inputQtyRods: 1,
  materialNo: '',
  category: '',
  productCode: '',
  moldNo: '',
  alloy: '',
  hourlyCapacity: 0,
  usedHours: 0,
  yieldRate: 0,
  estimatedOutputKg: 0,
  estimatedStartTime: '',
  remark: ''
})

const cuttingAddForm = ref({
  scheduleNo: '',
  scheduleType: '' as CuttingScheduleType | '',
  orderNo: '',
  productName: '',
  lineNo: '',
  extrusionBatchNos: [] as string[],
  moldNo: '',
  furnaceNo: '',
  customerCode: '',
  customerName: '',
  length: '',
  remark: '',
  planQty: 0,
  unitWeight: '',
  capacityPerHour: 0,
  planHours: 0,
  bomPlanWeightT: 0,
  bomTotal: 0,
  estimatedStartTime: ''
})

const extrusionAddRules = {
  scheduleNo: [{ required: true, message: '系统生成排程编号失败', trigger: 'change' }],
  orderNo: [{ required: true, message: '请选择订单编号', trigger: 'change' }],
  lineNo: [{ required: true, message: '请选择生产线体', trigger: 'change' }],
  furnaceNo: [{ required: true, message: '请输入炉次号', trigger: 'blur' }],
  inputQtyRods: [{ required: true, message: '请输入投入数量', trigger: 'blur' }],
  moldNo: [{ required: true, message: '请输入模具号', trigger: 'blur' }],
  usedHours: [{ required: true, message: '请输入用时', trigger: 'blur' }],
  yieldRate: [{ required: true, message: '请输入成材率', trigger: 'blur' }],
  estimatedOutputKg: [{ required: true, message: '请输入预计产出', trigger: 'blur' }],
  estimatedStartTime: [{ required: true, message: '请选择预计开始时间', trigger: 'change' }]
}

const cuttingAddRules = {
  scheduleType: [{ required: true, message: '请选择排程类型', trigger: 'change' }],
  orderNo: [{ required: true, message: '请选择订单编号', trigger: 'change' }],
  lineNo: [{ required: true, message: '请选择锯台', trigger: 'change' }],
  extrusionBatchNos: [{ type: 'array', required: true, min: 1, message: '请选择挤压批次号', trigger: 'change' }],
  planQty: [{ required: true, message: '请输入计划量', trigger: 'blur' }],
  capacityPerHour: [{ required: true, message: '请输入产能/小时', trigger: 'blur' }],
  bomPlanWeightT: [{ required: true, message: '请输入BOM计划量', trigger: 'blur' }],
  bomTotal: [{ required: true, message: '请输入BOM合计', trigger: 'blur' }],
  estimatedStartTime: [{ required: true, message: '请选择预计开始时间', trigger: 'change' }]
}

const handleSelectExtrusionOrder = (orderNo: string) => {
  const row = masterPlanData.value.find(m => m.orderNo === orderNo)
  if (!row) return
  extrusionAddForm.value.productName = row.productName
  extrusionAddForm.value.category = row.category
}

const ingredientMaterials = ref([
  { materialNo: '20-X152-6063-0007-L1000', rodDiameter: 152, rodLength: 1000 },
  { materialNo: '20-X178-6061-0021-L1200', rodDiameter: 178, rodLength: 1200 },
  { materialNo: '20-X203-6082-0030-L1500', rodDiameter: 203, rodLength: 1500 }
])

const finishedMaterials = ref([
  { materialNo: 'MAT-6063-001' },
  { materialNo: 'MAT-6061-002' },
  { materialNo: 'MAT-6082-003' },
  { materialNo: 'MAT-6005-004' }
])

const handleRodMaterialChange = (val: string) => {
  if (!val) return
  const matched = ingredientMaterials.value.find(m => m.materialNo === val)
  if (matched) {
    extrusionAddForm.value.rodDiameter = matched.rodDiameter
    extrusionAddForm.value.rodLength = matched.rodLength
  } else {
    // 兼容原有的正则解析逻辑，作为备用兜底
    const diaMatch = val.match(/X(\d+)/i)
    if (diaMatch) {
      extrusionAddForm.value.rodDiameter = parseInt(diaMatch[1], 10)
    }
    const lenMatch = val.match(/L(\d+)/i)
    if (lenMatch) {
      extrusionAddForm.value.rodLength = parseInt(lenMatch[1], 10)
    }
  }
}

const handleSelectCuttingOrder = (orderNo: string) => {
  const row = masterPlanData.value.find(m => m.orderNo === orderNo)
  if (!row) return
  cuttingAddForm.value.productName = row.productName
  cuttingAddForm.value.customerCode = row.customerCode
  cuttingAddForm.value.customerName = row.customerName
  cuttingAddForm.value.length = row.length
  cuttingAddForm.value.unitWeight = row.unitWeight
  cuttingAddForm.value.remark = row.remark || ''
  cuttingAddForm.value.extrusionBatchNos = []
  cuttingAddForm.value.moldNo = ''
  cuttingAddForm.value.furnaceNo = ''
  relatedFrames.value = []
}

const extrusionScheduleOptions = computed(() => {
  const orderNo = cuttingAddForm.value.orderNo
  return schedules.value
    .filter((s): s is ExtrusionScheduleRow => s.type === 'extrusion')
    .filter(s => !orderNo || s.orderNo === orderNo)
})

const relatedFrames = ref<IssuedCuttingSourceFrame[]>([])
const relatedFrameTotalQty = computed(() =>
  relatedFrames.value.reduce((total, frame) => total + Number(frame.qty || 0), 0)
)

const uniqueValues = (values: string[]) => [...new Set(values.filter(Boolean))]

const handleSelectExtrusionSchedules = (scheduleNos: string[]) => {
  const rows = schedules.value.filter(
    (s): s is ExtrusionScheduleRow => s.type === 'extrusion' && scheduleNos.includes(s.scheduleNo)
  )
  if (!rows.length) {
    cuttingAddForm.value.moldNo = ''
    cuttingAddForm.value.furnaceNo = ''
    relatedFrames.value = []
    return
  }
  cuttingAddForm.value.moldNo = uniqueValues(rows.map(row => row.moldNo)).join('、')
  cuttingAddForm.value.furnaceNo = uniqueValues(rows.map(row => row.furnaceNo)).join('、')

  relatedFrames.value = rows.flatMap(row => {
    const scheduleIndex = schedules.value.filter(s => s.type === 'extrusion').findIndex(s => s.scheduleNo === row.scheduleNo)
    const frameSeed = 209 + Math.max(scheduleIndex, 0) * 2
    return [
      { extrusionBatchNo: row.scheduleNo, frameNo: `CV-A-A-L6000*W1250*H650*${String(frameSeed).padStart(4, '0')}`, location: '时效区-出炉缓存位', furnaceBatch: row.furnaceNo, qty: 20, agingInTime: '2026-04-16 08:00:00', agingOutTime: '2026-04-16 14:10:00', qcResult: 'OK' },
      { extrusionBatchNo: row.scheduleNo, frameNo: `CV-A-A-L6000*W1250*H650*${String(frameSeed + 1).padStart(4, '0')}`, location: '时效区-出炉缓存位', furnaceBatch: row.furnaceNo, qty: 18, agingInTime: '2026-04-16 08:00:00', agingOutTime: '2026-04-16 14:10:00', qcResult: 'OK' }
    ]
  })
}

const recalcCuttingPlanHours = () => {
  const qty = Number(cuttingAddForm.value.planQty || 0)
  const cap = Number(cuttingAddForm.value.capacityPerHour || 0)
  if (!cap) {
    cuttingAddForm.value.planHours = 0
    return
  }
  const hours = qty / cap
  cuttingAddForm.value.planHours = Math.round(hours * 100) / 100
}

const handleAdd = () => {
  isEditingExtrusion.value = false
  if (activeTab.value === 'extrusion') {
    extrusionAddForm.value = {
      scheduleNo: createScheduleNo('JY'),
      orderNo: '',
      productName: '',
      lineNo: '',
      rodMaterialNo: '',
      rodDiameter: 0,
      rodLength: 0,
      furnaceNo: '',
      inputQtyRods: 1,
      materialNo: '',
      category: '',
      productCode: '',
      moldNo: '',
      alloy: '',
      hourlyCapacity: 0,
      usedHours: 0,
      yieldRate: 0,
      estimatedOutputKg: 0,
      estimatedStartTime: '',
      remark: ''
    }
  } else {
    cuttingAddForm.value = {
      scheduleNo: createScheduleNo('CQ'),
      scheduleType: '',
      orderNo: '',
      productName: '',
      lineNo: '',
      extrusionBatchNos: [],
      moldNo: '',
      furnaceNo: '',
      customerCode: '',
      customerName: '',
      length: '',
      remark: '',
      planQty: 0,
      unitWeight: '',
      capacityPerHour: 0,
      planHours: 0,
      bomPlanWeightT: 0,
      bomTotal: 0,
      estimatedStartTime: ''
    }
  }
  addDialogVisible.value = true
}

const confirmAdd = async () => {
  const now = createNowString()
  if (activeTab.value === 'extrusion') {
    if (!extrusionAddFormRef.value) return
    await extrusionAddFormRef.value.validate((valid: boolean) => {
      if (!valid) return
      if (isEditingExtrusion.value) {
        const index = schedules.value.findIndex(s => s.scheduleNo === extrusionAddForm.value.scheduleNo)
        if (index !== -1) {
          schedules.value[index] = {
            ...schedules.value[index],
            ...extrusionAddForm.value
          } as ExtrusionScheduleRow
        }
        ElMessage.success('更新成功')
      } else {
        schedules.value.unshift({
          id: `JY-${Date.now()}`,
          type: 'extrusion',
          scheduleNo: extrusionAddForm.value.scheduleNo,
          orderNo: extrusionAddForm.value.orderNo,
          productName: extrusionAddForm.value.productName,
          lineNo: extrusionAddForm.value.lineNo,
          rodMaterialNo: extrusionAddForm.value.rodMaterialNo,
          rodDiameter: extrusionAddForm.value.rodDiameter,
          rodLength: extrusionAddForm.value.rodLength,
          furnaceNo: extrusionAddForm.value.furnaceNo,
          inputQtyRods: extrusionAddForm.value.inputQtyRods,
          materialNo: extrusionAddForm.value.materialNo,
          category: extrusionAddForm.value.category,
          productCode: extrusionAddForm.value.productCode,
          moldNo: extrusionAddForm.value.moldNo,
          alloy: extrusionAddForm.value.alloy,
          hourlyCapacity: extrusionAddForm.value.hourlyCapacity,
          usedHours: extrusionAddForm.value.usedHours,
          yieldRate: extrusionAddForm.value.yieldRate,
          estimatedOutputKg: extrusionAddForm.value.estimatedOutputKg,
          remark: extrusionAddForm.value.remark,
          status: '草稿',
          createdAt: now,
          estimatedStartTime: extrusionAddForm.value.estimatedStartTime
        })
        ElMessage.success('新增成功')
      }
      addDialogVisible.value = false
    })
    return
  }

  if (!cuttingAddFormRef.value) return
  await cuttingAddFormRef.value.validate((valid: boolean) => {
    if (!valid) return
    recalcCuttingPlanHours()
    const extrusionBatchNos = [...cuttingAddForm.value.extrusionBatchNos]
    const selectedExtrusionSchedules = schedules.value.filter(
      (s): s is ExtrusionScheduleRow => s.type === 'extrusion' && extrusionBatchNos.includes(s.scheduleNo)
    )
    const furnaceNos = uniqueValues(selectedExtrusionSchedules.map(row => row.furnaceNo))
    const moldNos = uniqueValues(selectedExtrusionSchedules.map(row => row.moldNo))
    schedules.value.unshift({
      id: `CQ-${Date.now()}`,
      type: 'cutting',
      scheduleType: cuttingAddForm.value.scheduleType as CuttingScheduleType,
      scheduleNo: cuttingAddForm.value.scheduleNo,
      orderNo: cuttingAddForm.value.orderNo,
      productName: cuttingAddForm.value.productName,
      lineNo: cuttingAddForm.value.lineNo,
      extrusionBatchNo: extrusionBatchNos.join('、'),
      extrusionBatchNos,
      moldNo: moldNos.join('、'),
      moldNos,
      furnaceNo: furnaceNos.join('、'),
      furnaceNos,
      sourceFrames: relatedFrames.value.map(frame => ({ ...frame })),
      customerCode: cuttingAddForm.value.customerCode,
      customerName: cuttingAddForm.value.customerName,
      length: cuttingAddForm.value.length,
      remark: cuttingAddForm.value.remark,
      planQty: cuttingAddForm.value.planQty,
      unitWeight: cuttingAddForm.value.unitWeight,
      capacityPerHour: cuttingAddForm.value.capacityPerHour,
      planHours: cuttingAddForm.value.planHours,
      bomPlanWeightT: cuttingAddForm.value.bomPlanWeightT,
      bomTotal: cuttingAddForm.value.bomTotal,
      status: '草稿',
      createdAt: now,
      estimatedStartTime: cuttingAddForm.value.estimatedStartTime
    })
    ElMessage.success('新增成功')
    addDialogVisible.value = false
  })
}

const handleEdit = (row: ExtrusionScheduleRow | CuttingScheduleRow) => {
  if (row.type === 'extrusion') {
    const extRow = row as ExtrusionScheduleRow
    isEditingExtrusion.value = true
    extrusionAddForm.value = { ...extRow }
    const order = masterPlanData.value.find(o => o.orderNo === extRow.orderNo)
    if (order) {
      handleSelectExtrusionOrder(order.orderNo)
    }
    addDialogVisible.value = true
  } else {
    ElMessage.info('裁切排程编辑功能开发中...')
  }
}

const syncCuttingScheduleToWorkbench = (row: CuttingScheduleRow) => {
  upsertIssuedCuttingSchedule({
    scheduleNo: row.scheduleNo,
    scheduleType: row.scheduleType,
    customerCode: row.customerCode,
    customerName: row.customerName,
    furnaceNo: row.furnaceNo,
    furnaceNos: row.furnaceNos,
    extrusionBatchNo: row.extrusionBatchNo,
    extrusionBatchNos: row.extrusionBatchNos,
    moldNo: row.moldNo,
    moldNos: row.moldNos,
    sourceFrames: row.sourceFrames,
    alloy: '',
    productName: row.productName,
    componentMaterialNo: '',
    customerMaterialNo: '',
    customerProductName: '',
    productionType: row.scheduleType,
    planQty: row.planQty,
    singleWeight: Number(row.unitWeight || 0),
    fixedLength: row.length,
    extrusionMachine: row.lineNo
  })
}

const handleIssue = (row: ExtrusionScheduleRow | CuttingScheduleRow) => {
  if (row.status === '已下发') return
  row.status = '已下发'
  if (row.type === 'cutting') syncCuttingScheduleToWorkbench(row)
  ElMessage.success('下发成功')
}

const handleRevoke = (row: ExtrusionScheduleRow | CuttingScheduleRow) => {
  if (row.status !== '已下发') return
  row.status = '已撤回'
  if (row.type === 'cutting') removeIssuedCuttingSchedule(row.scheduleNo)
  ElMessage.success('撤回成功')
}

const handleDelete = (row: ExtrusionScheduleRow | CuttingScheduleRow) => {
  ElMessageBox.confirm(`确认删除排程 ${row.scheduleNo} 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = schedules.value.findIndex(s => s.id === row.id)
    if (idx > -1) {
      if (row.type === 'cutting') removeIssuedCuttingSchedule(row.scheduleNo)
      schedules.value.splice(idx, 1)
      ElMessage.success('删除成功')
      selectedRows.value = []
    }
  })
}

const handleBatchIssue = () => {
  if (selectedRows.value.length === 0) return
  const targets = selectedRows.value.filter(r => r.status !== '已下发')
  if (targets.length === 0) {
    ElMessage.info('所选排程均已下发')
    return
  }
  targets.forEach(r => {
    r.status = '已下发'
    if (r.type === 'cutting') syncCuttingScheduleToWorkbench(r)
  })
  ElMessage.success(`成功下发 ${targets.length} 条排程`)
}

const handleBatchRevoke = () => {
  if (selectedRows.value.length === 0) return
  const targets = selectedRows.value.filter(r => r.status === '已下发')
  if (targets.length === 0) {
    ElMessage.info('所选排程无可撤回项')
    return
  }
  targets.forEach(r => {
    r.status = '已撤回'
    if (r.type === 'cutting') removeIssuedCuttingSchedule(r.scheduleNo)
  })
  ElMessage.success(`成功撤回 ${targets.length} 条排程`)
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  ElMessageBox.confirm(`确认删除所选 ${selectedRows.value.length} 条排程吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = new Set(selectedRows.value.map(r => r.id))
    schedules.value = schedules.value.filter(r => !ids.has(r.id))
    selectedRows.value = []
    ElMessage.success('删除成功')
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
}
.header-right {
  display: flex;
  gap: 10px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.issue-tabs {
  margin-bottom: 10px;
}

.related-frames-section {
  margin: 10px 0 18px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-bg-color);
}

.related-frames-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
}

.related-frames-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.related-frames-subtitle {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

.related-frames-summary {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.related-frames-summary strong {
  margin-left: 4px;
  color: var(--el-color-primary);
  font-weight: 600;
}

.related-frames-table {
  width: 100%;
}

.related-frames-table :deep(.el-table__header th.el-table__cell) {
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.cutting-remark-item {
  margin-top: 0;
}

:deep(.el-table__fixed-right),
:deep(.el-table__fixed-left) {
  background: #fff;
}

:deep(.el-table__fixed-right .el-table__fixed-header-wrapper),
:deep(.el-table__fixed-left .el-table__fixed-header-wrapper) {
  background: #fff;
}

:deep(.el-table__fixed-right .el-table__body-wrapper),
:deep(.el-table__fixed-left .el-table__body-wrapper) {
  background: #fff;
}

.status-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
