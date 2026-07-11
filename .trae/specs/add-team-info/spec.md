# 增加班组信息模块 Spec

## Why
目前系统的工作台模块（如挤压、锯切、熔炼等）需要记录或选择具体的班组进行上下班打卡，但系统“基础信息”中缺乏对“班组信息”的统一管理。为了便于车间规范化管理并统一班组名称及状态，需要在基础信息下新增班组信息的增删改查。

## What Changes
- 在 `src/views/system/basic/` 目录下新建 `Team.vue` 页面。
- 在 `Team.vue` 中实现班组列表展示、新增、编辑和删除等基本功能。
- 在 `src/router/index.ts` 路由配置文件中，为“基础信息”节点下添加 `Team` 的路由配置，以便可以在左侧菜单中访问。
- 在 `src/views/system/permission/Management.vue` 等权限配置树中补充对“班组信息”的展示（可选，确保功能完整）。

## Impact
- Affected specs: 基础信息维护功能增强
- Affected code:
  - `src/router/index.ts`
  - `src/views/system/basic/Team.vue` (新建)
  - `src/views/system/permission/Management.vue`

## ADDED Requirements
### Requirement: 班组信息管理
The system SHALL provide 班组信息（Team Management）功能：
- **WHEN** 用户进入“基础信息” -> “班组信息”
- **THEN** 系统显示班组列表，包括班组名称、班组编码、所属车间/部门、状态、备注等字段。
- **WHEN** 用户点击新增或编辑
- **THEN** 弹窗让用户输入班组数据并保存。
- **WHEN** 用户点击删除
- **THEN** 提供删除确认，确认后从列表中移除。
