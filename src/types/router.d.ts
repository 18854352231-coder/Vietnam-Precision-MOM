import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    titleKey?: string
    icon?: string
    ipqcView?: 'workbench' | 'tasks' | 'reviews' | 'records' | 'exceptions'
  }
}
