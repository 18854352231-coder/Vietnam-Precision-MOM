﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
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
            <span class="workbench-title">裁切工作台</span>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="mt-4">
        <!-- 标签页 1：物料清单 -->
        <el-tab-pane label="物料清单" name="materialList">
          <div class="toolbar" style="display: flex; justify-content: space-between; align-items: flex-start;">
              <el-form :inline="true" :model="searchForm" class="search-form" style="display: flex; flex-wrap: wrap; gap: 10px; width: 100%;">
                <el-form-item label="框号" style="margin-bottom: 0;">
                  <el-input v-model="searchForm.frameNo" placeholder="请输入框号" clearable />
                </el-form-item>
                <el-form-item label="挤压批次" style="margin-bottom: 0;">
                  <el-input v-model="searchForm.extrusionBatch" placeholder="请输入挤压批次" clearable />
                </el-form-item>
                <el-form-item label="炉次号" style="margin-bottom: 0;">
                  <el-input v-model="searchForm.furnaceNo" placeholder="请输入炉次号" clearable />
                </el-form-item>
                <el-form-item label="模具号" style="margin-bottom: 0;">
                  <el-input v-model="searchForm.moldNo" placeholder="请输入模具号" clearable />
                </el-form-item>
                <el-form-item label="状态" style="margin-bottom: 0;">
                  <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                    <el-option label="待收料" value="待收料" />
                    <el-option label="已收料" value="已收料" />
                    <el-option label="已完工" value="已完工" />
                  </el-select>
                </el-form-item>
                <el-form-item style="margin-bottom: 0;">
                  <el-button type="primary" @click="handleSearch">查询</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
                <div style="flex: 1; display: flex; justify-content: flex-end;">
                  <el-button type="primary" :disabled="!isClockedIn || selectedMaterials.length === 0" @click="handleFeedMaterial">上料</el-button>
                  <el-button type="success" :disabled="!isClockedIn || selectedMaterials.length === 0" @click="openReportWorkDialog()">报工</el-button>
                </div>
              </el-form>
            </div>

          <el-table 
            :data="filteredMaterialList" 
            style="width: 100%" 
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="frameNo" label="框号" width="120" />
            <el-table-column prop="locationNo" label="库位号" width="110" show-overflow-tooltip />
            <el-table-column prop="isCPK" label="是否CPK" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isCPK === '是' ? 'warning' : 'info'" size="small">{{ row.isCPK }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="产品名称" width="160" show-overflow-tooltip />
            <el-table-column prop="furnaceNo" label="炉次号" width="130" show-overflow-tooltip />
            <el-table-column prop="extrusionBatch" label="挤压批次" width="160" show-overflow-tooltip />
            <el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
            <el-table-column prop="status" label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
            <el-table-column prop="productType" label="产品类型" width="110" show-overflow-tooltip />
            <el-table-column prop="scheduleType" label="排程类型" width="110" />
            <el-table-column prop="isCoded" label="是否打码" width="80" align="center" />
            <el-table-column prop="cuttingSchedule" label="裁切排程" width="120" align="center" show-overflow-tooltip />
            <el-table-column prop="quantity" label="数量" width="90" align="right" />
            <el-table-column prop="fixedLength" label="定长(mm)" width="100" align="right" />
            <el-table-column prop="netWeight" label="净重(kg)" width="100" align="right" />
            <el-table-column prop="feedingTime" label="上料时间" width="160" />
            <el-table-column prop="completionTime" label="完工时间" width="160" />
            <el-table-column prop="goodQty" label="良品数量" width="100" align="right" />
            <el-table-column prop="defectiveQty" label="不良品数量" width="100" align="right" />
          </el-table>
        </el-tab-pane>

        <!-- 标签页 2：打印物料标识卡 -->
        <el-tab-pane label="打印物料标识卡" name="printLabel">
          <div class="print-container">
            <!-- 上方排程信息 -->
            <div class="schedule-info-area">
              <div class="schedule-info-header">
                <div class="section-title">排程信息</div>
                <div class="schedule-info-actions">
                  <el-button type="primary" v-if="hasActiveSchedule" @click="completeSchedule">完成排程</el-button>
                  <el-button type="primary" v-else @click="openScheduleDialog">选择排程</el-button>
                  <el-button type="primary" link @click="viewProcessDocument">查看工艺文件</el-button>
                </div>
              </div>
              <el-descriptions :column="4" border class="mt-2">
                <el-descriptions-item label="排程编号">{{ scheduleInfo.scheduleNo }}</el-descriptions-item>
                <el-descriptions-item label="排程类型">{{ scheduleInfo.scheduleType }}</el-descriptions-item>
                <el-descriptions-item label="客户代码">{{ scheduleInfo.customerCode }}</el-descriptions-item>
                <el-descriptions-item label="客户名称">{{ scheduleInfo.customerName }}</el-descriptions-item>
                <el-descriptions-item label="炉次号">{{ scheduleInfo.furnaceNo }}</el-descriptions-item>
                <el-descriptions-item label="挤压批次号">{{ scheduleInfo.extrusionBatchNo }}</el-descriptions-item>
                <el-descriptions-item label="长度(mm)">{{ scheduleInfo.fixedLength }}</el-descriptions-item>
                <el-descriptions-item label="合金牌号">{{ scheduleInfo.alloy }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 下方分为左右两部分 -->
            <el-row :gutter="20" class="mt-4">
              <!-- 左侧：装托信息 -->
              <el-col :span="10">
                <div class="section-title">装托信息</div>
                <el-form :model="printForm" label-width="120px" class="print-form mt-2" size="default">
                  <el-form-item label="料框" required>
                    <el-select v-model="printForm.sourceFrameNo" placeholder="请选择料框" style="width: 100%" clearable>
                      <el-option
                        v-for="frame in availableSourceFrames"
                        :key="frame"
                        :label="frame"
                        :value="frame"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="托盘号" required>
                    <el-input v-model="printForm.frameNo" placeholder="请输入或扫描托盘号" />
                  </el-form-item>
                  <el-form-item label="装托数量">
                    <el-input v-model="printForm.materialQty" disabled placeholder="根据物料码自动生成" />
                  </el-form-item>
                  <el-form-item label="托盘最大载量" required>
                    <el-input-number v-model="printForm.trayMaxLoad" :min="1" controls-position="right" style="width: 100%" @change="handleTrayMaxLoadChange" />
                  </el-form-item>
                  <el-form-item label="栈板皮重(KG)" required>
                    <el-input v-model="printForm.tareWeight" placeholder="输入皮重" />
                  </el-form-item>
                  <el-form-item label="单支裁切数量" required>
                    <el-input v-model="printForm.singleCodeQty" placeholder="输入单支裁切数量" />
                  </el-form-item>
                  <el-form-item label="是否装箱">
                    <el-switch v-model="printForm.isBoxed" />
                  </el-form-item>
                  <el-form-item label="每箱片数" v-if="printForm.isBoxed" required>
                    <el-input-number v-model="printForm.piecesPerBox" :min="1" @change="calculateBoxes" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="小箱数量" v-if="printForm.isBoxed">
                    <el-input v-model="printForm.boxCount" disabled />
                  </el-form-item>
                  
                  <div class="print-actions mt-4" style="text-align: right;">
                    <el-button type="primary" @click="previewPalletLabel">打印物料标识卡</el-button>
                    <el-button type="success" :disabled="!printForm.isBoxed" @click="previewBoxLabels">打印小箱标识卡</el-button>
                    <el-button type="warning" @click="completePallet">完成</el-button>
                  </div>
                </el-form>
              </el-col>

              <!-- 右侧：物料二维码编号 -->
              <el-col :span="14">
                <div class="section-title">物料二维码编号</div>
                <div class="mt-2" style="display: flex; gap: 10px; margin-bottom: 10px;">
                  <el-input v-model="printForm.longBranchCode" placeholder="扫码添加镭雕码" @keyup.enter="handleAddLongBranch" style="flex: 1;" />
                  <el-button type="primary" @click="handleAddLongBranch">添加</el-button>
                </div>
                <el-table :data="boundBranches" style="width: 100%" border size="small" height="380">
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column prop="laserCode" label="镭雕码" />
                  <el-table-column label="操作" width="80" align="center">
                    <template #default="{ $index }">
                      <el-button type="danger" link @click="removeBranch($index)">移除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 标签页 3：拆合包 -->
        <el-tab-pane label="装托记录" name="packageManage">
          <div class="toolbar" style="display: flex; justify-content: space-between; align-items: flex-start;">
            <el-form :inline="true" :model="packageSearchForm" class="search-form">
              <el-form-item label="托盘号">
                <el-input v-model="packageSearchForm.frameNo" placeholder="请输入托盘号" clearable />
              </el-form-item>
              <el-form-item label="排程编号">
                <el-input v-model="packageSearchForm.scheduleNo" placeholder="请输入排程编号" clearable />
              </el-form-item>
              <el-form-item label="挤压批次">
                <el-input v-model="packageSearchForm.extrusionBatch" placeholder="请输入批次号" clearable />
              </el-form-item>
              <el-form-item label="客户名称">
                <el-input v-model="packageSearchForm.customerName" placeholder="请输入客户名称" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handlePackageSearch">查询</el-button>
                <el-button @click="resetPackageSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <div class="action-buttons" style="margin-bottom: 18px;">
            </div>
          </div>

          <div class="package-panel">
            <div class="package-panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div>
                <span class="section-title section-title-compact">托盘/小箱清单</span>
                <span class="package-summary">共 {{ filteredPackageList.length }} 包</span>
              </div>
              <div>
                <el-button type="primary" :disabled="selectedPackages.length !== 1" @click="handleReprintPallet">补打物料卡</el-button>
                <el-button type="success" :disabled="selectedPackages.length !== 1 || !selectedPackages[0].isBoxed" @click="handleReprintBoxes">补打小箱卡</el-button>
              </div>
            </div>
            <el-table
              :data="filteredPackageList"
              border
              height="520"
              highlight-current-row
              @selection-change="handlePackageSelectionChange"
              @row-click="handlePackageRowClick"
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column prop="frameNo" label="托盘号" width="140" />
              <el-table-column prop="productName" label="产品名称" width="120" />
              <el-table-column prop="scheduleNo" label="排程编号" width="160" />
              <el-table-column prop="customerCode" label="客户代码" width="100" />
              <el-table-column prop="customerName" label="客户名称" width="140" />
              <el-table-column prop="furnaceNo" label="炉次号" width="140" />
              <el-table-column prop="extrusionBatch" label="挤压批次号" width="140" />
              <el-table-column prop="fixedLength" label="长度(mm)" width="100" align="right" />
              <el-table-column prop="alloy" label="合金牌号" width="100" />
              <el-table-column prop="materialQty" label="装托数量" width="100" align="right" />
              <el-table-column prop="trayMaxLoad" label="托盘最大载量" width="120" align="right" />
              <el-table-column prop="tareWeight" label="栈板皮重(KG)" width="120" align="right" />
              <el-table-column prop="shiftTeam" label="班组信息" width="120" />
              <el-table-column prop="singleCodeQty" label="单支裁切数量" width="120" align="right" />
              <el-table-column prop="isBoxed" label="是否装箱" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.isBoxed ? 'success' : 'info'" size="small">{{ row.isBoxed ? '是' : '否' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="piecesPerBox" label="每箱片数" width="100" align="right" />
              <el-table-column prop="boxCount" label="小箱数" width="100" align="right" />
              <el-table-column prop="updateTime" label="更新时间" min-width="160" />
              <el-table-column prop="operator" label="操作人" width="100" />
              <el-table-column label="操作" width="160" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link @click="openPackageDetail(row)">查看明细</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="packageDetailDialogVisible" title="托盘/小箱明细" width="800px">
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <el-input v-model="newPackageBranchCode" placeholder="扫码或手动输入添加镭雕码" @keyup.enter="handleAddPackageBranch" style="flex: 1;" />
        <el-button type="primary" @click="handleAddPackageBranch">添加</el-button>
      </div>
      <el-table
        :data="currentPackageRecord?.branches || []"
        border
        size="small"
        height="400"
        @selection-change="handlePackageBranchSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="laserCode" label="镭雕码" min-width="180" />
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button type="danger" link @click="removePackageBranch($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="packageDetailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scheduleDialogVisible" title="选择排程" width="1050px">
      <el-table
        :data="scheduleList"
        border
        height="520"
        highlight-current-row
        @row-click="handleScheduleRowClick"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="scheduleNo" label="排程编号" width="160" />
        <el-table-column prop="scheduleType" label="排程类型" width="120" />
        <el-table-column prop="customerCode" label="客户代码" width="120" />
        <el-table-column prop="customerName" label="客户名称" width="160" />
        <el-table-column prop="planQty" label="计划量" width="100" align="right" />
        <el-table-column prop="singleWeight" label="单重(kg)" width="100" align="right" />
        <el-table-column prop="fixedLength" label="长度(mm)" width="100" align="right" />
        <el-table-column prop="furnaceNo" label="炉次号" width="160" />
        <el-table-column prop="extrusionBatchNo" label="挤压批次号" width="160" />
        <el-table-column prop="moldNo" label="模具号" width="120" />
        <el-table-column prop="alloy" label="合金牌号" width="120" />
      </el-table>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSwitchSchedule">确认选择</el-button>
      </template>
    </el-dialog>

    <!-- 报工弹窗 -->
    <el-dialog v-model="reportDialogVisible" title="报工" width="1000px">
      <div class="report-header mb-4">
        <el-form :inline="true" :model="reportForm">
          <el-form-item label="*报工班组:" required>
            <el-select v-model="reportForm.shiftTeam" placeholder="请选择" style="width: 150px">
              <el-option label="裁切A06班" value="裁切A06班" />
              <el-option label="裁切B01班" value="裁切B01班" />
            </el-select>
          </el-form-item>
          <el-form-item label="报工时间:">
            <span>{{ currentReportTime }}</span>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="reportItems" border style="width: 100%">
        <el-table-column prop="frameNo" label="框号" width="120" />
        <el-table-column prop="incomingQty" label="来料数量" width="100" align="right" />
        <el-table-column prop="cutQty" label="已裁切支数" width="100" align="right" />
        <el-table-column prop="registeredDefectiveQty" label="已登记的不良长支数" width="150" align="right" />
        <el-table-column label="*本次裁切支数" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.currentCutQty" :min="0" :max="row.incomingQty - row.cutQty" controls-position="right" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="*实收支数" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.actualReceivedQty" :min="0" controls-position="right" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="不良品片数" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.defectivePiecesQty" :min="0" controls-position="right" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="不良品原因">
          <template #default="{ row }">
            <el-input v-model="row.defectiveReason" placeholder="选填" />
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReport">确定</el-button>
        </div>
      </template>
    </el-dialog>



    <!-- 上班签到弹窗 -->
    <el-dialog v-model="clockInDialogVisible" title="上班签到" width="400px">
      <el-form :model="clockInForm" label-width="80px">
        <el-form-item label="上班班组">
          <el-select v-model="clockInForm.team" style="width: 100%">
            <el-option label="裁切A06班" value="裁切A06班" />
            <el-option label="裁切B01班" value="裁切B01班" />
            <el-option label="裁切C02班" value="裁切C02班" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitClockIn">确认</el-button>
      </template>
    </el-dialog>

    <!-- 打印预览弹窗 -->
    <el-dialog v-model="printPreviewVisible" :title="previewType === 'pallet' ? '物料标识卡' : '小箱标识卡'" width="800px" top="5vh">
      <div v-if="previewType === 'pallet'" class="label-preview">
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
                <span class="tag-top-right-value">{{ previewData.customerName || scheduleInfo.customerName || '-' }}</span>
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
                <img :src="teamQrUrl" class="tag-qr-img" alt="team-qr" />
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
            <td class="tag-value">{{ (previewData.materialQty ?? '-') }} PCS</td>
            <td class="tag-key">Số kê<br />Frame No.<br />框号</td>
            <td class="tag-value">{{ previewData.frameNo || '-' }}</td>
          </tr>

          <tr>
            <td class="tag-key">Chiều dài cố định<br />Fixed length<br />定长</td>
            <td class="tag-value">{{ (previewData.fixedLength ?? '-') }} mm</td>
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

      <div v-else class="label-preview multi-preview">
        <!-- 模拟小箱标识卡 (可能多张) -->
        <div v-for="i in Math.min(previewData.boxCount || 1, 3)" :key="i" class="mb-4">
          <table class="label-table">
            <tr>
              <td colspan="6" class="label-title">
                <div style="text-align: center; font-weight: bold; font-size: 16px;">山东创新精密科技有限公司（标示卡）</div>
              </td>
            </tr>
            <tr>
              <td class="header-cell">生产类型</td><td colspan="2">{{ previewData.productionType || scheduleInfo.productionType || '试产' }}</td>
              <td class="header-cell">客户代码</td><td colspan="2">{{ previewData.customerCode || scheduleInfo.customerCode || '-' }}</td>
            </tr>
            <tr>
              <td class="header-cell">产品名称</td><td colspan="2">{{ previewData.productName || 'SR-34' }}</td>
              <td class="header-cell">炉次号</td><td colspan="2">{{ previewData.furnaceNo || '25-412-06-11-03(10PCS)' }}</td>
            </tr>
            <tr>
              <td class="header-cell">挤压批次号</td><td colspan="2">{{ previewData.extrusionBatch || 'JY2603070002(10PCS)' }}</td>
              <td class="header-cell">模具号</td><td colspan="2">{{ previewData.moldNo || '-' }}</td>
            </tr>
            <tr>
              <td class="header-cell">数量</td><td colspan="2">{{ previewData.piecesPerBox || '10' }}PCS</td>
              <td class="header-cell">框号</td><td colspan="2">{{ previewData.frameNo || '6m-0979' }}</td>
            </tr>
            <tr>
              <td class="header-cell">定长</td><td colspan="2">{{ previewData.fixedLength || '-' }}mm</td>
              <td class="header-cell">机台号</td><td colspan="2">{{ previewData.extrusionMachine || '-' }}</td>
            </tr>
            <tr>
              <td class="header-cell">裁切/包装班组</td><td colspan="2">{{ previewData.shiftTeam || '1234' }}</td>
              <td class="header-cell">牌号</td><td colspan="2">{{ previewData.alloy || '-' }}</td>
            </tr>
            <tr>
              <td class="header-cell">纸箱号</td><td colspan="5">{{ previewData.frameNo || 'F-260407-001' }}-0{{ i }}</td>
            </tr>
          </table>
        </div>
        <div v-if="(previewData.boxCount || 1) > 3" class="text-center text-gray-500">
          ... 共 {{ previewData.boxCount }} 张标签 ...
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <el-button type="danger" plain v-if="previewType === 'pallet'" @click="printPreviewVisible = false">挂起</el-button>
          <div style="flex: 1; text-align: right;">
            <el-button @click="printPreviewVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmPrint">{{ previewType === 'pallet' ? '确定并打印' : '打印' }}</el-button>
          </div>
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
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import QRCode from 'qrcode'
import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { buildMaterialTagPreviewData } from '@/utils/materialTagPreviewData'

useTaskLiteralDomI18n()

// 上下班状态
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
    printForm.value.frameNo = clockInForm.value.team // 托盘号默认为上班班组的名称
    const now = new Date()
    clockInTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    clockInDialogVisible.value = false
    ElMessage.success(`${currentTeam.value} 签到成功`)
  })
}

