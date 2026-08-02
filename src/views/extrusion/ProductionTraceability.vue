<template>
  <div class="page-container">
    <el-card class="full-card" shadow="never">
      <div class="search-panel">
        <div class="search-title">全过程追溯</div>
        <div class="search-subtitle">输入或扫描挤压批次号、料框码、裁切托盘码、包装栈板码，查询完整生产流转记录</div>
        <div class="search-row">
          <el-input
            v-model="traceCode"
            size="large"
            clearable
            placeholder="请输入或扫描批次号 / 料框码 / 托盘码"
            @keyup.enter="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" size="large" icon="Search" @click="handleSearch">查询追溯</el-button>
          <el-button size="large" icon="Refresh" @click="handleReset">重置</el-button>
        </div>
        <div class="example-row">
          <span class="example-label">快速查询：</span>
          <el-tag
            v-for="item in quickCodes"
            :key="item"
            class="quick-code"
            effect="plain"
            @click="searchByCode(item)"
          >
            {{ item }}
          </el-tag>
        </div>
      </div>

      <template v-if="currentTrace">
        <div class="section-title">追溯概览</div>
        <el-descriptions :column="4" border class="overview-descriptions">
          <el-descriptions-item label="当前状态">
            <el-tag type="success" size="small">{{ currentTrace.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="排程编号">{{ currentTrace.scheduleNo }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ currentTrace.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ currentTrace.customerName }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentTrace.productName }}</el-descriptions-item>
          <el-descriptions-item label="挤压批次">{{ currentTrace.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="来源料框">{{ currentTrace.sourceFrameNo }}</el-descriptions-item>
          <el-descriptions-item label="成品库位">{{ currentTrace.storageLocation }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title process-title">工序进度</div>
        <div class="steps-wrapper">
          <el-steps :active="currentTrace.stages.length" finish-status="success" align-center>
            <el-step v-for="stage in currentTrace.stages" :key="stage.name" :title="stage.name" :description="stage.shortTime" />
          </el-steps>
        </div>

        <div class="section-title timeline-title">流转明细</div>
        <div class="timeline-wrapper">
          <el-timeline>
            <el-timeline-item
              v-for="stage in currentTrace.stages"
              :key="stage.name"
              :timestamp="stage.time"
              placement="top"
              type="success"
              hollow
            >
              <div class="stage-card">
                <div class="stage-header">
                  <div class="stage-name">{{ stage.name }}</div>
                  <el-tag :type="stage.status === '已完成' ? 'success' : 'primary'" size="small">{{ stage.status }}</el-tag>
                </div>
                <el-descriptions :column="3" size="small">
                  <el-descriptions-item label="关键编号">{{ stage.code }}</el-descriptions-item>
                  <el-descriptions-item label="设备/位置">{{ stage.position }}</el-descriptions-item>
                  <el-descriptions-item label="操作人/来源">{{ stage.operator }}</el-descriptions-item>
                </el-descriptions>
                <div class="stage-note">{{ stage.note }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </template>

      <el-empty v-else description="未找到对应的生产追溯记录，请检查编号后重新查询" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const route = useRoute()
const quickCodes = ['JY2603070002', 'CV-A-A-L6000*W1250*H650*0199', 'PLT-20260724-001', '20260724-01']
const traceCode = ref(String(route.query.code || 'PLT-20260724-001'))
const searchedCode = ref(traceCode.value)

const traceRecords = [
  {
    id: 'TRC-20260724-001',
    aliases: quickCodes,
    status: '已入库',
    scheduleNo: 'PC-20260424-002',
    orderNo: 'ORD-2026-002',
    customerName: '客户A',
    productName: 'FC113',
    batchNo: 'JY2603070002',
    sourceFrameNo: 'CV-A-A-L6000*W1250*H650*0199',
    storageLocation: '成品A区',
    stages: [
      { name: '下发排程', status: '已完成', time: '2026-07-24 08:05:12', shortTime: '08:05', code: 'PC-20260424-002', position: '计划中心', operator: '计划员', note: '排程已下发至挤压生产，订单与产品信息校验通过。' },
      { name: '挤压', status: '已完成', time: '2026-07-24 08:42:36', shortTime: '08:42', code: 'JY2603070002', position: 'JY-07', operator: 'A01', note: '挤压完成，生成批次并绑定模具 999#。' },
      { name: '锯切', status: '已完成', time: '2026-07-24 09:18:20', shortTime: '09:18', code: 'CV-A-A-L6000*W1250*H650*0199', position: '锯切缓存位 B2-06', operator: 'A01', note: '锯切装框完成，料框信息已发送至 AGV/WCS。' },
      { name: '时效', status: '已完成', time: '2026-07-24 15:40:08', shortTime: '15:40', code: 'AGE-20260724-002', position: '2号时效炉', operator: 'AGV/WCS', note: 'AGV 于 09:24 接收，09:40 入炉，时效完成后自动回传出炉结果。' },
      { name: '裁切', status: '已完成', time: '2026-07-24 16:31:17', shortTime: '16:31', code: 'PLT-20260724-001', position: '裁切工作台 1号锯', operator: 'A01', note: '裁切完成并打印物料标识卡，托盘数据流转至包装。' },
      { name: '包装', status: '已完成', time: '2026-07-24 16:37:21', shortTime: '16:37', code: '20260724-01', position: '包装工作台', operator: '包装A', note: '包装装托完成，物料标识卡已打印。' },
      { name: '入库', status: '已完成', time: '2026-07-24 16:45:03', shortTime: '16:45', code: '20260724-01', position: '成品A区', operator: '仓库管理员', note: '称重校验通过，栈板已完成成品入库。' }
    ]
  }
]

const currentTrace = computed(() => {
  const keyword = searchedCode.value.trim().toLowerCase()
  if (!keyword) return null
  return traceRecords.find(record => record.aliases.some(alias => alias.toLowerCase() === keyword)) || null
})

const handleSearch = () => {
  searchedCode.value = traceCode.value.trim()
  if (!searchedCode.value) {
    ElMessage.warning('请输入或扫描需要查询的编号')
    return
  }
  if (!currentTrace.value) ElMessage.warning('未找到对应的生产追溯记录')
}

const searchByCode = (code: string) => {
  traceCode.value = code
  searchedCode.value = code
}

const handleReset = () => {
  traceCode.value = ''
  searchedCode.value = ''
}

watch(
  () => route.query.code,
  value => {
    if (!value) return
    traceCode.value = String(value)
    searchedCode.value = String(value)
  }
)
</script>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--bg-primary);
}
.full-card {
  height: 100%;
  border: none;
  overflow: auto;
}
.search-panel {
  padding: 18px 20px;
  margin-bottom: 18px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}
.search-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.search-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}
.search-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.search-row .el-input { max-width: 680px; }
.example-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.example-label { font-size: 13px; color: var(--text-secondary); }
.quick-code { cursor: pointer; }
.section-title {
  padding-left: 10px;
  margin: 6px 0 14px;
  border-left: 3px solid var(--el-color-primary);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.process-title, .timeline-title { margin-top: 24px; }
.overview-descriptions { width: 100%; }
.steps-wrapper {
  padding: 22px 12px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}
.timeline-wrapper { padding: 4px 14px 0; }
.stage-card {
  padding: 14px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-secondary);
}
.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.stage-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.stage-note {
  margin-top: 8px;
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 13px;
}
@media (max-width: 900px) {
  .search-row { flex-wrap: wrap; }
  .search-row .el-input { max-width: none; width: 100%; }
}
</style>
