<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">校验任务管理</span>
            <el-form :inline="true" :model="searchForm" size="small" class="task-search-form" @submit.prevent>
              <el-form-item label="校验单编号">
                <el-input v-model="searchForm.calibCode" clearable @keyup.enter="handleSearch" />
              </el-form-item>
              <el-form-item label="管理编号">
                <el-input v-model="searchForm.manageCode" clearable @keyup.enter="handleSearch" />
              </el-form-item>
              <el-form-item label="量检具名称">
                <el-input v-model="searchForm.name" clearable @keyup.enter="handleSearch" />
              </el-form-item>
              <el-form-item label="校验模板">
                <el-select v-model="searchForm.template" placeholder="请选择" clearable>
                  <el-option label="游标卡尺" value="游标卡尺" />
                  <el-option label="电子秤30kg" value="电子秤30kg" />
                  <el-option label="数字温湿度计" value="数字温湿度计" />
                </el-select>
              </el-form-item>
              <el-form-item label="检验单状态">
                <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                  <el-option label="校验中" value="校验中" />
                  <el-option label="已完成" value="已完成" />
                </el-select>
              </el-form-item>
              <el-form-item label="计量方式">
                <el-radio-group v-model="searchForm.calibType">
                  <el-radio label="内校">内部校验</el-radio>
                  <el-radio label="外校">委外校验</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item class="task-search-actions">
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="header-right">
            <el-button @click="openBatchVerificationDialog">批量校验</el-button>
            <el-button>导出Excel</el-button>
          </div>
        </div>
      </template>

      <div class="table-wrapper">
          <el-table :data="filteredData" border height="100%" empty-text="暂无符合条件的数据" @selection-change="handleTaskSelectionChange">
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="category" label="量具类型" width="90" />
          <el-table-column prop="usage" label="用途" width="80" />
          <el-table-column prop="manageClass" label="管理类别" width="90" align="center" />
          <el-table-column prop="template" label="校验模板" width="120" show-overflow-tooltip />
          <el-table-column prop="manageCode" label="管理编号" width="100" />
          <el-table-column prop="factoryCode" label="出厂编号" width="110" />
          <el-table-column prop="inDate" label="入厂日期" width="110" />
          <el-table-column prop="name" label="名称" width="130" show-overflow-tooltip />
          <el-table-column prop="spec" label="规格型号" width="110" show-overflow-tooltip />
          <el-table-column prop="range" label="量程" width="100" />
          <el-table-column prop="divValue" label="分度值" width="90" />
          <el-table-column prop="material" label="材质" width="80" align="center" />
          <el-table-column prop="manufacturer" label="生产厂家" width="120" show-overflow-tooltip />
          <el-table-column prop="cycle" label="计量周期" width="90" align="center" />
          <el-table-column prop="calibDate" label="校验日期" width="110" />
          <el-table-column prop="validDate" label="有效日期" width="110" />
          <el-table-column prop="calibOrg" label="校验单位" width="110" show-overflow-tooltip />
          <el-table-column prop="certNo" label="证书编号" width="130" show-overflow-tooltip />
          <el-table-column prop="method" label="计量方式" width="90" align="center" />
          <el-table-column prop="status" label="状态" width="90" align="center" />
          <el-table-column prop="department" label="使用部门" width="110" show-overflow-tooltip />
          <el-table-column prop="workshop" label="使用车间" width="100" show-overflow-tooltip />
          <el-table-column prop="team" label="班组" width="90" />
          <el-table-column prop="location" label="具体位置" width="110" show-overflow-tooltip />
          <el-table-column prop="owner" label="责任人" width="100" show-overflow-tooltip />
          <el-table-column prop="warnDays" label="预警天" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.warnDays !== '-'" :type="Number(row.warnDays) <= 1 ? 'danger' : 'warning'" effect="plain">
                {{ row.warnDays }}天
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="130" show-overflow-tooltip />
          <el-table-column prop="calibCode" label="校验单编号" width="125" />
          <el-table-column prop="temp" label="温度" width="80" align="center" />
          <el-table-column prop="humidity" label="湿度" width="80" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="150" />
          <el-table-column prop="result" label="校验结论" width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.result !== '-'" :type="row.result === '合格' ? 'success' : 'danger'">{{ row.result }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="taskStatus" label="状态" width="90" align="center" />
          <el-table-column prop="auditor" label="审核人" width="90" />
          <el-table-column prop="auditTime" label="审核时间" width="110" />
          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default>
              <el-button link type="danger" size="small">删除</el-button>
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
    </el-card>

    <el-dialog v-model="batchVerificationDialogVisible" title="批量校验" width="880px">
      <el-form ref="batchVerificationFormRef" :model="batchVerificationForm" label-width="120px" class="batch-verification-form">
        <el-form-item label="是否符合要求" required>
          <el-radio-group v-model="batchVerificationForm.isQualified">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="batchVerificationForm.isQualified === '否'" label="设备处理" required>
          <el-radio-group v-model="batchVerificationForm.deviceStatus">
            <el-radio label="停用">停用</el-radio>
            <el-radio label="限用">限用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="校验日期" required>
              <el-date-picker v-model="batchVerificationForm.calibDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校验单位" required>
              <el-input v-model="batchVerificationForm.calibOrg" placeholder="请输入校验单位" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="校验证书上传">
          <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleBatchCertificateChange">
            <el-button type="primary" plain icon="Upload">上传文件</el-button>
          </el-upload>
          <span v-if="batchVerificationForm.certificateName" class="upload-file-name">{{ batchVerificationForm.certificateName }}</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="batchVerificationForm.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchVerificationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchVerification">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { loadGeneratedCalibrationTasks } from '@/utils/measuringCalibrationTasks'
