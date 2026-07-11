<template>
  <div class="page-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <!-- 1. 规则管理 -->
        <el-tab-pane label="规则管理" name="ruleManage">
          <div class="tab-header">
            <span class="tab-title">编码规则名称与适用产品</span>
            <el-button type="primary" @click="handleAddRule">新建规则</el-button>
          </div>
          <el-table :data="ruleList" border style="width: 100%; margin-top: 15px">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="ruleName" label="规则名称" width="200" />
            <el-table-column prop="products" label="适用产品">
              <template #default="scope">
                <el-tag v-for="p in scope.row.products" :key="p" size="small" class="product-tag">{{ p }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="format" label="编码规则预览" min-width="250">
              <template #default="scope">
                <el-tag v-if="scope.row.format && scope.row.format.length > 0" type="success" size="small" effect="plain" class="preview-tag">
                  {{ getRulePreview(scope.row) }}
                </el-tag>
                <span v-else class="empty-tip-text">未配置拼接规则</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="handleEditRule(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" link @click="handleDeleteRule(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 2. 通用元素转码 -->
        <el-tab-pane label="通用元素转码" name="elementTranscode">
          <el-tabs v-model="activeElementTab" class="sub-tabs">
            <el-tab-pane v-for="el in predefinedElements" :key="el" :label="el" :name="el" />
          </el-tabs>

          <div class="element-toolbar">
            <span class="search-label">{{ activeElementTab }}</span>
            <el-input v-model="elementSearchValue" placeholder="请输入" clearable style="width: 150px" />
            <el-button @click="elementSearchValue = ''">重置</el-button>
            <el-button type="primary">搜索</el-button>
            <el-button type="primary" @click="openMappingDialog()">新增</el-button>
            <el-button type="danger" @click="deleteSelectedElements" :disabled="selectedElements.length === 0">删除</el-button>
          </div>

          <el-table :data="currentElementValues" style="width: 100%; margin-top: 15px" @selection-change="handleElementSelectionChange" row-key="id">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column type="expand">
              <template #default="scope">
                <div class="expanded-mapping-list">
                  <div class="mapping-row" v-for="(m, i) in scope.row.mappings" :key="i">
                    <div class="col-offset"></div>
                    <div class="col-rule">{{ m.ruleName }}</div>
                    <div class="col-code">{{ m.code }}</div>
                    <div class="col-action"></div>
                  </div>
                  <div v-if="!scope.row.mappings || scope.row.mappings.length === 0" class="empty-mapping">
                    暂无规则代号映射
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="value" :label="activeElementTab" width="150" />
            <el-table-column label="规则名称" />
            <el-table-column label="代号" width="200" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="openMappingDialog(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 3. 编码规则拼接 -->
        <el-tab-pane label="编码规则拼接" name="ruleBuilder">
          <div class="builder-container">
            <div class="builder-header">
              <el-form inline>
                <el-form-item label="选择规则名称:">
                  <el-select v-model="selectedRuleId" placeholder="请选择要配置的规则" style="width: 250px" @change="handleRuleSelect">
                    <el-option v-for="r in ruleList" :key="r.id" :label="r.ruleName" :value="r.id" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveRuleFormat" :disabled="!selectedRuleId">保存规则拼接</el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div class="drag-workspace" v-if="selectedRuleId">
              <!-- 左侧可用元素 -->
              <div class="elements-pool">
                <div class="pool-title">可用元素 (拖拽至右侧)</div>
                <div class="pool-list">
                  <div 
                    class="drag-item separator-item" 
                    draggable="true" 
                    @dragstart="onDragStart($event, { type: 'separator', name: '-', code: '-' })"
                  >
                    [-] 分隔符
                  </div>
                  <div 
                    v-for="el in predefinedElements" 
                    :key="el" 
                    class="drag-item" 
                    draggable="true" 
                    @dragstart="onDragStart($event, { type: 'element', name: el, code: '{' + el + '}' })"
                  >
                    {{ el }}
                  </div>
                </div>
              </div>
              
              <!-- 右侧拼接区 -->
              <div class="spliced-rule">
                <div class="pool-title">已拼接规则 (拖拽至此处)</div>
                <div 
                  class="drop-zone" 
                  @dragover.prevent="onDragOver" 
                  @drop="onDrop"
                  :class="{ 'is-dragover': isDragOver }"
                  @dragenter.prevent="isDragOver = true"
                  @dragleave.prevent="isDragOver = false"
                >
                  <div v-if="currentRuleFormat.length === 0" class="empty-tip">请将左侧元素拖入此处</div>
                  <div class="rule-parts-container">
                    <div 
                      v-for="(item, index) in currentRuleFormat" 
                      :key="index" 
                      class="rule-part"
                      :class="item.type === 'separator' ? 'part-separator' : 'part-element'"
                    >
                      <span class="part-name">{{ item.name }}</span>
                      <el-icon class="remove-icon" @click="removeRulePart(index)"><Close /></el-icon>
                    </div>
                  </div>
                </div>
                <div class="preview-area" v-if="currentRuleFormat.length > 0">
                  <strong>二维码规则预览：</strong>
                  <div class="preview-text">{{ previewRule }}</div>
                </div>
              </div>
            </div>
            <el-empty v-else description="请先在上方选择一个规则名称进行拼接配置" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 规则管理弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="ruleDialogTitle" width="500px">
      <el-form :model="ruleForm" :rules="ruleRules" ref="ruleFormRef" label-width="100px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="例如：挤压通用打码规则" />
        </el-form-item>
        <el-form-item label="适用产品" prop="products">
          <el-select v-model="ruleForm.products" multiple placeholder="请选择适用产品" style="width: 100%">
            <el-option v-for="p in availableProducts" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRule">确定</el-button>
      </template>
    </el-dialog>

    <!-- 元素转码弹窗 (新) -->
    <el-dialog v-model="mappingDialogVisible" :title="`编辑${activeElementTab}规则`" width="800px">
      <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
        <span style="width: 50px">{{ activeElementTab }}</span>
        <el-input v-model="mappingForm.value" style="width: 200px" />
      </div>
      <div style="margin-bottom: 10px; font-weight: bold;">规则</div>
      <el-table :data="mappingForm.mappings" border size="small">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="规则名称">
          <template #default="scope">
            <el-select v-model="scope.row.ruleId" @change="onRuleChange(scope.row)" style="width: 100%" placeholder="请选择规则">
              <el-option v-for="r in ruleList" :key="r.id" :label="r.ruleName" :value="r.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="代号" width="200">
          <template #default="scope">
            <el-input v-model="scope.row.code" placeholder="输入代号" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="addMappingRow(scope.$index)" style="font-size: 18px;">+</el-button>
            <el-button link type="danger" @click="removeMappingRow(scope.$index)" style="font-size: 16px;">🗑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="mappingForm.mappings.length === 0" style="margin-top: 10px;">
        <el-button type="primary" plain size="small" @click="addMappingRow(-1)">添加规则映射</el-button>
      </div>
      <template #footer>
        <el-button @click="mappingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMapping">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const activeTab = ref('ruleManage')

// --- 规则管理 ---
interface RuleItem {
  id: number
  ruleName: string
  products: string[]
  format: Array<{ type: string, name: string, code: string }>
}
const ruleList = ref<RuleItem[]>([
  { id: 1, ruleName: '手机项目 (厂外)-编码规则38位', products: ['电子类产品X'], format: [] },
  { id: 2, ruleName: 'A客户 (笔电)-编码规则53位', products: ['铝型材-6063'], format: [] },
  { id: 3, ruleName: '戴尔客户-编码规则40位', products: ['铝型材-6061'], format: [] }
])

const availableProducts = ['铝型材-6063', '铝型材-6061', '铝棒-A级', '铝棒-B级', '电子类产品X', '交通类产品Y']

const ruleDialogVisible = ref(false)
const ruleDialogTitle = ref('')
const ruleFormRef = ref()
const ruleForm = ref({ id: 0, ruleName: '', products: [] as string[] })
const ruleRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  products: [{ type: 'array', required: true, message: '请选择至少一个适用产品', trigger: 'change' }]
}

