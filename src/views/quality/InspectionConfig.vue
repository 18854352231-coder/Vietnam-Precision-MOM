<template>
  <div class="page-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">检验方案</span>
          <div>
            <el-button icon="Upload" @click="openImport">模板导入</el-button>
            <el-button type="primary" icon="Plus" @click="openCreate">新建方案</el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" class="filter-bar">
        <el-form-item label="产品">
          <el-input v-model="queryForm.keyword" placeholder="产品编号/名称" clearable style="width: 190px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="工序">
          <el-select v-model="queryForm.process" clearable placeholder="全部工序" style="width: 150px">
            <el-option v-for="item in processOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 130px">
            <el-option label="已生效" value="已生效" />
            <el-option label="草稿" value="草稿" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="filteredPlans" border stripe height="calc(100vh - 280px)">
        <el-table-column prop="productNo" label="产品编号" min-width="130" />
        <el-table-column prop="productName" label="产品名称" min-width="120" />
        <el-table-column prop="process" label="工序" width="100" align="center" />
        <el-table-column prop="version" label="版本" width="90" align="center" />
        <el-table-column prop="sampleType" label="抽样类型" min-width="120" />
        <el-table-column prop="frequency" label="触发频率" min-width="150" show-overflow-tooltip />
        <el-table-column label="检验项目" width="100" align="center">
          <template #default="{ row }"><el-button link type="primary" @click="viewPlan(row)">{{ row.rules.length }} 项</el-button></template>
        </el-table-column>
        <el-table-column prop="effectiveFrom" label="生效日期" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }"><el-tag :type="row.status === '已生效' ? 'success' : 'info'">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="165" />
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑检验方案' : '新建检验方案'" width="920px" top="5vh">
      <el-form :model="form" label-width="95px">
        <el-row :gutter="18">
          <el-col :span="8"><el-form-item label="产品编号" required><el-input v-model="form.productNo" :disabled="isEdit" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="产品名称" required><el-input v-model="form.productName" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="检验工序" required><el-select v-model="form.process" :disabled="isEdit" style="width:100%"><el-option v-for="item in processOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="方案版本" required><el-input v-model="form.version" placeholder="如 V1.0" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="生效日期" required><el-date-picker v-model="form.effectiveFrom" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="方案状态"><el-select v-model="form.status" style="width:100%"><el-option label="草稿" value="草稿" /><el-option label="已生效" value="已生效" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="抽样类型" required><el-input v-model="form.sampleType" placeholder="首件+巡检" /></el-form-item></el-col>
          <el-col :span="16"><el-form-item label="触发频率" required><el-input v-model="form.frequency" placeholder="开工首件/换模/每2小时" /></el-form-item></el-col>
        </el-row>

        <div class="rule-header">
          <div class="rule-title">检验项目</div>
          <el-button link type="primary" icon="Plus" @click="addRule">添加检验项</el-button>
        </div>
        <el-table :data="form.rules" border size="small" max-height="340">
          <el-table-column label="项目名称" min-width="130"><template #default="{ row }"><el-input v-model="row.item" /></template></el-table-column>
          <el-table-column label="类型" width="105"><template #default="{ row }"><el-select v-model="row.type"><el-option label="数值" value="numeric" /><el-option label="选项" value="option" /></el-select></template></el-table-column>
          <el-table-column label="目标值" width="100"><template #default="{ row }"><el-input-number v-if="row.type === 'numeric'" v-model="row.standard" :controls="false" style="width:100%" /><el-input v-else v-model="row.standardText" /></template></el-table-column>
          <el-table-column label="公差±" width="90"><template #default="{ row }"><el-input-number v-model="row.tolerance" :disabled="row.type === 'option'" :min="0" :controls="false" style="width:100%" /></template></el-table-column>
          <el-table-column label="单位" width="85"><template #default="{ row }"><el-input v-model="row.unit" /></template></el-table-column>
          <el-table-column label="必检" width="70" align="center"><template #default="{ row }"><el-switch v-model="row.required" /></template></el-table-column>
          <el-table-column label="关键" width="70" align="center"><template #default="{ row }"><el-switch v-model="row.critical" /></template></el-table-column>
          <el-table-column label="操作" width="60" align="center"><template #default="{ $index }"><el-button link type="danger" icon="Delete" @click="form.rules.splice($index, 1)" /></template></el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPlan">保存方案</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="检验方案明细" width="720px">
      <el-descriptions v-if="detailPlan" :column="3" border class="detail-context">
        <el-descriptions-item label="产品">{{ detailPlan.productName }} / {{ detailPlan.productNo }}</el-descriptions-item>
        <el-descriptions-item label="工序">{{ detailPlan.process }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ detailPlan.version }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="detailPlan?.rules || []" border>
        <el-table-column prop="item" label="检验项目" min-width="140" />
        <el-table-column label="规格" min-width="180"><template #default="{ row }">{{ row.type === 'numeric' ? `${row.standard - row.tolerance}～${row.standard + row.tolerance} ${row.unit}` : row.standardText }}</template></el-table-column>
        <el-table-column label="必检/关键" width="120"><template #default="{ row }">{{ row.required ? '必检' : '选检' }} / {{ row.critical ? '关键' : '普通' }}</template></el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="importVisible" title="模板导入" width="560px">
      <el-form label-width="90px">
        <el-form-item label="导入模板">
          <el-button link type="primary" icon="Download" @click="downloadTemplate">下载检验方案模板</el-button>
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            :key="importUploadKey"
            action="#"
            accept=".csv"
            :auto-upload="false"
            :limit="1"
            :show-file-list="true"
            :on-change="handleImportFile"
            :on-remove="clearImportFile"
          >
            <el-button icon="Upload">选择CSV文件</el-button>
            <template #tip><div class="el-upload__tip">请使用下载的模板填写，多个检验项目按多行录入。</div></template>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="importPlans.length" label="识别结果">
          <span>共 {{ importPlans.length }} 个方案，{{ importRuleCount }} 个检验项目</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!importPlans.length" @click="confirmImport">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { useIPQCStore, type IPQCPlan, type IPQCProcess, type IPQCRule } from '@/store/ipqc'

