<template>
  <div class="page-container">
    <el-card class="full-card" shadow="never">
      <div class="content-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="待收样" name="overview" />
          <el-tab-pane label="收样记录" name="receive_record" />
          <el-tab-pane label="加工列表" name="pending_machining" />
          <el-tab-pane label="制/送样记录" name="preparation_record" />
        </el-tabs>

        <!-- 搜索区域 -->
        <div class="search-bar" v-if="activeTab === 'overview'">
          <el-form :model="searchForm" label-width="100px" size="small">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="扫码收样">
                  <el-input v-model="searchForm.scanCode" placeholder="扫码/回车" clearable @keyup.enter="handleScanReceive" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品类型">
                  <el-select v-model="searchForm.productType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="手机类" value="手机类" />
                    <el-option label="电子类" value="电子类" />
                    <el-option label="交通类" value="交通类" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品名称">
                  <el-select v-model="searchForm.productName" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="LY-160" value="LY-160" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="模号">
                  <el-input v-model="searchForm.moldNo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="挤压批次">
                  <el-input v-model="searchForm.extrusionBatchNo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="样品类型">
                  <el-select v-model="searchForm.sampleType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A01-试片" value="A01-试片" />
                    <el-option label="A02-验证棒预阳极" value="A02-验证棒预阳极" />
                    <el-option label="B02-阳极样(单独取长支)" value="B02-阳极样(单独取长支)" />
                    <el-option label="B03-OQC样" value="B03-OQC样" />
                    <el-option label="B04-扫描样" value="B04-扫描样" />
                    <el-option label="B05-扩口扩孔样" value="B05-扩口扩孔样" />
                    <el-option label="B06-压扁样" value="B06-压扁样" />
                    <el-option label="B07-高低倍样" value="B07-高低倍样" />
                    <el-option label="B08-断口样" value="B08-断口样" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="样品状态">
                  <el-select v-model="searchForm.sampleStatus" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="已收样" value="已收样" />
                    <el-option label="未收样" value="未收样" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="时效出炉">
                  <el-date-picker
                    v-model="searchForm.agingOutDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label-width="20px">
                  <el-button type="primary" @click="handleSearch">查询</el-button>
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
                <el-form-item label="扫码查询">
                  <el-input v-model="searchForm.scanCode" placeholder="扫码/回车自动提交" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品类型">
                  <el-select v-model="searchForm.productType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="手机类" value="手机类" />
                    <el-option label="电子类" value="电子类" />
                    <el-option label="交通类" value="交通类" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品名称">
                  <el-select v-model="searchForm.productName" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A47-02" value="A47-02" />
                    <el-option label="LY-160" value="LY-160" />
                    <el-option label="A26-12" value="A26-12" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="模具号">
                  <el-input v-model="searchForm.moldNo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="挤压批次">
                  <el-input v-model="searchForm.extrusionBatchNo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="样品类型">
                  <el-select v-model="searchForm.sampleType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A01-试片" value="A01-试片" />
                    <el-option label="A02-验证棒预阳极" value="A02-验证棒预阳极" />
                    <el-option label="B02-阳极样(单独取长支)" value="B02-阳极样(单独取长支)" />
                    <el-option label="B03-OQC样" value="B03-OQC样" />
                    <el-option label="B04-扫描样" value="B04-扫描样" />
                    <el-option label="B05-扩口扩孔样" value="B05-扩口扩孔样" />
                    <el-option label="B06-压扁样" value="B06-压扁样" />
                    <el-option label="B07-高低倍样" value="B07-高低倍样" />
                    <el-option label="B08-断口样" value="B08-断口样" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="收样日期">
                  <el-date-picker
                    v-model="searchForm.receiveDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="20px">
                  <el-button type="primary" @click="handleSearch">查询</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 加工列表搜索区域 -->
        <div class="search-bar" v-if="activeTab === 'pending_machining'">
          <el-form :model="searchForm" label-width="100px" size="small">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="扫码查询">
                  <el-input v-model="searchForm.scanCode" placeholder="扫码/回车自动提交" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品类型">
                  <el-select v-model="searchForm.productType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="手机类" value="手机类" />
                    <el-option label="电子类" value="电子类" />
                    <el-option label="交通类" value="交通类" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="产品名称">
                  <el-select v-model="searchForm.productName" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A47-02" value="A47-02" />
                    <el-option label="LY-160" value="LY-160" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="模具号">
                  <el-input v-model="searchForm.moldNo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="挤压批次">
                  <el-input v-model="searchForm.extrusionBatchNo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="样品类型">
                  <el-select v-model="searchForm.sampleType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A01-试片" value="A01-试片" />
                    <el-option label="A02-验证棒预阳极" value="A02-验证棒预阳极" />
                    <el-option label="B02-阳极样(单独取长支)" value="B02-阳极样(单独取长支)" />
                    <el-option label="B03-OQC样" value="B03-OQC样" />
                    <el-option label="B04-扫描样" value="B04-扫描样" />
                    <el-option label="B05-扩口扩孔样" value="B05-扩口扩孔样" />
                    <el-option label="B06-压扁样" value="B06-压扁样" />
                    <el-option label="B07-高低倍样" value="B07-高低倍样" />
                    <el-option label="B08-断口样" value="B08-断口样" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="时效出炉">
                  <el-date-picker
                    v-model="searchForm.agingOutDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="收样日期">
                  <el-date-picker
                    v-model="searchForm.receiveDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="20px">
                  <el-button type="primary" @click="handleSearch">查询</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 制/送样记录搜索区域 -->
        <div class="search-bar" v-if="activeTab === 'preparation_record'">
          <el-form :model="searchForm" label-width="100px" size="small">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-form-item label="扫码查询" label-width="80px">
                  <el-input v-model="searchForm.scanCode" placeholder="扫码或回车" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="产品类型" label-width="80px">
                  <el-select v-model="searchForm.productType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="手机类" value="手机类" />
                    <el-option label="电子类" value="电子类" />
                    <el-option label="交通类" value="交通类" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="产品名称" label-width="80px">
                  <el-select v-model="searchForm.productName" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A47-02" value="A47-02" />
                    <el-option label="LY-160" value="LY-160" />
                    <el-option label="A26-12" value="A26-12" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="模具号" label-width="70px">
                  <el-input v-model="searchForm.moldNo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="挤压批次" label-width="80px">
                  <el-input v-model="searchForm.extrusionBatchNo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="样品类型" label-width="80px">
                  <el-select v-model="searchForm.sampleType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="A01-试片" value="A01-试片" />
                    <el-option label="A02-验证棒预阳极" value="A02-验证棒预阳极" />
                    <el-option label="B02-阳极样(单独取长支)" value="B02-阳极样(单独取长支)" />
                    <el-option label="B03-OQC样" value="B03-OQC样" />
                    <el-option label="B04-扫描样" value="B04-扫描样" />
                    <el-option label="B05-扩口扩孔样" value="B05-扩口扩孔样" />
                    <el-option label="B06-压扁样" value="B06-压扁样" />
                    <el-option label="B07-高低倍样" value="B07-高低倍样" />
                    <el-option label="B08-断口样" value="B08-断口样" />
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
                <el-form-item label="收样时间" label-width="80px">
                  <el-date-picker
                    v-model="searchForm.receiveDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="制样完成时间" label-width="100px">
                  <el-date-picker
                    v-model="searchForm.preparationCompleteDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="送样完成时间" label-width="100px">
                  <el-date-picker
                    v-model="searchForm.deliveryCompleteDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="20px">
                  <el-button type="primary" @click="handleSearch">查询</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 待收样表格 -->
        <el-table v-if="activeTab === 'overview'" :data="overviewData" border stripe style="width: 100%" height="calc(100vh - 360px)">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productName" label="产品名称" width="140" show-overflow-tooltip />
          <el-table-column prop="productType" label="产品类型" width="110" />
          <el-table-column prop="extrusionBatchNo" label="挤压批次号" width="160" show-overflow-tooltip />
          <el-table-column prop="furnaceNo" label="炉次号" width="140" />
          <el-table-column prop="moldNo" label="模具编号" width="140" show-overflow-tooltip />
          <el-table-column prop="sampleCode" label="样品码" width="220" show-overflow-tooltip />
          <el-table-column prop="sampleType" label="取样类型" width="120" />
          <el-table-column prop="frameNo" label="所在框号" width="120" />
          <el-table-column prop="billetPosition" label="铝棒位置" width="100" />
          <el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
          <el-table-column prop="agingBatchNo" label="时效批次" width="130" show-overflow-tooltip />
          <el-table-column prop="agingFurnaceNo" label="时效炉号" width="100" />
          <el-table-column prop="inFurnaceTime" label="进炉时间" width="160" sortable />
          <el-table-column prop="outFurnaceTime" label="出炉时间" width="160" sortable />
          <el-table-column prop="agingProgram" label="时效制度" width="120" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleManualReceive(row)">收样</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 收样记录表格 -->
        <el-table v-if="activeTab === 'receive_record'" :data="receiveRecordData" border stripe style="width: 100%" height="calc(100vh - 360px)">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productType" label="产品类型" width="100" />
          <el-table-column prop="productName" label="产品名称" width="140" show-overflow-tooltip />
          <el-table-column prop="sampleType" label="样品类型" width="120" sortable />
          <el-table-column prop="longSampleNo" label="长支样品号" width="400" show-overflow-tooltip />
          <el-table-column prop="billetPosition" label="铝棒位置" width="100" />
          <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
          <el-table-column prop="extrusionBatchNo" label="挤压批次" width="160" show-overflow-tooltip />
          <el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
          <el-table-column prop="agingBatchNo" label="时效批次" width="130" show-overflow-tooltip />
          <el-table-column prop="agingFurnaceNo" label="时效炉号" width="100" />
          <el-table-column prop="outTime" label="出炉时间" width="160" sortable />
          <el-table-column prop="cncReceiveTime" label="CNC收样时间" width="160" sortable />
          <el-table-column label="工艺资料" width="100" align="center">
            <template #default>
              <el-button link type="primary">查看</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :disabled="!canReturn(row)" @click="handleReturn(row)">退样</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 加工列表表格 -->
        <el-table v-if="activeTab === 'pending_machining'" :data="pendingMachiningData" border stripe style="width: 100%" height="calc(100vh - 360px)">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productType" label="产品类型" width="100" />
          <el-table-column prop="productName" label="产品名称" width="140" show-overflow-tooltip />
          <el-table-column prop="sampleType" label="样品类型" width="120" sortable />
        <el-table-column prop="longSampleNo" label="长支样品号" width="220" show-overflow-tooltip />
        <el-table-column prop="billetPosition" label="铝棒位置" width="100" />
        <el-table-column prop="preparationItems" label="加工项目" width="130" show-overflow-tooltip />
        <el-table-column prop="sampleItemNo" label="样品项目号" width="220" show-overflow-tooltip />
        <el-table-column prop="preparationQty" label="制样数量" width="100" />
        <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
        <el-table-column prop="extrusionBatchNo" label="挤压批次" width="160" show-overflow-tooltip />
          <el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
          <el-table-column prop="agingBatchNo" label="时效批次" width="130" show-overflow-tooltip />
          <el-table-column prop="agingFurnaceNo" label="时效炉号" width="100" />
          <el-table-column prop="outTime" label="出炉时间" width="160" sortable />
          <el-table-column prop="cncReceiveTime" label="CNC收样时间" width="160" sortable />
          <el-table-column label="工艺资料" width="100" align="center">
            <template #default>
              <el-button link type="primary">查看</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handlePrint(row)">打印</el-button>
              <el-button link type="primary" @click="handleFinishMachining(row)">加工完成</el-button>
              <el-button link type="primary" @click="handleDelivery(row)">送样</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 制/送样记录表格 -->
        <el-table v-if="activeTab === 'preparation_record'" :data="mergedPreparationRecordData" border stripe style="width: 100%" height="calc(100vh - 360px)">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productType" label="产品类型" width="100" />
          <el-table-column prop="productName" label="产品名称" width="140" show-overflow-tooltip />
          <el-table-column prop="sampleType" label="样品类型" width="180" sortable />
          <el-table-column prop="longSampleNo" label="长支样品号" width="220" show-overflow-tooltip />
          <el-table-column prop="billetPosition" label="铝棒位置" width="100" />
          <el-table-column prop="preparationItems" label="加工项目" width="130" show-overflow-tooltip />
          <el-table-column prop="sampleItemNo" label="样品项目号" width="220" show-overflow-tooltip />
          <el-table-column prop="preparationQty" label="制样数量" width="100" />
          <el-table-column prop="moldNo" label="模具号" width="140" show-overflow-tooltip />
          <el-table-column prop="extrusionBatchNo" label="挤压批次" width="160" show-overflow-tooltip />
          <el-table-column prop="extrusionMachine" label="挤压机台" width="90" />
          <el-table-column prop="agingBatchNo" label="时效批次" width="130" show-overflow-tooltip />
          <el-table-column prop="agingFurnaceNo" label="时效炉号" width="100" />
          <el-table-column prop="outTime" label="出炉时间" width="160" sortable />
          <el-table-column prop="cncReceiveTime" label="CNC收样时间" width="160" sortable />
          <el-table-column prop="cncPreparationFinishTime" label="CNC制样完成时间" width="160" sortable />
          <el-table-column prop="deliveryTime" label="送样完成时间" width="160" sortable />
          <el-table-column label="工艺资料" width="100" align="center">
            <template #default>
              <el-button link type="primary">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="['overview', 'pending_machining', 'receive_record', 'preparation_record'].includes(activeTab)">
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

    <!-- 加工完成登记弹窗 -->
    <el-dialog v-model="machiningDialogVisible" title="加工完成登记" width="400px" destroy-on-close>
      <div style="margin-bottom: 20px; font-size: 16px;">
        确认该样品的加工已完成？
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="machiningDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmFinishMachining">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 打印预览弹窗 -->
    <el-dialog v-model="printDialogVisible" title="打印样品标签" width="600px" destroy-on-close>
      <div class="print-preview">
        <div class="sample-label">
          <div class="qr-section">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" class="qr-image" />
            <div class="long-sample-no">{{ currentPrintRow?.longSampleNo }}</div>
          </div>
          <div class="info-section">
            <table class="info-table">
              <tr>
                <td class="label">名称</td>
                <td class="value">{{ currentPrintRow?.productName || '-' }}</td>
                <td class="label">挤压机台</td>
                <td class="value">{{ currentPrintRow?.extrusionMachine || '-' }}</td>
              </tr>
              <tr>
                <td class="label">收样时间</td>
                <td class="value">{{ currentPrintRow?.cncReceiveTime || '-' }}</td>
                <td class="label">棒号</td>
                <td class="value">{{ currentPrintRow?.billetPosition || '-' }}</td>
              </tr>
              <tr>
                <td class="label">加工项目</td>
                <td class="value">{{ currentPrintRow?.preparationItems || '-' }}</td>
                <td class="label">模具号</td>
                <td class="value">{{ currentPrintRow?.moldNo || '-' }}</td>
              </tr>
              <tr>
                <td class="label">制样数量</td>
                <td class="value">{{ currentPrintRow?.preparationQty || '1' }}</td>
                <td class="label">材质</td>
                <td class="value">{{ getAlloyFromSampleNo(currentPrintRow?.longSampleNo) }}</td>
              </tr>
              <tr>
                <td class="label">炉次号</td>
                <td class="value">{{ getFurnaceNoFromSampleNo(currentPrintRow?.longSampleNo) }}</td>
                <td class="label" colspan="2"></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="printDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPrint">打印</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 收样登记弹窗 -->
    <el-dialog v-model="receiveDialogVisible" title="收样登记" width="700px" destroy-on-close>
      <el-form :model="receiveForm" label-width="100px">
        <el-form-item label="样品码">
          <el-input v-model="receiveForm.sampleCode" disabled />
        </el-form-item>

        <el-form-item label="产品名称">
          <el-input :value="currentReceiveSample?.productName || ''" disabled />
        </el-form-item>

        <el-form-item label="加工项目" required>
          <div style="width: 100%;">
            <div v-for="(item, index) in receiveForm.items" :key="index" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <el-select v-model="item.name" placeholder="请选择加工项目" style="flex: 1" filterable allow-create>
                <el-option v-for="opt in availablePreparationItems" :key="opt" :label="opt" :value="opt" />
              </el-select>
              <el-input-number v-model="item.qty" :min="1" :precision="0" :value-on-clear="1" style="width: 140px" />
              <el-button type="danger" plain @click="removeReceiveItem(index)" :disabled="receiveForm.items.length <= 1">删除</el-button>
            </div>
            <el-button type="primary" plain size="small" @click="addReceiveItem" style="margin-top: 5px;">+ 添加项目</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="receiveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReceive">确认收样</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import QRCode from 'qrcode'
