/* eslint-disable class-methods-use-this */

export interface SimpleVector {
  x: number;
  y: number;
  time: number;
}

export class TouchHistory {
  protected list: SimpleVector[] = []

  /**
   * list 长度限制在 20
   */
  protected limit = 20

  /**
   * 计算平均速度时, 仅计算 50ms 以内的位置
   */
  protected timeLimit = 50

  /**
   * 返回两点间的向量(由 oldPosition 出发, 指向 newPosition)
   */
  protected getDelta(
    oldPosition: SimpleVector = {
      x: 0,
      y: 0,
      time: 0,
    },
    newPosition: SimpleVector = {
      x: 0,
      y: 0,
      time: 0,
    },
  ): SimpleVector {
    return {
      x: newPosition.x - oldPosition.x,
      y: newPosition.y - oldPosition.y,
      time: Math.abs(newPosition.time - oldPosition.time),
    }
  }

  /**
   * 计算最近一段时间(this.timeLimit)内所有点之间的速度
   */
  protected getSpeedList(): SimpleVector[] {
    const now = Date.now()
    const list = this.list.filter((item) => (item.time > (now - this.timeLimit)))
    this.list = list
    const len = list.length
    if (len < 2) {
      return []
    }
    const speedList: SimpleVector[] = []
    for (let i = 0; i < len - 1; i += 1) {
      const cur = list[i]
      const next = list[i + 1]
      const delta = this.getDelta(cur, next)
      speedList.push({
        x: delta.time === 0 ? 0 : delta.x / delta.time,
        y: delta.time === 0 ? 0 : delta.y / delta.time,
        time: delta.time,
      })
    }
    return speedList
  }

  push(p: SimpleVector): TouchHistory {
    this.list.push(p)
    const deleteCount = this.list.length - this.limit
    if (deleteCount > 0) {
      this.list.splice(0, deleteCount)
    }
    return this
  }

  clear(): TouchHistory {
    this.list = []
    return this
  }

  getLastVector(): SimpleVector {
    return this.list[this.list.length - 1] || {
      x: 0,
      y: 0,
      time: Date.now(),
    }
  }

  /**
   * 返回最后两个点间的位置向量
   */
  getLastDelta(): SimpleVector {
    const len = this.list.length
    const lastElem = this.list[len - 1]
    const lastButTwoElem = this.list[len - 2]
    return this.getDelta(lastButTwoElem, lastElem)
  }

  /**
   * 返回最后两个点间的速度
   */
  getLastSpeed(): SimpleVector {
    const lastDelta = this.getLastDelta()
    return {
      x: lastDelta.time === 0 ? 0 : lastDelta.x / lastDelta.time,
      y: lastDelta.time === 0 ? 0 : lastDelta.y / lastDelta.time,
      time: lastDelta.time,
    }
  }

  /**
   * 返回最近一段时间(this.timeLimit)内的平均速度
   */
  getAvgSpeed(): SimpleVector {
    const speedList = this.getSpeedList()
    const len = speedList.length
    const lastNonZeroSpeed = {
      x: 0,
      y: 0,
    }
    for (let i = len - 1; i >= 0; i -= 1) {
      const speed = speedList[i]
      if (lastNonZeroSpeed.x === 0 && speed.x !== 0) {
        lastNonZeroSpeed.x = speed.x
      }
      if (lastNonZeroSpeed.y === 0 && speed.y !== 0) {
        lastNonZeroSpeed.y = speed.y
      }
    }
    // 仅计算与最后一次非零速度同向的速度
    const xSpeedList = speedList.filter((item) => (item.x * lastNonZeroSpeed.x > 0))
    const ySpeedList = speedList.filter((item) => (item.y * lastNonZeroSpeed.y > 0))
    const maxLen = Math.max(xSpeedList.length, ySpeedList.length)
    return {
      // 仅计算同向的速度的平均值
      x: xSpeedList.length === 0 ? 0 : xSpeedList.reduce((prev, cur) => prev + cur.x, 0) / maxLen,
      y: ySpeedList.length === 0 ? 0 : ySpeedList.reduce((prev, cur) => prev + cur.y, 0) / maxLen,
      // time 以 x 方向上时间平均值计算
      time: xSpeedList.length === 0 ? 0 : xSpeedList.reduce((prev, cur) => prev + cur.time, 0) / maxLen,
    }
  }
}
