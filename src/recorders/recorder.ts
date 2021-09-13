/* eslint-disable class-methods-use-this */

export interface SimpleVectorWithTime {
  x: number;
  y: number;
  time: number;
}

export class Recorder {
  /**
   * 鼠标位置(包含time)列表
   */
  list: SimpleVectorWithTime[] = []

  /**
   * list 长度限制在 20
   */
  limit = 5

  /**
   * 计算平均速度时, 仅计算 50ms 以内的位置
   */
  timeLimit = 50

  /**
   * 返回两点间的向量(由 oldPosition 出发, 指向 newPosition)
   */
  getDelta(
    oldPosition: SimpleVectorWithTime = {
      x: 0,
      y: 0,
      time: 0,
    },
    newPosition: SimpleVectorWithTime = {
      x: 0,
      y: 0,
      time: 0,
    },
  ): SimpleVectorWithTime {
    return {
      x: newPosition.x - oldPosition.x,
      y: newPosition.y - oldPosition.y,
      time: Math.abs(newPosition.time - oldPosition.time),
    }
  }

  /**
   * 计算最近一段时间(this.timeLimit)内所有点之间的速度
   */
  getSpeedList(): SimpleVectorWithTime[] {
    const now = Date.now()
    const list = this.list.filter((item) => (item.time > (now - this.timeLimit)))
    this.list = list
    const len = list.length
    if (len < 2) {
      return []
    }
    const speedList: SimpleVectorWithTime[] = []
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

  push(p: SimpleVectorWithTime): this {
    this.list.push(p)
    const deleteCount = this.list.length - this.limit
    if (deleteCount > 0) {
      this.list.shift()
      // this.list.splice(0, deleteCount)
    }
    return this
  }

  clear(): this {
    this.list = []
    return this
  }

  getLastVector(): SimpleVectorWithTime {
    return this.list[this.list.length - 1] || {
      x: 0,
      y: 0,
      time: Date.now(),
    }
  }

  /**
   * 返回最后两个点间的位置向量
   */
  getLastDelta(): SimpleVectorWithTime {
    const len = this.list.length
    const lastElem = this.list[len - 1]
    const lastButTwoElem = this.list[len - 2]
    return this.getDelta(lastButTwoElem, lastElem)
  }

  /**
   * 返回最后两个点间的速度(像素/ms)
   */
  getLastSpeed(): SimpleVectorWithTime {
    const lastDelta = this.getLastDelta()
    const { time } = lastDelta
    return {
      x: time === 0 ? 0 : lastDelta.x / time,
      y: time === 0 ? 0 : lastDelta.y / time,
      time,
    }
  }

  /**
   * 返回最近一段时间(this.timeLimit)内的平均速度(像素/ms)
   */
  getAvgSpeed(): SimpleVectorWithTime {
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
    const maxLenSpeedList = maxLen === xSpeedList.length ? xSpeedList : ySpeedList
    return {
      // 仅计算同向的速度的平均值
      // 没写错, 是除以 maxLen, 这是为了规避 "当某个方向上有效速度较少时, 表明用户在该方向上移动较少, 但计算所得平均速度仍然很大" 的bug
      x: xSpeedList.length === 0 ? 0 : xSpeedList.reduce((prev, cur) => prev + cur.x, 0) / maxLen,
      y: ySpeedList.length === 0 ? 0 : ySpeedList.reduce((prev, cur) => prev + cur.y, 0) / maxLen,
      // time 以 有效速度多的 方向上时间平均值计算
      time: maxLen === 0
        ? 0
        : maxLenSpeedList.reduce((prev, cur) => prev + cur.time, 0) / maxLen,
    }
  }
}
