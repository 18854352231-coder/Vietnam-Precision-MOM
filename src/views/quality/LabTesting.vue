<template>
  <div class="page-container">
    <el-card class="full-card" shadow="never">
      <div class="content-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="待收样" name="overview" />
          <el-tab-pane label="收样记录" name="receive_record" />
          <el-tab-pane label="检测登记" name="testing_registration" />
        </el-tabs>

        <!-- 总览搜索区域 -->
        <div class="search-bar" v-if="activeTab === 'overview'">
          <el-form :model="searchForm" label-width="100px" size="small">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="扫码收样" label-width="80px">
                  <el-input v-model="searchForm.scanCode" placeholder="扫码或回车自动提交" clearable @keyup.enter="handleScanReceive" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品名称" label-width="80px">
                  <el-input v-model="searchForm.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleSearch" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="模具号" label-width="70px">
                  <el-input v-model="searchForm.moldNo" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="挤压批次" label-width="80px">
                  <el-input v-model="searchForm.extrusionBatchNo" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="样品类型" label-width="80px">
                  <el-select v-model="searchForm.sampleType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A01-试片" value="A01-试片" />
                    <el-option label="B02-阳极样(单独取长支)" value="B02-阳极样(单独取长支)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="加工项目" label-width="80px">
                  <el-select v-model="searchForm.preparationItems" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="YD-硬度" value="YD-硬度" />
                    <el-option label="CF-成分" value="CF-成分" />
                    <el-option label="XYJX-金相" value="XYJX-金相" />
                    <el-option label="YZJX-金相" value="YZJX-金相" />
                    <el-option label="LS-拉伸" value="LS-拉伸" />
                    <el-option label="YJ-阳极" value="YJ-阳极" />
                    <el-option label="DB-低倍" value="DB-低倍" />
                    <el-option label="YB-压变" value="YB-压变" />
                    <el-option label="PJ-泡碱" value="PJ-泡碱" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="CNC制样时间" label-width="110px">
                  <el-date-picker
                    v-model="searchForm.cncPreparationDate"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="CNC送样时间" label-width="110px">
                  <el-date-picker
                    v-model="searchForm.cncDeliveryDate"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="24">
                <el-form-item label-width="0px">
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 收样记录搜索区域 -->
        <div class="search-bar" v-if="activeTab === 'receive_record'">
          <el-form :model="searchForm" label-width="100px" size="small">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="扫码查询" label-width="80px">
                  <el-input v-model="searchForm.scanCode" placeholder="扫码或回车自动提交" clearable @keyup.enter="handleScanRegister" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品类型" label-width="80px">
                  <el-select v-model="searchForm.productType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="手机类" value="手机类" />
                    <el-option label="电子类" value="电子类" />
                    <el-option label="交通类" value="交通类" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品名称" label-width="80px">
                  <el-input v-model="searchForm.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleSearch" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="模具号" label-width="70px">
                  <el-input v-model="searchForm.moldNo" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="挤压批次" label-width="80px">
                  <el-input v-model="searchForm.extrusionBatchNo" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="LAB收样时间" label-width="110px">
                  <el-date-picker
                    v-model="searchForm.labReceiveDate"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="加工项目" label-width="80px">
                  <el-select v-model="searchForm.preparationItems" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="YD-硬度" value="YD-硬度" />
                    <el-option label="CF-成分" value="CF-成分" />
                    <el-option label="XYJX-金相" value="XYJX-金相" />
                    <el-option label="YZJX-金相" value="YZJX-金相" />
                    <el-option label="LS-拉伸" value="LS-拉伸" />
                    <el-option label="YJ-阳极" value="YJ-阳极" />
                    <el-option label="DB-低倍" value="DB-低倍" />
                    <el-option label="YB-压变" value="YB-压变" />
                    <el-option label="PJ-泡碱" value="PJ-泡碱" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="20px">
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 检测登记搜索区域 -->
        <div class="search-bar" v-if="activeTab === 'testing_registration'">
          <el-form :model="searchForm" label-width="100px" size="small">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="扫码查询" label-width="80px">
                  <el-input v-model="searchForm.scanCode" placeholder="扫码或回车自动提交" clearable @keyup.enter="handleScanRegister" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="登记结果" label-width="80px">
                  <el-radio-group v-model="searchForm.testResult">
                    <el-radio value="OK">OK</el-radio>
                    <el-radio value="NG">NG</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="检测机台" label-width="80px">
                  <el-select v-model="searchForm.testingMachine" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="m in machineList" :key="m" :label="m" :value="m" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="备注" label-width="60px">
                  <el-input v-model="searchForm.remark" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" @click="machineConfigDialogVisible = true">机台配置</el-button>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="产品类型" label-width="80px">
                  <el-select v-model="searchForm.productType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="手机类" value="手机类" />
                    <el-option label="电子类" value="电子类" />
                    <el-option label="交通类" value="交通类" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品名称" label-width="80px">
                  <el-input v-model="searchForm.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleSearch" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="模具号" label-width="70px">
                  <el-input v-model="searchForm.moldNo" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="挤压批次" label-width="80px">
                  <el-input v-model="searchForm.extrusionBatchNo" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="样品类型" label-width="80px">
                  <el-select v-model="searchForm.sampleType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A01-试片" value="A01-试片" />
                    <el-option label="B02-阳极样(单独取长支)" value="B02-阳极样(单独取长支)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="加工项目" label-width="80px">
                  <el-select v-model="searchForm.preparationItems" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="YD-硬度" value="YD-硬度" />
                    <el-option label="CF-成分" value="CF-成分" />
                    <el-option label="XYJX-金相" value="XYJX-金相" />
                    <el-option label="YZJX-金相" value="YZJX-金相" />
                    <el-option label="LS-拉伸" value="LS-拉伸" />
                    <el-option label="YJ-阳极" value="YJ-阳极" />
                    <el-option label="DB-低倍" value="DB-低倍" />
                    <el-option label="YB-压变" value="YB-压变" />
                    <el-option label="PJ-泡碱" value="PJ-泡碱" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="LAB收样时间" label-width="110px">
                  <el-date-picker
                    v-model="searchForm.labReceiveDate"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="LAB检测时间" label-width="110px">
                  <el-date-picker
                    v-model="searchForm.testRegistrationDate"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="20px">
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 待收样表格 -->
        <el-table v-if="activeTab === 'overview'" :data="filterByProductName(mergedLabPendingData)" border stripe style="width: 100%" height="calc(100vh - 360px)">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productName" label="产品名称" width="140" show-overflow-tooltip />
          <el-table-column prop="productType" label="产品类型" width="110" />
          <el-table-column prop="extrusionBatchNo" label="挤压批次号" width="160" show-overflow-tooltip />
          <el-table-column prop="furnaceNo" label="炉次号" width="140" />
          <el-table-column prop="moldNo" label="模具编号" width="140" show-overflow-tooltip />
          <el-table-column prop="sampleCode" label="样品码" width="220" show-overflow-tooltip />
          <el-table-column prop="sampleType" label="取样类型" width="120" />
          <el-table-column prop="preparationItems" label="加工项目" width="130" show-overflow-tooltip />
          <el-table-column prop="sampleItemNo" label="样品项目号" width="220" show-overflow-tooltip />
          <el-table-column prop="frameNo" label="所在框号" width="130" show-overflow-tooltip />
          <el-table-column prop="inFurnaceTime" label="进炉时间" width="160" sortable />
          <el-table-column prop="outFurnaceTime" label="出炉时间" width="160" sortable />
          <el-table-column prop="cncPreparationFinishTime" label="CNC制样时间" width="160" sortable />
          <el-table-column prop="cncDeliveryTime" label="CNC送样时间" width="160" sortable />
          <el-table-column prop="agingProgram" label="时效制度" width="120" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleManualReceive(row)">收样</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 收样记录表格 -->
        <el-table v-if="activeTab === 'receive_record'" :data="filterByProductName(receiveRecordData)" border stripe style="width: 100%" height="calc(100vh - 360px)">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productType" label="产品类型" width="100" />
          <el-table-column prop="productName" label="产品名称" width="140" show-overflow-tooltip />
          <el-table-column prop="sampleType" label="样品类型" width="150" />
          <el-table-column prop="sampleNo" label="样品号" width="220" show-overflow-tooltip />
          <el-table-column prop="billetPosition" label="铝棒位置" width="100" />
          <el-table-column prop="preparationItems" label="加工项目" width="130" sortable show-overflow-tooltip />
          <el-table-column prop="sampleItemNo" label="样品项目号" width="220" show-overflow-tooltip />
          <el-table-column prop="preparationQty" label="制样数量" width="100" />
          <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
          <el-table-column prop="extrusionBatchNo" label="挤压批次" width="160" show-overflow-tooltip />
          <el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
          <el-table-column prop="agingBatchNo" label="时效批次" width="130" show-overflow-tooltip />
          <el-table-column prop="agingFurnaceNo" label="时效炉号" width="100" />
          <el-table-column prop="outTime" label="出炉时间" width="160" />
          <el-table-column prop="cncReceiveTime" label="CNC收样时间" width="160" sortable />
          <el-table-column prop="cncPreparationFinishTime" label="CNC制样时间" width="160" sortable />
          <el-table-column prop="labReceiveTime" label="LAB收样时间" width="160" sortable />
          <el-table-column label="工艺资料" width="100" align="center">
            <template #default>
              <el-button link type="primary">查看</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row }">
              <el-button link type="danger" :disabled="isRegistered(row)" @click="handleReturn(row)">退样</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-table v-if="activeTab === 'testing_registration'" :data="filterByProductName(testingRegistrationData)" border stripe style="width: 100%" height="calc(100vh - 360px)">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productType" label="产品类型" width="100" />
          <el-table-column prop="productName" label="产品名称" width="140" show-overflow-tooltip />
          <el-table-column prop="sampleType" label="样品类型" width="150" />
          <el-table-column prop="sampleNo" label="样品号" width="220" show-overflow-tooltip />
          <el-table-column prop="billetPosition" label="铝棒位置" width="100" />
          <el-table-column prop="preparationItems" label="加工项目" width="130" sortable show-overflow-tooltip />
          <el-table-column prop="sampleItemNo" label="样品项目号" width="220" show-overflow-tooltip />
          <el-table-column prop="preparationQty" label="制样数量" width="100" />
          <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
          <el-table-column prop="extrusionBatchNo" label="挤压批次" width="160" show-overflow-tooltip />
          <el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
          <el-table-column prop="agingBatchNo" label="时效批次" width="130" show-overflow-tooltip />
          <el-table-column prop="agingFurnaceNo" label="时效炉号" width="100" />
          <el-table-column prop="outTime" label="出炉时间" width="160" />
          <el-table-column prop="cncReceiveTime" label="CNC收样时间" width="160" sortable />
          <el-table-column prop="cncPreparationFinishTime" label="CNC制样完成时间" width="160" sortable />
          <el-table-column prop="labReceiveTime" label="LAB收样时间" width="160" sortable />
          <el-table-column prop="testRegistrationTime" label="LAB检测时间" width="160" sortable />
          <el-table-column prop="testResult" label="登记结果" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.testResult === 'OK'" type="success" size="small">OK</el-tag>
              <el-tag v-else-if="row.testResult === 'NG'" type="danger" size="small">NG</el-tag>
              <span v-else>{{ row.testResult }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="testingMachine" label="检测机台" width="120" />
          <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip />
          <el-table-column label="工艺资料" width="100" align="center">
            <template #default>
              <el-button link type="primary">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="['overview', 'receive_record', 'testing_registration'].includes(activeTab)">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>
    </el-card>

    <!-- 机台配置弹窗 -->
    <el-dialog v-model="machineConfigDialogVisible" title="检测机台配置" width="400px">
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <el-input v-model="newMachineName" placeholder="请输入新机台名称" clearable @keyup.enter="handleAddMachine" />
        <el-button type="primary" @click="handleAddMachine">添加</el-button>
      </div>
      <el-table :data="machineListTable" border stripe height="300">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="机台名称" />
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row, $index }">
            <el-button link type="danger" @click="handleDeleteMachine($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useSampleFlowStore } from '@/store/sampleFlow'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const { t } = useI18n()

