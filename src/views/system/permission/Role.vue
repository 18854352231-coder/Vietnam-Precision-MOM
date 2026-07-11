<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <span class="title">角色管理</span>
            <el-input v-model="searchQuery" placeholder="搜索角色名称/编码" style="width: 220px" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="filteredData" border height="100%">
          <el-table-column prop="name" label="角色名称" />
          <el-table-column prop="code" label="角色编码" />
          <el-table-column label="操作" width="280">
            <template #default="scope">
              <el-button size="small" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="success" link @click="handlePermission(scope.row)">权限分配</el-button>
              <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>


      <!-- 权限分配对话框 -->
      <el-dialog v-model="permDialogVisible" title="权限分配" width="500px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="管理权限 (菜单)" name="menu">
            <el-tree
              ref="menuTreeRef"
              :data="menuData"
              show-checkbox
              node-key="id"
              default-expand-all
              :props="{ label: 'title' }"
            />
          </el-tab-pane>
          <el-tab-pane label="操作权限 (功能)" name="button">
            <el-checkbox-group v-model="checkedButtons">
              <el-checkbox label="新增" value="add" />
              <el-checkbox label="编辑" value="edit" />
              <el-checkbox label="删除" value="delete" />
              <el-checkbox label="导出" value="export" />
              <el-checkbox label="导入" value="import" />
            </el-checkbox-group>
          </el-tab-pane>
        </el-tabs>
        <template #footer>
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">确定</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const tableData = ref([
  { id: 1, name: '超级管理员', code: 'SUPER_ADMIN', status: 'active' },
  { id: 2, name: '生产员', code: 'PROD_USER', status: 'active' },
  { id: 3, name: '品质员', code: 'QC_USER', status: 'active' }
])

const searchQuery = ref('')
const filteredData = computed(() => {
  const kw = searchQuery.value.trim().toLowerCase()
  return tableData.value.filter(r => {
    if (!kw) return true
    return [r.name, r.code].some(v => String(v || '').toLowerCase().includes(kw))
  })
})

const handleSearch = () => {}

const permDialogVisible = ref(false)
const activeTab = ref('menu')
const checkedButtons = ref(['add', 'edit'])

const menuData = [
  { id: 1, title: '基础信息', children: [
    { id: 11, title: '部门信息' },
    { id: 12, title: '用户信息' },
    { id: 13, title: '岗位信息' }
  ]},
  { id: 2, title: '权限配置', children: [
    { id: 21, title: '角色管理' },
    { id: 22, title: '操作权限' },
    { id: 23, title: '管理权限' }
  ]},
  { id: 3, title: '基础数据', children: [
    { id: 31, title: '物料主数据' },
    { id: 32, title: '成分料号' }
  ]},
  { id: 4, title: '挤压生产', children: [
    { id: 41, title: '下发排程' },
    { id: 42, title: '挤压工作台' },
    { id: 43, title: '锯切工作台' },
    { id: 44, title: '时效工作台' },
    { id: 45, title: '裁切工作台' },
    { id: 46, title: '包装工作台' },
    { id: 47, title: '待入库清单' }
  ]}
]

const handlePermission = (row: any) => {
  permDialogVisible.value = true
}

const savePermissions = () => {
  ElMessage.success('权限保存成功')
  permDialogVisible.value = false
}

const handleAdd = () => { console.log('Add') }
const handleEdit = (row: any) => { console.log('Edit', row) }
const handleDelete = (row: any) => { console.log('Delete', row) }
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

.el-checkbox-group {
  padding: 20px;
}
</style>

