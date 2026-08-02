<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">校验模板列表</span>
            <el-input v-model="searchForm.keyword" placeholder="模板编号/名称" style="width: 220px" clearable @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="toggleAdvancedSearch">{{ isAdvancedSearch ? '收起查询' : '高级查询' }}</el-button>
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
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table
          :data="filteredTemplateData"
          border
          height="100%"
          highlight-current-row
          row-key="templateCode"
          :current-row-key="selectedTemplateCode"
          empty-text="暂无符合条件的数据"
          @current-change="handleTemplateChange"
        >
          <el-table-column prop="seq" label="序号" width="80" align="center" />
          <el-table-column prop="templateCode" label="模板编号" width="120" />
          <el-table-column prop="templateName" label="模板名称" min-width="180" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <span :class="row.status === '确认' ? 'status-confirmed' : 'status-draft'">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="basis" label="校准依据" min-width="150" />
          <el-table-column prop="remark" label="备注" min-width="150" />
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
              <el-button v-if="row.status === '草稿'" link type="primary" size="small">确认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-tabs v-model="detailTab" class="detail-tabs">
        <el-tab-pane name="projects">
          <template #label>校验项目（{{ projectData.length }}）</template>
          <div class="detail-toolbar">
            <span>{{ selectedTemplate.templateName }}</span>
            <div class="sub-actions">
              <el-button size="small">新增</el-button>
              <el-button size="small">批量删除</el-button>
            </div>
          </div>
          <el-table :data="projectData" border size="small" height="190">
            <el-table-column type="selection" width="45" align="center" />
            <el-table-column type="index" label="序号" width="55" align="center" />
            <el-table-column prop="projectCode" label="项目编号" width="100" />
            <el-table-column prop="projectName" label="项目名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="dataType" label="数据类型" width="90" align="center" />
            <el-table-column prop="standardValue" label="标准值" min-width="130" show-overflow-tooltip />
            <el-table-column prop="allow" label="允许误差" width="120" />
            <el-table-column label="操作" width="70" align="center" fixed="right">
              <template #default>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane name="instruments">
          <template #label>标准器具（{{ instrumentData.length }}）</template>
          <div class="detail-toolbar">
            <span>{{ selectedTemplate.templateName }}</span>
            <div class="sub-actions">
              <el-button size="small">新增</el-button>
              <el-button size="small">批量删除</el-button>
            </div>
          </div>
          <el-table :data="instrumentData" border size="small" height="190">
            <el-table-column type="selection" width="45" align="center" />
            <el-table-column type="index" label="序号" width="55" align="center" />
            <el-table-column prop="name" label="名称" min-width="160" />
            <el-table-column prop="spec" label="型号/规格" min-width="180" />
            <el-table-column prop="manageCode" label="管理编号" width="130" />
            <el-table-column prop="to" label="有效期至" width="130" />
            <el-table-column label="操作" width="70" align="center" fixed="right">
              <template #default>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
useTaskLiteralDomI18n()

const isAdvancedSearch = ref(false)
const toggleAdvancedSearch = () => {
  isAdvancedSearch.value = !isAdvancedSearch.value
}

const searchForm = ref({
  keyword: '',
  templateCode: '',
  templateName: '',
  status: ''
})

const filters = ref({ ...searchForm.value })

const handleSearch = () => {
  filters.value = { ...searchForm.value }
}

const handleReset = () => {
  searchForm.value = { keyword: '', templateCode: '', templateName: '', status: '' }
  handleSearch()
}

const templateData = ref([
  { seq: '1', templateCode: 'MB-001', templateName: '游标卡尺校验模板', status: '确认', basis: 'JJG 30-2012', remark: '适用0-150mm卡尺' },
  { seq: '2', templateCode: 'MB-002', templateName: '电子秤校验模板', status: '确认', basis: 'JJG 539-2016', remark: '适用30kg电子秤' },
  { seq: '3', templateCode: 'MB-003', templateName: '温湿度计校验模板', status: '草稿', basis: 'JJF 1076-2020', remark: '待审批' }
])

const templateDetails = {
  'MB-001': {
    projects: [
      { projectCode: 'PJ-001', projectName: '外观检查', dataType: '文字', standardValue: '无破损、锈蚀', measuredValue: '-', allow: '-' },
      { projectCode: 'PJ-002', projectName: '示值误差', dataType: '数值', standardValue: '0.00', measuredValue: '-', allow: '±0.02mm' },
      { projectCode: 'PJ-003', projectName: '重复性', dataType: '数值', standardValue: '0.00', measuredValue: '-', allow: '≤0.01mm' }
    ],
    instruments: [{ name: '量块', spec: '0.5-100mm', manageCode: 'BZ-001', to: '2027-05-31' }]
  },
  'MB-002': {
    projects: [
      { projectCode: 'PJ-001', projectName: '外观检查', dataType: '文字', standardValue: '无破损、锈蚀', measuredValue: '-', allow: '-' },
      { projectCode: 'PJ-004', projectName: '称量误差', dataType: '数值', standardValue: '10.00', measuredValue: '-', allow: '±0.01kg' }
    ],
    instruments: [{ name: '标准砝码', spec: 'M1级 1-10kg', manageCode: 'BZ-003', to: '2027-02-28' }]
  },
  'MB-003': {
    projects: [
      { projectCode: 'PJ-001', projectName: '外观检查', dataType: '文字', standardValue: '无破损、锈蚀', measuredValue: '-', allow: '-' },
      { projectCode: 'PJ-005', projectName: '温度示值误差', dataType: '数值', standardValue: '25.0', measuredValue: '-', allow: '±0.5℃' }
    ],
    instruments: [{ name: '标准温度计', spec: '-20-100℃', manageCode: 'BZ-005', to: '2026-12-31' }]
  }
}

const selectedTemplateCode = ref<keyof typeof templateDetails>('MB-001')
const detailTab = ref('projects')

const selectedTemplate = computed(() => templateData.value.find(item => item.templateCode === selectedTemplateCode.value) || templateData.value[0])
const projectData = computed(() => templateDetails[selectedTemplateCode.value].projects)
const instrumentData = computed(() => templateDetails[selectedTemplateCode.value].instruments)

const filteredTemplateData = computed(() => {
  const query = filters.value.keyword.trim().toLowerCase()
  return templateData.value.filter(item => {
    const matchesKeyword = !query || `${item.templateCode} ${item.templateName}`.toLowerCase().includes(query)
    const matchesCode = !filters.value.templateCode || item.templateCode.toLowerCase().includes(filters.value.templateCode.trim().toLowerCase())
    const matchesName = !filters.value.templateName || item.templateName.toLowerCase().includes(filters.value.templateName.trim().toLowerCase())
    const matchesStatus = !filters.value.status || item.status === filters.value.status
    return matchesKeyword && matchesCode && matchesName && matchesStatus
  })
})

const handleTemplateChange = (row: { templateCode: string } | null) => {
  if (row && row.templateCode in templateDetails) {
    selectedTemplateCode.value = row.templateCode as keyof typeof templateDetails
  }
}
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
  gap: 16px;
  flex-wrap: wrap;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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
  flex-wrap: wrap;
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

.detail-tabs {
  flex: 0 0 255px;
  min-height: 0;
}
.detail-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
  color: #303133;
}
.sub-actions {
  display: flex;
  gap: 8px;
}
.status-confirmed {
  color: #409eff;
}
.status-draft {
  color: #909399;
}
</style>
