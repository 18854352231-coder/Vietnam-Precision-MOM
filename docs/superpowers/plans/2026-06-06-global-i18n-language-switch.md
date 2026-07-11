# 全系统多语言与右上角语言切换 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为当前 Vue 3 + Element Plus 项目增加中文、英文、越南语三套前端展示文案，并在右上角提供全局语言切换能力。

**Architecture:** 使用 `vue-i18n` 作为国际化基础设施，在 `App.vue` 通过 `el-config-provider` 注入 Element Plus locale，在 `Layout.vue` 提供语言切换器，并将路由标题改为 `titleKey` + `title` 兼容模式。业务页面按模块把硬编码中文替换为翻译 key，同时对高风险状态文案采用映射函数而不是直接修改底层状态值。

**Tech Stack:** Vue 3、TypeScript、Vue Router、Element Plus、vue-i18n、Vite

---

## 文件结构

### 新增文件

- `D:/越南MOM/MOM/src/i18n/index.ts`：初始化 `vue-i18n`，暴露当前语言、切换方法、持久化逻辑
- `D:/越南MOM/MOM/src/i18n/element.ts`：维护 Element Plus locale 映射
- `D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts`：中文词典
- `D:/越南MOM/MOM/src/i18n/locales/en-US.ts`：英文词典
- `D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts`：越南语词典
- `D:/越南MOM/MOM/src/constants/language.ts`：语言枚举、标签、存储 key
- `D:/越南MOM/MOM/src/utils/statusI18n.ts`：中文历史状态值到翻译 key 的映射工具
- `D:/越南MOM/MOM/src/types/router.d.ts`：扩展 `RouteMeta`，声明 `titleKey`

### 需要修改的全局文件

- `D:/越南MOM/MOM/package.json`
- `D:/越南MOM/MOM/src/main.ts`
- `D:/越南MOM/MOM/src/App.vue`
- `D:/越南MOM/MOM/src/views/Layout.vue`
- `D:/越南MOM/MOM/src/router/index.ts`
- `D:/越南MOM/MOM/index.html`

### 需要修改的业务页面文件

- `D:/越南MOM/MOM/src/views/plan/MasterPlan.vue`
- `D:/越南MOM/MOM/src/views/system/master-data/Material.vue`
- `D:/越南MOM/MOM/src/views/system/process-docs/ProcessFiles.vue`
- `D:/越南MOM/MOM/src/views/casting/IssueScheduling.vue`
- `D:/越南MOM/MOM/src/views/casting/MeltingWorkbench.vue`
- `D:/越南MOM/MOM/src/views/casting/CastingWorkbench.vue`
- `D:/越南MOM/MOM/src/views/casting/HomogenizingWorkbench.vue`
- `D:/越南MOM/MOM/src/views/casting/SawingWorkbench.vue`
- `D:/越南MOM/MOM/src/views/extrusion/IssueScheduling.vue`
- `D:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue`
- `D:/越南MOM/MOM/src/views/extrusion/SawingWorkbench.vue`
- `D:/越南MOM/MOM/src/views/extrusion/AgingWorkbench.vue`
- `D:/越南MOM/MOM/src/views/extrusion/CuttingWorkbench.vue`
- `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`
- `D:/越南MOM/MOM/src/views/extrusion/PendingStorageList.vue`
- `D:/越南MOM/MOM/src/views/mold/MoldList.vue`
- `D:/越南MOM/MOM/src/views/mold/UsageDashboard.vue`
- `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessQualityInspection.vue`
- `D:/越南MOM/MOM/src/views/quality/ipqc/DefectiveControl.vue`
- `D:/越南MOM/MOM/src/views/quality/InspectionConfig.vue`
- `D:/越南MOM/MOM/src/views/quality/CNCSamplePreparation.vue`
- `D:/越南MOM/MOM/src/views/quality/LabTesting.vue`
- `D:/越南MOM/MOM/src/views/equipment/ToolingManagement.vue`
- `D:/越南MOM/MOM/src/views/equipment/FrameManagement.vue`
- `D:/越南MOM/MOM/src/views/reports/extrusion/ExtrusionReport.vue`
- `D:/越南MOM/MOM/src/views/reports/extrusion/CuttingReport.vue`
- `D:/越南MOM/MOM/src/views/reports/casting/CastingReport.vue`
- `D:/越南MOM/MOM/src/views/system/basic/Department.vue`
- `D:/越南MOM/MOM/src/views/system/basic/User.vue`
- `D:/越南MOM/MOM/src/views/system/basic/Position.vue`
- `D:/越南MOM/MOM/src/views/system/basic/Team.vue`
- `D:/越南MOM/MOM/src/views/system/permission/Role.vue`
- `D:/越南MOM/MOM/src/views/system/permission/Operation.vue`
- `D:/越南MOM/MOM/src/views/system/permission/Management.vue`
- `D:/越南MOM/MOM/src/views/system/logs/NormalLog.vue`
- `D:/越南MOM/MOM/src/views/system/logs/ExceptionLog.vue`
- `D:/越南MOM/MOM/src/views/system/logs/InterfaceLog.vue`
- `D:/越南MOM/MOM/src/views/system/code-rules/CodeRuleConfig.vue`