const store = useIPQCStore()
const processOptions: IPQCProcess[] = ['挤压', '时效', '裁切上料', '裁切', '预包装']
const emptyFilters = () => ({ keyword: '', process: '', status: '' })
const queryForm = ref(emptyFilters())
const filters = ref(emptyFilters())
const dialogVisible = ref(false)
const detailVisible = ref(false)
const detailPlan = ref<IPQCPlan | null>(null)
const isEdit = ref(false)
const importVisible = ref(false)
const importPlans = ref<IPQCPlan[]>([])
const importUploadKey = ref(0)

const emptyPlan = (): IPQCPlan => ({ id: '', productNo: '', productName: '', process: '挤压', version: 'V1.0', status: '草稿', effectiveFrom: '', sampleType: '', frequency: '', updatedAt: '', rules: [] })
const form = ref<IPQCPlan>(emptyPlan())
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const filteredPlans = computed(() => {
  const keyword = filters.value.keyword.trim().toLowerCase()
  return store.plans.filter(item => {
    if (keyword && ![item.productNo, item.productName].some(value => value.toLowerCase().includes(keyword))) return false
    if (filters.value.process && item.process !== filters.value.process) return false
    if (filters.value.status && item.status !== filters.value.status) return false
    return true
  })
})

const openCreate = () => { isEdit.value = false; form.value = emptyPlan(); addRule(); dialogVisible.value = true }
const openEdit = (row: IPQCPlan) => { isEdit.value = true; form.value = clone(row); dialogVisible.value = true }
const viewPlan = (row: IPQCPlan) => { detailPlan.value = row; detailVisible.value = true }
const openImport = () => { importPlans.value = []; importUploadKey.value += 1; importVisible.value = true }
const handleSearch = () => { filters.value = { ...queryForm.value } }
const resetFilters = () => {
  queryForm.value = emptyFilters()
  filters.value = emptyFilters()
}

const addRule = () => {
  const rule: IPQCRule = { id: `RULE-${Date.now()}-${form.value.rules.length + 1}`, item: '', type: 'numeric', standard: 0, tolerance: 0, standardText: 'OK', unit: '', required: true, critical: false }
  form.value.rules.push(rule)
}

