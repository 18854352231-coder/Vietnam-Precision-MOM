<template>
  <el-container class="layout-container">
    <el-aside width="240px">
      <div class="logo">
        <el-icon :size="24" color="#409EFF"><Box /></el-icon>
        <span>{{ t('common.appName') }}</span>
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
            <el-breadcrumb-item>{{ currentParentTitle }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
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

const systemRoutes = computed(() => {
  const root = router.options.routes.find(r => r.path === '/')
  return root?.children || []
})

const activeMenu = computed(() => route.path)

const currentParentTitle = computed(() => {
  const parent = systemRoutes.value.find(r => route.path.startsWith('/' + r.path))
  return getRouteTitle(parent?.meta)
})

const currentTitle = computed(() => getRouteTitle(route.meta))

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
