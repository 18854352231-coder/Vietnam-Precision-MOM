<template>
  <div class="page-container">
    <el-card>
      <el-tabs v-model="activeTab" class="plan-tabs">
        <!-- 挤压主计划 -->
        <el-tab-pane label="挤压主计划" name="extrusion">
          <div class="tab-header">
            <div class="header-left" style="display: flex; gap: 10px; flex-wrap: wrap;">
              <el-input v-model="searchForm.orderNo" placeholder="订单编号" style="width: 150px" clearable />
              <el-input v-model="searchForm.customerCode" placeholder="客户代号" style="width: 150px" clearable />
              <el-input v-model="searchForm.componentNo" placeholder="成分料号" style="width: 150px" clearable />
              <el-input v-model="searchForm.productName" placeholder="品名" style="width: 150px" clearable />
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </div>
            <div class="header-right">
              <el-button type="success" @click="handleExport">导出</el-button>
              <el-button type="warning" @click="handleImport">导入主计划</el-button>
              <el-button type="primary" @click="handleAdd">新建计划</el-button>
            </div>
          </div>
          <el-table :data="tableData" border style="width: 100%; margin-top: 15px" v-loading="loading">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.status === '草稿' ? 'info' : 'success'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="产品类型" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.category === '交通类' ? 'success' : 'primary'" size="small">
                  {{ scope.row.category }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="leader" label="负责人" width="100" align="center" />
            <el-table-column prop="customerCode" label="客户代号" width="100" show-overflow-tooltip />
            <el-table-column prop="orderNo" label="订单编号" width="160" show-overflow-tooltip />
            <el-table-column prop="orderDate" label="订单日期" width="120" align="center" />
            <el-table-column prop="productName" label="品名" min-width="170" show-overflow-tooltip />
            <el-table-column prop="componentNo" label="成分料号" width="140" show-overflow-tooltip />
            <el-table-column prop="length" label="长度" width="100" align="right" />
            <el-table-column prop="orderQty" label="订单数量" width="100" align="right" />
            <el-table-column prop="alloyStatus" label="合金状况" width="120" />
            <el-table-column prop="unitWeight" label="单重" width="100" align="right" />
            <el-table-column prop="weight" label="重量" width="100" align="right" />
            <el-table-column prop="customerPartNo" label="客户料号" width="140" show-overflow-tooltip />
            <el-table-column prop="customerProductName" label="客户品名" width="170" show-overflow-tooltip />
            <el-table-column prop="completedQty" label="已完成数量" width="120" align="right" />
            <el-table-column prop="remainingQty" label="剩余数量" width="100" align="right" />
            <el-table-column prop="remainingWeight" label="剩余重量" width="100" align="right" />
            <el-table-column prop="inboundTime" label="入库时间" width="160" align="center" />
            <el-table-column prop="machineType" label="机台类型" width="120" />
            <el-table-column prop="rodPartNo" label="铝棒料号" width="150" show-overflow-tooltip />
            <el-table-column prop="hourlyCapacity" label="小时产能" width="100" align="right" />
            <el-table-column prop="rodDemand" label="需求铝棒" width="120" />
            <el-table-column prop="productionTime" label="生产时间" width="160" align="center" />
            <el-table-column prop="leadRodQty" label="引棒数量" width="100" align="right" />
            <el-table-column prop="leadRodLength" label="引棒长度" width="100" align="right" />
            <el-table-column prop="rodArrivalDate" label="到棒日期" width="120" align="center" />
            <el-table-column prop="remark" label="备注" width="180" show-overflow-tooltip />
            <el-table-column prop="attention" label="注意" width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="180" align="center">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="small" type="primary" link @click="handleEdit(scope.row)" :disabled="scope.row.status !== '草稿'">编辑</el-button>
                <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 熔铸主计划 -->
        <el-tab-pane label="熔铸主计划" name="melting">
          <!-- 复用相似布局 -->
          <div class="tab-header">
            <div class="header-left" style="display: flex; gap: 10px; flex-wrap: wrap;">
              <el-input v-model="searchForm.orderNo" placeholder="订单编号" style="width: 150px" clearable />
              <el-input v-model="searchForm.customerCode" placeholder="客户代号" style="width: 150px" clearable />
              <el-input v-model="searchForm.componentNo" placeholder="成分料号" style="width: 150px" clearable />
              <el-input v-model="searchForm.productName" placeholder="品名" style="width: 150px" clearable />
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </div>
            <div class="header-right">
              <el-button type="success" @click="handleExport">导出</el-button>
              <el-button type="warning" @click="handleImport">导入主计划</el-button>
              <el-button type="primary" @click="handleAdd">新建计划</el-button>
            </div>
          </div>
          <el-table :data="meltingData" border style="width: 100%; margin-top: 15px" v-loading="loading">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.status === '草稿' ? 'info' : 'success'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="产品类型" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.category === '交通类' ? 'success' : 'primary'" size="small">
                  {{ scope.row.category }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="leader" label="负责人" width="100" align="center" />
            <el-table-column prop="customerCode" label="客户代号" width="100" show-overflow-tooltip />
            <el-table-column prop="orderNo" label="订单编号" width="160" show-overflow-tooltip />
            <el-table-column prop="orderDate" label="订单日期" width="120" align="center" />
            <el-table-column prop="productName" label="品名" min-width="170" show-overflow-tooltip />
            <el-table-column prop="componentNo" label="成分料号" width="120" show-overflow-tooltip />
            <el-table-column prop="length" label="长度" width="100" align="right" />
            <el-table-column prop="orderQty" label="订单数量" width="100" align="right" />
            <el-table-column prop="alloyStatus" label="合金状况" width="120" />
            <el-table-column prop="unitWeight" label="单重" width="100" align="right" />
            <el-table-column prop="weight" label="重量" width="100" align="right" />
            <el-table-column prop="customerPartNo" label="客户料号" width="120" show-overflow-tooltip />
            <el-table-column prop="customerProductName" label="客户品名" width="150" show-overflow-tooltip />
            <el-table-column prop="completedQty" label="已完成数量" width="120" align="right" />
            <el-table-column prop="remainingQty" label="剩余数量" width="100" align="right" />
            <el-table-column prop="remainingWeight" label="剩余重量" width="100" align="right" />
            <el-table-column prop="inboundTime" label="入库时间" width="160" align="center" />
            <el-table-column prop="machineType" label="机台类型" width="120" />
            <el-table-column prop="rodPartNo" label="铝棒料号" width="140" show-overflow-tooltip />
            <el-table-column prop="hourlyCapacity" label="小时产能" width="100" align="right" />
            <el-table-column prop="rodDemand" label="需求铝棒" width="120" />
            <el-table-column prop="productionTime" label="生产时间" width="160" align="center" />
            <el-table-column prop="leadRodQty" label="引棒数量" width="100" align="right" />
            <el-table-column prop="leadRodLength" label="引棒长度" width="100" align="right" />
            <el-table-column prop="rodArrivalDate" label="到棒日期" width="120" align="center" />
            <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip />
            <el-table-column prop="attention" label="注意" width="150" show-overflow-tooltip />
            <el-table-column label="操作" width="180" align="center">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="small" type="primary" link @click="handleEdit(scope.row)" :disabled="scope.row.status !== '草稿'">编辑</el-button>
                <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

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

    <!-- 主计划编辑/详情对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" :disabled="isDetail">
        <el-divider content-position="left">基础订单信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品类型" prop="category">
              <el-select v-model="form.category" style="width: 100%">
                <el-option label="交通类" value="交通类" />
                <el-option label="电子类" value="电子类" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户代码" prop="customerCode">
              <el-input v-model="form.customerCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input v-model="form.orderNo" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单日期" prop="orderDate">
              <el-date-picker v-model="form.orderDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="品名" prop="productName">
              <el-input v-model="form.productName" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">物料与规格信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="成分料号" prop="componentNo">
              <el-input v-model="form.componentNo" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="长度" prop="length">
              <el-input v-model="form.length" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单数量" prop="orderQty">
              <el-input-number v-model="form.orderQty" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="合金状况" prop="alloyStatus">
              <el-input v-model="form.alloyStatus" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单重" prop="unitWeight">
              <el-input v-model="form.unitWeight" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="重量" prop="weight">
              <el-input v-model="form.weight" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户料号" prop="customerPartNo">
              <el-input v-model="form.customerPartNo" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="客户品名" prop="customerProductName">
              <el-input v-model="form.customerProductName" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">生产执行情况</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="已完成数量" prop="completedQty">
              <el-input-number v-model="form.completedQty" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="剩余数量" prop="remainingQty">
              <el-input v-model="form.remainingQty" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="剩余重量" prop="remainingWeight">
              <el-input v-model="form.remainingWeight" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="入库时间" prop="inboundTime">
              <el-date-picker v-model="form.inboundTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="机台类型" prop="machineType">
              <el-input v-model="form.machineType" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="铝棒料号" prop="rodPartNo">
              <el-input v-model="form.rodPartNo" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">产能与资源需求</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="小时产能" prop="hourlyCapacity">
              <el-input v-model="form.hourlyCapacity" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="需求铝棒" prop="rodDemand">
              <el-input v-model="form.rodDemand" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生产时间" prop="productionTime">
              <el-date-picker v-model="form.productionTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="引棒数量" prop="leadRodQty">
              <el-input-number v-model="form.leadRodQty" style="width: 100%" placeholder="引棒需求数量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="引棒长度" prop="leadRodLength">
              <el-input v-model="form.leadRodLength" placeholder="引棒需求长度" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="到棒日期" prop="rodArrivalDate">
              <el-date-picker v-model="form.rodArrivalDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">其他备注</el-divider>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="注意" prop="attention">
          <el-input v-model="form.attention" type="textarea" :rows="2" style="color: red" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ isDetail ? '关闭' : '取消' }}</el-button>
        <el-button type="primary" @click="handleSave" v-if="!isDetail">确认保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入主计划对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入主计划" width="500px">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".xlsx,.xls,.csv"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请上传 Excel 格式文件 (.xlsx, .xls)
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImport" :disabled="!selectedFile">确认导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const { t } = useI18n()

