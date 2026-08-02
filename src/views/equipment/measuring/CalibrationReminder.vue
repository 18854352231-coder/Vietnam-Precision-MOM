<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="title">校验提醒规则</div>
          <div class="header-right">
            <el-button>新增</el-button>
          </div>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="tableData" border empty-text="暂无提醒规则">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="method" label="计量方式" min-width="140">
            <template #default="{ row }">
              {{ row.method }}
            </template>
          </el-table-column>
          <el-table-column prop="days" label="提醒时间" min-width="140">
            <template #default="{ row }">到期前 {{ row.days }} 天</template>
          </el-table-column>
          <el-table-column prop="color" label="提醒颜色" min-width="140">
            <template #default="{ row }">
              <span class="color-dot" :style="{ backgroundColor: reminderColor(row.color) }" />
              {{ row.color }}
            </template>
          </el-table-column>
          <el-table-column prop="auto" label="自动生成校验任务" min-width="150">
            <template #default="{ row }">
              <el-switch v-model="row.auto" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default>
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
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

const tableData = ref([
  { method: '内部校验', days: '7', color: '橙色', auto: true },
  { method: '委外校验', days: '30', color: '红色', auto: true }
])

const reminderColor = (color: string) => color === '红色' ? '#f56c6c' : '#e6a23c'
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
.title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}
.table-wrapper {
  flex: 0 0 auto;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
.color-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
  vertical-align: 1px;
}
</style>
