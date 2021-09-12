export interface SimpleVector {
    x: number;
    y: number;
}
export interface SimpleVectorWithTime extends SimpleVector {
    time: number;
}
export declare class MouseHistory {
    protected WHEEL_DELTA_X: number;
    protected WHEEL_DELTA_Y: number;
    /**
     * 鼠标位置(包含time)列表
     */
    protected list: SimpleVectorWithTime[];
    /**
     * list 长度限制在 20
     */
    protected limit: number;
    /**
     * 计算平均速度时, 仅计算 50ms 以内的位置
     */
    protected timeLimit: number;
    /**
     * 返回两点间的向量(由 oldPosition 出发, 指向 newPosition)
     */
    protected getDelta(oldPosition?: SimpleVectorWithTime, newPosition?: SimpleVectorWithTime): SimpleVectorWithTime;
    /**
     * 计算最近一段时间(this.timeLimit)内所有点之间的速度
     */
    protected getSpeedList(): SimpleVectorWithTime[];
    push(p: SimpleVectorWithTime): MouseHistory;
    pushFromMouseEvent(e: MouseEvent): MouseHistory;
    pushFromWheelEvent(e: WheelEvent): MouseHistory;
    clear(): MouseHistory;
    getLastVector(): SimpleVectorWithTime;
    /**
     * 返回最后两个点间的位置向量
     */
    getLastDelta(): SimpleVectorWithTime;
    /**
     * 返回最后两个点间的速度(像素/ms)
     */
    getLastSpeed(): SimpleVectorWithTime;
    /**
     * 返回最近一段时间(this.timeLimit)内的平均速度(像素/ms)
     */
    getAvgSpeed(): SimpleVectorWithTime;
    static getPositionFromMouseEvent(e: MouseEvent | WheelEvent): SimpleVector;
}