const handleClockOut = () => {
  ElMessageBox.confirm('确认现在打卡下班吗？', '下班确认', { type: 'warning' }).then(() => {
    isClockedIn.value = false
    currentTeam.value = ''
    clockInTime.value = ''
    ElMessage.success('打卡下班成功！')
  }).catch(() => {})
}

// 标签页
const activeTab = ref('materialList')

const formatNow = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

const cloneBranches = (branches: any[]) => branches.map(branch => ({ ...branch }))

const syncMaterialQty = () => {
  printForm.value.materialQty = boundBranches.value.reduce((sum, item) => sum + (item.qty || 1), 0)
  calculateBoxes()
}

const ensureWithinTrayCapacity = () => {
  if (!printForm.value.trayMaxLoad) return true
  if (printForm.value.materialQty > printForm.value.trayMaxLoad) {
    ElMessage.error(`装托数量 ${printForm.value.materialQty} 超过托盘最大载量 ${printForm.value.trayMaxLoad}`)
    return false
  }
  return true
}

const teamQrUrl = ref('')
const buildTeamQr = async () => {
  const qrData = previewType.value === 'pallet' ? previewData.value.frameNo : previewData.value.frameNo + '-BOX'
  if (!qrData) {
    teamQrUrl.value = ''
    return
  }
  try {
    teamQrUrl.value = await QRCode.toDataURL(qrData, { width: 130, margin: 0 })
  } catch (e) {
    teamQrUrl.value = ''
  }
}

