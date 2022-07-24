import { Matrix3 } from "three"

export function sumSmoothScaleMagicValue(start: number, end: number) {
  let sum = 0
  for (let i = start; i <= end; i += 1) {
    sum += 1 / i
  }
  return sum
}

export function matrix3MultiplyPoint(matrix3: Matrix3, point: [number, number]): [number, number] {
  const { elements } = matrix3
  const [x, y] = point
  const nx = elements[0] * x + elements[3] * y + elements[6]
  const ny = elements[1] * x + elements[4] * y + elements[7]
  return [nx, ny]
}

export function matrix3MultiplyRect(matrix3: Matrix3, rect: DOMRect) {
  const {
    left, top, right, bottom,
  } = rect
  const [x1, y1] = matrix3MultiplyPoint(matrix3, [left, top])
  const [x2, y2] = matrix3MultiplyPoint(matrix3, [right, top])
  const [x3, y3] = matrix3MultiplyPoint(matrix3, [left, bottom])
  const [x4, y4] = matrix3MultiplyPoint(matrix3, [right, bottom])

  const minX = Math.min(x1, x2, x3, x4)
  const maxX = Math.max(x1, x2, x3, x4)
  const minY = Math.min(y1, y2, y3, y4)
  const maxY = Math.max(y1, y2, y3, y4)

  return new DOMRect(minX, minY, maxX - minX, maxY - minY)
}
