/* eslint-disable class-methods-use-this */
import { Recorder, SimpleVectorWithTime } from "./recorder"

export class TouchRecorder extends Recorder {
  pushFromTouch(touch: Touch): this {
    const now = Date.now()
    return this.push({
      x: touch.clientX,
      y: touch.clientY,
      time: now,
    })
  }

  /**
   * 返回两点间的向量(由 oldPosition 出发, 指向 newPosition)
   */
  getDelta(
    oldPosition?: SimpleVectorWithTime,
    newPosition?: SimpleVectorWithTime,
  ): SimpleVectorWithTime {
    if (!oldPosition || !newPosition) {
      return {
        x: 0,
        y: 0,
        time: 0,
      }
    }
    return {
      x: newPosition.x - oldPosition.x,
      y: newPosition.y - oldPosition.y,
      time: Math.abs(newPosition.time - oldPosition.time),
    }
  }
}