const handleTrayMaxLoadChange = () => {
  ensureWithinTrayCapacity()
}

const scheduleDialogVisible = ref(false)
const scheduleList = ref<any[]>([
  {
    scheduleNo: 'PC-20260424-001',
    scheduleType: '正常',
    customerCode: 'C009887',
    customerName: '客户A',
    furnaceNo: '26-423-02-24-02',
    extrusionBatchNo: 'JY2602260001',
    moldNo: '049#',
    alloy: '6R02',
    productName: 'FC22',
    componentMaterialNo: 'CM-001',
    customerMaterialNo: 'C-MAT-001',
    customerProductName: 'Customer A31-09',
    productionType: '量产',
    planQty: 500,
    singleWeight: 2.5,
    fixedLength: 341.79,
    extrusionMachine: 'JY-35'
  },
  {
    scheduleNo: 'PC-20260424-002',
    scheduleType: '加急',
    customerCode: 'C009887',
    customerName: '客户A',
    furnaceNo: '25-412-06-11-03',
    extrusionBatchNo: 'JY2603070002',
    moldNo: '999#',
    alloy: '6R02',
    productName: 'FC113',
    componentMaterialNo: 'CM-002',
    customerMaterialNo: 'C-MAT-002',
    customerProductName: 'Customer SR-34',
    productionType: '试产',
    planQty: 200,
    singleWeight: 1.8,
    fixedLength: 130.0,
    extrusionMachine: 'JY-07'
  }
])
const selectedSchedule = ref<any | null>(null)
const processDocDialogVisible = ref(false)
const processDocContext = ref({
  productNo: '',
  productName: ''
})

