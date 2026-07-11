# Packaging Workbench Pack Dialog Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 精简包装工作台的装托弹窗字段，删除重量和包装方式，改为托盘号、类型、本次装托数量三项表单。

**Architecture:** 仅修改 `PackagingWorkbench.vue`，不引入新组件、不改打印版式。通过替换弹窗表单项、精简 `dialogs.pack.form` 结构、删除重量校验和旧输入处理函数，保持现有生成托盘和预览标识卡流程可继续使用。

**Tech Stack:** Vue 3, `<script setup>`, TypeScript, Element Plus, Vite

---

### Task 1: 调整装托弹窗模板

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 删除包装方式与重量字段，新增类型下拉**

```vue
<el-form-item label="托盘号" required>
  <el-input v-model="dialogs.pack.form.palletNo" placeholder="请输入装托托盘号" />
</el-form-item>
<el-form-item label="类型" required>
  <el-select v-model="dialogs.pack.form.type" placeholder="请选择类型" style="width: 100%">
    <el-option label="正常生产" value="正常生产" />
    <el-option label="验证料" value="验证料" />
    <el-option label="客户需求" value="客户需求" />
  </el-select>
</el-form-item>
<el-form-item label="本次装托数量" required>
  <el-input-number v-model="dialogs.pack.form.qtyPerPack" :min="1" :max="currentRow.qty" style="width: 100%" />
</el-form-item>
```

### Task 2: 清理表单状态与提交逻辑

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 精简默认表单结构**

```ts
form: { palletNo: '', type: '', qtyPerPack: 50 }
```

- [ ] **Step 2: 打开装托弹窗时只初始化保留字段**

```ts
dialogs.value.pack.form = {
  palletNo: currentTeam.value || '',
  type: '',
  qtyPerPack: row.qty
}
```

- [ ] **Step 3: 删除重量输入处理函数与旧校验，替换为类型校验**

```ts
if (!dialogs.value.pack.form.palletNo) {
  ElMessage.warning('请输入托盘号')
  return
}
if (!dialogs.value.pack.form.type) {
  ElMessage.warning('请选择类型')
  return
}
```

### Task 3: 回归验证

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: 构建检查**

Run:

```bash
npm run build
```

Expected:

```text
vite build 成功
```

- [ ] **Step 2: 手工验证**

```text
1. 打开包装工作台中的装托弹窗
2. 确认弹窗只显示托盘号、类型、本次装托数量
3. 确认类型下拉只有“正常生产、验证料、客户需求”
4. 不选择类型直接提交时出现提示
5. 选择类型后可正常进入标识卡预览
```
