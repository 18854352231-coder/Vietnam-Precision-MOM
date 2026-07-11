<template>
  <div class="page-container">
    <el-card class="full-card">
      <div class="search-wrapper">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="料框编号">
            <el-input v-model="searchForm.frameNo" placeholder="请输入料框编号" clearable />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px">
              <el-option label="铝棒框" value="铝棒框" />
              <el-option label="型材框" value="型材框" />
              <el-option label="废料框" value="废料框" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="空闲" value="空闲" />
              <el-option label="使用中" value="使用中" />
              <el-option label="维修中" value="维修中" />
              <el-option label="已报废" value="已报废" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <el-button type="primary" icon="Plus" @click="openDialog('create')">新建料框</el-button>
        <el-button type="danger" icon="Delete" plain :disabled="selectedRows.length === 0" @click="handleDelete">批量报废</el-button>
      </div>

      <el-table :data="tableData" border stripe height="calc(100vh - 280px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="frameNo" label="料框编号" width="150" />
        <el-table-column prop="type" label="类型" width="120" align="center" />
        <el-table-column prop="dimensions" label="尺寸 (长*宽*高 mm)" width="180" />
        <el-table-column prop="tareWeight" label="皮重 (kg)" width="100" align="right" />
        <el-table-column prop="maxLoad" label="最大载重 (kg)" width="120" align="right" />
        <el-table-column prop="currentLocation" label="当前位置" min-width="150" />
        <el-table-column prop="lastMaintainDate" label="最近维护日期" width="140" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAction(row, '编辑')">编辑</el-button>
            <el-button link type="warning" size="small" @click="handleAction(row, '维修')">维修</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="45"
        />
      </div>
    </el-card>

    <!-- 新建/编辑料框弹窗 -->
    <el-dialog v-model="dialogs.form.visible" :title="dialogs.form.isEdit ? '编辑料框' : '新建料框'" width="600px">
      <el-form :model="dialogs.form.data" label-width="120px">
        <el-form-item label="料框编号" required>
          <el-input v-model="dialogs.form.data.frameNo" :disabled="dialogs.form.isEdit" placeholder="请输入或扫码录入料框编号" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="dialogs.form.data.type" placeholder="请选择" style="width: 100%">
            <el-option label="铝棒框" value="铝棒框" />
            <el-option label="型材框" value="型材框" />
            <el-option label="废料框" value="废料框" />
          </el-select>
        </el-form-item>
        <el-form-item label="尺寸(长*宽*高)">
          <el-input v-model="dialogs.form.data.dimensions" placeholder="如 6000*1200*800" />
        </el-form-item>
        <el-form-item label="皮重 (kg)">
          <el-input-number v-model="dialogs.form.data.tareWeight" :min="0" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="最大载重 (kg)">
          <el-input-number v-model="dialogs.form.data.maxLoad" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="dialogs.form.data.status" placeholder="请选择" style="width: 100%">
            <el-option label="空闲" value="空闲" />
            <el-option label="使用中" value="使用中" />
            <el-option label="维修中" value="维修中" />
            <el-option label="已报废" value="已报废" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.form.visible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const searchForm = ref({ frameNo: '', type: '', status: '' })
const currentPage = ref(1)
const pageSize = ref(20)

const tableData = ref([
  { 
    frameNo: 'CV-A-A-L6000*W1250*H650*0180', type: '型材框', dimensions: '6000*1000*800', 
    tareWeight: 120.5, maxLoad: 3000, currentLocation: '时效区 A-12', 
    lastMaintainDate: '2026-01-15', status: '使用中'
  },
  { 
    frameNo: 'CV-A-A-L6000*W1250*H650*0181', type: '型材框', dimensions: '6000*1000*800', 
    tareWeight: 121.0, maxLoad: 3000, currentLocation: '锯切区 B-05', 
    lastMaintainDate: '2026-02-20', status: '空闲'
  },
  { 
    frameNo: 'CV-A-A-L6000*W1250*H650*0182', type: '铝棒框', dimensions: '1500*1200*1000', 
    tareWeight: 85.0, maxLoad: 2000, currentLocation: '维修区', 
    lastMaintainDate: '2026-04-10', status: '维修中'
  }
])

const selectedRows = ref<any[]>([])

const dialogs = ref({
  form: { 
    visible: false, 
    isEdit: false,
    data: { frameNo: '', type: '型材框', dimensions: '', tareWeight: 0, maxLoad: 0, status: '空闲' } 
  }
})

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSearch = () => {
  ElMessage.success('查询完成')
}

const handleReset = () => {
  searchForm.value = { frameNo: '', type: '', status: '' }
}

const openDialog = (type: 'create') => {
  dialogs.value.form.isEdit = false
  dialogs.value.form.data = { frameNo: '', type: '型材框', dimensions: '', tareWeight: 0, maxLoad: 0, status: '空闲' }
  dialogs.value.form.visible = true
}

const submitForm = () => {
  if (!dialogs.value.form.data.frameNo) {
    ElMessage.warning('请输入料框编号')
    return
  }
  
  if (dialogs.value.form.isEdit) {
    const index = tableData.value.findIndex(item => item.frameNo === dialogs.value.form.data.frameNo)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...dialogs.value.form.data }
    }
    ElMessage.success('编辑料框成功')
  } else {
    tableData.value.unshift({
      ...dialogs.value.form.data,
      currentLocation: '空闲存放区',
      lastMaintainDate: '-'
    })
    ElMessage.success('新建料框成功')
  }
  
  dialogs.value.form.visible = false
}

const handleDelete = () => {
  ElMessageBox.confirm(
    `确定要将选中的 ${selectedRows.value.length} 个料框设为报废状态吗？`,
    '批量报废确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = '已报废'
    })
    ElMessage.success('已成功更新为报废状态')
  }).catch(() => {})
}

const handleAction = (row: any, action: string) => {
  if (action === '编辑') {
    dialogs.value.form.isEdit = true
    dialogs.value.form.data = { ...row }
    dialogs.value.form.visible = true
  } else if (action === '维修') {
    row.status = '维修中'
    row.currentLocation = '维修区'
    ElMessage.success(`料框 ${row.frameNo} 已登记维修`)
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = { 
    '空闲': 'success', 
    '使用中': 'primary', 
    '维修中': 'warning',
    '已报废': 'info'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.page-container { padding: 16px; height: 100%; box-sizing: border-box; background-color: var(--bg-primary); }
.full-card { height: 100%; display: flex; flex-direction: column; border: none; }
:deep(.el-card__body) { padding: 16px; flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.search-wrapper { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; display: flex; gap: 8px; }
.pagination-container { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>

