export const generatePalletNo = (existingNumbers: unknown[], date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  let maxSeq = 0
  existingNumbers.forEach(value => {
    const match = String(value || '').match(/^(\d{8})-(\d{2})$/)
    if (!match || match[1] !== dateStr) return
    maxSeq = Math.max(maxSeq, Number(match[2]))
  })

  return `${dateStr}-${String(maxSeq + 1).padStart(2, '0')}`
}
