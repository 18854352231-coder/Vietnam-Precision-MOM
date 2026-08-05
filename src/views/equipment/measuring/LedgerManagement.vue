<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <span class="title">台账管理</span>
          <div class="header-right">
            <el-button type="primary" @click="openAddDialog">新增</el-button>
            <el-button @click="openImportDialog">批量导入</el-button>
            <el-button @click="handleExport">导出Excel</el-button>
            <el-popover placement="bottom-end" :width="380" trigger="click">
              <template #reference>
                <el-button>列选择</el-button>
              </template>
              <div class="column-selector">
                <div class="column-selector-header">
                  <span>选择展示字段</span>
                  <span>已选 {{ visibleColumnKeys.length }}/{{ columnOptions.length }}</span>
                </div>
                <el-checkbox
                  :model-value="allColumnsSelected"
                  :indeterminate="someColumnsSelected"
                  @change="handleSelectAllColumns"
                >
                  全选
                </el-checkbox>
                <el-divider />
                <el-checkbox-group v-model="visibleColumnKeys" class="column-checkbox-group">
                  <el-checkbox v-for="column in columnOptions" :key="column.key" :label="column.key">
                    {{ column.label }}
                  </el-checkbox>
                </el-checkbox-group>
                <div class="column-selector-footer">
                  <el-button link type="primary" @click="resetVisibleColumns">恢复默认</el-button>
                  <el-button link type="primary" @click="showAllColumns">全部显示</el-button>
                </div>
              </div>
            </el-popover>
            <el-button @click="handleGenerateCalibrationTasks">生成校验任务</el-button>
            <el-button @click="openBatchEditDialog">批量修改</el-button>
            <el-button type="danger" @click="handleArchiveOrScrap">报废/封存</el-button>
          </div>
        </div>
        <el-form :inline="true" :model="searchForm" size="small" class="ledger-search-form">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-form-item label="用途">
                <el-select v-model="searchForm.usage" placeholder="请选择" clearable>
                  <el-option v-for="option in usageOptions" :key="option" :label="option" :value="option" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="管理编号">
                <el-input v-model="searchForm.manageCode" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="出厂编号">
                <el-input v-model="searchForm.factoryCode" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="名称">
                <el-input v-model="searchForm.name" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="校验日期">
                <el-date-picker v-model="searchForm.calibDate" type="daterange" range-separator="-" />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item label="计量周期">
                <el-select v-model="searchForm.cycle" placeholder="请选择" clearable>
                  <el-option v-for="option in calibrationCycleOptions" :key="option" :label="option" :value="option" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="10" class="search-row">
            <el-col :span="4">
              <el-form-item label="计量方式">
                <el-select v-model="searchForm.method" placeholder="请选择" clearable>
                  <el-option label="内校" value="内校" />
                  <el-option label="外校" value="外校" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                  <el-option label="使用中" value="使用中" />
                  <el-option label="校验中" value="校验中" />
                  <el-option label="封存" value="封存" />
                  <el-option label="停用" value="停用" />
                  <el-option label="报废" value="报废" />
                  <el-option label="限用" value="限用" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="使用部门">
                <el-input v-model="searchForm.department" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="使用车间">
                <el-input v-model="searchForm.workshop" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="预警天数">
                <div class="range-inputs">
                  <el-input v-model="searchForm.warnDaysMin" clearable />
                  <span>-</span>
                  <el-input v-model="searchForm.warnDaysMax" clearable />
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="search-actions-row">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="toggleAdvancedSearch">高级搜索/收起</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-row>

          <div v-show="isAdvancedSearch" class="advanced-search-panel">
            <el-row :gutter="10">
              <el-col :span="3">
                <el-form-item label="量具类型"><el-input v-model="searchForm.category" clearable /></el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="管理类别"><el-input v-model="searchForm.manageClass" clearable /></el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="校验模板">
                  <el-select v-model="searchForm.template" placeholder="请选择" clearable>
                    <el-option v-for="option in calibrationTemplateOptions" :key="option" :label="option" :value="option" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="入厂日期"><el-date-picker v-model="searchForm.inDate" type="daterange" range-separator="-" /></el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="规格型号"><el-input v-model="searchForm.spec" clearable /></el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="量程"><el-input v-model="searchForm.range" clearable /></el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="分度值"><el-input v-model="searchForm.divValue" clearable /></el-form-item>
              </el-col>
              <el-col :span="2">
                <el-form-item label="材质"><el-input v-model="searchForm.material" clearable /></el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10" class="search-row">
              <el-col :span="3">
                <el-form-item label="生产厂家"><el-input v-model="searchForm.manufacturer" clearable /></el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="有效日期"><el-date-picker v-model="searchForm.validDate" type="daterange" range-separator="-" /></el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="校验单位"><el-input v-model="searchForm.calibOrg" clearable /></el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="班组"><el-input v-model="searchForm.team" clearable /></el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="具体位置"><el-input v-model="searchForm.location" clearable /></el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="责任人"><el-input v-model="searchForm.owner" clearable /></el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="备注"><el-input v-model="searchForm.remark" clearable /></el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </template>

      <div class="table-wrapper">
        <el-table :data="filteredData" border height="100%" empty-text="暂无符合条件的数据" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" :selectable="isLedgerRowSelectable" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column v-if="isColumnVisible('category')" prop="category" label="量具类型" width="90" />
          <el-table-column v-if="isColumnVisible('usage')" prop="usage" label="用途" width="80" />
          <el-table-column v-if="isColumnVisible('manageClass')" prop="manageClass" label="管理类别" width="90" align="center" />
          <el-table-column v-if="isColumnVisible('template')" prop="template" label="校验模板" width="120" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('manageCode')" prop="manageCode" label="管理编号" width="110" />
          <el-table-column v-if="isColumnVisible('factoryCode')" prop="factoryCode" label="出厂编号" width="110" />
          <el-table-column v-if="isColumnVisible('inDate')" prop="inDate" label="入厂日期" width="110" />
          <el-table-column v-if="isColumnVisible('name')" prop="name" label="名称" width="130" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('spec')" prop="spec" label="规格型号" width="110" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('range')" prop="range" label="量程" width="100" />
          <el-table-column v-if="isColumnVisible('divValue')" prop="divValue" label="分度值" width="90" />
          <el-table-column v-if="isColumnVisible('material')" prop="material" label="材质" width="90" align="center" />
          <el-table-column v-if="isColumnVisible('manufacturer')" prop="manufacturer" label="生产厂家" width="120" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('cycle')" prop="cycle" label="计量周期/月" width="110" align="center" />
          <el-table-column v-if="isColumnVisible('calibDate')" prop="calibDate" label="校验日期" width="110" />
          <el-table-column v-if="isColumnVisible('validDate')" prop="validDate" label="有效日期" width="110" />
          <el-table-column v-if="isColumnVisible('calibOrg')" prop="calibOrg" label="校验单位" width="110" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('certNo')" prop="certNo" label="证书编号" width="130" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('method')" prop="method" label="计量方式" width="90" align="center">
            <template #default="{ row }">
              {{ row.method }}
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('status')" prop="status" label="状态" width="90" align="center">
            <template #default="{ row }">
              <span>{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('department')" prop="department" label="使用部门" width="110" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('workshop')" prop="workshop" label="使用车间" width="100" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('team')" prop="team" label="班组" width="90" />
          <el-table-column v-if="isColumnVisible('location')" prop="location" label="具体位置" width="110" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('owner')" prop="owner" label="责任人" width="100" />
          <el-table-column v-if="isColumnVisible('warnDays')" prop="warnDays" label="预警天数" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.warnDays !== '-' && Number(row.warnDays) <= 30" :type="Number(row.warnDays) <= 0 ? 'danger' : 'warning'" effect="plain">
                {{ row.warnDays }}天
              </el-tag>
              <span v-else>{{ row.warnDays === '-' ? '-' : `${row.warnDays}天` }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('remark')" prop="remark" label="备注" width="130" show-overflow-tooltip />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openRecordDialog(row, 'detail')">详情</el-button>
              <el-button link type="primary" size="small" @click="openRecordDialog(row, 'edit')">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next"
          :total="filteredData.length"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </el-card>

    <el-dialog v-model="recordDialogVisible" :title="recordDialogTitle" width="880px" top="5vh" class="record-dialog">
      <el-form :model="recordForm" label-width="120px" class="record-form">
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="量具类型"><el-input v-model="recordForm.category" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用途">
              <el-select v-model="recordForm.usage" :disabled="isRecordReadonly">
                <el-option v-for="option in usageOptions" :key="option" :label="option" :value="option" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="管理类别">
              <el-select v-model="recordForm.manageClass" :disabled="isRecordReadonly">
                <el-option label="A" value="A" />
                <el-option label="B" value="B" />
                <el-option label="C" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校验模板">
              <el-select v-model="recordForm.template" :disabled="isRecordReadonly" placeholder="请选择">
                <el-option v-for="option in calibrationTemplateOptions" :key="option" :label="option" :value="option" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="管理编号"><el-input v-model="recordForm.manageCode" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出厂编号"><el-input v-model="recordForm.factoryCode" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="入厂日期">
              <el-date-picker v-model="recordForm.inDate" type="date" value-format="YYYY-MM-DD" :disabled="isRecordReadonly" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称"><el-input v-model="recordForm.name" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="规格型号"><el-input v-model="recordForm.spec" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="量程"><el-input v-model="recordForm.range" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="分度值"><el-input v-model="recordForm.divValue" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材质"><el-input v-model="recordForm.material" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="生产厂家"><el-input v-model="recordForm.manufacturer" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量周期">
              <el-select v-model="recordForm.cycle" :disabled="isRecordReadonly">
                <el-option v-for="option in calibrationCycleOptions" :key="option" :label="option" :value="option" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="校验日期">
              <el-date-picker v-model="recordForm.calibDate" type="date" value-format="YYYY-MM-DD" :disabled="isRecordReadonly" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校验单位"><el-input v-model="recordForm.calibOrg" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="计量方式">
              <el-select v-model="recordForm.method" :disabled="isRecordReadonly">
                <el-option label="内校" value="内校" />
                <el-option label="外校" value="外校" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用部门"><el-input v-model="recordForm.department" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="使用车间"><el-input v-model="recordForm.workshop" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科室/班组/货架"><el-input v-model="recordForm.team" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="具体位置"><el-input v-model="recordForm.location" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人"><el-input v-model="recordForm.owner" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="28">
          <el-col :span="12">
            <el-form-item label="备注"><el-input v-model="recordForm.remark" :disabled="isRecordReadonly" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上传附件">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" :disabled="isRecordReadonly">
                <el-button type="primary" plain icon="Upload" :disabled="isRecordReadonly">上传文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button v-if="!isRecordReadonly" type="primary" @click="saveRecordChanges">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchEditDialogVisible" title="批量修改" width="520px">
      <div class="batch-edit-summary">已选择 {{ selectedRows.length }} 条数据，本次只修改一个字段。</div>
      <el-form label-width="90px">
        <el-form-item label="修改字段">
          <el-select v-model="batchEditField" placeholder="请选择字段" style="width: 100%" @change="batchEditValue = ''">
            <el-option v-for="field in batchEditableFields" :key="field.value" :label="field.label" :value="field.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="修改为">
          <el-select
            v-if="batchFieldConfig?.type === 'select'"
            v-model="batchEditValue"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option v-for="option in batchFieldConfig.options" :key="option" :label="option" :value="option" />
          </el-select>
          <el-date-picker
            v-else-if="batchFieldConfig?.type === 'date'"
            v-model="batchEditValue"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
            style="width: 100%"
          />
          <el-input v-else v-model="batchEditValue" :disabled="!batchEditField" placeholder="请输入新值" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applyBatchEdit">确定修改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addDialogVisible" title="新增" width="800px" @close="resetAddForm">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="量具类型">
              <el-input v-model="addForm.category" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用途">
              <el-select v-model="addForm.usage" placeholder="请选择" style="width: 100%" clearable>
                <el-option v-for="option in usageOptions" :key="option" :label="option" :value="option" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="管理类别">
              <el-select v-model="addForm.manageClass" placeholder="请选择" style="width: 100%" clearable>
                <el-option label="A" value="A" />
                <el-option label="B" value="B" />
                <el-option label="C" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校验模板">
              <el-select v-model="addForm.template" placeholder="请选择" style="width: 100%" clearable>
                <el-option v-for="option in calibrationTemplateOptions" :key="option" :label="option" :value="option" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="管理编号" prop="manageCode">
              <el-input v-model="addForm.manageCode" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出厂编号">
              <el-input v-model="addForm.factoryCode" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入厂日期">
              <el-date-picker v-model="addForm.inDate" type="date" placeholder="请选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="addForm.name" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="addForm.spec" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="量程">
              <el-input v-model="addForm.range" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分度值">
              <el-input v-model="addForm.divValue" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材质">
              <el-input v-model="addForm.material" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="addForm.manufacturer" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量周期" prop="cycle">
              <el-select v-model="addForm.cycle" placeholder="请选择" style="width: 100%" clearable>
                <el-option v-for="option in calibrationCycleOptions" :key="option" :label="option" :value="option" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="校验日期" prop="calibDate">
              <el-date-picker v-model="addForm.calibDate" type="date" placeholder="请选择" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校验单位">
              <el-input v-model="addForm.calibOrg" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计量方式" prop="method">
              <el-select v-model="addForm.method" placeholder="请选择" style="width: 100%" clearable>
                <el-option label="内校" value="内校" />
                <el-option label="外校" value="外校" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用部门">
              <el-input v-model="addForm.department" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="使用车间">
              <el-input v-model="addForm.workshop" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科室/班组/货架">
              <el-input v-model="addForm.team" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="具体位置">
              <el-input v-model="addForm.location" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人">
              <el-input v-model="addForm.owner" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="addForm.remark" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上传附件">
              <el-upload action="#" :auto-upload="false" :show-file-list="false">
                <el-button type="primary" plain icon="Upload">上传文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearAddForm">清空</el-button>
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="批量导入" width="500px">
      <div class="import-container">
        <div class="step-title">第一步：下载模板</div>
        <div class="step-desc">
          <p>请下载标准的导入模板，按照模板格式要求填写数据。</p>
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
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
import { appendGeneratedCalibrationTasks, createCalibrationTask } from '@/utils/measuringCalibrationTasks'
useTaskLiteralDomI18n()

const usageOptions = [
  '标准器具',
  '标准物质',
  '检测设备',
  '在线仪表',
  '检具',
  '量具',
  '数采量具',
  '数采仪器',
  '数采在线仪表'
] as const

const calibrationTemplateOptions = [
  '刀口直尺',
  '空白',
  '直角尺',
  '直尺、直角尺（含线纹）',
  '平口直尺',
  'I型楔形塞尺',
  'II型楔形塞尺',
  '钢直尺',
  '卷尺',
  '外径千分尺（0-25）mm',
  '外径千分尺（25-50）mm',
  '数显千分表0-10mm',
  '数显千分表0-50mm',
  '数显百分表0-10mm',
  '数显百分表0-50mm',
  '电子秤30/0.01kg',
  '电子秤6/0.002kg',
  '平面度/直线度检具',
  '垂直度检具'
] as const

const calibrationCycleOptions = ['首次', '1', '2', '3', '6', '9', '12', '24', '36'] as const

type LedgerColumnKey =
  | 'category'
  | 'usage'
  | 'manageClass'
  | 'template'
  | 'manageCode'
  | 'factoryCode'
  | 'inDate'
  | 'name'
  | 'spec'
  | 'range'
  | 'divValue'
  | 'material'
  | 'manufacturer'
  | 'cycle'
  | 'calibDate'
  | 'validDate'
  | 'calibOrg'
  | 'certNo'
  | 'method'
  | 'status'
  | 'department'
  | 'workshop'
  | 'team'
  | 'location'
  | 'owner'
  | 'warnDays'
  | 'remark'

interface LedgerColumnOption {
  key: LedgerColumnKey
  label: string
}

const columnOptions: LedgerColumnOption[] = [
  { key: 'category', label: '量具类型' },
  { key: 'usage', label: '用途' },
  { key: 'manageClass', label: '管理类别' },
  { key: 'template', label: '校验模板' },
  { key: 'manageCode', label: '管理编号' },
  { key: 'factoryCode', label: '出厂编号' },
  { key: 'inDate', label: '入厂日期' },
  { key: 'name', label: '名称' },
  { key: 'spec', label: '规格型号' },
  { key: 'range', label: '量程' },
  { key: 'divValue', label: '分度值' },
  { key: 'material', label: '材质' },
  { key: 'manufacturer', label: '生产厂家' },
  { key: 'cycle', label: '计量周期/月' },
  { key: 'calibDate', label: '校验日期' },
  { key: 'validDate', label: '有效日期' },
  { key: 'calibOrg', label: '校验单位' },
  { key: 'certNo', label: '证书编号' },
  { key: 'method', label: '计量方式' },
  { key: 'status', label: '状态' },
  { key: 'department', label: '使用部门' },
  { key: 'workshop', label: '使用车间' },
  { key: 'team', label: '班组' },
  { key: 'location', label: '具体位置' },
  { key: 'owner', label: '责任人' },
  { key: 'warnDays', label: '预警天数' },
  { key: 'remark', label: '备注' }
]

const defaultVisibleColumnKeys: LedgerColumnKey[] = [
  'category',
  'manageCode',
  'name',
  'spec',
  'range',
  'cycle',
  'calibDate',
  'validDate',
  'status',
  'department',
  'workshop',
  'owner',
  'warnDays'
]

const columnStorageKey = 'mom_measuring_ledger_visible_columns'
const availableColumnKeys = new Set<LedgerColumnKey>(columnOptions.map(column => column.key))

const loadVisibleColumnKeys = (): LedgerColumnKey[] => {
  if (typeof window === 'undefined') return [...defaultVisibleColumnKeys]

  try {
    const stored = JSON.parse(window.localStorage.getItem(columnStorageKey) || 'null')
    if (!Array.isArray(stored)) return [...defaultVisibleColumnKeys]
    if (stored.length === 0) return []

    const validKeys = stored.filter((key): key is LedgerColumnKey => availableColumnKeys.has(key))
    return validKeys.length > 0 ? validKeys : [...defaultVisibleColumnKeys]
  } catch {
    return [...defaultVisibleColumnKeys]
  }
}

const visibleColumnKeys = ref<LedgerColumnKey[]>(loadVisibleColumnKeys())
const visibleColumnSet = computed(() => new Set(visibleColumnKeys.value))
const isColumnVisible = (key: LedgerColumnKey) => visibleColumnSet.value.has(key)
const allColumnsSelected = computed(() => visibleColumnKeys.value.length === columnOptions.length)
const someColumnsSelected = computed(() => visibleColumnKeys.value.length > 0 && !allColumnsSelected.value)

const handleSelectAllColumns = (checked: boolean | string | number) => {
  visibleColumnKeys.value = checked ? columnOptions.map(column => column.key) : []
}

const showAllColumns = () => {
  visibleColumnKeys.value = columnOptions.map(column => column.key)
}

const resetVisibleColumns = () => {
  visibleColumnKeys.value = [...defaultVisibleColumnKeys]
}

watch(visibleColumnKeys, columns => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(columnStorageKey, JSON.stringify(columns))
  }
}, { deep: true })

