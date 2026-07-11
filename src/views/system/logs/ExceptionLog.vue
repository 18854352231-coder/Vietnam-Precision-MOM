<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <el-input v-model="module" placeholder="模块名" style="width: 150px" />
            <el-button type="primary">查询</el-button>
          </div>
          <div class="actions">
            <el-button @click="exportLogs">导出日志</el-button>
            <el-button @click="clearLogs">清空异常日志</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="time" label="异常时间" width="180" />
        <el-table-column prop="module" label="所属模块" width="150" />
        <el-table-column prop="message" label="异常信息" />
        <el-table-column prop="user" label="操作人" width="120" />
        <el-table-column label="详情" width="100" align="center">
          <template #default="scope">
            <el-button type="text" @click="showDetail(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="20" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const module = ref('')
const tableData = ref([
  { time: '2026-04-09 09:15:22', level: 'error', module: 'PLC通信', message: '挤压机 PLC 连接中断: Connection Timeout', user: 'system' },
  { time: '2026-04-09 10:20:45', level: 'warning', module: '数据备份', message: '磁盘空间不足 (剩余 5%)', user: 'system' },
  { time: '2026-04-09 11:30:10', level: 'error', module: '用户登录', message: '尝试登录次数过多 (IP: 192.168.1.150)', user: 'ext_worker1' }
])

const showDetail = (row: any) => {
  ElMessage.info('查看详情: ' + row.message)
}

const clearLogs = () => {
  tableData.value = []
  ElMessage.success('已清空异常日志')
}

const exportLogs = () => {
  const rows = [
    ['异常时间', '所属模块', '异常信息', '操作人'],
    ...tableData.value.map(r => [r.time, r.module, r.message, r.user])
  ]
  const csv = rows.map(r =>
    r.map(field => {
      const s = String(field ?? '')
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
      return s
    }).join(',')
  ).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '异常日志.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出完成')
}
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

