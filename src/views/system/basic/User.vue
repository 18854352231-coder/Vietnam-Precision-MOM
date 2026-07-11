<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">用户信息</span>
            <el-input v-model="searchQuery" placeholder="搜索工号/姓名" style="width: 220px" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
          <el-button type="primary" @click="handleAdd">新建用户</el-button>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="tableData" border height="100%">
          <el-table-column prop="employeeNo" label="员工号" width="120" />
          <el-table-column prop="realName" label="真实姓名" />
          <el-table-column prop="department" label="所属部门" />
          <el-table-column prop="position" label="岗位" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <span :class="['status-dot', scope.row.status ? 'is-active' : 'is-disabled']"></span>
              {{ scope.row.status ? '正常' : '禁用' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280">
            <template #default="scope">
              <el-button size="small" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="warning" link @click="handleResetPassword(scope.row)">重置密码</el-button>
              <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 新建/编辑用户对话框 -->
      <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新建用户' : '编辑用户'">
        <el-form :model="form" label-width="100px">
          <el-form-item label="员工号">
            <el-input v-model="form.employeeNo" />
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input v-model="form.realName" />
          </el-form-item>
          <el-form-item label="所属部门">
            <el-tree-select
              v-model="form.departmentId"
              :data="departmentTree"
              check-strictly
              placeholder="选择部门"
            />
          </el-form-item>
          <el-form-item label="岗位">
            <el-select v-model="form.positionId" placeholder="选择岗位">
              <el-option label="挤压员" :value="1" />
              <el-option label="熔铸员" :value="2" />
              <el-option label="品质主管" :value="3" />
            </el-select>
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
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const searchQuery = ref('')
const tableData = ref([
  { id: 1, employeeNo: 'E0001', realName: '超级管理员', department: '总办', position: '管理员', status: true },
  { id: 2, employeeNo: 'E1023', realName: '王五', department: '挤压车间', position: '挤压员', status: true },
  { id: 3, employeeNo: 'E2045', realName: '赵六', department: '熔铸车间', position: '熔铸员', status: true }
])

const departmentTree = [
  { value: 1, label: '越南工厂', children: [
    { value: 2, label: '生产部', children: [
      { value: 4, label: '挤压车间' },
      { value: 5, label: '熔铸车间' }
    ]},
    { value: 3, label: '品质部' }
  ]}
]

const dialogVisible = ref(false)
const dialogType = ref('add')
const form = ref({
  employeeNo: '',
  realName: '',
  departmentId: null,
  positionId: null
})

const handleAdd = () => {
  dialogType.value = 'add'
  form.value = { employeeNo: '', realName: '', departmentId: null, positionId: null }
  dialogVisible.value = true
}

const handleSearch = () => {
  // 搜索逻辑
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleResetPassword = (row: any) => {
  ElMessageBox.confirm(`确认重置员工 ${row.employeeNo} 的密码吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码重置成功，新密码为：123456')
  })
}

const handleSave = () => {
  ElMessage.success('操作成功')
  dialogVisible.value = false
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除员工 ${row.employeeNo} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
  })
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

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.status-dot.is-active {
  background-color: #0070f3;
  box-shadow: 0 0 8px rgba(0, 112, 243, 0.4);
}

.status-dot.is-disabled {
  background-color: var(--text-tertiary);
}
</style>

