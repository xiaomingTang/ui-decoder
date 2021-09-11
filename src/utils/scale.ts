const WHEEL_DELTA_DURATION: [number, number] = [-10, 10]
const SCALAR_DURATION: [number, number] = [0.2, 8]

export function geneWheelHandler(wheelDeltaDuration = WHEEL_DELTA_DURATION, scalarDuration = SCALAR_DURATION) {
  const wheelDeltaSetter = (diff: number) => (prev: number) => {
    const [wMin, wMax] = wheelDeltaDuration
    return Math.min(wMax, Math.max(wMin, prev + diff))
  }
  const wheelDeltaToScalar = (delta: number) => {
    if (delta === 0) {
      return 1
    }
    const [vMin, vMax] = wheelDeltaDuration
    const [sMin, sMax] = scalarDuration
    if (delta < 0) {
      return 1 - ((delta - 0) / (vMin - 0)) * (1 - sMin)
    }
    return 1 + ((delta - 0) / (vMax - 0)) * (sMax - 1)
  }
  return [wheelDeltaSetter, wheelDeltaToScalar] as const
}