const handleAddRule = () => {
  ruleDialogTitle.value = '新建编码规则'
  ruleForm.value = { id: 0, ruleName: '', products: [] }
  ruleDialogVisible.value = true
}

const handleEditRule = (row: RuleItem) => {
  ruleDialogTitle.value = '编辑编码规则'
  ruleForm.value = { ...row, products: [...row.products] }
  ruleDialogVisible.value = true
}

const handleDeleteRule = (row: RuleItem) => {
  ElMessageBox.confirm(`确认删除规则 [${row.ruleName}] 吗?`, '提示', { type: 'warning' }).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    if (selectedRuleId.value === row.id) selectedRuleId.value = null
    ElMessage.success('删除成功')
  })
}

const submitRule = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (ruleForm.value.id === 0) {
        ruleList.value.push({
          id: Date.now(),
          ruleName: ruleForm.value.ruleName,
          products: [...ruleForm.value.products],
          format: []
        })
      } else {
        const target = ruleList.value.find(r => r.id === ruleForm.value.id)
        if (target) {
          target.ruleName = ruleForm.value.ruleName
          target.products = [...ruleForm.value.products]
        }
      }
      ElMessage.success('保存成功')
      ruleDialogVisible.value = false
    }
  })
}

const getRulePreview = (row: RuleItem) => {
  if (!row.format || row.format.length === 0) return ''
  return row.format.map(item => item.code).join('')
}

