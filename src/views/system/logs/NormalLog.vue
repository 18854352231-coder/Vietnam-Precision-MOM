<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
            <el-input v-model="username" placeholder="操作人" style="width: 150px" />
            <el-button type="primary">查询</el-button>
          </div>
          <el-button type="info" plain>导出日志</el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="user" label="操作人" width="120" />
        <el-table-column prop="module" label="所属模块" width="150" />
        <el-table-column prop="action" label="操作内容" />
        <el-table-column prop="ip" label="IP地址" width="150" />
      </el-table>
      
      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="100" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const dateRange = ref([])
const username = ref('')
const tableData = ref([
  { time: '2026-04-09 10:30:00', user: 'admin', module: '用户管理', action: '新增用户: user_01', ip: '192.168.1.100' },
  { time: '2026-04-09 10:45:00', user: 'admin', module: '权限配置', action: '修改角色权限: 生产员', ip: '192.168.1.100' },
  { time: '2026-04-09 11:00:00', user: 'qc_user', module: '物料主数据', action: '导出物料列表', ip: '192.168.1.105' }
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