const activeTab = ref('extrusion')
const searchForm = ref({
  orderNo: '',
  customerCode: '',
  componentNo: '',
  productName: ''
})
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<any[]>([])
const meltingData = ref<any[]>([])

const dialogVisible = ref(false)
const templateDialogVisible = ref(false)
const dialogTitle = ref('新建主计划')
const isDetail = ref(false)
const formRef = ref()

const form = ref({
  id: null,
  status: '草稿',
  leader: '',
  category: '交通类',
  customerCode: '',
  orderNo: '',
  orderDate: '',
  productName: '',
  componentNo: '',
  length: '',
  orderQty: 0,
  alloyStatus: '',
  unitWeight: '',
  weight: '',
  customerPartNo: '',
  customerProductName: '',
  completedQty: 0,
  remainingQty: 0,
  remainingWeight: '',
  inboundTime: '',
  machineType: '',
  rodPartNo: '',
  hourlyCapacity: '',
  rodDemand: '',
  leadRodQty: 0,
  leadRodLength: '',
  productionTime: '',
  rodArrivalDate: '',
  remark: '',
  attention: ''
})

const rules = {
  orderNo: [{ required: true, message: t('pages.masterPlan.validation.orderNoRequired'), trigger: 'blur' }],
  leader: [{ required: true, message: t('pages.masterPlan.validation.leaderRequired'), trigger: 'blur' }],
  productName: [{ required: true, message: t('pages.masterPlan.validation.productNameRequired'), trigger: 'blur' }]
}

