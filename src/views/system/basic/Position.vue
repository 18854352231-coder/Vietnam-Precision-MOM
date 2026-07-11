<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">岗位信息</span>
            <el-input v-model="searchQuery" placeholder="岗位名称/编码/角色/备注" style="width: 220px" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
          <el-button type="primary" @click="handleAdd">新增岗位</el-button>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="filteredData" border height="100%">
          <el-table-column prop="name" label="岗位名称" />
          <el-table-column prop="code" label="岗位编码" />
          <el-table-column prop="roleName" label="关联角色">
            <template #default="scope">
              <span>
                {{ scope.row.roleName || (Array.isArray(scope.row.roles) ? scope.row.roles[0] : scope.row.roles) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="备注" />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button size="small" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>


      <!-- 新建/编辑岗位对话框 -->
      <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新建岗位' : '编辑岗位'">
        <el-form :model="form" label-width="100px">
          <el-form-item label="岗位名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="岗位编码">
            <el-input v-model="form.code" disabled placeholder="根据岗位名称自动生成" />
          </el-form-item>
          <el-form-item label="关联角色">
            <el-select v-model="form.roleId" placeholder="选择关联的角色">
              <el-option v-for="opt in roleOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.description" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const tableData = ref([
  { id: 1, name: '挤压员', code: 'EXT_WORKER', roleName: '生产操作员', description: '负责挤压车间生产操作' },
  { id: 2, name: '熔铸员', code: 'CAST_WORKER', roleName: '生产操作员', description: '负责熔铸车间生产操作' },
  { id: 3, name: '品质经理', code: 'QC_MANAGER', roleName: '品质主管', description: '品质部门管理' }
])

const dialogVisible = ref(false)
const dialogType = ref('add')
const form = ref({
  name: '',
  code: '',
  roleId: null as null | number,
  description: ''
})

const searchQuery = ref('')
const filteredData = computed(() => {
  const kw = searchQuery.value.trim().toLowerCase()
  return tableData.value.filter(r => {
    if (!kw) return true
    return [r.name, r.code, r.roleName, r.description].some(v => String(v || '').toLowerCase().includes(kw))
  })
})

const roleOptions = [
  { id: 1, name: '系统管理员' },
  { id: 2, name: '生产操作员' },
  { id: 3, name: '品质主管' }
]

const roleIdToName = (id: number | null) => roleOptions.find(r => r.id === id)?.name || ''
const roleNameToId = (name: string | undefined) => roleOptions.find(r => r.name === name)?.id ?? null

const usedCodes = computed(() => new Set(tableData.value.map(i => i.code)))

const nextAutoCode = () => {
  let i = 1
  let code = ''
  do {
    code = `POS_${String(i).padStart(3, '0')}`
    i++
  } while (usedCodes.value.has(code))
  return code
}

const codeFromName = (name: string) => {
  const ascii = (name || '').replace(/[^A-Za-z0-9]+/g, '_').toUpperCase().replace(/^_+|_+$/g, '')
  if (ascii) {
    let base = ascii
    let tryCode = base
    let suffix = 1
    while (usedCodes.value.has(tryCode)) {
      tryCode = `${base}_${suffix++}`
    }
    return tryCode
  }
  return nextAutoCode()
}

watch(() => form.value.name, (val) => {
  if (dialogType.value === 'add') {
    form.value.code = codeFromName(val || '')
  }
})

const handleAdd = () => {
  dialogType.value = 'add'
  form.value = { name: '', code: nextAutoCode(), roleId: null, description: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  const firstRole = Array.isArray(row.roles) ? row.roles[0] : (row.roleName || row.roles)
  form.value = { ...row, roleId: roleNameToId(firstRole) }
  dialogVisible.value = true
}

const handleSave = () => {
  if (dialogType.value === 'add') {
    tableData.value.push({
      id: Date.now(),
      name: form.value.name,
      code: form.value.code,
      roleName: roleIdToName(form.value.roleId),
      description: form.value.description
    } as any)
  } else {
    const idx = tableData.value.findIndex(i => i.id === (form.value as any).id)
    if (idx > -1) {
      tableData.value[idx] = {
        ...(tableData.value[idx] as any),
        name: form.value.name,
        code: form.value.code,
        roleName: roleIdToName(form.value.roleId),
        description: form.value.description
      } as any
    }
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除岗位 ${row.name} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

const handleSearch = () => {}
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
  font-size: 16px;
  font-weight: 600;
  margin-right: 12px;
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
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}
</style>

