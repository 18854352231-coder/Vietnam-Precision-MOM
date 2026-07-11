<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">部门信息</span>
            <el-input v-model="searchQuery" placeholder="部门名称/编码/负责人" style="width: 220px" clearable />
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
          <el-button type="primary" @click="handleAdd">新增部门</el-button>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table
          :data="filteredDepartments"
          height="100%"
          border
        >
          <el-table-column prop="name" label="部门名称" />
          <el-table-column prop="code" label="部门编码" />
          <el-table-column prop="parentName" label="上级部门">
            <template #default="scope">
              {{ getParentName(scope.row.parentId) }}
            </template>
          </el-table-column>
          <el-table-column prop="leader" label="负责人" />
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
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入部门编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="deptTreeData"
            check-strictly
            placeholder="选择上级部门"
            clearable
            style="width: 100%"
            :props="{ label: 'name', value: 'id' }"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-select v-model="form.leader" placeholder="选择负责人" style="width: 100%" filterable>
            <el-option
              v-for="user in userOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门状态" prop="status">
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

interface DeptItem {
  id: number
  name: string
  parentId: number | null
  code: string
  leader: string
  status: string
  remark: string
}

const departments = ref<DeptItem[]>([
  { id: 1, name: '集团总部', parentId: null, code: 'HQ', leader: '张三', status: 'active', remark: '最高管理层' },
  { id: 2, name: '生产部', parentId: 1, code: 'PROD-DEPT', leader: '李四', status: 'active', remark: '' },
  { id: 3, name: '挤压车间', parentId: 2, code: 'EXT-SHOP', leader: '王五', status: 'active', remark: '' },
  { id: 4, name: '熔铸车间', parentId: 2, code: 'CAST-SHOP', leader: '赵六', status: 'active', remark: '' },
  { id: 5, name: '品质部', parentId: 1, code: 'QC-DEPT', leader: '钱七', status: 'active', remark: '' },
])

// 模拟已被引用的部门ID（例如被用户表引用）
const referencedDeptIds = ref([5])

const userOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '钱七', value: '钱七' },
]

const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('新增部门')
const isEdit = ref(false)
const formRef = ref()

const form = ref({
  id: undefined as number | undefined,
  name: '',
  code: '',
  parentId: null as number | null,
  leader: '',
  status: 'active',
  remark: ''
})

const getParentName = (parentId: number | null) => {
  if (!parentId) return '-'
  const parent = departments.value.find(d => d.id === parentId)
  return parent ? parent.name : '-'
}

const validateNoCycle = (rule: any, value: any, callback: any) => {
  if (isEdit.value && value === form.value.id) {
    callback(new Error('上级部门不能是自己'))
  } else {
    callback()
  }
}

const rules = {
  name: [{ required: true, message: '部门名称必填', trigger: 'blur' }],
  code: [{ required: true, message: '部门编码必填', trigger: 'blur' }],
  parentId: [{ validator: validateNoCycle, trigger: 'change' }],
  leader: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

// 转换为树形结构供选择器使用
const deptTreeData = computed(() => {
  const map: Record<number, any> = {}
  const roots: any[] = []
  
  departments.value.forEach(d => {
    map[d.id] = { ...d, children: [] }
  })
  
  departments.value.forEach(d => {
    if (d.parentId && map[d.parentId]) {
      map[d.parentId].children.push(map[d.id])
    } else {
      roots.push(map[d.id])
    }
  })
  return roots
})

const filteredDepartments = computed(() => {
  const kw = searchQuery.value.trim().toLowerCase()
  if (!kw) return departments.value
  
  return departments.value.filter(d => 
    d.name.toLowerCase().includes(kw) || 
    d.code.toLowerCase().includes(kw) || 
    d.leader.toLowerCase().includes(kw) ||
    getParentName(d.parentId).toLowerCase().includes(kw)
  )
})

const handleSearch = () => {}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增部门'
  dialogVisible.value = true
}

const handleEdit = (row: DeptItem) => {
  isEdit.value = true
  dialogTitle.value = '编辑部门'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (!isEdit.value && departments.value.some(d => d.code === form.value.code)) {
        ElMessage.error('部门编码已存在，请重新输入')
        return
      }
      
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row: DeptItem) => {
  const hasChildren = departments.value.some(d => d.parentId === row.id)
  if (hasChildren) {
    ElMessageBox.alert(`阻断原因：部门 [${row.name}] 下存在子部门，禁止删除。`, '无法删除', { type: 'error' })
    return
  }

  if (referencedDeptIds.value.includes(row.id)) {
    ElMessageBox.alert(`阻断原因：部门 [${row.name}] 已被用户关联引用，禁止删除。`, '无法删除', { type: 'error' })
    return
  }

  ElMessageBox.confirm(
    `确定要删除部门 [${row.name}] 吗？此操作不可撤销。`,
    '安全确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  form.value = {
    id: undefined,
    name: '',
    code: '',
    parentId: null,
    leader: '',
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
