import EventEmitter from "eventemitter3";
import { MouseHistory, SimpleVector, SimpleVectorWithTime } from "@Src/utils/mouse-history";
declare type DecoderEvent = {
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
};
declare type MouseEventHandler = (e: MouseEvent) => void;
declare type WheelHandler = (e: WheelEvent) => void;
export declare class MouseDecoder extends EventEmitter<DecoderEvent> {
    /**
     * 监听的元素
     */
    triggerElement: HTMLElement;
    /**
     * 控制的元素
     */
    targetElement: HTMLElement;
    protected mouseMoveHistory: MouseHistory;
    protected wheelHistory: MouseHistory;
    /**
     * 鼠标是否按下
     */
    protected isMouseDown: boolean;
    protected smoothScaleFlag: number;
    /**
     * 用户停止"甩动"节点后, 有一个"制动距离"
     *
     * 制动发生时的初始速度(由制动前一段时间内的平均速度计算而来, 单位是像素/ms)通常为 0.5-1.0 左右
     *
     * 我们可以给这个"初始速度"乘以一个倍率, 该属性就是这个"倍率"
     */
    SMOOTH_MOVE_RATIO: number;
    /**
     * 用户停止"甩动"节点后的"制动时间"
     */
    SMOOTH_MOVE_DELTA_TIME: number;
    /**
     * 鼠标缩放比拖拽更加离散(通常滚动一次滚轮, 需要提供较大的缩放)
     *
     * 所以缩放事件拥有一个开关, 在滚轮事件触发伊始, 要么触发 scale, 要么触发 smoothScale, 二选一
     *
     * 而非像拖动事件那样, 拖动时触发 move, 拖动结束后触发 smoothMove
     */
    ENABLE_SMOOTH_SCALE: boolean;
    /**
     * 用户停止"缩放"节点后, 有一个"制动距离"
     *
     * 制动发生时的初始速度始终为 1, 表示每毫秒发生一次滚动
     *
     * 我们可以给这个"初始速度"乘以一个倍率, 该属性就是这个"倍率"
     */
    SMOOTH_SCALE_RATIO: number;
    /**
     * 用户停止"缩放"节点后的"制动时间"
     */
    SMOOTH_SCALE_DELTA_TIME: number;
    protected onMouseDown: MouseEventHandler;
    protected onMouseMove: MouseEventHandler;
    protected onMouseUp: MouseEventHandler;
    protected onWheel: WheelHandler;
    protected onDoubleClick: MouseEventHandler;
    protected smoothMove: (speed: SimpleVectorWithTime, ratio: number, prevRunTime: number, startTime: number, stopTime: number) => void;
    protected smoothScale: (speed: SimpleVectorWithTime, ratio: number, prevRunTime: number, startTime: number, stopTime: number, center: SimpleVector) => void;
    constructor(elememt: HTMLElement, targetElement?: HTMLElement, listen?: boolean);
    /**
     * 为相关节点添加事件监听
     */
    subscribe(): void;
    /**
     * 移除相关节点的事件监听
     */
    unsubscribe(): void;
}
export {};