const templateHeaders = ['产品编号', '产品名称', '工序', '方案版本', '生效日期', '方案状态', '抽样类型', '触发频率', '项目名称', '数据类型', '目标值', '公差', '单位', '必检', '关键']
const importRuleCount = computed(() => importPlans.value.reduce((sum, plan) => sum + plan.rules.length, 0))

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const downloadTemplate = () => {
  const examples = [
    ['P-1001', 'FC63', '挤压', 'V1.0', '2026-08-01', '草稿', '首件+巡检', '开工首件/每2小时', '长度', '数值', '6000', '5', 'mm', '是', '是'],
    ['P-1001', 'FC63', '挤压', 'V1.0', '2026-08-01', '草稿', '首件+巡检', '开工首件/每2小时', '外观', '选项', 'OK', '0', '-', '是', '否']
  ]
  const content = [templateHeaders, ...examples].map(row => row.map(escapeCsv).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = '检验方案导入模板.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const parseCsv = (content: string) => {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    if (char === '"') {
      if (quoted && content[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(field.trim())
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && content[index + 1] === '\n') index += 1
      row.push(field.trim())
      if (row.some(value => value)) rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  row.push(field.trim())
  if (row.some(value => value)) rows.push(row)
  return rows
}

const parseBoolean = (value: string) => ['是', 'true', '1', 'yes'].includes(value.trim().toLowerCase())

const buildImportPlans = (rows: string[][]) => {
  if (rows.length < 2) throw new Error('模板中没有可导入的数据')
  const headers = rows[0].map(value => value.replace(/^\uFEFF/, '').trim())
  const missingHeaders = templateHeaders.filter(header => !headers.includes(header))
  if (missingHeaders.length) throw new Error(`模板缺少字段：${missingHeaders.join('、')}`)
  const column = (row: string[], name: string) => row[headers.indexOf(name)]?.trim() || ''
  const planMap = new Map<string, IPQCPlan>()

  rows.slice(1).forEach((row, rowIndex) => {
    const lineNo = rowIndex + 2
    const productNo = column(row, '产品编号')
    const productName = column(row, '产品名称')
    const process = column(row, '工序') as IPQCProcess
    const version = column(row, '方案版本')
    const effectiveFrom = column(row, '生效日期')
    const sampleType = column(row, '抽样类型')
    const frequency = column(row, '触发频率')
    const item = column(row, '项目名称')
    const typeText = column(row, '数据类型')
    const target = column(row, '目标值')
    if (!productNo || !productName || !version || !effectiveFrom || !sampleType || !frequency || !item || !typeText || !target) {
      throw new Error(`第 ${lineNo} 行必填信息不完整`)
    }
    if (!processOptions.includes(process)) throw new Error(`第 ${lineNo} 行工序不正确`)
    const type = typeText === '数值' || typeText === 'numeric' ? 'numeric' : typeText === '选项' || typeText === 'option' ? 'option' : ''
    if (!type) throw new Error(`第 ${lineNo} 行数据类型应为“数值”或“选项”`)
    const standard = type === 'numeric' ? Number(target) : 0
    const tolerance = type === 'numeric' ? Number(column(row, '公差') || 0) : 0
    if (!Number.isFinite(standard) || !Number.isFinite(tolerance) || tolerance < 0) throw new Error(`第 ${lineNo} 行目标值或公差不正确`)

    const key = `${productNo}|${process}|${version}`
    let plan = planMap.get(key)
    if (!plan) {
      const statusText = column(row, '方案状态')
      plan = {
        id: `PLAN-IMPORT-${Date.now()}-${planMap.size + 1}`,
        productNo,
        productName,
        process,
        version,
        status: statusText === '已生效' ? '已生效' : '草稿',
        effectiveFrom,
        sampleType,
        frequency,
        updatedAt: '',
        rules: []
      }
      planMap.set(key, plan)
    }
    plan.rules.push({
      id: `RULE-IMPORT-${Date.now()}-${lineNo}`,
      item,
      type,
      standard,
      tolerance,
      standardText: type === 'option' ? target : 'OK',
      unit: column(row, '单位'),
      required: parseBoolean(column(row, '必检')),
      critical: parseBoolean(column(row, '关键'))
    })
  })
  return [...planMap.values()]
}

const handleImportFile = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return
  try {
    importPlans.value = buildImportPlans(parseCsv(await uploadFile.raw.text()))
    ElMessage.success('模板读取成功')
  } catch (error) {
    importPlans.value = []
    ElMessage.error(error instanceof Error ? error.message : '模板读取失败')
  }
}

const clearImportFile = () => { importPlans.value = [] }

const confirmImport = () => {
  importPlans.value.forEach(plan => store.savePlan(plan))
  ElMessage.success(`已导入 ${importPlans.value.length} 个检验方案`)
  importVisible.value = false
  importPlans.value = []
}

const submitPlan = () => {
  if (!form.value.productNo || !form.value.productName || !form.value.process || !form.value.version || !form.value.effectiveFrom || !form.value.sampleType || !form.value.frequency) {
    ElMessage.warning('请完整填写方案基本信息')
    return
  }
  if (!form.value.rules.length || form.value.rules.some(item => !item.item || (item.type === 'option' && !item.standardText))) {
    ElMessage.warning('请至少配置一个完整的检验项目')
    return
  }
  if (!form.value.id) form.value.id = `PLAN-${form.value.productNo}-${form.value.process}-${Date.now()}`
  store.savePlan(form.value)
  dialogVisible.value = false
  ElMessage.success('检验方案已保存，后续新任务将引用该版本')
}
</script>

<style scoped>
.page-container { padding: 16px; min-height: 100%; box-sizing: border-box; background: var(--bg-primary); }
.main-card { min-height: calc(100vh - 116px); }.card-header { display:flex; justify-content:space-between; align-items:center; }
.header-title { font-size:18px; font-weight:600; }
.filter-bar { padding:4px 0 2px; border-bottom:1px solid #ebeef5; margin-bottom:12px; }.rule-header { display:flex; justify-content:space-between; align-items:center; margin:8px 0 12px; }
.rule-title { font-weight:600; }.detail-context { margin-bottom:14px; }
.el-upload__tip { color:#909399; }
</style>