const mockExtrusion = [
  { 
    id: 1, status: '草稿', leader: '张主管', category: '电子类', customerCode: 'CUST001', orderNo: 'ORD-2026-001', 
    orderDate: '2026-04-11', productName: 'FC63', componentNo: 'C-6063-V1', 
    length: '6000mm', orderQty: 1000, alloyStatus: '已均质', unitWeight: '2.5kg/m', weight: '15000kg', 
    customerPartNo: 'CL-A100', customerProductName: '客户专用型材', completedQty: 200, 
    remainingQty: 800, remainingWeight: '12000kg', inboundTime: '2026-04-20 10:00:00', 
    machineType: '2500T', rodPartNo: 'ROD-6063-178', hourlyCapacity: '500kg/h', 
    rodDemand: '200pcs', leadRodQty: 2, leadRodLength: '500mm', productionTime: '2026-04-15 08:00:00', 
    rodArrivalDate: '2026-04-13', remark: '急单', attention: '注意表面处理' 
  },
  { 
    id: 2, status: '已下发', leader: '王主管', category: '交通类', customerCode: 'CUST003', orderNo: 'ORD-2026-002', 
    orderDate: '2026-04-12', productName: 'FC115', componentNo: 'C-6061-V2', 
    length: '5000mm', orderQty: 800, alloyStatus: '已均质', unitWeight: '3.0kg/m', weight: '12000kg', 
    customerPartNo: 'CL-B200', customerProductName: '标准型材', completedQty: 800, 
    remainingQty: 0, remainingWeight: '0kg', inboundTime: '2026-04-21 10:00:00', 
    machineType: '2000T', rodPartNo: 'ROD-6061-178', hourlyCapacity: '400kg/h', 
    rodDemand: '150pcs', leadRodQty: 1, leadRodLength: '400mm', productionTime: '2026-04-16 08:00:00', 
    rodArrivalDate: '2026-04-14', remark: '正常单', attention: '无' 
  }
]

