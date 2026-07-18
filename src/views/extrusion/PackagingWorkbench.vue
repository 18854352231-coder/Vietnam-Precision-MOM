<template>
  <div class="page-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="success" @click="handleClockIn" style="margin-right: 15px">
              {{ isClockedIn ? `已上班 (${currentTeam} ${clockInTime})` : '上班' }}
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
          <el-form-item v-if="showFrameNoSearch" :label="activeTab === '栈板列表' ? '料框' : '框号'">
            <el-input v-model="searchForm.frameNo" placeholder="请输入框号" clearable />
          </el-form-item>
          <el-form-item v-if="showPalletNoSearch" label="栈板编号">
            <el-input v-model="searchForm.palletNo" placeholder="请输入栈板编号" clearable />
          </el-form-item>
          <el-form-item v-if="showBatchNoSearch" label="挤压批次号">
            <el-input v-model="searchForm.batchNo" placeholder="请输入批次号" clearable />
          </el-form-item>
          <el-form-item v-if="showCustomerSearch" label="客户名称">
            <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
          </el-form-item>
          <el-form-item v-if="showMoldSearch" label="模具号">
            <el-input v-model="searchForm.moldNo" placeholder="请输入模具号" clearable />
          </el-form-item>
          <el-form-item v-if="showFurnaceSearch" label="炉次号">
            <el-input v-model="searchForm.furnaceNo" placeholder="请输入炉次号" clearable />
          </el-form-item>
          <el-form-item v-if="showPalletTypeSearch" label="栈板类型">
            <el-select v-model="searchForm.palletType" placeholder="请选择栈板类型" clearable style="width: 180px">
              <el-option label="正常生产" value="正常生产" />
              <el-option label="验证料" value="验证料" />
              <el-option label="客户需求" value="客户需求" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showShiftTeamSearch" label="班组">
            <el-select v-model="searchForm.shiftTeam" placeholder="请选择班组" clearable style="width: 160px">
              <el-option label="甲班" value="甲班" />
              <el-option label="乙班" value="乙班" />
              <el-option label="丙班" value="丙班" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showScrapCategorySearch" label="报废类型">
            <el-select v-model="searchForm.scrapCategory" placeholder="请选择报废类型" clearable style="width: 160px">
              <el-option label="设备类" value="设备类" />
              <el-option label="模具类" value="模具类" />
              <el-option label="工艺类" value="工艺类" />
              <el-option label="操作类" value="操作类" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showScrapReasonSearch" label="报废原因">
            <el-select v-model="searchForm.scrapReason" placeholder="请选择报废原因" clearable style="width: 180px">
              <el-option v-for="item in scrapReasons" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showTimeRangeSearch" :label="currentTimeRangeLabel">
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
            v-if="activeTab !== '栈板列表'"
            type="info"
            :disabled="selectedRows.length !== 1"
            @click="handleViewProcessDoc"
          >
            查看工艺文件
          </el-button>
          <el-button
            v-if="activeTab === '料框列表'"
            type="primary"
            :disabled="selectedRows.length === 0"
            @click="handleTopPack"
          >
            装托
          </el-button>
          <el-button
            v-if="activeTab === '料框列表'"
            type="primary"
            :disabled="selectedRows.length === 0"
            @click="handleComplete"
          >
            完工
          </el-button>
          <el-button
            v-if="activeTab === '料框列表'"
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
          <el-table-column label="料框" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              {{ getSourceFrameSummary(row) }}
            </template>
          </el-table-column>
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
            <el-table-column prop="frameNo" label="框号" min-width="180" show-overflow-tooltip />
            <el-table-column label="二维码编号" min-width="280" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.details && row.details.length > 0 ? row.details[0].code : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="qty" label="报废数量" width="100" align="right" />
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
    <el-dialog v-model="dialogs.pack.visible" title="物料装托" width="760px">
      <div v-if="currentPackRows.length > 0">
        <el-descriptions :column="2" border style="margin-bottom: 20px">
          <el-descriptions-item label="挤压批次号">{{ currentPackBatchNo }}</el-descriptions-item>
          <el-descriptions-item label="已选料框数">{{ currentPackRows.length }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ currentPackRows[0]?.customerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="本次装托总支数">{{ currentPackTotalQty }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="dialogs.pack.form" label-width="110px">
          <el-form-item label="栈板类型" required>
            <el-select v-model="dialogs.pack.form.type" placeholder="请选择栈板类型" style="width: 100%">
              <el-option label="正常生产" value="正常生产" />
              <el-option label="验证料" value="验证料" />
              <el-option label="客户需求" value="客户需求" />
            </el-select>
          </el-form-item>
        </el-form>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
          <el-button type="danger" @click="openPackScrapDialog">不良品报工</el-button>
        </div>
        <el-table :data="dialogs.pack.form.items" border stripe size="small">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="frameNo" label="料框号" min-width="180" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="qty" label="剩余支数" width="100" align="right" />
          <el-table-column label="本次装托数" width="160" align="center">
            <template #default="{ row }">
              <el-input-number v-model="row.packQty" :min="0" :max="row.qty" style="width: 120px" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelPackage">取消</el-button>
          <el-button type="primary" @click="submitPackage">确认</el-button>
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

    <el-dialog v-model="packScrapDialog.visible" title="不良品报工" width="420px">
      <el-form label-width="90px">
        <el-form-item label="报工数量" required>
          <el-input-number
            v-model="packScrapDialog.qty"
            :min="1"
            :max="packScrapDialog.maxQty"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="报废原因" required>
          <el-select v-model="packScrapDialog.reason" placeholder="请选择报废原因" style="width: 100%">
            <el-option v-for="item in scrapReasons" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePackScrapDialog">取消</el-button>
          <el-button type="primary" @click="submitPackScrap">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="shortBarPackDialogVisible" title="装托" width="860px" class="short-bar-pack-modal">
      <div v-if="selectedPackRow" class="short-bar-pack-dialog">
          <div class="short-bar-pack-line">来料框号/栈板编号：{{ selectedPackFrameSummary }}</div>
          
          <div v-if="selectedPackRow.isCoded" style="margin-bottom: 20px;">
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span class="short-bar-pack-label">长支明细 (已选: {{ dialogSelectedDetails.length }})</span>
              <div style="display: flex; gap: 10px; align-items: center;">
                <el-input
                  v-model="detailCodeKeyword"
                  placeholder="请输入长支码"
                  size="small"
                  style="width: 220px;"
                  clearable
                />
                <el-input v-model="selectionRange" placeholder="如 1-5, 8" size="small" style="width: 140px;" clearable @keyup.enter="handleRangeSelection" />
                <el-button type="primary" size="small" @click="handleRangeSelection">快速选择</el-button>
                <el-button type="danger" size="small" :disabled="dialogSelectedDetails.length === 0" @click="openDetailScrapDialog">不良品报工</el-button>
              </div>
            </div>
            <el-table
              ref="detailTableRef"
              :data="filteredMergedSelectedPackDetails"
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
              <el-table-column v-if="selectedPackRows.length > 1" prop="sourceFrameNo" label="料框" min-width="180" show-overflow-tooltip />
              <el-table-column prop="productName" label="产品名称" min-width="140" show-overflow-tooltip />
              <el-table-column prop="fixedLength" label="长支长度" width="140" align="right" />
              <el-table-column label="挤压批次" min-width="180" show-overflow-tooltip>
                <template #default>
                  {{ currentCodedPackBatchNo }}
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
        
        <div class="short-bar-pack-input-row" style="margin-bottom: 16px; margin-top: 16px;">
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
        <template v-if="currentPackDetailMode === 'detail'">
          <el-table-column prop="code" label="长支码" min-width="280" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="fixedLength" label="长支长度" width="140" align="right" />
        </template>
        <template v-else>
          <el-table-column prop="frameNo" label="料框" min-width="180" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="packQty" label="装托支数" width="120" align="right" />
        </template>
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
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import QRCode from 'qrcode'
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { buildMaterialTagPreviewData } from '@/utils/materialTagPreviewData'
import { buildPendingStorageRecordFromPackaging, upsertPendingStorageRecord } from '@/utils/pendingStorageFlow'

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
const createDefaultSearchForm = () => ({
  frameNo: '',
  palletNo: '',
  batchNo: '',
  customerName: '',
  moldNo: '',
  furnaceNo: '',
  palletType: '',
  shiftTeam: '',
  scrapCategory: '',
  scrapReason: '',
  timeRange: [] as string[]
})
const searchForm = ref(createDefaultSearchForm())
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
  
  if (activeTab.value === '栈板列表') {
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

const showFrameNoSearch = computed(() => ['料框列表', '栈板列表', '已完工', '报废列表'].includes(activeTab.value))
const showPalletNoSearch = computed(() => activeTab.value === '栈板列表')
const showBatchNoSearch = computed(() => ['料框列表', '已完工'].includes(activeTab.value))
const showCustomerSearch = computed(() => ['料框列表', '已完工'].includes(activeTab.value))
const showMoldSearch = computed(() => ['料框列表', '已完工'].includes(activeTab.value))
const showFurnaceSearch = computed(() => ['料框列表', '已完工'].includes(activeTab.value))
const showPalletTypeSearch = computed(() => activeTab.value === '栈板列表')
const showShiftTeamSearch = computed(() => ['栈板列表', '已完工', '报废列表'].includes(activeTab.value))
const showScrapCategorySearch = computed(() => activeTab.value === '报废列表' && scrapType.value === '料框')
const showScrapReasonSearch = computed(() => activeTab.value === '报废列表')
const showTimeRangeSearch = computed(() => ['栈板列表', '报废列表'].includes(activeTab.value))
const currentTimeRangeLabel = computed(() => {
  if (activeTab.value === '栈板列表') return '装托时间'
  if (activeTab.value === '报废列表') return '报废时间'
  return '时间范围'
})
const currentTimeField = computed(() => {
  if (activeTab.value === '栈板列表') return 'packTime'
  if (activeTab.value === '报废列表') return 'scrapTime'
  return ''
})

// 设计思路：不进行裁切的产品，在时效完成后，自动进入包装数据队列
const tableData = ref([
  {
    id: 13,
    frameNo: 'CV-A-A-L6000*W1250*H650*0012',
    orderNo: 'ORD-20260501-013',
    batchNo: 'EB-20260502-013',
    customerCode: 'CUST-M',
    customerName: '客户M',
    productNo: 'P-1313',
    productName: 'FC131',
    length: '5.6',
    fixedLength: 5600,
    qty: 88,
    source: '时效',
    status: '料框列表',
    furnaceNo: 'F-2026-013',
    moldNo: 'M13-0313-131',
    extrusionMachine: 'JY-13',
    alloy: '6063-T5',
    shiftTeam: '-',
    productionType: '量产',
    finishTime: '2026-07-08 08:20:00',
    isCoded: false,
    details: []
  },
  {
    id: 14,
    frameNo: 'CV-A-A-L6000*W1250*H650*0013',
    orderNo: 'ORD-20260501-014',
    batchNo: 'EB-20260502-013',
    customerCode: 'CUST-M',
    customerName: '客户M',
    productNo: 'P-1313',
    productName: 'FC131',
    length: '5.6',
    fixedLength: 5600,
    qty: 76,
    source: '时效',
    status: '料框列表',
    furnaceNo: 'F-2026-013',
    moldNo: 'M13-0313-131',
    extrusionMachine: 'JY-13',
    alloy: '6063-T5',
    shiftTeam: '-',
    productionType: '量产',
    finishTime: '2026-07-08 08:45:00',
    isCoded: false,
    details: []
  },
  {
    id: 15,
    frameNo: 'CV-A-A-L6000*W1250*H650*0014',
    orderNo: 'ORD-20260501-015',
    batchNo: 'EB-20260502-014',
    customerCode: 'CUST-N',
    customerName: '客户N',
    productNo: 'P-1414',
    productName: 'FC141',
    length: '6.1',
    fixedLength: 6100,
    qty: 60,
    source: '时效',
    status: '料框列表',
    furnaceNo: 'F-2026-014',
    moldNo: 'M14-0414-141',
    extrusionMachine: 'JY-14',
    alloy: '6005A',
    shiftTeam: '-',
    productionType: '量产',
    finishTime: '2026-07-08 09:10:00',
    isCoded: true,
    details: [
      { id: 141, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260811', productName: 'FC141-A', productNo: 'P-1414', length: '6.1', qty: 20, status: '料框列表', fixedLength: 6100 },
      { id: 142, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260812', productName: 'FC141-B', productNo: 'P-1414', length: '6.1', qty: 20, status: '料框列表', fixedLength: 6100 },
      { id: 143, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260813', productName: 'FC141-C', productNo: 'P-1414', length: '6.1', qty: 20, status: '料框列表', fixedLength: 6100 }
    ]
  },
  {
    id: 16,
    frameNo: 'CV-A-A-L6000*W1250*H650*0015',
    orderNo: 'ORD-20260501-016',
    batchNo: 'EB-20260502-014',
    customerCode: 'CUST-N',
    customerName: '客户N',
    productNo: 'P-1414',
    productName: 'FC141',
    length: '6.1',
    fixedLength: 6100,
    qty: 54,
    source: '时效',
    status: '料框列表',
    furnaceNo: 'F-2026-014',
    moldNo: 'M14-0414-141',
    extrusionMachine: 'JY-14',
    alloy: '6005A',
    shiftTeam: '-',
    productionType: '量产',
    finishTime: '2026-07-08 09:35:00',
    isCoded: true,
    details: [
      { id: 144, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260814', productName: 'FC141-D', productNo: 'P-1414', length: '6.1', qty: 18, status: '料框列表', fixedLength: 6100 },
      { id: 145, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260815', productName: 'FC141-E', productNo: 'P-1414', length: '6.1', qty: 18, status: '料框列表', fixedLength: 6100 },
      { id: 146, code: 'CV-6061RS-260524V111EE001G-03E010506-A01-0101-00000000-000FC194-JY2605241G0A010002XXX2-H1-103A-SX03G01260816', productName: 'FC141-F', productNo: 'P-1414', length: '6.1', qty: 18, status: '料框列表', fixedLength: 6100 }
    ]
  },
  {
    id: 21,
    palletNo: '20260713-01',
    frameNo: 'CV-A-A-L6000*W1250*H650*0012',
    orderNo: 'ORD-20260501-021',
    batchNo: 'EB-20260502-021',
    customerCode: 'CUST-P',
    customerName: '客户P',
    productNo: 'P-2121',
    productName: 'FC212',
    length: '5.8',
    fixedLength: 5800,
    qty: 72,
    source: '时效',
    status: '栈板列表',
    palletType: '正常生产',
    packTime: '2026-07-13 10:20:00',
    printCount: 0,
    printTime: '',
    furnaceNo: 'F-2026-021',
    moldNo: 'M21-0212-188',
    extrusionMachine: 'JY-18',
    alloy: '6063-T5',
    shiftTeam: '甲班',
    productionType: '量产',
    finishTime: '2026-07-13 10:15:00',
    isCoded: false,
    sourceFrames: [
      { frameNo: 'CV-A-A-L6000*W1250*H650*0012', packQty: 40, productName: 'FC212', productNo: 'P-2121' },
      { frameNo: 'CV-A-A-L6000*W1250*H650*0013', packQty: 32, productName: 'FC212', productNo: 'P-2121' }
    ],
    details: []
  },
  {
    id: 22,
    palletNo: '20260713-02',
    frameNo: 'CV-A-A-L6000*W1250*H650*0014',
    orderNo: 'ORD-20260501-022',
    batchNo: 'EB-20260502-022',
    customerCode: 'CUST-Q',
    customerName: '客户Q',
    productNo: 'P-2222',
    productName: 'FC222',
    length: '6.1',
    fixedLength: 6100,
    qty: 54,
    source: '时效',
    status: '栈板列表',
    palletType: '客户需求',
    packTime: '2026-07-13 11:05:00',
    printCount: 1,
    printTime: '2026-07-13 11:10:00',
    furnaceNo: 'F-2026-022',
    moldNo: 'M22-0222-166',
    extrusionMachine: 'JY-22',
    alloy: '6005A',
    shiftTeam: '乙班',
    productionType: '试产',
    finishTime: '2026-07-13 11:00:00',
    isCoded: true,
    sourceFrames: [
      { frameNo: 'CV-A-A-L6000*W1250*H650*0014', packQty: 36, productName: 'FC222', productNo: 'P-2222' },
      { frameNo: 'CV-A-A-L6000*W1250*H650*0015', packQty: 18, productName: 'FC222', productNo: 'P-2222' }
    ],
    details: [
      { id: 221, code: 'CV-6061RS-260713V222EE022G-03E010506-A01-0101-00000000-000FC222-JY2607132G0A022001XXX2-H1-222A-SX03G01260731', productName: 'FC222-A', productNo: 'P-2222', length: '6.1', qty: 18, status: '栈板列表', fixedLength: 6100 },
      { id: 222, code: 'CV-6061RS-260713V222EE022G-03E010506-A01-0101-00000000-000FC222-JY2607132G0A022002XXX2-H1-222B-SX03G01260732', productName: 'FC222-B', productNo: 'P-2222', length: '6.1', qty: 18, status: '栈板列表', fixedLength: 6100 },
      { id: 223, code: 'CV-6061RS-260713V222EE022G-03E010506-A01-0101-00000000-000FC222-JY2607132G0A022003XXX2-H1-222C-SX03G01260733', productName: 'FC222-C', productNo: 'P-2222', length: '6.1', qty: 18, status: '栈板列表', fixedLength: 6100 }
    ]
  },
  {
    id: 23,
    frameNo: 'CV-A-A-L6000*W1250*H650*0023',
    orderNo: 'ORD-20260501-023',
    batchNo: 'EB-20260502-023',
    customerCode: 'CUST-R',
    customerName: '客户R',
    productNo: 'P-2323',
    productName: 'FC232',
    length: '5.4',
    fixedLength: 5400,
    qty: 96,
    source: '时效',
    status: '已完工',
    palletType: '正常生产',
    furnaceNo: 'F-2026-023',
    moldNo: 'M23-0232-144',
    extrusionMachine: 'JY-23',
    alloy: '6061-T6',
    shiftTeam: '甲班',
    productionType: '量产',
    finishTime: '2026-07-13 13:30:00',
    isCoded: false,
    details: []
  },
  {
    id: 24,
    frameNo: 'CV-A-A-L6000*W1250*H650*0024',
    orderNo: 'ORD-20260501-024',
    batchNo: 'EB-20260502-024',
    customerCode: 'CUST-S',
    customerName: '客户S',
    productNo: 'P-2424',
    productName: 'FC242',
    length: '6.0',
    fixedLength: 6000,
    qty: 48,
    source: '锯切',
    status: '已完工',
    palletType: '验证料',
    furnaceNo: 'F-2026-024',
    moldNo: 'M24-0242-118',
    extrusionMachine: 'JY-24',
    alloy: '6082-T5',
    shiftTeam: '丙班',
    productionType: '试产',
    finishTime: '2026-07-13 14:10:00',
    isCoded: true,
    details: [
      { id: 241, code: 'CV-6061RS-260713V242EE024G-03E010506-A01-0101-00000000-000FC242-JY2607132G0A024001XXX2-H1-242A-SX03G01260741', productName: 'FC242-A', productNo: 'P-2424', length: '6.0', qty: 24, status: '已完工', fixedLength: 6000 },
      { id: 242, code: 'CV-6061RS-260713V242EE024G-03E010506-A01-0101-00000000-000FC242-JY2607132G0A024002XXX2-H1-242B-SX03G01260742', productName: 'FC242-B', productNo: 'P-2424', length: '6.0', qty: 24, status: '已完工', fixedLength: 6000 }
    ]
  },
  {
    id: 25,
    frameNo: 'CV-A-A-L6000*W1250*H650*0025',
    orderNo: 'ORD-20260501-025',
    batchNo: 'EB-20260502-025',
    customerCode: 'CUST-T',
    customerName: '客户T',
    productNo: 'P-2525',
    productName: 'FC252',
    length: '5.7',
    fixedLength: 5700,
    qty: 36,
    source: '时效',
    status: '已报废',
    scrapLevel: '料框',
    scrapCategory: '操作类',
    scrapReason: '划伤',
    scrapRemark: '转运过程中表面划伤',
    scrapTime: '2026-07-13 15:00:00',
    furnaceNo: 'F-2026-025',
    moldNo: 'M25-0252-105',
    extrusionMachine: 'JY-25',
    alloy: '6063-T5',
    shiftTeam: '甲班',
    productionType: '量产',
    finishTime: '2026-07-13 14:50:00',
    isCoded: false,
    details: []
  },
  {
    id: 26,
    frameNo: 'CV-A-A-L6000*W1250*H650*0026',
    orderNo: 'ORD-20260501-026',
    batchNo: 'EB-20260502-026',
    customerCode: 'CUST-U',
    customerName: '客户U',
    productNo: 'P-2626',
    productName: 'FC262',
    length: '6.2',
    fixedLength: 6200,
    qty: 28,
    source: '锯切',
    status: '已报废',
    scrapLevel: '料框',
    scrapCategory: '工艺类',
    scrapReason: '尺寸',
    scrapRemark: '规格超差无法转下工序',
    scrapTime: '2026-07-13 15:18:00',
    furnaceNo: 'F-2026-026',
    moldNo: 'M26-0262-132',
    extrusionMachine: 'JY-26',
    alloy: '6082-T5',
    shiftTeam: '乙班',
    productionType: '试产',
    finishTime: '2026-07-13 15:05:00',
    isCoded: false,
    details: []
  },
  {
    id: 27,
    frameNo: 'CV-A-A-L6000*W1250*H650*0027',
    orderNo: 'ORD-20260501-027',
    batchNo: 'EB-20260502-027',
    customerCode: 'CUST-V',
    customerName: '客户V',
    productNo: 'P-2727',
    productName: 'FC272',
    length: '6.0',
    fixedLength: 6000,
    qty: 1,
    source: '时效',
    status: '已报废',
    scrapLevel: '长支',
    scrapCategory: '操作类',
    scrapReason: '碰伤',
    scrapRemark: '',
    scrapTime: '2026-07-13 15:35:00',
    furnaceNo: 'F-2026-027',
    moldNo: 'M27-0272-156',
    extrusionMachine: 'JY-27',
    alloy: '6005A',
    shiftTeam: '丙班',
    productionType: '量产',
    finishTime: '2026-07-13 15:25:00',
    isCoded: true,
    details: [
      { id: 271, code: 'CV-6061RS-260713V272EE027G-03E010506-A01-0101-00000000-000FC272-JY2607132G0A027001XXX2-H1-272A-SX03G01260751', productName: 'FC272-A', productNo: 'P-2727', length: '6.0', qty: 1, status: '已报废', fixedLength: 6000 }
    ]
  },
  {
    id: 28,
    frameNo: 'CV-A-A-L6000*W1250*H650*0028',
    orderNo: 'ORD-20260501-028',
    batchNo: 'EB-20260502-028',
    customerCode: 'CUST-W',
    customerName: '客户W',
    productNo: 'P-2828',
    productName: 'FC282',
    length: '5.5',
    fixedLength: 5500,
    qty: 1,
    source: '锯切',
    status: '已报废',
    scrapLevel: '长支',
    scrapCategory: '模具类',
    scrapReason: '模线',
    scrapRemark: '',
    scrapTime: '2026-07-13 15:52:00',
    furnaceNo: 'F-2026-028',
    moldNo: 'M28-0282-172',
    extrusionMachine: 'JY-28',
    alloy: '6061-T6',
    shiftTeam: '甲班',
    productionType: '试产',
    finishTime: '2026-07-13 15:40:00',
    isCoded: true,
    details: [
      { id: 281, code: 'CV-6061RS-260713V282EE028G-03E010506-A01-0101-00000000-000FC282-JY2607132G0A028001XXX2-H1-282A-SX03G01260761', productName: 'FC282-A', productNo: 'P-2828', length: '5.5', qty: 1, status: '已报废', fixedLength: 5500 }
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

    if (showFrameNoSearch.value) {
      const frameKeyword = activeTab.value === '栈板列表' ? getSourceFrameSummary(item) : item.frameNo
      if (searchForm.value.frameNo && !keywordMatch(frameKeyword, searchForm.value.frameNo)) return false
    }
    if (showPalletNoSearch.value && searchForm.value.palletNo && !keywordMatch(item.palletNo, searchForm.value.palletNo)) return false
    if (showBatchNoSearch.value && searchForm.value.batchNo && !keywordMatch(item.batchNo, searchForm.value.batchNo)) return false
    if (showCustomerSearch.value && searchForm.value.customerName && !keywordMatch(item.customerName, searchForm.value.customerName)) return false
    if (showMoldSearch.value && searchForm.value.moldNo && !keywordMatch(item.moldNo, searchForm.value.moldNo)) return false
    if (showFurnaceSearch.value && searchForm.value.furnaceNo && !keywordMatch(item.furnaceNo, searchForm.value.furnaceNo)) return false
    if (showPalletTypeSearch.value && searchForm.value.palletType && !keywordMatch(item.palletType, searchForm.value.palletType)) return false
    if (showShiftTeamSearch.value && searchForm.value.shiftTeam && !keywordMatch(item.shiftTeam, searchForm.value.shiftTeam)) return false
    if (showScrapCategorySearch.value && searchForm.value.scrapCategory && !keywordMatch(item.scrapCategory, searchForm.value.scrapCategory)) return false
    if (showScrapReasonSearch.value && searchForm.value.scrapReason && !keywordMatch(item.scrapReason, searchForm.value.scrapReason)) return false

    if (showTimeRangeSearch.value && searchForm.value.timeRange && searchForm.value.timeRange.length === 2 && currentTimeField.value) {
      const [start, end] = searchForm.value.timeRange
      const currentTimeValue = item[currentTimeField.value]
      if (!currentTimeValue) return false
      const current = new Date(currentTimeValue).getTime()
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

const currentPackRows = ref<any[]>([])
const dialogs = ref({
  pack: {
    visible: false,
    form: {
      palletNo: '',
      type: '',
      items: [] as Array<{ id: number; frameNo: string; productName: string; qty: number; packQty: number }>
    }
  },
  scrap: {
    visible: false,
    level: '料框',
    source: 'table',
    form: { type: '', reason: '', remark: '' }
  }
})
const packScrapDialog = ref({
  visible: false,
  reason: '',
  qty: 1,
  maxQty: 1
})

const scrapReasons = ['切斜', '划伤', '取样报废', '变形', '壁厚', '定尺', '尺寸', '平面', '弯扭', '托烂', '模线', '橘皮', '气泡', '直线度', '磕碰伤']
const printPreviewVisible = ref(false)
const previewData = ref<any>({})
const currentPrintRow = ref<any>(null)
const teamQrUrl = ref('')
const processDocDialogVisible = ref(false)
const processDocContext = ref({ productNo: '', productName: '' })
const selectedPackRow = ref<any>(null)
const selectedPackRows = ref<any[]>([])
const shortBarPackDialogVisible = ref(false)
const shortBarPackForm = ref({
  palletNo: '',
  team: '',
  goodQty: 0,
  packQty: 1,
  palletType: '正常生产'
})

const PALLET_LIST_STATUS = '栈板列表'

const formatDateTime = (date = new Date()) => date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

const currentPackBatchNo = computed(() => currentPackRows.value[0]?.batchNo || '')
const currentPackTotalQty = computed(() =>
  dialogs.value.pack.form.items.reduce((sum, item) => sum + Number(item.packQty || 0), 0)
)

const generatePalletNo = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  const maxSeq = tableData.value.reduce((max, item) => {
    const match = String(item.palletNo || '').match(/^(\d{8})-(\d{2})$/)
    if (!match || match[1] !== dateStr) return max
    return Math.max(max, Number(match[2]))
  }, 0)

  return `${dateStr}-${String(maxSeq + 1).padStart(2, '0')}`
}

const getSourceFrameSummary = (row: any) => {
  const sourceFrames = Array.isArray(row?.sourceFrames) && row.sourceFrames.length > 0
    ? row.sourceFrames
    : [{ frameNo: row?.frameNo, packQty: row?.qty }]

  const frameNos = [...new Set(sourceFrames.map((item: any) => item?.frameNo).filter(Boolean))]
  return frameNos.length > 0 ? frameNos.join('、') : '-'
}

const buildPalletRecord = ({
  sourceRow,
  palletNo,
  palletType,
  packedQty,
  packedDetails,
  isCoded,
  sourceFrames = []
}: {
  sourceRow: any
  palletNo: string
  palletType: string
  packedQty: number
  packedDetails: any[]
  isCoded: boolean
  sourceFrames?: any[]
}) => ({
  ...sourceRow,
  id: Date.now() + Math.random(),
  frameNo: sourceFrames.length > 0 ? getSourceFrameSummary({ sourceFrames }) : sourceRow.frameNo,
  palletNo,
  qty: packedQty,
  status: PALLET_LIST_STATUS,
  palletType,
  packTime: formatDateTime(),
  printCount: 0,
  printTime: '',
  shiftTeam: currentTeam.value || sourceRow.shiftTeam || '包装班',
  mixPack: sourceFrames.length > 1,
  sourceFrames: (sourceFrames.length > 0
    ? sourceFrames
    : [{ frameNo: sourceRow.frameNo, packQty: packedQty, productName: sourceRow.productName, productNo: sourceRow.productNo }]
  ).map(item => ({
    frameNo: item.frameNo,
    packQty: Number(item.packQty || 0),
    productName: item.productName || sourceRow.productName,
    productNo: item.productNo || sourceRow.productNo
  })),
  isCoded,
  details: packedDetails.map(detail => ({
    ...detail,
    status: PALLET_LIST_STATUS
  }))
})

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.value = createDefaultSearchForm()
}

watch(activeTab, () => {
  handleReset()
  selectedRows.value = []
  currentPage.value = 1
})

watch(scrapType, () => {
  if (activeTab.value !== '报废列表') return
  handleReset()
  currentPage.value = 1
})

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

const openPackageDialog = (rows: any[]) => {
  currentPackRows.value = rows
  dialogs.value.pack.form = {
    palletNo: generatePalletNo(),
    type: '',
    items: rows.map(row => ({
      id: row.id,
      frameNo: row.frameNo,
      productName: row.productName,
      qty: Number(row.qty || 0),
      packQty: Number(row.qty || 0)
    }))
  }
  dialogs.value.pack.visible = true
}

const handleTopPack = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择一条包装列表数据')
    return
  }

  const batchNos = [...new Set(selectedRows.value.map(row => row.batchNo).filter(Boolean))]
  if (batchNos.length > 1) {
    ElMessage.warning('混合装托仅支持相同批次号的料框')
    return
  }

  const [row] = selectedRows.value
  if (selectedRows.value.some(item => item?.isCoded)) {
    if (!selectedRows.value.every(item => item?.isCoded)) {
      ElMessage.warning('有码料框和无码料框不能混合装托')
      return
    }
    openShortBarPackDialog([...selectedRows.value])
    return
  }

  openPackageDialog([...selectedRows.value])
}

const dialogSelectedDetails = ref<any[]>([])
const detailTableRef = ref()
const detailCodeKeyword = ref('')
const selectionRange = ref('')

const handleDialogDetailSelectionChange = (val: any[]) => {
  dialogSelectedDetails.value = val
}
const detailScrapDialogVisible = ref(false)
const detailScrapReason = ref('')

const packDetailsDialogVisible = ref(false)
const currentPackDetails = ref<any[]>([])
const currentPackDetailMode = ref<'detail' | 'frame'>('detail')
const currentCodedPackBatchNo = computed(() => selectedPackRows.value[0]?.batchNo || selectedPackRow.value?.batchNo || '')
const selectedPackFrameSummary = computed(() => {
  const rows = selectedPackRows.value.length > 0 ? selectedPackRows.value : (selectedPackRow.value ? [selectedPackRow.value] : [])
  if (rows.length === 0) return '-'
  if (rows.length === 1) return rows[0]?.frameNo || '-'
  return `${rows[0]?.frameNo || '-'} 等${rows.length}个料框`
})
const mergedSelectedPackDetails = computed(() => {
  return selectedPackRows.value.flatMap(row =>
    (row.details || []).map((detail: any) => ({
      ...detail,
      sourceRowId: row.id,
      sourceFrameNo: row.frameNo,
      sourceBatchNo: row.batchNo
    }))
  )
})
const filteredMergedSelectedPackDetails = computed(() => {
  const keyword = detailCodeKeyword.value.trim().toLowerCase()
  if (!keyword) return mergedSelectedPackDetails.value
  return mergedSelectedPackDetails.value.filter((detail: any) =>
    String(detail.code ?? '').toLowerCase().includes(keyword)
  )
})

const viewPackDetails = (row: any) => {
  if (row.isCoded && row.details) {
    currentPackDetailMode.value = 'detail'
    currentPackDetails.value = row.details
  } else if (row.sourceFrames && row.sourceFrames.length > 0) {
    currentPackDetailMode.value = 'frame'
    currentPackDetails.value = row.sourceFrames
  } else {
    currentPackDetailMode.value = 'detail'
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
    filteredMergedSelectedPackDetails.value.forEach((row: any, index: number) => {
      if (selectedIndices.has(index + 1)) {
        detailTableRef.value.toggleRowSelection(row, true)
      }
    })
  }
}

const openShortBarPackDialog = (rows: any[]) => {
  selectedPackRows.value = rows
  selectedPackRow.value = rows[0] || null
  dialogSelectedDetails.value = []
  detailCodeKeyword.value = ''
  selectionRange.value = ''
  shortBarPackForm.value = {
    palletNo: generatePalletNo(),
    team: currentTeam.value || '包装现场',
    goodQty: 0,
    packQty: rows.length === 1 && !rows[0]?.isCoded ? Number(rows[0]?.qty || 0) : 0,
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
  currentPackRows.value = []
  packScrapDialog.value = {
    visible: false,
    reason: '',
    qty: 1,
    maxQty: 1
  }
}

const openPackScrapDialog = () => {
  if (currentPackRows.value.length === 0) {
    ElMessage.warning('当前没有可报工的料框')
    return
  }

  packScrapDialog.value = {
    visible: true,
    reason: '',
    qty: 1,
    maxQty: Math.max(1, currentPackRows.value.reduce((sum, row) => sum + Number(row.qty || 0), 0))
  }
}

const closePackScrapDialog = () => {
  packScrapDialog.value = {
    visible: false,
    reason: '',
    qty: 1,
    maxQty: 1
  }
}

const submitPackScrap = () => {
  if (!packScrapDialog.value.reason) {
    ElMessage.warning('请选择报废原因')
    return
  }

  const scrapQty = Number(packScrapDialog.value.qty || 0)
  if (scrapQty <= 0) {
    ElMessage.warning('请填写报工数量')
    return
  }

  const scrapTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  let remainingScrapQty = scrapQty

  currentPackRows.value.forEach(sourceRow => {
    if (remainingScrapQty <= 0) return
    const packRow = dialogs.value.pack.form.items.find(row => row.id === sourceRow.id)
    if (!packRow) return

    const currentQty = Number(sourceRow.qty || 0)
    const rowScrapQty = Math.min(currentQty, remainingScrapQty)
    if (rowScrapQty <= 0) return

    tableData.value.unshift({
      ...sourceRow,
      id: Date.now() + Math.random(),
      qty: rowScrapQty,
      status: '已报废',
      scrapLevel: '长支',
      scrapCategory: '操作类',
      scrapReason: packScrapDialog.value.reason,
      scrapRemark: '',
      scrapTime,
      shiftTeam: currentTeam.value || sourceRow.shiftTeam || '-',
      isCoded: false,
      details: []
    })

    sourceRow.qty = Math.max(0, currentQty - rowScrapQty)
    packRow.qty = Number(sourceRow.qty || 0)
    if (Number(packRow.packQty || 0) > Number(packRow.qty || 0)) {
      packRow.packQty = Number(packRow.qty || 0)
    }

    if (Number(sourceRow.qty || 0) <= 0) {
      const index = tableData.value.findIndex(row => row.id === sourceRow.id)
      if (index > -1) {
        tableData.value.splice(index, 1)
      }
    }

    remainingScrapQty -= rowScrapQty
  })

  currentPackRows.value = currentPackRows.value.filter(row => Number(row.qty || 0) > 0)
  dialogs.value.pack.form.items = dialogs.value.pack.form.items.filter(item => Number(item.qty || 0) > 0)

  closePackScrapDialog()
  ElMessage.success(`成功登记 ${scrapQty} 支不良品报工`)

  if (currentPackRows.value.length === 0) {
    dialogs.value.pack.visible = false
    selectedRows.value = []
  }
}

const submitPackage = () => {
  if (!dialogs.value.pack.form.type) {
    ElMessage.warning('请选择栈板类型')
    return
  }
  if (currentPackRows.value.length === 0) return

  const selectedItems = dialogs.value.pack.form.items.filter(item => Number(item.packQty || 0) > 0)
  if (selectedItems.length === 0) {
    ElMessage.warning('请至少填写一个料框的装托数量')
    return
  }

  if (selectedItems.some(item => Number(item.packQty || 0) > Number(item.qty || 0))) {
    ElMessage.warning('装托数量不能大于料框剩余支数')
    return
  }

  const packedQty = selectedItems.reduce((sum, item) => sum + Number(item.packQty || 0), 0)
  const baseRow = currentPackRows.value[0]

  const palletNo = dialogs.value.pack.form.palletNo || generatePalletNo()
  const newPallet = buildPalletRecord({
    sourceRow: baseRow,
    palletNo,
    palletType: dialogs.value.pack.form.type,
    packedQty,
    packedDetails: [],
    isCoded: false,
    sourceFrames: selectedItems.map(item => ({
      frameNo: item.frameNo,
      packQty: item.packQty,
      productName: item.productName,
      productNo: currentPackRows.value.find(row => row.id === item.id)?.productNo || ''
    }))
  })

  tableData.value.unshift(newPallet)

  selectedItems.forEach(item => {
    const row = currentPackRows.value.find(current => current.id === item.id)
    if (!row) return
    row.qty = Math.max(0, Number(row.qty || 0) - Number(item.packQty || 0))
    if (row.qty <= 0) {
      const index = tableData.value.findIndex(tableRow => tableRow.id === row.id)
      if (index > -1) {
        tableData.value.splice(index, 1)
      }
    }
  })

  dialogs.value.pack.visible = false
  currentPackRows.value = []
  selectedRows.value = []
  currentPrintRow.value = null
  previewData.value = {}
  teamQrUrl.value = ''
  ElMessage.success(`装托完成，数据已进入${PALLET_LIST_STATUS}，请在需要时手动切换查看`)
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
  shortBarPackForm.value = {
    palletNo: '',
    team: '',
    goodQty: 0,
    packQty: 1,
    palletType: '正常生产'
  }
  selectedPackRows.value = []
  selectedPackRow.value = null
  dialogSelectedDetails.value = []
  detailCodeKeyword.value = ''
  selectionRange.value = ''
}

const confirmShortBarPack = () => {
  if (!selectedPackRow.value) return
  if (!shortBarPackForm.value.palletType) {
    ElMessage.warning('请选择栈板类型')
    return
  }

  let packedQty = 0
  const isCoded = selectedPackRow.value.isCoded
  let packedDetails: any[] = []
  let sourceFrames: any[] = []

  if (isCoded) {
    if (dialogSelectedDetails.value.length === 0) {
      ElMessage.warning('请选择需要装托的长支')
      return
    }

    packedDetails = dialogSelectedDetails.value
    packedQty = packedDetails.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)
    const detailGroupMap = new Map<number, any[]>()
    packedDetails.forEach((detail: any) => {
      const sourceRowId = Number(detail.sourceRowId)
      const currentList = detailGroupMap.get(sourceRowId) || []
      currentList.push(detail)
      detailGroupMap.set(sourceRowId, currentList)
    })

    selectedPackRows.value.forEach(row => {
      const currentDetails = detailGroupMap.get(Number(row.id)) || []
      if (currentDetails.length === 0) return

      const selectedIds = new Set(currentDetails.map((detail: any) => detail.id))
      row.details = row.details.filter((item: any) => !selectedIds.has(item.id))
      const rowPackedQty = currentDetails.reduce((sum: number, detail: any) => sum + Number(detail.qty || 0), 0)
      row.qty = Math.max(0, Number(row.qty || 0) - rowPackedQty)
      sourceFrames.push({
        frameNo: row.frameNo,
        packQty: rowPackedQty,
        productName: row.productName,
        productNo: row.productNo
      })
    })
    dialogSelectedDetails.value = []
  } else {
    const packQty = Number(shortBarPackForm.value.packQty || 0)
    const maxQty = Number(selectedPackRow.value.qty || 0)
    if (!packQty || packQty < 1 || packQty > maxQty) {
      ElMessage.warning('请输入正确的装托数量')
      return
    }
    packedQty = packQty
    selectedPackRow.value.qty = Math.max(0, Number(selectedPackRow.value.qty || 0) - packedQty)
    sourceFrames = [{
      frameNo: selectedPackRow.value.frameNo,
      packQty: packedQty,
      productName: selectedPackRow.value.productName,
      productNo: selectedPackRow.value.productNo
    }]
  }
  const newPallet = buildPalletRecord({
    sourceRow: selectedPackRow.value,
    palletNo: shortBarPackForm.value.palletNo || generatePalletNo(),
    palletType: shortBarPackForm.value.palletType,
    packedQty,
    packedDetails,
    isCoded,
    sourceFrames
  })
  tableData.value.unshift(newPallet)

  const rowsToSync = isCoded ? selectedPackRows.value : [selectedPackRow.value]
  rowsToSync.forEach(row => {
    if (Number(row?.qty || 0) <= 0) {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        tableData.value.splice(index, 1)
      }
    }
  })

  shortBarPackDialogVisible.value = false
  selectedPackRows.value = []
  selectedPackRow.value = null
  selectedRows.value = []
  ElMessage.success(`装托完成，数据已进入${PALLET_LIST_STATUS}，请在需要时手动切换查看`)
}

const openScrapDialog = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要报废的料框')
    return
  }

  dialogs.value.scrap.level = '料框'
  dialogs.value.scrap.source = 'table'
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
  dialogs.value.scrap.source = 'table'
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
  
  const scrapTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const detailGroupMap = new Map<number, any[]>()
  scrappedDetails.forEach((detail: any) => {
    const sourceRowId = Number(detail.sourceRowId ?? selectedPackRow.value?.id)
    const currentList = detailGroupMap.get(sourceRowId) || []
    currentList.push(detail)
    detailGroupMap.set(sourceRowId, currentList)
  })

  selectedPackRows.value.forEach(row => {
    const rowScrappedDetails = detailGroupMap.get(Number(row.id)) || []
    if (rowScrappedDetails.length === 0) return

    const selectedIds = new Set(rowScrappedDetails.map((detail: any) => detail.id))
    row.details = row.details.filter((detail: any) => !selectedIds.has(detail.id))
    row.qty = Math.max(0, Number(row.qty || 0) - rowScrappedDetails.reduce((sum: number, detail: any) => sum + Number(detail.qty || 0), 0))
  })

  scrappedDetails.forEach((detail: any) => {
    const sourceRow = selectedPackRows.value.find(row => Number(row.id) === Number(detail.sourceRowId)) || selectedPackRow.value
    const scrapRecord = {
      ...sourceRow,
      id: Date.now() + Math.random(),
      status: '已报废',
      scrapLevel: '长支',
      qty: detail.qty || 1,
      isCoded: true,
      details: [detail],
      scrapReason: detailScrapReason.value,
      scrapTime: scrapTime,
      shiftTeam: currentTeam.value || sourceRow.shiftTeam
    }
    tableData.value.unshift(scrapRecord)
  })

  const hasRemainingRows = selectedPackRows.value.some(row => Number(row.qty || 0) > 0)
  selectedPackRows.value.forEach(row => {
    if (Number(row.qty || 0) <= 0) {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index > -1) tableData.value.splice(index, 1)
    }
  })
  if (!hasRemainingRows) shortBarPackDialogVisible.value = false
  
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
  currentPrintRow.value.printCount = (currentPrintRow.value.printCount || 0) + 1
  currentPrintRow.value.printTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  upsertPendingStorageRecord(buildPendingStorageRecordFromPackaging(currentPrintRow.value))
  
  printPreviewVisible.value = false
  ElMessage.success('物料标识卡打印指令已发送，已流转至待入库清单称重页面')
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
