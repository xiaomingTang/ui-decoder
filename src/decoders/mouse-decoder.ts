/* eslint-disable class-methods-use-this */
import EventEmitter from "eventemitter3"
import { MouseHistory, SimpleVector } from "@Src/utils/mouse"

type DecoderEvent = {
  move: [{
    vector: SimpleVector;
    speed: SimpleVector;
  }];
  smoothMoveToStop: [{
    vector: SimpleVector;
  }];
  scale: [{
    vector: SimpleVector;
  }];
  smoothScale: [{
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
   * 必须大于 1
   */
  protected SCALE_RATIO = 1.1

  protected SMOOTH_SCALE_RATIO = 0.02

  protected SMOOTH_MOVE_RATIO = 10

  protected SMOOTH_MOVE_DELTA_TIME = 1000

  protected SMOOTH_SCALE_DELTA_TIME = 1000

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
      this.smoothMove(
        this.mouseMoveHistory.getAvgSpeed(),
        20,
        Date.now() + this.SMOOTH_MOVE_DELTA_TIME,
      )
      this.mouseMoveHistory.clear()
    }
  }

  protected onWheel: WheelHandler = (e) => {
    window.cancelAnimationFrame(this.smoothScaleFlag)
    this.wheelHistory.pushFromWheelEvent(e)
    // this.emit("scale", {
    //   vector: this.normalizeScaleVector(this.wheelHistory.getLastDelta()),
    // })
    this.smoothScale(
      this.wheelHistory.getLastDelta(),
      20,
      Date.now() + this.SMOOTH_SCALE_DELTA_TIME,
    )
  }

  protected onDoubleClick: MouseEventHandler = (e) => {
    // this.emit
  }

  // 其他方法

  protected smoothMove = (speed: SimpleVector, times: number, stopTime?: number) => {
    if (times <= 0 || this.isMouseDown || (stopTime && Date.now() > stopTime)) {
      return
    }
    const vector: SimpleVector = {
      x: speed.x * this.SMOOTH_MOVE_RATIO,
      y: speed.y * this.SMOOTH_MOVE_RATIO,
      time: 0,
    }
    const nextSpeed: SimpleVector = times <= 1 ? {
      x: 0,
      y: 0,
      time: 0,
    } : {
      x: speed.x * ((times - 1) / times),
      y: speed.y * ((times - 1) / times),
      time: speed.time * (1 / times),
    }
    this.emit("move", {
      vector,
      speed,
    })
    window.requestAnimationFrame(() => {
      this.smoothMove(nextSpeed, times - 1)
    })
  }

  protected smoothScale = (speed: SimpleVector, times: number, stopTime?: number) => {
    if (times <= 0 || (stopTime && Date.now() > stopTime)) {
      return
    }
    const vector: SimpleVector = {
      x: speed.x * this.SMOOTH_SCALE_RATIO,
      y: speed.y * this.SMOOTH_SCALE_RATIO,
      time: 0,
    }
    const nextSpeed: SimpleVector = times <= 1 ? {
      x: 0,
      y: 0,
      time: 0,
    } : {
      x: speed.x * ((times - 1) / times),
      y: speed.y * ((times - 1) / times),
      time: speed.time * (1 / times),
    }
    this.emit("smoothScale", {
      vector: this.normalizeScaleVector(vector),
    })
    this.smoothScaleFlag = window.requestAnimationFrame(() => {
      this.smoothScale(nextSpeed, times - 1)
    })
  }

  protected scaleDeltaToScalar(delta: number) {
    let scalar = Math.abs(delta)
    if (scalar >= 1) {
      scalar *= this.SCALE_RATIO
    } else {
      scalar += 1
    }
    if (delta > 0) {
      scalar = 1 / scalar
    }
    return scalar
  }

  protected normalizeScaleVector(vector: SimpleVector) {
    return {
      x: this.scaleDeltaToScalar(vector.x),
      y: this.scaleDeltaToScalar(vector.y),
      time: vector.time,
    }
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
