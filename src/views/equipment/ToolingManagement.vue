<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工装管理</span>
          <el-button type="primary" size="small">新增工装</el-button>
        </div>
      </template>
      <el-empty description="工装管理数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()
// 工装管理
</script>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

