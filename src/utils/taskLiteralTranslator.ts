type LiteralEntry = [string, string]

export type LiteralEntries = LiteralEntry[] & {
  exactMap?: Map<string, string>
}

const SAFE_PASSTHROUGH_CHAR = /^[A-Za-z0-9\s#:/\-_.(),%[\]{}+*=|<>!?&"'`~]$/

const isRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' && value !== null

export const buildLiteralEntries = (messages: unknown): LiteralEntries => {
  if (!isRecord(messages)) {
    return [] as LiteralEntries
  }

  const entries = Object.entries(messages)
    .filter(([source, target]) => source && typeof target === 'string')
    .sort((a, b) => b[0].length - a[0].length) as LiteralEntries

  entries.exactMap = new Map(entries)
  return entries
}

const translateCompletely = (value: string, entries: LiteralEntries) => {
  const memo = new Map<number, string | null>()

  const visit = (startIndex: number): string | null => {
    if (startIndex === value.length) {
      return ''
    }

    if (memo.has(startIndex)) {
      return memo.get(startIndex) ?? null
    }

    for (const [source, target] of entries) {
      if (!value.startsWith(source, startIndex)) {
        continue
      }

      const translatedRest = visit(startIndex + source.length)
      if (translatedRest !== null) {
        const nextValue = `${target}${translatedRest}`
        memo.set(startIndex, nextValue)
        return nextValue
      }
    }

    const currentChar = value[startIndex]
    if (SAFE_PASSTHROUGH_CHAR.test(currentChar)) {
      const translatedRest = visit(startIndex + 1)
      if (translatedRest !== null) {
        const nextValue = `${currentChar}${translatedRest}`
        memo.set(startIndex, nextValue)
        return nextValue
      }
    }

    memo.set(startIndex, null)
    return null
  }

  return visit(0)
}

export const translateLiteralValue = (value: string, entries: LiteralEntries) => {
  if (!value) {
    return value
  }

  const exactMap = entries.exactMap ?? new Map(entries)
  const exactMatch = exactMap.get(value)

  if (exactMatch && exactMatch !== value) {
    return exactMatch
  }

  const translated = translateCompletely(value, entries)
  return translated ?? value
}
