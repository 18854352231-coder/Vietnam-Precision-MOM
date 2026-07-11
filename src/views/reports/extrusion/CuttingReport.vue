<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <span class="title">裁切生产日报</span>
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
        <!-- 数据表格 -->
        <div class="table-container">
          <el-table 
            :data="tableData" 
            border 
            stripe 
            height="100%"
            class="report-table"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="process" label="工序" width="90" align="center" />
            <el-table-column prop="team" label="班组" width="90" align="center" />
            <el-table-column prop="machineNo" label="机台" width="90" align="center" />
            <el-table-column prop="leader" label="班长" width="90" align="center" />
            
            <el-table-column label="产量统计 (T)" align="center">
              <el-table-column prop="inputQty" label="总投入T" width="120" align="right" />
              <el-table-column prop="outputQty" label="总产出T" width="120" align="right" />
              <el-table-column prop="planQty" label="计划产量T" width="120" align="right" />
            </el-table-column>

            <el-table-column label="效率分析" align="center">
              <el-table-column prop="yieldRate" label="成材率" width="100" align="right">
                <template #default="scope">{{ scope.row.yieldRate }}%</template>
              </el-table-column>
              <el-table-column prop="achievementRate" label="达成率" width="100" align="right">
                <template #default="scope">
                  <span :class="scope.row.achievementRate >= 100 ? 'text-success' : 'text-danger'">
                    {{ scope.row.achievementRate }}%
                  </span>
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="工时统计 (H)" align="center">
              <el-table-column prop="planHours" label="计划开机时间H" width="120" align="right" />
              <el-table-column prop="actualHours" label="实际开机时间H" width="120" align="right" />
              <el-table-column prop="oee" label="设备稼动率" width="120" align="right">
                <template #default="scope">{{ scope.row.oee }}%</template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="人力效能" align="center">
              <el-table-column prop="manpower" label="生产人力" width="90" align="right" />
              <el-table-column prop="efficiencyPerPerson" label="人均效率T" width="120" align="right" />
            </el-table-column>
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
  // 模拟按班组统计的报表数据
  tableData.value = [
    {
      process: '裁切',
      team: 'A班',
      machineNo: '-',
      leader: '张建国',
      inputQty: 27.7,
      outputQty: 26.8,
      planQty: 27.0,
      yieldRate: 96.8,
      achievementRate: 99.3,
      planHours: 16.0,
      actualHours: 15.5,
      oee: 96.9,
      manpower: 7,
      efficiencyPerPerson: 3.8
    },
    {
      process: '裁切',
      team: 'B班',
      machineNo: '-',
      leader: '王强',
      inputQty: 14.0,
      outputQty: 13.5,
      planQty: 15.0,
      yieldRate: 96.4,
      achievementRate: 90.0,
      planHours: 8.0,
      actualHours: 6.8,
      oee: 85.0,
      manpower: 4,
      efficiencyPerPerson: 3.3
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

.text-success {
  color: #67C23A;
  font-weight: bold;
}

.text-danger {
  color: #F56C6C;
  font-weight: bold;
}
</style>