const isAdvancedSearch = ref(false)

const toggleAdvancedSearch = () => {
  isAdvancedSearch.value = !isAdvancedSearch.value
}

type RecordDialogMode = 'detail' | 'edit'

const createEmptyRecordForm = () => ({
  category: '', usage: '', manageClass: '', template: '', manageCode: '', factoryCode: '',
  inDate: '', name: '', spec: '', range: '', divValue: '', material: '', manufacturer: '',
  cycle: '', calibDate: '', calibOrg: '', method: '', department: '', workshop: '', team: '',
  location: '', owner: '', remark: ''
})

const recordDialogVisible = ref(false)
const recordDialogMode = ref<RecordDialogMode>('detail')
const recordDialogTitle = computed(() => recordDialogMode.value === 'detail' ? '详情' : '编辑')
const isRecordReadonly = computed(() => recordDialogMode.value === 'detail')
const recordForm = ref<Record<string, any>>(createEmptyRecordForm())
const editingRow = ref<Record<string, any> | null>(null)

const openRecordDialog = (row: Record<string, any>, mode: RecordDialogMode) => {
  recordDialogMode.value = mode
  editingRow.value = row
  recordForm.value = { ...createEmptyRecordForm(), ...row }
  recordDialogVisible.value = true
}

const saveRecordChanges = () => {
  if (!editingRow.value) return
  Object.assign(editingRow.value, recordForm.value)
  recordDialogVisible.value = false
  ElMessage.success('修改成功')
}

