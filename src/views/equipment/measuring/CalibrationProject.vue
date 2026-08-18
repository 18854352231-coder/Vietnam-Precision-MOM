<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">校验项目管理</span>
            <el-input v-model="searchForm.keyword" placeholder="项目编号/名称" style="width: 220px" clearable @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="toggleAdvancedSearch">{{ isAdvancedSearch ? '收起查询' : '高级查询' }}</el-button>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="openCreateDialog">新增</el-button>
            <el-button>确认</el-button>
            <el-button @click="openImportDialog">批量导入</el-button>
            <el-button>导出excel</el-button>
          </div>
        </div>
        <div v-show="isAdvancedSearch" class="advanced-search-panel">
          <el-form :inline="true" :model="searchForm" size="small" style="width: 100%;">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="项目编号" style="width: 100%;">
                  <el-input v-model="searchForm.projectCode" clearable style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="项目名称" style="width: 100%;">
                  <el-input v-model="searchForm.projectName" clearable style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="类型" style="width: 100%;">
                  <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="数值" value="数值" />
                    <el-option label="文字" value="文字" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="状态" style="width: 100%;">
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
        <el-table :data="filteredData" border height="100%" empty-text="暂无符合条件的数据">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="projectCode" label="项目编号" width="100" align="center" />
          <el-table-column prop="projectName" label="项目名称" width="300" show-overflow-tooltip />
          <el-table-column prop="dataType" label="数据类型" width="100" align="center" />
          <el-table-column prop="standardValue" label="标准值" width="120" align="center" />
          <el-table-column prop="measuredValue" label="测量值" width="120" align="center" />
          <el-table-column prop="lowerLimit" label="允许误差下限" width="120" align="center" />
          <el-table-column prop="upperLimit" label="允许误差上限" width="120" align="center" />
          <el-table-column prop="result" label="测量结果" width="100" align="center" />
          <el-table-column prop="decimals" label="小数位数" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="90" align="center" />
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next"
          :total="filteredData.length"
          :page-sizes="[10, 20, 50]"
        />
      </div>

      <el-dialog v-model="editDialogVisible" :title="isCreateDialog ? '新增' : '编辑'" width="950px" destroy-on-close>
        <el-form :model="editForm" label-width="110px" class="project-edit-form">
          <el-row :gutter="28">
            <el-col :span="12">
              <el-form-item label="项目编号" required>
                <el-input v-model="editForm.projectCode" :disabled="!isCreateDialog" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目名称" required>
                <el-input v-model="editForm.projectName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="数据类型" required>
                <el-select v-model="editForm.dataType" style="width: 100%">
                  <el-option label="数值" value="数值" />
                  <el-option label="文字" value="文字" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="小数位数">
                <el-input-number v-model="editForm.decimals" :min="0" :max="6" controls-position="right" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="标准值">
                <el-input v-model="editForm.standardValue" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="测量值">
                <el-input v-model="editForm.measuredValue" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="允许误差下限">
                <el-input v-model="editForm.lowerLimit" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="允许误差上限">
                <el-input v-model="editForm.upperLimit" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="测量结果">
                <el-select v-model="editForm.result" style="width: 100%">
                  <el-option label="误差" value="误差" />
                  <el-option label="判定" value="判定" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注">
                <el-input v-model="editForm.remark" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">确定</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="importDialogVisible" title="批量导入" width="520px" destroy-on-close>
        <div class="import-container">
          <div class="step-title">第一步：下载模板</div>
          <div class="step-desc">
            <p>请按照模板字段填写校验项目数据后上传。</p>
            <el-button type="primary" link @click="downloadTemplate">点击下载模板文件</el-button>
          </div>
          <div class="step-title import-step">第二步：上传数据文件</div>
          <el-upload drag action="#" :auto-upload="false" :show-file-list="false" accept=".xlsx,.xls" :on-change="handleBatchImport">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
            <template #tip><div class="el-upload__tip">仅支持 .xls、.xlsx 格式文件</div></template>
          </el-upload>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import * as XLSX from 'xlsx'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { calibrationProjectRecords } from '@/utils/measuringMasterData'
useTaskLiteralDomI18n()

const isAdvancedSearch = ref(false)
const toggleAdvancedSearch = () => {
  isAdvancedSearch.value = !isAdvancedSearch.value
}

const searchForm = ref({
  keyword: '',
  projectCode: '',
  projectName: '',
  type: '',
  status: ''
})

const filters = ref({ ...searchForm.value })

const editDialogVisible = ref(false)
const importDialogVisible = ref(false)
const isCreateDialog = ref(false)
const editingRow = ref<Record<string, any> | null>(null)
const editForm = ref({
  projectCode: '',
  projectName: '',
  dataType: '',
  standardValue: '',
  measuredValue: '',
  lowerLimit: '',
  upperLimit: '',
  result: '',
  decimals: 0,
  remark: ''
})

