import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerTouch } from '../../../core/models/player.model';

@Component({
  selector: 'app-touch-surface',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './touch-surface.component.html',
  styleUrls: ['./touch-surface.component.scss'],
})
export class TouchSurfaceComponent {

  @ViewChild('surface', { static: true }) surface!: ElementRef<HTMLDivElement>;
  @Output() playersChange = new EventEmitter<PlayerTouch[]>();
  @Output() frozen = new EventEmitter<PlayerTouch[]>();

  private players = new Map<number, PlayerTouch>();

  onPointerDown(ev: PointerEvent) {
    const el = this.surface.nativeElement;
    const rect = el.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      console.warn('Touch surface has no size');
      return;
    }

    const nx = (ev.clientX - rect.left) / rect.width;
    let ny = (ev.clientY - rect.top) / rect.height;

    // Compensate for circle radius (6px in 100-unit viewBox = 0.06)
    // The touch point is at the bottom edge of the circle, add radius to get center.
    const circleRadiusNormalized = 6 / 100;
    ny = ny + circleRadiusNormalized;
    
    // Clamp to [0, 1]
    const x = Math.max(0, Math.min(1, nx));
    const y = Math.max(0, Math.min(1, ny));

    // diagnostics removed from production

    this.players.set(ev.pointerId, {
      pointerId: ev.pointerId,
      x,
      y,
      isActive: true,
    });
    this.emit();
  }

  onPointerUp(ev: PointerEvent) {
    this.players.delete(ev.pointerId);
    this.emit();
  }

  freeze() {
    this.frozen.emit([...this.players.values()]);
  }

  // Clear internal touches and notify listeners (used when restarting)
  clearPlayers() {
    this.players.clear();
    this.emit();
  }

  private emit() {
    this.playersChange.emit([...this.players.values()]);
  }
}
