/* eslint-disable class-methods-use-this */
import EventEmitter from "eventemitter3"
import { MouseHistory, SimpleVector } from "@Src/utils/mouse-history"

type DecoderEvent = {
  move: [{
    vector: SimpleVector;
    /**
     * 速度的单位是像素每ms
     */
    speed: SimpleVector;
  }];
  smoothMove: [{
    vector: SimpleVector;
  }];
  scale: [{
    /**
     * vector.y 表示滚轮滚动了 y 次(y > 0 表示向下滚, y < 0 表示向上滚)
     */
    vector: SimpleVector;
  }];
  smoothScale: [{
    /**
     * vector.y 表示滚轮滚动了 y 次(y > 0 表示向下滚, y < 0 表示向上滚)
     */
    vector: SimpleVector;
  }];
}

type MouseEventHandler = (e: MouseEvent) => void
type WheelHandler = (e: WheelEvent) => void

export class MouseDecoder extends EventEmitter<DecoderEvent> {
  /**
   * 监听的元素
   */
  protected element: HTMLElement

  protected mouseMoveHistory = new MouseHistory()

  protected wheelHistory = new MouseHistory()

  /**
   * 用户停止"甩动"节点后, 有一个"制动距离"
   *
   * 制动发生时的初始速度(由制动前一段时间内的平均速度计算而来, 单位是像素/ms)通常为 0.5-1.0 左右
   *
   * 我们可以给这个"初始速度"乘以一个倍率, 该属性就是这个"倍率"
   */
  protected SMOOTH_MOVE_RATIO = 1.1

  /**
   * 用户停止"甩动"节点后的"制动时间"
   */
  protected SMOOTH_MOVE_DELTA_TIME = 250

  /**
   * 鼠标缩放比拖拽更加离散(通常滚动一次滚轮, 需要提供较大的缩放)
   *
   * 所以缩放事件拥有一个开关, 在滚轮事件触发伊始, 要么触发 scale, 要么触发 smoothScale, 二选一
   *
   * 而非像拖动事件那样, 拖动时触发 move, 拖动结束后触发 smoothMove
   */
  protected ENABLE_SMOOTH_SCALE = true

  /**
   * 用户停止"缩放"节点后, 有一个"制动距离"
   *
   * 制动发生时的初始速度始终为 1, 表示每毫秒发生一次滚动
   *
   * 我们可以给这个"初始速度"乘以一个倍率, 该属性就是这个"倍率"
   */
   protected SMOOTH_SCALE_RATIO = 0.01

  /**
   * 用户停止"缩放"节点后的"制动时间"
   */
  protected SMOOTH_SCALE_DELTA_TIME = 250

  /**
   * 鼠标是否按下
   */
  protected isMouseDown = false

  protected smoothScaleFlag = -1

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
      const now = Date.now()
      this.smoothMove(
        this.mouseMoveHistory.getAvgSpeed(),
        this.SMOOTH_MOVE_RATIO,
        now,
        now,
        now + this.SMOOTH_MOVE_DELTA_TIME,
      )
      this.mouseMoveHistory.clear()
    }
  }

  protected onWheel: WheelHandler = (e) => {
    // 滚轮事件触发之初, 立即停止之前没来得及调用的 smoothScale 方法
    window.cancelAnimationFrame(this.smoothScaleFlag)
    this.wheelHistory.pushFromWheelEvent(e)

    if (this.ENABLE_SMOOTH_SCALE) {
      const now = Date.now()
      this.smoothScale(
        this.wheelHistory.getLastDelta(),
        this.SMOOTH_SCALE_RATIO,
        now,
        now,
        now + this.SMOOTH_SCALE_DELTA_TIME,
      )
    } else {
      this.emit("scale", {
        vector: this.wheelHistory.getLastDelta(),
      })
    }
  }

  protected onDoubleClick: MouseEventHandler = (e) => {
    // this.emit
  }

  // 其他方法

  protected smoothMove = (speed: SimpleVector, ratio: number, prevRunTime: number, startTime: number, stopTime: number) => {
    const now = Date.now()
    if (this.isMouseDown || (now < startTime) || (now > stopTime)) {
      return
    }
    const duration = now - prevRunTime
    const timeRatio = (stopTime - now) / (stopTime - startTime)
    const vector: SimpleVector = {
      x: speed.x * duration * timeRatio * ratio,
      y: speed.y * duration * timeRatio * ratio,
      time: now,
    }
    this.emit("smoothMove", {
      vector,
    })
    window.requestAnimationFrame(() => {
      this.smoothMove(speed, ratio, now, startTime, stopTime)
    })
  }

  protected smoothScale = (speed: SimpleVector, ratio: number, prevRunTime: number, startTime: number, stopTime: number) => {
    const now = Date.now()
    if ((now < startTime) || (now > stopTime)) {
      return
    }
    const duration = now - prevRunTime
    const timeRatio = (stopTime - now) / (stopTime - startTime)
    const vector: SimpleVector = {
      x: speed.x * duration * timeRatio * ratio,
      y: speed.y * duration * timeRatio * ratio,
      time: now,
    }
    this.emit("smoothScale", {
      vector,
    })
    window.requestAnimationFrame(() => {
      this.smoothScale(speed, ratio, now, startTime, stopTime)
    })
  }

  constructor(elememt: HTMLElement, listen = true) {
    super()
    this.element = elememt
    if (listen) {
      this.subscribe()
    }
  }

  subscribe() {
    this.element.addEventListener("mousedown", this.onMouseDown)
    this.element.addEventListener("dblclick", this.onDoubleClick)
    this.element.addEventListener("wheel", this.onWheel)
    document.addEventListener("mousemove", this.onMouseMove)
    document.addEventListener("mouseup", this.onMouseUp)
  }

  unsubscribe() {
    this.element.removeEventListener("mousedown", this.onMouseDown)
    this.element.removeEventListener("dblclick", this.onDoubleClick)
    this.element.removeEventListener("wheel", this.onWheel)
    document.removeEventListener("mousemove", this.onMouseMove)
    document.removeEventListener("mouseup", this.onMouseUp)
  }
}
