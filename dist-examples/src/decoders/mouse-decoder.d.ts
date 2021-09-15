import EventEmitter from "eventemitter3";
import { Matrix3, Vector2 } from "three";
import { SimpleVectorWithTime } from "@Src/recorders/recorder";
import { MouseRecorder } from "@Src/recorders/mouse-recorder";
declare type DecoderEvent = {
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
};
declare type TouchEventHandler = (e: TouchEvent) => void;
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
    protected rawRect: DOMRect;
    protected rawCenter: Vector2;
    protected matrix: Matrix3;
    protected mouseMoveRecorder: MouseRecorder;
    protected wheelRecorder: MouseRecorder;
    /**
     * 鼠标是否按下
     */
    protected isMouseDown: boolean;
    protected smoothScaleFlag: number;
    protected touchEventEnabled: boolean;
    /**
     * 用户停止"甩动"节点后, 有一个"制动距离"
     *
     * 制动发生时的初始速度(由制动前一段时间内的平均速度计算而来, 单位是 像素/ms)通常为 0.5-1.0 左右
     *
     * 我们可以给这个"初始速度"乘以一个倍率, 该属性就是这个"倍率"
     */
    SMOOTH_MOVE_RATIO: number;
    /**
     * 用户停止"甩动"节点后的"制动函数"被调用的次数
     *
     * 次数越少, 停止得就越快
     *
     * this.SMOOTH_MOVE_RATIO 仅决定初始速度, 因此次数越多, "滑行"距离越远
     */
    SMOOTH_MOVE_LIMIT_RUN_TIMES: number;
    /**
     * 鼠标缩放比拖拽更加离散(通常滚动一次滚轮, 需要提供较大的缩放)
     *
     * 所以缩放事件拥有一个开关, 在滚轮事件触发伊始, 要么触发 scale, 要么触发 smoothScale, 二选一
     *
     * 而非像拖动事件那样, 拖动时触发 move, 拖动结束后触发 smoothMove
     */
    ENABLE_SMOOTH_SCALE: boolean;
    /**
     * 用户滚动一次滚轮时, 缩放的倍数
     */
    SCALE_RATIO: number;
    /**
     * 用户停止滚动滚轮后"smoothScale 制动函数"被调用的次数
     *
     * 次数越少, 停止得就越快
     *
     * 但最终的缩放倍数始终由 this.SCALE_RATIO 决定, 不因执行次数改变而改变
     */
    SMOOTH_SCALE_LIMIT_RUN_TIMES: number;
    protected onTouchStart: TouchEventHandler;
    protected onMouseDown: MouseEventHandler;
    protected onMouseMove: MouseEventHandler;
    protected onMouseUp: MouseEventHandler;
    protected onWheel: WheelHandler;
    onMove: (__0_0: {
        vector: SimpleVectorWithTime;
    }) => void;
    onScale: (__0_0: {
        /**
         * vector.y 表示滚轮滚动了 y 次(y > 0 表示向下滚, y < 0 表示向上滚)
         */
        vector: SimpleVectorWithTime;
        center: SimpleVectorWithTime;
    }) => void;
    protected render(): void;
    protected smoothMove(speed: SimpleVectorWithTime, ratio: number, RUN_TIMES?: number): void;
    /**
     * 原理: (1 / 10) + (1 / 11) + ... + (1 / N) === MAGIC_SUM
     *
     * scalar ** { [(1 / 10) + (1 / 11) + ... + (1 / N)] / MAGIC_SUM} ≈ scalar
     *
     * @param PREV_RUN_TIME 函数自己在循环中自动设置的变量, 手动调用时禁止设置/传入
     * @param MAGIC_TIMES 函数自己在循环中自动设置的变量, 手动调用时禁止设置/传入
     */
    protected smoothScale(speed: SimpleVectorWithTime, center: SimpleVectorWithTime, MAGIC_TIMES?: number): void;
    constructor(elememt: HTMLElement, targetElement?: HTMLElement, listen?: boolean);
    setRawRect(rect: DOMRect): void;
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
