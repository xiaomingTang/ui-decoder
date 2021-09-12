import { hot } from "react-hot-loader/root"
import React, {
  useCallback, useEffect, useRef, useState,
} from "react"
import { Matrix3, Vector2 } from "three"

import "@Examples/global"
import { MouseDecoder } from "@Src/index"
import { geneWheelHandler } from "@Src/utils/scale"

import Styles from "./App.module.less"

const [wheelDeltaSetter, wheelDeltaToScalar] = geneWheelHandler()

function voidFunc() {
  // pass
}

function arrayToCssMatrix(arr: number[]) {
  return [
    arr[0], arr[1], arr[3], arr[4], arr[6], arr[7],
  ]
}

function App() {
  /**
   * element 没有施加 transform 之前的 center 坐标
   */
  const rawCenterRef = useRef(new Vector2())
  const [mouseDecoder, setMouseDecoder] = useState<MouseDecoder>()

  const matrixRef = useRef(new Matrix3())
  const [matrixArray, setMatrixArray] = useState(matrixRef.current.toArray())

  const onInit = useCallback((elem: HTMLDivElement | null) => {
    if (elem) {
      const tempMouseDecoder = new MouseDecoder(elem, elem, false)
      setMouseDecoder(tempMouseDecoder)
      const rect = tempMouseDecoder.targetElement.getBoundingClientRect()
      // css transform matrix 变换中心始终为 element 没有施加 transform 之前的 center 坐标
      rawCenterRef.current.set(
        (rect.left + rect.right) / 2,
        (rect.top + rect.bottom) / 2,
      )
    }
  }, [])

  // mouseDecoder 初始化
  useEffect(() => {
    if (mouseDecoder) {
      mouseDecoder.ENABLE_SMOOTH_SCALE = false
      mouseDecoder.subscribe()

      return () => {
        mouseDecoder.unsubscribe()
      }
    }
    return voidFunc
  }, [mouseDecoder])

  // mouseDecoder 事件监听
  useEffect(() => {
    if (mouseDecoder) {
      mouseDecoder.addListener("move", ({ vector }) => {
        matrixRef.current.translate(vector.x, vector.y)
        setMatrixArray(matrixRef.current.toArray())
      })
      mouseDecoder.addListener("smoothMove", ({ vector }) => {
        matrixRef.current.translate(vector.x, vector.y)
        setMatrixArray(matrixRef.current.toArray())
      })
      // 初步搞定缩放矩阵
      // @TODO: 缩放比例问题, 需要计算出当前元素尺寸, 结合尺寸给出最终缩放
      mouseDecoder.addListener("scale", ({ vector, center }) => {
        const sx = wheelDeltaToScalar(-vector.y)
        const sy = wheelDeltaToScalar(-vector.y)
        const x = rawCenterRef.current.x - center.x
        const y = rawCenterRef.current.y - center.y
        // 复合矩阵 http://staff.ustc.edu.cn/~lfdong/teach/2011cgbk/PPT/chp5.pdf
        // 算了, 不用复合矩阵了...
        matrixRef.current
          .translate(x, y)
          .scale(sx, sy)
          .translate(-x, -y)
        setMatrixArray(matrixRef.current.toArray())
      })
      mouseDecoder.addListener("smoothScale", ({ vector, center }) => {
        const sx = wheelDeltaToScalar(-vector.y)
        const sy = wheelDeltaToScalar(-vector.y)
        const x = rawCenterRef.current.x - center.x
        const y = rawCenterRef.current.y - center.y
        // 复合矩阵 http://staff.ustc.edu.cn/~lfdong/teach/2011cgbk/PPT/chp5.pdf
        // 算了, 不用复合矩阵了...
        matrixRef.current
          .translate(x, y)
          .scale(sx, sy)
          .translate(-x, -y)
        setMatrixArray(matrixRef.current.toArray())
      })
      return () => {
        mouseDecoder.removeAllListeners()
      }
    }
    return voidFunc
  }, [mouseDecoder])

  return <div
    className={Styles.scrollElem}
    style={{
      transform: `matrix(${arrayToCssMatrix(matrixArray).join(",")})`,
    }}
    ref={onInit}
  >
    <div className={Styles.inner}></div>
  </div>
}

export default hot(App)
