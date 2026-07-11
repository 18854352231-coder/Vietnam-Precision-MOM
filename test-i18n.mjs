import { buildLiteralEntries, translateLiteralValue } from './src/utils/taskLiteralTranslator.ts'
import { zhTask5Literal, enTask5Literal } from './src/i18n/locales/task5Literals.ts'

const zhEntries = buildLiteralEntries(zhTask5Literal)
const enEntries = buildLiteralEntries(enTask5Literal)

const original = '机台'
const english = translateLiteralValue(original, enEntries)
console.log('original -> EN:', english)

const backToZh = translateLiteralValue(original, zhEntries)
console.log('original -> ZH:', backToZh)