import { useSampleFlowStore } from '@/store/sampleFlow'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'

useTaskLiteralDomI18n()

const { t } = useI18n()

const activeTab = ref('overview')

const sampleFlowStore = useSampleFlowStore()

const machiningDialogVisible = ref(false)
const currentRow = ref<any>(null)

const canReturn = (row: any) => {
  const relatedItems = pendingMachiningData.value.filter(
    item => item.longSampleNo === row.longSampleNo
  )
  // 如果加工列表中没有任何相关的拆分项（可能全部都已送样），则不允许退样
  if (relatedItems.length === 0) return false
  
  // 必须所有相关项的状态都是 '待加工' 才允许对这个整支样品退样
  return relatedItems.every(item => item.cncSampleStatus === '待加工')
}

const handleReturn = (row: any) => {
  if (!canReturn(row)) {
    ElMessage.warning(t('pages.cncSample.messages.returnBlocked'))
    return
  }
  
  // 1. 从加工列表中移除所有关联的拆分项
  pendingMachiningData.value = pendingMachiningData.value.filter(
    item => item.longSampleNo !== row.longSampleNo
  )

  // 2. 从收样记录中移除
  const rIndex = receiveRecordData.value.findIndex(
    item => item.longSampleNo === row.longSampleNo
  )
  if (rIndex !== -1) {
    receiveRecordData.value.splice(rIndex, 1)
  }

  // 3. 退回到待收样列表中
  overviewData.value.unshift({
    productName: row.productName,
    productType: row.productType,
    extrusionBatchNo: row.extrusionBatchNo,
    furnaceNo: row.extrusionBatchNo, // 退回时使用挤压批次号兜底炉次号（mock）
    moldNo: row.moldNo,
    sampleCode: row.longSampleNo,
    sampleType: row.sampleType,
    frameNo: '',
    billetPosition: row.billetPosition,
    extrusionMachine: row.extrusionMachine,
    agingBatchNo: row.agingBatchNo,
    agingFurnaceNo: row.agingFurnaceNo,
    inFurnaceTime: row.outTime,
    outFurnaceTime: row.outTime,
    agingProgram: '-'
  })

  ElMessage.success(t('pages.cncSample.messages.returnSuccess'))
}

