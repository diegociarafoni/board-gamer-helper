import { GameMode } from '../../../core/models/mode.model';
import { PlayerTouch } from '../../../core/models/player.model';
import { ModeResult } from '../../../core/models/result.model';
import { shuffleInPlace } from './random.util';

export const TeamsMode: GameMode = {
  id: 'teams',
  title: 'Squadre',

  compute(players: PlayerTouch[]): ModeResult {
    const ids = players.map(p => p.pointerId);
    shuffleInPlace(ids);

    const team1Size = Math.ceil(ids.length / 2);

    return {
      mode: 'teams',
      teams: ids.map((pointerId, index) => ({
        pointerId,
        team: (index < team1Size ? 1 : 2) as 1 | 2,
      })),
    };
  },
};
