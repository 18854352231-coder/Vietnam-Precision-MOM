<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">校验项目管理</span>
            <el-input placeholder="项目编号/名称" style="width: 220px" clearable />
            <el-button type="primary">查询</el-button>
            <el-button @click="toggleAdvancedSearch">高级搜索/{{ isAdvancedSearch ? '收起' : '展开' }}</el-button>
            <el-button>重置</el-button>
          </div>
          <div class="header-right">
            <el-button type="primary">新增</el-button>
            <el-button type="success">确认</el-button>
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
                <el-button type="primary">查询</el-button>
                <el-button>重置</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="tableData" border height="100%">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="projectCode" label="项目编号" width="100" align="center" />
          <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="dataType" label="数据类型" width="100" align="center" />
          <el-table-column prop="standardValue" label="标准值" width="100" align="center" />
          <el-table-column prop="measuredValue" label="测量值" width="100" align="center" />
          <el-table-column prop="lowerLimit" label="允许误差下限" width="120" align="center" />
          <el-table-column prop="upperLimit" label="允许误差上限" width="120" align="center" />
          <el-table-column prop="result" label="测量结果" width="100" align="center" />
          <el-table-column prop="decimals" label="小数位数" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="80" align="center" />
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default>
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="primary" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next"
          :total="77"
          :page-sizes="[20, 50, 100]"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
useTaskLiteralDomI18n()

const isAdvancedSearch = ref(false)
const toggleAdvancedSearch = () => {
  isAdvancedSearch.value = !isAdvancedSearch.value
}

const searchForm = ref({
  projectCode: '',
  projectName: '',
  type: '',
  status: ''
})

const tableData = ref([
  { projectCode: '0504', projectName: 'B/C面垂直度/mm (A-底面; B-前竖面; C-侧面)', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '0.00', upperLimit: '0.03', result: '误差', decimals: '2', status: '确认', remark: '垂直度检具' },
  { projectCode: '0503', projectName: 'A/C面垂直度/mm (A-底面; B-前竖面; C-侧面)', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '0.00', upperLimit: '0.03', result: '误差', decimals: '2', status: '确认', remark: '垂直度检具' },
  { projectCode: '0502', projectName: 'A/B面垂直度/mm (A-底面; B-前竖面; C-侧面)', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '0.00', upperLimit: '0.03', result: '误差', decimals: '2', status: '确认', remark: '垂直度检具' },
  { projectCode: '0501', projectName: '直线度/mm', dataType: '数值', standardValue: '0.00', measuredValue: '-', lowerLimit: '0.00', upperLimit: '0.03', result: '误差', decimals: '2', status: '确认', remark: '平面度/直线度...' },
  { projectCode: '0605', projectName: '称量误差/kg', dataType: '数值', standardValue: '10', measuredValue: '-', lowerLimit: '-0.01', upperLimit: '0.01', result: '误差', decimals: '2', status: '确认', remark: '30/0.02kg' },
  { projectCode: '0606', projectName: '称量误差/kg', dataType: '数值', standardValue: '5', measuredValue: '-', lowerLimit: '-0.003', upperLimit: '0.003', result: '误差', decimals: '3', status: '确认', remark: '6/0.002kg' },
  { projectCode: '0604', projectName: '称量误差/kg', dataType: '数值', standardValue: '1', measuredValue: '-', lowerLimit: '-0.001', upperLimit: '0.001', result: '误差', decimals: '3', status: '确认', remark: '6/0.002kg' },
  { projectCode: '0601', projectName: '偏载/kg', dataType: '数值', standardValue: '0', measuredValue: '-', lowerLimit: '-0.01', upperLimit: '0.01', result: '误差', decimals: '2', status: '确认', remark: '30/0.02kg' },
  { projectCode: '0602', projectName: '称量误差/kg', dataType: '数值', standardValue: '0.4', measuredValue: '-', lowerLimit: '-0.01', upperLimit: '0.01', result: '误差', decimals: '2', status: '确认', remark: '30/0.02kg' },
  { projectCode: '0603', projectName: '称量误差/kg', dataType: '数值', standardValue: '1', measuredValue: '-', lowerLimit: '-0.01', upperLimit: '0.01', result: '误差', decimals: '2', status: '确认', remark: '30/0.02kg' },
  { projectCode: '0605', projectName: '称量误差/kg', dataType: '数值', standardValue: '4', measuredValue: '-', lowerLimit: '-0.002', upperLimit: '0.002', result: '误差', decimals: '3', status: '确认', remark: '6/0.002kg' },
  { projectCode: '0601', projectName: '偏载/kg', dataType: '数值', standardValue: '0', measuredValue: '-', lowerLimit: '-0.002', upperLimit: '0.002', result: '误差', decimals: '3', status: '确认', remark: '6/0.002kg' }
])
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
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
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
</style>