### 验证方式说明

当前仓库没有测试框架与单测脚本，`package.json` 仅提供：

- `npm run dev`
- `npm run build`
- `npm run preview`

因此本计划以以下方式替代单元测试：

- `npm install` 验证依赖安装
- `npm run build` 作为类型与构建总回归
- `GetDiagnostics` 检查关键文件语法/类型错误
- 手工验证语言切换、菜单、面包屑与典型页面

### Task 1: 搭建国际化基础设施

**Files:**
- Create: `D:/越南MOM/MOM/src/constants/language.ts`
- Create: `D:/越南MOM/MOM/src/i18n/index.ts`
- Create: `D:/越南MOM/MOM/src/i18n/element.ts`
- Create: `D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts`
- Create: `D:/越南MOM/MOM/src/i18n/locales/en-US.ts`
- Create: `D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts`
- Modify: `D:/越南MOM/MOM/package.json`

- [ ] **Step 1: 安装 `vue-i18n` 依赖**

Run:

```bash
npm install vue-i18n@9
```

Expected: `package.json` 的 `dependencies` 新增 `vue-i18n`

- [ ] **Step 2: 写入语言常量与本地存储 key**

```ts
// D:/越南MOM/MOM/src/constants/language.ts
export const LANGUAGE_STORAGE_KEY = 'mom-language'

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', label: '中文', shortLabel: '中' },
  { code: 'en-US', label: 'English', shortLabel: 'EN' },
  { code: 'vi-VN', label: 'Tiếng Việt', shortLabel: 'VI' }
] as const

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: AppLanguage = 'zh-CN'
```

- [ ] **Step 3: 创建三套词典骨架**

```ts
// D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts
export default {
  common: {
    appName: '越南MOM系统',
    actions: {
      search: '搜索',
      reset: '重置',
      confirm: '确认',
      cancel: '取消'
    }
  },
  layout: {
    home: '首页',
    language: '语言',
    user: {
      admin: '管理员',
      profile: '个人中心',
      logout: '退出登录'
    }
  },
  routes: {},
  pages: {},
  status: {}
}
```

```ts
// D:/越南MOM/MOM/src/i18n/locales/en-US.ts
export default {
  common: {
    appName: 'Vietnam MOM System',
    actions: {
      search: 'Search',
      reset: 'Reset',
      confirm: 'Confirm',
      cancel: 'Cancel'
    }
  },
  layout: {
    home: 'Home',
    language: 'Language',
    user: {
      admin: 'Administrator',
      profile: 'Profile',
      logout: 'Log out'
    }
  },
  routes: {},
  pages: {},
  status: {}
}
```