type BatchFieldType = 'text' | 'select' | 'date'

interface BatchEditableField {
  value: string
  label: string
  type: BatchFieldType
  options?: readonly string[]
}

const batchEditableFields: BatchEditableField[] = [
  { value: 'category', label: '量具类型', type: 'text' },
  { value: 'usage', label: '用途', type: 'select', options: usageOptions },
  { value: 'manageClass', label: '管理类别', type: 'select', options: ['A', 'B', 'C'] },
  { value: 'template', label: '校验模板', type: 'select', options: calibrationTemplateOptions },
  { value: 'inDate', label: '入厂日期', type: 'date' },
  { value: 'name', label: '名称', type: 'text' },
  { value: 'spec', label: '规格型号', type: 'text' },
  { value: 'range', label: '量程', type: 'text' },
  { value: 'divValue', label: '分度值', type: 'text' },
  { value: 'material', label: '材质', type: 'text' },
  { value: 'manufacturer', label: '生产厂家', type: 'text' },
  { value: 'cycle', label: '计量周期', type: 'select', options: calibrationCycleOptions },
  { value: 'calibDate', label: '校验日期', type: 'date' },
  { value: 'validDate', label: '有效日期', type: 'date' },
  { value: 'calibOrg', label: '校验单位', type: 'text' },
  { value: 'method', label: '计量方式', type: 'select', options: ['内校', '外校'] },
  { value: 'department', label: '使用部门', type: 'text' },
  { value: 'workshop', label: '使用车间', type: 'text' },
  { value: 'team', label: '科室/班组/货架', type: 'text' },
  { value: 'location', label: '具体位置', type: 'text' },
  { value: 'owner', label: '责任人', type: 'text' },
  { value: 'remark', label: '备注', type: 'text' },
  { value: 'warnDays', label: '预警天数', type: 'text' }
]

