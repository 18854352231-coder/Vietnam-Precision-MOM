<template>
  <div class="page-container">
    <el-card class="full-card">
      <div class="search-wrapper">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="栈板编号">
            <el-input v-model="searchForm.palletNo" placeholder="请输入栈板编号" clearable />
          </el-form-item>
          <el-form-item label="挤压批次号">
            <el-input v-model="searchForm.batchNo" placeholder="请输入挤压批次号" clearable />
          </el-form-item>
          <el-form-item label="客户代码">
            <el-input v-model="searchForm.customerCode" placeholder="请输入客户代码" clearable />
          </el-form-item>
          <el-form-item label="客户料号">
            <el-input v-model="searchForm.customerMaterialCode" placeholder="请输入客户料号" clearable />
          </el-form-item>
          <el-form-item label="成分料号">
            <el-input v-model="searchForm.productNo" placeholder="请输入成分料号" clearable />
          </el-form-item>
          <el-form-item label="模具号">
            <el-input v-model="searchForm.moldNo" placeholder="请输入模具号" clearable />
          </el-form-item>
          <el-form-item label="炉次号">
            <el-input v-model="searchForm.furnaceNo" placeholder="请输入炉次号" clearable />
          </el-form-item>
          <el-form-item label="栈板类型">
            <el-select v-model="searchForm.palletType" placeholder="请选择类型" clearable style="width: 140px">
              <el-option label="正常生产" value="正常生产" />
              <el-option label="验证料" value="验证料" />
              <el-option label="客户需求" value="客户需求" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-tabs v-model="activeTab" class="workbench-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="称重" name="待称重"></el-tab-pane>
        <el-tab-pane label="入库" name="待入库"></el-tab-pane>
      </el-tabs>

      <el-table :data="filteredTableData" border stripe height="calc(100vh - 330px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="palletNo" label="栈板编号" width="170" show-overflow-tooltip />
        <el-table-column prop="palletType" label="栈板类型" width="100" />
        <el-table-column prop="customerCode" label="客户代码" width="100" />
        <el-table-column label="客户名称" width="170" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.customerName || row.customerMaterialName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="customerMaterialCode" label="客户料号" width="130" show-overflow-tooltip />
        <el-table-column prop="quantity" label="数量(支)" width="100" align="right" />
        <el-table-column prop="netWeight" label="净重" width="100" align="right" />
        <el-table-column prop="grossWeight" label="总重" width="100" align="right" />
        <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
        <el-table-column prop="furnaceNo" label="炉次号" width="120" show-overflow-tooltip />
        <el-table-column prop="lotNo" label="批次号" width="150" show-overflow-tooltip />
        <el-table-column prop="productName" label="厂内名称" width="150" show-overflow-tooltip />
        <el-table-column prop="productNo" label="成分料号" width="140" show-overflow-tooltip />
        <el-table-column prop="quality" label="品保" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.quality === 'OK' ? 'success' : (row.quality === 'NG' ? 'danger' : 'info')" size="small">
              {{ row.quality || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="judger" label="判定人" width="100" align="center" />
        <el-table-column prop="cuttingTeam" label="裁切班组" width="100" align="center" />
        <el-table-column prop="mfgDate" label="生产日期" width="140" align="center" />
        <el-table-column prop="finishTime" label="完工时间" width="160" align="center" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="operation-actions">
              <el-button v-if="activeTab === '待称重'" link type="primary" size="small" @click="openWeighDialog(row)">称重</el-button>
              <template v-if="activeTab === '待入库'">
                <el-button link type="primary" size="small" @click="openStorageDialog(row)">入库</el-button>
                <el-button link type="success" size="small" @click="openPrintDialog(row)">打印标识卡</el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredTableData.length"
        />
      </div>
    </el-card>

    <!-- 称重弹窗 -->
    <el-dialog v-model="weighDialogVisible" title="称重" width="500px">
      <el-form :model="storageForm" label-width="100px">
        <el-form-item label="栈板编号" required>
          <el-input v-model="storageForm.palletNo" placeholder="请输入栈板编号" />
        </el-form-item>
        <el-form-item label="产品名称">
          <span>{{ storageForm.productName }} ({{ storageForm.productNo }})</span>
        </el-form-item>
        <el-form-item label="数量(支)">
          <span>{{ storageForm.quantity }}</span>
        </el-form-item>
        <el-form-item label="总重(KG)" required>
          <el-input-number v-model="storageForm.grossWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" @change="calculateNetWeight" />
        </el-form-item>
        <el-form-item label="皮重(KG)" required>
          <el-input-number v-model="storageForm.tareWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" @change="calculateNetWeight" />
        </el-form-item>
        <el-form-item label="净重(KG)">
          <el-input-number v-model="storageForm.netWeight" :min="0" :precision="2" :step="0.1" disabled style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="weighDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWeigh">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 入库弹窗 -->
    <el-dialog v-model="storageDialogVisible" title="入库" width="500px">
      <el-form :model="storageForm" label-width="100px">
        <el-form-item label="栈板编号">
          <el-input v-model="storageForm.palletNo" disabled />
        </el-form-item>
        <el-form-item label="净重(KG)">
          <el-input-number v-model="storageForm.netWeight" :min="0" :precision="2" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="总重(KG)">
          <el-input-number v-model="storageForm.grossWeight" :min="0" :precision="2" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="入库库位" required>
          <el-select v-model="storageForm.location" placeholder="请选择入库库位" style="width: 100%">
            <el-option label="成品A区" value="A区" />
            <el-option label="成品B区" value="B区" />
            <el-option label="待发货区" value="C区" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="storageDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStorage">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 打印标示单弹窗 -->
    <el-dialog v-model="printDialogVisible" title="打印标识卡预览" width="850px" destroy-on-close>
      <div id="printArea" class="print-label-wrapper">
        <div class="print-header">
          <div class="logo-area">
            <img :src="brandLogo" alt="Innovation Precision" class="label-logo" />
          </div>
          <div class="company-info">
            <div class="company-name-vn">CÔNG TY TNHH INNOVATION PRECISION VIỆT NAM</div>
            <div class="company-name-en">INNOVATION PRECISION VIETNAM CO., LTD.</div>
            <div class="company-name-cn">创新精密（越南）有限公司</div>
            <div class="company-addr">Số 3, Đường số 4, Khu Công nghiệp VSIP Nghệ An, Xã Hưng Nguyên, Tỉnh Nghệ An, Việt Nam.</div>
            <div class="company-addr">No. 3, Road No. 4, VSIP Nghe An Industrial Park, Hung Nguyen Commune, Nghe An Province, Vietnam.</div>
            <div class="label-title-vn">TEM BIỂU THỊ SẢN PHẨM</div>
            <div class="label-title-en">PRODUCT LABEL</div>
            <div class="label-title-cn">产品标识卡</div>
          </div>
        </div>

        <table class="print-table">
          <tbody>
            <tr>
              <td class="label-cell">Mã khách hàng<br>Customer Code<br>客户代码</td>
              <td class="value-cell">{{ printData.customerCode }}</td>
              <td class="label-cell">Tên khách hàng<br>Customer Name<br>客户名称</td>
              <td class="value-cell">{{ printData.customerName || printData.customerMaterialName }}</td>
              <td class="label-cell">Mã liệu khách hàng<br>Customer's material code<br>客户料号</td>
              <td class="value-cell">{{ printData.customerMaterialCode }}</td>
            </tr>
            <tr>
              <td class="label-cell">Số lượng-Q'ty<br>数量</td>
              <td class="value-cell">{{ printData.quantity }}</td>
              <td class="label-cell">Trọng lượng tịnh<br>Net Weight<br>净重</td>
              <td class="value-cell">{{ printData.netWeight }}</td>
              <td class="label-cell">Trọng lượng gồm bao bì<br>Gross Weight<br>总重</td>
              <td class="value-cell">{{ printData.grossWeight }}</td>
            </tr>
            <tr>
              <td class="label-cell">Số khuôn-Die No.<br>模具号</td>
              <td class="value-cell">{{ printData.moldNo }}</td>
              <td class="label-cell">Số lò-Furnaces No.<br>炉次号</td>
              <td class="value-cell">{{ printData.furnaceNo }}</td>
              <td class="label-cell">Số lô hàng-Lot No.<br>批次号</td>
              <td class="value-cell">{{ printData.lotNo }}</td>
            </tr>
            <tr>
              <td class="label-cell">Tên sản phẩm<br>Product Name<br>厂内名称</td>
              <td class="value-cell">{{ printData.productName }}</td>
              <td class="label-cell">Mã liệu sản phẩm<br>Product material code<br>成分料号</td>
              <td class="value-cell">{{ printData.productNo }}</td>
              <td class="label-cell">Chất lượng-Quanlity<br>品保</td>
              <td class="value-cell"></td>
            </tr>
            <tr>
              <td class="label-cell">Tổ cắt-Cutting team<br>裁切班组</td>
              <td class="value-cell">{{ printData.cuttingTeam }}</td>
              <td class="label-cell">Số mã pallet-Pallet No.<br>栈板编号</td>
              <td class="value-cell">{{ printData.palletNo }}</td>
              <td class="label-cell">Ngày sản xuất MFG date<br>生产日期</td>
              <td class="value-cell">{{ printData.mfgDate }}</td>
            </tr>
          </tbody>
        </table>

        <div class="print-footer">
          <div class="marks-row">
            <div class="mark-box">
              <div class="mark-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                  <path d="M6 2h12v7c0 2.5-1.5 4.5-3.5 5.5v5.5h3v2H6.5v-2h3v-5.5C7.5 13.5 6 11.5 6 9V2zm2 2v5c0 1.5 1.5 3 4 3s4-1.5 4-3V4H8zm3 2h2v3h-2V6z"/>
                  <path d="M14 2l-3 4 2 2-4 5" stroke="white" stroke-width="1.5" fill="none"/>
                </svg>
              </div>
              <div class="mark-text">FRAGILE</div>
            </div>
            <div class="mark-box">
              <div class="mark-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                  <path d="M12 2C6.5 2 2 6.5 2 12h9v7c0 1.66 1.34 3 3 3s3-1.34 3-3v-1h-2v1c0 .55-.45 1-1 1s-1-.45-1-1v-7h9C22 6.5 17.5 2 12 2zm0 2c4.42 0 8 3.13 8 7H4c0-3.87 3.58-7 8-7z"/>
                  <path d="M7 14c0 1.1-.9 2-2 2s-2-.9-2-2 2-4 2-4 2 2.9 2 4zm14 0c0 1.1-.9 2-2 2s-2-.9-2-2 2-4 2-4 2 2.9 2 4z"/>
                </svg>
              </div>
              <div class="mark-text">KEEP DRY</div>
            </div>
            <div class="mark-box">
              <div class="mark-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                  <path d="M9 3L5 7h3v14h2V7h3L9 3zm6 0l-4 4h3v14h2V7h3l-4-4z"/>
                </svg>
              </div>
              <div class="mark-text">UP</div>
            </div>
            <div class="mark-box">
              <div class="mark-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                  <path d="M14.5 10c-1 0-2 .5-2 1.5v3L9 12.5 5 16v2h14v-2l-4.5-6zm-7.5 7h10l2.5 3H4.5l2.5-3z"/>
                  <path d="M2 12L22 12" stroke="white" stroke-width="2"/>
                </svg>
              </div>
              <div class="mark-text">NO STEPPING</div>
            </div>
          </div>
          <div class="footer-contact">
            <div>电话（Tel）：0238.375.3333</div>
            <div>MADE IN VIETNAM</div>
            <div>网站(Website):www.sdcxjt.com</div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="printDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePrint">打 印</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { loadPendingStorageRecords, savePendingStorageRecords } from '@/utils/pendingStorageFlow'
import brandLogo from '@/assets/logo-wide.png'

useTaskLiteralDomI18n()

const activeTab = ref('待称重')

const handleTabChange = () => {
  selectedRows.value = []
}

const searchForm = ref({
  palletNo: '',
  batchNo: '',
  customerCode: '',
  customerMaterialCode: '',
  productNo: '',
  moldNo: '',
  furnaceNo: '',
  palletType: ''
})

const currentPage = ref(1)
const pageSize = ref(20)
const selectedRows = ref<any[]>([])

const defaultTableData = [
  {
    id: 1,
    batchNo: 'PKG-20260511-001',
    productNo: 'P-1001',
    productName: 'FC36',
    quantity: 100,
    sourceProcess: '包装',
    finishTime: '2026-05-11 09:30:00',
    operator: '张三',
    status: '待称重',
    customerCode: 'CUST-001',
    customerName: '客户A',
    customerMaterialCode: 'C-MAT-001',
    netWeight: 250.5,
    grossWeight: 252.0,
    palletType: '正常生产',
    moldNo: 'M10-0649-200',
    furnaceNo: 'F-2026-001',
    lotNo: 'L-20260511-01',
    quality: 'OK',
    judger: '王五',
    cuttingTeam: '裁切一班',
    palletNo: 'PLT-001',
    mfgDate: '2026-05-11'
  },
  {
    id: 2,
    batchNo: 'PKG-20260511-002',
    productNo: 'P-1002',
    productName: 'FC18',
    quantity: 150,
    sourceProcess: '包装',
    finishTime: '2026-05-11 10:15:00',
    status: '待入库',
    customerCode: 'CUST-002',
    customerName: '客户B',
    customerMaterialCode: 'C-MAT-002',
    netWeight: 300.0,
    grossWeight: 301.5,
    palletType: '验证料',
    moldNo: 'M10-0721-104',
    furnaceNo: 'F-2026-002',
    lotNo: 'L-20260511-02',
    quality: 'NG',
    judger: '赵六',
    cuttingTeam: '裁切二班',
    palletNo: 'PLT-002',
    mfgDate: '2026-05-11'
  },
  {
    id: 3,
    batchNo: 'PKG-20260511-003',
    productNo: 'P-1001',
    productName: 'FC16',
    quantity: 80,
    sourceProcess: '包装',
    finishTime: '2026-05-11 11:00:00',
    operator: '张三',
    status: '待入库',
    customerCode: 'CUST-001',
    customerName: '客户A',
    customerMaterialCode: 'C-MAT-001',
    netWeight: 200.0,
    grossWeight: 201.5,
    palletType: '客户需求',
    moldNo: 'M10-0649-200',
    furnaceNo: 'F-2026-001',
    lotNo: 'L-20260511-03',
    quality: 'OK',
    judger: '王五',
    cuttingTeam: '裁切一班',
    palletNo: 'PLT-003',
    mfgDate: '2026-05-11'
  }
]

const tableData = ref(loadPendingStorageRecords(defaultTableData))

const filteredTableData = computed(() => {
  const keywordMatch = (source: unknown, keyword: string) =>
    String(source ?? '').toLowerCase().includes(keyword.trim().toLowerCase())

  return tableData.value.filter((item) => {
    if (item.status !== activeTab.value) return false

    if (searchForm.value.palletNo && !keywordMatch(item.palletNo, searchForm.value.palletNo)) {
      return false
    }
    if (searchForm.value.palletType && item.palletType !== searchForm.value.palletType) {
      return false
    }
    if (searchForm.value.batchNo && !keywordMatch(item.batchNo, searchForm.value.batchNo) && !keywordMatch(item.lotNo, searchForm.value.batchNo)) {
      return false
    }
    if (searchForm.value.customerCode && !keywordMatch(item.customerCode, searchForm.value.customerCode)) {
      return false
    }
    if (searchForm.value.customerMaterialCode && !keywordMatch(item.customerMaterialCode, searchForm.value.customerMaterialCode)) {
      return false
    }
    if (searchForm.value.productNo && !keywordMatch(item.productNo, searchForm.value.productNo)) {
      return false
    }
    if (searchForm.value.moldNo && !keywordMatch(item.moldNo, searchForm.value.moldNo)) {
      return false
    }
    if (searchForm.value.furnaceNo && !keywordMatch(item.furnaceNo, searchForm.value.furnaceNo)) {
      return false
    }

    return true
  })
})

const handleSearch = () => {
  ElMessage.success(`查询完成，共匹配 ${filteredTableData.value.length} 条数据`)
}

const handleReset = () => {
  searchForm.value = {
    palletNo: '',
    batchNo: '',
    customerCode: '',
    customerMaterialCode: '',
    productNo: '',
    moldNo: '',
    furnaceNo: '',
    palletType: ''
  }
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const weighDialogVisible = ref(false)
const storageDialogVisible = ref(false)
const storageForm = ref<any>({
  id: 0,
  batchNo: '',
  palletNo: '',
  productNo: '',
  productName: '',
  quantity: 0,
  grossWeight: 0,
  tareWeight: 1.5, // 默认木托/纸箱皮重
  netWeight: 0,
  quality: '',
  location: 'A区'
})

const calculateNetWeight = () => {
  const gross = Number(storageForm.value.grossWeight || 0)
  const tare = Number(storageForm.value.tareWeight || 0)
  const net = Math.max(gross - tare, 0)
  storageForm.value.netWeight = Number(net.toFixed(2))
}

const openWeighDialog = (row: any) => {
  storageForm.value = {
    id: row.id,
    batchNo: row.batchNo,
    palletNo: row.palletNo || '',
    productNo: row.productNo,
    productName: row.productName,
    quantity: row.quantity,
    grossWeight: row.grossWeight || 0,
    tareWeight: row.tareWeight ?? 1.5,
    netWeight: row.netWeight || 0,
    quality: row.quality || '',
    location: ''
  }
  calculateNetWeight()
  weighDialogVisible.value = true
}

const submitWeigh = () => {
  calculateNetWeight()
  if (!storageForm.value.palletNo) {
    ElMessage.warning('请输入栈板编号')
    return
  }
  if (storageForm.value.grossWeight <= 0) {
    ElMessage.warning('请输入有效的总重')
    return
  }
  if (storageForm.value.grossWeight <= storageForm.value.tareWeight) {
    ElMessage.warning('总重必须大于皮重')
    return
  }
  if (storageForm.value.netWeight <= 0) {
    ElMessage.warning('净重必须大于 0')
    return
  }

  const index = tableData.value.findIndex(item => item.id === storageForm.value.id)
  if (index !== -1) {
    tableData.value[index].palletNo = storageForm.value.palletNo
    tableData.value[index].grossWeight = storageForm.value.grossWeight
    tableData.value[index].tareWeight = storageForm.value.tareWeight
    tableData.value[index].netWeight = storageForm.value.netWeight
    tableData.value[index].status = '待入库'
    savePendingStorageRecords(tableData.value)
  }

  ElMessage.success(`栈板 ${storageForm.value.palletNo} 称重完成，已流转至入库列表`)
  weighDialogVisible.value = false
}

const openStorageDialog = (row: any) => {
  storageForm.value = {
    id: row.id,
    batchNo: row.batchNo,
    palletNo: row.palletNo,
    productNo: row.productNo,
    productName: row.productName,
    quantity: row.quantity,
    grossWeight: row.grossWeight || 0,
    tareWeight: row.tareWeight ?? 1.5,
    netWeight: row.netWeight || 0,
    quality: row.quality || '',
    location: 'A区'
  }
  storageDialogVisible.value = true
}

const submitStorage = () => {
  if (!storageForm.value.location) {
    ElMessage.warning('请选择入库库位')
    return
  }
  if (Number(storageForm.value.netWeight || 0) <= 0) {
    ElMessage.warning('净重必须大于 0，请重新称重')
    return
  }

  const index = tableData.value.findIndex(item => item.id === storageForm.value.id)
  if (index !== -1) {
    tableData.value[index].status = '已入库'
    tableData.value[index].location = storageForm.value.location
    savePendingStorageRecords(tableData.value)
  }

  ElMessage.success(`栈板 ${storageForm.value.palletNo} 已成功入库至 ${storageForm.value.location}`)
  storageDialogVisible.value = false
}

// 打印相关
const printDialogVisible = ref(false)
const printData = ref<any>({})

const openPrintDialog = (row: any) => {
  printData.value = { ...row }
  printDialogVisible.value = true
}

const handlePrint = () => {
  const printContent = document.getElementById('printArea')
  if (!printContent) return
  
  const windowP = window.open('', '', 'width=1000,height=800')
  if (!windowP) {
    ElMessage.error('无法打开打印窗口，请检查浏览器拦截设置')
    return
  }
  
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('')
      } catch (e) {
        return ''
      }
    })
    .join('\n')

  windowP.document.write(`
    <html>
      <head>
        <title>打印产品标识卡</title>
        <style>
          body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; margin: 0; padding: 20px; }
          .print-label-wrapper { width: 100%; max-width: 800px; margin: 0 auto; border: 1px solid #000; padding: 10px; box-sizing: border-box; }
          .print-header { text-align: center; position: relative; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; }
          .logo-area { position: absolute; left: 10px; top: 10px; }
          .label-logo { display: block; width: 150px; height: auto; }
          .company-info { text-align: center; flex: 1; }
          .company-name-vn { font-size: 14px; font-weight: bold; }
          .company-name-en { font-size: 14px; font-weight: bold; }
          .company-name-cn { font-size: 16px; font-weight: bold; }
          .company-addr { font-size: 10px; margin-top: 2px; }
          .label-title-vn { font-size: 14px; font-weight: bold; margin-top: 5px; }
          .label-title-en { font-size: 14px; font-weight: bold; }
          .label-title-cn { font-size: 18px; font-weight: bold; letter-spacing: 5px; }
          .print-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed; }
          .print-table th, .print-table td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
          .label-cell { background-color: #f5f5f5; width: 15%; }
          .value-cell { width: 18%; text-align: center; }
          .print-footer { border: 1px solid #000; border-top: none; }
          .marks-row { display: flex; justify-content: space-around; padding: 10px; border-bottom: 1px solid #000; }
          .mark-box { background-color: #d32f2f; color: white; width: 120px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; }
          .mark-icon { margin-bottom: 2px; display: flex; align-items: center; justify-content: center; }
          .footer-contact { display: flex; justify-content: space-between; padding: 5px 10px; font-size: 12px; }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `)
  windowP.document.close()
  windowP.focus()

  const startPrint = () => setTimeout(() => {
    windowP.print()
    windowP.close()

    // 打印完成后不改变状态，因为已与入库合并
    printDialogVisible.value = false
    ElMessage.success('打印完成')
  }, 100)

  const images = Array.from(windowP.document.images)
  Promise.all(images.map(image => image.complete
    ? Promise.resolve()
    : new Promise<void>(resolve => {
      image.onload = () => resolve()
      image.onerror = () => resolve()
    })
  )).then(startPrint)
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
.pagination-container { margin-top: 16px; display: flex; justify-content: flex-end; }
.operation-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}
:deep(.operation-actions .el-button) {
  margin-left: 0;
}