useTaskLiteralDomI18n()

const searchForm = ref({
  keyword: '',
  calibCode: '',
  manageCode: '',
  name: '',
  template: '',
  status: '',
  calibType: ''
})

const filters = ref({ ...searchForm.value })

const handleSearch = () => {
  filters.value = { ...searchForm.value }
}

const handleReset = () => {
  searchForm.value = { keyword: '', calibCode: '', manageCode: '', name: '', template: '', status: '', calibType: '' }
  handleSearch()
}

const defaultTableData = [
  { category: '长度', usage: '量具', manageClass: 'B', certNo: '-', manageCode: 'LJ-001', factoryCode: 'YC240315', inDate: '2024-03-20', name: '数显游标卡尺', spec: '0-150mm', range: '0-150mm', divValue: '0.01mm', material: '不锈钢', manufacturer: '桂林广陆', cycle: '12', calibDate: '2026-03-18', validDate: '2027-03-17', calibOrg: '品保部', template: '游标卡尺', method: '内校', status: '校验中', department: '生产部', workshop: '机加工', team: 'A班', location: '检验台1', owner: '阮文安', warnDays: '1', remark: '今日完成', calibCode: 'JY260802001', temp: '23.5℃', humidity: '61%', createTime: '2026-08-02 08:30', result: '-', taskStatus: '校验中', auditor: '-' },
  { category: '温度', usage: '量具', manageClass: 'A', certNo: '-', manageCode: 'WD-002', factoryCode: 'TH230921', inDate: '2023-09-25', name: '数字温湿度计', spec: 'TH-101B', range: '-20-60℃', divValue: '0.1℃', material: '塑料', manufacturer: '德图', cycle: '12', calibDate: '2025-08-01', validDate: '2026-07-31', calibOrg: '越南计量院', template: '数字温湿度计', method: '外校', status: '校验中', department: '品保部', workshop: '实验室', team: '检测组', location: '环境监测点', owner: '黎明俊', warnDays: '0', remark: '已送外校', calibCode: 'JY260801002', temp: '-', humidity: '-', createTime: '2026-08-01 15:20', result: '-', taskStatus: '校验中', auditor: '-' },
  { category: '专用检具', usage: '检具', manageClass: 'C', certNo: 'NJ26073008', manageCode: 'JY-006', factoryCode: 'XC-JY-006', inDate: '2024-06-08', name: '垂直度检具', spec: '200×150mm', range: '-', divValue: '-', material: '工具钢', manufacturer: '创新精密', cycle: '12', calibDate: '2025-06-15', validDate: '2026-06-14', calibOrg: '品保部', template: '垂直度检具', method: '内校', status: '已完成', department: '品保部', workshop: '计量室', team: '检测组', location: '检具柜2', owner: '王若瑾', warnDays: '-', remark: '-', calibCode: 'JY260730008', temp: '23.0℃', humidity: '58%', createTime: '2026-07-30 09:10', result: '合格', taskStatus: '已完成', auditor: '李主管' },
  { category: '质量', usage: '量具', manageClass: 'A', certNo: 'VMI-260728-21', manageCode: 'ZL-003', factoryCode: 'ES250108', inDate: '2025-01-12', name: '电子秤', spec: '30kg/10g', range: '0-30kg', divValue: '10g', material: '不锈钢', manufacturer: '英展', cycle: '6', calibDate: '2026-02-10', validDate: '2026-08-09', calibOrg: '越南计量院', template: '电子秤30kg', method: '外校', status: '已完成', department: '仓储部', workshop: '成品仓', team: '白班', location: '收货区', owner: '陈氏兰', warnDays: '-', remark: '-', calibCode: 'JY260725003', temp: '-', humidity: '-', createTime: '2026-07-25 10:05', result: '合格', taskStatus: '已完成', auditor: '李主管' }
]