const selectedRows = ref<Record<string, any>[]>([])
const batchEditDialogVisible = ref(false)
const batchEditField = ref('')
const batchEditValue = ref('')
const batchFieldConfig = computed(() => batchEditableFields.find(field => field.value === batchEditField.value))

const handleSelectionChange = (rows: Record<string, any>[]) => {
  selectedRows.value = rows
}

const isLedgerRowSelectable = (row: Record<string, any>) => row.status !== '报废'

const handleGenerateCalibrationTasks = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择需要生成校验任务的数据')
    return
  }

  const eligibleRows = selectedRows.value.filter(isLedgerRowSelectable)
  if (eligibleRows.length === 0) {
    ElMessage.warning('报废数据不能生成校验任务')
    return
  }

  const createdAt = new Date()
  const tasks = eligibleRows.map((row, index) => createCalibrationTask(row, index, createdAt))
  appendGeneratedCalibrationTasks(tasks)
  eligibleRows.forEach(row => {
    row.status = '校验中'
  })
  ElMessage.success(`已生成 ${tasks.length} 条校验任务`)
}

const handleArchiveOrScrap = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择需要报废或封存的数据')
    return
  }

  const archiveRows = selectedRows.value.filter(row => row.status === '使用中' || row.status === '限用')
  const scrapRows = selectedRows.value.filter(row => row.status === '停用')
  const actionableRows = [...archiveRows, ...scrapRows]

  if (actionableRows.length === 0) {
    ElMessage.warning('仅使用中、限用量具可封存，停用量具可报废')
    return
  }

  archiveRows.forEach(row => {
    row.status = '封存'
  })
  scrapRows.forEach(row => {
    row.status = '报废'
  })

  const skippedCount = selectedRows.value.length - actionableRows.length
  const skippedMessage = skippedCount > 0 ? `，已跳过 ${skippedCount} 条不符合状态的数据` : ''
  ElMessage.success(`已完成 ${archiveRows.length} 条封存、${scrapRows.length} 条报废${skippedMessage}`)
}