const activeTab = ref('overview')
const sampleFlowStore = useSampleFlowStore()

const machineList = ref([
  '金相1', '金相2', '金相3', '金相4',
  '硬度1', '硬度2', '硬度3', '硬度4',
  '成分1', '成分2',
  'CMM:1', 'CMM:2',
  '拉伸1', '拉伸2',
  '粗糙度1',
  '电导率1', '电导率2',
  '投影1', '扫描1'
])

const machineConfigDialogVisible = ref(false)
const newMachineName = ref('')

const machineListTable = computed(() => {
  return machineList.value.map(m => ({ name: m }))
})

const handleAddMachine = () => {
  const name = newMachineName.value.trim()
  if (!name) return
  if (machineList.value.includes(name)) {
    ElMessage.warning(t('pages.labTesting.messages.machineExists'))
    return
  }
  machineList.value.push(name)
  newMachineName.value = ''
  ElMessage.success(t('pages.labTesting.messages.addMachineSuccess'))
}

const handleDeleteMachine = (index: number) => {
  machineList.value.splice(index, 1)
  ElMessage.success(t('pages.labTesting.messages.deleteMachineSuccess'))
}

const searchForm = ref({
  scanCode: '',
  cncPreparationDate: [],
  cncDeliveryDate: [],
  productType: '',
  productName: '',
  moldNo: '',
  extrusionBatchNo: '',
  sampleType: '',
  preparationItems: '',
  labReceiveDate: [],
  testResult: '',
  testRegistrationDate: [],
  testingMachine: '',
  remark: ''
})

