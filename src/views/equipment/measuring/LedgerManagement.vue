<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">台账管理</span>
            <el-input placeholder="设备名称/管理编号" style="width: 220px" clearable />
            <el-button type="primary">查询</el-button>
            <el-button @click="toggleAdvancedSearch">高级搜索/{{ isAdvancedSearch ? '收起' : '展开' }}</el-button>
            <el-button>重置</el-button>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="openAddDialog">新增</el-button>
            <el-button type="success" @click="openImportDialog">批量导入</el-button>
            <el-button type="warning" @click="handleExport">导出excel</el-button>
            <el-button>生成校验任务</el-button>
            <el-button>批量修改</el-button>
            <el-button type="danger">报废/封存</el-button>
          </div>
        </div>
        <div v-show="isAdvancedSearch" class="advanced-search-panel">
          <el-form :inline="true" :model="searchForm" size="small" style="width: 100%;">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="用途" style="width: 100%;">
                  <el-select v-model="searchForm.usage" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="量具" value="量具" />
                    <el-option label="检具" value="检具" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="管理编号" style="width: 100%;">
                  <el-input v-model="searchForm.manageCode" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="出厂编号" style="width: 100%;">
                  <el-input v-model="searchForm.factoryCode" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="名称" style="width: 100%;">
                  <el-input v-model="searchForm.name" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item label="校验日期" style="width: 100%;">
                  <el-date-picker v-model="searchForm.calibDate" type="daterange" range-separator="-" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="计量周期" style="width: 100%;">
                  <el-select v-model="searchForm.cycle" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="3个月" value="3" />
                    <el-option label="6个月" value="6" />
                    <el-option label="12个月" value="12" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10" style="margin-top: 10px;">
              <el-col :span="4">
                <el-form-item label="计量方式" style="width: 100%;">
                  <el-select v-model="searchForm.method" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="内校" value="内校" />
                    <el-option label="外校" value="外校" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="状态" style="width: 100%;">
                  <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100%;">
                    <el-option label="校验中" value="校验中" />
                    <el-option label="封存" value="封存" />
                    <el-option label="正常" value="正常" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="使用部门" style="width: 100%;">
                  <el-input v-model="searchForm.department" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="使用车间" style="width: 100%;">
                  <el-input v-model="searchForm.workshop" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item label="预警天数" style="width: 100%;">
                  <el-input v-model="searchForm.warnDays" placeholder="-" clearable />
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
        <el-table :data="tableData" border height="100%">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="category" label="量具类型" width="90" />
          <el-table-column prop="usage" label="用途" width="80" />
          <el-table-column prop="manageClass" label="管理类别" width="90" align="center" />
          <el-table-column prop="template" label="校验模板" width="100" />
          <el-table-column prop="manageCode" label="管理编号" width="110" />
          <el-table-column prop="factoryCode" label="出厂编号" width="100" />
          <el-table-column prop="inDate" label="入厂日期" width="110" />
          <el-table-column prop="name" label="名称" width="120" show-overflow-tooltip />
          <el-table-column prop="spec" label="规格型号" width="100" />
          <el-table-column prop="range" label="量程" width="90" />
          <el-table-column prop="divValue" label="分度值" width="90" />
          <el-table-column prop="material" label="材质" width="80" align="center" />
          <el-table-column prop="manufacturer" label="生产厂家" width="120" show-overflow-tooltip />
          <el-table-column prop="cycle" label="计量周期" width="90" align="center" />
          <el-table-column prop="calibDate" label="校验日期" width="110" />
          <el-table-column prop="validDate" label="有效日期" width="110" />
          <el-table-column prop="calibOrg" label="校验单位" width="100" />
          <el-table-column prop="certNo" label="证书编号" width="120" show-overflow-tooltip />
          <el-table-column prop="method" label="计量方式" width="90" />
          <el-table-column prop="status" label="状态" width="80" align="center" />
          <el-table-column prop="department" label="使用部门" width="120" />
          <el-table-column prop="workshop" label="使用车间" width="100" />
          <el-table-column prop="team" label="班组" width="80" />
          <el-table-column prop="location" label="具体位置" width="100" />
          <el-table-column prop="owner" label="责任人" width="100" />
          <el-table-column prop="warnDays" label="预警天数" width="90" align="center" />
          <el-table-column prop="remark" label="备注" width="120" show-overflow-tooltip />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default>
              <el-button link type="primary" size="small">详情</el-button>
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next"
          :total="20104"
          :page-sizes="[50, 100]"
        />
      </div>
    </el-card>

    <el-dialog v-model="addDialogVisible" title="新增" width="800px" @close="resetAddForm">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="量具类型">
              <el-input v-model="addForm.category" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用途">
              <el-select v-model="addForm.usage" placeholder="请选择" style="width: 100%" clearable>
                <el-option label="量具" value="量具" />
                <el-option label="检具" value="检具" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="管理类别">
              <el-select v-model="addForm.manageClass" placeholder="请选择" style="width: 100%" clearable>
                <el-option label="A" value="A" />
                <el-option label="B" value="B" />
                <el-option label="C" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校验模板">
              <el-select v-model="addForm.template" placeholder="请选择" style="width: 100%" clearable>
                <el-option label="卷尺" value="卷尺" />
                <el-option label="刀口直尺" value="刀口直尺" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="管理编号" prop="manageCode">
              <el-input v-model="addForm.manageCode" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出厂编号">
              <el-input v-model="addForm.factoryCode" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入厂日期">
              <el-date-picker v-model="addForm.inDate" type="date" placeholder="请选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="addForm.name" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="addForm.spec" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="量程">
              <el-input v-model="addForm.range" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分度值">
              <el-input v-model="addForm.divValue" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材质">
              <el-input v-model="addForm.material" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="addForm.manufacturer" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量周期" prop="cycle">
              <el-select v-model="addForm.cycle" placeholder="请选择" style="width: 100%" clearable>
                <el-option label="3个月" value="3" />
                <el-option label="6个月" value="6" />
                <el-option label="12个月" value="12" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="校验日期" prop="calibDate">
              <el-date-picker v-model="addForm.calibDate" type="date" placeholder="请选择" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校验单位">
              <el-input v-model="addForm.calibOrg" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计量方式" prop="method">
              <el-select v-model="addForm.method" placeholder="请选择" style="width: 100%" clearable>
                <el-option label="内校" value="内校" />
                <el-option label="外校" value="外校" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用部门">
              <el-input v-model="addForm.department" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="使用车间">
              <el-input v-model="addForm.workshop" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科室/班组/货架">
              <el-input v-model="addForm.team" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="具体位置">
              <el-input v-model="addForm.location" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人">
              <el-input v-model="addForm.owner" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="addForm.remark" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上传附件">
              <el-upload action="#" :auto-upload="false" :show-file-list="false">
                <el-button type="primary" plain icon="Upload">上传文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearAddForm">清空</el-button>
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="批量导入" width="500px">
      <div class="import-container">
        <div class="step-title">第一步：下载模板</div>
        <div class="step-desc">
          <p>请下载标准的导入模板，按照模板格式要求填写数据。</p>
          <el-button type="primary" link icon="Download" @click="downloadTemplate">点击下载模板文件</el-button>
        </div>

        <div class="step-title" style="margin-top: 30px;">第二步：上传数据文件</div>
        <div class="step-desc">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleBatchImport"
            :show-file-list="false"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持 .xls, .xlsx 格式文件，单次最多导入 500 条
              </div>
            </template>
          </el-upload>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