const openBatchEditDialog = () => {
  if (selectedRows.value.length < 2) {
    ElMessage.warning('请至少选择两条数据')
    return
  }
  batchEditField.value = ''
  batchEditValue.value = ''
  batchEditDialogVisible.value = true
}

const applyBatchEdit = () => {
  if (!batchEditField.value) {
    ElMessage.warning('请选择要修改的字段')
    return
  }
  if (batchEditValue.value === '') {
    ElMessage.warning('请输入或选择新值')
    return
  }

  selectedRows.value.forEach(row => {
    row[batchEditField.value] = batchEditValue.value
  })

  const fieldLabel = batchFieldConfig.value?.label || '字段'
  batchEditDialogVisible.value = false
  ElMessage.success(`已批量修改 ${selectedRows.value.length} 条数据的${fieldLabel}`)
}

const addDialogVisible = ref(false)
const addFormRef = ref()
const addForm = ref({
  category: '', usage: '', manageClass: '', template: '', manageCode: '', factoryCode: '',
  inDate: '', name: '', spec: '', range: '', divValue: '', material: '', manufacturer: '',
  cycle: '', calibDate: '', calibOrg: '', method: '', department: '', workshop: '', team: '',
  location: '', owner: '', remark: ''
})

const addRules = {
  manageCode: [{ required: true, message: '请输入管理编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  cycle: [{ required: true, message: '请选择计量周期', trigger: 'change' }],
  calibDate: [{ required: true, message: '请选择校验日期', trigger: 'change' }],
  method: [{ required: true, message: '请选择计量方式', trigger: 'change' }]
}

const openAddDialog = () => {
  addDialogVisible.value = true
}

const clearAddForm = () => {
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
  Object.keys(addForm.value).forEach(key => {
    (addForm.value as any)[key] = ''
  })
}

const resetAddForm = () => {
  clearAddForm()
}

const submitAddForm = async () => {
  if (!addFormRef.value) return
  await addFormRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('新增成功')
      addDialogVisible.value = false
    }
  })
}