const overviewData = ref([
  {
    productName: 'FC49',
    productType: '电子类',
    extrusionBatchNo: 'JY20260412-001',
    furnaceNo: '26-415-03-04-02',
    moldNo: 'M10-0649-200',
    sampleCode: 'YP-JY20260412-001-1-T1',
    sampleType: 'B01-性能样',
    preparationItems: 'YJ-阳极',
    sampleItemNo: 'YP-JY20260412-001-1-T1-YJ',
    frameNo: 'CV-A-A-L6000*W1250*H650*0244',
    billetPosition: '头棒',
    extrusionMachine: 'JY-29',
    agingBatchNo: 'SX20260412-001',
    agingFurnaceNo: '1#',
    inFurnaceTime: '2026-04-12 08:00:00',
    outFurnaceTime: '2026-04-12 10:00:00',
    cncPreparationFinishTime: '2026-04-12 10:45:00',
    cncDeliveryTime: '2026-04-12 11:00:00',
    agingProgram: '120℃*2h'
  },
  {
    productName: 'FC02',
    productType: '电子类',
    extrusionBatchNo: 'JY20260412-001',
    furnaceNo: '26-415-03-04-02',
    moldNo: 'M10-0649-200',
    sampleCode: 'YP-JY20260412-001-2-T2',
    sampleType: 'B02-阳极样(单独取长支)',
    preparationItems: 'YJ-阳极',
    sampleItemNo: 'YP-JY20260412-001-2-T2-YJ',
    frameNo: 'CV-A-A-L6000*W1250*H650*0245',
    billetPosition: '尾棒',
    extrusionMachine: 'JY-29',
    agingBatchNo: 'SX20260412-001',
    agingFurnaceNo: '1#',
    inFurnaceTime: '2026-04-12 08:00:00',
    outFurnaceTime: '2026-04-12 10:00:00',
    cncPreparationFinishTime: '2026-04-12 10:45:00',
    cncDeliveryTime: '2026-04-12 11:00:00',
    agingProgram: '120℃*2h'
  }
])

