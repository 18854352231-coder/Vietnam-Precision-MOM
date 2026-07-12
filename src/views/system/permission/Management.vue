﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-select v-model="selectedRoleId" placeholder="选择角色" style="width: 180px">
              <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
            </el-select>
            <el-input v-model="filterText" placeholder="搜索菜单" style="width: 220px" />
            <el-button @click="selectAll">全选</el-button>
            <el-button @click="invertSelect">反选</el-button>
            <el-button @click="toggleExpand">{{ expandAll ? '折叠' : '展开' }}</el-button>
          </div>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </template>

      <div class="tree-panel">
        <el-tree
          :key="treeKey"
          ref="treeRef"
          :data="menuTree"
          show-checkbox
          node-key="id"
          :props="{ label: 'title', children: 'children' }"
          :filter-node-method="filterNode"
          :default-checked-keys="checkedMenuForRole"
          :default-expand-all="expandAll"
        />
      </div>
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

const menuTree = [
  { id: 'settings', title: '系统设置', children: [
    { id: 'basic', title: '基础信息', children: [
      { id: 'dept', title: '部门信息' },
      { id: 'user', title: '用户信息' },
      { id: 'position', title: '岗位信息' },
      { id: 'team', title: '班组信息' }
    ]},
    { id: 'permission', title: '权限配置', children: [
      { id: 'role', title: '角色管理' },
      { id: 'operation', title: '操作权限' },
      { id: 'management', title: '管理权限' }
    ]},
    { id: 'master', title: '基础数据', children: [
      { id: 'material', title: '物料主数据' },
      { id: 'component', title: '成分料号' }
    ]},
    { id: 'logs', title: '操作日志', children: [
      { id: 'normal', title: '正常日志' },
      { id: 'exception', title: '异常日志' },
      { id: 'interface', title: '接口日志' }
    ]},
    { id: 'docs', title: '工艺文档管理', children: [
      { id: 'processFiles', title: '工艺文件' }
    ]},
    { id: 'quality', title: '质量管理', children: [
      { id: 'ipqcModule', title: 'IPQC', children: [
        { id: 'ipqc', title: '制程检验', children: [
          { id: 'extrusionIPQC', title: '挤压IPQC' },
          { id: 'agingIPQC', title: '时效IPQC' },
          { id: 'cuttingFeedIPQC', title: '裁切上料IPQC' },
          { id: 'cuttingIPQC', title: '裁切IPQC' },
          { id: 'prePackagingIPQC', title: '预包装IPQC' }
        ]},
        { id: 'processQualityInspection', title: '工序质检' },
        { id: 'inspectionConfig', title: '产品检验配置' }
      ]},
      { id: 'sampleTestingModule', title: '样品检测', children: [
        { id: 'cncSample', title: 'CNC制样&收样' },
        { id: 'labTesting', title: '实验室' }
      ]}
    ]},
    { id: 'extrusion', title: '挤压生产', children: [
      { id: 'extrusionSchedule', title: '下发排程' },
      { id: 'extrusionWorkbench', title: '挤压工作台' },
      { id: 'extrusionSawing', title: '锯切工作台' },
      { id: 'extrusionAging', title: '时效工作台' },
      { id: 'extrusionCutting', title: '裁切工作台' },
      { id: 'extrusionPackaging', title: '包装工作台' },
      { id: 'defectiveControl', title: '不良品管控' },
      { id: 'extrusionPendingStorage', title: '待入库清单' }
    ]},
    { id: 'equipment', title: '设备管理', children: [
      { id: 'tooling', title: '工装管理' },
      { id: 'frame', title: '料框管理' }
    ]},
    { id: 'reports', title: '报表分析', children: [
      { id: 'reportExtrusion', title: '挤压报表', children: [
        { id: 'reportExtrusionProduction', title: '挤压生产' },
        { id: 'reportCuttingProduction', title: '裁切生产' }
      ]},
      { id: 'reportCasting', title: '熔铸报表' }
    ]}
  ]}
]

const accessMap = ref<Record<number, string[]>>({
  1: collectAllLeafIds(menuTree),
  2: ['settings', 'basic', 'dept', 'user', 'position', 'docs', 'processFiles'],
  3: ['settings', 'logs', 'exception', 'basic', 'user']
})

const selectedRoleId = ref<number>(2)
const filterText = ref('')
const treeRef = ref<any>()
const expandAll = ref(true)
const treeKey = ref(0)

function collectAllLeafIds(nodes: any[]): string[] {
  const out: string[] = []
  const walk = (arr: any[]) => {
    arr.forEach(n => {
      if (n.children && n.children.length) walk(n.children)
      else out.push(n.id)
    })
  }
  walk(nodes)
  return out
}

const allLeafIds = computed(() => collectAllLeafIds(menuTree))
const allNodeIds = computed(() => {
  const ids: string[] = []
  const walk = (arr: any[]) => {
    arr.forEach(n => {
      ids.push(n.id)
      if (n.children && n.children.length) walk(n.children)
    })
  }
  walk(menuTree)
  return ids
})

const checkedMenuForRole = computed(() => accessMap.value[selectedRoleId.value] || [])

watch(filterText, val => treeRef.value?.filter(val))
const filterNode = (val: string, data: any) => {
  if (!val) return true
  return String(data.title).toLowerCase().includes(val.toLowerCase())
}

watch(selectedRoleId, async () => {
  await nextTick()
  treeRef.value?.setCheckedKeys(checkedMenuForRole.value)
})

const selectAll = () => {
  treeRef.value?.setCheckedKeys(allLeafIds.value)
}
const invertSelect = () => {
  const current = new Set(treeRef.value?.getCheckedKeys?.() || [])
  const target = allLeafIds.value.filter(id => !current.has(id))
  treeRef.value?.setCheckedKeys(target)
}
const toggleExpand = () => {
  expandAll.value = !expandAll.value
  treeKey.value += 1
}
const save = () => {
  const keys = (treeRef.value?.getCheckedKeys?.() || []) as string[]
  accessMap.value[selectedRoleId.value] = keys.filter(k => allLeafIds.value.includes(k))
  ElMessage.success('管理权限已保存')
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
.tree-panel {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px;
  height: calc(100vh - 200px);
  overflow: auto;
  background: #fff;
}
</style>