const taskFieldDefaults: Record<string, string> = {
  category: '-', usage: '-', manageClass: '-', factoryCode: '-', inDate: '-', spec: '-', range: '-',
  divValue: '-', material: '-', manufacturer: '-', cycle: '-', calibDate: '-', validDate: '-', calibOrg: '-',
  certNo: '-', team: '-', location: '-', owner: '-', warnDays: '-', remark: '-', temp: '-', humidity: '-',
  result: '-', auditor: '-', auditTime: '-'
}

const generatedTasks = ref(loadGeneratedCalibrationTasks())
const tableData = computed(() => [...generatedTasks.value, ...defaultTableData].map(item => ({ ...taskFieldDefaults, ...item })))

const selectedTaskRows = ref<Record<string, any>[]>([])
const batchVerificationDialogVisible = ref(false)
const batchVerificationFormRef = ref()
const batchVerificationForm = ref({
  isQualified: '是',
  deviceStatus: '停用',
  calibDate: '',
  calibOrg: '',
  certificateName: '',
  remark: ''
})

const handleTaskSelectionChange = (rows: Record<string, any>[]) => {
  selectedTaskRows.value = rows
}

const openBatchVerificationDialog = () => {
  if (selectedTaskRows.value.length === 0) {
    ElMessage.warning('请选择需要批量校验的任务')
    return
  }

  batchVerificationForm.value = { isQualified: '是', deviceStatus: '停用', calibDate: '', calibOrg: '', certificateName: '', remark: '' }
  batchVerificationDialogVisible.value = true
}

const handleBatchCertificateChange = (uploadFile: { name?: string }) => {
  batchVerificationForm.value.certificateName = uploadFile.name || ''
}

const submitBatchVerification = () => {
  const form = batchVerificationForm.value
  if (!form.calibDate) {
    ElMessage.warning('请选择校验日期')
    return
  }
  if (!form.calibOrg.trim()) {
    ElMessage.warning('请输入校验单位')
    return
  }
  if (!form.certificateName && !form.remark.trim()) {
    ElMessage.warning('检验证书上传和备注至少填写一项')
    return
  }

  const result = form.isQualified === '是' ? '合格' : '不合格'
  const nextStatus = form.isQualified === '是' ? '使用中' : form.deviceStatus
  selectedTaskRows.value.forEach(row => {
    row.calibDate = form.calibDate
    row.calibOrg = form.calibOrg.trim()
    row.certNo = form.certificateName || row.certNo
    row.remark = form.remark.trim() || row.remark
    row.result = result
    row.status = nextStatus
    row.taskStatus = '已完成'
  })

  batchVerificationDialogVisible.value = false
  ElMessage.success(`已完成 ${selectedTaskRows.value.length} 条任务的批量校验`)
}

onActivated(() => {
  generatedTasks.value = loadGeneratedCalibrationTasks()
})

const filteredData = computed(() => {
  const query = filters.value.keyword.trim().toLowerCase()
  return tableData.value.filter(item => {
    const matchesKeyword = !query || `${item.calibCode} ${item.manageCode} ${item.name}`.toLowerCase().includes(query)
    const matchesCode = !filters.value.calibCode || item.calibCode.toLowerCase().includes(filters.value.calibCode.trim().toLowerCase())
    const matchesManageCode = !filters.value.manageCode || item.manageCode.toLowerCase().includes(filters.value.manageCode.trim().toLowerCase())
    const matchesName = !filters.value.name || item.name.toLowerCase().includes(filters.value.name.trim().toLowerCase())
    const matchesTemplate = !filters.value.template || item.template === filters.value.template
    const matchesStatus = !filters.value.status || item.taskStatus === filters.value.status
    const matchesType = !filters.value.calibType || item.method === filters.value.calibType
    return matchesKeyword && matchesCode && matchesManageCode && matchesName && matchesTemplate && matchesStatus && matchesType
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
.task-search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}
.task-search-form :deep(.el-form-item) {
  margin-bottom: 0;
}
.task-search-form :deep(.el-form-item__label),
.task-search-form :deep(.el-input__inner),
.task-search-form :deep(.el-select__placeholder),
.task-search-form :deep(.el-select__selected-item),
.task-search-form :deep(.el-radio__label),
.task-search-form :deep(.el-button) {
  font-size: 14px;
}
.task-search-form :deep(.el-input) {
  width: 150px;
}
.task-search-form :deep(.el-select) {
  width: 180px;
}
.task-search-actions {
  margin-left: 4px;
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
.batch-verification-form :deep(.el-form-item) {
  margin-bottom: 22px;
}
.upload-file-name {
  margin-left: 12px;
  color: var(--text-secondary);
}
:deep(.el-form-item) {
  margin-bottom: 0;
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
:deep(.el-table .cell) {
  padding: 0 4px;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.status-done {
  color: #67c23a;
}
.status-processing {
  color: #e6a23c;
}
</style>
