<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <span class="title">挤压生产报表</span>
          <div class="header-actions">
            <el-date-picker
              v-model="searchDate"
              type="date"
              placeholder="选择报表日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 160px; margin-right: 12px"
            />
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
            <el-button type="success" icon="Download" @click="handleExport">导出报表</el-button>
          </div>
        </div>
      </template>

      <div class="content-wrapper">
        <div class="table-container">
          <el-table 
            :data="tableData" 
            border 
            stripe 
            height="100%"
            class="report-table"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="week" label="周别" width="80" align="center" />
            <el-table-column prop="date" label="日期" width="110" align="center" />
            <el-table-column prop="workshop" label="车间" width="100" align="center" />
            <el-table-column prop="type" label="类型" width="100" align="center" />
            <el-table-column prop="machine" label="机台" width="100" align="center" />
            <el-table-column prop="scheduleNo" label="挤压排程号" width="170" show-overflow-tooltip />
            <el-table-column prop="group" label="组别" width="80" align="center" />
            <el-table-column prop="team" label="生产班组" width="90" align="center" />
            <el-table-column prop="workHours" label="工作时间" width="100" align="center" />
            <el-table-column prop="planQty" label="计划产量" width="100" align="right" />
            <el-table-column prop="startTime" label="开始时间" width="160" align="center" />
            <el-table-column prop="endTime" label="结束时间" width="160" align="center" />
            <el-table-column prop="productionTime" label="生产用时" width="100" align="center" />
            <el-table-column prop="ingotMaterialNo" label="铝锭料号" width="150" show-overflow-tooltip />
            <el-table-column prop="ingotLength" label="铝锭长度" width="100" align="right" />
            <el-table-column prop="ingotCount" label="铝锭支数" width="100" align="right" />
            <el-table-column prop="totalInputWeight" label="投入总重" width="100" align="right" />
            <el-table-column prop="productMaterialNo" label="产品料号" width="150" show-overflow-tooltip />
            <el-table-column prop="moldGroupNo" label="模具组号" width="130" show-overflow-tooltip />
            <el-table-column prop="finishedLength" label="成品长度" width="100" align="right" />
            <el-table-column prop="finishedMeterWeight" label="成品米重" width="100" align="right" />
            <el-table-column prop="goodQty" label="良品数量" width="100" align="right" />
            <el-table-column prop="goodWeight" label="良品重量(kg)" width="120" align="right" />
            <el-table-column prop="badQty" label="不良品支数" width="100" align="right" />
            <el-table-column prop="badWeight" label="不良品重量" width="100" align="right" />
            <el-table-column prop="peeling" label="剥皮" width="80" align="right" />
            <el-table-column prop="residue" label="压余" width="80" align="right" />
            <el-table-column prop="headTail" label="头尾" width="80" align="right" />
            <el-table-column prop="hourlyCapacity" label="小时产能" width="100" align="right" />
            <el-table-column prop="yieldRate" label="成品率" width="100" align="right">
              <template #default="scope">{{ scope.row.yieldRate }}%</template>
            </el-table-column>
            <el-table-column prop="bomYieldRate" label="BOM成材率" width="120" align="right">
              <template #default="scope">{{ scope.row.bomYieldRate }}%</template>
            </el-table-column>
            <el-table-column prop="bomYieldWeight" label="BOM成材重量(kg)" width="150" align="right" />
            <el-table-column prop="processScrap" label="工艺废料" width="100" align="right" />
            <el-table-column prop="difference" label="差异" width="80" align="right" />
            <el-table-column prop="unmoldReason" label="卸模原因" width="140" show-overflow-tooltip />
            <el-table-column prop="realFurnaceBatch" label="真实炉次号" width="150" show-overflow-tooltip />
            <el-table-column prop="remark" label="备注" width="120" show-overflow-tooltip />
            <el-table-column prop="machineProductCode" label="机台产品代码" width="140" show-overflow-tooltip />
            <el-table-column prop="yieldRateDiff" label="成材率差值" width="120" align="right">
              <template #default="scope">{{ scope.row.yieldRateDiff }}%</template>
            </el-table-column>
            <el-table-column prop="moldNo" label="模号" width="100" />
            <el-table-column prop="scrapUseCase" label="报废用例" width="140" show-overflow-tooltip />
            <el-table-column prop="klt" label="KLT" width="100" />
            <el-table-column prop="chieuDaiSp" label="CHIEU DAI SP" width="120" />
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const searchDate = ref(new Date().toISOString().split('T')[0])

