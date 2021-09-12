/**
 * @author mrdoob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 * @author egraether / http://egraether.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */
export default class Vector2 {
    x: number;
    y: number;
    isVector2: boolean;
    constructor(x?: number, y?: number);
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    set(x: number, y: number): this;
    setScalar(scalar: number): this;
    setX(x: number): this;
    setY(y: number): this;
    setComponent(index: number, value: number): this;
    getComponent(index: number): number;
    clone(): Vector2;
    copy(v: Vector2): this;
    add(v: Vector2): this;
    addScalar(s: number): this;
    addVectors(a: Vector2, b: Vector2): this;
    addScaledVector(v: Vector2, s: number): this;
    sub(v: Vector2): this;
    subScalar(s: number): this;
    subVectors(a: Vector2, b: Vector2): this;
    multiply(v: Vector2): this;
    multiplyScalar(scalar: number): this;
    divide(v: Vector2): this;
    divideScalar(scalar: number): this;
    min(v: Vector2): this;
    max(v: Vector2): this;
    /**
     * min < max, componentwise
     */
    clamp(min: Vector2, max: Vector2): this;
    clampScalar(min: number, max: number): this;
    clampLength(min: number, max: number): this;
    floor(): this;
    ceil(): this;
    round(): this;
    roundToZero(): this;
    negate(): this;
    dot(v: Vector2): number;
    cross(v: Vector2): number;
    lengthSq(): number;
    length(): number;
    manhattanLength(): number;
    normalize(): this;
    angle(): number;
    distanceTo(v: Vector2): number;
    distanceToSquared(v: Vector2): number;
    manhattanDistanceTo(v: Vector2): number;
    setLength(length: number): this;
    lerp(v: Vector2, alpha: number): this;
    lerpVectors(v1: Vector2, v2: Vector2, alpha: number): this;
    equals(v: Vector2): boolean;
    fromArray(array: number[], offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
    rotateAround(center: Vector2, angle: number): this;
}
