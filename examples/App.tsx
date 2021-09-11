import { hot } from "react-hot-loader/root"
import React, {
  useCallback, useEffect, useState,
} from "react"

import "@Examples/global"
import { MouseDecoder } from "@Src/index"
import { geneWheelHandler } from "@Src/utils/scale"

import Styles from "./App.module.less"

function voidFunc() {
  // pass
}

const [wheelDeltaSetter, wheelDeltaToScalar] = geneWheelHandler()

function App() {
  const [mouseDecoder, setMouseDecoder] = useState<MouseDecoder>()
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [wheelDelta, setWheelDelta] = useState(0)
  const onInit = useCallback((elem: HTMLDivElement | null) => {
    if (elem) {
      setMouseDecoder(new MouseDecoder(elem, elem, false))
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
        setWheelDelta(wheelDeltaSetter(-vector.y))
      })
      mouseDecoder.addListener("smoothScale", ({ vector }) => {
        setWheelDelta(wheelDeltaSetter(-vector.y))
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
      transform: `translate(${translate.x}px,${translate.y}px) scale(${wheelDeltaToScalar(wheelDelta)},${wheelDeltaToScalar(wheelDelta)})`,
    }}
    ref={onInit}
  />
}

export default hot(App)
