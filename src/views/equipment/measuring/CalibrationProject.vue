<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">校验项目管理</span>
            <el-input v-model="searchForm.keyword" placeholder="项目编号/名称" style="width: 220px" clearable @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="toggleAdvancedSearch">{{ isAdvancedSearch ? '收起查询' : '高级查询' }}</el-button>
          </div>
          <div class="header-right">
            <el-button type="primary">新增</el-button>
            <el-button>确认</el-button>
            <el-button>批量导入</el-button>
            <el-button>导出excel</el-button>
          </div>
        </div>
        <div v-show="isAdvancedSearch" class="advanced-search-panel">
          <el-form :inline="true" :model="searchForm" size="small" style="width: 100%;">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="项目编号" style="width: 100%;">
                  <el-input v-model="searchForm.projectCode" clearable style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="项目名称" style="width: 100%;">
                  <el-input v-model="searchForm.projectName" clearable style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="类型" style="width: 100%;">
                  <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="数值" value="数值" />
                    <el-option label="文字" value="文字" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="状态" style="width: 100%;">
                  <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="确认" value="确认" />
                    <el-option label="草稿" value="草稿" />
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
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="projectCode" label="项目编号" width="100" align="center" />
          <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="dataType" label="数据类型" width="100" align="center" />
          <el-table-column prop="standardValue" label="标准值" width="120" align="center" />
          <el-table-column prop="lowerLimit" label="允许误差下限" width="120" align="center" />
          <el-table-column prop="upperLimit" label="允许误差上限" width="120" align="center" />
          <el-table-column prop="decimals" label="小数位数" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="{ row }">
              <span :class="row.status === '确认' ? 'status-confirmed' : 'status-draft'">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default>
              <el-button link type="primary" size="small">编辑</el-button>
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
  projectCode: '',
  projectName: '',
  type: '',
  status: ''
})

const filters = ref({ ...searchForm.value })

const handleSearch = () => {
  filters.value = { ...searchForm.value }
}

const handleReset = () => {
  searchForm.value = { keyword: '', projectCode: '', projectName: '', type: '', status: '' }
  handleSearch()
}

const tableData = ref([
  { projectCode: 'PJ-001', projectName: '外观检查', dataType: '文字', standardValue: '无破损、锈蚀', measuredValue: '-', lowerLimit: '-', upperLimit: '-', result: '判定', decimals: '-', status: '确认', remark: '通用项目' },
  { projectCode: 'PJ-002', projectName: '示值误差', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '-0.02', upperLimit: '0.02', result: '误差', decimals: '2', status: '确认', remark: '游标卡尺' },
  { projectCode: 'PJ-003', projectName: '重复性', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '0.00', upperLimit: '0.01', result: '误差', decimals: '2', status: '确认', remark: '游标卡尺' },
  { projectCode: 'PJ-004', projectName: '称量误差', dataType: '数值', standardValue: '10.00', measuredValue: '-', lowerLimit: '-0.01', upperLimit: '0.01', result: '误差', decimals: '2', status: '确认', remark: '30kg电子秤' },
  { projectCode: 'PJ-005', projectName: '温度示值误差', dataType: '数值', standardValue: '25.0', measuredValue: '-', lowerLimit: '-0.5', upperLimit: '0.5', result: '误差', decimals: '1', status: '确认', remark: '温湿度计' }
])

const filteredData = computed(() => {
  const query = filters.value.keyword.trim().toLowerCase()
  return tableData.value.filter(item => {
    const matchesKeyword = !query || `${item.projectCode} ${item.projectName}`.toLowerCase().includes(query)
    const matchesCode = !filters.value.projectCode || item.projectCode.toLowerCase().includes(filters.value.projectCode.trim().toLowerCase())
    const matchesName = !filters.value.projectName || item.projectName.toLowerCase().includes(filters.value.projectName.trim().toLowerCase())
    const matchesType = !filters.value.type || item.dataType === filters.value.type
    const matchesStatus = !filters.value.status || item.status === filters.value.status
    return matchesKeyword && matchesCode && matchesName && matchesType && matchesStatus
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
.title {
  font-weight: 600;
  font-size: 16px;
  margin-right: 12px;
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
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.status-confirmed {
  color: #409eff;
}
.status-draft {
  color: #909399;
}
</style>
