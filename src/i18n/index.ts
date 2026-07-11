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
  document.documentElement.setAttribute('lang', nextLocale)
}

document.documentElement.setAttribute('lang', locale.value)

export const currentLanguageOption = computed(() =>
  SUPPORTED_LANGUAGES.find(item => item.code === locale.value) ?? SUPPORTED_LANGUAGES[0]
)