const importDialogVisible = ref(false)

const openImportDialog = () => {
  importDialogVisible.value = true
}

const downloadTemplate = () => {
  const templateName = '量检具台账模版.xlsx'
  const link = document.createElement('a')
  link.href = `${import.meta.env.BASE_URL}templates/${encodeURIComponent(templateName)}`
  link.download = templateName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('模板下载已开始')
}

const handleBatchImport = (file: any) => {
  ElMessage.success(`成功导入文件: ${file.name}`)
  importDialogVisible.value = false
}

const handleExport = () => {
  ElMessage.success('导出任务已提交，请稍后在下载中心查看')
}

const createEmptySearchForm = () => ({
  usage: '', manageCode: '', factoryCode: '', name: '', calibDate: [], cycle: '',
  method: '', status: '', department: '', workshop: '', warnDaysMin: '', warnDaysMax: '',
  category: '', manageClass: '', template: '', inDate: [], spec: '', range: '', divValue: '',
  material: '', manufacturer: '', validDate: [], calibOrg: '', team: '', location: '', owner: '', remark: ''
})

const searchForm = ref<Record<string, any>>(createEmptySearchForm())

const filters = ref({ ...searchForm.value })

const handleSearch = () => {
  filters.value = { ...searchForm.value }
}

const handleReset = () => {
  searchForm.value = createEmptySearchForm()
  handleSearch()
}

