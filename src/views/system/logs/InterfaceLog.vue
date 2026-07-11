<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <el-select v-model="status" placeholder="响应状态" style="width: 120px">
              <el-option label="200 OK" value="200" />
              <el-option label="404 Not Found" value="404" />
              <el-option label="500 Internal Error" value="500" />
            </el-select>
            <el-input v-model="apiUrl" placeholder="接口地址" style="width: 200px" />
            <el-button type="primary">查询</el-button>
          </div>
          <el-button type="info" plain>日志配置</el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="time" label="请求时间" width="180" />
        <el-table-column prop="method" label="请求方法" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.method === 'POST' ? 'primary' : 'success'">
              {{ scope.row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="接口地址" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 200 ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时 (ms)" width="120" />
        <el-table-column label="详情" width="100" align="center">
          <template #default="scope">
            <el-button type="text">查看报文</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="500" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const status = ref('')
const apiUrl = ref('')
const tableData = ref([
  { time: '2026-04-09 11:45:00', method: 'GET', url: '/api/v1/materials/list', status: 200, duration: 125 },
  { time: '2026-04-09 11:45:05', method: 'POST', url: '/api/v1/auth/login', status: 200, duration: 450 },
  { time: '2026-04-09 11:45:10', method: 'GET', url: '/api/v1/departments/tree', status: 200, duration: 88 },
  { time: '2026-04-09 11:45:15', method: 'POST', url: '/api/v1/users/create', status: 500, duration: 1500 }
])
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-bar {
  display: flex;
  gap: 10px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

