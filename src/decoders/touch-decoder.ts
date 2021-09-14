/* eslint-disable class-methods-use-this */
import EventEmitter from "eventemitter3"
import { Matrix3, Vector2 } from "three"
import { SimpleVectorWithTime } from "@Src/recorders/recorder"
import { TouchListRecorder } from "@Src/recorders/touch-list-recorder"
import { sumSmoothScaleMagicValue } from "@Src/utils/smooth-scale-magic-value"

type DecoderEvent = {
  move: [{
    vector: SimpleVectorWithTime;
  }];
  smoothMove: [{
    vector: SimpleVectorWithTime;
  }];
  scale: [{
    /**
     * vector.y 表示滚轮滚动了 y 次(y > 0 表示向下滚, y < 0 表示向上滚)
     */
    vector: SimpleVectorWithTime;
    center: SimpleVectorWithTime;
  }];
  smoothScale: [{
    /**
     * vector.y 表示滚轮滚动了 y 次(y > 0 表示向下滚, y < 0 表示向上滚)
     */
    vector: SimpleVectorWithTime;
    center: SimpleVectorWithTime;
  }];
  random: [number];
}

type TouchEventHandler = (e: TouchEvent) => void

export class TouchDecoder extends EventEmitter<DecoderEvent> {
  /**
   * 监听的元素
   */
  triggerElement: HTMLElement

  /**
   * 控制的元素
   */
  targetElement: HTMLElement

  protected rawRect: DOMRect = new DOMRect()

  protected rawCenter: Vector2 = new Vector2()

  protected matrix: Matrix3 = new Matrix3()

  protected touchListRecorder = new TouchListRecorder()

  /**
   * 鼠标是否按下
   */
  protected isTouching = false

  /**
   * 用户停止"甩动"节点后, 有一个"制动距离"
   *
   * 制动发生时的初始速度(由制动前一段时间内的平均速度计算而来, 单位是 像素/ms)通常为 0.5-1.0 左右
   *
   * 我们可以给这个"初始速度"乘以一个倍率, 该属性就是这个"倍率"
   */
  SMOOTH_MOVE_RATIO = 12

  /**
   * 用户停止"甩动"节点后的"制动函数"被调用的次数
   *
   * 次数越少, 停止得就越快
   *
   * this.SMOOTH_MOVE_RATIO 仅决定初始速度, 因此次数越多, "滑行"距离越远
   */
  SMOOTH_MOVE_LIMIT_RUN_TIMES = 16

  /**
   * 用户滚动一次滚轮时, 缩放的倍数
   */
  SMOOTH_SCALE_RATIO = 1.5

  /**
   * 用户停止滚动滚轮后"smoothScale 制动函数"被调用的次数
   *
   * 次数越少, 停止得就越快
   *
   * 但最终的缩放倍数始终由 this.SCALE_RATIO 决定, 不因执行次数改变而改变
   */
  SMOOTH_SCALE_LIMIT_RUN_TIMES = 5

  // 鼠标事件回调

  protected onTouchStart: TouchEventHandler = (e) => {
    this.isTouching = true
    this.touchListRecorder.updateListFromTouchList(e.touches)
  }

  /**
   * @TODO: 多指(> 3)滑动一段时间后 touchmove 触发频率显著降低, 应该是需要 preventDefault, 有待加上
   */
  protected onTouchMove: TouchEventHandler = (e) => {
    if (this.isTouching) {
      this.touchListRecorder.updateListFromTouchList(e.changedTouches)
      const delta = this.touchListRecorder.list[0]?.getLastDelta()
      if (delta) {
        this.emit("move", {
          vector: delta,
        })
      }
    }
  }

  protected onTouchEnd: TouchEventHandler = (e) => {
    this.isTouching = false
    const speed = this.touchListRecorder.list[0]?.getAvgSpeed()
    if (speed) {
      this.smoothMove(
        speed,
        this.SMOOTH_MOVE_RATIO,
      )
    }
    this.touchListRecorder.clear()
  }

  // 默认监听

  onMove = (...[{ vector }]: DecoderEvent["move"]) => {
    this.matrix.translate(vector.x, vector.y)
    this.render()
  }