const tableData = ref([
  {
    category: '长度', usage: '量具', manageClass: 'B', template: '游标卡尺', manageCode: 'LJ-001',
    factoryCode: 'YC240315', inDate: '2024-03-20', name: '数显游标卡尺', spec: '0-150mm', range: '0-150mm', divValue: '0.01mm',
    material: '不锈钢', manufacturer: '桂林广陆', cycle: '12', calibDate: '2026-03-18', validDate: '2027-03-17',
    calibOrg: '品保部', certNo: 'NJ26031801', method: '内校', status: '使用中', department: '生产部',
    workshop: '机加工', team: 'A班', location: '检验台1', owner: '阮文安', warnDays: '227', remark: '-'
  },
  {
    category: '质量', usage: '量具', manageClass: 'A', template: '电子秤30kg', manageCode: 'ZL-003',
    factoryCode: 'ES250108', inDate: '2025-01-12', name: '电子秤', spec: '30kg/10g', range: '0-30kg', divValue: '10g',
    material: '不锈钢', manufacturer: '英展', cycle: '6', calibDate: '2026-02-10', validDate: '2026-08-09',
    calibOrg: '越南计量院', certNo: 'VMI-260210-36', method: '外校', status: '使用中', department: '仓储部',
    workshop: '成品仓', team: '白班', location: '收货区', owner: '陈氏兰', warnDays: '7', remark: '即将到期'
  },
  {
    category: '温度', usage: '量具', manageClass: 'A', template: '数字温湿度计', manageCode: 'WD-002',
    factoryCode: 'TH230921', inDate: '2023-09-25', name: '数字温湿度计', spec: 'TH-101B', range: '-20-60℃', divValue: '0.1℃',
    material: '塑料', manufacturer: '德图', cycle: '12', calibDate: '2025-08-01', validDate: '2026-07-31',
    calibOrg: '越南计量院', certNo: 'VMI-250801-12', method: '外校', status: '校验中', department: '品保部',
    workshop: '实验室', team: '检测组', location: '环境监测点', owner: '黎明俊', warnDays: '0', remark: '已送外校'
  },
  {
    category: '专用检具', usage: '检具', manageClass: 'C', template: '垂直度检具', manageCode: 'JY-006',
    factoryCode: 'XC-JY-006', inDate: '2024-06-08', name: '垂直度检具', spec: '200×150mm', range: '-', divValue: '-',
    material: '工具钢', manufacturer: '创新精密', cycle: '12', calibDate: '2025-06-15', validDate: '2026-06-14',
    calibOrg: '品保部', certNo: 'NJ25061506', method: '内校', status: '封存', department: '品保部',
    workshop: '计量室', team: '检测组', location: '检具柜2', owner: '王若瑾', warnDays: '-', remark: '待维修确认'
  }
])

