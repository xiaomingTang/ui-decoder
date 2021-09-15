import { Recorder, SimpleVectorWithTime } from "./recorder";
export declare class TouchRecorder extends Recorder {
    pushFromTouch(touch: Touch): this;
    /**
     * 返回两点间的向量(由 oldPosition 出发, 指向 newPosition)
     */
    getDelta(oldPosition?: SimpleVectorWithTime, newPosition?: SimpleVectorWithTime): SimpleVectorWithTime;
}