```ts
// D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts
export default {
  common: {
    appName: 'He thong MOM Viet Nam',
    actions: {
      search: 'Tim kiem',
      reset: 'Dat lai',
      confirm: 'Xac nhan',
      cancel: 'Huy'
    }
  },
  layout: {
    home: 'Trang chu',
    language: 'Ngon ngu',
    user: {
      admin: 'Quan tri vien',
      profile: 'Thong tin ca nhan',
      logout: 'Dang xuat'
    }
  },
  routes: {},
  pages: {},
  status: {}
}
```

- [ ] **Step 4: 初始化 `vue-i18n` 并暴露切换方法**

```ts
// D:/越南MOM/MOM/src/i18n/index.ts
import { computed, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, type AppLanguage } from '@/constants/language'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import viVN from './locales/vi-VN'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'vi-VN': viVN
}

const getInitialLanguage = (): AppLanguage => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null
  return SUPPORTED_LANGUAGES.some(item => item.code === saved) ? (saved as AppLanguage) : DEFAULT_LANGUAGE
}

export const locale = ref<AppLanguage>(getInitialLanguage())

export const i18n = createI18n({
  legacy: false,
  locale: locale.value,
  fallbackLocale: 'en-US',
  messages
})

export const setLanguage = (nextLocale: AppLanguage) => {
  locale.value = nextLocale
  i18n.global.locale.value = nextLocale
  localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale)
}

export const currentLanguageOption = computed(() =>
  SUPPORTED_LANGUAGES.find(item => item.code === locale.value) ?? SUPPORTED_LANGUAGES[0]
)
```

- [ ] **Step 5: 建立 Element Plus locale 映射**

```ts
// D:/越南MOM/MOM/src/i18n/element.ts
import { computed } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import type { Language } from 'element-plus/es/locale'
import { locale } from './index'

const elementLocaleMap: Record<string, Language> = {
  'zh-CN': zhCn,
  'en-US': en,
  'vi-VN': en
}

export const elementLocale = computed(() => elementLocaleMap[locale.value] ?? en)
```

- [ ] **Step 6: 安装依赖并确认基础设施无语法问题**

Run:

```bash
npm install
npm run build
```

Expected: 若构建失败，错误应只来自尚未开始的全局接线步骤；词典与基础设施文件本身不应存在语法错误。

- [ ] **Step 7: 提交基础设施代码**

```bash
git add package.json src/constants/language.ts src/i18n
git commit -m "feat: add i18n foundation"
```

### Task 2: 接入全局语言上下文与 Element Plus 语言

**Files:**
- Modify: `D:/越南MOM/MOM/src/main.ts`
- Modify: `D:/越南MOM/MOM/src/App.vue`

- [ ] **Step 1: 在应用入口注册 `vue-i18n`**

```ts
// D:/越南MOM/MOM/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/global.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus)

app.mount('#app')
```

- [ ] **Step 2: 用 `el-config-provider` 包裹根组件**

```vue
<!-- D:/越南MOM/MOM/src/App.vue -->
<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { elementLocale } from '@/i18n/element'
</script>

<style>
#app {
  height: 100vh;
}
</style>
```

- [ ] **Step 3: 构建验证全局接线**

Run:

```bash
npm run build
```

Expected: `main.ts`、`App.vue`、`i18n` 相关类型通过；若业务页面仍未改造，不应因接入 i18n 造成全局报错。

- [ ] **Step 4: 提交全局接线**

```bash
git add src/main.ts src/App.vue
git commit -m "feat: wire i18n into app shell"
```

### Task 3: 改造右上角语言切换器、菜单和面包屑

**Files:**
- Create: `D:/越南MOM/MOM/src/types/router.d.ts`
- Modify: `D:/越南MOM/MOM/src/views/Layout.vue`
- Modify: `D:/越南MOM/MOM/index.html`

- [ ] **Step 1: 扩展 `RouteMeta` 类型**

