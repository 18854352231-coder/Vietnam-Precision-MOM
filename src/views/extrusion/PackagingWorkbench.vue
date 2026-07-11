<template>
  <div class="page-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="success" @click="handleClockIn" style="margin-right: 15px">
              {{ isClockedIn ? `已上班 (${currentTeam} - ${clockInTime})` : '上班' }}
            </el-button>
            <el-button type="danger" @click="handleClockOut" style="margin-right: 15px" v-if="isClockedIn">
              下班
            </el-button>
            <span class="workbench-title">包装工作台</span>
          </div>
        </div>
      </template>

      <div class="search-wrapper">
        <el-form class="search-form" :inline="true" :model="searchForm">
          <el-form-item label="框号">
            <el-input v-model="searchForm.frameNo" placeholder="请输入框号" clearable />
          </el-form-item>
          <el-form-item label="挤压批次号">
            <el-input v-model="searchForm.batchNo" placeholder="请输入批次号" clearable />
          </el-form-item>
          <el-form-item label="客户名称">
            <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
          </el-form-item>
          <el-form-item label="模具号">
            <el-input v-model="searchForm.moldNo" placeholder="请输入模具号" clearable />
          </el-form-item>
          <el-form-item label="炉次号">
            <el-input v-model="searchForm.furnaceNo" placeholder="请输入炉次号" clearable />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              range-separator="至"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="action-buttons">
          <el-button 
            type="info" 
            :disabled="selectedRows.length !== 1" 
            @click="handleViewProcessDoc"
          >
            查看工艺文件
          </el-button>
          <el-button
            v-if="activeTab === '料框列表'"
            type="primary"
            :disabled="selectedRows.length !== 1"
            @click="handleTopPack"
          >
            装托
          </el-button>
          <el-button
            v-if="['料框列表', '栈板列表'].includes(activeTab)"
            type="primary"
            :disabled="selectedRows.length === 0"
            @click="handleComplete"
          >
            完工
          </el-button>
          <el-button 
            v-if="['料框列表', '栈板列表'].includes(activeTab)"
            type="danger" 
            :disabled="!hasAnySelection" 
            @click="openScrapDialog"
          >
            来料报废
          </el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="workbench-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="料框列表" name="料框列表"></el-tab-pane>
        <el-tab-pane label="栈板列表" name="栈板列表"></el-tab-pane>
        <el-tab-pane label="已完工" name="已完工"></el-tab-pane>
        <el-tab-pane label="报废列表" name="报废列表"></el-tab-pane>
      </el-tabs>

      <div v-if="activeTab === '报废列表'" style="margin-bottom: 16px;">
        <el-radio-group v-model="scrapType" size="small">
          <el-radio-button label="料框">料框报废</el-radio-button>
          <el-radio-button label="长支">长支报废</el-radio-button>
        </el-radio-group>
      </div>

      <el-table
        :data="paginatedData"
        border
        stripe
        height="calc(100vh - 330px)"
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="['料框列表', '栈板列表'].includes(activeTab)" type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        
        <template v-if="activeTab === '栈板列表'">
          <el-table-column prop="palletNo" label="栈板编号" min-width="150" show-overflow-tooltip />
          <el-table-column prop="frameNo" label="框号" min-width="120" show-overflow-tooltip />
          <el-table-column prop="palletType" label="栈板类型" width="100" />
          <el-table-column prop="shiftTeam" label="班组" width="120" />
          <el-table-column prop="packTime" label="装托时间" width="180" />
          <el-table-column prop="qty" label="数量" width="100" align="right" />
          <el-table-column prop="printCount" label="打印次数" width="90" align="center" />
          <el-table-column prop="printTime" label="打印时间" width="160" />
          <el-table-column label="操作" width="220" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="viewPackDetails(row)">查看明细</el-button>
              <el-button type="primary" link size="small" @click="handlePrintLabel(row)">打印标识卡</el-button>
            </template>
          </el-table-column>
        </template>
        
        <template v-else-if="activeTab === '报废列表'">
          <template v-if="scrapType === '长支'">
            <el-table-column label="二维码编号" min-width="280" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.details && row.details.length > 0 ? row.details[0].code : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="scrapTime" label="报废时间" width="180" />
            <el-table-column prop="scrapReason" label="报废原因" width="150" show-overflow-tooltip />
            <el-table-column prop="shiftTeam" label="报废班组" width="100" />
          </template>
          <template v-else>
            <el-table-column prop="frameNo" label="框号" min-width="120" show-overflow-tooltip />
            <el-table-column prop="scrapCategory" label="报废类型" width="120" />
            <el-table-column prop="scrapReason" label="报废原因" width="150" show-overflow-tooltip />
            <el-table-column prop="scrapRemark" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column prop="scrapTime" label="报废时间" width="180" />
            <el-table-column prop="shiftTeam" label="班组" width="100" />
          </template>
        </template>
        
        <template v-else>
          <el-table-column prop="frameNo" label="框号" width="120" show-overflow-tooltip />
          <el-table-column v-if="activeTab === '已完工'" prop="palletNo" label="栈板编号" min-width="150" show-overflow-tooltip />
          <el-table-column v-if="activeTab === '已完工'" prop="palletType" label="栈板类型" width="100" />
          <el-table-column prop="orderNo" label="订单号" width="160" show-overflow-tooltip />
          <el-table-column prop="batchNo" label="挤压批次号" width="160" show-overflow-tooltip />
          <el-table-column prop="customerCode" label="客户代码" width="90" />
          <el-table-column prop="customerName" label="客户名称" width="140" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" width="140" show-overflow-tooltip />
          <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
          <el-table-column prop="furnaceNo" label="炉次号" width="110" show-overflow-tooltip />
          <el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
          <el-table-column prop="alloy" label="牌号" width="80" />
          <el-table-column v-if="activeTab !== '料框列表'" prop="shiftTeam" label="班组" width="80" />
          <el-table-column prop="length" label="长度(m)" width="90" align="right" />
          <el-table-column prop="qty" label="支数" width="80" align="right" />
          <el-table-column prop="source" label="来源工序" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.source }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="activeTab !== '料框列表'" label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="viewProcessDocument(row)">查看工艺文件</el-button>
            </template>
          </el-table-column>
        </template>
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

    <!-- 装托包装弹窗 -->
    <el-dialog v-model="dialogs.pack.visible" title="物料装托" width="600px">
      <div v-if="currentRow">
        <el-descriptions :column="2" border style="margin-bottom: 20px">
          <el-descriptions-item label="框号">{{ currentRow.frameNo }}</el-descriptions-item>
          <el-descriptions-item label="产品号">{{ currentRow.productNo }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ currentRow.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="框内剩余支数">{{ currentRow.qty }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="dialogs.pack.form" label-width="110px">
          <el-form-item label="栈板编号" required>
            <el-input v-model="dialogs.pack.form.palletNo" placeholder="请输入装托栈板编号" />
          </el-form-item>
          <el-form-item label="栈板类型" required>
            <el-select v-model="dialogs.pack.form.type" placeholder="请选择栈板类型" style="width: 100%">
              <el-option label="正常生产" value="正常生产" />
              <el-option label="验证料" value="验证料" />
              <el-option label="客户需求" value="客户需求" />
            </el-select>
          </el-form-item>
          <el-form-item label="本次装托数量" required>
            <el-input-number v-model="dialogs.pack.form.qtyPerPack" :min="1" :max="currentRow.qty" style="width: 100%" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelPackage">取消</el-button>
          <el-button type="primary" @click="submitPackage">生成托盘并预览标识卡</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 来料报废弹窗 -->
    <el-dialog v-model="dialogs.scrap.visible" title="来料报废" width="600px">
      <el-form :model="dialogs.scrap.form" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报废类型" required>
              <el-select v-model="dialogs.scrap.form.type" placeholder="请选择" style="width: 100%">
                <el-option label="设备类" value="设备类" />
                <el-option label="模具类" value="模具类" />
                <el-option label="工艺类" value="工艺类" />
                <el-option label="操作类" value="操作类" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报废原因" required>
              <el-select v-model="dialogs.scrap.form.reason" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in scrapReasons" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="dialogs.scrap.form.remark" type="textarea" :rows="2" placeholder="选填，输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.scrap.visible = false">取消</el-button>
          <el-button type="primary" @click="submitScrap">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="shortBarPackDialogVisible" title="装托" width="860px" class="short-bar-pack-modal">
      <div v-if="selectedPackRow" class="short-bar-pack-dialog">
          <div class="short-bar-pack-line">来料框号/栈板编号：{{ selectedPackRow.frameNo }}</div>
          
          <div v-if="selectedPackRow.isCoded" style="margin-bottom: 20px;">
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span class="short-bar-pack-label">长支明细 (已选: {{ dialogSelectedDetails.length }})</span>
              <div style="display: flex; gap: 10px; align-items: center;">
                <el-input v-model="selectionRange" placeholder="如 1-5, 8" size="small" style="width: 140px;" clearable @keyup.enter="handleRangeSelection" />
                <el-button type="primary" size="small" @click="handleRangeSelection">快速选择</el-button>
                <el-button type="danger" size="small" :disabled="dialogSelectedDetails.length === 0" @click="openDetailScrapDialog">不良品报工</el-button>
              </div>
            </div>
            <el-table
              ref="detailTableRef"
              :data="selectedPackRow.details"
              border
              stripe
              size="small"
              height="300"
              row-key="id"
              @selection-change="handleDialogDetailSelectionChange"
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="code" label="长支码" min-width="280" show-overflow-tooltip />
              <el-table-column prop="productName" label="产品名称" min-width="140" show-overflow-tooltip />
              <el-table-column prop="fixedLength" label="长支长度" width="140" align="right" />
              <el-table-column label="挤压批次" min-width="180" show-overflow-tooltip>
                <template #default>
                  {{ selectedPackRow.batchNo }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        
        <div v-else class="short-bar-pack-qty-row">
          <span class="short-bar-pack-label">装托数量：</span>
          <el-input-number
            v-model="shortBarPackForm.packQty"
            :min="1"
            :max="Number(selectedPackRow.qty || 0)"
            style="width: 220px"
          />
        </div>
        
        <div class="short-bar-pack-line">班组：{{ shortBarPackForm.team }}</div>
        
        <div class="short-bar-pack-input-row" style="margin-bottom: 16px;">
          <span class="short-bar-pack-label">栈板类型：</span>
          <el-select v-model="shortBarPackForm.palletType" placeholder="请选择栈板类型" style="flex: 1">
            <el-option label="正常生产" value="正常生产" />
            <el-option label="验证料" value="验证料" />
            <el-option label="客户需求" value="客户需求" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeShortBarPackDialog">取消</el-button>
        <el-button type="primary" @click="confirmShortBarPack">确定</el-button>
      </template>
    </el-dialog>

    <!-- 长支报废弹窗 -->
    <el-dialog v-model="detailScrapDialogVisible" title="长支报废" width="400px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="报废原因" required>
          <el-select v-model="detailScrapReason" style="width: 100%" placeholder="请选择报废原因">
            <el-option v-for="item in scrapReasons" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="detailScrapDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDetailScrap">确定</el-button>
      </template>
    </el-dialog>

    <!-- 装托明细弹窗 -->
    <el-dialog v-model="packDetailsDialogVisible" title="装托明细" width="800px">
      <el-table :data="currentPackDetails" border stripe size="small" height="400">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="code" label="长支码" min-width="280" show-overflow-tooltip />
        <el-table-column prop="productName" label="产品名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="fixedLength" label="长支长度" width="140" align="right" />
      </el-table>
      <template #footer>
        <el-button @click="packDetailsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    <!-- 上班签到弹窗 -->
    <el-dialog v-model="clockInDialogVisible" title="上班签到" width="400px">
      <el-form :model="clockInForm" label-width="80px">
        <el-form-item label="上班班组">
          <el-select v-model="clockInForm.team" style="width: 100%">
            <el-option label="甲班" value="甲班" />
            <el-option label="乙班" value="乙班" />
            <el-option label="丙班" value="丙班" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitClockIn">确认</el-button>
      </template>
    </el-dialog>

    <!-- 打印预览弹窗 -->
    <el-dialog v-model="printPreviewVisible" title="物料标识卡" width="800px" top="5vh">
      <div class="label-preview">
        <table class="material-tag-table">
          <tr>
            <td colspan="3" class="tag-title-cell">
              <div class="tag-title-main">Thẻ nhận dạng vật liệu</div>
              <div class="tag-title-sub">Material tag</div>
              <div class="tag-title-sub">物料标识卡</div>
            </td>
            <td colspan="3" class="tag-top-right">
              <div class="tag-top-right-row">
                <span class="tag-top-right-label">Khách hàng</span>
                <span class="tag-top-right-value">{{ previewData.customerName || '-' }}</span>
              </div>
              <div class="tag-checkbox-grid">
                <div class="tag-checkbox-item">
                  <span>Phát triển SP</span><span class="tag-checkbox" :class="{ checked: previewData.isPD }"></span>
                  <span class="tag-checkbox-hint">PD</span>
                </div>
                <div class="tag-checkbox-item">
                  <span>Sản lượng</span><span class="tag-checkbox" :class="{ checked: previewData.isMassProduction }"></span>
                  <span class="tag-checkbox-hint">Mass production</span>
                </div>
                <div class="tag-checkbox-item">
                  <span>Công nghiệp nặng</span><span class="tag-checkbox" :class="{ checked: previewData.isHeavyIndustry }"></span>
                  <span class="tag-checkbox-hint">Heavy industry</span>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td class="tag-key">Tên vật liệu<br />Material name<br />物料名称</td>
            <td class="tag-value">{{ previewData.productName || '-' }}</td>
            <td class="tag-key">Mã số lô<br />Furnaces No.<br />炉次号</td>
            <td class="tag-value">{{ previewData.furnaceNo || '-' }}</td>
            <td colspan="2" rowspan="5" class="tag-qr-cell">
              <div class="tag-qr-box">
                <img v-if="teamQrUrl" :src="teamQrUrl" class="tag-qr-img" alt="team-qr" />
                <div v-else class="tag-qr-placeholder">二维码生成中</div>
              </div>
            </td>
          </tr>

          <tr>
            <td class="tag-key">Số lô đùn<br />Extrusion batch No.<br />挤压批次号</td>
            <td class="tag-value">{{ previewData.extrusionBatch || '-' }}</td>
            <td class="tag-key">Số khuôn<br />Die No.<br />模号</td>
            <td class="tag-value">{{ previewData.moldNo || '-' }}</td>
          </tr>

          <tr>
            <td class="tag-key">Số lượng - Q’ty<br />数量</td>
            <td class="tag-value">{{ previewData.materialQty ?? '-' }} PCS</td>
            <td class="tag-key">Số kê<br />Frame No.<br />框号</td>
            <td class="tag-value">{{ previewData.frameNo || '-' }}</td>
          </tr>

          <tr>
            <td class="tag-key">Chiều dài cố định<br />Fixed length<br />定长</td>
            <td class="tag-value">{{ previewData.fixedLength ?? '-' }} mm</td>
            <td class="tag-key">Số máy<br />Machine No.<br />机台号</td>
            <td class="tag-value">{{ previewData.extrusionMachine || '-' }}</td>
          </tr>

          <tr>
            <td class="tag-key">Đội cắt/đóng gói<br />Cutting team/Packing team<br />裁切/包装班组</td>
            <td class="tag-value">{{ previewData.shiftTeam || '-' }}</td>
            <td class="tag-key">Nhãn hiệu<br />Material grade<br />牌号</td>
            <td class="tag-value">{{ previewData.alloy || '-' }}</td>
          </tr>
        </table>
      </div>

      <template #footer>
        <div class="dialog-footer" style="display: flex; justify-content: flex-end; align-items: center;">
          <el-button @click="printPreviewVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPrint">确定并打印</el-button>
        </div>
      </template>
    </el-dialog>

    <ProcessDocumentDialog
      v-model="processDocDialogVisible"
      process-type="extrusion"
      :product-no="processDocContext.productNo"
      :product-name="processDocContext.productName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import QRCode from 'qrcode'
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { buildMaterialTagPreviewData } from '@/utils/materialTagPreviewData'

useTaskLiteralDomI18n()

// 上下班打卡逻辑
const isClockedIn = ref(false)
const clockInDialogVisible = ref(false)
const currentTeam = ref('')
const clockInTime = ref('')
const clockInForm = ref({ team: '' })

const handleClockIn = () => {
  if (isClockedIn.value) {
    ElMessage.info('您已签到上班')
    return
  }
  clockInDialogVisible.value = true
}

const submitClockIn = () => {
  if (!clockInForm.value.team) {
    ElMessage.warning('请选择上班班组')
    return
  }
  ElMessageBox.confirm(`确认选择 ${clockInForm.value.team} 上班吗？`, '二次确认', {
    type: 'warning'
  }).then(() => {
    isClockedIn.value = true
    currentTeam.value = clockInForm.value.team
    const now = new Date()
    clockInTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    clockInDialogVisible.value = false
    ElMessage.success(`${currentTeam.value} 签到成功`)
  }).catch(() => {})
}

const handleClockOut = () => {
  ElMessageBox.confirm('确定要下班打卡吗？', '下班确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    isClockedIn.value = false
    currentTeam.value = ''
    clockInTime.value = ''
    ElMessage.success('下班打卡成功，辛苦了！')
  }).catch(() => {})
}

// 业务逻辑
const searchForm = ref({
  frameNo: '',
  batchNo: '',
  customerName: '',
  moldNo: '',
  furnaceNo: '',
  timeRange: [] as string[]
})
const currentPage = ref(1)
const pageSize = ref(20)
const activeTab = ref('料框列表')
const scrapType = ref('料框')

const selectedRows = ref<any[]>([])
const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const getRowClassName = ({ row }: { row: any }) => {
  const classes = []
  if (!row.isCoded) classes.push('uncoded-row')
  
  if (activeTab.value === '装托列表') {
    if (row.printCount === 1) classes.push('printed-once-row')
    else if (row.printCount > 1) classes.push('printed-multiple-row')
  }
  
  return classes.join(' ')
}

const handleTabChange = () => {
  selectedRows.value = []
}

const hasAnySelection = computed(() => {
  return selectedRows.value.length > 0
})

// 设计思路：不进行裁切的产品，在时效完成后，自动进入包装数据队列
const tableData = ref([
  {
    id: 1,
    frameNo: 'CV-A-A-L6000*W1250*H650*0001',
    orderNo: 'ORD-20260501-001',
    batchNo: 'EB-20260502-001',
    customerCode: 'CUST-A',
    customerName: '客户A',
    productNo: 'P-1001',
    productName: 'FC28',
    length: '6.0',
    fixedLength: 6000,
    qty: 100,
    source: '时效',
    status: '包装列表',
    furnaceNo: 'F-2026-001',
    moldNo: 'M10-0649-200',
    extrusionMachine: 'JY-35',
    alloy: '6063-T5',
    shiftTeam: '-',
    productionType: '量产',
    finishTime: '2026-07-04 08:30:00',
    isCoded: true,
    details: [
      { id: 11, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260524', productName: 'FC08', productNo: 'P-1001', length: '6.0', qty: 20, status: '料框列表', fixedLength: 6000 },
      { id: 12, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260525', productName: 'FC117', productNo: 'P-1001', length: '6.0', qty: 30, status: '料框列表', fixedLength: 6000 },
      { id: 13, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260526', productName: 'FC29', productNo: 'P-1001', length: '6.0', qty: 50, status: '料框列表', fixedLength: 6000 }
    ]
  },
  {
    id: 2,
    frameNo: 'CV-A-A-L6000*W1250*H650*0002',
    orderNo: 'ORD-20260501-002',
    batchNo: 'EB-20260502-002',
    customerCode: 'CUST-B',
    customerName: '客户B',
    productNo: 'P-2002',
    productName: 'FC71',
    length: '5.8',
    fixedLength: 5800,
    qty: 120,
    source: '时效',
    status: '料框列表',
    furnaceNo: 'F-2026-002',
    moldNo: 'M10-0721-104',
    extrusionMachine: 'JY-07',
    alloy: '6082H',
    shiftTeam: '-',
    productionType: '试产',
    finishTime: '2026-07-04 10:15:00',
    isCoded: false,
    details: []
  },
  {
    id: 3,
    frameNo: 'CV-A-A-L6000*W1250*H650*0003',
    orderNo: 'ORD-20260501-003',
    batchNo: 'EB-20260502-003',
    customerCode: 'CUST-C',
    customerName: '客户C',
    productNo: 'P-3003',
    productName: 'FC103',
    length: '6.0',
    fixedLength: 6000,
    qty: 80,
    source: '时效',
    status: '料框列表',
    furnaceNo: 'F-2026-003',
    moldNo: 'M09-0118-773',
    extrusionMachine: 'JY-21',
    alloy: '6005A',
    shiftTeam: '-',
    productionType: '量产',
    finishTime: '2026-07-04 13:45:00',
    isCoded: true,
    details: [
      { id: 31, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260527', productName: 'FC129', productNo: 'P-3003', length: '6.0', qty: 20, status: '料框列表', fixedLength: 5800 },
      { id: 32, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260528', productName: 'FC29', productNo: 'P-3003', length: '6.0', qty: 30, status: '料框列表', fixedLength: 5800 },
      { id: 33, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260529', productName: 'FC60', productNo: 'P-3003', length: '6.0', qty: 30, status: '料框列表', fixedLength: 5800 }
    ]
  },
  {
    id: 4,
    frameNo: 'CV-A-A-L6000*W1250*H650*0004',
    palletNo: 'JM-9004',
    palletType: '正常生产',
    orderNo: 'ORD-20260501-004',
    batchNo: 'EB-20260502-004',
    customerCode: 'CUST-D',
    customerName: '客户D',
    productNo: 'P-4004',
    productName: 'FC58',
    length: '6.0',
    fixedLength: 6000,
    qty: 200,
    source: '时效',
    status: '已完工',
    furnaceNo: 'F-2026-004',
    moldNo: 'M10-0649-200',
    extrusionMachine: 'JY-35',
    alloy: '6063-T5',
    shiftTeam: '包装一班',
    productionType: '量产',
    finishTime: '2026-07-03 17:20:00',
    isCoded: false,
    details: []
  },
  {
    id: 5,
    frameNo: 'CV-A-A-L6000*W1250*H650*0005',
    orderNo: 'ORD-20260501-005',
    batchNo: 'EB-20260502-005',
    customerCode: 'CUST-E',
    customerName: '客户E',
    productNo: 'P-5005',
    productName: 'FC87',
    length: '6.0',
    fixedLength: 6000,
    qty: 10,
    source: '时效',
    status: '已报废',
    scrapLevel: '料框',
    scrapCategory: '操作类',
    scrapReason: '划伤',
    scrapRemark: '人为操作失误划伤表面',
    scrapTime: '2026-07-02 09:15:00',
    furnaceNo: 'F-2026-005',
    moldNo: 'M10-0649-200',
    extrusionMachine: 'JY-35',
    alloy: '6063-T5',
    shiftTeam: '包装一班',
    productionType: '量产',
    finishTime: '2026-07-02 09:10:00',
    isCoded: true,
    details: [
      { id: 51, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260530', productName: 'FC135', productNo: 'P-5005', length: '6.0', qty: 4, status: '已报废', fixedLength: 6200 },
      { id: 52, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260531', productName: 'FC24', productNo: 'P-5005', length: '6.0', qty: 6, status: '已报废', fixedLength: 6200 }
    ]
  },
  {
    id: 6,
    frameNo: 'CV-A-A-L6000*W1250*H650*0006',
    orderNo: 'ORD-20260501-006',
    batchNo: 'EB-20260502-006',
    customerCode: 'CUST-F',
    customerName: '客户F',
    productNo: 'P-6006',
    productName: 'FC95',
    length: '5.5',
    fixedLength: 5500,
    qty: 64,
    source: '时效',
    status: '料框列表',
    furnaceNo: 'F-2026-006',
    moldNo: 'M12-0216-305',
    extrusionMachine: 'JY-18',
    alloy: '6061RS',
    shiftTeam: '-',
    productionType: '量产',
    finishTime: '2026-07-05 08:40:00',
    isCoded: false,
    details: []
  },
  {
    id: 7,
    frameNo: 'CV-A-A-L6000*W1250*H650*0007',
    orderNo: 'ORD-20260501-007',
    batchNo: 'EB-20260502-007',
    customerCode: 'CUST-G',
    customerName: '客户G',
    productNo: 'P-7007',
    productName: 'FC06',
    length: '6.2',
    fixedLength: 6200,
    qty: 72,
    source: '时效',
    status: '料框列表',
    furnaceNo: 'F-2026-007',
    moldNo: 'M15-0428-117',
    extrusionMachine: 'JY-11',
    alloy: '6063-T5',
    shiftTeam: '包装二班',
    productionType: '量产',
    finishTime: '2026-07-05 09:20:00',
    isCoded: true,
    details: [
      { id: 71, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260541', productName: 'FC25', productNo: 'P-7007', length: '6.2', qty: 12, status: '料框列表', fixedLength: 6200 },
      { id: 72, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260542', productName: 'FC132', productNo: 'P-7007', length: '6.2', qty: 24, status: '料框列表', fixedLength: 6200 },
      { id: 73, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260543', productName: 'FC97', productNo: 'P-7007', length: '6.2', qty: 36, status: '料框列表', fixedLength: 6200 }
    ]
  },
  {
    id: 8,
    palletNo: '20260705-01',
    frameNo: 'CV-A-A-L6000*W1250*H650*0008',
    orderNo: 'ORD-20260501-008',
    batchNo: 'EB-20260502-008',
    customerCode: 'CUST-H',
    customerName: '客户H',
    productNo: 'P-8008',
    productName: 'FC107',
    length: '5.9',
    fixedLength: 5900,
    qty: 54,
    source: '时效',
    status: '装托列表',
    palletType: '正常生产',
    packTime: '2026-07-05 11:15:00',
    printCount: 0,
    printTime: '',
    furnaceNo: 'F-2026-008',
    moldNo: 'M16-0386-204',
    extrusionMachine: 'JY-22',
    alloy: '6005A',
    shiftTeam: '包装一班',
    productionType: '试产',
    finishTime: '2026-07-05 11:05:00',
    isCoded: true,
    details: [
      { id: 81, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260544', productName: 'FC11', productNo: 'P-8008', length: '5.9', qty: 18, status: '装托列表', fixedLength: 5900 },
      { id: 82, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260545', productName: 'FC96', productNo: 'P-8008', length: '5.9', qty: 18, status: '装托列表', fixedLength: 5900 },
      { id: 83, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260546', productName: 'FC08', productNo: 'P-8008', length: '5.9', qty: 18, status: '装托列表', fixedLength: 5900 }
    ]
  },
  {
    id: 9,
    palletNo: '20260705-02',
    frameNo: 'CV-A-A-L6000*W1250*H650*0009',
    orderNo: 'ORD-20260501-009',
    batchNo: 'EB-20260502-009',
    customerCode: 'CUST-I',
    customerName: '客户I',
    productNo: 'P-9009',
    productName: 'FC91',
    length: '5.4',
    fixedLength: 5400,
    qty: 96,
    source: '时效',
    status: '装托列表',
    palletType: '验证料',
    packTime: '2026-07-05 14:20:00',
    printCount: 0,
    printTime: '',
    furnaceNo: 'F-2026-009',
    moldNo: 'M13-0158-602',
    extrusionMachine: 'JY-09',
    alloy: '6061RS',
    shiftTeam: '包装三班',
    productionType: '量产',
    finishTime: '2026-07-05 14:10:00',
    isCoded: false,
    details: []
  },
  {
    id: 10,
    frameNo: 'CV-A-A-L6000*W1250*H650*0010',
    orderNo: 'ORD-20260501-010',
    batchNo: 'EB-20260502-010',
    customerCode: 'CUST-J',
    customerName: '客户J',
    productNo: 'P-1010',
    productName: 'FC63',
    length: '6.0',
    fixedLength: 6000,
    qty: 1,
    source: '时效',
    status: '已报废',
    scrapLevel: '长支',
    scrapCategory: '操作类',
    scrapReason: '划伤',
    scrapRemark: '',
    scrapTime: '2026-07-06 09:15:00',
    furnaceNo: 'F-2026-010',
    moldNo: 'M10-0649-200',
    extrusionMachine: 'JY-35',
    alloy: '6063-T5',
    shiftTeam: '包装一班',
    productionType: '量产',
    finishTime: '2026-07-06 09:10:00',
    isCoded: true,
    details: [
      { id: 101, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260999', productName: 'FC88', productNo: 'P-1010', length: '6.0', qty: 1, status: '已报废', fixedLength: 6000 }
    ]
  },
  {
    id: 11,
    palletNo: '20260707-01',
    frameNo: 'CV-A-A-L6000*W1250*H650*0011',
    orderNo: 'ORD-20260501-011',
    batchNo: 'EB-20260502-011',
    customerCode: 'CUST-K',
    customerName: '客户K',
    productNo: 'P-1111',
    productName: 'FC55',
    length: '6.0',
    fixedLength: 6000,
    qty: 50,
    source: '时效',
    status: '栈板列表',
    palletType: '正常生产',
    packTime: '2026-07-07 10:00:00',
    printCount: 0,
    printTime: '',
    furnaceNo: 'F-2026-011',
    moldNo: 'M11-0111-111',
    extrusionMachine: 'JY-11',
    alloy: '6063-T5',
    shiftTeam: '包装一班',
    productionType: '量产',
    finishTime: '2026-07-07 09:30:00',
    isCoded: false,
    details: []
  },
  {
    id: 12,
    palletNo: '20260707-02',
    frameNo: 'CV-A-A-L6000*W1250*H650*0211',
    orderNo: 'ORD-20260501-012',
    batchNo: 'EB-20260502-012',
    customerCode: 'CUST-L',
    customerName: '客户L',
    productNo: 'P-1212',
    productName: 'FC91',
    length: '5.8',
    fixedLength: 5800,
    qty: 80,
    source: '锯切',
    status: '栈板列表',
    palletType: '验证料',
    packTime: '2026-07-07 10:15:00',
    printCount: 1,
    printTime: '2026-07-07 10:20:00',
    furnaceNo: 'F-2026-012',
    moldNo: 'M12-0222-222',
    extrusionMachine: 'JY-12',
    alloy: '6005A',
    shiftTeam: '包装二班',
    productionType: '试产',
    finishTime: '2026-07-07 09:45:00',
    isCoded: true,
    details: [
      { id: 121, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260801', productName: 'FC39', productNo: 'P-1212', length: '5.8', qty: 40, status: '栈板列表', fixedLength: 5800 },
      { id: 122, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260802', productName: 'FC48', productNo: 'P-1212', length: '5.8', qty: 40, status: '栈板列表', fixedLength: 5800 }
    ]
  }
])

const filteredTableData = computed(() => {
  const keywordMatch = (source: unknown, keyword: string) =>
    String(source ?? '').toLowerCase().includes(keyword.trim().toLowerCase())

  return tableData.value.filter(item => {
    if (activeTab.value === '报废列表') {
      if (item.status !== '已报废') return false
      if (scrapType.value === '料框' && item.scrapLevel !== '料框') return false
      if (scrapType.value === '长支' && item.scrapLevel !== '长支') return false
    } else {
      if (item.status !== activeTab.value) return false
    }

    if (searchForm.value.frameNo && !keywordMatch(item.frameNo, searchForm.value.frameNo)) return false
    if (searchForm.value.batchNo && !keywordMatch(item.batchNo, searchForm.value.batchNo)) return false
    if (searchForm.value.customerName && !keywordMatch(item.customerName, searchForm.value.customerName)) return false
    if (searchForm.value.moldNo && !keywordMatch(item.moldNo, searchForm.value.moldNo)) return false
    if (searchForm.value.furnaceNo && !keywordMatch(item.furnaceNo, searchForm.value.furnaceNo)) return false

    if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
      const [start, end] = searchForm.value.timeRange
      const current = new Date(item.finishTime).getTime()
      if (current < new Date(start).getTime() || current > new Date(end).getTime()) return false
    }

    return true
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTableData.value.slice(start, end)
})

const visibleHasCodedRows = computed(() => paginatedData.value.some(item => item.isCoded))

const currentRow = ref<any>(null)
const dialogs = ref({
  pack: {
    visible: false,
    form: { palletNo: '', type: '', qtyPerPack: 50 }
  },
  scrap: {
    visible: false,
    level: '料框',
    form: { type: '', reason: '', remark: '' }
  }
})

const scrapReasons = ['切斜', '划伤', '取样报废', '变形', '壁厚', '定尺', '尺寸', '平面', '弯扭', '托烂', '模线', '橘皮', '气泡', '直线度', '磕碰伤']
const printPreviewVisible = ref(false)
const previewData = ref<any>({})
const currentPrintRow = ref<any>(null)
const teamQrUrl = ref('')
const processDocDialogVisible = ref(false)
const processDocContext = ref({ productNo: '', productName: '' })
const selectedPackRow = ref<any>(null)
const shortBarPackDialogVisible = ref(false)
const shortBarPackForm = ref({
  team: '',
  goodQty: 0,
  packQty: 1,
  palletType: '正常生产'
})

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.value = {
    frameNo: '',
    batchNo: '',
    customerName: '',
    moldNo: '',
    furnaceNo: '',
    timeRange: []
  }
}

const handleViewProcessDoc = () => {
  const row = selectedRows.value[0]
  if (!row) return
  processDocContext.value = {
    productNo: row.productNo || '',
    productName: row.productName || ''
  }
  processDocDialogVisible.value = true
}

const viewProcessDocument = (row?: any) => {
  processDocContext.value = {
    productNo: row?.productNo || '',
    productName: row?.productName || ''
  }
  processDocDialogVisible.value = true
}

const openPackageDialog = (row: any) => {
  currentRow.value = row
  dialogs.value.pack.form = { palletNo: currentTeam.value || '', type: '', qtyPerPack: row.qty }
  dialogs.value.pack.visible = true
}

const handleTopPack = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择一条包装列表数据')
    return
  }
  if (selectedRows.value.length > 1) {
    ElMessage.warning('装托时只能选择一条数据')
    return
  }

  const [row] = selectedRows.value
  openShortBarPackDialog(row)
}

const dialogSelectedDetails = ref<any[]>([])
const detailTableRef = ref()
const selectionRange = ref('')

const handleDialogDetailSelectionChange = (val: any[]) => {
  dialogSelectedDetails.value = val
}
const detailScrapDialogVisible = ref(false)
const detailScrapReason = ref('')

const packDetailsDialogVisible = ref(false)
const currentPackDetails = ref<any[]>([])

const viewPackDetails = (row: any) => {
  if (row.isCoded && row.details) {
    currentPackDetails.value = row.details
  } else {
    currentPackDetails.value = []
  }
  packDetailsDialogVisible.value = true
}

const handleRangeSelection = () => {
  if (!selectionRange.value) {
    ElMessage.warning('请输入序号范围')
    return
  }
  
  const parts = selectionRange.value.split(',')
  const selectedIndices = new Set<number>()
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-')
      const start = parseInt(startStr.trim(), 10)
      const end = parseInt(endStr.trim(), 10)
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          selectedIndices.add(i)
        }
      }
    } else {
      const num = parseInt(part.trim(), 10)
      if (!isNaN(num)) {
        selectedIndices.add(num)
      }
    }
  }

  if (selectedIndices.size === 0) {
    ElMessage.warning('请输入有效的序号范围，如: 1-5, 8')
    return
  }

  if (detailTableRef.value) {
    detailTableRef.value.clearSelection()
    selectedPackRow.value.details.forEach((row: any, index: number) => {
      if (selectedIndices.has(index + 1)) {
        detailTableRef.value.toggleRowSelection(row, true)
      }
    })
  }
}

const openShortBarPackDialog = (row: any) => {
  selectedPackRow.value = row
  dialogSelectedDetails.value = []
  selectionRange.value = ''
  shortBarPackForm.value = {
    team: currentTeam.value || '包装现场',
    goodQty: 0,
    packQty: row.isCoded ? 0 : Number(row.qty || 0),
    palletType: '正常生产'
  }
  shortBarPackDialogVisible.value = true
}

const handleComplete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要完工的数据')
    return
  }
  
  ElMessageBox.confirm(
    `确认将选中的 ${selectedRows.value.length} 条数据标记为已完工吗？`,
    '完工确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = '已完工'
    })
    selectedRows.value = []
    ElMessage.success('操作成功，数据已流转到已完工列表')
  }).catch(() => {
    // 取消操作
  })
}

const cancelPackage = () => {
  dialogs.value.pack.visible = false
}

const submitPackage = () => {
  if (!dialogs.value.pack.form.palletNo) {
    ElMessage.warning('请输入栈板编号')
    return
  }
  if (!dialogs.value.pack.form.type) {
    ElMessage.warning('请选择栈板类型')
    return
  }

  currentPrintRow.value = currentRow.value
  currentPrintRow.value.packageType = dialogs.value.pack.form.type
  previewData.value = buildMaterialTagPreviewData({
    source: {
      ...currentRow.value,
      frameNo: dialogs.value.pack.form.palletNo, // 使用栈板编号覆盖原来的料框号
      materialQty: dialogs.value.pack.form.qtyPerPack, // 使用本托数量
      fixedLength: currentRow.value.fixedLength || (currentRow.value.length ? Number(currentRow.value.length) * 1000 : '')
    },
    shiftTeam: currentTeam.value || '包装班'
  })
  buildTeamQr(previewData.value.shiftTeam)
  
  dialogs.value.pack.visible = false
  printPreviewVisible.value = true
}

const buildTeamQr = async (teamText: string) => {
  if (!teamText) {
    teamQrUrl.value = ''
    return
  }
  try {
    teamQrUrl.value = await QRCode.toDataURL(teamText, { width: 130, margin: 0 })
  } catch {
    teamQrUrl.value = ''
  }
}

const closeShortBarPackDialog = () => {
  shortBarPackDialogVisible.value = false
  selectedPackRow.value = null
}

const confirmShortBarPack = () => {
  if (!selectedPackRow.value) return
  if (!shortBarPackForm.value.palletType) {
    ElMessage.warning('请选择栈板类型')
    return
  }

  let packedQty = 0
  let isCoded = selectedPackRow.value.isCoded
  let packedDetails = []

  if (isCoded) {
    if (dialogSelectedDetails.value.length === 0) {
      ElMessage.warning('请选择需要装托的长支')
      return
    }

    packedDetails = dialogSelectedDetails.value
    packedQty = packedDetails.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)

    const selectedIds = new Set(packedDetails.map((d: any) => d.id))
    selectedPackRow.value.details = selectedPackRow.value.details.filter((item: any) => !selectedIds.has(item.id))
    dialogSelectedDetails.value = []
  } else {
    const packQty = Number(shortBarPackForm.value.packQty || 0)
    const maxQty = Number(selectedPackRow.value.qty || 0)
    if (!packQty || packQty < 1 || packQty > maxQty) {
      ElMessage.warning('请输入正确的装托数量')
      return
    }
    packedQty = packQty
  }

  selectedPackRow.value.qty = Math.max(0, Number(selectedPackRow.value.qty || 0) - packedQty)

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`
  
  // 生成随机序号 (01 到 99 之间)
  const randomSeq = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')
  const newPalletNo = `${dateStr}-${randomSeq}`

  const newPallet = {
    ...selectedPackRow.value,
    id: Date.now(),
    palletNo: newPalletNo,
    qty: packedQty,
    status: '装托列表',
    palletType: shortBarPackForm.value.palletType,
    packTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    printCount: 0,
    printTime: '',
    isCoded: isCoded,
    details: packedDetails
  }
  tableData.value.unshift(newPallet)

  if (selectedPackRow.value.qty <= 0) {
    const index = tableData.value.findIndex(item => item.id === selectedPackRow.value.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
  }

  shortBarPackDialogVisible.value = false
  selectedPackRow.value = null
  selectedRows.value = []
  ElMessage.success('装托完成，已生成装托数据')
}

const openScrapDialog = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要报废的料框')
    return
  }

  dialogs.value.scrap.level = '料框'
  dialogs.value.scrap.form = { type: '', reason: '', remark: '' }
  dialogs.value.scrap.visible = true
}

const submitScrap = () => {
  if (!dialogs.value.scrap.form.type) {
    ElMessage.warning('请选择报废类型')
    return
  }
  if (!dialogs.value.scrap.form.reason) {
    ElMessage.warning('请选择报废原因')
    return
  }

  const scrapTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  selectedRows.value.forEach(row => {
    row.status = '已报废'
    row.scrapLevel = '料框'
    row.scrapCategory = dialogs.value.scrap.form.type
    row.scrapReason = dialogs.value.scrap.form.reason
    row.scrapRemark = dialogs.value.scrap.form.remark
    row.scrapTime = scrapTime
    if (currentTeam.value) row.shiftTeam = currentTeam.value
  })
  ElMessage.success(`成功登记 ${selectedRows.value.length} 条料框报废`)
  
  selectedRows.value = []
  dialogs.value.scrap.visible = false
}

const openDetailScrapDialog = () => {
  if (dialogSelectedDetails.value.length === 0) {
    ElMessage.warning('请选择要报废的长支')
    return
  }
  detailScrapReason.value = ''
  detailScrapDialogVisible.value = true
}

const submitDetailScrap = () => {
  if (!detailScrapReason.value) {
    ElMessage.warning('请选择报废原因')
    return
  }

  const scrappedDetails = dialogSelectedDetails.value
  const scrapCount = scrappedDetails.length
  
  const selectedIds = new Set(scrappedDetails.map(d => d.id))
  selectedPackRow.value.details = selectedPackRow.value.details.filter((d: any) => !selectedIds.has(d.id))
  
  selectedPackRow.value.qty -= scrappedDetails.reduce((sum: number, d: any) => sum + Number(d.qty || 0), 0)
  
  const scrapTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  scrappedDetails.forEach((detail: any) => {
    const scrapRecord = {
      ...selectedPackRow.value,
      id: Date.now() + Math.random(),
      status: '已报废',
      scrapLevel: '长支',
      qty: detail.qty || 1,
      isCoded: true,
      details: [detail],
      scrapReason: detailScrapReason.value,
      scrapTime: scrapTime,
      shiftTeam: currentTeam.value || selectedPackRow.value.shiftTeam
    }
    tableData.value.unshift(scrapRecord)
  })

  if (selectedPackRow.value.qty <= 0) {
    const index = tableData.value.findIndex(item => item.id === selectedPackRow.value.id)
    if (index > -1) tableData.value.splice(index, 1)
    shortBarPackDialogVisible.value = false
  }
  
  detailScrapDialogVisible.value = false
  dialogSelectedDetails.value = []
  ElMessage.success(`成功登记 ${scrapCount} 条长支报废`)
}

const handlePrintLabel = (row: any) => {
  currentPrintRow.value = row
  previewData.value = buildMaterialTagPreviewData({
    source: {
      ...row,
      frameNo: row.palletNo || row.frameNo,
      materialQty: row.qty,
      fixedLength: row.fixedLength || (row.length ? Number(row.length) * 1000 : '')
    },
    shiftTeam: currentTeam.value || row.shiftTeam || '包装班'
  })
  buildTeamQr(previewData.value.shiftTeam)
  
  printPreviewVisible.value = true
}

const confirmPrint = () => {
  if (!currentPrintRow.value) return
  ElMessage.success('物料标识卡打印指令已发送')
  
  currentPrintRow.value.printCount = (currentPrintRow.value.printCount || 0) + 1
  currentPrintRow.value.printTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  
  printPreviewVisible.value = false
  currentPrintRow.value = null
}
</script>

<style scoped>
.page-container { padding: 20px; height: 100%; box-sizing: border-box; background-color: var(--bg-primary); }
.main-card { min-height: calc(100vh - 120px); }
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}
.search-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.search-form {
  flex: 1;
  min-width: 0;
}
.workbench-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.workbench-title {
  font-size: 20px;
  font-weight: bold;
}
.workbench-tabs {
  margin-top: 10px;
}
.pagination-container { margin-top: 16px; display: flex; justify-content: flex-end; }
.coded-detail-wrapper {
  padding: 8px 16px;
  background: #fafafa;
}
.short-bar-pack-dialog {
  padding: 8px 16px 24px;
  min-height: 180px;
}
.short-bar-pack-line {
  margin-bottom: 24px;
  color: #606266;
  font-size: 16px;
}
.short-bar-pack-qty-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.short-bar-pack-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.short-bar-pack-label {
  flex-shrink: 0;
  color: #606266;
}
.short-bar-pack-input {
  flex: 1;
}
.uncoded-row :deep(td.el-table__expand-column .cell) {
  pointer-events: none;
  cursor: default;
}
.uncoded-row :deep(.el-table__expand-icon) {
  display: none !important;
  pointer-events: none;
}

.el-table .printed-once-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.el-table .printed-multiple-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}

.label-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.material-tag-table {
  width: 100%;
  max-width: 720px;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  font-size: 12px;
  color: #111;
}
.material-tag-table td {
  border: 2px solid #333;
  padding: 8px 10px;
  vertical-align: middle;
}
.tag-title-cell {
  text-align: center;
}
.tag-title-main {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}
.tag-title-sub {
  font-size: 12px;
  line-height: 1.2;
}
.tag-top-right {
  padding: 8px 10px;
}
.tag-top-right-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 6px;
}
.tag-top-right-label {
  font-weight: 700;
  white-space: nowrap;
}
.tag-top-right-value {
  flex: 1;
  border-bottom: 1px solid #333;
  padding-bottom: 2px;
  min-height: 16px;
}
.tag-checkbox-grid {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 6px;
}
.tag-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.tag-checkbox {
  width: 14px;
  height: 14px;
  border: 2px solid #333;
  display: inline-block;
  position: relative;
}
.tag-checkbox.checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0;
  width: 6px;
  height: 10px;
  border-right: 2px solid #111;
  border-bottom: 2px solid #111;
  transform: rotate(45deg);
}
.tag-checkbox-hint {
  font-size: 11px;
  opacity: 0.9;
}
.tag-key {
  background: #f0f0f0;
  font-weight: 700;
  width: 180px;
  line-height: 1.2;
}
.tag-value {
  width: 170px;
  text-align: center;
  font-weight: 600;
}
.tag-qr-cell {
  width: 170px;
  text-align: center;
}
.tag-qr-box {
  width: 130px;
  height: 130px;
  margin: 0 auto;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tag-qr-img {
  width: 126px;
  height: 126px;
}
.tag-qr-placeholder {
  font-size: 12px;
  color: #666;
}
</style>
