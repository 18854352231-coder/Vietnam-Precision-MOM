<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">计划总览</span>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            <el-select v-model="status" placeholder="状态" style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="未开始" value="pending" />
              <el-option label="进行中" value="running" />
              <el-option label="已完成" value="done" />
            </el-select>
            <el-button type="primary">查询</el-button>
          </div>
          <div>
            <el-button type="primary">新建主计划</el-button>
          </div>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="tableData" border height="100%">
          <el-table-column prop="planNo" label="计划编号" width="150" show-overflow-tooltip />
          <el-table-column prop="product" label="产品名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="quantity" label="计划数量" width="110" align="right" />
          <el-table-column prop="start" label="开始日期" width="130" />
          <el-table-column prop="end" label="结束日期" width="130" />
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="scope">
              <el-tag :type="statusType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default>
              <el-button size="small" link>详情</el-button>
              <el-button size="small" link type="primary">调整</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
  </template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const dateRange = ref([])
const status = ref('')
const tableData = ref([
  { planNo: 'MP-202604-001', product: '铝型材-6063-T5', quantity: 1200, start: '2026-04-11', end: '2026-04-18', status: 'running' },
  { planNo: 'MP-202604-002', product: '铝棒-A级', quantity: 800, start: '2026-04-12', end: '2026-04-20', status: 'pending' },
  { planNo: 'MP-202604-003', product: '铝型材-6061-T6', quantity: 500, start: '2026-03-28', end: '2026-04-05', status: 'done' }
])

const statusText = (s: string) => {
  if (s === 'running') return '进行中'
  if (s === 'pending') return '未开始'
  if (s === 'done') return '已完成'
  return s
}
const statusType = (s: string) => {
  if (s === 'running') return 'warning'
  if (s === 'pending') return 'info'
  if (s === 'done') return 'success'
  return 'info'
}
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
  font-size: 16px;
  font-weight: 600;
  margin-right: 12px;
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
</style>
