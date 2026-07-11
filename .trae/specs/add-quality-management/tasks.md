# Tasks
- [x] Task 1: 创建质量管理模块的 Vue 组件视图
  - [x] SubTask 1.1: 创建 `src/views/quality/IPQC.vue` 包含基础的表格和查询结构
  - [x] SubTask 1.2: 创建 `src/views/quality/SampleCirculation.vue` 包含基础的表格和查询结构
  - [x] SubTask 1.3: 创建 `src/views/quality/LabTesting.vue` 包含基础的表格和查询结构
- [x] Task 2: 配置质量管理模块路由
  - [x] SubTask 2.1: 在 `src/router/index.ts` 中引入并配置 `quality` 相关的路由节点
- [x] Task 3: 更新系统权限树
  - [x] SubTask 3.1: 在 `src/views/system/permission/Management.vue` 的菜单树中添加质量管理节点
  - [x] SubTask 3.2: 在 `src/views/system/permission/Operation.vue` 的操作树中添加质量管理节点

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2