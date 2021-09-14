/* eslint-disable class-methods-use-this */
import { Vector2 } from "three"
import { SimpleVectorWithTime } from "./recorder"
import { TouchRecorder } from "./touch-recorder"

export class TouchListRecorder {
  list: TouchRecorder[] = []

  updateList(newList: TouchRecorder[]): this {
    this.list = newList
    return this
  }

  updateListFromTouchList(touchList: TouchList | Touch[]): this {
    // 仅获取前 2 个 Touch
    const realTouchList = touchList.length <= 2 ? [...touchList] : [touchList[0], touchList[1]]
    return this.updateList(realTouchList.map((touch, i) => {
      const touchRecorder = this.list[i] || new TouchRecorder()
      touchRecorder.pushFromTouch(touch)
      return touchRecorder
    }))
  }

  clear(): this {
    this.list = []
    return this
  }

  getDelta(
    oldTouchA: SimpleVectorWithTime,
    newTouchA: SimpleVectorWithTime,
    oldTouchB: SimpleVectorWithTime,
    newTouchB: SimpleVectorWithTime,
  ) {
    const oldPositionA = new Vector2(oldTouchA.x, oldTouchA.y)
    const oldPositionB = new Vector2(oldTouchB.x, oldTouchB.y)

    const newPositionA = new Vector2(newTouchA.x, newTouchA.y)
    const newPositionB = new Vector2(newTouchB.x, newTouchB.y)

    const oldCenter = new Vector2().addVectors(oldPositionB, oldPositionA).divideScalar(2)
    const newCenter = new Vector2().addVectors(newPositionB, newPositionA).divideScalar(2)

    const oldVector = new Vector2().subVectors(oldPositionB, oldPositionA)
    const newVector = new Vector2().subVectors(newPositionB, newPositionA)

    const oldLength = oldVector.length()
    const scaleVector = oldLength === 0
      ? new Vector2()
      : new Vector2().copy(oldVector).setLength(oldVector.dot(newVector) / oldLength)

    const time = Math.max(newTouchA.time - oldTouchA.time, newTouchB.time - oldTouchB.time)

    /**
     * @TODO: 用 matrix 表示该变化
     */
    return {
      move: {
        x: newCenter.x - oldCenter.x,
        y: newCenter.y - oldCenter.y,
        time,
      },
      scalar: {
        x: scaleVector.x,
        y: scaleVector.y,
        time,
      },
      rotate: {
        center: {
          x: newCenter.x,
          y: newCenter.y,
          time,
        },
        angle: 0.8,
        time,
      },
    }
  }
}
