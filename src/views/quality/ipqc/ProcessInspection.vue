<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <span>{{ route.meta.titleKey ? t(route.meta.titleKey as string) : (route.meta.title || '制程检验') }}</span>
          <el-button v-if="currentTab !== 'review'" type="primary" size="small" @click="openAddDialog">新增检验记录</el-button>
        </div>
      </template>

      <el-tabs v-model="currentTab" class="process-tabs">
        <el-tab-pane label="检验记录" name="records" />
        <el-tab-pane label="班长审核" name="review" />
      </el-tabs>

      <el-table :data="filteredTableData" border style="width: 100%" height="calc(100vh - 280px)">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="inspectionNo" label="质检单号" width="170" show-overflow-tooltip />
        <el-table-column prop="batchNo" label="批次号" width="150" show-overflow-tooltip />
        <el-table-column prop="productName" label="产品名称" width="160" show-overflow-tooltip />
        <el-table-column prop="moldNo" label="模具编号" width="140" show-overflow-tooltip />
        <el-table-column prop="lineName" label="线体名称" width="130" show-overflow-tooltip />
        <el-table-column prop="generateTime" label="生成时间" width="160" align="center" />
        <el-table-column prop="inspector" label="质检人" width="90" align="center" />
        <el-table-column prop="updateTime" label="更新时间" width="160" align="center" />
        <el-table-column prop="inspectionCount" label="检验次数" width="90" align="center" />
        <el-table-column prop="result" label="检验结果" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.result" :type="row.result === '合格' ? 'success' : 'danger'">{{ t(getStatusKey(row.result)) }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="completionStatus" label="完成状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.completionStatus === '已完成' ? 'success' : row.completionStatus === '待班长审核' ? 'warning' : 'info'">
              {{ t(getStatusKey(row.completionStatus)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              v-if="currentTab === 'review'"
              link
              type="warning"
              size="small"
              @click="openLeaderReviewDialog(row)"
            >
              审核
            </el-button>
            <el-button link type="primary" size="small" @click="openInspectDialog(row)" v-else-if="row.completionStatus === '未完成'">
              质检
            </el-button>
            <el-button link type="info" size="small" @click="viewDetail(row)" v-else>
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 新增或执行检测弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '新增检验记录' : '执行质检'" width="800px" top="5vh">
        <el-form :model="formData" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="质检单号">
                <el-input v-model="formData.inspectionNo" :disabled="dialogMode === 'inspect'" placeholder="手动输入或自动生成" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检验工序" required>
                <el-select v-model="formData.process" style="width: 100%" :disabled="dialogMode === 'inspect'" @change="handleProcessChange">
                  <el-option label="挤压" value="挤压" />
                  <el-option label="时效" value="时效" />
                  <el-option label="裁切上料" value="裁切上料" />
                  <el-option label="裁切" value="裁切" />
                  <el-option label="预包装" value="预包装" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="批次号" required>
                <el-input v-model="formData.batchNo" :disabled="dialogMode === 'inspect'" placeholder="请输入批次号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品名称" required>
                <el-input v-model="formData.productName" :disabled="dialogMode === 'inspect'" placeholder="请输入产品名称" @blur="fetchProductRules" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模具编号">
                <el-input v-model="formData.moldNo" :disabled="dialogMode === 'inspect'" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="线体名称">
                <el-input v-model="formData.lineName" :disabled="dialogMode === 'inspect'" />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="rule-section">
            <div class="section-title">检验项目及判定</div>
            <div v-if="formData.rules && formData.rules.length > 0">
              <el-table :data="formData.rules" border size="small">
                <el-table-column label="检验项目" prop="item" width="120" />
                <el-table-column label="标准值" width="120" align="center">
                  <template #default="{ row }">
                    {{ row.standard }} ± {{ row.tolerance }}
                  </template>
                </el-table-column>
                <el-table-column label="单位" prop="unit" width="60" align="center" />
                <el-table-column label="实际测量值" align="center">
                  <template #default="{ row }">
                    <el-input-number v-model="row.actualValue" :controls="false" size="small" style="width: 100%" @change="calculateResult" placeholder="输入测量值" />
                  </template>
                </el-table-column>
                <el-table-column label="判定" width="70" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getItemStatus(row) === 'OK' ? 'success' : (getItemStatus(row) === 'NG' ? 'danger' : 'info')">
                      {{ getInspectionStatusLabel(getItemStatus(row)) || '-' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="no-rules">
              该产品在此工序暂未配置检验规则，请输入有效的产品编号
            </div>
          </div>

          <el-form-item label="综合判定" required>
            <el-radio-group v-model="formData.result" disabled>
              <el-radio label="合格">合格</el-radio>
              <el-radio label="不合格">不合格</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitRecord">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="reviewDialogVisible" title="班长审核" width="900px" top="5vh">
        <el-descriptions border :column="2" style="margin-bottom: 20px">
          <el-descriptions-item label="质检单号">{{ reviewForm.inspectionNo }}</el-descriptions-item>
          <el-descriptions-item label="检验工序">{{ reviewForm.process }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ reviewForm.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ reviewForm.productName }}</el-descriptions-item>
          <el-descriptions-item label="质检结果">{{ reviewForm.result }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">检测项目审核</div>
        <el-table :data="reviewForm.inspectionItems" border size="small">
          <el-table-column label="检验项目" prop="item" width="120" />
          <el-table-column label="标准值" width="120" align="center">
            <template #default="{ row }">
              {{ row.standard }} ± {{ row.tolerance }}
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" width="60" align="center" />
          <el-table-column label="实际测量值" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.actualValue"
                :controls="false"
                size="small"
                style="width: 100%"
                @change="calculateReviewResult"
              />
            </template>
          </el-table-column>
          <el-table-column label="单项判定" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'OK' ? 'success' : row.status === 'NG' ? 'danger' : 'info'">
                {{ getInspectionStatusLabel(row.status) || '-' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <template #footer>
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitLeaderReview">提交审核</el-button>
        </template>
      </el-dialog>

      <!-- 查看详情弹窗 -->
      <el-dialog v-model="detailVisible" title="检验详情" width="800px" top="5vh">
        <el-descriptions border :column="2" style="margin-bottom: 20px">
          <el-descriptions-item label="质检单号">{{ detailData.inspectionNo }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ detailData.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ detailData.productName }}</el-descriptions-item>
          <el-descriptions-item label="模具编号">{{ detailData.moldNo }}</el-descriptions-item>
          <el-descriptions-item label="线体名称">{{ detailData.lineName }}</el-descriptions-item>
          <el-descriptions-item label="检验工序">{{ detailData.process }}</el-descriptions-item>
          <el-descriptions-item label="综合判定">
            <el-tag :type="detailData.result === '合格' ? 'success' : 'danger'">{{ t(getStatusKey(detailData.result)) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="检验次数">{{ detailData.inspectionCount }}</el-descriptions-item>
          <el-descriptions-item label="生成时间">{{ detailData.generateTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="质检人">{{ detailData.inspector }}</el-descriptions-item>
          <el-descriptions-item label="班长">{{ detailData.leaderReviewer || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ detailData.leaderReviewTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ detailData.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">检测数据明细</div>
        <el-table :data="detailData.rules || []" border size="small">
          <el-table-column label="检验项目" prop="item" width="120" />
          <el-table-column label="标准值" width="120" align="center">
            <template #default="{ row }">
              {{ row.standard }} ± {{ row.tolerance }}
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" width="60" align="center" />
          <el-table-column label="实际测量值" prop="actualValue" align="center" />
          <el-table-column label="单项判定" width="70" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'OK' ? 'success' : 'danger'">{{ getInspectionStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <template #footer>
          <el-button type="primary" @click="detailVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { getStatusKey } from '@/utils/statusI18n'

useTaskLiteralDomI18n()

const { t } = useI18n()
const route = useRoute()

const currentTab = ref('records')
const activeTab = ref((route.meta.processName as string) || '挤压')

watch(
  () => route.meta.processName,
  (newVal) => {
    if (newVal) {
      activeTab.value = newVal as string
      currentTab.value = 'records'
    }
  }
)

const tableData = ref([
  { id: 1, inspectionNo: 'IPQC-20260424-101', batchNo: 'JY260424001', productName: 'FC63', moldNo: 'M18-001', lineName: 'JY-29', generateTime: '2026-04-24 08:00:00', inspector: '', updateTime: '', inspectionCount: 0, result: '', completionStatus: '未完成', process: '挤压', remark: '', leaderReviewer: '', leaderReviewTime: '', inspectionItems: [] },
  {
    id: 2,
    inspectionNo: 'IPQC-20260424-102',
    batchNo: 'BZ260424001',
    productName: 'FC54',
    moldNo: 'M18-002',
    lineName: '包装1线',
    generateTime: '2026-04-24 09:00:00',
    inspector: '张三',
    updateTime: '2026-04-24 10:30:00',
    inspectionCount: 1,
    result: '合格',
    completionStatus: '待班长审核',
    process: '预包装',
    remark: '待班长复核外观',
    leaderReviewer: '',
    leaderReviewTime: '',
    inspectionItems: [
      { item: '外观', standard: 0, tolerance: 0, unit: '-', actualValue: 0, status: 'OK' }
    ]
  },
  {
    id: 3,
    inspectionNo: 'IPQC-20260424-201',
    batchNo: 'SX260424001',
    productName: 'FC63',
    moldNo: 'M18-001',
    lineName: '1号炉',
    generateTime: '2026-04-24 11:00:00',
    inspector: '李四',
    updateTime: '2026-04-24 11:35:00',
    inspectionCount: 1,
    result: '合格',
    completionStatus: '待班长审核',
    process: '时效',
    remark: '硬度达标',
    leaderReviewer: '',
    leaderReviewTime: '',
    inspectionItems: [
      { item: '硬度', standard: 12, tolerance: 2, unit: 'HW', actualValue: 12, status: 'OK' }
    ]
  },
  { id: 4, inspectionNo: 'IPQC-20260424-301', batchNo: 'CQ260424001', productName: 'FC137', moldNo: 'M18-001', lineName: '裁切1线', generateTime: '2026-04-24 14:00:00', inspector: '', updateTime: '', inspectionCount: 0, result: '', completionStatus: '未完成', process: '裁切', remark: '', leaderReviewer: '', leaderReviewTime: '', inspectionItems: [] },
  { id: 5, inspectionNo: 'IPQC-20260424-401', batchNo: 'BZ260424002', productName: 'FC70', moldNo: 'M18-002', lineName: '包装2线', generateTime: '2026-04-24 16:00:00', inspector: '', updateTime: '', inspectionCount: 0, result: '', completionStatus: '未完成', process: '预包装', remark: '', leaderReviewer: '', leaderReviewTime: '', inspectionItems: [] }
])

const filteredTableData = computed(() => {
  const processData = tableData.value.filter(item => item.process === activeTab.value)
  if (currentTab.value === 'review') {
    return processData.filter(item => item.completionStatus === '待班长审核')
  }
  return processData
})

// 模拟从产品检验配置导入的规则数据
const productRulesConfig: Record<string, Record<string, any[]>> = {
  '定制铝型材A款': {
    '挤压IPQC': [
      { item: '长度', standard: 6000, tolerance: 5, unit: 'mm' },
      { item: '壁厚', standard: 2.5, tolerance: 0.2, unit: 'mm' }
    ],
    '时效IPQC': [
      { item: '硬度', standard: 12, tolerance: 2, unit: 'HW' }
    ],
    '裁切IPQC': [
      { item: '长度', standard: 3000, tolerance: 2, unit: 'mm' }
    ]
  },
  '标准边框型材': {
    '挤压IPQC': [
      { item: '长度', standard: 5800, tolerance: 3, unit: 'mm' },
      { item: '表面平整度', standard: 0.5, tolerance: 0.1, unit: 'mm/m' }
    ],
    '预包装IPQC': [
      { item: '外观', standard: 0, tolerance: 0, unit: '-' }
    ]
  }
}

const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' 或 'inspect'
const formData = ref({
  id: 0,
  inspectionNo: '',
  process: '',
  batchNo: '',
  productName: '',
  moldNo: '',
  lineName: '',
  rules: [] as any[],
  result: '合格',
  remark: '',
  leaderReviewer: '',
  leaderReviewTime: '',
  inspectionItems: [] as any[]
})

const detailVisible = ref(false)
const detailData = ref<any>({})
const reviewDialogVisible = ref(false)
const reviewForm = ref({
  id: 0,
  inspectionNo: '',
  process: '',
  batchNo: '',
  productName: '',
  result: '',
  inspectionItems: [] as any[]
})

const getInspectionStatusLabel = (status: string) => {
  if (status === 'OK') {
    return t('status.pass')
  }

  if (status === 'NG') {
    return t('status.fail')
  }

  return status
}

const getItemStatus = (row: any) => {
  if (row.actualValue === undefined || row.actualValue === null) return ''
  const val = Number(row.actualValue)
  if (val >= (row.standard - row.tolerance) && val <= (row.standard + row.tolerance)) {
    return 'OK'
  }
  return 'NG'
}

const calculateResult = () => {
  let isAllOk = true
  for (const rule of formData.value.rules) {
    if (getItemStatus(rule) === 'NG') {
      isAllOk = false
      break
    }
    if (getItemStatus(rule) === '') {
      isAllOk = true // 还没填完默认合格或者先不判断
    }
  }
  formData.value.result = isAllOk ? '合格' : '不合格'
}

const fetchProductRules = () => {
  if (!formData.value.productName || !formData.value.process) return
  
  const processKey = formData.value.process + 'IPQC'
  const rulesMap = productRulesConfig[formData.value.productName]
  
  if (rulesMap && rulesMap[processKey]) {
    formData.value.rules = JSON.parse(JSON.stringify(rulesMap[processKey]))
  } else {
    formData.value.rules = []
  }
}

const handleProcessChange = () => {
  fetchProductRules()
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  formData.value = {
    id: 0,
    inspectionNo: `IPQC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 900 + 100)}`,
    process: activeTab.value,
    batchNo: '',
    productName: '',
    moldNo: '',
    lineName: '',
    rules: [],
    result: '合格',
    remark: '',
    leaderReviewer: '',
    leaderReviewTime: '',
    inspectionItems: []
  }
  dialogVisible.value = true
}

const openInspectDialog = (row: any) => {
  dialogMode.value = 'inspect'
  formData.value = {
    id: row.id,
    inspectionNo: row.inspectionNo,
    process: row.process,
    batchNo: row.batchNo,
    productName: row.productName,
    moldNo: row.moldNo,
    lineName: row.lineName,
    rules: [],
    result: '合格',
    remark: row.remark || '',
    leaderReviewer: row.leaderReviewer || '',
    leaderReviewTime: row.leaderReviewTime || '',
    inspectionItems: row.inspectionItems || []
  }
  fetchProductRules()
  dialogVisible.value = true
}

const openLeaderReviewDialog = (row: any) => {
  reviewForm.value = {
    id: row.id,
    inspectionNo: row.inspectionNo,
    process: row.process,
    batchNo: row.batchNo,
    productName: row.productName,
    result: row.result,
    inspectionItems: JSON.parse(JSON.stringify(row.inspectionItems || []))
  }
  reviewDialogVisible.value = true
}

const calculateReviewResult = () => {
  reviewForm.value.inspectionItems = reviewForm.value.inspectionItems.map(item => ({
    ...item,
    status: getItemStatus(item)
  }))

  const hasNg = reviewForm.value.inspectionItems.some(item => item.status === 'NG')
  reviewForm.value.result = hasNg ? '不合格' : '合格'
}

const viewDetail = (row: any) => {
  detailData.value = {
    ...row,
    remark: row.remark || '无异常',
    leaderReviewer: row.leaderReviewer || '',
    leaderReviewTime: row.leaderReviewTime || '',
    rules: JSON.parse(JSON.stringify(row.inspectionItems || []))
  }
  detailVisible.value = true
}

const submitRecord = () => {
  if (!formData.value.productName || formData.value.rules.length === 0) {
    ElMessage.warning(t('pages.processInspection.messages.invalidProductOrRules'))
    return
  }

  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const inspectionItems = formData.value.rules.map(rule => ({
    ...rule,
    status: getItemStatus(rule)
  }))

  if (dialogMode.value === 'add') {
    tableData.value.unshift({
      id: Date.now(),
      inspectionNo: formData.value.inspectionNo,
      batchNo: formData.value.batchNo,
      productName: formData.value.productName,
      moldNo: formData.value.moldNo,
      lineName: formData.value.lineName,
      process: formData.value.process,
      generateTime: timeStr,
      updateTime: timeStr,
      inspectionCount: 1,
      completionStatus: '待班长审核',
      inspector: '当前用户',
      result: formData.value.result,
      remark: formData.value.remark,
      leaderReviewer: '',
      leaderReviewTime: '',
      inspectionItems
    })
  } else {
    const target = tableData.value.find(item => item.id === formData.value.id)
    if (target) {
      target.completionStatus = '待班长审核'
      target.result = formData.value.result
      target.inspector = '当前用户'
      target.updateTime = timeStr
      target.inspectionCount = (target.inspectionCount || 0) + 1
      target.remark = formData.value.remark
      target.leaderReviewer = ''
      target.leaderReviewTime = ''
      target.inspectionItems = inspectionItems
    }
  }
  
  ElMessage.success(t('pages.processInspection.messages.saveSuccess'))
  dialogVisible.value = false
}

const submitLeaderReview = () => {
  const target = tableData.value.find(item => item.id === reviewForm.value.id)
  if (!target) {
    ElMessage.warning(t('pages.processInspection.messages.recordMissing'))
    return
  }

  if (target.completionStatus !== '待班长审核') {
    ElMessage.warning(t('pages.processInspection.messages.leaderReviewUnavailable'))
    return
  }

  if (!reviewForm.value.inspectionItems.length) {
    ElMessage.warning(t('pages.processInspection.messages.missingInspectionItems'))
    return
  }

  calculateReviewResult()

  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  target.result = reviewForm.value.result
  target.inspectionItems = JSON.parse(JSON.stringify(reviewForm.value.inspectionItems))
  target.completionStatus = '已完成'
  target.leaderReviewer = '当前班长'
  target.leaderReviewTime = timeStr
  target.updateTime = timeStr

  ElMessage.success(t('pages.processInspection.messages.leaderReviewSuccess'))
  reviewDialogVisible.value = false
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
  padding: 0 16px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
.process-tabs {
  margin-top: 10px;
  margin-bottom: 10px;
}
.rule-section {
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
}
.section-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-size: 14px;
}
.no-rules {
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 20px 0;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
