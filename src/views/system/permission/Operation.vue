<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-select v-model="selectedRoleId" placeholder="选择角色" style="width: 180px">
              <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
            </el-select>
            <el-input v-model="filterText" placeholder="搜索模块/功能" style="width: 220px" />
            <el-button @click="checkAll">全选</el-button>
            <el-button @click="clearAll">清空</el-button>
          </div>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </template>

      <el-row :gutter="16" class="content-row">
        <el-col :span="10">
          <div class="tree-panel">
            <el-tree
              ref="treeRef"
              :data="operationTree"
              show-checkbox
              node-key="id"
              :props="{ label: 'title', children: 'children' }"
              :filter-node-method="filterNode"
              :default-checked-keys="checkedKeysForRole"
              default-expand-all
            />
          </div>
        </el-col>
        <el-col :span="14">
          <div class="summary">
            当前角色已勾选 {{ checkedCount }} 项操作
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const roles = [
  { id: 1, name: '超级管理员' },
  { id: 2, name: '生产操作员' },
  { id: 3, name: '品质主管' }
]

const operationTree = [
  { id: 'user', title: '用户信息', children: [
    { id: 'user:add', title: '新增' },
    { id: 'user:edit', title: '编辑' },
    { id: 'user:delete', title: '删除' },
    { id: 'user:reset', title: '重置密码' }
  ]},
  { id: 'dept', title: '部门信息', children: [
    { id: 'dept:add', title: '新增' },
    { id: 'dept:edit', title: '编辑' },
    { id: 'dept:delete', title: '删除' }
  ]},
  { id: 'material', title: '物料主数据', children: [
    { id: 'material:export', title: '导出' },
    { id: 'material:import', title: '导入' }
  ]},
  { id: 'doc', title: '工艺文件', children: [
    { id: 'doc:import', title: '导入PDF' },
    { id: 'doc:delete', title: '删除' }
  ]},
  { id: 'mold', title: '模具管理', children: [
    { id: 'mold:list:view', title: '查看模具列表' },
    { id: 'mold:scrapped:view', title: '查看报废模具' }
  ]},
  { id: 'quality', title: '质量管理', children: [
    { id: 'quality:ipqc:add', title: '新增检验记录' },
    { id: 'quality:ipqc:edit', title: '编辑检验记录' },
    { id: 'quality:lab:add', title: '录入检测结果' },
    { id: 'quality:config:manage', title: '产品检验配置管理' }
  ]},
  { id: 'extrusion', title: '挤压生产', children: [
    { id: 'extrusion:schedule:add', title: '新建排程' },
    { id: 'extrusion:extrusion:operate', title: '挤压操作' },
    { id: 'extrusion:sawing:operate', title: '锯切操作' },
    { id: 'extrusion:aging:operate', title: '时效操作' },
    { id: 'extrusion:cutting:operate', title: '裁切操作' },
    { id: 'extrusion:packaging:operate', title: '包装操作' },
    { id: 'extrusion:pendingStorage:operate', title: '入库操作' }
  ]},
  { id: 'equipment', title: '设备管理', children: [
    { id: 'equipment:tooling:manage', title: '工装管理' },
    { id: 'equipment:frame:manage', title: '料框管理' }
  ]},
  { id: 'reports', title: '报表分析', children: [
    { id: 'reports:extrusion:view', title: '查看挤压报表' },
    { id: 'reports:extrusion:export', title: '导出挤压报表' }
  ]}
]

const permissionsMap = ref<Record<number, string[]>>({
  1: operationTree.flatMap(n => n.children?.map(c => c.id) || []),
  2: ['user:add', 'user:edit', 'material:export'],
  3: ['material:export', 'doc:import']
})

const selectedRoleId = ref<number>(2)
const filterText = ref('')
const treeRef = ref<any>()

const leafIds = computed(() => {
  const out: string[] = []
  const walk = (nodes: any[]) => {
    nodes.forEach(n => {
      if (n.children && n.children.length) walk(n.children)
      else out.push(n.id)
    })
  }
  walk(operationTree as any)
  return out
})

const checkedKeysForRole = computed(() => permissionsMap.value[selectedRoleId.value] || [])

const checkedCount = computed(() => {
  const keys = treeRef.value?.getCheckedKeys?.() || []
  return keys.filter((k: string) => leafIds.value.includes(k)).length
})

watch(filterText, val => treeRef.value?.filter(val))
const filterNode = (val: string, data: any) => {
  if (!val) return true
  return String(data.title).toLowerCase().includes(val.toLowerCase())
}

watch(selectedRoleId, async () => {
  await nextTick()
  treeRef.value?.setCheckedKeys(checkedKeysForRole.value)
})

const checkAll = () => {
  treeRef.value?.setCheckedKeys(leafIds.value)
}
const clearAll = () => {
  treeRef.value?.setCheckedKeys([])
}

const save = () => {
  const keys = (treeRef.value?.getCheckedKeys?.() || []) as string[]
  permissionsMap.value[selectedRoleId.value] = keys.filter(k => leafIds.value.includes(k))
  ElMessage.success('操作权限已保存')
}
</script>

<style scoped>
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.full-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.content-row {
  flex: 1;
}
.tree-panel {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px;
  height: 100%;
  overflow: auto;
  background: #fff;
}
.summary {
  padding: 8px 0;
  color: #666;
}
</style>

