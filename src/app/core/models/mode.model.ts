export type ModeId = 'first' | 'order' | 'teams';

export interface GameMode {
  id: ModeId;
  title: string;
  compute(players: import('./player.model').PlayerTouch[]): import('./result.model').ModeResult;
}