// --- 通用元素转码 ---
const predefinedElements = [
  '铸件供应商', '挤压件供应商', '铸造线', '铸造批号', '均质炉', '均质流水', '均质位置', '铸造盘位置', '锯切机台', '锯切流水', '合金代号', '年', '月', '日', 
  '挤压型材代号', '挤压机', '挤型位置', '模具号', '棒号', '棒径', '线材规格', 
  '车间', '时效炉', '时效批次', '退火炉', '镭雕机', '固定值', '占位符'
]
const activeElementTab = ref(predefinedElements[7]) // Default to '月'
const elementSearchValue = ref('')
const selectedElements = ref<any[]>([])

interface MappingRow {
  ruleId: number | null
  ruleName: string
  code: string
}
interface ElementValueItem {
  id: number
  value: string
  mappings: MappingRow[]
}

const elementData = ref<Record<string, ElementValueItem[]>>({
  '月': [
    {
      id: 1,
      value: '12',
      mappings: [
        { ruleId: 1, ruleName: '手机项目 (厂外)-编码规则38位', code: 'S' },
        { ruleId: 2, ruleName: 'A客户 (笔电)-编码规则53位', code: 'S' },
        { ruleId: 3, ruleName: '戴尔客户-编码规则40位', code: 'D' }
      ]
    },
    { id: 2, value: '11', mappings: [] },
    { id: 3, value: '10', mappings: [] },
    { id: 4, value: '09', mappings: [] }
  ]
})

const currentElementValues = computed(() => {
  const list = elementData.value[activeElementTab.value] || []
  if (elementSearchValue.value) {
    return list.filter(item => item.value.includes(elementSearchValue.value))
  }
  return list
})

const handleElementSelectionChange = (val: any[]) => {
  selectedElements.value = val
}

const deleteSelectedElements = () => {
  ElMessageBox.confirm(`确认删除选中的 ${selectedElements.value.length} 项记录吗?`, '提示', { type: 'warning' }).then(() => {
    const idsToDelete = selectedElements.value.map(item => item.id)
    elementData.value[activeElementTab.value] = elementData.value[activeElementTab.value].filter(
      item => !idsToDelete.includes(item.id)
    )
    selectedElements.value = []
    ElMessage.success('删除成功')
  })
}

// 映射编辑弹窗
const mappingDialogVisible = ref(false)
const mappingForm = ref<{ id: number, value: string, mappings: MappingRow[] }>({ id: 0, value: '', mappings: [] })

const openMappingDialog = (row?: ElementValueItem) => {
  if (row) {
    mappingForm.value = {
      id: row.id,
      value: row.value,
      mappings: JSON.parse(JSON.stringify(row.mappings))
    }
  } else {
    mappingForm.value = {
      id: 0,
      value: '',
      mappings: []
    }
  }
  mappingDialogVisible.value = true
}

const onRuleChange = (row: MappingRow) => {
  const r = ruleList.value.find(item => item.id === row.ruleId)
  if (r) {
    row.ruleName = r.ruleName
  }
}

const addMappingRow = (index: number) => {
  const newRow = { ruleId: null, ruleName: '', code: '' }
  if (index === -1) {
    mappingForm.value.mappings.push(newRow)
  } else {
    mappingForm.value.mappings.splice(index + 1, 0, newRow)
  }
}

const removeMappingRow = (index: number) => {
  mappingForm.value.mappings.splice(index, 1)
}

const saveMapping = () => {
  if (!mappingForm.value.value) {
    ElMessage.warning(`请输入${activeElementTab.value}的值`)
    return
  }
  const hasEmptyRule = mappingForm.value.mappings.some(m => !m.ruleId)
  if (hasEmptyRule) {
    ElMessage.warning('请为所有映射选择规则名称')
    return
  }

  if (!elementData.value[activeElementTab.value]) {
    elementData.value[activeElementTab.value] = []
  }
  
  const list = elementData.value[activeElementTab.value]
  if (mappingForm.value.id === 0) {
    list.push({
      id: Date.now(),
      value: mappingForm.value.value,
      mappings: [...mappingForm.value.mappings]
    })
  } else {
    const target = list.find(item => item.id === mappingForm.value.id)
    if (target) {
      target.value = mappingForm.value.value
      target.mappings = [...mappingForm.value.mappings]
    }
  }
  ElMessage.success('保存成功')
  mappingDialogVisible.value = false
}


