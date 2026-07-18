<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">校验任务管理</span>
            <el-input placeholder="校验单编号/名称" style="width: 220px" clearable />
            <el-button type="primary">查询</el-button>
            <el-button @click="toggleAdvancedSearch">高级搜索/{{ isAdvancedSearch ? '收起' : '展开' }}</el-button>
            <el-button>重置</el-button>
          </div>
          <div class="header-right">
            <el-button type="primary">新增</el-button>
            <el-button type="success">批量校验</el-button>
            <el-button type="warning">导出Excel</el-button>
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
                    <el-option label="模板A" value="A" />
                    <el-option label="模板B" value="B" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="检验单状态" style="width: 100%;">
                  <el-select v-model="searchForm.status" placeholder="校验中" clearable style="width: 100%;">
                    <el-option label="校验中" value="校验中" />
                    <el-option label="已完成" value="已完成" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item style="width: 100%;">
                  <el-radio-group v-model="searchForm.calibType">
                    <el-radio label="内部校验">内部校验</el-radio>
                    <el-radio label="委外校验">委外校验</el-radio>
                  </el-radio-group>
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
          <el-table-column prop="certNo" label="证书编号" width="100" align="center" />
          <el-table-column prop="method" label="计量方式" width="90" align="center" />
          <el-table-column prop="status" label="状态" width="80" align="center" />
          <el-table-column prop="department" label="使用部门" width="120" show-overflow-tooltip />
          <el-table-column prop="workshop" label="使用车间" width="100" />
          <el-table-column prop="team" label="班组" width="80" />
          <el-table-column prop="location" label="具体位置" width="100" />
          <el-table-column prop="owner" label="责任人" width="100" />
          <el-table-column prop="warnDays" label="预警/天" width="80" align="center">
            <template #default="{ row }">
              <div v-if="row.warnDays === '1'" style="background-color: #f56c6c; color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                {{ row.warnDays }}
              </div>
              <span v-else>{{ row.warnDays }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="100" show-overflow-tooltip />
          <el-table-column prop="calibCode" label="校验单编号" width="140" />
          <el-table-column prop="temp" label="温度" width="80" align="center" />
          <el-table-column prop="humidity" label="湿度" width="80" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column prop="result" label="校验结论" width="100" align="center" />
          <el-table-column prop="taskStatus" label="状态" width="80" align="center" />
          <el-table-column prop="auditor" label="审批人" width="80" align="center" />
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default>
              <el-button link type="primary" size="small">详情</el-button>
              <el-button link type="primary" size="small">校验单录入</el-button>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next"
          :total="579"
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
  calibCode: '',
  manageCode: '',
  name: '',
  template: '',
  status: '校验中',
  calibType: '内部校验'
})

const tableData = ref([
  { certNo: '-', method: '内...', status: '校验中', department: '铸造车间', workshop: '铸造二车间', team: '乙班', location: '/', owner: '鹿锡胜', warnDays: '1', remark: '-', calibCode: 'JL260715010', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '生产部一...', workshop: '挤压', team: 'A18', location: '/', owner: '高明...', warnDays: '1', remark: '-', calibCode: 'JL260715015', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '铸造车间', workshop: '铸造二车间', team: '乙班', location: '/', owner: '鹿锡胜', warnDays: '1', remark: '-', calibCode: 'JL260715006', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '铸造车间', workshop: '铸造二车间', team: '乙班', location: '/', owner: '鹿锡胜', warnDays: '1', remark: '-', calibCode: 'JL260715011', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '生产部二...', workshop: '裁切', team: '/', location: '/', owner: '赵玲玲...', warnDays: '1', remark: '-', calibCode: 'JL260715005', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '品保部', workshop: '计量室', team: '10-4', location: '11-3', owner: '王若瑾', warnDays: '1', remark: '-', calibCode: 'JL260715002', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '铸造车间', workshop: '铸造二车间', team: '乙班', location: '/', owner: '鹿锡胜', warnDays: '1', remark: '-', calibCode: 'JL260715007', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '铸造车间', workshop: '铸造二车间', team: '乙班', location: '/', owner: '鹿锡胜', warnDays: '1', remark: '-', calibCode: 'JL260715008', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '品保部', workshop: '计量室', team: '10-1', location: '04', owner: '王若瑾', warnDays: '1', remark: '-', calibCode: 'JL260715004', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '铸造车间', workshop: '铸造二车间', team: '乙班', location: '/', owner: '鹿锡胜', warnDays: '1', remark: '-', calibCode: 'JL260715009', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '品保部', workshop: '计量室', team: '10-3', location: '1-1', owner: '王若瑾', warnDays: '1', remark: '-', calibCode: 'JL260715001', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '品保部', workshop: '计量室', team: '10-4', location: '11-3', owner: '王若瑾', warnDays: '1', remark: '-', calibCode: 'JL260715003', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '品保部', workshop: '计量室', team: '9-6', location: '3-2', owner: '王若瑾', warnDays: '1', remark: '-', calibCode: 'JL260715013', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '品保部', workshop: '计量室', team: '9-6', location: '3-2', owner: '王若瑾', warnDays: '1', remark: '-', calibCode: 'JL260715012', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' },
  { certNo: '-', method: '内...', status: '校验中', department: '品保部', workshop: '计量室', team: '10-5', location: '3-2', owner: '王若瑾', warnDays: '1', remark: '-', calibCode: 'JL260715014', temp: '21.8', humidity: '58', createTime: '2026-07-15 04...', result: '-', taskStatus: '校验中', auditor: '-' }
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
</style>