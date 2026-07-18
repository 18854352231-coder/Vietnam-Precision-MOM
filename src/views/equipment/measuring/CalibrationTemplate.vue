<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">校验模板列表</span>
            <el-input placeholder="模板编号/名称" style="width: 220px" clearable />
            <el-button type="primary">查询</el-button>
            <el-button @click="toggleAdvancedSearch">高级搜索/{{ isAdvancedSearch ? '收起' : '展开' }}</el-button>
            <el-button>重置</el-button>
          </div>
          <div class="header-right">
            <el-button type="primary">新增</el-button>
          </div>
        </div>
        <div v-show="isAdvancedSearch" class="advanced-search-panel">
          <el-form :inline="true" :model="searchForm" size="small" style="margin-bottom: 0;">
            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="模板编号" style="width: 100%; margin-bottom: 0;">
                  <el-input v-model="searchForm.templateCode" clearable style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="模板名称" style="width: 100%; margin-bottom: 0;">
                  <el-input v-model="searchForm.templateName" clearable style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="状态" style="width: 100%; margin-bottom: 0;">
                  <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="确认" value="确认" />
                    <el-option label="草稿" value="草稿" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row style="margin-top: 10px;">
              <el-col :span="24" style="display: flex; gap: 10px;">
                <el-button type="primary">查询</el-button>
                <el-button>重置</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="templateData" border height="100%" highlight-current-row>
          <el-table-column prop="seq" label="序号" width="80" align="center" />
          <el-table-column prop="templateCode" label="模板编号" width="120" />
          <el-table-column prop="templateName" label="模板名称" min-width="180" />
          <el-table-column prop="status" label="状态" width="100" align="center" />
          <el-table-column prop="basis" label="校准依据" min-width="150" />
          <el-table-column prop="remark" label="备注" min-width="150" />
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default>
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="primary" size="small">删除</el-button>
              <el-button link type="primary" size="small">确认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="split-bottom">
        <div class="split-half">
          <div class="sub-title">
            <span>校验项目</span>
            <div class="sub-actions">
              <el-button size="small">新增</el-button>
              <el-button size="small">批量删除</el-button>
            </div>
          </div>
          <el-table :data="projectData" border size="small" height="200">
            <el-table-column type="selection" width="40" align="center" />
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="projectCode" label="项目编号" width="80" />
            <el-table-column prop="projectName" label="项目名称" min-width="140" show-overflow-tooltip />
            <el-table-column prop="dataType" label="数据类型" width="80" />
            <el-table-column prop="standardValue" label="标准值" width="80" />
            <el-table-column prop="measuredValue" label="测量值" width="80" />
            <el-table-column prop="allow" label="允..." width="60" />
            <el-table-column label="操作" width="60" align="center" fixed="right">
              <template #default>
                <el-button link type="primary" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="split-half">
          <div class="sub-title">
            <span>标准器具</span>
            <div style="flex: 1; text-align: right; margin-right: 20px;">
              <span style="font-size: 13px; color: #606266;">&lt; 1 &gt; &nbsp;&nbsp; 20条/页 &nbsp;&nbsp; 共 19 条</span>
            </div>
            <div class="sub-actions">
              <el-button size="small">新增</el-button>
              <el-button size="small">批量删除</el-button>
            </div>
          </div>
          <el-table :data="instrumentData" border size="small" height="200">
            <el-table-column type="selection" width="40" align="center" />
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="name" label="名称" min-width="100" />
            <el-table-column prop="spec" label="型号/规格" min-width="100" />
            <el-table-column prop="manageCode" label="管理编号" width="100" />
            <el-table-column prop="to" label="至" width="60" />
            <el-table-column label="操作" width="60" align="center" fixed="right">
              <template #default>
                <el-button link type="primary" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
useTaskLiteralDomI18n()

const isAdvancedSearch = ref(false)
const toggleAdvancedSearch = () => {
  isAdvancedSearch.value = !isAdvancedSearch.value
}

const searchForm = ref({
  templateCode: '',
  templateName: '',
  status: ''
})

const templateData = ref([
  { seq: '1', templateCode: '0502', templateName: '垂直度检具', status: '确认', basis: 'XC-QSQ-052', remark: '缺直角尺' },
  { seq: '2', templateCode: '0501', templateName: '平面度/直线度检具', status: '确认', basis: 'XC-QSQ-052', remark: '-' },
  { seq: '3', templateCode: '0602', templateName: '电子秤6/0.002kg', status: '确认', basis: 'XC-QSQ-063', remark: '-' },
  { seq: '4', templateCode: '0601', templateName: '电子秤30/0.01kg', status: '确认', basis: 'XC-QSQ-063', remark: '-' },
  { seq: '5', templateCode: '0404', templateName: '数显百分表0-50mm', status: '确认', basis: 'XC-QSQ-061', remark: '-' },
  { seq: '6', templateCode: '0403', templateName: '数显百分表0-10mm', status: '确认', basis: 'XC-QSQ-061', remark: '-' }
])

const projectData = ref([
  { projectCode: '1001', projectName: '外观检查', dataType: '文字', standardValue: '无影响质量的磕碰、划伤', measuredValue: '-', allow: '-' },
  { projectCode: '0502', projectName: 'A/B面垂直度/mm (A-底面; B-前竖面; C-侧面)', dataType: '数值', standardValue: '0.00', measuredValue: '-', allow: '0.0...' },
  { projectCode: '0503', projectName: 'A/C面垂直度/mm (A-底面; B-前竖面; C-侧面)', dataType: '数值', standardValue: '0.00', measuredValue: '-', allow: '0.0...' },
  { projectCode: '0504', projectName: 'B/C面垂直度/mm (A-底面; B-前竖面; C-侧面)', dataType: '数值', standardValue: '0.00', measuredValue: '-', allow: '0.0...' }
])

const instrumentData = ref([
  { name: '塞尺', spec: '150A', manageCode: '30123', to: '20...' }
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
  font-weight: 600;
  font-size: 16px;
  margin-right: 12px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.advanced-search-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
  gap: 16px;
}
.table-wrapper {
  flex: 1;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
:deep(.el-table__row--current-row > td) {
  background-color: #e6f7ff !important;
}

.split-bottom {
  display: flex;
  gap: 16px;
  height: 250px;
}
.split-half {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.sub-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  color: #303133;
}
.sub-actions {
  display: flex;
  gap: 8px;
}
</style>