<template>
  <div class="page-container">
    <el-card class="full-card">
      <div class="search-wrapper">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="产品编号">
            <el-input v-model="searchForm.productNo" placeholder="请输入产品编号" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <el-button type="success" icon="Upload" @click="handleImport">导入检验规则</el-button>
        <el-button type="primary" icon="Plus" @click="openDialog('create')">新建配置</el-button>
      </div>

      <el-tabs v-model="activeProcessTab" class="list-tabs">
        <el-tab-pane v-for="process in processTabs" :key="process" :label="process" :name="process">
          <el-table :data="getFilteredTableData(process)" border stripe height="calc(100vh - 340px)">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="productNo" label="产品编号" width="180" show-overflow-tooltip />
            <el-table-column prop="productName" label="产品名称" width="180" show-overflow-tooltip />
            <el-table-column label="检验规则配置明细">
              <template #default="{ row }">
                <el-button
                  v-if="row.rules[process] && row.rules[process].length > 0"
                  link
                  type="primary"
                  @click="viewRulesDetail(row, process)"
                >
                  查看明细
                </el-button>
                <div v-else style="color: #999; font-size: 13px;">
                  暂无规则配置
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="170" align="center" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openDialog('edit', row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDelete(row, process)">清空规则</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="15"
        />
      </div>
    </el-card>

    <!-- 新建/编辑配置弹窗 -->
    <el-dialog v-model="dialogs.form.visible" :title="dialogs.form.isEdit ? `编辑 [${activeProcessTab}] 检验规则` : `新建 [${activeProcessTab}] 检验规则`" width="700px">
      <el-form :model="dialogs.form.data" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品编号" required>
              <el-input v-model="dialogs.form.data.productNo" :disabled="dialogs.form.isEdit" placeholder="请输入产品编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" required>
              <el-input v-model="dialogs.form.data.productName" :disabled="dialogs.form.isEdit" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="rule-header">
          <span>{{ activeProcessTab }} 检验项配置</span>
          <el-button type="primary" link icon="Plus" @click="addRule(activeProcessTab)">添加检验项</el-button>
        </div>
        <el-table :data="dialogs.form.data.rules[activeProcessTab]" border size="small" style="margin-bottom: 10px;">
          <el-table-column label="检验项目" width="150">
            <template #default="{ row }">
              <el-input v-model="row.item" placeholder="如: 长度" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="标准值" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.standard" :controls="false" style="width: 100%" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="公差范围(±)" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.tolerance" :min="0" :controls="false" style="width: 100%" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="单位" width="100">
            <template #default="{ row }">
              <el-input v-model="row.unit" placeholder="如: mm" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" icon="Delete" @click="removeRule(activeProcessTab, $index)" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.form.visible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看明细弹窗 -->
    <el-dialog v-model="dialogs.detail.visible" :title="`[${dialogs.detail.process}] 检验规则明细`" width="600px">
      <el-table :data="dialogs.detail.data" border stripe size="small">
        <el-table-column prop="item" label="检验项目" min-width="150" show-overflow-tooltip />
        <el-table-column prop="standard" label="标准值" width="120" />
        <el-table-column prop="tolerance" label="公差范围(±)" width="120" />
        <el-table-column prop="unit" label="单位" width="100" />
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.detail.visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const { t } = useI18n()

const searchForm = ref({ productNo: '' })
const currentPage = ref(1)
const pageSize = ref(20)

const processTabs = ['挤压IPQC', '时效IPQC', '裁切上料IPQC', '裁切IPQC', '预包装IPQC']
const activeProcessTab = ref('挤压IPQC')

const getEmptyRules = () => {
  const rules: Record<string, any[]> = {}
  processTabs.forEach(tab => {
    rules[tab] = []
  })
  return rules
}

interface ProductRule {
  productNo: string
  productName: string
  updateTime: string
  rules: Record<string, { item: string; standard: number; tolerance: number; unit: string }[]>
}

// 全局状态管理或API获取的数据（模拟）
const tableData = ref<ProductRule[]>([
  { 
    productNo: 'P-1001', 
    productName: 'FC72',
    updateTime: '2026-04-24 10:30',
    rules: {
      '挤压IPQC': [
        { item: '长度', standard: 6000, tolerance: 5, unit: 'mm' },
        { item: '壁厚', standard: 2.5, tolerance: 0.2, unit: 'mm' }
      ],
      '时效IPQC': [
        { item: '硬度', standard: 12, tolerance: 2, unit: 'HW' }
      ],
      '裁切上料IPQC': [],
      '裁切IPQC': [
        { item: '长度', standard: 3000, tolerance: 2, unit: 'mm' }
      ],
      '预包装IPQC': [
        { item: '外观', standard: 0, tolerance: 0, unit: '-' }
      ]
    }
  },
  { 
    productNo: 'P-1002', 
    productName: 'FC09',
    updateTime: '2026-04-23 14:15',
    rules: {
      '挤压IPQC': [
        { item: '长度', standard: 5800, tolerance: 3, unit: 'mm' },
        { item: '表面平整度', standard: 0.5, tolerance: 0.1, unit: 'mm/m' }
      ],
      '时效IPQC': [],
      '裁切上料IPQC': [],
      '裁切IPQC': [],
      '预包装IPQC': []
    }
  }
])

const dialogs = ref({
  form: { 
    visible: false, 
    isEdit: false,
    data: { 
      productNo: '', 
      productName: '',
      rules: {} as Record<string, any[]>
    } 
  },
  detail: {
    visible: false,
    process: '',
    data: [] as any[]
  }
})

const handleSearch = () => {
  ElMessage.success(t('literal.查询完成'))
}

const handleReset = () => {
  searchForm.value = { productNo: '' }
}

const handleImport = () => {
  // 模拟导入过程
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      ElMessage.success(t('pages.inspectionConfig.messages.importSuccess', { fileName: file.name }))
      // 模拟导入一条数据
      tableData.value.unshift({
        productNo: 'P-1003',
        productName: 'FC122',
        updateTime: '2026-04-24 16:00',
        rules: {
          ...getEmptyRules(),
          '挤压IPQC': [{ item: '长度', standard: 3000, tolerance: 2, unit: 'mm' }]
        }
      })
    }
  }
  input.click()
}

