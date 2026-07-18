<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-radio-group v-model="materialType" @change="handleTypeChange">
              <el-radio-button label="component">成分料</el-radio-button>
              <el-radio-button label="raw">原材料</el-radio-button>
              <el-radio-button label="finish">成品</el-radio-button>
              <el-radio-button label="semi">半成品</el-radio-button>
            </el-radio-group>
            
            <template v-if="materialType === 'component'">
              <el-input v-model="searchFields.componentMaterialNo" placeholder="成分料号" style="width: 140px; margin-left: 20px" clearable />
              <el-input v-model="searchFields.materialName" placeholder="物料名称" style="width: 140px; margin-left: 10px" clearable />
              <el-input v-model="searchFields.alloyNo" placeholder="合金牌号" style="width: 140px; margin-left: 10px" clearable />
              <el-select v-model="searchFields.rodType" placeholder="铝棒类型" style="width: 120px; margin-left: 10px" clearable>
                <el-option label="均质棒" value="均质棒" />
                <el-option label="非均质棒" value="非均质棒" />
              </el-select>
              <el-select v-model="searchFields.publishStatus" placeholder="发布状态" style="width: 120px; margin-left: 10px" clearable>
                <el-option label="已发布" value="已发布" />
                <el-option label="未发布" value="未发布" />
              </el-select>
            </template>

            <template v-if="materialType === 'raw'">
              <el-input v-model="searchFields.rodMaterialNo" placeholder="铝棒料号" style="width: 150px; margin-left: 20px" clearable />
              <el-input v-model="searchFields.componentMaterialNo" placeholder="成分料号" style="width: 150px; margin-left: 10px" clearable />
            </template>

            <template v-if="materialType === 'finish'">
              <el-input v-model="searchFields.finishMaterialNo" placeholder="成品料号" style="width: 150px; margin-left: 20px" clearable />
              <el-input v-model="searchFields.materialName" placeholder="物料名称" style="width: 150px; margin-left: 10px" clearable />
              <el-input v-model="searchFields.customerCode" placeholder="客户代号" style="width: 150px; margin-left: 10px" clearable />
            </template>

            <template v-if="materialType === 'semi'">
              <el-input v-model="searchFields.materialName" placeholder="物料名称" style="width: 150px; margin-left: 20px" clearable />
              <el-input v-model="searchFields.rodMaterialNo" placeholder="原材料料号" style="width: 150px; margin-left: 10px" clearable />
            </template>

            <el-button type="primary" @click="handleSearch" style="margin-left: 10px">查询</el-button>
            <el-button @click="resetSearch" style="margin-left: 10px">重置</el-button>
          </div>
          <div class="header-right">
            <el-button type="success" @click="handleExport">导出</el-button>
            <el-button type="warning" @click="handleImport">导入</el-button>
            <el-button type="primary" @click="handleAdd">新增物料</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />

        <template v-if="materialType === 'raw'">
          <el-table-column prop="rodMaterialNo" label="铝棒料号" width="180" show-overflow-tooltip />
          <el-table-column prop="componentMaterialNo" label="成分料号" width="170" show-overflow-tooltip />
          <el-table-column prop="length" label="长度" width="100" align="right" />
          <el-table-column prop="mainUnit" label="主单位" width="90" align="center" />
          <el-table-column prop="subUnit" label="辅单位" width="90" align="center" />
          <el-table-column prop="unitWeight" label="单重" width="120" align="right" />
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        </template>

        <template v-else-if="materialType === 'component'">
          <el-table-column prop="componentMaterialNo" label="成分料号" width="160" show-overflow-tooltip />
          <el-table-column prop="version" label="版本号" width="90" align="center" />
          <el-table-column prop="isTempNo" label="是否临时料号" width="120" align="center" />
          <el-table-column prop="isHighEndRod" label="是否高端棒" width="120" align="center" />
          <el-table-column prop="rodType" label="铝棒类型" width="100" align="center" />
          <el-table-column prop="materialName" label="物料名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="supplierStatus" label="供应商及均质状态" width="180" show-overflow-tooltip />
          <el-table-column prop="spec" label="规格" width="140" show-overflow-tooltip />
          <el-table-column prop="rAngle" label="R角" width="80" align="right" />
          <el-table-column prop="alloyNo" label="合金牌号" width="110" align="center" />
          <el-table-column prop="lengthTolMm" label="长度公差(mm)" width="130" align="right" />
          <el-table-column prop="diameterTolMm" label="直径公差(mm)" width="130" align="right" />
          <el-table-column prop="density" label="密度(g/cm2)" width="110" align="right" />
          <el-table-column prop="meterWeight" label="米重(kg/m)" width="120" align="right" />
          <el-table-column prop="recycleRate" label="回收比(%)" width="120" align="right" />
          <el-table-column prop="greenPowerRate" label="绿电占比(%)" width="130" align="right" />
          <el-table-column prop="scrapRate" label="铝屑配比" width="110" align="right" />
          <el-table-column prop="remark1" label="备注1" width="140" show-overflow-tooltip />
          <el-table-column prop="remark2" label="备注2" width="140" show-overflow-tooltip />
          <el-table-column prop="remark3" label="备注3" width="140" show-overflow-tooltip />
          <el-table-column prop="si" label="硅Si" width="90" align="center" />
          <el-table-column prop="fe" label="铁Fe" width="90" align="center" />
          <el-table-column prop="cu" label="铜Cu" width="90" align="center" />
          <el-table-column prop="mn" label="锰Mn" width="90" align="center" />
          <el-table-column prop="mg" label="镁Mg" width="90" align="center" />
          <el-table-column prop="cr" label="铬Cr" width="90" align="center" />
          <el-table-column prop="ga" label="镓Ga" width="90" align="center" />
          <el-table-column prop="ni" label="镍Ni" width="90" align="center" />
          <el-table-column prop="zr" label="锆Zr" width="90" align="center" />
          <el-table-column prop="zn" label="锌Zn" width="90" align="center" />
          <el-table-column prop="ti" label="钛Ti" width="90" align="center" />
          <el-table-column prop="v" label="钒V" width="90" align="center" />
          <el-table-column prop="sn" label="锡Sn" width="90" align="center" />
          <el-table-column prop="sr" label="锶Sr" width="90" align="center" />
          <el-table-column prop="mncr" label="锰铬MnCr" width="110" align="center" />
          <el-table-column prop="ca" label="钙Ca" width="90" align="center" />
          <el-table-column prop="na" label="钠Na" width="90" align="center" />
          <el-table-column prop="single" label="单体" width="90" align="center" />
          <el-table-column prop="total" label="合计" width="90" align="center" />
          <el-table-column prop="sc" label="钪Sc" width="90" align="center" />
          <el-table-column prop="be" label="铍Be" width="90" align="center" />
          <el-table-column prop="pb" label="铅Pb" width="90" align="center" />
          <el-table-column prop="tizr" label="钛锆TiZr" width="110" align="center" />
          <el-table-column prop="b" label="硼B" width="90" align="center" />
          <el-table-column prop="li" label="锂Li" width="90" align="center" />
          <el-table-column prop="p" label="磷P" width="90" align="center" />
          <el-table-column prop="cd" label="镉Cd" width="90" align="center" />
          <el-table-column prop="la" label="镧La" width="90" align="center" />
          <el-table-column prop="sb" label="锑Sb" width="90" align="center" />
          <el-table-column prop="pd" label="钯Pd" width="90" align="center" />
          <el-table-column prop="bi" label="铋Bi" width="90" align="center" />
          <el-table-column prop="mgsi" label="镁/硅Mg/Si" width="120" align="center" />
          <el-table-column prop="cana" label="钙钠CaNa" width="120" align="center" />
          <el-table-column prop="sife" label="硅铁SiFe" width="120" align="center" />
          <el-table-column prop="publishStatus" label="发布状态" width="110" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.publishStatus === '已发布' ? 'success' : 'info'" size="small">
                {{ scope.row.publishStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="publisher" label="发布人" width="100" align="center" />
          <el-table-column prop="effectiveDate" label="生效日期" width="150" align="center" />
        </template>

        <template v-else-if="materialType === 'finish'">
          <el-table-column prop="productMaterialNo" label="成品料号" width="170" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" width="180" show-overflow-tooltip />
          <el-table-column prop="productType" label="产品类型" width="110" show-overflow-tooltip />
          <el-table-column prop="produceType" label="生产类型" width="110" show-overflow-tooltip />
          <el-table-column prop="alloyNo" label="合金牌号" width="100" align="center" />
          <el-table-column prop="alloyStatus" label="合金状态" width="110" show-overflow-tooltip />
          <el-table-column prop="recycleRate" label="回收比(%)" width="110" align="right" />
          <el-table-column prop="fixedLength" label="定尺(mm)" width="110" align="right" />
          <el-table-column prop="width" label="宽度(mm)" width="110" align="right" />
          <el-table-column prop="thickness" label="厚度(mm)" width="110" align="right" />
          <el-table-column prop="diameter" label="直径(mm)" width="110" align="right" />
          <el-table-column prop="wallThickness" label="壁厚(mm)" width="110" align="right" />
          <el-table-column prop="mainUnit" label="主单位" width="90" align="center" />
          <el-table-column prop="subUnit" label="辅单位" width="90" align="center" />
          <el-table-column prop="meterWeight" label="米重" width="110" align="right" />
          <el-table-column prop="unitWeight" label="单重" width="110" align="right" />
          <el-table-column prop="cutTolUpper" label="裁切尺寸公差上限" width="150" align="right" />
          <el-table-column prop="cutTolLower" label="裁切尺寸公差下限" width="150" align="right" />
          <el-table-column prop="extrTolUpper" label="挤压尺寸公差上限" width="150" align="right" />
          <el-table-column prop="extrTolLower" label="挤压尺寸公差下限" width="150" align="right" />
          <el-table-column prop="cncTolUpper" label="CNC尺寸公差上限" width="150" align="right" />
          <el-table-column prop="cncTolLower" label="CNC尺寸公差下限" width="150" align="right" />
          <el-table-column prop="sizeTolUpper" label="尺寸公差上限" width="120" align="right" />
          <el-table-column prop="sizeTolLower" label="尺寸公差下限" width="120" align="right" />
          <el-table-column prop="cncWorkCategory" label="CNC工作分类" width="150" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        </template>

        <template v-else-if="materialType === 'semi'">
          <el-table-column prop="rawMaterial" label="原材料" width="180" show-overflow-tooltip />
          <el-table-column prop="process" label="工序" width="100" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="alloyNo" label="合金牌号" width="110" align="center" />
        </template>

        <el-table-column v-if="materialType !== 'semi' && materialType !== 'component'" prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
              {{ scope.row.status === 'published' ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" align="center">
          <template #default="scope">
            <el-button size="small" type="success" link @click="handlePublish(scope.row)" v-if="scope.row.status === 'unpublished'">发布</el-button>
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px">
        <el-row :gutter="18">
          <el-col :span="12" v-for="field in activeFormFields" :key="field.key">
            <el-form-item :label="field.label" :prop="field.required ? field.key : undefined">
              <el-input
                v-if="field.type === 'input'"
                v-model="form[field.key]"
                :placeholder="field.placeholder"
              />
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="form[field.key]"
                :min="0"
                style="width: 100%"
              />
              <el-select
                v-else-if="field.type === 'select'"
                v-model="form[field.key]"
                style="width: 100%"
                filterable
                clearable
              >
                <el-option v-for="opt in field.options || []" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const materialType = ref('component')
const search = ref('')

// 各个分类专属的搜索字段
const searchFields = ref({
  // 成分料
  componentMaterialNo: '',
  materialName: '',
  alloyNo: '',
  rodType: '',
  publishStatus: '',
  // 原材料
  rodMaterialNo: '',
  // 成品
  finishMaterialNo: '',
  customerCode: '',
  // 半成品
})

const resetSearch = () => {
  searchFields.value = {
    componentMaterialNo: '',
    materialName: '',
    alloyNo: '',
    rodType: '',
    publishStatus: '',
    rodMaterialNo: '',
    finishMaterialNo: '',
    customerCode: ''
  }
}

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增物料')
const formRef = ref()
const form = ref<Record<string, any>>({})

type FieldType = 'input' | 'number' | 'select'
interface FieldOption {
  label: string
  value: string
}
interface FormField {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
}

const rules = computed(() => {
  const target: Record<string, any[]> = {}
  activeFormFields.value.forEach((f) => {
    if (f.required) {
      target[f.key] = [{ required: true, message: `请输入${f.label}`, trigger: f.type === 'select' ? 'change' : 'blur' }]
    }
  })
  return target
})

const yesNoOptions: FieldOption[] = [
  { label: '是', value: '是' },
  { label: '否', value: '否' }
]

const rodTypeOptions: FieldOption[] = [
  { label: '圆棒', value: '圆棒' },
  { label: '方棒', value: '方棒' }
]

const activeFormFields = computed<FormField[]>(() => {
  if (materialType.value === 'raw') {
    return [
      { key: 'rodMaterialNo', label: '铝棒料号', type: 'input', required: true },
      { key: 'componentMaterialNo', label: '成分料号', type: 'input', required: true },
      { key: 'length', label: '长度', type: 'number' },
      { key: 'mainUnit', label: '主单位', type: 'input' },
      { key: 'subUnit', label: '辅单位', type: 'input' },
      { key: 'unitWeight', label: '单重', type: 'number' },
      { key: 'remark', label: '备注', type: 'input' }
    ]
  }

  if (materialType.value === 'component') {
    return [
      { key: 'componentMaterialNo', label: '成分料号', type: 'input', required: true },
      { key: 'version', label: '版本号', type: 'input' },
      { key: 'isTempNo', label: '是否临时料号', type: 'select', options: yesNoOptions },
      { key: 'isHighEndRod', label: '是否高端料棒', type: 'select', options: yesNoOptions },
      { key: 'rodType', label: '铝棒类型', type: 'select', options: rodTypeOptions },
      { key: 'materialName', label: '物料名称', type: 'input' },
      { key: 'supplierStatus', label: '供应商及均质状态', type: 'input' },
      { key: 'spec', label: '规格', type: 'input' },
      { key: 'rAngle', label: 'R角', type: 'number' },
      { key: 'alloyNo', label: '合金牌号', type: 'input' },
      { key: 'lengthTolMm', label: '长度公差(mm)', type: 'number' },
      { key: 'diameterTolMm', label: '直径公差(mm)', type: 'number' },
      { key: 'density', label: '密度', type: 'number' },
      { key: 'meterWeight', label: '米重(kg/m)', type: 'number' },
      { key: 'recycleRate', label: '回收比(%)', type: 'number' },
      { key: 'greenPowerRate', label: '绿电占比(%)', type: 'number' },
      { key: 'scrapRate', label: '铝屑占比(%)', type: 'number' }
    ]
  }

  if (materialType.value === 'finish') {
    return [
      { key: 'productMaterialNo', label: '成品料号', type: 'input', required: true },
      { key: 'productName', label: '产品名称', type: 'input', required: true },
      { key: 'productType', label: '产品类型', type: 'input' },
      { key: 'produceType', label: '生产类型', type: 'input' },
      { key: 'alloyNo', label: '合金牌号', type: 'input' },
      { key: 'alloyStatus', label: '合金状态', type: 'input' },
      { key: 'recycleRate', label: '回收比(%)', type: 'number' },
      { key: 'fixedLength', label: '定尺(mm)', type: 'number' },
      { key: 'width', label: '宽度(mm)', type: 'number' },
      { key: 'thickness', label: '厚度(mm)', type: 'number' },
      { key: 'diameter', label: '直径(mm)', type: 'number' },
      { key: 'wallThickness', label: '壁厚(mm)', type: 'number' },
      { key: 'mainUnit', label: '主单位', type: 'input' },
      { key: 'subUnit', label: '辅单位', type: 'input' },
      { key: 'meterWeight', label: '米重', type: 'number' },
      { key: 'unitWeight', label: '单重', type: 'number' },
      { key: 'cutTolUpper', label: '裁切尺寸公差上限', type: 'number' },
      { key: 'cutTolLower', label: '裁切尺寸公差下限', type: 'number' },
      { key: 'extrTolUpper', label: '挤压尺寸公差上限', type: 'number' },
      { key: 'extrTolLower', label: '挤压尺寸公差下限', type: 'number' },
      { key: 'cncTolUpper', label: 'CNC尺寸公差上限', type: 'number' },
      { key: 'cncTolLower', label: 'CNC尺寸公差下限', type: 'number' },
      { key: 'sizeTolUpper', label: '尺寸公差上限', type: 'number' },
      { key: 'sizeTolLower', label: '尺寸公差下限', type: 'number' },
      { key: 'cncWorkCategory', label: 'CNC工作分类', type: 'input' },
      { key: 'remark', label: '备注', type: 'input' }
    ]
  }

  return [
    { key: 'rawMaterial', label: '原材料', type: 'input', required: true },
    { key: 'process', label: '工序', type: 'input', required: true },
    { key: 'productName', label: '产品名称', type: 'input', required: true },
    { key: 'alloyNo', label: '合金牌号', type: 'input' }
  ]
})

const mockData: any = {
  component: [
    {
      id: 1,
      componentMaterialNo: '20-0022-9999',
      version: 'V02',
      isTempNo: '否',
      isHighEndRod: '否',
      rodType: '圆棒',
      materialName: '韧制性铝合金',
      supplierStatus: '其他',
      spec: '228',
      rAngle: 5,
      alloyNo: '6088H',
      lengthTolMm: 5,
      diameterTolMm: 2,
      density: 2.71,
      meterWeight: 110.64,
      recycleRate: 0,
      greenPowerRate: 0,
      scrapRate: 0,
      remark1: 'QH-26 12号扎机验证',
      remark2: '1',
      remark3: '/',
      si: '/',
      fe: '/',
      cu: '/',
      mn: '/',
      mg: '/',
      cr: '/',
      ga: '/',
      ni: '/',
      zr: '/',
      zn: '/',
      ti: '/',
      v: '/',
      sn: '/',
      sr: '/',
      mncr: '/',
      ca: '/',
      na: '/',
      single: '/',
      total: '/',
      sc: '/',
      be: '/',
      pb: '/',
      tizr: '/',
      b: '/',
      li: '/',
      p: '/',
      cd: '/',
      la: '/',
      sb: '/',
      pd: '/',
      bi: '/',
      mgsi: '/',
      cana: '/',
      sife: '/',
      publishStatus: '未发布',
      publisher: '',
      effectiveDate: '',
      status: 'published'
    }
  ],
  raw: [
    {
      id: 14116,
      rodMaterialNo: '20-B3Q1-9999-L470',
      componentMaterialNo: '20-B3Q1-9999',
      length: 470,
      mainUnit: '千克',
      subUnit: '支',
      unitWeight: 14.5115,
      remark: '',
      status: 'published'
    },
    {
      id: 14115,
      rodMaterialNo: '20-X152-6060-0001-L1',
      componentMaterialNo: '20-X152-6060-0001',
      length: 1,
      mainUnit: '吨',
      subUnit: '千克',
      unitWeight: 0.0492,
      remark: '',
      status: 'unpublished'
    }
  ],
  finish: [
    {
      id: 1,
      productMaterialNo: '18-C000-0001',
      productName: 'FC132',
      productType: '',
      produceType: '',
      alloyNo: '6063',
      alloyStatus: '',
      recycleRate: 100,
      fixedLength: 123.456,
      width: '',
      thickness: '',
      diameter: '',
      wallThickness: '',
      mainUnit: '',
      subUnit: '',
      meterWeight: 0.258,
      unitWeight: 0.0319,
      cutTolUpper: '',
      cutTolLower: '',
      extrTolUpper: '',
      extrTolLower: '',
      cncTolUpper: '',
      cncTolLower: '',
      sizeTolUpper: 0.3,
      sizeTolLower: -0.1,
      cncWorkCategory: '',
      remark: '',
      status: 'unpublished'
    },
    {
      id: 2,
      productMaterialNo: '18-C001-0C50',
      productName: 'FC58',
      productType: '',
      produceType: '',
      alloyNo: '6R01',
      alloyStatus: '',
      recycleRate: 100,
      fixedLength: 240.1,
      width: '',
      thickness: '',
      diameter: '',
      wallThickness: '',
      mainUnit: '',
      subUnit: '',
      meterWeight: 0.3283,
      unitWeight: 0.0788,
      cutTolUpper: '',
      cutTolLower: '',
      extrTolUpper: '',
      extrTolLower: '',
      cncTolUpper: '',
      cncTolLower: '',
      sizeTolUpper: 0.3,
      sizeTolLower: -0.3,
      cncWorkCategory: '',
      remark: '',
      status: 'unpublished'
    }
  ],
  semi: [
    { id: 1, rawMaterial: '20-B3Q1-9999-L470', process: '挤压', productName: 'FC55', alloyNo: '6063', status: 'published' }
  ]
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData[materialType.value] || []
    total.value = tableData.value.length
    loading.value = false
  }, 300)
}

const handleTypeChange = () => {
  resetSearch()
  currentPage.value = 1
  loadData()
}

const handleSearch = () => {
  // TODO: 实现查询逻辑，使用 searchFields.value
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增物料'
  form.value = { id: null, status: 'unpublished' }
  activeFormFields.value.forEach((f) => {
    if (form.value[f.key] === undefined) form.value[f.key] = f.type === 'number' ? 0 : ''
  })
  dialogVisible.value = true
}

const handlePublish = (row: any) => {
  const key = row.productMaterialNo || row.rodMaterialNo || row.componentMaterialNo || row.rawMaterial || row.id
  ElMessageBox.confirm(`确认发布物料 ${key} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    row.status = 'published'
    ElMessage.success('发布成功')
  })
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑物料'
  form.value = { ...row }
  activeFormFields.value.forEach((f) => {
    if (form.value[f.key] === undefined) form.value[f.key] = f.type === 'number' ? 0 : ''
  })
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleDelete = (row: any) => {
  const key = row.productMaterialNo || row.rodMaterialNo || row.componentMaterialNo || row.rawMaterial || row.id
  ElMessageBox.confirm(`确认删除物料 ${key} 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadData()
  })
}

const handleExport = () => {
  ElMessage.info('导出中...')
}

const handleImport = () => {
  ElMessage.info('请选择导入文件')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left, .header-right {
  display: flex;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
