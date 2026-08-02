<template>
  <el-container class="layout-container">
    <el-aside width="240px">
      <div class="logo">
        <img :src="appLogo" alt="app logo" class="logo-icon" />
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        unique-opened
      >
        <template v-for="route in systemRoutes" :key="route.path">
          <el-sub-menu v-if="route.children" :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon"><component :is="route.meta.icon" /></el-icon>
              <span>{{ getRouteTitle(route.meta) }}</span>
            </template>
            <template v-for="child in route.children" :key="child.path">
              <el-sub-menu v-if="child.children" :index="joinPaths(route.path, child.path)">
                <template #title>
                  <span>{{ getRouteTitle(child.meta) }}</span>
                </template>
                <template v-for="leaf in child.children" :key="leaf.path">
                  <el-sub-menu v-if="leaf.children" :index="joinPaths(route.path, child.path, leaf.path)">
                    <template #title>
                      <span>{{ getRouteTitle(leaf.meta) }}</span>
                    </template>
                    <el-menu-item
                      v-for="subLeaf in leaf.children"
                      :key="subLeaf.path"
                      :index="joinPaths(route.path, child.path, leaf.path, subLeaf.path)"
                    >
                      {{ getRouteTitle(subLeaf.meta) }}
                    </el-menu-item>
                  </el-sub-menu>
                  <el-menu-item
                    v-else
                    :index="joinPaths(route.path, child.path, leaf.path)"
                  >
                    {{ getRouteTitle(leaf.meta) }}
                  </el-menu-item>
                </template>
              </el-sub-menu>
              <el-menu-item v-else :index="joinPaths(route.path, child.path)">
                {{ getRouteTitle(child.meta) }}
              </el-menu-item>
            </template>
          </el-sub-menu>
          <el-menu-item v-else :index="'/' + route.path">
            <el-icon v-if="route.meta?.icon"><component :is="route.meta.icon" /></el-icon>
            <template #title>{{ getRouteTitle(route.meta) }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">{{ t('layout.home') }}</el-breadcrumb-item>
            <el-breadcrumb-item
              v-for="(match, index) in matchedRoutes"
              :key="match.path"
              :to="index < matchedRoutes.length - 1 ? { path: getClickablePath(match) } : undefined"
            >
              {{ getRouteTitle(match.meta) }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown :key="locale" @command="handleLanguageChange">
            <span class="language-switcher">
              {{ currentLanguageLabel }} <el-icon><ArrowDown /></el-icon>
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
      </el-header>
      
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/constants/language'
import { locale, setLanguage } from '@/i18n'
import appLogo from '@/assets/logo-wide.png'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const currentLanguageLabel = computed(() =>
  SUPPORTED_LANGUAGES.find(item => item.code === locale.value)?.label ?? SUPPORTED_LANGUAGES[0].label
)

const getRouteTitle = (meta?: { title?: string; titleKey?: string }) => {
  if (meta?.titleKey) return t(meta.titleKey)
  return meta?.title ?? ''
}

const filterVisibleRoutes = (routes: any[]): any[] =>
  routes
    .filter(routeRecord => !routeRecord.meta?.hidden)
    .map(routeRecord => ({
      ...routeRecord,
      children: routeRecord.children
        ? filterVisibleRoutes(routeRecord.children)
        : undefined
    }))

const systemRoutes = computed(() => {
  const root = router.options.routes.find(r => r.path === '/')
  return filterVisibleRoutes(root?.children || [])
})

const activeMenu = computed(() => route.path)

const matchedRoutes = computed(() => {
  return route.matched.filter(m => m.path !== '/' && (m.meta?.title || m.meta?.titleKey))
})

const getFirstChildPath = (routeRecord: any, basePath = ''): string => {
  // Fix multiple slashes
  const currentPath = basePath ? `${basePath}/${routeRecord.path}`.replace(/\/+/g, '/') : `/${routeRecord.path}`.replace(/\/+/g, '/')
  if (routeRecord.redirect) return typeof routeRecord.redirect === 'string' ? routeRecord.redirect : currentPath
  if (routeRecord.children && routeRecord.children.length > 0) {
    return getFirstChildPath(routeRecord.children[0], currentPath)
  }
  return currentPath
}

const getClickablePath = (match: any): string => {
  if (match.redirect) return typeof match.redirect === 'string' ? match.redirect : match.path
  if (match.children && match.children.length > 0) {
    return getFirstChildPath(match.children[0], match.path)
  }
  return match.path
}

const handleLanguageChange = (language: string | number | object) => {
  setLanguage(language as AppLanguage)
}

const joinPaths = (...parts: string[]) =>
  '/' + parts.map(p => String(p).replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/')
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: var(--bg-primary);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--border-subtle);
  gap: 12px;
  color: var(--text-primary);
}

.logo-icon {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.el-aside {
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
}

.el-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

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

.el-main {
  background-color: var(--bg-primary);
  padding: 0;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
