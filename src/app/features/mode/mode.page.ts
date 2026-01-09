import { Component, computed, signal, ViewChild, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { TouchSurfaceComponent } from '../../shared/components/touch-surface/touch-surface.component';
import { ColorService } from '../../core/services/color.service';
import { PlayerTouch } from '../../core/models/player.model';
import { ModeId } from '../../core/models/mode.model';
import { FirstPlayerMode } from './modes/first-player.mode';
import { TurnOrderMode } from './modes/turn-order.mode';
import { TeamsMode } from './modes/teams.mode';
import { ModeResult, } from '../../core/models/result.model';

@Component({
  standalone: true,
  imports: [IonicModule, TouchSurfaceComponent],
  templateUrl: './mode.page.html',
  styleUrls: ['./mode.page.scss'],
})
export class ModePage implements OnDestroy {

  @ViewChild(TouchSurfaceComponent, { static: true }) touchSurface!: TouchSurfaceComponent;

  private playersSig = signal<PlayerTouch[]>([]);
  players = computed(() => this.playersSig());

  // countdown seconds remaining (null when not counting)
  countdown = signal<number | null>(null);

  // lock result until explicit restart
  resultLocked = signal(false);

  // frozen players snapshot after freeze
  frozenPlayers = signal<PlayerTouch[] | null>(null);

  // computed result after calling mode.compute
  result = signal<ModeResult | null>(null);

  // template-friendly computed accessors (Signals)
  countdownValue = computed(() => this.countdown());
  frozenPlayersVal = computed(() => this.frozenPlayers());
  resultVal = computed(() => this.result());

  // Plain JS getters for template type-checker (return primitive/arrays)
  get playersArray(): PlayerTouch[] {
    return this.playersSig();
  }

  get countdownNumber(): number | null {
    return this.countdown();
  }

  get resultValuePlain(): ModeResult | null {
    return this.result();
  }

  get isFirst(): boolean {
    return this.resultValuePlain?.mode === 'first';
  }

  get firstWinner(): number | null {
    return this.isFirst ? (this.resultValuePlain as any).winnerPointerId as number : null;
  }

  get isOrder(): boolean {
    return this.resultValuePlain?.mode === 'order';
  }

  get orderListPlain(): { pointerId:number; n:number }[] {
    return this.isOrder ? (this.resultValuePlain as any).order as { pointerId:number; n:number }[] : [];
  }

  get isTeams(): boolean {
    return this.resultValuePlain?.mode === 'teams';
  }

  get teamsListPlain(): { pointerId:number; team:1|2 }[] {
    return this.isTeams ? (this.resultValuePlain as any).teams as { pointerId:number; team:1|2 }[] : [];
  }

  // null-safe/result helpers for template type-narrowing
  hasResult = computed(() => this.result() !== null);
  isFirstResult = computed(() => this.result() !== null && this.result()!.mode === 'first');
  firstWinnerPointerId = computed(() => this.isFirstResult() ? (this.result() as any).winnerPointerId as number : null);

  isOrderResult = computed(() => this.result() !== null && this.result()!.mode === 'order');
  orderList = computed(() => this.isOrderResult() ? (this.result() as any).order as { pointerId:number; n:number }[] : []);

  isTeamsResult = computed(() => this.result() !== null && this.result()!.mode === 'teams');
  teamsList = computed(() => this.isTeamsResult() ? (this.result() as any).teams as { pointerId:number; team:1|2 }[] : []);

  modeId: ModeId;

  private timer: any = null;

  constructor(
    route: ActivatedRoute,
    public colors: ColorService,
  ) {
    this.modeId = route.snapshot.paramMap.get('id') as ModeId;
  }

  // helpers to map pointerId -> player index (0-based) using frozen snapshot when available
  getPlayerIndex(pointerId: number): number {
    const frozen = this.frozenPlayers();
    const list = frozen ?? this.playersSig();
    return list.findIndex(p => p.pointerId === pointerId);
  }

  getColorForPointer(pointerId: number): string {
    const idx = this.getPlayerIndex(pointerId);
    return idx >= 0 ? this.colors.getColor(idx, true) : '#888';
  }

  getPlayerNumber(pointerId: number): number | null {
    const idx = this.getPlayerIndex(pointerId);
    return idx >= 0 ? idx + 1 : null;
  }

  // Get circle color based on mode and phase
  getCircleColor(playerIndex: number, pointerId: number): string {
    // During countdown or if no result, show base colors for 'first' and 'order', grey for 'teams'
    if (!this.resultValuePlain) {
      if (this.modeId === 'teams') {
        return '#ccc'; // grey during countdown
      }
      return this.colors.getColor(playerIndex, true);
    }
    
    // After result
    if (this.modeId === 'teams' && this.isTeams) {
      // find team assignment for this pointer
      const t = this.teamsListPlain.find(x => x.pointerId === pointerId);
      if (t) {
        return this.getTeamColor(t.team);
      }
      return '#888';
    }

    return this.colors.getColor(playerIndex, true);
  }

  // Get order number for a player (only in 'order' mode after result)
  getOrderNumber(pointerId: number): number | null {
    if (this.modeId !== 'order' || !this.isOrder) {
      return null;
    }
    const orderItem = this.orderListPlain.find(o => o.pointerId === pointerId);
    return orderItem ? orderItem.n : null;
  }

  // Get team color (team 1 and team 2 with distinct colors)
  getTeamColor(team: 1 | 2): string {
    return team === 1 ? '#FF5252' : '#E91E63'; // red and pink
  }

  // map id -> mode implementation
  private getMode() {
    switch (this.modeId) {
      case 'first': return FirstPlayerMode;
      case 'order': return TurnOrderMode;
      case 'teams': return TeamsMode;
      default: return FirstPlayerMode;
    }
  }

  onPlayersChange(players: PlayerTouch[]) {
    // If a result is locked, do not update visual players, start/reset countdown
    // nor clear the result. This preserves the final state until the user
    // explicitly restarts.
    if (this.resultLocked()) {
      return;
    }

    // update players for visual feedback
    this.playersSig.set(players);

    // Only reset frozen/result if players are touching again during result phase
    // and the result is not locked. Once a result is computed we keep it
    // visible until the user explicitly clicks `Ricomincia`.
    if ((this.frozenPlayers() || this.result()) && players.length > 0) {
      this.frozenPlayers.set(null);
      this.result.set(null);
    }

    if (players.length === 0) {
      this.cancelCountdown();
      return;
    }

    // start or reset countdown whenever players touch
    this.startOrResetCountdown(5);
  }

  onFrozen(players: PlayerTouch[]) {
    // snapshot frozen players and compute result
    this.frozenPlayers.set(players);
    this.cancelCountdown();

    const mode = this.getMode();
    try {
      const computed = mode.compute(players);
      this.result.set(computed as ModeResult);
      // lock the result so it persists until user restarts
      this.resultLocked.set(true);
    } catch (e) {
      console.error('Mode compute error', e);
      this.result.set(null);
    }
  }

  private startOrResetCountdown(seconds: number) {
    if (this.resultLocked()) {
      return;
    }
    this.countdown.set(seconds);
    if (this.timer) {
      return; // already ticking, just reset value
    }

    this.timer = setInterval(() => {
      const cur = this.countdown();
      if (cur === null) {
        this.cancelCountdown();
        return;
      }
      if (cur <= 1) {
        // time up -> freeze the touch surface
        this.touchSurface?.freeze();
        this.countdown.set(null);
        this.cancelCountdown();
        return;
      }
      this.countdown.set(cur - 1);
    }, 1000);
  }

  private cancelCountdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.countdown.set(null);
  }

  restart() {
    // clear HUD/snapshots
    this.frozenPlayers.set(null);
    this.result.set(null);
    this.countdown.set(null);
    this.resultLocked.set(false);

    // clear visual players and reset touch surface internal state so
    // existing touches don't immediately re-populate the HUD
    this.playersSig.set([]);
    this.touchSurface?.clearPlayers();
  }

  ngOnDestroy(): void {
    this.cancelCountdown();
  }
}