const labelContext = ref<any>({
  sourcePackageId: null,
  productName: 'FC97',
  extrusionBatch: 'JY2603070002',
  furnaceNo: '25-412-06-11-03',
  moldNo: '999#',
  frameNo: 'CV-A-A-L6000*W1250*H650*0195',
  fixedLength: 130.0,
  extrusionMachine: 'JY-07',
  customerCode: 'C009887',
  productionType: '试产',
  alloy: '6R02'
})

const openScheduleDialog = () => {
  selectedSchedule.value = { ...scheduleInfo.value }
  scheduleDialogVisible.value = true
}

const handleScheduleRowClick = (row: any) => {
  selectedSchedule.value = row
}

const resetPrintForSchedule = (row: any) => {
  labelContext.value = {
    ...labelContext.value,
    sourcePackageId: null,
    productName: row.productName || '',
    extrusionBatch: row.extrusionBatchNo || row.extrusionBatch || '',
    furnaceNo: row.furnaceNo || '',
    moldNo: row.moldNo || '',
    frameNo: row.frameNo || '',
    fixedLength: row.fixedLength || '',
    extrusionMachine: row.extrusionMachine || '',
    customerCode: row.customerCode || '',
    productionType: row.productionType || '',
    alloy: row.alloy || ''
  }

  scheduleInfo.value = {
    ...scheduleInfo.value,
    scheduleNo: row.scheduleNo || '',
    scheduleType: row.scheduleType || '',
    customerCode: row.customerCode || '',
    customerName: row.customerName || '',
    furnaceNo: row.furnaceNo || '',
    extrusionBatchNo: row.extrusionBatchNo || row.extrusionBatch || '',
    moldNo: row.moldNo || '',
    fixedLength: row.fixedLength || '',
    alloy: row.alloy || '',
    productName: row.productName || '',
    componentMaterialNo: row.componentMaterialNo || '',
    customerMaterialNo: row.customerMaterialNo || '',
    customerProductName: row.customerProductName || '',
    productionType: row.productionType || ''
  }

  printForm.value = {
    sourceFrameNo: '',
    frameNo: currentTeam.value || '',
    longBranchCode: '',
    materialQty: 0,
    palletCount: 1,
    trayMaxLoad: 50,
    tareWeight: '',
    singleCodeQty: '',
    isBoxed: false,
    piecesPerBox: 10,
    boxCount: 0
  }
  boundBranches.value = []
}

