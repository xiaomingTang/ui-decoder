import { SimpleVectorWithTime } from "./recorder";
import { TouchRecorder } from "./touch-recorder";
export declare class TouchListRecorder {
    list: TouchRecorder[];
    updateList(newList: TouchRecorder[]): this;
    updateListFromTouchList(touchList: TouchList | Touch[]): this;
    clear(): this;
    getDelta(oldTouchA: SimpleVectorWithTime, newTouchA: SimpleVectorWithTime, oldTouchB: SimpleVectorWithTime, newTouchB: SimpleVectorWithTime): {
        move: null;
        scalar: null;
        rotate: null;
        center: null;
    } | {
        move: {
            x: number;
            y: number;
            time: number;
        };
        scalar: {
            x: number;
            y: number;
            time: number;
        };
        rotate: {
            angle: number;
            time: number;
        } | null;
        center: {
            x: number;
            y: number;
            time: number;
        };
    };
    getLastDelta(): {
        move: null;
        scalar: null;
        rotate: null;
        center: null;
    } | {
        move: {
            x: number;
            y: number;
            time: number;
        };
        scalar: {
            x: number;
            y: number;
            time: number;
        };
        rotate: {
            angle: number;
            time: number;
        } | null;
        center: {
            x: number;
            y: number;
            time: number;
        };
    };
}
