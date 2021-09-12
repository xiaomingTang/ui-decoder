/* eslint-disable class-methods-use-this */
import EventEmitter from "eventemitter3"
import { MouseHistory, SimpleVector, SimpleVectorWithTime } from "@Src/utils/mouse-history"
import { sumSmoothScaleMagicValue } from "@Src/utils/smooth-scale-magic-value"

type DecoderEvent = {
  move: [{
    vector: SimpleVectorWithTime;
    /**
     * 速度的单位是像素每ms
     */
    speed: SimpleVectorWithTime;
  }];
  smoothMove: [{
    vector: SimpleVectorWithTime;
  }];
  scale: [{
    /**
     * vector.y 表示滚轮滚动了 y 次(y > 0 表示向下滚, y < 0 表示向上滚)
     */
    vector: SimpleVectorWithTime;
    center: SimpleVector;
  }];
  smoothScale: [{
    /**
     * vector.y 表示滚轮滚动了 y 次(y > 0 表示向下滚, y < 0 表示向上滚)
     */
    vector: SimpleVectorWithTime;
    center: SimpleVector;
  }];
}

type MouseEventHandler = (e: MouseEvent) => void
type WheelHandler = (e: WheelEvent) => void

export class MouseDecoder extends EventEmitter<DecoderEvent> {
  /**
   * 监听的元素
   */
  triggerElement: HTMLElement

  /**
   * 控制的元素
   */
  targetElement: HTMLElement

  protected mouseMoveHistory = new MouseHistory()

  protected wheelHistory = new MouseHistory()

  /**
   * 鼠标是否按下
   */
  protected isMouseDown = false

  protected smoothScaleFlag = -1

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
   * 鼠标缩放比拖拽更加离散(通常滚动一次滚轮, 需要提供较大的缩放)
   *
   * 所以缩放事件拥有一个开关, 在滚轮事件触发伊始, 要么触发 scale, 要么触发 smoothScale, 二选一
   *
   * 而非像拖动事件那样, 拖动时触发 move, 拖动结束后触发 smoothMove
   */
  ENABLE_SMOOTH_SCALE = true

  /**
   * 用户滚动一次滚轮时, 缩放的倍数
   */
  SCALE_RATIO = 1.5

  /**
   * 用户停止滚动滚轮后"smoothScale 制动函数"被调用的次数
   *
   * 次数越少, 停止得就越快
   *
   * 但最终的缩放倍数始终由 this.SCALE_RATIO 决定, 不因执行次数改变而改变
   */
  SMOOTH_SCALE_LIMIT_RUN_TIMES = 5

  // 鼠标事件回调

  protected onMouseDown: MouseEventHandler = (e) => {
    if (e.button === 0) { // 左键被按下
      this.isMouseDown = true
      this.mouseMoveHistory.pushFromMouseEvent(e)
    }
  }

  protected onMouseMove: MouseEventHandler = (e) => {
    if (this.isMouseDown) {
      this.mouseMoveHistory.pushFromMouseEvent(e)
      this.emit("move", {
        vector: this.mouseMoveHistory.getLastDelta(),
        speed: this.mouseMoveHistory.getLastSpeed(),
      })
    }
  }

  protected onMouseUp: MouseEventHandler = (e) => {
    if (e.button === 0) { // 左键被释放
      this.isMouseDown = false
      this.smoothMove(
        this.mouseMoveHistory.getAvgSpeed(),
        this.SMOOTH_MOVE_RATIO,
      )
      this.mouseMoveHistory.clear()
    }
  }

  protected onWheel: WheelHandler = (e) => {
    // 滚轮事件触发之初, 立即停止之前没来得及调用的 smoothScale 方法
    window.cancelAnimationFrame(this.smoothScaleFlag)
    this.wheelHistory.pushFromWheelEvent(e)
    const center = MouseHistory.getPositionFromMouseEvent(e)

    if (this.ENABLE_SMOOTH_SCALE) {
      this.smoothScale(
        this.wheelDeltaToScalar(this.wheelHistory.getLastDelta(), this.SCALE_RATIO),
        center,
      )
    } else {
      this.emit("scale", {
        vector: this.wheelDeltaToScalar(this.wheelHistory.getLastDelta(), this.SCALE_RATIO),
        center,
      })
    }
  }

  // 其他方法

  protected smoothMove = (speed: SimpleVectorWithTime, ratio: number, RUN_TIMES = 0) => {
    if (this.isMouseDown || RUN_TIMES >= this.SMOOTH_MOVE_LIMIT_RUN_TIMES) {
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
  protected smoothScale = (speed: SimpleVectorWithTime, center: SimpleVector, MAGIC_TIMES = 10) => {
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

  protected wheelDeltaToScalar = (wheelDelta: SimpleVectorWithTime, ratio: number): SimpleVectorWithTime => ({
    x: wheelDelta.x > 0 ? 1 / ratio : ratio,
    y: wheelDelta.y > 0 ? 1 / ratio : ratio,
    time: wheelDelta.time,
  })

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
    this.triggerElement.addEventListener("mousedown", this.onMouseDown)
    this.triggerElement.addEventListener("wheel", this.onWheel)
    document.addEventListener("mousemove", this.onMouseMove)
    document.addEventListener("mouseup", this.onMouseUp)
  }

  /**
   * 移除相关节点的事件监听
   */
  unsubscribe() {
    this.triggerElement.removeEventListener("mousedown", this.onMouseDown)
    this.triggerElement.removeEventListener("wheel", this.onWheel)
    document.removeEventListener("mousemove", this.onMouseMove)
    document.removeEventListener("mouseup", this.onMouseUp)
  }
}
