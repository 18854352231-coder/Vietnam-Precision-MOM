<template>
  <div class="page-container">
    <el-card class="full-card" shadow="never">
      <div class="search-bar">
        <el-form :model="searchForm" inline size="small">
          <el-form-item label="日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="批次号">
            <el-input v-model="searchForm.batchNo" clearable style="width: 140px" />
          </el-form-item>
          <el-form-item label="产品名称">
            <el-input v-model="searchForm.productName" clearable style="width: 140px" />
          </el-form-item>
          <el-form-item label="线体名称">
            <el-select v-model="searchForm.lineName" placeholder="请选择" clearable style="width: 140px">
              <el-option label="挤压19#线体" value="挤压19#线体" />
              <el-option label="挤压20#线体" value="挤压20#线体" />
              <el-option label="挤压16#线体" value="挤压16#线体" />
              <el-option label="挤压18#线体" value="挤压18#线体" />
              <el-option label="挤压25#线体" value="挤压25#线体" />
              <el-option label="挤压28#线体" value="挤压28#线体" />
              <el-option label="挤压40#线体" value="挤压40#线体" />
              <el-option label="挤压26#线体" value="挤压26#线体" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-container">
        <el-table :data="tableData" border stripe style="width: 100%" height="100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="frameNo" label="料框编号" min-width="130" show-overflow-tooltip />
          <el-table-column prop="batchNo" label="批次号" min-width="150" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="finishedProductNo" label="成品料号" min-width="170" show-overflow-tooltip />
          <el-table-column prop="process" label="工序" min-width="90" align="center" />
          <el-table-column prop="lineName" label="线体名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="frameTime" label="装框时间" min-width="160" align="center" />
          <el-table-column prop="inspectionTime" label="质检时间" min-width="160" align="center" />
          <el-table-column prop="exceptionContent" label="异常内容" min-width="150" show-overflow-tooltip />
          <el-table-column prop="handlingMethod" label="处理方式" min-width="150" show-overflow-tooltip />
          <el-table-column prop="latestStatus" label="最新状态" min-width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.latestStatus" :type="row.latestStatus === 'OK' ? 'success' : 'danger'">
                {{ row.latestStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="handleSingleNG(row)">NG</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- NG 异常登记弹窗 -->
    <el-dialog v-model="ngDialogVisible" title="NG 异常登记" width="500px" destroy-on-close>
      <el-form ref="ngFormRef" :model="ngForm" :rules="ngRules" label-width="100px">
        <el-form-item label="异常内容" prop="exceptionContent">
          <el-input v-model="ngForm.exceptionContent" type="textarea" :rows="3" placeholder="请输入异常内容" />
        </el-form-item>
        <el-form-item label="处理方式" prop="handlingMethod">
          <el-input v-model="ngForm.handlingMethod" type="textarea" :rows="3" placeholder="请输入处理方式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ngDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNg">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

// 列表查询
const searchForm = ref({
  dateRange: [],
  batchNo: '',
  productName: '',
  lineName: ''
})

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(13)

// 列表数据 (Mock)
const tableData = ref([
  { id: 1, frameNo: 'CV-A-A-L6000*W1250*H650*0231', batchNo: 'JY2606120143', productName: 'FC37', finishedProductNo: '13-C001-1367', process: '挤压', lineName: '挤压19#线体', frameTime: '2026-06-13 11:59:51', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 2, frameNo: 'CV-A-A-L6000*W1250*H650*0232', batchNo: 'JY2606130006', productName: 'FC82', finishedProductNo: 'P18P00-0616NZ', process: '挤压', lineName: '挤压20#线体', frameTime: '2026-06-13 11:53:12', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 3, frameNo: 'CV-A-A-L6000*W1250*H650*0233', batchNo: 'JY2606130030', productName: 'FC51', finishedProductNo: 'P18P01-0B02NZ', process: '挤压', lineName: '挤压16#线体', frameTime: '2026-06-13 11:47:47', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 4, frameNo: 'CV-A-A-L6000*W1250*H650*0234', batchNo: 'JY2606130045', productName: 'FC98', finishedProductNo: 'P18P02-0B07NZ', process: '挤压', lineName: '挤压18#线体', frameTime: '2026-06-13 11:47:29', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 5, frameNo: 'CV-A-A-L6000*W1250*H650*0235', batchNo: 'JY2606120143', productName: 'FC23', finishedProductNo: '13-C001-1367', process: '挤压', lineName: '挤压19#线体', frameTime: '2026-06-13 11:40:51', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 6, frameNo: 'CV-A-A-L6000*W1250*H650*0236', batchNo: 'JY2606130006', productName: 'FC60', finishedProductNo: 'P18P00-0616NZ', process: '挤压', lineName: '挤压20#线体', frameTime: '2026-06-13 11:28:51', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 7, frameNo: 'CV-A-A-L6000*W1250*H650*0237', batchNo: 'JY2606130032', productName: 'FC63', finishedProductNo: 'P13K01-0613NZ', process: '挤压', lineName: '挤压25#线体', frameTime: '2026-06-13 11:14:30', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 8, frameNo: 'CV-A-A-L6000*W1250*H650*0238', batchNo: 'JY2606130031', productName: 'FC75', finishedProductNo: '18-C001-0C34', process: '挤压', lineName: '挤压28#线体', frameTime: '2026-06-13 11:11:58', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 9, frameNo: 'CV-A-A-L6000*W1250*H650*0239', batchNo: 'JY2606130029', productName: 'FC77', finishedProductNo: '18-C001-0C34', process: '挤压', lineName: '挤压28#线体', frameTime: '2026-06-13 11:08:40', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 10, frameNo: 'CV-A-A-L6000*W1250*H650*0240', batchNo: 'JY2606130045', productName: 'FC108', finishedProductNo: 'P18P02-0B07NZ', process: '挤压', lineName: '挤压18#线体', frameTime: '2026-06-13 11:04:46', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 11, frameNo: 'CV-A-A-L6000*W1250*H650*0241', batchNo: 'JY2606130038', productName: 'FC131', finishedProductNo: '18-C002-1753', process: '挤压', lineName: '挤压40#线体', frameTime: '2026-06-13 10:59:38', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 12, frameNo: 'CV-A-A-L6000*W1250*H650*0242', batchNo: 'JY2606120143', productName: 'FC56', finishedProductNo: '13-C001-1367', process: '挤压', lineName: '挤压19#线体', frameTime: '2026-06-13 10:52:44', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' },
  { id: 13, frameNo: 'CV-A-A-L6000*W1250*H650*0243', batchNo: 'JY2606130022', productName: 'FC07', finishedProductNo: '18-C002-1840', process: '挤压', lineName: '挤压26#线体', frameTime: '2026-06-13 10:43:43', inspectionTime: '', exceptionContent: '', handlingMethod: '', latestStatus: 'OK' }
])

const handleSearch = () => {
  ElMessage.success('执行查询')
}
const resetSearch = () => {
  searchForm.value = { dateRange: [], batchNo: '', productName: '', lineName: '' }
}

const ngDialogVisible = ref(false)
const ngFormRef = ref<FormInstance>()
const currentNgRow = ref<any>(null)
const ngForm = ref({
  exceptionContent: '',
  handlingMethod: ''
})
const ngRules = ref<FormRules>({
  exceptionContent: [{ required: true, message: '请输入异常内容', trigger: 'blur' }],
  handlingMethod: [{ required: true, message: '请输入处理方式', trigger: 'blur' }]
})

const handleSingleNG = (row: any) => {
  currentNgRow.value = row
  ngForm.value = {
    exceptionContent: '',
    handlingMethod: ''
  }
  ngDialogVisible.value = true
}

const submitNg = async () => {
  if (!ngFormRef.value) return
  await ngFormRef.value.validate((valid) => {
    if (valid) {
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      if (currentNgRow.value) {
        currentNgRow.value.latestStatus = 'NG'
        currentNgRow.value.inspectionTime = timeStr
        currentNgRow.value.exceptionContent = ngForm.value.exceptionContent
        currentNgRow.value.handlingMethod = ngForm.value.handlingMethod
      }
      
      ElMessage.success('已判定为 NG 并记录异常信息')
      ngDialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
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
  padding: 16px;
  overflow: hidden;
}
.search-bar {
  margin-bottom: 16px;
}
.table-container {
  flex: 1;
  overflow: hidden;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗分区样式 */
.section-title {
  font-size: 15px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin: 20px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.section-title:first-child {
  margin-top: 0;
}
.info-desc {
  margin-bottom: 15px;
}
.result-area, .sign-area {
  background-color: var(--el-fill-color-light);
  padding: 15px 15px 1px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}
</style>