```ts
// D:/越南MOM/MOM/src/types/router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    titleKey?: string
    icon?: string
  }
}
```

- [ ] **Step 2: 在布局中引入语言切换逻辑与路由标题翻译**

```vue
<!-- D:/越南MOM/MOM/src/views/Layout.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/constants/language'
import { currentLanguageOption, setLanguage } from '@/i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const getRouteTitle = (meta?: { title?: string; titleKey?: string }) => {
  if (meta?.titleKey) return t(meta.titleKey)
  return meta?.title ?? ''
}

const systemRoutes = computed(() => {
  const root = router.options.routes.find(item => item.path === '/')
  return root?.children || []
})

const currentParentTitle = computed(() => {
  const parent = systemRoutes.value.find(item => route.path.startsWith('/' + item.path))
  return getRouteTitle(parent?.meta)
})

const currentTitle = computed(() => getRouteTitle(route.meta))

const handleLanguageChange = (language: string | number | object) => {
  setLanguage(language as AppLanguage)
}
</script>
```

- [ ] **Step 3: 在布局模板中增加语言切换器并替换公共文案**

```vue
<!-- D:/越南MOM/MOM/src/views/Layout.vue -->
<div class="logo">
  <el-icon :size="24" color="#409EFF"><Box /></el-icon>
  <span>{{ t('common.appName') }}</span>
</div>

<el-breadcrumb separator="/">
  <el-breadcrumb-item :to="{ path: '/' }">{{ t('layout.home') }}</el-breadcrumb-item>
  <el-breadcrumb-item>{{ currentParentTitle }}</el-breadcrumb-item>
  <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
</el-breadcrumb>

<div class="header-right">
  <el-dropdown @command="handleLanguageChange">
    <span class="language-switcher">
      {{ currentLanguageOption.shortLabel }} <el-icon><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in SUPPORTED_LANGUAGES"
          :key="item.code"
          :command="item.code"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <el-dropdown>
    <span class="user-info">
      {{ t('layout.user.admin') }} <el-icon><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>{{ t('layout.user.profile') }}</el-dropdown-item>
        <el-dropdown-item divided>{{ t('layout.user.logout') }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</div>
```

- [ ] **Step 4: 为语言切换器补样式并同步页面语言标识**

```vue
<!-- D:/越南MOM/MOM/src/views/Layout.vue -->
<style scoped>
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-switcher,
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.language-switcher:hover,
.user-info:hover {
  background: var(--bg-tertiary);
}
</style>
```

```html
<!-- D:/越南MOM/MOM/index.html -->
<html lang="zh-CN">
```

同时在语言切换时加一行：

```ts
document.documentElement.setAttribute('lang', nextLocale)
```

- [ ] **Step 5: 运行诊断与构建**

Run:

```bash
npm run build
```

Expected: 右上角语言切换器相关类型与模板通过编译。

- [ ] **Step 6: 提交布局层改造**

```bash
git add src/views/Layout.vue src/types/router.d.ts index.html
git commit -m "feat: add global language switcher"
```

### Task 4: 路由标题与通用状态映射国际化

**Files:**
- Create: `D:/越南MOM/MOM/src/utils/statusI18n.ts`
- Modify: `D:/越南MOM/MOM/src/router/index.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/en-US.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts`

- [ ] **Step 1: 为全部路由补充 `titleKey`，保留原 `title` 兜底**

```ts
// D:/越南MOM/MOM/src/router/index.ts
{
  path: 'quality',
  name: 'QualityManagement',
  meta: { title: '质量管理', titleKey: 'routes.quality.root', icon: 'Aim' },
  component: RouterViewContainer
},
{
  path: 'process-inspection',
  name: 'ProcessInspection',
  component: () => import('@/views/quality/ipqc/ProcessInspection.vue'),
  meta: { title: '制程检验', titleKey: 'routes.quality.ipqc.processInspection' }
}
```

