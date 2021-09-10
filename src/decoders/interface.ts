import Vector2 from "@Src/utils/Vector2"

export abstract class Decoder<T extends string> {
  public abstract center: Vector2;

  public abstract scalar: number;

  public abstract angle: number;

  public abstract addEventListeners(): void;

  public abstract removeEventListeners(): void;
}
