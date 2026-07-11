# Packaging Workbench Pack List Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a right-side "Packed List" panel in the "Packaging" tab and support undoing packed records to restore data to the main table.

**Architecture:** We will introduce a flex-based layout when `activeTab === '包装中'`, showing the main table on the left and a new `el-card` on the right for `packedRecords`. `packedRecords` will store deep copies of the original rows to guarantee safe restoration upon undo.

**Tech Stack:** Vue 3, Element Plus, TypeScript

---

### Task 1: Add Reactive State for Packed Records

**Files:**
- Modify: `src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: Add `packedRecords` state and `undoPack` method stub**
Add the `packedRecords` array and the `undoPack` function below the existing state definitions.

```typescript
// Add near other refs like paginatedData
const packedRecords = ref<any[]>([])

const undoPack = (record: any) => {
  // To be implemented in Task 3
}
```

### Task 2: Modify Template Layout for Split View

**Files:**
- Modify: `src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: Wrap the table in a split-layout container**
In the `<template>`, find the `el-table` (the main table). Wrap it in a new div `.split-layout-container`. Then add the right-side panel that only shows when `activeTab === '包装中'`.

```html
      <div :class="['table-layout-wrapper', { 'is-split': activeTab === '包装中' }]">
        <div class="main-table-section">
          <el-table
            :data="paginatedData"
            border
            stripe
            height="calc(100vh - 330px)"
            :row-class-name="getRowClassName"
            @selection-change="handleSelectionChange"
          >
            <!-- existing table columns -->
          </el-table>
          
          <div class="pagination-container">
            <!-- existing pagination -->
          </div>
        </div>

        <div v-if="activeTab === '包装中'" class="packed-list-section">
          <el-card class="packed-list-card" shadow="never">
            <template #header>
              <div class="packed-list-header">
                <span>已装托记录 ({{ packedRecords.length }})</span>
              </div>
            </template>
            <div v-if="packedRecords.length === 0" class="empty-packed-list">
              <el-empty description="暂无装托记录" :image-size="60" />
            </div>
            <div v-else class="packed-items">
              <div v-for="record in packedRecords" :key="record.id" class="packed-item">
                <div class="packed-item-header">
                  <span class="pallet-no">{{ record.palletNo }}</span>
                  <el-button type="danger" link size="small" @click="undoPack(record)">撤销</el-button>
                </div>
                <div class="packed-item-body">
                  <div class="info-row"><span>良品数量：</span><span>{{ record.qty }}</span></div>
                  <div class="info-row"><span>班组：</span><span>{{ record.team }}</span></div>
                  <div class="info-row"><span>时间：</span><span>{{ record.time }}</span></div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
```

- [ ] **Step 2: Add CSS for the split layout**
Add the new classes to the `<style scoped>` section.

```css
.table-layout-wrapper {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}
.main-table-section {
  flex: 1;
  min-width: 0;
}
.packed-list-section {
  width: 380px;
  flex-shrink: 0;
}
.packed-list-card {
  height: calc(100vh - 330px);
  display: flex;
  flex-direction: column;
}
.packed-list-card :deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.packed-list-header {
  font-weight: bold;
  color: #303133;
}
.packed-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.packed-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  background-color: #f8f9fa;
}
.packed-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #dcdfe6;
}
.pallet-no {
  font-weight: bold;
  color: #409eff;
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}
```

### Task 3: Implement Record Generation and Undo Logic

**Files:**
- Modify: `src/views/extrusion/PackagingWorkbench.vue`

- [ ] **Step 1: Save snapshot and push to `packedRecords` on confirm**
Inside `confirmShortBarPack`, before modifying `selectedPackRow.value`, take a deep clone of the row. After successful pack, push the record to `packedRecords`.

```typescript
// Inside confirmShortBarPack, right after validation:
  const sourceRowSnapshot = JSON.parse(JSON.stringify(selectedPackRow.value))
  const packedQty = selectedPackRow.value.isCoded ? shortBarPackForm.value.goodQty : Number(shortBarPackForm.value.packQty || 0)
  const packedDetails = selectedPackRow.value.isCoded ? getSelectedDetailsByRow(selectedPackRow.value) : []

  const newRecord = {
    id: Date.now().toString(),
    palletNo: shortBarPackForm.value.palletNo,
    qty: packedQty,
    team: shortBarPackForm.value.team,
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    sourceRowId: selectedPackRow.value.id,
    isCoded: selectedPackRow.value.isCoded,
    sourceRowSnapshot,
    packedDetails: JSON.parse(JSON.stringify(packedDetails))
  }
  packedRecords.value.unshift(newRecord)
```

- [ ] **Step 2: Implement `undoPack`**
Flesh out the `undoPack` function to restore the quantity and details, or resurrect the row if it was removed.

```typescript
const undoPack = (record: any) => {
  const targetRow = tableData.value.find(r => r.id === record.sourceRowId)
  
  if (targetRow) {
    // Row still exists, just restore qty and details
    targetRow.qty = Number(targetRow.qty) + record.qty
    if (record.isCoded) {
      targetRow.details.push(...record.packedDetails)
    }
  } else {
    // Row was removed, resurrect it
    const restoredRow = record.sourceRowSnapshot
    restoredRow.qty = record.qty
    if (record.isCoded) {
      restoredRow.details = record.packedDetails
    }
    // Insert back at the top or a specific position. Top is easiest for mock.
    tableData.value.unshift(restoredRow)
  }
  
  // Remove from packedRecords
  packedRecords.value = packedRecords.value.filter(r => r.id !== record.id)
  ElMessage.success('已撤销装托并退回数据')
}
```

- [ ] **Step 3: Test and Build**
Run `npm run build` to verify there are no type errors.