按同样模式为 `src/router/index.ts` 中所有路由补齐 `titleKey`。

- [ ] **Step 2: 在三套词典中补全 `routes` 字典**

```ts
// D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts
routes: {
  plan: { masterPlan: '主计划' },
  process: {
    root: '工艺管理',
    material: '物料主数据',
    processFiles: '工艺文件'
  },
  quality: {
    root: '质量管理',
    ipqc: {
      root: 'IPQC',
      processInspection: '制程检验',
      processQualityInspection: '工序质检'
    }
  }
}
```

英文与越南语文件使用完全相同的 key 结构，值替换为对应翻译。

- [ ] **Step 3: 新建历史状态值映射工具，避免中文状态直接进入业务逻辑**

```ts
// D:/越南MOM/MOM/src/utils/statusI18n.ts
export const statusKeyMap: Record<string, string> = {
  已完成: 'status.completed',
  未完成: 'status.pending',
  待班长审核: 'status.pendingLeaderReview',
  空闲中: 'status.idle',
  升温中: 'status.heating',
  保温中: 'status.holding',
  合格: 'status.pass',
  不合格: 'status.fail'
}

export const getStatusKey = (value: string) => statusKeyMap[value] ?? value
```

- [ ] **Step 4: 在词典中补全公共状态文案**

```ts
// D:/越南MOM/MOM/src/i18n/locales/en-US.ts
status: {
  completed: 'Completed',
  pending: 'Pending',
  pendingLeaderReview: 'Pending leader review',
  idle: 'Idle',
  heating: 'Heating',
  holding: 'Holding',
  pass: 'Pass',
  fail: 'Fail'
}
```

- [ ] **Step 5: 构建并验证菜单、面包屑是否可翻译**

Run:

```bash
npm run build
```

Expected: 路由对象仍可被 Vue Router 正常读取，且 `Layout.vue` 通过 `titleKey` 能得到标题。

- [ ] **Step 6: 提交路由与状态映射改造**

```bash
git add src/router/index.ts src/utils/statusI18n.ts src/i18n/locales
git commit -m "feat: localize route titles and shared status labels"
```

### Task 5: 完成生产、模具、设备、工艺模块国际化

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/plan/MasterPlan.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/master-data/Material.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/process-docs/ProcessFiles.vue`
- Modify: `D:/越南MOM/MOM/src/views/casting/IssueScheduling.vue`
- Modify: `D:/越南MOM/MOM/src/views/casting/MeltingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/casting/CastingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/casting/HomogenizingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/casting/SawingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/IssueScheduling.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/ExtrusionWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/SawingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/AgingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/CuttingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PackagingWorkbench.vue`
- Modify: `D:/越南MOM/MOM/src/views/extrusion/PendingStorageList.vue`
- Modify: `D:/越南MOM/MOM/src/views/mold/MoldList.vue`
- Modify: `D:/越南MOM/MOM/src/views/mold/UsageDashboard.vue`
- Modify: `D:/越南MOM/MOM/src/views/equipment/ToolingManagement.vue`
- Modify: `D:/越南MOM/MOM/src/views/equipment/FrameManagement.vue`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/en-US.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts`

- [ ] **Step 1: 为上述页面统一接入 `useI18n`**

```ts
// 页面 script setup 统一模式
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
```

- [ ] **Step 2: 替换页面标题、按钮、表头、空态和消息提示**

```vue
<!-- 示例：D:/越南MOM/MOM/src/views/system/process-docs/ProcessFiles.vue -->
<el-button size="small" type="primary" link @click="handleView(scope.row)">
  {{ t('pages.processFiles.actions.viewPdf') }}
</el-button>
```

```ts
ElMessage.success(t('pages.processFiles.messages.uploadSuccess'))
```

- [ ] **Step 3: 将温度/状态类展示改为映射 key**

