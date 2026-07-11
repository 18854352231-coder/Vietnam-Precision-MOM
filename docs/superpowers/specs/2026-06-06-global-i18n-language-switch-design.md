# 全系统多语言与右上角语言切换设计

## 背景

当前项目是中文单语言实现，菜单、面包屑、右上角用户区、路由标题以及绝大多数业务页面文案均为硬编码中文。用户要求增加英文和越南语版本，并且能够在右上角进行全局语言切换。

结合现有代码结构：

- 全局布局位于 [Layout.vue](file:///D:/越南MOM/MOM/src/views/Layout.vue)
- 应用入口位于 [main.ts](file:///D:/越南MOM/MOM/src/main.ts)
- 路由与菜单标题集中定义在 [index.ts](file:///D:/越南MOM/MOM/src/router/index.ts)

这意味着多语言改造应以全局布局和路由元信息为主入口，逐步下沉到各业务页面。

## 目标

- 增加三种语言：
  - 简体中文
  - English
  - Tiếng Việt
- 在右上角增加全局语言切换器
- 菜单、面包屑、公共操作区支持实时切换
- 所有业务页面的静态文案支持实时切换
- 当前语言持久化到本地，刷新后保持不变
- Element Plus 组件语言跟随切换

## 非目标

- 不处理后端接口返回数据的自动翻译
- 不翻译图片、二维码、导出文件中的中文内容
- 不在本次改造中引入按页面动态拉取翻译文件
- 不处理数据库枚举值或接口字段本身的多语言化，仅处理前端展示层

## 方案对比

### 方案 A：接入 `vue-i18n` 并做正式国际化改造

推荐采用该方案。

优点：

- 与 Vue 3 生态匹配，维护成本最低
- 支持全局 `t()`、组件内组合式调用、路由标题翻译
- 后续新增语言和扩页面最稳定
- 易于和 Element Plus locale 联动

缺点：

- 首次改造文件较多
- 需要统一梳理现有硬编码文案

### 方案 B：自定义字典对象

优点：

- 初始接入快
- 不新增依赖

缺点：

- 缺少成熟的国际化能力
- 全系统页面一旦增多，维护会快速失控
- 路由标题、组件层级和公共方法复用都不如 `vue-i18n`

### 方案 C：只改框架层，不改业务页面

优点：

- 工作量小

缺点：

- 与用户要求的“全系统页面”不一致
- 体验不完整

## 推荐方案

采用方案 A：正式接入 `vue-i18n`，分三层完成全系统国际化。

### 第一层：国际化基础设施

- 在项目中安装并注册 `vue-i18n`
- 建立三套语言资源文件
- 建立语言状态管理与持久化工具
- 将 Element Plus locale 与当前语言绑定

### 第二层：框架层国际化

- 改造 [Layout.vue](file:///D:/越南MOM/MOM/src/views/Layout.vue) 右上角语言切换器
- 改造菜单显示逻辑
- 改造面包屑显示逻辑
- 改造用户下拉菜单和系统公共文案
- 改造路由 `meta.title` 为可翻译 key

### 第三层：业务页面国际化

- 将各业务页面中的静态中文替换为翻译 key
- 对状态标签、表头、按钮、弹窗标题、搜索项、空态文案统一收口
- 对少量用于逻辑判断的中文状态，拆分为“内部状态码 + 展示文案”

## 目录设计

建议新增以下目录与文件：

- `src/i18n/index.ts`
- `src/i18n/locales/zh-CN.ts`
- `src/i18n/locales/en-US.ts`
- `src/i18n/locales/vi-VN.ts`
- `src/i18n/element.ts`
- `src/constants/language.ts`

其中：

- `index.ts` 负责初始化 `vue-i18n`
- `locales/*` 存放语言词典
- `element.ts` 负责 Element Plus locale 映射
- `language.ts` 负责语言枚举、标签、存储 key 等常量

## 数据结构设计

### 语言枚举

统一使用以下语言码：

- `zh-CN`
- `en-US`
- `vi-VN`

### 语言配置

每种语言至少包含：

- `code`
- `label`
- `shortLabel`

示例语义：

- `zh-CN` -> 中文 / 中
- `en-US` -> English / EN
- `vi-VN` -> Tiếng Việt / VI

### 词典分层

词典建议按领域分组，避免单文件过大：

- `common`
- `layout`
- `routes`
- `pages`
- `status`

例如：

- `common.actions.search`
- `layout.user.profile`
- `routes.quality.ipqc.processInspection`
- `pages.labTesting.tabs.pendingReceive`
- `status.completed`

## 路由与菜单设计

### 现状

当前 [index.ts](file:///D:/越南MOM/MOM/src/router/index.ts) 中的 `meta.title` 直接写中文，菜单和面包屑也是直接读取这个字段显示。

### 改造方式

将路由元信息从：

- `meta: { title: '质量管理' }`

改为：

- `meta: { titleKey: 'routes.quality.root' }`

菜单和面包屑渲染时，不再直接使用 `meta.title`，而改为：

- 优先读取 `meta.titleKey`
- 通过 `t(meta.titleKey)` 获取当前语言文案
- 若历史页面仍保留 `title`，则作为临时兜底值

### 兼容策略

为降低一次性修改风险，过渡期允许：

- 同时存在 `meta.title` 和 `meta.titleKey`
- 菜单与面包屑优先取 `titleKey`
- 若缺失则退回 `title`

这样可以边改路由边验证，不会因为单个页面未迁移导致菜单空白。

## 右上角语言切换器设计

语言切换器放在 [Layout.vue](file:///D:/越南MOM/MOM/src/views/Layout.vue) 的 `header-right` 区域，位于用户菜单左侧。

推荐交互：

- 使用 `el-dropdown` 或 `el-select`
- 默认显示当前语言短标识，如 `中 / EN / VI`
- 下拉项显示完整语言名称
- 切换后立即更新：
  - 菜单
  - 面包屑
  - 当前页面静态文案
  - Element Plus 内置组件语言

推荐顺序：

1. 中文
2. English
3. Tiếng Việt

## Element Plus 语言联动

在 [main.ts](file:///D:/越南MOM/MOM/src/main.ts) 当前直接 `app.use(ElementPlus)` 的基础上，需要改为基于当前语言提供 locale。

设计要求：

- 中文使用 `zh-cn`
- 英文使用 `en`
- 越南语若 Element Plus 无官方完整 locale，则采用：
  - 优先使用社区可用 locale
  - 若不可用，则回退英文 locale，同时业务文案仍显示越南语

这样可以保证：

- 日期选择器、分页器、确认框等组件有基础语言适配
- 即便缺少完整越南语包，也不会阻塞全系统多语言上线

## 页面文案改造策略

### 改造范围

覆盖所有业务页面中的以下静态文案：

- 页面标题
- 搜索项标签
- 表格表头
- 按钮文字
- 弹窗标题
- 表单标签
- 状态标签
- 空态提示
- 操作提示文案

### 迁移规则

- 模板中的直接中文改为 `t('...')`
- `script setup` 中的提示文案改为 `t('...')`
- `ElMessage`、`ElMessageBox`、`ElNotification` 统一通过 `t()` 取值
- 复用频率高的文案优先放到 `common`
- 页面专属文案放到 `pages.<pageName>`

## 状态值与业务逻辑设计

这是本次改造的重点风险点。

当前项目中大量状态值既承担展示职责，又直接用于逻辑判断，例如：

- `已完成`
- `未完成`
- `待班长审核`
- `空闲中`
- `升温中`

若直接把这些中文值翻译成英文或越南语并写回原字段，会破坏现有逻辑。

### 推荐改造方式

将状态拆为两层：

- 内部状态码：固定英文或固定标识，用于逻辑判断
- 展示文案：通过 `t()` 根据状态码映射成当前语言

例如：

- `completionStatus = 'completed'`
- `getCompletionStatusLabel('completed') -> 已完成 / Completed / Hoan thanh`

### 过渡策略

考虑到现有页面很多，允许首期采用兼容方案：

- 数据仍保留原中文状态值
- 新增统一映射方法，把中文状态值映射为翻译 key
- 中期再逐步把关键页面状态切换为状态码

这样可以先完成全系统语言切换，再逐步清理历史状态耦合。

## 持久化策略

当前语言保存在 `localStorage`，例如：

- key：`mom-language`

加载顺序：

1. 优先读取本地存储
2. 若不存在，则默认 `zh-CN`

切换语言后：

- 更新 `vue-i18n` 当前 locale
- 更新 Element Plus locale
- 写入 `localStorage`
- 触发界面响应式刷新

## 实施顺序

建议按以下顺序实施：

1. 安装并注册 `vue-i18n`
2. 创建语言资源目录与基础词典
3. 完成右上角语言切换器
4. 改造菜单、面包屑、系统名称、用户区
5. 改造路由 `meta.title` 为 `titleKey`
6. 按模块批量替换业务页面文案
7. 统一收口提示类文案
8. 逐步清理高风险中文状态逻辑

## 验证要点

- 右上角语言切换器是否可正常显示和切换
- 切换后菜单标题是否立即更新
- 面包屑是否同步更新
- 当前页面静态文案是否同步更新
- 页面刷新后是否保留用户上次选择的语言
- Element Plus 组件基础文案是否同步更新
- 未迁移完全的页面是否能通过兜底逻辑正常显示
- 高风险状态字段页面是否未因翻译导致逻辑异常

## 风险与规避

### 风险 1：全系统文件数量多

规避：

- 先搭框架，再按模块推进
- 使用兜底逻辑避免一次改不完时页面失效

### 风险 2：中文状态同时用于展示与逻辑判断

规避：

- 首期不直接翻译原始状态值
- 通过映射函数输出展示文案
- 后续逐步切为状态码

### 风险 3：Element Plus 越南语支持不完整

规避：

- 业务文案先完整支持越南语
- 内置组件先回退英文 locale，确保可用性

### 风险 4：路由标题改造后菜单空白

规避：

- `titleKey` + `title` 双字段过渡
- 未迁移页面继续使用原 `title`

## 涉及文件

- [main.ts](file:///D:/越南MOM/MOM/src/main.ts)
- [Layout.vue](file:///D:/越南MOM/MOM/src/views/Layout.vue)
- [index.ts](file:///D:/越南MOM/MOM/src/router/index.ts)
- 以及 `src/views` 下各业务页面文件

## 实施边界

本次设计是全系统前端展示层的国际化改造，不涉及后端接口、数据库、权限模型或业务流程重构。若后续需要按角色、地区或租户动态加载不同语言包，再另行设计。
