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
            <el-button type="primary" @click="openAddDialog">新增</el-button>
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
              <el-button size="small" @click="openProjectSelector">新增</el-button>
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
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="removeProject(row.projectCode)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane name="instruments">
          <template #label>标准器具（{{ instrumentData.length }}）</template>
          <div class="detail-toolbar">
            <span>{{ selectedTemplate.templateName }}</span>
            <div class="sub-actions">
              <el-button size="small" @click="openInstrumentSelector">新增</el-button>
              <el-button size="small">批量删除</el-button>
            </div>
          </div>
          <el-table :data="instrumentData" border size="small" height="190">
            <el-table-column type="selection" width="45" align="center" />
            <el-table-column type="index" label="序号" width="55" align="center" />
            <el-table-column prop="name" label="名称" min-width="160" />
            <el-table-column prop="spec" label="型号/规格" min-width="180" />
            <el-table-column prop="manageCode" label="管理编号" width="130" />
            <el-table-column prop="validDate" label="有效期至" width="130" />
            <el-table-column label="操作" width="70" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="removeInstrument(row.manageCode)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="addDialogVisible"
      title="新增"
      width="880px"
      destroy-on-close
      @closed="resetAddForm"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-row :gutter="48">
          <el-col :span="12">
            <el-form-item label="模板编号" prop="templateCode">
              <el-input v-model="addForm.templateCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板名称">
              <el-input v-model="addForm.templateName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="12">
            <el-form-item label="校准依据">
              <el-input v-model="addForm.basis" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="addForm.remark" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="projectDialogVisible" title="选择校验项目" width="900px" destroy-on-close>
      <el-alert title="仅显示校验项目管理中状态为“确认”的数据" type="info" :closable="false" show-icon />
      <el-table
        class="selector-table"
        :data="availableProjectOptions"
        border
        row-key="projectCode"
        max-height="420"
        empty-text="暂无可选的已确认校验项目"
        @selection-change="handleProjectSelection"
      >
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column prop="projectCode" label="项目编号" width="110" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="dataType" label="数据类型" width="100" />
        <el-table-column prop="standardValue" label="标准值" width="110" />
        <el-table-column label="允许误差" width="170">
          <template #default="{ row }">{{ formatAllow(row) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center" />
      </el-table>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addSelectedProjects">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="instrumentDialogVisible" title="选择标准器具" width="900px" destroy-on-close>
      <el-alert title="仅显示台账管理中用途为“量具”的数据" type="info" :closable="false" show-icon />
      <el-table
        class="selector-table"
        :data="availableInstrumentOptions"
        border
        row-key="manageCode"
        max-height="420"
        empty-text="暂无可选的量具数据"
        @selection-change="handleInstrumentSelection"
      >
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column prop="manageCode" label="管理编号" width="120" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="spec" label="型号/规格" min-width="160" />
        <el-table-column prop="usage" label="用途" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center" />
        <el-table-column prop="validDate" label="有效期至" width="130" />
      </el-table>
      <template #footer>
        <el-button @click="instrumentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addSelectedInstruments">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import {
  calibrationProjectRecords,
  measuringLedgerRecords
} from '@/utils/measuringMasterData'
import type {
  CalibrationProjectRecord,
  MeasuringLedgerRecord
} from '@/utils/measuringMasterData'
useTaskLiteralDomI18n()

interface TemplateRow {
  seq: string
  templateCode: string
  templateName: string
  status: string
  basis: string
  remark: string
}

interface TemplateRelation {
  projectCodes: string[]
  instrumentCodes: string[]
}

interface AddTemplateForm {
  templateCode: string
  templateName: string
  basis: string
  remark: string
}

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

const templateData = ref<TemplateRow[]>([
  { seq: '1', templateCode: 'MB-001', templateName: '游标卡尺校验模板', status: '确认', basis: 'JJG 30-2012', remark: '适用0-150mm卡尺' },
  { seq: '2', templateCode: 'MB-002', templateName: '电子秤校验模板', status: '确认', basis: 'JJG 539-2016', remark: '适用30kg电子秤' },
  { seq: '3', templateCode: 'MB-003', templateName: '温湿度计校验模板', status: '草稿', basis: 'JJF 1076-2020', remark: '待审批' }
])

const templateDetails = ref<Record<string, TemplateRelation>>({
  'MB-001': { projectCodes: ['PJ-002', 'PJ-003'], instrumentCodes: ['LJ-001'] },
  'MB-002': { projectCodes: ['PJ-004'], instrumentCodes: ['ZL-003'] },
  'MB-003': { projectCodes: ['PJ-005'], instrumentCodes: ['WD-002'] }
})

const selectedTemplateCode = ref('MB-001')
const detailTab = ref('projects')
const emptyTemplate: TemplateRow = {
  seq: '',
  templateCode: '',
  templateName: '',
  status: '',
  basis: '',
  remark: ''
}

const selectedTemplate = computed(() => (
  templateData.value.find(item => item.templateCode === selectedTemplateCode.value) || emptyTemplate
))

const currentRelation = computed(() => (
  templateDetails.value[selectedTemplateCode.value] || { projectCodes: [], instrumentCodes: [] }
))