const mergedLabPendingData = computed(() => {
  const storeRows = sampleFlowStore.labPendingData.map(item => ({
    productName: item.productName,
    productType: item.productType,
    extrusionBatchNo: item.extrusionBatchNo,
    furnaceNo: item.furnaceNo,
    moldNo: item.moldNo,
    sampleCode: item.sampleCode,
    sampleType: item.sampleType,
    preparationItems: item.preparationItems || '-',
    sampleItemNo: item.sampleItemNo || '-',
    frameNo: item.frameNo || '-',
    billetPosition: item.billetPosition,
    extrusionMachine: item.extrusionMachine,
    agingBatchNo: item.agingBatchNo,
    agingFurnaceNo: item.agingFurnaceNo,
    inFurnaceTime: item.inFurnaceTime,
    outFurnaceTime: item.outFurnaceTime,
    agingProgram: item.agingProgram,
    labSampleStatus: item.labSampleStatus,
    cncReceiveTime: item.cncReceiveTime,
    cncPreparationFinishTime: item.cncPreparationFinishTime,
    cncDeliveryTime: item.cncDeliveryTime
  }))
  return [...storeRows, ...overviewData.value]
})

const receiveRecordData = ref([
  {
    productType: '电子类',
    productName: 'FC87',
    sampleType: 'B02-阳极样(单独取长支)',
    sampleNo: 'YP-JY20260412-001-1-T1',
    billetPosition: '头棒',
    preparationItems: 'YJ-阳极',
    sampleItemNo: 'YP-JY20260412-001-1-T1-YJ',
    preparationQty: 1,
    moldNo: 'M18-0792-178B',
    extrusionBatchNo: 'JY2502240001',
    extrusionMachine: 'JY-02',
    agingBatchNo: 'SX2025022...',
    agingFurnaceNo: '1#',
    outTime: '2025-02-24 09:23:35',
    cncReceiveTime: '2025-02-24 09:28:00',
    cncReceiver: '校康',
    cncPreparationFinishTime: '2025-02-24 09:28:30',
    labReceiveTime: '2026-05-13 10:00:00',
    labReceiver: '张三'
  }
])