const handleFinishMachining = (row: any) => {
  currentRow.value = row
  machiningDialogVisible.value = true
}

const confirmFinishMachining = () => {
  if (currentRow.value) {
    // 更新制样完成时间（当前时间）
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    currentRow.value.cncPreparationFinishTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
    
    // 状态改为待送样（前端模拟修改状态，实际业务可能需要调用接口）
    currentRow.value.cncSampleStatus = '待送样'
    
    ElMessage.success(t('pages.cncSample.messages.machiningFinishSuccess'))
  }
  machiningDialogVisible.value = false
}

const handleDelivery = (row: any) => {
  // 更新送样时间（当前时间）
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const deliveryTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
  row.deliveryTime = deliveryTime

  // 1) 推送到实验室待收样（共享 store）
  sampleFlowStore.addToLabPending({
    productName: row.productName,
    productType: row.productType,
    extrusionBatchNo: row.extrusionBatchNo,
    furnaceNo: row.extrusionBatchNo,
    moldNo: row.moldNo,
    sampleCode: row.longSampleNo,
    sampleType: row.sampleType,
    billetPosition: row.billetPosition,
    extrusionMachine: row.extrusionMachine,
    agingBatchNo: row.agingBatchNo,
    agingFurnaceNo: row.agingFurnaceNo,
    inFurnaceTime: row.outTime,
    outFurnaceTime: row.outTime,
    agingProgram: '',
    cncReceiveTime: row.cncReceiveTime,
    cncReceiver: '',
    cncPreparationFinishTime: row.cncPreparationFinishTime,
    preparationItems: row.preparationItems,
    sampleItemNo: row.sampleItemNo,
    preparationQty: row.preparationQty,
    labSampleStatus: '待收样',
    cncDeliveryTime: deliveryTime
  })

  // 2) 推送到 CNC 制/送样记录
  sampleFlowStore.addToCncPreparationRecord({
    productName: row.productName,
    productType: row.productType,
    sampleType: row.sampleType,
    longSampleNo: row.longSampleNo,
    billetPosition: row.billetPosition,
    preparationItems: row.preparationItems,
    sampleItemNo: row.sampleItemNo,
    preparationQty: row.preparationQty,
    moldNo: row.moldNo,
    extrusionBatchNo: row.extrusionBatchNo,
    extrusionMachine: row.extrusionMachine,
    agingBatchNo: row.agingBatchNo,
    agingFurnaceNo: row.agingFurnaceNo,
    outTime: row.outTime,
    cncReceiveTime: row.cncReceiveTime,
    cncReceiver: '',
    cncPreparationFinishTime: row.cncPreparationFinishTime,
    deliveryTime: deliveryTime
  })

  // 状态更新为已送样，前端模拟直接将数据从加工列表中移除
  const index = pendingMachiningData.value.findIndex(item => item === row)
  if (index !== -1) {
    pendingMachiningData.value.splice(index, 1)
  }

  ElMessage.success(t('pages.cncSample.messages.deliverySuccess'))
}

