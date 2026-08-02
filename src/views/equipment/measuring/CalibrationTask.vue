<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">校验任务管理</span>
            <el-input v-model="searchForm.keyword" placeholder="校验单号/设备编号/名称" style="width: 240px" clearable @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="toggleAdvancedSearch">{{ isAdvancedSearch ? '收起查询' : '高级查询' }}</el-button>
          </div>
          <div class="header-right">
            <el-button type="primary">新增</el-button>
            <el-button>批量校验</el-button>
            <el-button>导出Excel</el-button>
          </div>
        </div>
        <div v-show="isAdvancedSearch" class="advanced-search-panel">
          <el-form :inline="true" :model="searchForm" size="small" style="width: 100%;">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="校验单编号" style="width: 100%;">
                  <el-input v-model="searchForm.calibCode" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="管理编号" style="width: 100%;">
                  <el-input v-model="searchForm.manageCode" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="量检具名称" style="width: 100%;">
                  <el-input v-model="searchForm.name" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="校验模板" style="width: 100%;">
                  <el-select v-model="searchForm.template" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="游标卡尺校验模板" value="MB-001" />
                    <el-option label="电子秤校验模板" value="MB-002" />
                    <el-option label="温湿度计校验模板" value="MB-003" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="检验单状态" style="width: 100%;">
                  <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="校验中" value="校验中" />
                    <el-option label="已完成" value="已完成" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="计量方式" style="width: 100%;">
                  <el-select v-model="searchForm.calibType" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="内部校验" value="内校" />
                    <el-option label="委外校验" value="外校" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row style="margin-top: 10px;">
              <el-col :span="24" style="display: flex; gap: 10px;">
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="filteredData" border height="100%" empty-text="暂无符合条件的数据">
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column prop="calibCode" label="校验单编号" width="125" />
          <el-table-column prop="manageCode" label="管理编号" width="90" />
          <el-table-column prop="name" label="设备名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="method" label="方式" width="80" align="center">
            <template #default="{ row }">
              {{ row.method }}
            </template>
          </el-table-column>
          <el-table-column prop="department" label="使用部门" width="90" show-overflow-tooltip />
          <el-table-column prop="warnDays" label="预警" width="70" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.warnDays !== '-'" :type="Number(row.warnDays) <= 1 ? 'danger' : 'warning'" effect="plain">
                {{ row.warnDays }}天
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="result" label="结论" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.result !== '-'" :type="row.result === '合格' ? 'success' : 'danger'">{{ row.result }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="taskStatus" label="任务状态" width="90" align="center">
            <template #default="{ row }">
              <span :class="row.taskStatus === '已完成' ? 'status-done' : 'status-processing'">{{ row.taskStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="145" align="center" fixed="right">
            <template #default>
              <el-button link type="primary" size="small">详情</el-button>
              <el-button link type="primary" size="small">录入</el-button>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next"
          :total="filteredData.length"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
useTaskLiteralDomI18n()

const isAdvancedSearch = ref(false)
const toggleAdvancedSearch = () => {
  isAdvancedSearch.value = !isAdvancedSearch.value
}

const searchForm = ref({
  keyword: '',
  calibCode: '',
  manageCode: '',
  name: '',
  template: '',
  status: '',
  calibType: ''
})

const filters = ref({ ...searchForm.value })

const handleSearch = () => {
  filters.value = { ...searchForm.value }
}

const handleReset = () => {
  searchForm.value = { keyword: '', calibCode: '', manageCode: '', name: '', template: '', status: '', calibType: '' }
  handleSearch()
}

const tableData = ref([
  { certNo: '-', manageCode: 'LJ-001', name: '数显游标卡尺', template: 'MB-001', method: '内校', status: '校验中', department: '生产部', workshop: '机加工', team: 'A班', location: '检验台1', owner: '阮文安', warnDays: '1', remark: '今日完成', calibCode: 'JY260802001', temp: '23.5℃', humidity: '61%', createTime: '2026-08-02 08:30', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', manageCode: 'WD-002', name: '数字温湿度计', template: 'MB-003', method: '外校', status: '校验中', department: '品保部', workshop: '实验室', team: '检测组', location: '环境监测点', owner: '黎明俊', warnDays: '0', remark: '已送外校', calibCode: 'JY260801002', temp: '-', humidity: '-', createTime: '2026-08-01 15:20', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: 'NJ26073008', manageCode: 'JY-006', name: '垂直度检具', template: 'MB-001', method: '内校', status: '已完成', department: '品保部', workshop: '计量室', team: '检测组', location: '检具柜2', owner: '王若瑾', warnDays: '-', remark: '-', calibCode: 'JY260730008', temp: '23.0℃', humidity: '58%', createTime: '2026-07-30 09:10', result: '合格', taskStatus: '已完成', auditor: '李主管' },
  { certNo: 'VMI-260728-21', manageCode: 'ZL-003', name: '电子秤', template: 'MB-002', method: '外校', status: '已完成', department: '仓储部', workshop: '成品仓', team: '白班', location: '收货区', owner: '陈氏兰', warnDays: '-', remark: '-', calibCode: 'JY260725003', temp: '-', humidity: '-', createTime: '2026-07-25 10:05', result: '合格', taskStatus: '已完成', auditor: '李主管' }
])

const filteredData = computed(() => {
  const query = filters.value.keyword.trim().toLowerCase()
  return tableData.value.filter(item => {
    const matchesKeyword = !query || `${item.calibCode} ${item.manageCode} ${item.name}`.toLowerCase().includes(query)
    const matchesCode = !filters.value.calibCode || item.calibCode.toLowerCase().includes(filters.value.calibCode.trim().toLowerCase())
    const matchesManageCode = !filters.value.manageCode || item.manageCode.toLowerCase().includes(filters.value.manageCode.trim().toLowerCase())
    const matchesName = !filters.value.name || item.name.toLowerCase().includes(filters.value.name.trim().toLowerCase())
    const matchesTemplate = !filters.value.template || item.template === filters.value.template
    const matchesStatus = !filters.value.status || item.taskStatus === filters.value.status
    const matchesType = !filters.value.calibType || item.method === filters.value.calibType
    return matchesKeyword && matchesCode && matchesManageCode && matchesName && matchesTemplate && matchesStatus && matchesType
  })
})
</script>

<style scoped>
.page-container {
  height: 100%;
}
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.advanced-search-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}
:deep(.el-form-item) {
  margin-bottom: 0;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}
.table-wrapper {
  flex: 1;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
:deep(.el-table .cell) {
  padding: 0 4px;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.status-done {
  color: #67c23a;
}
.status-processing {
  color: #e6a23c;
}
</style>