```vue
<!-- 示例：D:/越南MOM/MOM/src/views/extrusion/AgingWorkbench.vue -->
<el-tag :type="getStatusType(row.status)">
  {{ t(getStatusKey(row.status)) }}
</el-tag>
```

- [ ] **Step 4: 在三套词典中补全这些页面的 `pages.*` 文案**

```ts
// D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts
pages: {
  processFiles: {
    actions: {
      viewPdf: '查看PDF'
    },
    messages: {
      uploadSuccess: '上传成功'
    }
  },
  extrusionWorkbench: {},
  agingWorkbench: {},
  cuttingWorkbench: {}
}
```

- [ ] **Step 5: 构建并手工检查生产相关典型页面**

Run:

```bash
npm run build
```

Manual check:

```text
1. 打开 挤压工作台
2. 切换为 English
3. 确认卡片标题、表头、按钮和状态标签更新
4. 切换为 Tiếng Việt
5. 确认页面不出现未翻译 key
```

- [ ] **Step 6: 提交生产与工艺模块国际化**

```bash
git add src/views/plan src/views/system/master-data src/views/system/process-docs src/views/casting src/views/extrusion src/views/mold src/views/equipment src/i18n/locales
git commit -m "feat: localize production and process modules"
```

### Task 6: 完成质量管理模块国际化

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/ProcessQualityInspection.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/ipqc/DefectiveControl.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/InspectionConfig.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/CNCSamplePreparation.vue`
- Modify: `D:/越南MOM/MOM/src/views/quality/LabTesting.vue`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/en-US.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts`

- [ ] **Step 1: 替换质量模块页签、按钮、弹窗标题和搜索区文案**

```vue
<!-- 示例：D:/越南MOM/MOM/src/views/quality/ipqc/ProcessInspection.vue -->
<el-tab-pane :label="t('pages.processInspection.tabs.extrusion')" name="挤压" />
<el-button link type="primary" size="small">{{ t('pages.processInspection.actions.inspect') }}</el-button>
```

- [ ] **Step 2: 将质量模块的状态展示收口到 `getStatusKey`**

```vue
<el-tag :type="row.result === '合格' ? 'success' : 'danger'">
  {{ t(getStatusKey(row.result)) }}
</el-tag>
```

```vue
<el-tag :type="row.completionStatus === '已完成' ? 'success' : 'info'">
  {{ t(getStatusKey(row.completionStatus)) }}
</el-tag>
```

- [ ] **Step 3: 替换 `ElMessage`、`ElMessageBox` 提示文本**

```ts
ElMessage.success(t('pages.labTesting.messages.registerSuccess'))
ElMessage.warning(t('pages.cncSample.messages.sampleNotFound'))
```

- [ ] **Step 4: 补全质量模块词典**

```ts
// D:/越南MOM/MOM/src/i18n/locales/en-US.ts
pages: {
  processInspection: {
    tabs: {
      extrusion: 'Extrusion IPQC',
      aging: 'Aging IPQC',
      cuttingFeed: 'Cutting Feed IPQC',
      cutting: 'Cutting IPQC',
      prePackaging: 'Pre-packaging IPQC'
    },
    actions: {
      inspect: 'Inspect',
      view: 'View'
    }
  },
  labTesting: {},
  cncSample: {}
}
```

- [ ] **Step 5: 构建并重点回归两张复杂页面**

Run:

```bash
npm run build
```

Manual check:

```text
1. 打开 CNC制样&收样
2. 切换三种语言并检查页签、字段、按钮
3. 打开 实验室 页面
4. 检查待收样、收样记录、检测登记三处文案是否同步变化
5. 打开 制程检验 页面，检查 tabs、状态标签和弹窗文案
```

- [ ] **Step 6: 提交质量模块国际化**

```bash
git add src/views/quality src/i18n/locales
git commit -m "feat: localize quality management modules"
```

### Task 7: 完成报表、系统设置与公共管理页面国际化