const confirmSwitchSchedule = () => {
  if (!selectedSchedule.value) {
    ElMessage.warning('请选择一个排程')
    return
  }

  const hasEditing = boundBranches.value.length > 0 || printForm.value.frameNo
  const doSwitch = () => {
    resetPrintForSchedule(selectedSchedule.value)
    scheduleDialogVisible.value = false
    hasActiveSchedule.value = true
    ElMessage.success(`已选择排程：${selectedSchedule.value.scheduleNo}`)
  }

  if (hasEditing) {
    ElMessageBox.confirm('当前标识卡编辑内容将被清空，确认选择新排程吗？', '选择排程确认', { type: 'warning' })
      .then(doSwitch)
      .catch(() => {})
    return
  }
  doSwitch()
}

// --- 物料清单模块 ---
const searchForm = ref({
  frameNo: '',
  extrusionBatch: '',
  furnaceNo: '',
  moldNo: '',
  status: ''
})

const materialList = ref<any[]>([
  { id: 1, frameNo: 'CV-A-A-L6000*W1250*H650*0196', locationNo: 'A1-01', isCPK: '否', productName: 'FC140', furnaceNo: '26-423-02-24-02', extrusionBatch: 'JY2602260001', extrusionMachine: 'JY-35', status: '待收料', moldNo: '049#', productType: '量产', scheduleType: '正常', isCoded: '是', cuttingSchedule: '是', quantity: 10, fixedLength: 341.79, netWeight: 50.5, feedingTime: '-', completionTime: '-', goodQty: 0, defectiveQty: 0 },
  { id: 2, frameNo: 'CV-A-A-L6000*W1250*H650*0197', locationNo: 'B2-05', isCPK: '是', productName: 'FC49', furnaceNo: '25-412-06-11-03', extrusionBatch: 'JY2603070002', extrusionMachine: 'JY-07', status: '已收料', moldNo: '999#', productType: '试产', scheduleType: '加急', isCoded: '否', cuttingSchedule: '否', quantity: 20, fixedLength: 130.0, netWeight: 42.0, feedingTime: '2026-04-24 08:30:00', completionTime: '-', goodQty: 0, defectiveQty: 0 },
  { id: 3, frameNo: 'CV-A-A-L6000*W1250*H650*0198', locationNo: 'C3-12', isCPK: '否', productName: 'FC104', furnaceNo: '26-423-02-24-02', extrusionBatch: 'JY2602260001', extrusionMachine: 'JY-35', status: '已完工', moldNo: '049#', productType: '量产', scheduleType: '正常', isCoded: '是', cuttingSchedule: '是', quantity: 15, fixedLength: 341.79, netWeight: 75.2, feedingTime: '2026-04-24 09:00:00', completionTime: '2026-04-24 11:30:00', goodQty: 14, defectiveQty: 1 }
])

const filteredMaterialList = computed(() => {
  return materialList.value.filter(item => {
    const matchFrame = !searchForm.value.frameNo || item.frameNo.includes(searchForm.value.frameNo)
    const matchBatch = !searchForm.value.extrusionBatch || item.extrusionBatch.includes(searchForm.value.extrusionBatch)
    const matchFurnace = !searchForm.value.furnaceNo || (item.furnaceNo && item.furnaceNo.includes(searchForm.value.furnaceNo))
    const matchMold = !searchForm.value.moldNo || (item.moldNo && item.moldNo.includes(searchForm.value.moldNo))
    const matchStatus = !searchForm.value.status || item.status === searchForm.value.status
    return matchFrame && matchBatch && matchFurnace && matchMold && matchStatus
  })
})

const handleSearch = () => {
  // 触发 computed 更新
}

const resetSearch = () => {
  searchForm.value = { frameNo: '', extrusionBatch: '', furnaceNo: '', moldNo: '', status: '' }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = { '待收料': 'info', '已收料': 'warning', '已完工': 'success' }
  return map[status] || 'info'
}

const selectedMaterials = ref<any[]>([])
const handleSelectionChange = (val: any[]) => {
  selectedMaterials.value = val
}

const handleFeedMaterial = () => {
  for (const item of selectedMaterials.value) {
    if (item.status !== '待收料') {
      ElMessage.warning(`框号 ${item.frameNo} 状态不是待收料，无法上料`)
      return
    }
    if (item.cuttingSchedule === '否') {
      ElMessage.warning(`框号 ${item.frameNo} 没有裁切排程，无法上料`)
      return
    }
  }

  ElMessageBox.confirm(`确认对选中的 ${selectedMaterials.value.length} 条数据进行上料吗？`, '上料确认', {
    type: 'warning'
  }).then(() => {
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    selectedMaterials.value.forEach(item => {
      const origin = materialList.value.find(m => m.id === item.id)
      if (origin) {
        origin.status = '已收料'
        origin.feedingTime = timeStr
      }
    })
    ElMessage.success('上料成功')
  }).catch(() => {})
}

// 报工弹窗
const reportDialogVisible = ref(false)
const reportForm = ref({ shiftTeam: '裁切A06班' })
const reportItems = ref<any[]>([])
const currentReportTime = ref('')
let timeInterval: any = null

const openReportWorkDialog = (row?: any) => {
  if (!isClockedIn.value) {
    ElMessage.warning('请先打卡上班！')
    return
  }
  reportDialogVisible.value = true
  updateReportTime()
  if (!timeInterval) {
    timeInterval = setInterval(updateReportTime, 1000)
  }
  
  const targetItems = row && row.frameNo ? [row] : selectedMaterials.value
  reportItems.value = targetItems.map(item => ({
    frameNo: item.frameNo,
    incomingQty: item.quantity,
    cutQty: item.goodQty + item.defectiveQty, // 已裁切
    registeredDefectiveQty: item.defectiveQty,
    currentCutQty: item.quantity - (item.goodQty + item.defectiveQty), // 默认剩余
    actualReceivedQty: 0, // 默认0
    defectivePiecesQty: 0,
    defectiveReason: ''
  }))
}