// 表格数据
const tableData = ref<any[]>([])

const loadData = () => {
  // 模拟报表数据
  tableData.value = [
    {
      week: 'W16',
      date: '2026-04-14',
      workshop: '一车间',
      type: '正常',
      machine: 'M001',
      scheduleNo: 'JY260414-001',
      group: 'A组',
      team: '甲班',
      workHours: '8H',
      planQty: 5000,
      startTime: '08:00:00',
      endTime: '16:00:00',
      productionTime: '8H',
      ingotMaterialNo: 'ALU-6063',
      ingotLength: 1000,
      ingotCount: 150,
      totalInputWeight: 5250,
      productMaterialNo: 'P-1001',
      moldGroupNo: 'M10-0649-200',
      finishedLength: 6000,
      finishedMeterWeight: 1.2,
      goodQty: 145,
      goodWeight: 4800,
      badQty: 5,
      badWeight: 150,
      peeling: 50,
      residue: 100,
      headTail: 150,
      hourlyCapacity: 600,
      yieldRate: 91.4,
      bomYieldRate: 92.0,
      bomYieldWeight: 4830,
      processScrap: 300,
      difference: 0,
      unmoldReason: '正常完成',
      realFurnaceBatch: 'F-260414-01',
      remark: '无',
      machineProductCode: 'M001-P1001',
      yieldRateDiff: -0.6,
      moldNo: '002',
      scrapUseCase: '-',
      klt: '-',
      chieuDaiSp: '-'
    },
    {
      week: 'W16',
      date: '2026-04-14',
      workshop: '一车间',
      type: '正常',
      machine: 'M002',
      scheduleNo: 'JY260414-002',
      group: 'B组',
      team: '乙班',
      workHours: '8H',
      planQty: 3000,
      startTime: '08:00:00',
      endTime: '16:00:00',
      productionTime: '8H',
      ingotMaterialNo: 'ALU-6061',
      ingotLength: 800,
      ingotCount: 100,
      totalInputWeight: 3100,
      productMaterialNo: 'P-1002',
      moldGroupNo: 'M10-0650-180',
      finishedLength: 5000,
      finishedMeterWeight: 1.5,
      goodQty: 95,
      goodWeight: 2850,
      badQty: 5,
      badWeight: 100,
      peeling: 30,
      residue: 50,
      headTail: 70,
      hourlyCapacity: 356,
      yieldRate: 91.9,
      bomYieldRate: 93.0,
      bomYieldWeight: 2883,
      processScrap: 150,
      difference: 0,
      unmoldReason: '正常完成',
      realFurnaceBatch: 'F-260414-02',
      remark: '无',
      machineProductCode: 'M002-P1002',
      yieldRateDiff: -1.1,
      moldNo: '001',
      scrapUseCase: '-',
      klt: '-',
      chieuDaiSp: '-'
    }
  ]
}

const handleSearch = () => {
  if (!searchDate.value) {
    ElMessage.warning('请选择查询日期')
    return
  }
  ElMessage.success('查询成功')
  loadData()
}

const handleExport = () => {
  ElMessage.success('报表导出中...')
}

onMounted(() => {
  loadData()
})
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
  border: none;
}

:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-container {
  flex: 1;
  overflow: hidden;
}

.report-table {
  width: 100%;
}

:deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: bold;
}
</style>
