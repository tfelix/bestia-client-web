export interface SpriteOffsets {
  targetSprite: string;
  scale: number;
  defaultCords: {
    x: number;
    y: number;
  };
  offsets: Array<{
    name: string;
    triggered: string;
    offsets: Array<{
      x: number;
      y: number;
    }>;
  }>;
}
