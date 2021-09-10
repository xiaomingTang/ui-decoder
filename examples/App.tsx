import { hot } from "react-hot-loader/root"
import React, {
  useCallback, useEffect, useRef, useState,
} from "react"

import "@Examples/global"
import { MouseDecoder } from "@Src/index"

import Styles from "./App.module.less"

function voidFunc() {
  // pass
}

function App() {
  const [mouseDecoder, setMouseDecoder] = useState<MouseDecoder>()
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [scalar, setScalar] = useState(1)
  const onInit = useCallback((elem: HTMLDivElement | null) => {
    if (elem) {
      setMouseDecoder(new MouseDecoder(elem, false))
    }
  }, [])

  useEffect(() => {
    if (mouseDecoder) {
      mouseDecoder.subscribe()
      mouseDecoder.addListener("move", ({ vector }) => {
        setTranslate((prev) => ({
          x: prev.x + vector.x,
          y: prev.y + vector.y,
        }))
      })
      mouseDecoder.addListener("smoothMove", ({ vector }) => {
        setTranslate((prev) => ({
          x: prev.x + vector.x,
          y: prev.y + vector.y,
        }))
      })
      mouseDecoder.addListener("scale", ({ vector }) => {
        setScalar((prev) => {
          const y = vector.y * -0.2
          if (prev >= 1) {
            return prev + y
          }
          if (y > 0) {
            return prev + y
          }
          return prev * (1 + y)
        })
      })
      mouseDecoder.addListener("smoothScale", ({ vector }) => {
        setScalar((prev) => {
          const y = vector.y * -0.3
          if (prev >= 1) {
            return prev + y
          }
          if (y > 0) {
            return prev + y
          }
          return prev * (1 + y)
        })
      })
      return () => {
        mouseDecoder.removeAllListeners()
        mouseDecoder.unsubscribe()
      }
    }
    return voidFunc
  }, [mouseDecoder])

  return <div
    className={Styles.scrollElem}
    style={{
      transform: `translate(${translate.x}px,${translate.y}px) scale(${scalar},${scalar})`,
    }}
    ref={onInit}
  />
}

export default hot(App)
