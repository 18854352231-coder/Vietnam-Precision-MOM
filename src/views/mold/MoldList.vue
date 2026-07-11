<template>
  <div class="page-container">
    <el-card class="full-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="生产可用" name="生产可用" />
        <el-tab-pane label="报废" name="报废" />
        <el-tab-pane label="共用模" name="共用模" />
        <el-tab-pane label="暂停" name="暂停" />
        <el-tab-pane label="订单取消" name="订单取消" />
      </el-tabs>

      <div class="search-wrapper">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="模具编码">
            <el-input v-model="searchForm.moldNo" placeholder="请输入模具编码" clearable />
          </el-form-item>
          <el-form-item label="型号/产品">
            <el-input v-model="searchForm.productModel" placeholder="请输入型号或产品" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <el-button type="primary" icon="Plus" @click="openDialog('create')">新建模具</el-button>
        <el-button type="success" icon="Upload" @click="dialogs.import.visible = true">批量导入</el-button>
        <el-button icon="Wrench" @click="openDialog('repair')" :disabled="!singleSelected">登记维修</el-button>
        <el-button type="danger" icon="Delete" plain @click="handleScrap" :disabled="!singleSelected">报废</el-button>
      </div>

      <el-table :data="displayTableData" border stripe height="calc(100vh - 280px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="moldNo" label="模具编号" width="140" />
        <el-table-column prop="manufacturer" label="厂商" width="100" />
        <el-table-column prop="issueDate" label="发包日期" width="120" />
        <el-table-column prop="entryDate" label="入厂日期" width="120" />
        <el-table-column prop="machine" label="机台" width="100" />
        <el-table-column prop="spec" label="规格" width="120" />
        <el-table-column prop="productNo" label="产品号" width="120" />
        <el-table-column prop="trialTimes" label="试模次数" width="100" />
        <el-table-column prop="steelCode" label="钢料代码" width="100" />
        <el-table-column prop="model" label="模具组号(型号)" width="120" />
        <el-table-column prop="moldCode" label="模号" width="80" />
        <el-table-column prop="tonnage" label="吨位(KG)" width="100" />
        <el-table-column prop="nitridingDate1" label="第1次氮化" width="120" />
        <el-table-column prop="nitridingDate2" label="第2次氮化" width="120" />
        <el-table-column prop="nitridingDate3" label="第3次氮化" width="120" />
        <el-table-column prop="nitridingDate4" label="第4次氮化" width="120" />
        <el-table-column v-if="activeTab === '报废'" prop="scrapDate" label="报废日期" width="120" />
        <el-table-column v-if="activeTab === '报废'" prop="scrapReason" label="报废原因" width="150" />
        <el-table-column v-if="activeTab === '暂停'" prop="pauseReason" label="暂停原因" width="150" />
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAction(row, '履历')">履历</el-button>
            <el-button link type="primary" size="small" @click="handleAction(row, '编辑')">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleAction(row, '详情')">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="124"
        />
      </div>
    </el-card>

    <!-- 新建模具弹窗 -->
    <el-dialog v-model="dialogs.create.visible" title="新建模具" width="1000px" top="5vh">
      <div class="dialog-section-title">基础信息</div>
      <el-form :model="dialogs.create.form" label-position="top">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="厂商" required>
              <el-select v-model="dialogs.create.form.manufacturer" placeholder="请选择" style="width: 100%">
                <el-option label="JM" value="JM" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="发包日期">
              <el-date-picker v-model="dialogs.create.form.issueDate" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="入厂日期">
              <el-date-picker v-model="dialogs.create.form.entryDate" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="机台" required>
              <el-input v-model="dialogs.create.form.machine" placeholder="请输入机台" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="规格">
              <el-input v-model="dialogs.create.form.spec" placeholder="请输入规格" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="产品号">
              <el-input v-model="dialogs.create.form.productNo" placeholder="请输入产品号" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="试模次数">
              <el-input v-model="dialogs.create.form.trialTimes" placeholder="请输入次数" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="钢料代码">
              <el-input v-model="dialogs.create.form.steelCode" placeholder="请输入代码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="模具组号(型号)" required>
              <el-autocomplete
                v-model="dialogs.create.form.model"
                :fetch-suggestions="queryModelSearch"
                placeholder="请输入并选择模具组号"
                style="width: 100%"
                @select="handleModelSelect"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="模号" required>
              <el-input v-model="dialogs.create.form.moldCode" placeholder="如 002" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="模具编号">
              <el-input v-model="dialogs.create.form.moldNo" placeholder="自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="吨位(KG)">
              <el-input v-model="dialogs.create.form.tonnage" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="第1次氮化">
              <el-date-picker v-model="dialogs.create.form.nitridingDate1" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="第2次氮化">
              <el-date-picker v-model="dialogs.create.form.nitridingDate2" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="第3次氮化">
              <el-date-picker v-model="dialogs.create.form.nitridingDate3" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="第4次氮化">
              <el-date-picker v-model="dialogs.create.form.nitridingDate4" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="dialogs.create.form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态" required>
              <el-select v-model="dialogs.create.form.status" placeholder="请选择" style="width: 100%">
                <el-option label="生产可用" value="生产可用" />
                <el-option label="报废" value="报废" />
                <el-option label="共用模" value="共用模" />
                <el-option label="暂停" value="暂停" />
                <el-option label="订单取消" value="订单取消" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="dialogs.create.form.status === '暂停'">
            <el-form-item label="暂停原因" required>
              <el-input v-model="dialogs.create.form.pauseReason" placeholder="请输入暂停原因" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.create.visible = false">取消</el-button>
          <el-button type="primary" @click="submitDialog('create')">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 维修弹窗 -->
    <el-dialog v-model="dialogs.repair.visible" title="登记维修" width="500px">
      <el-alert title="请填写维修需求" type="info" :description="`当前选中模具：${currentSelectedMold?.moldNo}`" show-icon style="margin-bottom: 20px" />
      <el-form :model="dialogs.repair.form" label-width="100px">
        <el-form-item label="故障原因" required>
          <el-input v-model="dialogs.repair.form.reason" type="textarea" placeholder="请简述模具损坏或需维修的原因" />
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-select v-model="dialogs.repair.form.priority" style="width: 100%">
            <el-option label="常规" value="普通" />
            <el-option label="加急" value="加急" />
            <el-option label="特急" value="特急" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.repair.visible = false">取消</el-button>
          <el-button type="primary" @click="submitDialog('repair')">提交维修</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogs.detail.visible" title="模具详情" width="800px" top="5vh">
      <div v-if="currentDetailRow">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="厂商">{{ currentDetailRow.manufacturer }}</el-descriptions-item>
          <el-descriptions-item label="发包日期">{{ currentDetailRow.issueDate }}</el-descriptions-item>
          <el-descriptions-item label="入厂日期">{{ currentDetailRow.entryDate }}</el-descriptions-item>
          
          <el-descriptions-item label="机台">{{ currentDetailRow.machine }}</el-descriptions-item>
          <el-descriptions-item label="规格">{{ currentDetailRow.spec }}</el-descriptions-item>
          <el-descriptions-item label="产品号">{{ currentDetailRow.productNo }}</el-descriptions-item>
          <el-descriptions-item label="试模次数">{{ currentDetailRow.trialTimes }}</el-descriptions-item>
          <el-descriptions-item label="钢料代码">{{ currentDetailRow.steelCode }}</el-descriptions-item>
          <el-descriptions-item label="模具组号(型号)">{{ currentDetailRow.model }}</el-descriptions-item>
          
          <el-descriptions-item label="模号">{{ currentDetailRow.moldCode }}</el-descriptions-item>
          <el-descriptions-item label="模具编号">{{ currentDetailRow.moldNo }}</el-descriptions-item>
          <el-descriptions-item label="吨位(KG)">{{ currentDetailRow.tonnage }}</el-descriptions-item>
          
          <el-descriptions-item label="第1次氮化">{{ currentDetailRow.nitridingDate1 }}</el-descriptions-item>
          <el-descriptions-item label="第2次氮化">{{ currentDetailRow.nitridingDate2 }}</el-descriptions-item>
          <el-descriptions-item label="第3次氮化">{{ currentDetailRow.nitridingDate3 }}</el-descriptions-item>
          
          <el-descriptions-item label="第4次氮化">{{ currentDetailRow.nitridingDate4 }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetailRow.status === '报废'" label="报废日期">{{ currentDetailRow.scrapDate || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetailRow.status === '报废'" label="报废原因">{{ currentDetailRow.scrapReason || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetailRow.status === '暂停'" label="暂停原因">{{ currentDetailRow.pauseReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentDetailRow.status)" size="small">{{ currentDetailRow.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentDetailRow.remark }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogs.detail.visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑模具弹窗 -->
    <el-dialog v-model="dialogs.edit.visible" title="编辑模具" width="1000px" top="5vh">
      <div class="dialog-section-title">基础信息</div>
      <el-form :model="dialogs.edit.form" label-position="top">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="厂商" required>
              <el-select v-model="dialogs.edit.form.manufacturer" placeholder="请选择" style="width: 100%">
                <el-option label="JM" value="JM" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="发包日期">
              <el-date-picker v-model="dialogs.edit.form.issueDate" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="入厂日期">
              <el-date-picker v-model="dialogs.edit.form.entryDate" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="机台" required>
              <el-input v-model="dialogs.edit.form.machine" placeholder="请输入机台" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="规格">
              <el-input v-model="dialogs.edit.form.spec" placeholder="请输入规格" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="产品号">
              <el-input v-model="dialogs.edit.form.productNo" placeholder="请输入产品号" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="试模次数">
              <el-input v-model="dialogs.edit.form.trialTimes" placeholder="请输入次数" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="钢料代码">
              <el-input v-model="dialogs.edit.form.steelCode" placeholder="请输入代码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="模具组号(型号)" required>
              <el-autocomplete
                v-model="dialogs.edit.form.model"
                :fetch-suggestions="queryModelSearch"
                placeholder="请输入并选择模具组号"
                style="width: 100%"
                @select="handleModelSelect"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="模号" required>
              <el-input v-model="dialogs.edit.form.moldCode" placeholder="如 002" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="模具编号">
              <el-input v-model="dialogs.edit.form.moldNo" placeholder="自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="吨位(KG)">
              <el-input v-model="dialogs.edit.form.tonnage" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="第1次氮化">
              <el-date-picker v-model="dialogs.edit.form.nitridingDate1" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="第2次氮化">
              <el-date-picker v-model="dialogs.edit.form.nitridingDate2" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="第3次氮化">
              <el-date-picker v-model="dialogs.edit.form.nitridingDate3" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="第4次氮化">
              <el-date-picker v-model="dialogs.edit.form.nitridingDate4" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="dialogs.edit.form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态" required>
              <el-select v-model="dialogs.edit.form.status" placeholder="请选择" style="width: 100%">
                <el-option label="生产可用" value="生产可用" />
                <el-option label="报废" value="报废" />
                <el-option label="共用模" value="共用模" />
                <el-option label="暂停" value="暂停" />
                <el-option label="订单取消" value="订单取消" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="dialogs.edit.form.status === '暂停'">
            <el-form-item label="暂停原因" required>
              <el-input v-model="dialogs.edit.form.pauseReason" placeholder="请输入暂停原因" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.edit.visible = false">取消</el-button>
          <el-button type="primary" @click="submitDialog('edit')">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 模具履历弹窗 -->
    <el-dialog v-model="dialogs.resume.visible" title="模具履历" width="1000px" top="5vh">
      <div class="dialog-section-title">履历记录 - {{ currentDetailRow?.moldNo }}</div>
      
      <div class="search-wrapper" style="margin-bottom: 15px;">
        <el-form :inline="true" :model="dialogs.resume.searchForm">
          <el-form-item label="事件类型">
            <el-select v-model="dialogs.resume.searchForm.eventType" placeholder="全部" clearable style="width: 140px">
              <el-option label="收模" value="收模" />
              <el-option label="模具加热" value="模具加热" />
              <el-option label="模具到温" value="模具到温" />
              <el-option label="上模" value="上模" />
              <el-option label="卸模" value="卸模" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dialogs.resume.searchForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 320px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleResumeSearch">查询</el-button>
            <el-button icon="Download" @click="handleResumeExport">导出履历</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="displayResumeData" border stripe max-height="400">
        <el-table-column prop="time" label="发生时间" width="160" align="center" />
        <el-table-column prop="eventType" label="事件类型" width="120" align="center" />
        <el-table-column prop="desc" label="详细描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="orderNo" label="关联单据" width="160" align="center" />
        <el-table-column prop="operator" label="操作人" width="100" align="center" />
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogs.resume.visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog v-model="dialogs.import.visible" title="批量导入模具" width="500px">
      <div class="import-container">
        <div class="step-title">第一步：下载模板</div>
        <div class="step-desc">
          <p>请下载标准的模具导入模板，按照模板格式要求填写数据。</p>
          <el-button type="primary" link icon="Download" @click="downloadTemplate">点击下载模板文件</el-button>
        </div>

        <div class="step-title" style="margin-top: 30px;">第二步：上传数据文件</div>
        <div class="step-desc">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleBatchImport"
            :show-file-list="false"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持 .xls, .xlsx 格式文件，单次最多导入 500 条
              </div>
            </template>
          </el-upload>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const searchForm = ref({ moldNo: '', productModel: '', status: '', orderNo: '' })
const currentPage = ref(1)
const pageSize = ref(20)

const activeTab = ref('生产可用')

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  // 可以根据tab触发查询
}

const tableData = ref([
  { 
    manufacturer: 'JM', issueDate: '2026-01-10', entryDate: '2026-02-15', machine: '挤压1线', 
    spec: 'Φ150*L300', productNo: 'P-1001', trialTimes: '3', steelCode: 'H13', 
    model: 'M10-0649', moldCode: '002', moldNo: 'M10-0649-002', tonnage: '1000', 
    nitridingDate1: '2026-03-01', nitridingDate2: '', nitridingDate3: '', nitridingDate4: '', 
    remark: '常规模具', status: '生产可用'
  },
  { 
    manufacturer: 'JM', issueDate: '2026-02-20', entryDate: '2026-03-25', machine: '挤压2线', 
    spec: 'Φ200*L400', productNo: 'P-2002', trialTimes: '1', steelCode: 'H13', 
    model: 'M10-0731', moldCode: '001', moldNo: 'M10-0731-001', tonnage: '1500', 
    nitridingDate1: '2026-04-10', nitridingDate2: '2026-05-15', nitridingDate3: '', nitridingDate4: '', 
    remark: '加急模具', status: '暂停', pauseReason: '机台保养暂停使用'
  },
  { 
    manufacturer: 'JM', issueDate: '2025-12-10', entryDate: '2026-01-05', machine: '挤压1线', 
    spec: 'Φ150*L300', productNo: 'P-1003', trialTimes: '5', steelCode: 'H13', 
    model: 'M10-0649', moldCode: '003', moldNo: 'M10-0649-003', tonnage: '1000', 
    nitridingDate1: '2026-01-10', nitridingDate2: '', nitridingDate3: '', nitridingDate4: '', 
    remark: '寿命到期', status: '报废', scrapDate: '2026-05-10', scrapReason: '寿命到期，无法继续使用'
  }
])

const displayTableData = computed(() => {
  return tableData.value.filter(item => item.status === activeTab.value)
})

// 模拟模具组号数据源
const modelSuggestions = ref([
  { value: 'M10-0649', spec: 'Φ150*L300', productNo: 'P-1001' },
  { value: 'M10-0731', spec: 'Φ200*L400', productNo: 'P-2002' },
  { value: 'M10-0805', spec: 'Φ180*L350', productNo: 'P-1005' },
  { value: 'M11-0120', spec: 'Φ120*L250', productNo: 'P-3001' }
])

const queryModelSearch = (queryString: string, cb: any) => {
  const results = queryString
    ? modelSuggestions.value.filter(createFilter(queryString))
    : modelSuggestions.value
  cb(results)
}

const createFilter = (queryString: string) => {
  return (suggestion: any) => {
    return suggestion.value.toLowerCase().includes(queryString.toLowerCase())
  }
}

const handleModelSelect = (item: any) => {
  // 当选中模具组号时，可以考虑自动带出对应的规格或产品号（此处仅作演示，具体看业务需求）
  // 比如：dialogs.value.create.form.spec = item.spec
}

const selectedRows = ref<any[]>([])
const singleSelected = computed(() => selectedRows.value.length === 1)
const currentSelectedMold = computed(() => selectedRows.value[0] || null)
const currentDetailRow = ref<any>(null)

const dialogs = ref({
  create: { 
    visible: false, 
    form: { 
      moldNo: '', manufacturer: 'JM', issueDate: '', entryDate: '', machine: '', spec: '', 
      productNo: '', trialTimes: '', steelCode: '', model: '', moldCode: '', 
      tonnage: '', nitridingDate1: '', nitridingDate2: '', nitridingDate3: '', 
      nitridingDate4: '', remark: '', status: '生产可用', pauseReason: ''
    } 
  },
  edit: { 
    visible: false, 
    form: { 
      moldNo: '', manufacturer: 'JM', issueDate: '', entryDate: '', machine: '', spec: '', 
      productNo: '', trialTimes: '', steelCode: '', model: '', moldCode: '', 
      tonnage: '', nitridingDate1: '', nitridingDate2: '', nitridingDate3: '', 
      nitridingDate4: '', remark: '', status: '生产可用', _originalMoldNo: '', pauseReason: ''
    } 
  },
  repair: { visible: false, form: { reason: '', priority: '普通' } },
  detail: { visible: false },
  resume: {
    visible: false,
    searchForm: { eventType: '', dateRange: [] as string[] }
  },
  import: { visible: false }
})

const resumeData = ref([
  { time: '2026-05-05 18:30:00', eventType: '卸模', desc: '机台M001卸模完成', orderNo: 'WO-240505-002', operator: '张三' },
  { time: '2026-05-05 14:00:00', eventType: '上模', desc: '机台M001上模完成', orderNo: 'WO-240505-001', operator: '李四' },
  { time: '2026-05-05 13:50:00', eventType: '模具到温', desc: '模具加热达到目标温度', orderNo: '-', operator: '系统自动' },
  { time: '2026-05-05 12:00:00', eventType: '模具加热', desc: '开始加热', orderNo: '-', operator: '王五' },
  { time: '2026-05-05 11:30:00', eventType: '收模', desc: '挤压工作台收模完成', orderNo: '-', operator: '赵六' }
])

const displayResumeData = computed(() => {
  let result = resumeData.value

  // 1. 过滤事件类型
  if (dialogs.value.resume.searchForm.eventType) {
    result = result.filter(item => item.eventType === dialogs.value.resume.searchForm.eventType)
  }

  // 2. 过滤时间范围
  const dateRange = dialogs.value.resume.searchForm.dateRange
  if (dateRange && dateRange.length === 2) {
    const startTime = new Date(dateRange[0]).getTime()
    const endTime = new Date(dateRange[1]).getTime()
    result = result.filter(item => {
      const itemTime = new Date(item.time).getTime()
      return itemTime >= startTime && itemTime <= endTime
    })
  }

  return result
})

const handleResumeSearch = () => {
  ElMessage.success('履历查询完成')
}

const handleResumeExport = () => {
  ElMessage.success('履历导出任务已提交，请稍后在下载中心查看')
}

watch(
  [() => dialogs.value.create.form.model, () => dialogs.value.create.form.moldCode],
  ([model, moldCode]) => {
    if (model && moldCode) {
      dialogs.value.create.form.moldNo = `${model}-${moldCode}`
    } else {
      dialogs.value.create.form.moldNo = ''
    }
  }
)

watch(
  [() => dialogs.value.edit.form.model, () => dialogs.value.edit.form.moldCode],
  ([model, moldCode]) => {
    if (model && moldCode) {
      dialogs.value.edit.form.moldNo = `${model}-${moldCode}`
    } else {
      dialogs.value.edit.form.moldNo = ''
    }
  }
)

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSearch = () => {
  ElMessage.success('查询完成')
}

const handleReset = () => {
  searchForm.value = { moldNo: '', productModel: '', status: '', orderNo: '' }
}

const openDialog = (type: 'create' | 'repair') => {
  dialogs.value[type].visible = true
}

const submitDialog = (type: 'create' | 'edit' | 'repair') => {
  ElMessage.success('操作已成功提交')
  dialogs.value[type].visible = false
  
  // 模拟如果是新建模具，则添加到列表
  if (type === 'create') {
    const newMold = { ...dialogs.value.create.form }
    if (newMold.moldNo) {
      tableData.value.unshift(newMold)
    }
    dialogs.value.create.form = { 
      moldNo: '', manufacturer: 'JM', issueDate: '', entryDate: '', machine: '', spec: '', 
      productNo: '', trialTimes: '', steelCode: '', model: '', moldCode: '', 
      tonnage: '', nitridingDate1: '', nitridingDate2: '', nitridingDate3: '', 
      nitridingDate4: '', remark: '', status: '生产可用', pauseReason: ''
    }
  }

  // 模拟如果是编辑模具，更新列表中的数据
  if (type === 'edit') {
    const updatedMold = { ...dialogs.value.edit.form }
    const index = tableData.value.findIndex(m => m.moldNo === (updatedMold as any)._originalMoldNo || m.moldNo === updatedMold.moldNo)
    if (index !== -1) {
      delete (updatedMold as any)._originalMoldNo
      tableData.value[index] = updatedMold
    }
  }
}

const handleBatchImport = (file: any) => {
  ElMessage.success(`成功导入模具文件: ${file.name}`)
  dialogs.value.import.visible = false
}

const downloadTemplate = () => {
  ElMessage.success('模板下载已开始')
}

const handleScrap = () => {
  if (!singleSelected.value) return
  ElMessageBox.prompt('请输入报废原因', `报废模具 [${currentSelectedMold.value.moldNo}]`, {
    confirmButtonText: '确认报废',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '报废原因不能为空',
    inputType: 'textarea',
  }).then(({ value }) => {
    ElMessage.success('模具已登记报废')
    // 将状态更改为报废
    const index = tableData.value.findIndex(m => m.moldNo === currentSelectedMold.value.moldNo)
    if (index !== -1) {
      tableData.value[index].status = '报废'
      tableData.value[index].scrapDate = new Date().toISOString().split('T')[0]
      tableData.value[index].scrapReason = value
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleAction = (row: any, action: string) => {
  if (action === '详情') {
    currentDetailRow.value = row
    dialogs.value.detail.visible = true
  } else if (action === '编辑') {
    dialogs.value.edit.form = { ...row, _originalMoldNo: row.moldNo }
    dialogs.value.edit.visible = true
  } else if (action === '履历') {
    currentDetailRow.value = row
    dialogs.value.resume.visible = true
  } else {
    ElMessage.info(`正在查看模具 [${row.moldNo}] 的${action}`)
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = { 
    '生产可用': 'success', 
    '暂停': 'warning', 
    '报废': 'info',
    '共用模': 'primary',
    '订单取消': 'danger'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.page-container { padding: 16px; height: 100%; box-sizing: border-box; background-color: var(--bg-primary); }
.full-card { height: 100%; display: flex; flex-direction: column; border: none; }
:deep(.el-card__body) { padding: 16px; flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.search-wrapper { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; display: flex; gap: 8px; }
.pagination-container { margin-top: 16px; display: flex; justify-content: flex-end; }
.dialog-section-title { font-size: 16px; font-weight: bold; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ebeef5; }
:deep(.el-form-item--label-top .el-form-item__label) { padding-bottom: 4px; line-height: 20px; }
:deep(.el-dialog__body) { padding-top: 10px; padding-bottom: 10px; }

/* 批量导入样式 */
.import-container { padding: 10px 20px; }
.step-title { font-size: 15px; font-weight: bold; color: var(--el-text-color-primary); margin-bottom: 10px; }
.step-desc { font-size: 13px; color: var(--el-text-color-regular); line-height: 1.6; padding-left: 10px; }
.step-desc p { margin: 0 0 10px 0; }
</style>
