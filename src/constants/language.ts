export const LANGUAGE_STORAGE_KEY = 'mom-language'

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', label: '中文', shortLabel: '中' },
  { code: 'en-US', label: 'English', shortLabel: 'EN' },
  { code: 'vi-VN', label: 'Tiếng Việt', shortLabel: 'VI' }
] as const

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: AppLanguage = 'zh-CN'