const searchForm = ref({
  scanCode: '',
  productType: '',
  productName: '',
  moldNo: '',
  extrusionBatchNo: '',
  sampleType: '',
  preparationItems: '',
  sampleStatus: '',
  extrusionMachine: '',
  agingOutDate: [],
  receiveDate: [],
  preparationCompleteDate: [],
  deliveryCompleteDate: []
})

const receiveDialogVisible = ref(false)
const currentReceiveSample = ref<any>(null)
const availablePreparationItems = ['YD-硬度', 'CF-成分', 'XYJX-金相', 'YZJX-金相', 'LS-拉伸', 'YJ-阳极', 'DB-低倍', 'YB-压变', 'PJ-泡碱']
const receiveForm = ref({
  sampleCode: '',
  items: [
    { name: '', qty: 1 }
  ]
})

const handleManualReceive = (row: any) => {
  currentReceiveSample.value = row
  receiveForm.value.sampleCode = row.sampleCode
  receiveForm.value.items = [{ name: '', qty: 1 }]
  receiveDialogVisible.value = true
}

const handleScanReceive = () => {
  if (!searchForm.value.scanCode) return
  // find in overviewData
  const sample = overviewData.value.find(item => item.sampleCode === searchForm.value.scanCode)
  if (sample) {
    currentReceiveSample.value = sample
    receiveForm.value.sampleCode = sample.sampleCode
    receiveForm.value.items = [{ name: '', qty: 1 }]
    receiveDialogVisible.value = true
  } else {
    // mock finding it if not in list
    currentReceiveSample.value = {
      productName: 'FC55',
      productType: 'Mock-Type',
      furnaceNo: 'Mock-Furnace',
      moldNo: 'Mock-Mold',
      sampleCode: searchForm.value.scanCode,
      sampleType: 'Mock-SampleType',
      outFurnaceTime: '2026-05-12 10:00:00'
    }
    receiveForm.value.sampleCode = searchForm.value.scanCode
    receiveForm.value.items = [{ name: '', qty: 1 }]
    receiveDialogVisible.value = true
  }
}