  onScale = (...[{ vector, center }]: DecoderEvent["scale"]) => {
    const sx = vector.y
    const sy = vector.y
    const x = this.rawCenter.x - center.x
    const y = this.rawCenter.y - center.y
    // 复合矩阵 http://staff.ustc.edu.cn/~lfdong/teach/2011cgbk/PPT/chp5.pdf
    // 算了, 不用复合矩阵了...
    this.matrix
      .translate(x, y)
      .scale(sx, sy)
      .translate(-x, -y)
    this.render()
  }

  protected render() {
    const { targetElement, matrix } = this
    const els = matrix.elements
    const transformCss = `matrix(${els[0]},${els[1]},${els[3]},${els[4]},${els[6]},${els[7]})`
    targetElement.style.transform = transformCss
  }

  // 其他方法

  protected smoothMove(speed: SimpleVectorWithTime, ratio: number, RUN_TIMES = 0) {
    if (this.isTouching || RUN_TIMES >= this.SMOOTH_MOVE_LIMIT_RUN_TIMES) {
      return
    }
    const vector: SimpleVectorWithTime = {
      x: speed.x * ratio * ((1 - RUN_TIMES / this.SMOOTH_MOVE_LIMIT_RUN_TIMES)),
      y: speed.y * ratio * ((1 - RUN_TIMES / this.SMOOTH_MOVE_LIMIT_RUN_TIMES)),
      time: Date.now(),
    }
    this.emit("smoothMove", {
      vector,
    })
    window.requestAnimationFrame(() => {
      this.smoothMove(speed, ratio, RUN_TIMES + 1)
    })
  }

  /**
   * 原理: (1 / 10) + (1 / 11) + ... + (1 / N) === MAGIC_SUM
   *
   * scalar ** { [(1 / 10) + (1 / 11) + ... + (1 / N)] / MAGIC_SUM} ≈ scalar
   *
   * @param PREV_RUN_TIME 函数自己在循环中自动设置的变量, 手动调用时禁止设置/传入
   * @param MAGIC_TIMES 函数自己在循环中自动设置的变量, 手动调用时禁止设置/传入
   */
  protected smoothScale(speed: SimpleVectorWithTime, center: SimpleVectorWithTime, MAGIC_TIMES = 10) {
    if (MAGIC_TIMES >= this.SMOOTH_SCALE_LIMIT_RUN_TIMES + 10) {
      return
    }
    const MAGIC_SUM = sumSmoothScaleMagicValue(10, this.SMOOTH_SCALE_LIMIT_RUN_TIMES + 10 - 1)
    const vector = {
      x: speed.x ** (1 / MAGIC_TIMES / MAGIC_SUM),
      y: speed.y ** (1 / MAGIC_TIMES / MAGIC_SUM),
      time: Date.now(),
    }
    if (vector.x > 0 && vector.y > 0) {
      this.emit("smoothScale", {
        vector,
        center,
      })
    }
    window.requestAnimationFrame(() => {
      this.smoothScale(speed, center, MAGIC_TIMES + 1)
    })
  }

  constructor(elememt: HTMLElement, targetElement = elememt, listen = true) {
    super()
    this.triggerElement = elememt
    this.targetElement = targetElement
    if (listen) {
      this.subscribe()
    }
  }

  /**
   * 为相关节点添加事件监听
   */
  subscribe() {
    this.triggerElement.addEventListener("touchstart", this.onTouchStart)
    document.addEventListener("touchmove", this.onTouchMove)
    document.addEventListener("touchend", this.onTouchEnd)
    this.addListener("move", this.onMove)
    this.addListener("smoothMove", this.onMove)
    this.addListener("scale", this.onScale)
    this.addListener("smoothScale", this.onScale)
  }

  /**
   * 移除相关节点的事件监听
   */
  unsubscribe() {
    this.triggerElement.removeEventListener("touchstart", this.onTouchStart)
    document.removeEventListener("touchmove", this.onTouchMove)
    document.removeEventListener("touchend", this.onTouchEnd)
    this.removeListener("move", this.onMove)
    this.removeListener("smoothMove", this.onMove)
    this.removeListener("scale", this.onScale)
    this.removeListener("smoothScale", this.onScale)
  }
}
