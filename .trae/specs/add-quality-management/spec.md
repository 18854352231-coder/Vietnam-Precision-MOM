# 质量管理模块 Spec

## Why
目前系统缺少质量管理相关的模块，为了完善制造执行系统的功能，需要新增一个独立的质量管理模块，用于处理生产过程中的质量控制、样品的流转跟踪以及实验室检测数据的录入和管理。

## What Changes
- 在侧边栏导航中新增顶级菜单「质量管理」(Quality Management)
- 新增子菜单「IPQC」(过程检验)，用于记录生产过程中的巡检、抽检数据
- 新增子菜单「样品流转」(Sample Circulation)，用于跟踪取样后样品的流转状态
- 新增子菜单「实验室检测」(Laboratory Testing)，用于录入样品的最终检测结果
- 配置对应的路由结构
- 完善角色权限树以包含质量管理模块

## Impact
- Affected specs: 无
- Affected code: `src/router/index.ts`, `src/views/system/permission/Management.vue`, `src/views/system/permission/Operation.vue`, 新增 `src/views/quality/IPQC.vue`, `src/views/quality/SampleCirculation.vue`, `src/views/quality/LabTesting.vue`

## ADDED Requirements
### Requirement: 新增质量管理模块
系统必须在侧边栏提供「质量管理」模块入口，包含三个子页面：IPQC、样品流转、实验室检测。

#### Scenario: 导航至质量管理页面
- **WHEN** 用户点击侧边栏「质量管理」下的「IPQC」
- **THEN** 页面应正确跳转至 IPQC 页面并展示对应内容