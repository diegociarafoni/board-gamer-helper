export interface PlayerTouch {
  pointerId: number;
  x: number;
  y: number;
  isActive: boolean;
  graceUntil?: number;
}
