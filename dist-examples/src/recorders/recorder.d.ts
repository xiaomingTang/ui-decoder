export interface SimpleVectorWithTime {
    x: number;
    y: number;
    time: number;
}
export declare class Recorder {
    /**
     * 鼠标位置(包含time)列表
     */
    list: SimpleVectorWithTime[];
    /**
     * list 长度限制在 10
     */
    limit: number;
    /**
     * 计算平均速度时, 仅计算 50ms 以内的位置
     */
    timeLimit: number;
    /**
     * 返回两点间的向量(由 oldPosition 出发, 指向 newPosition)
     */
    getDelta(oldPosition?: SimpleVectorWithTime, newPosition?: SimpleVectorWithTime): SimpleVectorWithTime;
    /**
     * 计算最近一段时间(this.timeLimit)内所有点之间的速度
     */
    getSpeedList(): SimpleVectorWithTime[];
    push(p: SimpleVectorWithTime): this;
    clear(): this;
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
}
