# Coded Feeding Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a temporary coded-feeding queue inside the extrusion feeding dialog so scanned QR codes accumulate in the modal and only write to the formal billet queue after the user clicks confirm.

**Architecture:** Keep all changes inside `src/views/extrusion/ExtrusionWorkbench.vue` to match the current single-file implementation style. Add a modal-local queue, a couple of helper methods for add/reset behavior, then update the coded branch of `submitFeeding()` to batch-write the temporary queue into `loadedRods` while leaving the uncoded branch unchanged.

**Tech Stack:** Vue 3 `<script setup>` with TypeScript, Element Plus, existing reactive state in `ExtrusionWorkbench.vue`

---

### Task 1: Add Temporary Coded Queue UI And State

**Files:**
- Modify: `d:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue`
- Reference: `d:/越南MOM/MOM/docs/superpowers/specs/2026-05-24-coded-feeding-queue-design.md`

- [ ] **Step 1: Add a failing interaction target in the feeding dialog template**

Insert this block inside the `feedingMode === 'coded'` branch, directly after the scan input form item:

```vue
          <div class="record-title">上料队列</div>
          <el-table :data="codedFeedingQueue" border size="small" max-height="240">
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column prop="rodNo" label="二维码编号" min-width="260" show-overflow-tooltip />
          </el-table>
```

Expected result before script changes: the file has template references to `codedFeedingQueue` that will fail diagnostics because state is not defined yet.

- [ ] **Step 2: Run diagnostics to verify the template currently fails**

Run diagnostics for:

```text
file:///d:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue
```

Expected: a Vue/TypeScript error similar to `Cannot find name 'codedFeedingQueue'`.

- [ ] **Step 3: Add the temporary queue state and reset helper**

Near the existing feeding state, add:

```ts
const feedingMode = ref('coded')
const feedingForm = ref({
  scanRodNo: '',
  furnaceBatch: '',
  uncodedQty: 1
})
const codedFeedingQueue = ref<Array<{ rodNo: string }>>([])

const resetCodedFeedingState = () => {
  feedingForm.value.scanRodNo = ''
  codedFeedingQueue.value = []
}
```

This keeps the temporary queue local to the dialog and gives later steps one shared reset path.

- [ ] **Step 4: Add the QR enqueue helper and wire the scan button**

Add this helper near `submitFeeding()`:

```ts
const appendCodedFeedingQueue = () => {
  const rodNo = feedingForm.value.scanRodNo.trim()
  if (!rodNo) {
    ElMessage.warning('请扫码或输入铝棒编号')
    return
  }
  if (codedFeedingQueue.value.some(item => item.rodNo === rodNo)) {
    ElMessage.warning('该二维码已在上料队列中')
    return
  }
  codedFeedingQueue.value.push({ rodNo })
  feedingForm.value.scanRodNo = ''
}
```

Then update the existing append button in the scan input to:

```vue
<el-button :icon="Search" @click="appendCodedFeedingQueue">模拟扫码</el-button>
```

- [ ] **Step 5: Run diagnostics to verify the dialog queue compiles**

Run diagnostics for:

```text
file:///d:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue
```

Expected: no diagnostics related to `codedFeedingQueue`, `resetCodedFeedingState`, or `appendCodedFeedingQueue`.

- [ ] **Step 6: Commit the UI/state slice**

```bash
git add src/views/extrusion/ExtrusionWorkbench.vue
git commit -m "feat: add coded feeding staging queue"
```

### Task 2: Batch Write Temporary Queue Into Loaded Rods

**Files:**
- Modify: `d:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue`
- Verify: `d:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue`

- [ ] **Step 1: Make coded confirm fail fast when the temporary queue is empty**

Replace the start of the coded branch in `submitFeeding()` with:

```ts
  if (feedingMode.value === 'coded') {
    if (codedFeedingQueue.value.length === 0) {
      ElMessage.warning('请先扫码加入上料队列')
      return
    }
```

This intentionally removes the old single-value path so coded confirm no longer reads directly from `feedingForm.scanRodNo`.

- [ ] **Step 2: Batch write the temporary queue into `loadedRods`**

Replace the old single `loadedRods.value.push(...)` coded branch with:

```ts
    codedFeedingQueue.value.forEach(item => {
      loadedRods.value.push({
        rodNo: item.rodNo,
        extrusionBatchNo: currentTask.value?.extrusionBatchNo || '',
        status: '待挤压',
        loadTime: now,
        extrusionTime: ''
      })
    })
```

- [ ] **Step 3: Reset the modal-local queue on success and when reopening/closing**

Apply these three edits:

1. In `submitFeeding()` after a successful coded or uncoded submit:

```ts
  operationState.value.feeding = true
  feedingDialogVisible.value = false
  resetCodedFeedingState()
  ElMessage.success('上料完成')
```

2. In the `feeding` operation branch before opening the dialog:

```ts
    feedingForm.value = { scanRodNo: '', furnaceBatch: pickingRows.value[0]?.furnaceBatch || '', uncodedQty: 1 }
    resetCodedFeedingState()
    feedingDialogVisible.value = true
```

3. In the cancel button for the feeding dialog:

```vue
<el-button @click="handleCloseFeedingDialog">取消</el-button>
```

And add:

```ts
const handleCloseFeedingDialog = () => {
  feedingDialogVisible.value = false
  resetCodedFeedingState()
}
```

- [ ] **Step 4: Verify the final coded flow**

Check these manual cases in the running app:

```text
1. Open extrusion feeding dialog in coded mode.
2. Enter QR code A and click 模拟扫码 -> queue shows A.
3. Enter QR code A again -> toast shows “该二维码已在上料队列中”.
4. Enter QR code B -> queue shows A and B.
5. Click 确认上料 -> billet queue gains two rows with rodNo A and B.
6. Reopen the dialog -> temporary coded queue is empty.
7. Switch to uncoded mode -> original behavior still works.
```

- [ ] **Step 5: Run diagnostics and build verification**

Run diagnostics for:

```text
file:///d:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue
```

Then run:

```bash
npm run build
```

Expected:

```text
vite build completes successfully
```

- [ ] **Step 6: Commit the submit/reset behavior**

```bash
git add src/views/extrusion/ExtrusionWorkbench.vue
git commit -m "feat: batch confirm coded feeding queue"
```