const formatAllow = (row: Pick<CalibrationProjectRecord, 'lowerLimit' | 'upperLimit'>) => {
  const lower = String(row.lowerLimit || '').trim()
  const upper = String(row.upperLimit || '').trim()
  if (lower && lower !== '-' && upper && upper !== '-') return `${lower} ～ ${upper}`
  if (upper && upper !== '-') return `≤ ${upper}`
  if (lower && lower !== '-') return `≥ ${lower}`
  return '-'
}

const projectData = computed(() => {
  const projectCodes = currentRelation.value.projectCodes
  return calibrationProjectRecords.value
    .filter(item => item.status === '确认' && projectCodes.includes(item.projectCode))
    .map(item => ({ ...item, allow: formatAllow(item) }))
})

const instrumentData = computed(() => {
  const instrumentCodes = currentRelation.value.instrumentCodes
  return measuringLedgerRecords.value.filter(item => (
    item.usage === '量具' && instrumentCodes.includes(item.manageCode)
  ))
})

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
  if (!row) return
  selectedTemplateCode.value = row.templateCode
  if (!templateDetails.value[row.templateCode]) {
    templateDetails.value[row.templateCode] = { projectCodes: [], instrumentCodes: [] }
  }
}

const addDialogVisible = ref(false)
const addFormRef = ref<FormInstance>()
const createEmptyAddForm = (): AddTemplateForm => ({
  templateCode: '',
  templateName: '',
  basis: '',
  remark: ''
})
const addForm = ref<AddTemplateForm>(createEmptyAddForm())
const addRules: FormRules<AddTemplateForm> = {
  templateCode: [{ required: true, message: '请输入模板编号', trigger: 'blur' }]
}

const resetAddForm = () => {
  addForm.value = createEmptyAddForm()
  addFormRef.value?.clearValidate()
}

const openAddDialog = () => {
  resetAddForm()
  addDialogVisible.value = true
}

const saveTemplate = async () => {
  const valid = await addFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const templateCode = addForm.value.templateCode.trim()
  if (templateData.value.some(item => item.templateCode === templateCode)) {
    ElMessage.warning('模板编号已存在')
    return
  }

  templateData.value.push({
    seq: String(templateData.value.length + 1),
    templateCode,
    templateName: addForm.value.templateName.trim(),
    status: '草稿',
    basis: addForm.value.basis.trim(),
    remark: addForm.value.remark.trim()
  })
  templateDetails.value[templateCode] = { projectCodes: [], instrumentCodes: [] }
  selectedTemplateCode.value = templateCode
  addDialogVisible.value = false
  ElMessage.success('新增成功')
}

const projectDialogVisible = ref(false)
const selectedProjects = ref<CalibrationProjectRecord[]>([])
const availableProjectOptions = computed(() => calibrationProjectRecords.value.filter(item => (
  item.status === '确认' && !currentRelation.value.projectCodes.includes(item.projectCode)
)))

const openProjectSelector = () => {
  selectedProjects.value = []
  projectDialogVisible.value = true
}

const handleProjectSelection = (rows: CalibrationProjectRecord[]) => {
  selectedProjects.value = rows
}

const addSelectedProjects = () => {
  if (!selectedProjects.value.length) {
    ElMessage.warning('请选择校验项目')
    return
  }
  const relation = templateDetails.value[selectedTemplateCode.value]
  if (!relation) return
  relation.projectCodes.push(...selectedProjects.value.map(item => item.projectCode))
  projectDialogVisible.value = false
  ElMessage.success(`已添加 ${selectedProjects.value.length} 个校验项目`)
}

const removeProject = (projectCode: string) => {
  const relation = templateDetails.value[selectedTemplateCode.value]
  if (!relation) return
  relation.projectCodes = relation.projectCodes.filter(code => code !== projectCode)
}

const instrumentDialogVisible = ref(false)
const selectedInstruments = ref<MeasuringLedgerRecord[]>([])
const availableInstrumentOptions = computed(() => measuringLedgerRecords.value.filter(item => (
  item.usage === '量具' && !currentRelation.value.instrumentCodes.includes(item.manageCode)
)))

const openInstrumentSelector = () => {
  selectedInstruments.value = []
  instrumentDialogVisible.value = true
}

const handleInstrumentSelection = (rows: MeasuringLedgerRecord[]) => {
  selectedInstruments.value = rows
}

const addSelectedInstruments = () => {
  if (!selectedInstruments.value.length) {
    ElMessage.warning('请选择标准器具')
    return
  }
  const relation = templateDetails.value[selectedTemplateCode.value]
  if (!relation) return
  relation.instrumentCodes.push(...selectedInstruments.value.map(item => item.manageCode))
  instrumentDialogVisible.value = false
  ElMessage.success(`已添加 ${selectedInstruments.value.length} 个标准器具`)
}

const removeInstrument = (manageCode: string) => {
  const relation = templateDetails.value[selectedTemplateCode.value]
  if (!relation) return
  relation.instrumentCodes = relation.instrumentCodes.filter(code => code !== manageCode)
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
.selector-table {
  margin-top: 16px;
}
.status-confirmed {
  color: #409eff;
}
.status-draft {
  color: #909399;
}
</style>
