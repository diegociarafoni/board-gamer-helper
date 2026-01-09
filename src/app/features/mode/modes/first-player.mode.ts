import { GameMode } from '../../../core/models/mode.model';
import { PlayerTouch } from '../../../core/models/player.model';
import { ModeResult } from '../../../core/models/result.model';
import { shuffleInPlace } from './random.util';

export const FirstPlayerMode: GameMode = {
  id: 'first',
  title: 'Primo giocatore',

  compute(players: PlayerTouch[]): ModeResult {
    const ids = players.map(p => p.pointerId);
    shuffleInPlace(ids);

    return {
      mode: 'first',
      winnerPointerId: ids[0],
    };
  },
};
