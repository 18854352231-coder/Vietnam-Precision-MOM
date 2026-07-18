<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>料框管理</span>
        </div>
      </template>
      <div style="text-align: center; color: #999; padding: 40px;">
        模块开发中...
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
  height: 100%;
}
.card-header {
  font-weight: 600;
}
</style>