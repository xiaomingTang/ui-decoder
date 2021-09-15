import { Recorder, SimpleVectorWithTime } from "./recorder";
export declare class MouseRecorder extends Recorder {
    protected WHEEL_DELTA_X: number;
    protected WHEEL_DELTA_Y: number;
    pushFromMouseEvent(e: MouseEvent): this;
    pushFromWheelEvent(e: WheelEvent): this;
    static getPositionFromMouseEvent(e: MouseEvent | WheelEvent): SimpleVectorWithTime;
    static wheelDeltaToScalar(wheelDelta: SimpleVectorWithTime, ratio: number): SimpleVectorWithTime;
}