**Files:**
- Modify: `D:/越南MOM/MOM/src/views/reports/extrusion/ExtrusionReport.vue`
- Modify: `D:/越南MOM/MOM/src/views/reports/extrusion/CuttingReport.vue`
- Modify: `D:/越南MOM/MOM/src/views/reports/casting/CastingReport.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/basic/Department.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/basic/User.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/basic/Position.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/basic/Team.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/permission/Role.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/permission/Operation.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/permission/Management.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/logs/NormalLog.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/logs/ExceptionLog.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/logs/InterfaceLog.vue`
- Modify: `D:/越南MOM/MOM/src/views/system/code-rules/CodeRuleConfig.vue`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/en-US.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts`

- [ ] **Step 1: 按同样模式接入 `useI18n` 并替换静态文案**

```vue
<!-- 示例：D:/越南MOM/MOM/src/views/system/basic/Department.vue -->
<span class="title">{{ t('pages.department.title') }}</span>
<el-button type="primary">{{ t('common.actions.confirm') }}</el-button>
```

- [ ] **Step 2: 补齐报表、系统设置和日志页面词典**

```ts
// D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts
pages: {
  department: { title: 'Thong tin phong ban' },
  user: { title: 'Thong tin nguoi dung' },
  role: { title: 'Quan ly vai tro' },
  normalLog: { title: 'Nhat ky thong thuong' }
}
```

- [ ] **Step 3: 构建并检查系统设置与日志页面**

Run:

```bash
npm run build
```

Manual check:

```text
1. 打开 系统设置 > 基础信息 > 部门信息
2. 切换为 English 和 Tiếng Việt
3. 确认表格、按钮、弹窗全部切换
4. 打开 正常日志 / 异常日志 / 接口日志
5. 确认筛选项与表头可翻译
```

- [ ] **Step 4: 提交管理模块国际化**

```bash
git add src/views/reports src/views/system src/i18n/locales
git commit -m "feat: localize reports and system settings modules"
```

### Task 8: 全量回归与收尾

**Files:**
- Modify: `D:/越南MOM/MOM/src/i18n/locales/zh-CN.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/en-US.ts`
- Modify: `D:/越南MOM/MOM/src/i18n/locales/vi-VN.ts`
- Modify: `D:/越南MOM/MOM/src/views/**/*.vue`（仅修正遗漏 key 或残余硬编码）

- [ ] **Step 1: 全局搜索残余硬编码中文**

Run:

```bash
rg "首页|管理员|查看PDF|搜索|重置|确认|取消|上传成功|已完成|未完成" D:/越南MOM/MOM/src/views
```

Expected: 结果只剩业务数据或确认保留的中文状态原始值，不应剩余可见静态文案。

- [ ] **Step 2: 修复缺失词典与回退显示**

```ts
// 发现缺 key 时补齐对应词典
pages: {
  pendingStorageList: {
    title: '待入库清单'
  }
}
```

- [ ] **Step 3: 执行全量构建**

Run:

```bash
npm run build
```

Expected: 构建通过，`dist` 生成成功。

- [ ] **Step 4: 做最终人工回归**

Manual check:

```text
1. 进入任意业务页面，右上角切换为 English
2. 刷新页面，确认语言保持 English
3. 切换为 Tiếng Việt，确认菜单与面包屑同步更新
4. 依次检查 工艺文件、挤压工作台、实验室、制程检验、部门信息
5. 确认不存在原样显示的 i18n key
```

- [ ] **Step 5: 提交最终收尾**

```bash
git add src package.json
git commit -m "feat: add global multilingual support"
```

## 自检

- 规格覆盖：已覆盖语言基础设施、右上角切换、路由标题、Element Plus 联动、状态兼容、全系统页面改造和验证要求。
- 占位检查：计划中没有 `TODO`、`TBD` 或“后续再看”类占位语句。
- 一致性检查：统一使用 `titleKey`、`setLanguage`、`getStatusKey`、`SUPPORTED_LANGUAGES` 这组命名，不在任务间切换概念。

