/* eslint-disable class-methods-use-this */

import { Recorder, SimpleVectorWithTime } from "./recorder"

export class MouseRecorder extends Recorder {
  protected WHEEL_DELTA_X = 0

  protected WHEEL_DELTA_Y = 0

  pushFromMouseEvent(e: MouseEvent): this {
    return this.push({
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    })
  }

  pushFromWheelEvent(e: WheelEvent): this {
    if (e.deltaY > 0) {
      this.WHEEL_DELTA_X += 1
      this.WHEEL_DELTA_Y += 1
    } else if (e.deltaY < 0) {
      this.WHEEL_DELTA_X += -1
      this.WHEEL_DELTA_Y += -1
    }
    return this.push({
      x: this.WHEEL_DELTA_X,
      y: this.WHEEL_DELTA_Y,
      time: Date.now(),
    })
  }

  static getPositionFromMouseEvent(e: MouseEvent | WheelEvent): SimpleVectorWithTime {
    return {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    }
  }

  static wheelDeltaToScalar(wheelDelta: SimpleVectorWithTime, ratio: number): SimpleVectorWithTime {
    return {
      x: wheelDelta.x > 0 ? 1 / ratio : ratio,
      y: wheelDelta.y > 0 ? 1 / ratio : ratio,
      time: wheelDelta.time,
    }
  }
}
