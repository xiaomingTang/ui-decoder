export function sumSmoothScaleMagicValue(start: number, end: number) {
  let sum = 0
  for (let i = start; i <= end; i += 1) {
    sum += 1 / i
  }
  return sum
}
