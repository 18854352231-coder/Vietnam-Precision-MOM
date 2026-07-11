import { nextTick, onBeforeUnmount, onMounted, onUpdated, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { locale } from '@/i18n'
import { buildLiteralEntries, translateLiteralValue } from '@/utils/taskLiteralTranslator'

const TEXT_NODE = 3
const ATTRIBUTES_TO_TRANSLATE = ['placeholder', 'title', 'aria-label']

const originalTextMap = new WeakMap<Text, string>()
const lastTranslatedTextMap = new WeakMap<Text, string>()
const originalAttrMap = new WeakMap<Element, Record<string, string>>()
const lastTranslatedAttrMap = new WeakMap<Element, Record<string, string>>()

export const useTaskLiteralDomI18n = () => {
  const { tm } = useI18n()
  let observer: MutationObserver | null = null
  let scheduled = false

  const scan = () => {
    scheduled = false

    if (typeof document === 'undefined') {
      return
    }

    const entries = buildLiteralEntries(tm('literal'))
    if (!entries.length) {
      return
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let currentNode = walker.nextNode()

    while (currentNode) {
      if (currentNode.nodeType === TEXT_NODE) {
        const textNode = currentNode as Text
        const current = textNode.nodeValue ?? ''
        
        let original = originalTextMap.get(textNode)
        
        // If the node's text was changed by Vue (not by our last translation)
        if (original === undefined || (lastTranslatedTextMap.has(textNode) && lastTranslatedTextMap.get(textNode) !== current)) {
          original = current
          originalTextMap.set(textNode, original)
        }

        const translated = translateLiteralValue(original, entries)
        if (translated !== current) {
          textNode.nodeValue = translated
        }
        lastTranslatedTextMap.set(textNode, translated)
      }

      currentNode = walker.nextNode()
    }

    const elements = document.body.querySelectorAll('*')
    elements.forEach((element) => {
      const originalAttrs = originalAttrMap.get(element) ?? {}
      const lastTranslatedAttrs = lastTranslatedAttrMap.get(element) ?? {}

      ATTRIBUTES_TO_TRANSLATE.forEach((attrName) => {
        if (!element.hasAttribute(attrName)) {
          return
        }

        const current = element.getAttribute(attrName) ?? ''
        let original = originalAttrs[attrName]
        
        if (original === undefined || (attrName in lastTranslatedAttrs && lastTranslatedAttrs[attrName] !== current)) {
          original = current
          originalAttrs[attrName] = original
        }

        const translated = translateLiteralValue(original, entries)
        if (translated !== current) {
          element.setAttribute(attrName, translated)
        }
        lastTranslatedAttrs[attrName] = translated
      })

      if (Object.keys(originalAttrs).length) {
        originalAttrMap.set(element, originalAttrs)
        lastTranslatedAttrMap.set(element, lastTranslatedAttrs)
      }
    })
  }

  const scheduleScan = () => {
    if (scheduled || typeof window === 'undefined') {
      return
    }

    scheduled = true
    window.requestAnimationFrame(() => {
      void nextTick().then(scan)
    })
  }

  onMounted(() => {
    scheduleScan()

    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      observer = new MutationObserver(() => {
        scheduleScan()
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRIBUTES_TO_TRANSLATE
      })
    }
  })

  onUpdated(() => {
    scheduleScan()
  })

  watch(locale, () => {
    scheduleScan()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
}
