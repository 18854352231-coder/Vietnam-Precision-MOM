<template>
  <div class="page-container">
    <el-card class="full-card">
      <template #header>
        <div class="card-header">
          <div class="title">校验提醒规则</div>
          <div class="header-right">
            <el-button @click="openAddDialog">新增</el-button>
          </div>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="tableData" border empty-text="暂无提醒规则">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="method" label="计量方式" min-width="140">
            <template #default="{ row }">
              {{ row.method }}
            </template>
          </el-table-column>
          <el-table-column prop="days" label="提醒时间" min-width="140">
            <template #default="{ row }">到期前 {{ row.days }} 天</template>
          </el-table-column>
          <el-table-column prop="color" label="提醒颜色" min-width="140">
            <template #default="{ row }">
              <span class="color-dot" :style="{ backgroundColor: reminderColor(row.color) }" />
              {{ row.color }}
            </template>
          </el-table-column>
          <el-table-column prop="auto" label="自动生成校验任务" min-width="150">
            <template #default="{ row }">
              <el-switch v-model="row.auto" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default>
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog
      v-model="addDialogVisible"
      title="新增"
      width="1100px"
      destroy-on-close
      @closed="resetAddForm"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="110px"
        class="reminder-add-form"
      >
        <el-row :gutter="72">
          <el-col :span="12">
            <el-form-item label="计量方式" prop="method">
              <el-select v-model="addForm.method" placeholder="请选择" style="width: 100%">
                <el-option label="内部校验" value="内部校验" />
                <el-option label="委外校验" value="委外校验" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提醒天数" prop="days">
              <el-input-number
                v-model="addForm.days"
                :min="0"
                :max="365"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提醒颜色" prop="color">
              <el-select v-model="addForm.color" placeholder="请选择" style="width: 100%">
                <el-option label="红色" value="红色" />
                <el-option label="橙色" value="橙色" />
                <el-option label="黄色" value="黄色" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useTaskLiteralDomI18n } from '@/composables/useTaskLiteralDomI18n'
useTaskLiteralDomI18n()

const tableData = ref([
  { method: '内部校验', days: '7', color: '橙色', auto: true },
  { method: '委外校验', days: '30', color: '红色', auto: true }
])

const addDialogVisible = ref(false)
const addFormRef = ref<FormInstance>()
const createEmptyAddForm = () => ({
  method: '',
  days: 0,
  color: ''
})
const addForm = reactive(createEmptyAddForm())
const addFormRules: FormRules = {
  method: [{ required: true, message: '请选择计量方式', trigger: 'change' }],
  days: [{ required: true, message: '请输入提醒天数', trigger: 'change' }],
  color: [{ required: true, message: '请选择提醒颜色', trigger: 'change' }]
}

const openAddDialog = () => {
  addDialogVisible.value = true
}

const resetAddForm = () => {
  Object.assign(addForm, createEmptyAddForm())
  addFormRef.value?.clearValidate()
}

const submitAddForm = async () => {
  if (!addFormRef.value) return
  const valid = await addFormRef.value.validate().catch(() => false)
  if (!valid) return

  tableData.value.push({
    method: addForm.method,
    days: String(addForm.days),
    color: addForm.color,
    auto: true
  })
  addDialogVisible.value = false
  ElMessage.success('新增成功')
}

const reminderColor = (color: string) => {
  if (color === '红色') return '#f56c6c'
  if (color === '黄色') return '#f2c037'
  return '#e6a23c'
}
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
}
.title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}
.table-wrapper {
  flex: 0 0 auto;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
.color-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
  vertical-align: 1px;
}
.reminder-add-form {
  padding: 0 36px;
}
.reminder-add-form :deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>
