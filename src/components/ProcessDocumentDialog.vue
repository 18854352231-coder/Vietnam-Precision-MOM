<template>
  <el-dialog
    :model-value="modelValue"
    title="工艺文件查看"
    width="960px"
    top="5vh"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="productNo || productName" class="product-info">
      <span v-if="productNo">产品号：{{ productNo }}</span>
      <span v-if="productName">产品名称：{{ productName }}</span>
    </div>

    <el-radio-group v-model="docType" class="doc-type-group" @change="handleTypeChange">
      <el-radio-button v-for="type in processDocTypes" :key="type" :label="type">
        {{ processDocTypeLabels[type] }}
      </el-radio-button>
    </el-radio-group>

    <el-table :data="tableData" border style="width: 100%; margin-top: 16px" max-height="420">
      <el-table-column prop="code" label="文件编号" width="120" />
      <el-table-column prop="productName" label="关联产品名称" min-width="140" />
      <el-table-column prop="fileName" label="文件名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="version" label="版本" width="80" align="center" />
      <el-table-column v-if="docType === 'SOP'" label="是否裁切" width="100" align="center">
        <template #default="{ row }">
          {{ row.isCutting ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="文件类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.fileCategory === '临时文件' ? 'warning' : 'success'">
            {{ row.fileCategory || '正式文件' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row)">
            {{ getDisplayStatus(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="uploadTime" label="上传时间" width="160" align="center" />
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleView(row)">查看PDF</el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  getDisplayStatus,
  getStatusType,
  loadProcessDocuments,
  processDocTypeLabels,
  processDocTypes,
  type ProcessCategory,
  type ProcessDocType,
  type ProcessDocument
} from '@/utils/processDocuments'

const props = withDefaults(defineProps<{
  modelValue: boolean
  processType?: ProcessCategory
  productNo?: string
  productName?: string
}>(), {
  processType: 'extrusion'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const docType = ref<ProcessDocType>('SOP')
const tableData = ref<ProcessDocument[]>([])

const refreshTableData = () => {
  tableData.value = loadProcessDocuments(props.processType, docType.value)
}

const handleTypeChange = () => {
  refreshTableData()
}

const handleView = (row: ProcessDocument) => {
  ElMessage.info(t('pages.processFiles.messages.previewingFile', { fileName: row.fileName }))
}

watch(
  () => [props.modelValue, props.processType] as const,
  ([visible]) => {
    if (visible) {
      docType.value = 'SOP'
      refreshTableData()
    }
  }
)
</script>

<style scoped>
.product-info {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.doc-type-group {
  display: flex;
  flex-wrap: wrap;
}
</style>