/* 打印标示单样式 */
.print-label-wrapper { width: 100%; max-width: 800px; margin: 0 auto; border: 1px solid #000; padding: 10px; box-sizing: border-box; background: #fff; color: #000; }
.print-header { text-align: center; position: relative; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; }
.logo-area { position: absolute; left: 10px; top: 10px; }
.label-logo { display: block; width: 150px; height: auto; }
.company-info { text-align: center; flex: 1; }
.company-name-vn { font-size: 14px; font-weight: bold; line-height: 1.2; }
.company-name-en { font-size: 14px; font-weight: bold; line-height: 1.2; }
.company-name-cn { font-size: 16px; font-weight: bold; line-height: 1.2; }
.company-addr { font-size: 10px; margin-top: 2px; line-height: 1.2; }
.label-title-vn { font-size: 14px; font-weight: bold; margin-top: 5px; line-height: 1.2; }
.label-title-en { font-size: 14px; font-weight: bold; line-height: 1.2; }
.label-title-cn { font-size: 18px; font-weight: bold; letter-spacing: 5px; line-height: 1.2; }
.print-table { width: 100%; border-collapse: collapse; margin-bottom: 0; table-layout: fixed; }
.print-table th, .print-table td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; line-height: 1.4; color: #000; }
.label-cell { width: 15%; background: transparent; }
.value-cell { width: 18%; text-align: center; }
.print-footer { border: 1px solid #000; border-top: none; }
.marks-row { display: flex; justify-content: space-around; padding: 10px; border-bottom: 1px solid #000; }
.mark-box { background-color: #d32f2f; color: white; width: 120px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; }
.mark-icon { margin-bottom: 2px; display: flex; align-items: center; justify-content: center; }
.footer-contact { display: flex; justify-content: space-between; padding: 5px 10px; font-size: 12px; }
</style>
