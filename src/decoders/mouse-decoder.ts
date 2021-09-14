/* eslint-disable class-methods-use-this */
import EventEmitter from "eventemitter3"
import { Matrix3, Vector2 } from "three"
import { SimpleVectorWithTime } from "@Src/recorders/recorder"
import { MouseRecorder } from "@Src/recorders/mouse-recorder"
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

  protected rawRect: DOMRect = new DOMRect()

  protected rawCenter: Vector2 = new Vector2()

  protected matrix: Matrix3 = new Matrix3()

  protected mouseMoveRecorder = new MouseRecorder()

  protected wheelRecorder = new MouseRecorder()

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
      this.mouseMoveRecorder.pushFromMouseEvent(e)
    }
  }

  protected onMouseMove: MouseEventHandler = (e) => {
    if (this.isMouseDown) {
      this.mouseMoveRecorder.pushFromMouseEvent(e)
      this.emit("move", {
        vector: this.mouseMoveRecorder.getLastDelta(),
      })
    }
  }

  protected onMouseUp: MouseEventHandler = (e) => {
    if (e.button === 0) { // 左键被释放
      this.isMouseDown = false
      this.smoothMove(
        this.mouseMoveRecorder.getAvgSpeed(),
        this.SMOOTH_MOVE_RATIO,
      )
      this.mouseMoveRecorder.clear()
    }
  }

  protected onWheel: WheelHandler = (e) => {
    // 滚轮事件触发之初, 立即停止之前没来得及调用的 smoothScale 方法
    window.cancelAnimationFrame(this.smoothScaleFlag)
    this.wheelRecorder.pushFromWheelEvent(e)
    const center = MouseRecorder.getPositionFromMouseEvent(e)

    if (this.ENABLE_SMOOTH_SCALE) {
      this.smoothScale(
        MouseRecorder.wheelDeltaToScalar(this.wheelRecorder.getLastDelta(), this.SCALE_RATIO),
        center,
      )
    } else {
      this.emit("scale", {
        vector: MouseRecorder.wheelDeltaToScalar(this.wheelRecorder.getLastDelta(), this.SCALE_RATIO),
        center,
      })
    }
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

  setRawRect(rect: DOMRect) {
    this.rawRect = rect
    this.rawCenter.set(
      (rect.left + rect.right) / 2,
      (rect.top + rect.bottom) / 2,
    )
  }

  /**
   * 为相关节点添加事件监听
   */
  subscribe() {
    this.triggerElement.addEventListener("mousedown", this.onMouseDown)
    this.triggerElement.addEventListener("wheel", this.onWheel)
    document.addEventListener("mousemove", this.onMouseMove)
    document.addEventListener("mouseup", this.onMouseUp)
    this.addListener("move", this.onMove)
    this.addListener("smoothMove", this.onMove)
    this.addListener("scale", this.onScale)
    this.addListener("smoothScale", this.onScale)
  }

  /**
   * 移除相关节点的事件监听
   */
  unsubscribe() {
    this.triggerElement.removeEventListener("mousedown", this.onMouseDown)
    this.triggerElement.removeEventListener("wheel", this.onWheel)
    document.removeEventListener("mousemove", this.onMouseMove)
    document.removeEventListener("mouseup", this.onMouseUp)
    this.removeListener("move", this.onMove)
    this.removeListener("smoothMove", this.onMove)
    this.removeListener("scale", this.onScale)
    this.removeListener("smoothScale", this.onScale)
  }
}
