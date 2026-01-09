import { GameMode } from '../../../core/models/mode.model';
import { PlayerTouch } from '../../../core/models/player.model';
import { ModeResult } from '../../../core/models/result.model';
import { shuffleInPlace } from './random.util';

export const TurnOrderMode: GameMode = {
  id: 'order',
  title: 'Ordine di gioco',

  compute(players: PlayerTouch[]): ModeResult {
    const ids = players.map(p => p.pointerId);
    shuffleInPlace(ids);

    return {
      mode: 'order',
      order: ids.map((pointerId, index) => ({
        pointerId,
        n: index + 1,
      })),
    };
  },
};