const mockMelting = [
  { 
    id: 3, status: '已下发', leader: '李经理', category: '交通类', customerCode: 'CUST002', orderNo: 'ORD-MELT-001', 
    orderDate: '2026-04-10', productName: 'FC26', componentNo: 'C-6061-V2', 
    length: '6500mm', orderQty: 500, alloyStatus: '熔炼中', unitWeight: '30kg/pc', weight: '15000kg', 
    customerPartNo: 'CR-B200', customerProductName: '客户专用铝棒', completedQty: 100, 
    remainingQty: 400, remainingWeight: '12000kg', inboundTime: '2026-04-18 14:00:00', 
    machineType: '15T熔炼炉', rodPartNo: 'N/A', hourlyCapacity: '2000kg/h', 
    rodDemand: 'N/A', leadRodQty: 0, leadRodLength: '0', productionTime: '2026-04-12 12:00:00', 
    rodArrivalDate: '2026-04-11', remark: '常规生产', attention: '注意镁含量' 
  }
]

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockExtrusion
    meltingData.value = mockMelting
    total.value = activeTab.value === 'extrusion' ? mockExtrusion.length : mockMelting.length
    loading.value = false
  }, 300)
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.value = {
    orderNo: '',
    customerCode: '',
    componentNo: '',
    productName: ''
  }
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新建主计划'
  isDetail.value = false
  form.value = {
    id: null, status: '草稿', leader: '', category: '交通类', customerCode: '', orderNo: '', 
    orderDate: '', productName: '', componentNo: '', length: '', orderQty: 0, 
    alloyStatus: '', unitWeight: '', weight: '', customerPartNo: '', customerProductName: '', 
    completedQty: 0, remainingQty: 0, remainingWeight: '', inboundTime: '', machineType: '', 
    rodPartNo: '', hourlyCapacity: '', rodDemand: '', leadRodQty: 0, leadRodLength: '', 
    productionTime: '', rodArrivalDate: '', remark: '', attention: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑主计划'
  isDetail.value = false
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDetail = (row: any) => {
  dialogTitle.value = '主计划详情'
  isDetail.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(t('pages.masterPlan.messages.saveSuccess'))
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(t('pages.masterPlan.messages.deleteConfirm', { orderNo: row.orderNo }), t('literal.警告'), {
    confirmButtonText: t('common.actions.confirm'),
    cancelButtonText: t('common.actions.cancel'),
    type: 'warning'
  }).then(() => {
    ElMessage.success(t('pages.masterPlan.messages.deleteSuccess'))
    loadData()
  })
}

const handleExport = () => ElMessage.info(t('pages.masterPlan.messages.exportInProgress'))

const importDialogVisible = ref(false)
const selectedFile = ref<File | null>(null)

const handleImport = () => {
  selectedFile.value = null
  importDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

const submitImport = () => {
  if (!selectedFile.value) return
  ElMessage.success(t('pages.masterPlan.messages.importSuccess', { fileName: selectedFile.value.name }))
  importDialogVisible.value = false
}

const handleSizeChange = (val: number) => { pageSize.value = val; loadData() }
const handleCurrentChange = (val: number) => { currentPage.value = val; loadData() }

onMounted(() => loadData())
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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
.plan-tabs {
  margin-bottom: 20px;
}
:deep(.el-divider__text) {
  font-weight: bold;
  color: #409EFF;
}
</style>