useTaskLiteralDomI18n()

const isAdvancedSearch = ref(false)

const toggleAdvancedSearch = () => {
  isAdvancedSearch.value = !isAdvancedSearch.value
}

const addDialogVisible = ref(false)
const addFormRef = ref()
const addForm = ref({
  category: '', usage: '', manageClass: '', template: '', manageCode: '', factoryCode: '',
  inDate: '', name: '', spec: '', range: '', divValue: '', material: '', manufacturer: '',
  cycle: '', calibDate: '', calibOrg: '', method: '', department: '', workshop: '', team: '',
  location: '', owner: '', remark: ''
})

const addRules = {
  manageCode: [{ required: true, message: '请输入管理编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  cycle: [{ required: true, message: '请选择计量周期', trigger: 'change' }],
  calibDate: [{ required: true, message: '请选择校验日期', trigger: 'change' }],
  method: [{ required: true, message: '请选择计量方式', trigger: 'change' }]
}

const openAddDialog = () => {
  addDialogVisible.value = true
}

const clearAddForm = () => {
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
  Object.keys(addForm.value).forEach(key => {
    (addForm.value as any)[key] = ''
  })
}

const resetAddForm = () => {
  clearAddForm()
}

const submitAddForm = async () => {
  if (!addFormRef.value) return
  await addFormRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('新增成功')
      addDialogVisible.value = false
    }
  })
}

