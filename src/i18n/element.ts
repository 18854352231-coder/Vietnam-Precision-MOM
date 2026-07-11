import { computed } from 'vue'
import type { Language } from 'element-plus/es/locale'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { locale } from './index'

const elementLocaleMap: Record<string, Language> = {
  'zh-CN': zhCn,
  'en-US': en,
  'vi-VN': en
}

export const elementLocale = computed(() => elementLocaleMap[locale.value] ?? en)
