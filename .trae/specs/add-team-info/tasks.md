# Tasks
- [x] Task 1: 创建 `src/views/system/basic/Team.vue` 页面组件。
  - [x] SubTask 1.1: 编写 `<template>`，包含搜索栏、新增按钮、数据表格以及新增/编辑的弹窗。
  - [x] SubTask 1.2: 编写 `<script setup>`，定义班组字段（名称、编码、车间、状态等），并使用 mock 数据实现列表展示及增删改查逻辑。
  - [x] SubTask 1.3: 编写 `<style scoped>`，保持与 `Department.vue` 等现有的系统设置风格一致。
- [x] Task 2: 修改 `src/router/index.ts` 路由配置，在 `settings/basic` 子路由中添加 `Team`（班组信息）节点。
- [x] Task 3: 修改 `src/views/system/permission/Management.vue` 等带有菜单结构模拟数据的页面，加入“班组信息”以便权限配置展示一致。
