import { hot } from "react-hot-loader/root"
import React, {
  useCallback, useEffect, useState,
} from "react"

import "@Examples/global"
import { MouseDecoder, TouchDecoder } from "@Src/index"

import Styles from "./App.module.less"

function voidFunc() {
  // pass
}

function arrayToCssMatrix(arr: number[]) {
  return [
    arr[0], arr[1], arr[3], arr[4], arr[6], arr[7],
  ]
}

function App() {
  const [mouseDecoder, setMouseDecoder] = useState<MouseDecoder>()
  const [touchDecoder, setTouchDecoder] = useState<TouchDecoder>()

  const onInit = useCallback((elem: HTMLDivElement | null) => {
    if (elem) {
      const tempMouseDecoder = new MouseDecoder(elem, elem, false)
      setMouseDecoder(tempMouseDecoder)
      const tempTouchDecoder = new TouchDecoder(elem, elem, false)
      setTouchDecoder(tempTouchDecoder)
    }
  }, [])

  // mouseDecoder 初始化
  useEffect(() => {
    if (mouseDecoder) {
      mouseDecoder.ENABLE_SMOOTH_SCALE = true
      mouseDecoder.subscribe()

      return () => {
        mouseDecoder.unsubscribe()
      }
    }
    return voidFunc
  }, [mouseDecoder])

  // touchDecoder 初始化
  useEffect(() => {
    if (touchDecoder) {
      touchDecoder.subscribe()

      return () => {
        touchDecoder.unsubscribe()
      }
    }
    return voidFunc
  }, [touchDecoder])

  return <div
    className={Styles.scrollElem}
    ref={onInit}
  >
    <div className={Styles.inner}></div>
  </div>
}

export default hot(App)
