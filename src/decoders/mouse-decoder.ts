/* eslint-disable class-methods-use-this */
import EventEmitter from "eventemitter3"
import { MouseHistory, SimpleVector } from "@Src/utils/mouse"

type DecoderEvent = {
  move: [{
    vector: SimpleVector;
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
    //   vector: this.wheelHistory.getLastDelta(),
    // })
    this.smoothScale(
      this.wheelHistory.getLastDelta(),
      10,
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
    this.emit("smoothMove", {
      vector,
    })
    window.requestAnimationFrame(() => {
      this.smoothMove(nextSpeed, times - 1)
    })
  }

  protected smoothScale = (speed: SimpleVector, times: number, stopTime?: number) => {
    const d: SimpleVector = {
      x: (2 * speed.x) / times / (times - 1),
      y: (2 * speed.y) / times / (times - 1),
      time: speed.time / times,
    }
    const smoothScale = (i: number) => {
      if (i < 0 || (stopTime && Date.now() > stopTime)) {
        return
      }
      const vector = {
        x: d.x * i,
        y: d.y * i,
        time: d.time,
      }
      this.emit("smoothScale", {
        vector,
      })
      this.smoothScaleFlag = window.requestAnimationFrame(() => smoothScale(i - 1))
    }
    smoothScale(times - 1)
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
