const MINUS = '−'

export function formatNumber(value, digits = 1) {
  const text = Math.abs(value).toFixed(digits)
  return value < 0 ? `${MINUS}${text}` : text
}

export function formatSigned(value, digits = 1) {
  if (value === 0) return formatNumber(0, digits)
  return `${value > 0 ? '+' : MINUS}${Math.abs(value).toFixed(digits)}`
}