const testingRegistrationData = ref([
  {
    productType: '电子类',
    productName: 'FC08',
    sampleType: 'B02-阳极样(单独取长支)',
    sampleNo: 'YP-JY20260412-001-1-T1',
    billetPosition: '头棒',
    preparationItems: 'YJ-阳极',
    sampleItemNo: 'YP-JY20260412-001-1-T1-YJ',
    preparationQty: 1,
    moldNo: 'M18-0792-178B',
    extrusionBatchNo: 'JY2502240001',
    extrusionMachine: 'JY-02',
    agingBatchNo: 'SX2025022...',
    agingFurnaceNo: '1#',
    outTime: '2025-02-24 09:23:35',
    cncReceiveTime: '2025-02-24 09:28:00',
    cncPreparationFinishTime: '2025-02-24 09:28:30',
    labReceiveTime: '2026-05-13 10:00:00',
    testRegistrationTime: '2026-05-13 10:30:00',
    testResult: 'OK',
    testingMachine: '金相1',
    remark: '测试备注信息'
  }
])

const testingRecordData = ref([])

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(1)
const productNameKeyword = ref('')

const filterByProductName = (data: Array<{ productName?: string }>) => {
  const keyword = productNameKeyword.value.trim().toLowerCase()
  if (!keyword) return data
  return data.filter(item => String(item.productName || '').toLowerCase().includes(keyword))
}

const handleSearch = () => {
  productNameKeyword.value = searchForm.value.productName
  currentPage.value = 1
}

const resetSearch = () => {
  searchForm.value = {
    scanCode: '',
    cncPreparationDate: [],
    cncDeliveryDate: [],
    productType: '',
    productName: '',
    moldNo: '',
    extrusionBatchNo: '',
    sampleType: '',
    preparationItems: '',
    labReceiveDate: [],
    testResult: '',
    testRegistrationDate: [],
    testingMachine: '',
    remark: ''
  }
  productNameKeyword.value = ''
  currentPage.value = 1
}

const handleScanReceive = () => {
  if (!searchForm.value.scanCode) return
  let sample: any = null
  let fromStore = false

  const storeIdx = sampleFlowStore.labPendingData.findIndex(item => item.sampleCode === searchForm.value.scanCode)
  if (storeIdx !== -1) {
    sample = { ...sampleFlowStore.labPendingData[storeIdx] }
    fromStore = true
  } else {
    const idx = overviewData.value.findIndex(item => item.sampleCode === searchForm.value.scanCode)
    if (idx !== -1) {
      sample = { ...overviewData.value[idx] }
    }
  }

  if (sample) {
    processLabReceive(sample, fromStore, storeIdx)
    searchForm.value.scanCode = ''
  } else {
    const mockSample = {
      productName: 'FC55',
      productType: 'Mock-Type',
      furnaceNo: 'Mock-Furnace',
      moldNo: 'Mock-Mold',
      sampleCode: searchForm.value.scanCode,
      sampleType: 'Mock-SampleType',
      outFurnaceTime: '2026-05-12 10:00:00'
    }
    processLabReceive(mockSample, false, -1)
    searchForm.value.scanCode = ''
  }
}