const addReceiveItem = () => {
  receiveForm.value.items.push({ name: '', qty: 1 })
}

const removeReceiveItem = (index: number) => {
  receiveForm.value.items.splice(index, 1)
}

const confirmReceive = () => {
  const validItems = receiveForm.value.items.filter(item => item.name && item.qty > 0)
  if (validItems.length === 0) {
    ElMessage.warning(t('pages.cncSample.messages.validPreparationItemRequired'))
    return
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const receiveTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`

  validItems.forEach(item => {
    // add to pendingMachiningData
    pendingMachiningData.value.unshift({
      productType: currentReceiveSample.value.productType,
      productName: currentReceiveSample.value.productName,
      sampleType: currentReceiveSample.value.sampleType,
      longSampleNo: currentReceiveSample.value.sampleCode,
      billetPosition: currentReceiveSample.value.billetPosition || '-',
      preparationItems: item.name,
      sampleItemNo: `${currentReceiveSample.value.sampleCode}-${item.name.split('-')[0]}`,
      preparationQty: item.qty,
      moldNo: currentReceiveSample.value.moldNo,
      extrusionBatchNo: currentReceiveSample.value.extrusionBatchNo,
      extrusionMachine: currentReceiveSample.value.extrusionMachine || '-',
      agingBatchNo: currentReceiveSample.value.agingBatchNo || '-',
      agingFurnaceNo: currentReceiveSample.value.agingFurnaceNo || '-',
      outTime: currentReceiveSample.value.outFurnaceTime,
      cncReceiveTime: receiveTime,
      cncPreparationFinishTime: '',
      deliveryTime: '',
      cncSampleStatus: '待加工'
    })
  })

  // add to receiveRecordData ONLY ONCE for the whole sample
  receiveRecordData.value.unshift({
    productType: currentReceiveSample.value.productType,
    productName: currentReceiveSample.value.productName,
    sampleType: currentReceiveSample.value.sampleType,
    longSampleNo: currentReceiveSample.value.sampleCode,
    billetPosition: currentReceiveSample.value.billetPosition || '-',
    moldNo: currentReceiveSample.value.moldNo,
    extrusionBatchNo: currentReceiveSample.value.extrusionBatchNo,
    extrusionMachine: currentReceiveSample.value.extrusionMachine || '-',
    agingBatchNo: currentReceiveSample.value.agingBatchNo || '-',
    agingFurnaceNo: currentReceiveSample.value.agingFurnaceNo || '-',
    outTime: currentReceiveSample.value.outFurnaceTime,
    cncReceiveTime: receiveTime
  })

  // Remove from overviewData
  const idx = overviewData.value.findIndex(item => item.sampleCode === currentReceiveSample.value.sampleCode)
  if (idx !== -1) {
    overviewData.value.splice(idx, 1)
  }

  ElMessage.success(t('pages.cncSample.messages.receiveSuccess'))
  receiveDialogVisible.value = false
  searchForm.value.scanCode = ''
}

const overviewData = ref<any[]>([
  {
    productName: 'FC90',
    productType: '电子类',
    extrusionBatchNo: 'JY20260412-001',
    furnaceNo: '26-415-03-04-02',
    moldNo: 'M10-0649-200',
    sampleCode: 'YP-JY20260412-001-1-T1',
    sampleType: 'B01-性能样',
    frameNo: 'CV-A-A-L6000*W1250*H650*0229',
    billetPosition: '头棒',
    extrusionMachine: 'JY-29',
    agingBatchNo: 'SX20260412-001',
    agingFurnaceNo: '1#',
    inFurnaceTime: '2026-04-12 08:00:00',
    outFurnaceTime: '2026-04-12 10:00:00',
    agingProgram: '120℃*2h'
  },
  {
    productName: 'FC111',
    productType: '电子类',
    extrusionBatchNo: 'JY20260412-001',
    furnaceNo: '26-415-03-04-02',
    moldNo: 'M10-0649-200',
    sampleCode: 'YP-JY20260412-001-2-T2',
    sampleType: 'B02-阳极样(单独取长支)',
    frameNo: 'CV-A-A-L6000*W1250*H650*0230',
    billetPosition: '尾棒',
    extrusionMachine: 'JY-29',
    agingBatchNo: 'SX20260412-001',
    agingFurnaceNo: '1#',
    inFurnaceTime: '2026-04-12 08:00:00',
    outFurnaceTime: '2026-04-12 10:00:00',
    agingProgram: '120℃*2h'
  }
])

const pendingMachiningData = ref<any[]>([
  {
    productType: '手机类',
    productName: 'FC97',
    sampleType: 'B01-性能样',
    longSampleNo: 'JY2407160002-XN-01-1-W4',
    billetPosition: '头棒',
    preparationItems: 'YD-硬度',
    sampleItemNo: 'JY2407160002-XN-01-1-W4-YD',
    preparationQty: 3,
    moldNo: 'M18-0904-002',
    extrusionBatchNo: 'JY2407160002',
    extrusionMachine: 'JY-21',
    agingBatchNo: 'SX24070141',
    agingFurnaceNo: '1#',
    outTime: '2024-07-16 11:13:45',
    cncReceiveTime: '2024-07-25 09:31:23',
    cncPreparationFinishTime: '',
    deliveryTime: '',
    cncSampleStatus: '待加工'
  }
])

const receiveRecordData = ref<any[]>([
  {
    productType: '电子类',
    productName: 'FC15',
    sampleType: 'B02-阳极样(单独取长支)',
    longSampleNo: 'YP-JY20260412-001-1-T1',
    billetPosition: '99T',
    moldNo: '081',
    extrusionBatchNo: 'JY2605120023',
    extrusionMachine: 'JY-29',
    agingBatchNo: 'SX2605120023',
    agingFurnaceNo: '1号炉',
    outTime: '2026-05-12 10:00:00',
    cncReceiveTime: '2026-05-14 01:58:00'
  }
])

const printDialogVisible = ref(false)
const currentPrintRow = ref<any>(null)
const qrCodeUrl = ref('')

const handlePrint = async (row: any) => {
  currentPrintRow.value = row
  if (row.longSampleNo) {
    try {
      qrCodeUrl.value = await QRCode.toDataURL(row.longSampleNo, { margin: 1 })
    } catch (err) {
      console.error('生成二维码失败', err)
      qrCodeUrl.value = ''
    }
  } else {
    qrCodeUrl.value = ''
  }
  printDialogVisible.value = true
}

const confirmPrint = () => {
  ElMessage.success(t('pages.cncSample.messages.printSuccess'))
  printDialogVisible.value = false
}

// 模拟从样品号中提取材质（如 7075-50%）
const getAlloyFromSampleNo = (sampleNo: string) => {
  if (!sampleNo) return '-'
  const parts = sampleNo.split('-')
  if (parts.length > 2) {
    return `${parts[1]}-${parts[2]}`
  }
  return '-'
}

// 模拟从样品号中提取炉次号（如 26-415-03-04-02）
const getFurnaceNoFromSampleNo = (sampleNo: string) => {
  if (!sampleNo) return '-'
  const parts = sampleNo.split('-')
  if (parts.length > 7) {
    return parts.slice(3, 8).join('-')
  }
  return '-'
}

const preparationRecordData = ref([
  {
    productType: '电子类',
    productName: 'FC68',
    sampleType: 'B02-阳极样(单独取长支)',
    longSampleNo: 'YP-JY20260412-001-3-T3',
    billetPosition: '头棒',
    preparationItems: 'YJ-阳极',
    sampleItemNo: 'YP-JY20260412-001-3-T3-YJ',
    preparationQty: 1,
    moldNo: 'M10-0649-200',
    extrusionBatchNo: 'JY20260412-001',
    extrusionMachine: 'JY-21',
    agingBatchNo: 'SX20260412-001',
    agingFurnaceNo: '1#',
    outTime: '2026-04-12 10:00:00',
    cncReceiveTime: '2026-04-12 10:15:00',
    cncReceiver: '校康',
    cncPreparationFinishTime: '2026-04-12 10:45:00',
    deliveryTime: '2026-04-12 11:00:00',
    nextProcess: 'YYPG'
  }
])

const mergedPreparationRecordData = computed(() => {
  return [
    ...sampleFlowStore.cncPreparationRecords,
    ...preparationRecordData.value
  ]
})

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(1)

const handleSearch = () => {
  // TODO
}

const resetSearch = () => {
  searchForm.value = {
    scanCode: '',
    productType: '',
    productName: '',
    moldNo: '',
    extrusionBatchNo: '',
    sampleType: '',
    preparationItems: '',
    sampleStatus: '',
    extrusionMachine: '',
    agingOutDate: [],
    receiveDate: [],
    preparationCompleteDate: [],
    deliveryCompleteDate: []
  }
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
  .sample-label {
    display: flex;
    border: 1px solid #000;
    padding: 10px;
    background: #fff;
    width: 500px;
    margin: 0 auto;
  }
  .qr-section {
    flex: 0 0 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid #000;
    padding-right: 10px;
  }
  .qr-image {
    width: 150px;
    height: 150px;
  }
  .long-sample-no {
    font-size: 10px;
    word-break: break-all;
    margin-top: 5px;
    line-height: 1.2;
    text-align: left;
  }
  .info-section {
    flex: 1;
    padding-left: 10px;
  }
  .info-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .info-table td {
    border: 1px dashed #666;
    padding: 6px 4px;
  }
  .info-table .label {
    width: 70px;
    color: #333;
  }
  .info-table .value {
    color: #000;
  }
</style>
