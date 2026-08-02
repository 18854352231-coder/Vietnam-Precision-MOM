<template>
  <div class="page-container">
    <el-card class="main-card">
      <template #header><span class="header-title">SPC趋势分析</span></template>

      <el-descriptions :column="4" border class="overview">
        <el-descriptions-item label="已完成检验">{{ completedTasks.length }}</el-descriptions-item>
        <el-descriptions-item label="一次合格率">{{ passRate }}%</el-descriptions-item>
        <el-descriptions-item label="NG任务">{{ ngTasks.length }}</el-descriptions-item>
        <el-descriptions-item label="冻结对象">{{ frozenTasks.length }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-title">各工序质量统计</div>
      <el-table :data="processStats" border stripe>
        <el-table-column prop="process" label="工序" min-width="140" />
        <el-table-column prop="total" label="检验数量" width="120" align="center" />
        <el-table-column prop="ok" label="合格数量" width="120" align="center" />
        <el-table-column label="合格率" min-width="240">
          <template #default="{ row }">
            <span v-if="row.total === 0">-</span>
            <el-progress v-else :percentage="row.passRate" :status="row.passRate < 95 ? 'exception' : 'success'" />
          </template>
        </el-table-column>
      </el-table>

      <div class="section-title">NG项目统计</div>
      <el-table :data="ngItemStats" border stripe>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="item" label="NG项目" min-width="180" />
        <el-table-column prop="count" label="次数" width="110" align="center" />
        <el-table-column prop="percentage" label="占比" width="120" align="center">
          <template #default="{ row }">{{ row.percentage }}%</template>
        </el-table-column>
      </el-table>
      <el-empty v-if="ngItemStats.length === 0" description="暂无NG数据" :image-size="72" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIPQCStore, type IPQCProcess } from '@/store/ipqc'

const store = useIPQCStore()
const processOptions: IPQCProcess[] = ['挤压', '时效', '裁切上料', '裁切', '预包装']
const completedTasks = computed(() => store.tasks.filter(item => item.result && ['已放行', 'NG待处置', '已关闭'].includes(item.status)))
const ngTasks = computed(() => completedTasks.value.filter(item => item.result === 'NG'))
const frozenTasks = computed(() => store.tasks.filter(item => item.qualityStatus === '冻结'))
const passRate = computed(() => completedTasks.value.length ? Math.round(completedTasks.value.filter(item => item.result === 'OK').length / completedTasks.value.length * 100) : 0)

const processStats = computed(() => processOptions.map(process => {
  const records = completedTasks.value.filter(item => item.process === process)
  const ok = records.filter(item => item.result === 'OK').length
  return { process, total: records.length, ok, passRate: records.length ? Math.round(ok / records.length * 100) : 0 }
}))

const ngItemStats = computed(() => {
  const counter = new Map<string, number>()
  ngTasks.value.flatMap(task => task.items.filter(item => item.result === 'NG')).forEach(item => counter.set(item.item, (counter.get(item.item) || 0) + 1))
  const total = [...counter.values()].reduce((sum, count) => sum + count, 0)
  return [...counter.entries()]
    .map(([item, count]) => ({ item, count, percentage: total ? Math.round(count / total * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
})
</script>

<style scoped>
.page-container { padding: 16px; min-height: 100%; box-sizing: border-box; background: var(--bg-primary); }
.main-card { min-height: calc(100vh - 116px); }
.header-title { font-size: 18px; font-weight: 600; color: #303133; }
.overview { margin-bottom: 18px; }
.section-title { margin: 20px 0 12px; padding-left: 10px; border-left: 3px solid #409eff; font-weight: 600; color: #303133; }
</style>
