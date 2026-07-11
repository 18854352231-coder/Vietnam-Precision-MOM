<template>
  <div class="page-container">
    <el-card class="full-card" shadow="never">
      <div class="header">
        <span class="title">不良品管控</span>
      </div>
      <div class="content">
        <el-empty description="不良品管控模块开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()
</script>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.header {
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}
.title {
  font-size: 16px;
  font-weight: bold;
}
.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
