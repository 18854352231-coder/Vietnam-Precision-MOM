<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">生产计划</span>
            <el-input v-model="keyword" placeholder="订单号/产品" style="width: 220px" />
            <el-button type="primary">查询</el-button>
          </div>
          <div>
            <el-button type="primary">导入订单</el-button>
            <el-button>导出计划</el-button>
          </div>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="tableData" border height="100%">
          <el-table-column prop="orderNo" label="订单号" width="160" show-overflow-tooltip />
          <el-table-column prop="product" label="产品名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="spec" label="规格" width="170" show-overflow-tooltip />
          <el-table-column prop="qty" label="数量" width="90" align="right" />
          <el-table-column prop="due" label="交期" width="130" />
          <el-table-column prop="workshop" label="车间" width="100" align="center" />
          <el-table-column label="操作" width="180" align="center">
            <template #default>
              <el-button size="small" link>拆分</el-button>
              <el-button size="small" link type="primary">下达</el-button>
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

const keyword = ref('')
const tableData = ref([
  { orderNo: 'SO-202604-001', product: '铝型材-6063-T5', spec: '100×50×6m', qty: 600, due: '2026-04-20', workshop: '挤压' },
  { orderNo: 'SO-202604-002', product: '铝棒-A级', spec: 'Ø120×4m', qty: 800, due: '2026-04-22', workshop: '熔铸' },
  { orderNo: 'SO-202604-003', product: '铝型材-6061-T6', spec: '80×40×6m', qty: 300, due: '2026-04-25', workshop: '挤压' }
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
