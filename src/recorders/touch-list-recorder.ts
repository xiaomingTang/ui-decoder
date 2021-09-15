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
    if (!(oldTouchA && newTouchA && oldTouchB && newTouchB)) {
      return {
        move: null,
        scalar: null,
        rotate: null,
        center: null,
      }
    }
    const oldPositionA = new Vector2(oldTouchA.x, oldTouchA.y)
    const oldPositionB = new Vector2(oldTouchB.x, oldTouchB.y)

    const newPositionA = new Vector2(newTouchA.x, newTouchA.y)
    const newPositionB = new Vector2(newTouchB.x, newTouchB.y)

    const oldCenter = new Vector2().addVectors(oldPositionB, oldPositionA).divideScalar(2)
    const newCenter = new Vector2().addVectors(newPositionB, newPositionA).divideScalar(2)

    const oldVector = new Vector2().subVectors(oldPositionB, oldPositionA)
    const newVector = new Vector2().subVectors(newPositionB, newPositionA)

    const scalar = oldVector.length() === 0 ? 1 : newVector.length() / oldVector.length()

    const multiLength = oldVector.length() * newVector.length()
    const dot = newVector.dot(oldVector)
    const cross = newVector.cross(oldVector)
    const angle = multiLength === 0 ? 0 : Math.acos(dot / multiLength)

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
        x: scalar,
        y: scalar,
        time,
      },
      rotate: Number.isNaN(angle) || angle === 0 ? null : {
        angle: cross < 0 ? Math.PI * 2 - angle : angle,
        time,
      },
      center: {
        x: (oldCenter.x + newCenter.x) / 2,
        y: (oldCenter.y + newCenter.y) / 2,
        time,
      },
    }
  }

  getLastDelta() {
    const [recordA, recordB] = this.list
    const lengthA = recordA?.list.length || 0
    const lengthB = recordB?.list.length || 0
    return this.getDelta(
      recordA.list[lengthA - 2],
      recordA.list[lengthA - 1],
      recordB.list[lengthB - 2],
      recordB.list[lengthB - 1],
    )
  }
}