const updateReportTime = () => {
  const now = new Date()
  currentReportTime.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

const submitReport = () => {
  if (!reportForm.value.shiftTeam) {
    ElMessage.warning('请选择报工班组')
    return
  }
  // 更新原数据状态为已完工
  reportItems.value.forEach(rItem => {
    const origin = materialList.value.find(m => m.frameNo === rItem.frameNo)
    if (origin) {
      origin.status = '已完工'
      origin.completionTime = currentReportTime.value
      origin.goodQty += (rItem.currentCutQty || 0) - (rItem.defectivePiecesQty || 0)
      origin.defectiveQty += (rItem.defectivePiecesQty || 0)
    }
  })
  ElMessage.success('报工成功')
  reportDialogVisible.value = false
}

// --- 拆合包模块 ---
const packageSeed = ref(3)
const frameSeed = ref(3)
const packageSearchForm = ref({
  scheduleNo: '',
  frameNo: '',
  extrusionBatch: '',
  customerName: ''
})
const packageRecords = ref<any[]>([
  {
    id: 1,
    packageNo: 'CTPK-20260424-001',
    frameNo: 'CV-A-A-L6000*W1250*H650*0199',
    productName: 'FC94',
    extrusionBatch: 'JY2602260001',
    furnaceNo: '26-423-02-24-02',
    moldNo: '049#',
    fixedLength: 341.79,
    extrusionMachine: 'JY-35',
    customerCode: 'C009887',
    customerName: '客户A',
    scheduleNo: 'PC-20260424-001',
    scheduleType: '正常',
    productionType: '量产',
    alloy: '6R02',
    materialQty: 3,
    trayMaxLoad: 50,
    isBoxed: false,
    piecesPerBox: 10,
    boxCount: 0,
    tareWeight: '10',
    shiftTeam: '裁切A06班',
    singleCodeQty: '1',
    status: '已打印',
    operator: '张三',
    updateTime: '2026-04-24 10:30:00',
    branches: [
      { code: 'LB-260424-001', laserCode: 'LC-80121', engraveTime: '2026-04-24 10:05:12', frameNo: 'CV-A-A-L6000*W1250*H650*0200', qty: 1 },
      { code: 'LB-260424-002', laserCode: 'LC-80122', engraveTime: '2026-04-24 10:05:25', frameNo: 'CV-A-A-L6000*W1250*H650*0201', qty: 1 },
      { code: 'LB-260424-003', laserCode: 'LC-80123', engraveTime: '2026-04-24 10:05:41', frameNo: 'CV-A-A-L6000*W1250*H650*0202', qty: 1 }
    ]
  },
  {
    id: 2,
    packageNo: 'CTPK-20260424-002',
    frameNo: 'CV-A-A-L6000*W1250*H650*0203',
    productName: 'FC32',
    extrusionBatch: 'JY2603070002',
    furnaceNo: '25-412-06-11-03',
    moldNo: '999#',
    fixedLength: 130.0,
    extrusionMachine: 'JY-07',
    customerCode: 'C009887',
    customerName: '客户A',
    scheduleNo: 'PC-20260424-002',
    scheduleType: '加急',
    productionType: '试产',
    alloy: '6R02',
    materialQty: 4,
    trayMaxLoad: 50,
    isBoxed: true,
    piecesPerBox: 2,
    boxCount: 2,
    tareWeight: '8',
    shiftTeam: '裁切B01班',
    singleCodeQty: '2',
    status: '已打印',
    operator: '李四',
    updateTime: '2026-04-24 11:15:00',
    branches: [
      { code: 'LB-260424-101', laserCode: 'LC-90211', engraveTime: '2026-04-24 10:55:12', frameNo: 'CV-A-A-L6000*W1250*H650*0204', qty: 1 },
      { code: 'LB-260424-102', laserCode: 'LC-90212', engraveTime: '2026-04-24 10:55:24', frameNo: 'CV-A-A-L6000*W1250*H650*0205', qty: 1 },
      { code: 'LB-260424-103', laserCode: 'LC-90213', engraveTime: '2026-04-24 10:55:39', frameNo: 'CV-A-A-L6000*W1250*H650*0206', qty: 1 },
      { code: 'LB-260424-104', laserCode: 'LC-90214', engraveTime: '2026-04-24 10:55:48', frameNo: 'CV-A-A-L6000*W1250*H650*0207', qty: 1 }
    ]
  }
])
const selectedPackages = ref<any[]>([])
const currentPackageId = ref<number | null>(1)
const selectedPackageBranches = ref<any[]>([])
const packageDetailDialogVisible = ref(false)


const filteredPackageList = computed(() => {
  return packageRecords.value.filter(item => {
    const matchScheduleNo = !packageSearchForm.value.scheduleNo || (item.scheduleNo && item.scheduleNo.includes(packageSearchForm.value.scheduleNo))
    const matchFrameNo = !packageSearchForm.value.frameNo || item.frameNo.includes(packageSearchForm.value.frameNo)
    const matchBatch = !packageSearchForm.value.extrusionBatch || item.extrusionBatch.includes(packageSearchForm.value.extrusionBatch)
    const matchCustomerName = !packageSearchForm.value.customerName || (item.customerName && item.customerName.includes(packageSearchForm.value.customerName))
    return matchScheduleNo && matchFrameNo && matchBatch && matchCustomerName
  })
})

const currentPackageRecord = computed(() => {
  return packageRecords.value.find(item => item.id === currentPackageId.value) || null
})

const generateCuttingPackageNo = () => {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const seed = String(packageSeed.value).padStart(3, '0')
  packageSeed.value += 1
  return `CTPK-${datePart}-${seed}`
}

const generateFrameNo = () => {
  const now = new Date()
  const datePart = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const seed = String(frameSeed.value).padStart(3, '0')
  frameSeed.value += 1
  return `F-${datePart}-${seed}`
}

const handleReprintPallet = () => {
  if (selectedPackages.value.length !== 1) return
  reprintPallet(selectedPackages.value[0])
}

const handleReprintBoxes = () => {
  if (selectedPackages.value.length !== 1) return
  reprintBoxes(selectedPackages.value[0])
}

const handlePackageSearch = () => {
  // 触发 computed 更新
}

const resetPackageSearch = () => {
  packageSearchForm.value = {
    scheduleNo: '',
    frameNo: '',
    extrusionBatch: '',
    customerName: ''
  }
}

const handlePackageSelectionChange = (rows: any[]) => {
  selectedPackages.value = rows
}

const handlePackageRowClick = (row: any) => {
  currentPackageId.value = row.id
  selectedPackageBranches.value = []
}

const openPackageDetail = (row: any) => {
  currentPackageId.value = row.id
  packageDetailDialogVisible.value = true
}

const handlePackageBranchSelectionChange = (rows: any[]) => {
  selectedPackageBranches.value = rows
}

const newPackageBranchCode = ref('')

const handleAddPackageBranch = () => {
  if (!newPackageBranchCode.value) return
  if (currentPackageRecord.value && currentPackageRecord.value.branches) {
    currentPackageRecord.value.branches.push({
      code: 'LB-' + Math.floor(Math.random() * 90000 + 10000),
      laserCode: newPackageBranchCode.value,
      engraveTime: formatNow(),
      qty: 1
    })
    newPackageBranchCode.value = ''
    ElMessage.success('镭雕码录入成功')
  }
}

const removePackageBranch = (index: number) => {
  if (currentPackageRecord.value && currentPackageRecord.value.branches) {
    currentPackageRecord.value.branches.splice(index, 1)
    ElMessage.success('镭雕码移除成功')
  }
}







// --- 打印物料标识卡模块 ---
const hasActiveSchedule = ref(true)

const availableSourceFrames = computed(() => {
  if (!scheduleInfo.value.scheduleNo) return []
  // 在实际业务中，这应该从排程详情或者物料清单中获取。这里模拟从物料清单中筛选。
  const frames = new Set<string>()
  materialList.value.forEach(item => {
    if (item.extrusionBatch === scheduleInfo.value.extrusionBatchNo && item.productName === scheduleInfo.value.productName) {
      frames.add(item.frameNo)
    }
  })
  return Array.from(frames)
})

const completeSchedule = () => {
  ElMessageBox.confirm('确认完成当前排程吗？', '提示', { type: 'warning' }).then(() => {
    hasActiveSchedule.value = false
    scheduleInfo.value = {
      scheduleNo: '',
      scheduleType: '',
      customerCode: '',
      customerName: '',
      planQty: 0,
      singleWeight: 0,
      furnaceNo: '',
      extrusionBatchNo: '',
      moldNo: '',
      fixedLength: '',
      alloy: '',
      productName: '',
      componentMaterialNo: '',
      customerMaterialNo: '',
      customerProductName: '',
      productionType: ''
    }
    ElMessage.success('排程已完成')
  }).catch(() => {})
}

const scheduleInfo = ref({
  scheduleNo: 'PC-20260424-002',
  scheduleType: '加急',
  customerCode: 'C009887',
  customerName: '客户A',
  planQty: 500,
  singleWeight: 2.5,
  furnaceNo: '25-412-06-11-03',
  extrusionBatchNo: 'JY2603070002',
  moldNo: '999#',
  fixedLength: '130.0',
  alloy: '6R02',
  productName: 'FC13',
  componentMaterialNo: 'CM-002',
  customerMaterialNo: 'C-MAT-002',
  customerProductName: 'Customer SR-34',
  productionType: '试产'
})

const printForm = ref({
  sourceFrameNo: '',
  frameNo: '',
  longBranchCode: '',
  materialQty: 0,
  palletCount: 1,
  trayMaxLoad: 50,
  tareWeight: '',
  singleCodeQty: '',
  isBoxed: false,
  piecesPerBox: 10,
  boxCount: 0
})

const boundBranches = ref<any[]>([])

const handleAddLongBranch = () => {
  if (!printForm.value.longBranchCode) return
  if (!printForm.value.frameNo) {
    ElMessage.warning('请先输入或扫描托盘号')
    return
  }
  // 模拟添加长支
  boundBranches.value.push({
    code: 'LB-' + Math.floor(Math.random() * 90000 + 10000),
    laserCode: printForm.value.longBranchCode,
    engraveTime: formatNow(),
    frameNo: 'CV-A-A-L6000*W1250*H650*0208' + Math.floor(Math.random() * 9000 + 1000),
    qty: 1
  })
  printForm.value.longBranchCode = ''
  syncMaterialQty()
  if (!ensureWithinTrayCapacity()) {
    boundBranches.value.pop()
    syncMaterialQty()
    return
  }
  ElMessage.success('镭雕码绑定成功')
}

const removeBranch = (index: number) => {
  boundBranches.value.splice(index, 1)
  syncMaterialQty()
}

const calculateBoxes = () => {
  if (printForm.value.isBoxed && printForm.value.piecesPerBox > 0) {
    printForm.value.boxCount = Math.ceil(printForm.value.materialQty / printForm.value.piecesPerBox)
  } else {
    printForm.value.boxCount = 0
  }
}

const viewProcessDocument = () => {
  processDocContext.value = {
    productNo: String((scheduleInfo.value as any).productNo || ''),
    productName: String(scheduleInfo.value.productName || '')
  }
  processDocDialogVisible.value = true
}

// 打印预览
const printPreviewVisible = ref(false)
const previewType = ref<'pallet' | 'box'>('pallet')
const previewData = ref<any>({})

const buildPreviewData = () => ({
  ...printForm.value,
  ...buildMaterialTagPreviewData({
    source: {
      ...scheduleInfo.value,
      ...labelContext.value,
      frameNo: boundBranches.value.length > 0 ? boundBranches.value[0].frameNo : labelContext.value.frameNo || '',
      materialQty: printForm.value.materialQty
    },
    shiftTeam: currentTeam.value || ''
  })
})

const previewPalletLabel = async () => {
  if (!printForm.value.sourceFrameNo) {
    ElMessage.warning('请先选择料框')
    return
  }
  if (!printForm.value.frameNo) {
    ElMessage.warning('请先输入托盘号并绑定镭雕码')
    return
  }
  if (!ensureWithinTrayCapacity()) return
  previewType.value = 'pallet'
  previewData.value = buildPreviewData()
  await buildTeamQr()
  printPreviewVisible.value = true
}

const previewBoxLabels = async () => {
  if (!printForm.value.isBoxed) return
  if (!printForm.value.sourceFrameNo) {
    ElMessage.warning('请先选择料框')
    return
  }
  if (!printForm.value.frameNo) {
    ElMessage.warning('请先输入托盘号并绑定镭雕码')
    return
  }
  previewType.value = 'box'
  previewData.value = buildPreviewData()
  await buildTeamQr()
  printPreviewVisible.value = true
}

const completePallet = () => {
  ElMessageBox.confirm('确认当前托盘信息已录入完成吗？完成后将清空当前绑定的长支及托盘号，以便录入新托盘。', '完成确认', { type: 'info' }).then(() => {
    printForm.value.sourceFrameNo = ''
    printForm.value.frameNo = currentTeam.value || ''
    printForm.value.longBranchCode = ''
    printForm.value.materialQty = 0
    if (printForm.value.isBoxed) {
      printForm.value.boxCount = 0
    }
    boundBranches.value = []
    ElMessage.success('托盘信息已完成，请录入新托盘')
  }).catch(() => {})
}

const confirmPrint = () => {
  ElMessage.success(`${previewType.value === 'pallet' ? '物料' : '小箱'}标识卡打印指令已发送`)

  if (labelContext.value.sourcePackageId) {
    const target = packageRecords.value.find(item => item.id === labelContext.value.sourcePackageId)
    if (target) {
      target.frameNo = printForm.value.frameNo
      target.materialQty = printForm.value.materialQty
      target.trayMaxLoad = printForm.value.trayMaxLoad
      target.tareWeight = printForm.value.tareWeight
      target.shiftTeam = currentTeam.value || target.shiftTeam
      target.singleCodeQty = printForm.value.singleCodeQty
      target.isBoxed = printForm.value.isBoxed
      target.piecesPerBox = printForm.value.piecesPerBox
      target.boxCount = printForm.value.boxCount
      target.status = '已打印'
      target.updateTime = formatNow()
      target.branches = cloneBranches(boundBranches.value)
      target.productName = previewData.value.productName
      target.extrusionBatch = previewData.value.extrusionBatch
      target.furnaceNo = previewData.value.furnaceNo
      target.moldNo = previewData.value.moldNo
      target.fixedLength = previewData.value.fixedLength
      target.extrusionMachine = previewData.value.extrusionMachine
      target.customerCode = previewData.value.customerCode
      target.customerName = previewData.value.customerName
      target.scheduleNo = previewData.value.scheduleNo
      target.scheduleType = previewData.value.scheduleType
      target.productionType = previewData.value.productionType
      target.alloy = previewData.value.alloy
      currentPackageId.value = target.id
    }
    labelContext.value.sourcePackageId = null
  } else {
    packageRecords.value.unshift({
      id: Date.now(),
      packageNo: generateCuttingPackageNo(),
      frameNo: printForm.value.frameNo,
      productName: scheduleInfo.value.productName,
      extrusionBatch: scheduleInfo.value.extrusionBatchNo,
      furnaceNo: scheduleInfo.value.furnaceNo,
      moldNo: scheduleInfo.value.moldNo,
      fixedLength: scheduleInfo.value.fixedLength,
      extrusionMachine: 'JY-35',
      customerCode: scheduleInfo.value.customerCode,
      customerName: scheduleInfo.value.customerName,
      scheduleNo: scheduleInfo.value.scheduleNo,
      scheduleType: scheduleInfo.value.scheduleType,
      productionType: scheduleInfo.value.productionType,
      alloy: scheduleInfo.value.alloy,
      materialQty: printForm.value.materialQty,
      trayMaxLoad: printForm.value.trayMaxLoad,
      isBoxed: printForm.value.isBoxed,
      piecesPerBox: printForm.value.piecesPerBox,
      boxCount: printForm.value.boxCount,
      tareWeight: printForm.value.tareWeight,
      shiftTeam: currentTeam.value,
      singleCodeQty: printForm.value.singleCodeQty,
      status: '已打印',
      operator: '当前用户',
      updateTime: formatNow(),
      branches: cloneBranches(boundBranches.value)
    })
  }

  printPreviewVisible.value = false
}

const reprintPallet = async (row: any) => {
  labelContext.value = {
    ...labelContext.value,
    sourcePackageId: null,
    productName: row.productName,
    extrusionBatch: row.extrusionBatch
  }
  printForm.value.frameNo = row.frameNo
  printForm.value.materialQty = row.materialQty
  printForm.value.isBoxed = row.isBoxed
  printForm.value.boxCount = row.boxCount
  previewType.value = 'pallet'
  previewData.value = buildPreviewData()
  await buildTeamQr()
  printPreviewVisible.value = true
}

const reprintBoxes = async (row: any) => {
  labelContext.value = {
    ...labelContext.value,
    sourcePackageId: null,
    productName: row.productName,
    extrusionBatch: row.extrusionBatch
  }
  printForm.value.frameNo = row.frameNo
  printForm.value.materialQty = row.materialQty
  printForm.value.isBoxed = row.isBoxed
  printForm.value.boxCount = row.boxCount
  printForm.value.piecesPerBox = Math.ceil(row.materialQty / Math.max(row.boxCount || 1, 1))
  previewType.value = 'box'
  previewData.value = buildPreviewData()
  await buildTeamQr()
  printPreviewVisible.value = true
}
</script>

<style scoped>
.page-container {
  padding: 20px;
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
.main-card {
  min-height: calc(100vh - 120px);
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}

/* 打印区域样式 */
.print-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid #409eff;
}
.schedule-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.schedule-info-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-title-compact {
  margin-bottom: 0;
}
.package-layout {
  min-height: 520px;
}
.package-panel {
  height: 100%;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
}
.package-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.package-summary {
  color: #606266;
  font-size: 13px;
}
.package-detail-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.package-description {
  margin-bottom: 12px;
}
.package-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}
.print-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

/* 标识卡预览表格样式 */
.label-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.multi-preview {
  max-height: 60vh;
  overflow-y: auto;
  width: 100%;
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
  top: 0px;
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

.label-table {
  width: 100%;
  max-width: 700px;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  font-size: 14px;
}
.label-table td {
  border: 1px solid #000;
  padding: 8px;
  text-align: center;
}
.header-cell {
  background-color: #f5f7fa;
  font-weight: bold;
  width: 120px;
}
</style>