const handleScanRegister = () => {
  if (!searchForm.value.scanCode) return

  const idx = testingRegistrationData.value.findIndex(
    item => item.sampleItemNo === searchForm.value.scanCode || item.sampleNo === searchForm.value.scanCode
  )

  if (idx !== -1) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const regTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`

    const row = testingRegistrationData.value[idx]
    row.testResult = searchForm.value.testResult || '-'
    row.testingMachine = searchForm.value.testingMachine || '-'
    row.remark = searchForm.value.remark || '-'
    row.testRegistrationTime = regTime

    // 登记完成后自动刷新搜索条件或将此条移出当前待登记列表，这里只需展示即可
    ElMessage.success(t('pages.labTesting.messages.registerSuccess'))
    searchForm.value.scanCode = ''
    searchForm.value.testResult = ''
    searchForm.value.testingMachine = ''
    searchForm.value.remark = ''
  } else {
    ElMessage.warning(t('pages.labTesting.messages.sampleNotFound'))
  }
}

const handleManualReceive = (row: any) => {
  let fromStore = false
  let storeIdx = -1
  const idx = sampleFlowStore.labPendingData.findIndex(item => item.sampleCode === row.sampleCode)
  if (idx !== -1) {
    fromStore = true
    storeIdx = idx
  }
  processLabReceive(row, fromStore, storeIdx)
}

const isRegistered = (row: any) => {
  // 如果在检测登记列表中该行已经有 LAB检测时间，则认为已完成登记
  return !!row.testRegistrationTime
}

const handleReturn = (row: any) => {
  // 从收样记录移除
  const idx = receiveRecordData.value.indexOf(row)
  if (idx !== -1) receiveRecordData.value.splice(idx, 1)

  // 从检测登记移除
  const regIdx = testingRegistrationData.value.findIndex(item => item.sampleItemNo === row.sampleItemNo)
  if (regIdx !== -1) testingRegistrationData.value.splice(regIdx, 1)

  ElMessage.success(t('pages.labTesting.messages.returnSuccess'))
}

const processLabReceive = (sample: any, fromStore = false, storeIdx = -1) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const receiveTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`

  testingRegistrationData.value.unshift({
    productType: sample.productType,
    productName: sample.productName,
    sampleType: sample.sampleType,
    sampleNo: sample.sampleCode,
    billetPosition: sample.billetPosition || '-',
    preparationItems: sample.preparationItems || '常规检测',
    sampleItemNo: sample.sampleItemNo || `${sample.sampleCode}-CG`,
    preparationQty: sample.preparationQty || 1,
    moldNo: sample.moldNo,
    extrusionBatchNo: sample.extrusionBatchNo,
    extrusionMachine: sample.extrusionMachine || '-',
    agingBatchNo: sample.agingBatchNo || '-',
    agingFurnaceNo: sample.agingFurnaceNo || '-',
    outTime: sample.outFurnaceTime,
    cncReceiveTime: sample.cncReceiveTime || '',
    cncPreparationFinishTime: sample.cncPreparationFinishTime || '',
    labReceiveTime: receiveTime,
    testRegistrationTime: '',
    testResult: '',
    testingMachine: '',
    remark: ''
  })

  receiveRecordData.value.unshift({
    productType: sample.productType,
    productName: sample.productName,
    sampleType: sample.sampleType,
    sampleNo: sample.sampleCode,
    billetPosition: sample.billetPosition || '-',
    preparationItems: sample.preparationItems || '常规检测',
    sampleItemNo: sample.sampleItemNo || `${sample.sampleCode}-CG`,
    preparationQty: sample.preparationQty || 1,
    moldNo: sample.moldNo,
    extrusionBatchNo: sample.extrusionBatchNo,
    extrusionMachine: sample.extrusionMachine || '-',
    agingBatchNo: sample.agingBatchNo || '-',
    agingFurnaceNo: sample.agingFurnaceNo || '-',
    outTime: sample.outFurnaceTime,
    cncReceiveTime: sample.cncReceiveTime || '',
    cncPreparationFinishTime: sample.cncPreparationFinishTime || '',
    labReceiveTime: receiveTime,
    cncReceiver: sample.cncReceiver || '',
    labReceiver: ''
  })

  // remove from store
  if (fromStore && storeIdx !== -1) {
    sampleFlowStore.labPendingData.splice(storeIdx, 1)
  }

  // remove from overviewData
  const idx = overviewData.value.findIndex(item => item.sampleCode === sample.sampleCode)
  if (idx !== -1) {
    overviewData.value.splice(idx, 1)
  }

  ElMessage.success(t('pages.labTesting.messages.receiveSuccess'))
}
</script>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}
.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.custom-tabs {
  padding: 0 20px;
  background-color: #fff;
}
.search-bar {
  padding: 16px 20px 0;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}
.pagination-container {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
}
.duration-cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  box-sizing: border-box;
}
.duration-cell.is-high {
  background-color: #f56c6c;
  color: white;
}
:deep(.el-table .cell) {
  padding: 0 8px;
}
</style>
