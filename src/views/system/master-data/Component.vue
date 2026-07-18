<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-input v-model="search" placeholder="成分料号/物料名称" style="width: 250px" clearable />
            <el-button type="primary" @click="handleSearch" style="margin-left: 10px">查询</el-button>
          </div>
          <div class="header-right">
            <el-button type="success" @click="handleExport">导出</el-button>
            <el-button type="warning" @click="handleImport">导入</el-button>
            <el-button type="primary" @click="handleAdd">新增成分料号</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="seq" label="序号" width="60" align="center" />
        <el-table-column prop="code" label="成分料号" width="160" show-overflow-tooltip />
        <el-table-column prop="name" label="物料名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="isTemp" label="是否临时" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isTemp ? 'warning' : 'success'">{{ scope.row.isTemp ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alloyGrade" label="合金牌号" width="90" align="center" />
        <el-table-column prop="publishStatus" label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.publishStatus === '已发布' ? 'success' : 'info'">{{ scope.row.publishStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="effectiveDate" label="生效日期" width="140" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleDetail(scope.row)">详情</el-button>
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑/详情对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="850px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" :disabled="isDetail">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成分料号" prop="code">
              <el-input v-model="form.code" placeholder="请输入成分料号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否临时料号" prop="isTemp">
              <el-switch v-model="form.isTemp" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物料名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入物料名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="铝棒类型" prop="rodType">
              <el-select v-model="form.rodType" style="width: 100%">
                <el-option label="普通铝棒" value="normal" />
                <el-option label="再生铝棒" value="recycled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="form.supplier" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格" prop="spec">
              <el-input v-model="form.spec" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="合金牌号" prop="alloyGrade">
              <el-input v-model="form.alloyGrade" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="R角" prop="rAngle">
              <el-input v-model="form.rAngle" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="密度" prop="density">
              <el-input v-model="form.density" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="长度公差" prop="lenTolerance">
              <el-input v-model="form.lenTolerance" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="直径公差" prop="diaTolerance">
              <el-input v-model="form.diaTolerance" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="米重" prop="meterWeight">
              <el-input v-model="form.meterWeight" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="回收比" prop="recoveryRatio">
              <el-input v-model="form.recoveryRatio" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="绿电占比" prop="greenPowerRatio">
              <el-input v-model="form.greenPowerRatio" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="铝屑配比" prop="aluminumScrapRatio">
              <el-input v-model="form.aluminumScrapRatio" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发布人" prop="publisher">
              <el-input v-model="form.publisher" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker v-model="form.effectiveDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布状态" prop="publishStatus">
              <el-select v-model="form.publishStatus" style="width: 100%">
                <el-option label="待发布" value="待发布" />
                <el-option label="已发布" value="已发布" />
                <el-option label="已失效" value="已失效" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="成分含量" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="3" placeholder="Si: 0.2-0.6, Mg: 0.45-0.9..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ isDetail ? '关闭' : '取消' }}</el-button>
        <el-button type="primary" @click="handleSave" v-if="!isDetail">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const search = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增成分料号')
const isDetail = ref(false)
const formRef = ref()
const form = ref({
  id: null,
  seq: null,
  code: '',
  isTemp: false,
  rodType: 'normal',
  name: '',
  supplier: '',
  spec: '',
  rAngle: '',
  alloyGrade: '',
  lenTolerance: '',
  diaTolerance: '',
  density: '',
  meterWeight: '',
  recoveryRatio: '',
  greenPowerRatio: '',
  aluminumScrapRatio: '',
  content: '',
  publishStatus: '待发布',
  publisher: '',
  effectiveDate: ''
})

const rules = {
  code: [{ required: true, message: '请输入成分料号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
}

const mockData = [
  { 
    id: 1, seq: 1, code: 'C-6063-V1', isTemp: false, rodType: 'normal', name: '6063合金锭', supplier: '供应商A', 
    spec: 'Φ178', rAngle: 'R5', alloyGrade: '6063', lenTolerance: '±2', diaTolerance: '±1', 
    density: '2.7', meterWeight: '6.5', recoveryRatio: '20%', greenPowerRatio: '30%', 
    aluminumScrapRatio: '10%', content: 'Si: 0.4, Mg: 0.5', 
    publishStatus: '已发布', publisher: '张三', effectiveDate: '2026-04-11' 
  },
  { 
    id: 2, seq: 2, code: 'C-TEMP-001', isTemp: true, rodType: 'recycled', name: '临时实验合金', supplier: '供应商B', 
    spec: 'Φ120', rAngle: 'R3', alloyGrade: '6061', lenTolerance: '±5', diaTolerance: '±2', 
    density: '2.7', meterWeight: '4.2', recoveryRatio: '50%', greenPowerRatio: '10%', 
    aluminumScrapRatio: '40%', content: 'Si: 0.6, Mg: 1.0', 
    publishStatus: '待发布', publisher: '李四', effectiveDate: '2026-05-01' 
  }
]

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData
    total.value = mockData.length
    loading.value = false
  }, 300)
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增成分料号'
  isDetail.value = false
  form.value = {
    id: null, seq: null, code: '', isTemp: false, rodType: 'normal', name: '', supplier: '', spec: '', 
    rAngle: '', alloyGrade: '', lenTolerance: '', diaTolerance: '', density: '', meterWeight: '', 
    recoveryRatio: '', greenPowerRatio: '', aluminumScrapRatio: '', content: '', 
    publishStatus: '待发布', publisher: '', effectiveDate: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑成分料号'
  isDetail.value = false
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDetail = (row: any) => {
  dialogTitle.value = '成分料号详情'
  isDetail.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除成分料号 ${row.code} 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadData()
  })
}

const handleExport = () => ElMessage.info('导出中...')
const handleImport = () => ElMessage.info('请选择导入文件')
const handleSizeChange = (val: number) => { pageSize.value = val; loadData() }
const handleCurrentChange = (val: number) => { currentPage.value = val; loadData() }

onMounted(() => loadData())
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left, .header-right {
  display: flex;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
