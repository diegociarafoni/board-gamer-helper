export type ModeResult =
  | { mode: 'first'; winnerPointerId: number }
  | { mode: 'order'; order: { pointerId: number; n: number }[] }
  | { mode: 'teams'; teams: { pointerId: number; team: 1 | 2 }[] };