const openEditDialog = (row: Record<string, any>) => {
  isCreateDialog.value = false
  editingRow.value = row
  editForm.value = {
    projectCode: row.projectCode || '',
    projectName: row.projectName || '',
    dataType: row.dataType || '',
    standardValue: row.standardValue || '',
    measuredValue: row.measuredValue || '',
    lowerLimit: row.lowerLimit || '',
    upperLimit: row.upperLimit || '',
    result: row.result || '',
    decimals: Number(row.decimals) || 0,
    remark: row.remark || ''
  }
  editDialogVisible.value = true
}

const openCreateDialog = () => {
  isCreateDialog.value = true
  editingRow.value = null
  editForm.value = {
    projectCode: '',
    projectName: '',
    dataType: '',
    standardValue: '',
    measuredValue: '',
    lowerLimit: '',
    upperLimit: '',
    result: '',
    decimals: 0,
    remark: ''
  }
  editDialogVisible.value = true
}

const saveEdit = () => {
  if (!editForm.value.projectCode.trim() || !editForm.value.projectName.trim() || !editForm.value.dataType) return
  const values = { ...editForm.value, decimals: String(editForm.value.decimals) }
  if (isCreateDialog.value) {
    tableData.value.push({ ...values, status: '草稿' })
  } else if (editingRow.value) {
    Object.assign(editingRow.value, values)
  }
  editDialogVisible.value = false
}

const openImportDialog = () => {
  importDialogVisible.value = true
}

const downloadTemplate = () => {
  const templateName = '量检具检验项目模版.xlsx'
  const link = document.createElement('a')
  link.href = `${import.meta.env.BASE_URL}templates/${encodeURIComponent(templateName)}`
  link.download = templateName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleBatchImport = async (uploadFile: UploadFile) => {
  const file = uploadFile.raw
  if (!file) return
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' })
    const imported = rows
      .map(row => ({
        projectCode: String(row['项目编号'] || '').trim(),
        projectName: String(row['项目名称'] || '').trim(),
        dataType: String(row['数据类型'] || '').trim(),
        standardValue: String(row['标准值'] || '').trim(),
        measuredValue: String(row['测量值'] || '').trim(),
        lowerLimit: String(row['允许误差下限'] || '').trim(),
        upperLimit: String(row['允许误差上限'] || '').trim(),
        result: String(row['测量结果'] || '').trim(),
        decimals: String(row['小数位数'] || '0').trim(),
        status: '草稿',
        remark: String(row['备注'] || '').trim()
      }))
      .filter(row => row.projectCode && row.projectName && row.dataType)
    if (!imported.length) {
      ElMessage.warning('模板中没有可导入的数据，请检查项目编号、项目名称和数据类型')
      return
    }
    tableData.value.push(...imported)
    importDialogVisible.value = false
    ElMessage.success(`成功导入 ${imported.length} 条校验项目`)
  } catch {
    ElMessage.error('文件解析失败，请使用校验项目模版.xlsx')
  }
}

const handleSearch = () => {
  filters.value = { ...searchForm.value }
}

const handleReset = () => {
  searchForm.value = { keyword: '', projectCode: '', projectName: '', type: '', status: '' }
  handleSearch()
}

const tableData = calibrationProjectRecords

const handleDelete = async (row: Record<string, any>) => {
  try {
    await ElMessageBox.confirm(
      `确定删除校验项目“${row.projectName}”吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  const rowIndex = tableData.value.findIndex(item => item === row)
  if (rowIndex < 0) return
  tableData.value.splice(rowIndex, 1)
  ElMessage.success('删除成功')
}

const filteredData = computed(() => {
  const query = filters.value.keyword.trim().toLowerCase()
  return tableData.value.filter(item => {
    const matchesKeyword = !query || `${item.projectCode} ${item.projectName}`.toLowerCase().includes(query)
    const matchesCode = !filters.value.projectCode || item.projectCode.toLowerCase().includes(filters.value.projectCode.trim().toLowerCase())
    const matchesName = !filters.value.projectName || item.projectName.toLowerCase().includes(filters.value.projectName.trim().toLowerCase())
    const matchesType = !filters.value.type || item.dataType === filters.value.type
    const matchesStatus = !filters.value.status || item.status === filters.value.status
    return matchesKeyword && matchesCode && matchesName && matchesType && matchesStatus
  })
})
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
.import-step {
  margin-top: 24px;
}
.step-title {
  font-weight: 600;
  color: var(--text-primary);
}
.step-desc {
  color: var(--text-secondary);
}
.step-desc p {
  margin: 8px 0;
}
.import-container :deep(.el-upload) {
  width: 100%;
}
.import-container :deep(.el-upload-dragger) {
  width: 100%;
}
.project-edit-form :deep(.el-form-item) {
  margin-bottom: 18px;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}
.table-wrapper {
  flex: 1;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.status-confirmed {
  color: #409eff;
}
.status-draft {
  color: #909399;
}
</style>