const importDialogVisible = ref(false)

const openImportDialog = () => {
  importDialogVisible.value = true
}

const downloadTemplate = () => {
  ElMessage.success('模板下载已开始')
}

const handleBatchImport = (file: any) => {
  ElMessage.success(`成功导入文件: ${file.name}`)
  importDialogVisible.value = false
}

const handleExport = () => {
  ElMessage.success('导出任务已提交，请稍后在下载中心查看')
}

const searchForm = ref({
  usage: '', manageCode: '', factoryCode: '', name: '', calibDate: [], cycle: '',
  method: '', status: '', department: '', workshop: '', warnDays: ''
})

const tableData = ref([
  {
    category: '长度', usage: '量具', manageClass: 'C', template: '卷尺', manageCode: '12897',
    factoryCode: '/', inDate: '2026-07-15', name: '钢卷尺', spec: '/', range: '0-10m', divValue: '1mm',
    material: '/', manufacturer: 'Deli', cycle: '12', calibDate: '2026-07-15', validDate: '2027-07-14',
    calibOrg: '创新', certNo: '-', method: '内校', status: '校验中', department: '生产部...',
    workshop: '挤压', team: 'B15', location: '-', owner: '高明...', warnDays: '364', remark: '-'
  },
  {
    category: '检具', usage: '检具', manageClass: 'B', template: '-', manageCode: 'NK-42...',
    factoryCode: '/', inDate: '2026-07-14', name: '二维码检具', spec: 'NK-42', range: 'Q', divValue: '/',
    material: '钢', manufacturer: '创新', cycle: '6', calibDate: '2026-07-14', validDate: '-',
    calibOrg: '创新', certNo: '线下记录.docx', method: '内校', status: '封存', department: '品保部',
    workshop: '计量室', team: '4-2', location: '9-2', owner: '王若瑾', warnDays: '-', remark: '-'
  },
  {
    category: '量具', usage: '量具', manageClass: 'C', template: '-', manageCode: '30897',
    factoryCode: '/', inDate: '2026-07-13', name: '针规', spec: '3.18mm', range: '/', divValue: '/',
    material: '钢', manufacturer: '上量精工', cycle: '12', calibDate: '2026-07-13', validDate: '-',
    calibOrg: '创新', certNo: '30897.pdf', method: '内校', status: '封存', department: '品保部',
    workshop: '计量室', team: '4号柜', location: '10-1', owner: '王若瑾', warnDays: '-', remark: '-'
  },
  {
    category: '直...', usage: '量具', manageClass: 'C', template: '刀...', manageCode: '21825',
    factoryCode: '260047', inDate: '2026-07-13', name: '刀口直尺', spec: '100mm', range: '/', divValue: '/',
    material: '/', manufacturer: '万量', cycle: '12', calibDate: '2026-07-13', validDate: '2027-07-12',
    calibOrg: '创新', certNo: '-', method: '内校', status: '校验中', department: '生产部二...',
    workshop: '挤压', team: 'A39', location: '/', owner: '李龙/...', warnDays: '362', remark: '-'
  }
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
.import-container {
  padding: 0 20px 20px;
}
.step-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 10px;
  color: #303133;
}
.step-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}
.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 7px;
}
</style>