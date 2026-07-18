<template>
  <div class="page-container">
    <el-card>
      <el-tabs v-model="processType" @tab-change="handleProcessTypeChange">
        <!-- 挤压工艺文件 -->
        <el-tab-pane label="挤压工艺文件" name="extrusion">
          <div class="tab-content">
            <div class="search-bar">
              <el-radio-group v-model="docType" @change="handleTypeChange">
                <el-radio-button label="SOP">SOP (作业指导书)</el-radio-button>
                <el-radio-button label="SIP">SIP (检验标准书)</el-radio-button>
                <el-radio-button label="POP">POP (生产操作流程)</el-radio-button>
                <el-radio-button label="DRAWING">工程图纸</el-radio-button>
                <el-radio-button label="BOM">BOM文件</el-radio-button>
              </el-radio-group>
              <el-input v-model="search" placeholder="产品名称/文件编号" style="width: 200px; margin-left: 20px" clearable />
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button type="primary" style="float: right" @click="handleAdd">新建工艺文件</el-button>
            </div>

            <el-table :data="tableData" border style="width: 100%; margin-top: 20px">
              <el-table-column prop="code" label="文件编号" width="120" />
              <el-table-column prop="productName" label="关联产品名称" />
              <el-table-column prop="fileName" label="文件名称" />
              <el-table-column prop="version" label="版本" width="80" align="center" />
              <el-table-column label="是否进保温炉" width="120" align="center">
                <template #default="scope">
                  <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">{{ scope.row.isHoldingFurnace ? '是' : '否' }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="是否时效" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">{{ scope.row.isAging ? '是' : '否' }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="时效制度" width="160" show-overflow-tooltip>
                <template #default="scope">
                  <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">
                    {{ scope.row.isAging ? (scope.row.agingProgram || '-') : '-' }}
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="是否裁切" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">{{ scope.row.isCutting ? '是' : '否' }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="文件类型" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.fileCategory === '临时文件' ? 'warning' : 'success'">
                    {{ scope.row.fileCategory || '正式文件' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row)">
                    {{ getDisplayStatus(scope.row) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="validUntil" label="有效期至" width="120" align="center">
                <template #default="scope">
                  <span>{{ scope.row.fileCategory === '临时文件' ? scope.row.validUntil : '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="160" align="center" />
              <el-table-column label="操作" width="220" align="center">
                <template #default="scope">
                  <el-button size="small" type="primary" link @click="handleView(scope.row)">查看PDF</el-button>
                  <el-button size="small" type="warning" link @click="handleEdit(scope.row)">修改版本</el-button>
                  <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 铸造工艺文件 -->
        <el-tab-pane label="铸造工艺文件" name="casting">
          <div class="tab-content">
            <div class="search-bar">
              <el-radio-group v-model="docType" @change="handleTypeChange">
                <el-radio-button label="SOP">SOP (作业指导书)</el-radio-button>
                <el-radio-button label="SIP">SIP (检验标准书)</el-radio-button>
                <el-radio-button label="POP">POP (生产操作流程)</el-radio-button>
                <el-radio-button label="DRAWING">工程图纸</el-radio-button>
                <el-radio-button label="BOM">BOM文件</el-radio-button>
              </el-radio-group>
              <el-input v-model="search" placeholder="产品名称/文件编号" style="width: 200px; margin-left: 20px" clearable />
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button type="primary" style="float: right" @click="handleAdd">新建工艺文件</el-button>
            </div>

            <el-table :data="tableData" border style="width: 100%; margin-top: 20px">
              <el-table-column prop="code" label="文件编号" width="120" />
              <el-table-column prop="productName" label="关联产品名称" />
              <el-table-column prop="fileName" label="文件名称" />
              <el-table-column prop="version" label="版本" width="80" align="center" />
              <el-table-column label="是否进保温炉" width="120" align="center">
                <template #default="scope">
                  <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">{{ scope.row.isHoldingFurnace ? '是' : '否' }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="是否时效" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">{{ scope.row.isAging ? '是' : '否' }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="时效制度" width="160" show-overflow-tooltip>
                <template #default="scope">
                  <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">
                    {{ scope.row.isAging ? (scope.row.agingProgram || '-') : '-' }}
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="是否裁切" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.type === 'SOP' || docType === 'SOP'">{{ scope.row.isCutting ? '是' : '否' }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="文件类型" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.fileCategory === '临时文件' ? 'warning' : 'success'">
                    {{ scope.row.fileCategory || '正式文件' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row)">
                    {{ getDisplayStatus(scope.row) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="validUntil" label="有效期至" width="120" align="center">
                <template #default="scope">
                  <span>{{ scope.row.fileCategory === '临时文件' ? scope.row.validUntil : '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="160" align="center" />
              <el-table-column label="操作" width="220" align="center">
                <template #default="scope">
                  <el-button size="small" type="primary" link @click="handleView(scope.row)">查看PDF</el-button>
                  <el-button size="small" type="warning" link @click="handleEdit(scope.row)">修改版本</el-button>
                  <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 新建/编辑工艺文件对话框 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle">
        <el-form :model="form" label-width="120px">
          <el-form-item label="所属工艺">
            <el-radio-group v-model="form.processType" :disabled="isVersionEditMode">
              <el-radio label="extrusion">挤压</el-radio>
              <el-radio label="casting">铸造</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="产品名称">
            <el-select v-model="form.productName" placeholder="选择产品" style="width: 100%" :disabled="isVersionEditMode">
              <el-option label="铝型材-6063" value="铝型材-6063" />
              <el-option label="铝型材-6061" value="铝型材-6061" />
              <el-option label="铝棒-A级" value="铝棒-A级" />
            </el-select>
          </el-form-item>
          <el-form-item label="文件分类">
            <el-radio-group v-model="form.type" :disabled="isVersionEditMode">
              <el-radio label="SOP">SOP</el-radio>
              <el-radio label="SIP">SIP</el-radio>
              <el-radio label="POP">POP</el-radio>
              <el-radio label="DRAWING">工程图纸</el-radio>
              <el-radio label="BOM">BOM文件</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="SOP选项" v-if="form.type === 'SOP'">
            <el-checkbox v-model="form.isHoldingFurnace">是否进入保温炉</el-checkbox>
            <el-checkbox :model-value="form.isAging" @change="handleAgingChange">是否时效</el-checkbox>
            <el-checkbox v-model="form.isCutting">是否裁切</el-checkbox>
          </el-form-item>
          <el-form-item label="时效制度" v-if="form.type === 'SOP' && form.isAging">
            <el-input v-model="form.agingProgram" placeholder="请输入该产品的时效制度" />
          </el-form-item>
          <el-form-item label="文件类型">
            <el-select
              v-model="form.fileCategory"
              placeholder="请选择文件类型"
              style="width: 100%"
              :disabled="isVersionEditMode"
            >
              <el-option label="正式文件" value="正式文件" />
              <el-option label="临时文件" value="临时文件" />
            </el-select>
          </el-form-item>
          <el-form-item label="有效期" v-if="form.fileCategory === '临时文件'">
            <el-date-picker v-model="form.validUntil" type="date" placeholder="选择结束日期" style="width: 100%" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="导入PDF">
            <el-upload
              class="upload-demo"
              drag
              action="#"
              :auto-upload="false"
              multiple
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传 pdf 文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">提交</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import {
  getDisplayStatus,
  getStatusType,
  loadProcessDocuments,
  type ProcessCategory,
  type ProcessDocType
} from '@/utils/processDocuments'

useTaskLiteralDomI18n()

const { t } = useI18n()

const processType = ref('extrusion')
const docType = ref('SOP')
const search = ref('')
const tableData = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新建工艺文件')
const isVersionEditMode = ref(false)
const form = ref({
  processType: 'extrusion',
  productName: '',
  type: 'SOP',
  isAging: false,
  agingProgram: '',
  isCutting: false,
  isHoldingFurnace: false,
  fileCategory: '正式文件',
  validUntil: '',
  files: []
})

const handleAgingChange = (checked: string | number | boolean) => {
  form.value.isAging = Boolean(checked)
  if (!form.value.isAging) {
    form.value.agingProgram = ''
  }
}

const handleProcessTypeChange = (name: any) => {
  processType.value = name as string
  loadTableData()
}

const handleTypeChange = (type: any) => {
  docType.value = type as string
  loadTableData()
}

const loadTableData = () => {
  tableData.value = loadProcessDocuments(
    processType.value as ProcessCategory,
    docType.value as ProcessDocType
  )
}

const handleSearch = () => {
  loadTableData()
}

const handleAdd = () => {
  dialogTitle.value = '新建工艺文件'
  isVersionEditMode.value = false
  form.value = {
    processType: processType.value,
    productName: '',
    type: docType.value,
    isAging: false,
    agingProgram: '',
    isCutting: false,
    isHoldingFurnace: false,
    fileCategory: '正式文件',
    validUntil: '',
    files: []
  }
  dialogVisible.value = true
}

const handleView = (row: any) => {
  ElMessage.info(t('pages.processFiles.messages.previewingFile', { fileName: row.fileName }))
}

const handleEdit = (row: any) => {
  dialogTitle.value = '修改工艺文件版本'
  isVersionEditMode.value = true
  form.value = {
    processType: processType.value,
    productName: row.productName,
    type: row.type || docType.value,
    isAging: row.isAging || false,
    agingProgram: row.agingProgram || '',
    isCutting: row.isCutting || false,
    isHoldingFurnace: row.isHoldingFurnace || false,
    fileCategory: row.fileCategory || '正式文件',
    validUntil: row.validUntil || '',
    files: []
  }
  dialogVisible.value = true
}

const handleSave = () => {
  if (form.value.type === 'SOP' && form.value.isAging && !form.value.agingProgram.trim()) {
    ElMessage.warning(t('pages.processFiles.messages.agingProgramRequired'))
    return
  }

  if (form.value.type !== 'SOP' || !form.value.isAging) {
    form.value.agingProgram = ''
  }

  ElMessage.success(t('pages.processFiles.messages.saveSuccess'))
  dialogVisible.value = false
  isVersionEditMode.value = false
  loadTableData()
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(t('pages.processFiles.messages.deleteConfirm', { fileName: row.fileName }), t('literal.警告'), {
    type: 'warning'
  }).then(() => {
    ElMessage.success(t('pages.processFiles.messages.deleteSuccess'))
    loadTableData()
  })
}

onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.tab-content {
  padding-top: 10px;
}
.search-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 7px;
}
</style>