// --- 规则拼接配置 ---
const selectedRuleId = ref<number | null>(null)
const currentRuleFormat = ref<Array<{ type: string, name: string, code: string }>>([])
const isDragOver = ref(false)

const handleRuleSelect = (val: number) => {
  const target = ruleList.value.find(r => r.id === val)
  if (target) {
    currentRuleFormat.value = [...(target.format || [])]
  }
}

const onDragStart = (event: DragEvent, item: { type: string, name: string, code: string }) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(item))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const onDragOver = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const onDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer) {
    const data = event.dataTransfer.getData('application/json')
    if (data) {
      try {
        const item = JSON.parse(data)
        currentRuleFormat.value.push(item)
      } catch (e) {
        console.error('Drop parsing error', e)
      }
    }
  }
}

const removeRulePart = (index: number) => {
  currentRuleFormat.value.splice(index, 1)
}

const saveRuleFormat = () => {
  const target = ruleList.value.find(r => r.id === selectedRuleId.value)
  if (target) {
    target.format = [...currentRuleFormat.value]
    ElMessage.success(`规则 [${target.ruleName}] 拼接已保存`)
  }
}

const previewRule = computed(() => {
  return currentRuleFormat.value.map(item => item.code).join('')
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.el-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
:deep(.el-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
:deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
}
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.tab-title {
  font-size: 16px;
  font-weight: bold;
}
.product-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

/* 元素转码样式 */
.sub-tabs {
  margin-bottom: 15px;
}
.element-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}
.search-label {
  font-weight: bold;
  color: var(--el-text-color-regular);
}
.expanded-mapping-list {
  padding: 0;
}
.mapping-row {
  display: flex;
  border-bottom: 1px solid var(--el-border-color-lighter);
  align-items: center;
}
.mapping-row:last-child {
  border-bottom: none;
}
.col-offset {
  width: 265px; /* selection(55) + expand(48) + index(60) + value(150) + padding */
  flex-shrink: 0;
}
.col-rule {
  flex: 1;
  padding: 8px 12px;
  color: var(--el-text-color-regular);
}
.col-code {
  width: 200px;
  padding: 8px 12px;
  color: var(--el-text-color-regular);
  flex-shrink: 0;
}
.col-action {
  width: 120px;
  flex-shrink: 0;
}
.empty-mapping {
  padding: 15px;
  text-align: center;
  color: #999;
}

/* 拼接构建器样式 */
.builder-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.builder-header {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 15px;
}
.drag-workspace {
  display: flex;
  gap: 20px;
  height: calc(100vh - 280px);
  min-height: 400px;
}
.elements-pool {
  width: 250px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: #fcfcfc;
  overflow: hidden;
}
.spliced-rule {
  flex: 1;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}
.pool-title {
  padding: 12px;
  background: var(--el-fill-color-light);
  font-weight: bold;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.pool-list {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drag-item {
  padding: 8px 12px;
  background: #fff;
  border: 1px solid var(--el-border-color-darker);
  border-radius: 4px;
  cursor: grab;
  font-size: 13px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.drag-item:active {
  cursor: grabbing;
}
.drag-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
.separator-item {
  border-style: dashed;
  background: var(--el-fill-color-lighter);
}

.drop-zone {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  transition: background-color 0.2s;
}
.drop-zone.is-dragover {
  background-color: var(--el-color-primary-light-9);
}
.empty-tip {
  color: var(--el-text-color-placeholder);
  text-align: center;
  margin-top: 50px;
  font-size: 14px;
}

.rule-parts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  align-content: flex-start;
}
.rule-part {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  flex-shrink: 0;
}
.part-element {
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  color: var(--el-color-primary);
}
.part-separator {
  background-color: var(--el-fill-color-darker);
  border: 1px solid var(--el-border-color);
  font-weight: bold;
}
.remove-icon {
  margin-left: 8px;
  cursor: pointer;
  border-radius: 50%;
  padding: 2px;
}
.remove-icon:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.preview-area {
  padding: 15px;
  background: var(--el-color-success-light-9);
  border-top: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.preview-text {
  margin-top: 8px;
  font-family: monospace;
  font-size: 16px;
  color: var(--el-color-success);
  word-break: break-all;
}
.preview-tag {
  font-family: monospace;
  font-size: 13px;
  white-space: normal;
  height: auto;
  line-height: 1.5;
  padding: 4px 8px;
}
.empty-tip-text {
  color: #909399;
  font-size: 13px;
  font-style: italic;
}
</style>

