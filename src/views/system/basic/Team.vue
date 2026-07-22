<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">班组信息</span>
            <el-input v-model="searchQuery" placeholder="班组名称/编码/所属车间" style="width: 220px" clearable />
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
          <el-button type="primary" @click="handleAdd">新增班组</el-button>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table
          :data="filteredTeams"
          height="100%"
          border
        >
          <el-table-column prop="name" label="班组名称" />
          <el-table-column prop="code" label="班组编码" />
          <el-table-column prop="workshop" label="所属车间" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                {{ scope.row.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button size="small" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="padding: 20px"
      >
        <el-form-item label="班组名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入班组名称" />
        </el-form-item>
        <el-form-item label="班组编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入班组编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="所属车间" prop="workshop">
          <el-select v-model="form.workshop" placeholder="选择所属车间" style="width: 100%" filterable>
            <el-option
              v-for="ws in workshopOptions"
              :key="ws.value"
              :label="ws.label"
              :value="ws.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班组状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

interface TeamItem {
  id: number
  name: string
  code: string
  workshop: string
  status: string
  remark: string
}

const teams = ref<TeamItem[]>([
  ...['A', 'B'].flatMap(prefix => Array.from({ length: 8 }, (_, index) => ({
    id: (prefix === 'A' ? 0 : 8) + index + 1,
    name: `${prefix}${String(index + 1).padStart(2, '0')}`,
    code: `EXT-SAW-${prefix}${String(index + 1).padStart(2, '0')}`,
    workshop: '挤压/锯切车间', status: 'active', remark: `挤压与锯切共用班组，${index + 1}号机`,
  }))),
  { id: 17, name: '包装A', code: 'PACK-A', workshop: '包装车间', status: 'active', remark: '包装班组' },
  { id: 18, name: '包装B', code: 'PACK-B', workshop: '包装车间', status: 'active', remark: '包装班组' },
  ...['A', 'B'].flatMap(prefix => Array.from({ length: 5 }, (_, index) => ({
    id: 19 + (prefix === 'A' ? 0 : 5) + index,
    name: `${prefix}${String(index + 1).padStart(2, '0')}`,
    code: `CUT-MAN-${prefix}${String(index + 1).padStart(2, '0')}`,
    workshop: '裁切车间', status: 'active', remark: `裁切人工线 ${index + 1}号锯`,
  }))),
  ...['A06', 'A07', 'B06', 'B07'].map((name, index) => ({
    id: 29 + index, name, code: `CUT-AUTO-${name}`, workshop: '裁切车间', status: 'active',
    remark: `裁切自动线 ${index % 2 === 0 ? '自动1' : '自动2'}`,
  })),
])

const workshopOptions = [
  { label: '挤压车间', value: '挤压车间' },
  { label: '熔铸车间', value: '熔铸车间' },
  { label: '表面处理车间', value: '表面处理车间' },
  { label: '深加工车间', value: '深加工车间' },
  { label: '挤压/锯切车间', value: '挤压/锯切车间' },
  { label: '包装车间', value: '包装车间' },
  { label: '裁切车间', value: '裁切车间' },
]

const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('新增班组')
const isEdit = ref(false)
const formRef = ref()

const form = ref({
  id: undefined as number | undefined,
  name: '',
  code: '',
  workshop: '',
  status: 'active',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '班组名称必填', trigger: 'blur' }],
  code: [{ required: true, message: '班组编码必填', trigger: 'blur' }],
  workshop: [{ required: true, message: '请选择所属车间', trigger: 'change' }]
}

const filteredTeams = computed(() => {
  const kw = searchQuery.value.trim().toLowerCase()
  if (!kw) return teams.value
  
  return teams.value.filter(t => 
    t.name.toLowerCase().includes(kw) || 
    t.code.toLowerCase().includes(kw) || 
    t.workshop.toLowerCase().includes(kw)
  )
})

const handleSearch = () => {}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增班组'
  dialogVisible.value = true
}

const handleEdit = (row: TeamItem) => {
  isEdit.value = true
  dialogTitle.value = '编辑班组'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (!isEdit.value && teams.value.some(t => t.code === form.value.code)) {
        ElMessage.error('班组编码已存在，请重新输入')
        return
      }
      
      if (isEdit.value) {
        const index = teams.value.findIndex(t => t.id === form.value.id)
        if (index !== -1) {
          teams.value[index] = { ...form.value } as TeamItem
        }
      } else {
        const newId = Math.max(...teams.value.map(t => t.id), 0) + 1
        teams.value.push({ ...form.value, id: newId } as TeamItem)
      }
      
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row: TeamItem) => {
  ElMessageBox.confirm(
    `确定要删除班组 [${row.name}] 吗？此操作不可撤销。`,
    '安全确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = teams.value.findIndex(t => t.id === row.id)
    if (index !== -1) {
      teams.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  form.value = {
    id: undefined,
    name: '',
    code: '',
    workshop: '',
    status: 'active',
    remark: ''
  }
}
</script>

<style scoped>
.page-container {
  height: 100%;
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
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
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
</style>