const containsFilter = (value: unknown, filterValue: unknown) => {
  const query = String(filterValue || '').trim().toLowerCase()
  return !query || String(value || '').toLowerCase().includes(query)
}

const matchesDateRange = (value: string, rangeValue: unknown) => {
  const dateRange = Array.isArray(rangeValue) ? rangeValue : []
  if (dateRange.length !== 2) return true
  const current = new Date(value).getTime()
  return current >= new Date(dateRange[0]).getTime() && current <= new Date(dateRange[1]).getTime()
}

const filteredData = computed(() => tableData.value.filter(item => {
  const warnDays = Number(item.warnDays)
  const warnDaysMin = String(filters.value.warnDaysMin || '').trim()
  const warnDaysMax = String(filters.value.warnDaysMax || '').trim()
  const matchesWarnDays = (!warnDaysMin || (!Number.isNaN(warnDays) && warnDays >= Number(warnDaysMin)))
    && (!warnDaysMax || (!Number.isNaN(warnDays) && warnDays <= Number(warnDaysMax)))

  return (
    (!filters.value.usage || item.usage === filters.value.usage)
    && containsFilter(item.manageCode, filters.value.manageCode)
    && containsFilter(item.factoryCode, filters.value.factoryCode)
    && containsFilter(item.name, filters.value.name)
    && matchesDateRange(item.calibDate, filters.value.calibDate)
    && (!filters.value.cycle || item.cycle === filters.value.cycle)
    && (!filters.value.method || item.method === filters.value.method)
    && (!filters.value.status || item.status === filters.value.status)
    && containsFilter(item.department, filters.value.department)
    && containsFilter(item.workshop, filters.value.workshop)
    && matchesWarnDays
    && containsFilter(item.category, filters.value.category)
    && containsFilter(item.manageClass, filters.value.manageClass)
    && (!filters.value.template || item.template === filters.value.template)
    && matchesDateRange(item.inDate, filters.value.inDate)
    && containsFilter(item.spec, filters.value.spec)
    && containsFilter(item.range, filters.value.range)
    && containsFilter(item.divValue, filters.value.divValue)
    && containsFilter(item.material, filters.value.material)
    && containsFilter(item.manufacturer, filters.value.manufacturer)
    && matchesDateRange(item.validDate, filters.value.validDate)
    && containsFilter(item.calibOrg, filters.value.calibOrg)
    && containsFilter(item.team, filters.value.team)
    && containsFilter(item.location, filters.value.location)
    && containsFilter(item.owner, filters.value.owner)
    && containsFilter(item.remark, filters.value.remark)
  )
}))
</script>

<style scoped>
.page-container {
  height: 100%;
}
.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.title {
  font-weight: 600;
  font-size: 16px;
  margin-right: 12px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ledger-search-form {
  width: 100%;
  margin-top: 16px;
}
.ledger-search-form :deep(.el-form-item) {
  display: flex;
  width: 100%;
  margin-right: 0;
  margin-bottom: 0;
}
.ledger-search-form :deep(.el-form-item__content) {
  flex: 1;
  min-width: 0;
}
.ledger-search-form :deep(.el-select),
.ledger-search-form :deep(.el-date-editor),
.ledger-search-form :deep(.el-input) {
  width: 100%;
}
.search-row {
  margin-top: 10px;
}
.search-actions-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.range-inputs span {
  color: #909399;
}
.column-selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 600;
}
.column-selector-header span:last-child {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}
.column-selector :deep(.el-divider--horizontal) {
  margin: 10px 0 12px;
}
.column-checkbox-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 12px;
  max-height: 300px;
  overflow-y: auto;
}
.column-checkbox-group :deep(.el-checkbox) {
  margin-right: 0;
}
.column-selector-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border-subtle);
}
.advanced-search-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}
.table-wrapper {
  flex: 1;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.record-form :deep(.el-select),
.record-form :deep(.el-date-editor),
.record-form :deep(.el-input) {
  width: 100%;
}
.record-form :deep(.el-form-item) {
  margin-bottom: 18px;
}
:deep(.record-dialog .el-dialog__body) {
  max-height: calc(90vh - 130px);
  overflow-y: auto;
  padding: 18px 20px 0;
}
.batch-edit-summary {
  margin-bottom: 18px;
  padding: 10px 12px;
  color: #606266;
  background: #f5f7fa;
  border-radius: 4px;
}
.import-container {
  padding: 0 20px 20px;
}
.step-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 10px;
  color: #303133;
}
.step-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}
.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 7px;
}
</style>
