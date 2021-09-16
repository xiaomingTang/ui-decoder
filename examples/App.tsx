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

function App() {
  const [mouseDecoder, setMouseDecoder] = useState<MouseDecoder>()
  const [touchDecoder, setTouchDecoder] = useState<TouchDecoder>()

  const onInit = useCallback((elem: HTMLDivElement | null) => {
    if (elem) {
      const rect = elem.getBoundingClientRect()

      const tempMouseDecoder = new MouseDecoder(elem, elem, false)
      tempMouseDecoder.setRawRect(rect)
      setMouseDecoder(tempMouseDecoder)

      const tempTouchDecoder = new TouchDecoder(elem, elem, false)
      tempTouchDecoder.setRawRect(rect)
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