const viewRulesDetail = (row: any, process: string) => {
  dialogs.value.detail.process = process
  dialogs.value.detail.data = row.rules[process] || []
  dialogs.value.detail.visible = true
}

const getFilteredTableData = (process: string) => {
  return tableData.value.filter(item => {
    // 如果进行了产品编号搜索，过滤掉不匹配的
    if (searchForm.value.productNo && !item.productNo.includes(searchForm.value.productNo)) {
      return false
    }
    return true
  })
}

const openDialog = (type: 'create' | 'edit', row?: any) => {
  if (type === 'create') {
    dialogs.value.form.isEdit = false
    const newRules = getEmptyRules()
    newRules[activeProcessTab.value] = [{ item: '', standard: 0, tolerance: 0, unit: '' }]
    dialogs.value.form.data = { 
      productNo: '', 
      productName: '',
      rules: newRules 
    }
  } else if (row) {
    dialogs.value.form.isEdit = true
    // 深拷贝以防直接修改原数据
    const clonedRow = JSON.parse(JSON.stringify(row))
    processTabs.forEach(tab => {
      if (!clonedRow.rules[tab]) clonedRow.rules[tab] = []
    })
    dialogs.value.form.data = clonedRow
  }
  dialogs.value.form.visible = true
}

const addRule = (process: string) => {
  if (!dialogs.value.form.data.rules[process]) {
    dialogs.value.form.data.rules[process] = []
  }
  dialogs.value.form.data.rules[process].push({ item: '', standard: 0, tolerance: 0, unit: '' })
}

const removeRule = (process: string, index: number) => {
  dialogs.value.form.data.rules[process].splice(index, 1)
}

const submitForm = () => {
  if (!dialogs.value.form.data.productNo || !dialogs.value.form.data.productName) {
    ElMessage.warning(t('pages.inspectionConfig.messages.requiredProductInfo'))
    return
  }
  
  const process = activeProcessTab.value
  const currentRules = dialogs.value.form.data.rules[process]
  if (!currentRules || currentRules.length === 0) {
    ElMessage.warning(t('pages.inspectionConfig.messages.requiredRules', { process }))
    return
  }

  const index = tableData.value.findIndex(item => item.productNo === dialogs.value.form.data.productNo)
  
  if (index !== -1) {
    // 如果是编辑或者已存在该产品，则只更新当前工序的规则
    tableData.value[index].rules[process] = JSON.parse(JSON.stringify(currentRules))
    tableData.value[index].updateTime = new Date().toLocaleString()
    ElMessage.success(t('pages.inspectionConfig.messages.updateSuccess', {
      productNo: dialogs.value.form.data.productNo,
      process
    }))
  } else {
    // 如果是全新产品，添加进去
    tableData.value.unshift({
      productNo: dialogs.value.form.data.productNo,
      productName: dialogs.value.form.data.productName,
      rules: JSON.parse(JSON.stringify(dialogs.value.form.data.rules)),
      updateTime: new Date().toLocaleString()
    })
    ElMessage.success(t('pages.inspectionConfig.messages.createSuccess', {
      productNo: dialogs.value.form.data.productNo,
      process
    }))
  }
  
  dialogs.value.form.visible = false
}

const handleDelete = (row: any, process: string) => {
  ElMessageBox.confirm(t('pages.inspectionConfig.confirm.clearRules', {
    productNo: row.productNo,
    process
  }), t('pages.inspectionConfig.confirm.title'), {
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.productNo === row.productNo)
    if (index !== -1) {
      tableData.value[index].rules[process] = []
      tableData.value[index].updateTime = new Date().toLocaleString()
      ElMessage.success(t('pages.inspectionConfig.messages.clearSuccess'))
    }
  }).catch(() => {})
}
</script>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--bg-primary);
}
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
}
:deep(.el-card__body) {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.search-wrapper { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; display: flex; gap: 8px; }
.list-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
:deep(.el-tabs__content) {
  flex: 1;
  padding: 15px 0 0 0;
  overflow: hidden;
}
.pagination-container { margin-top: 16px; display: flex; justify-content: flex-end; }
.rule-item {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 4px;
}
.rule-item:last-child {
  margin-bottom: 0;
}
.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
  color: #303133;
}
</style>
