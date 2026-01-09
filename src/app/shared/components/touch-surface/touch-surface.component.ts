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
    const svg = el.querySelector('svg') as SVGSVGElement;
    
    if (!svg) {
      console.warn('SVG not found in touch surface');
      return;
    }

    // Get client coordinates
    const clientX = ev.clientX;
    const clientY = ev.clientY;
    
    // Get SVG position on screen
    const svgRect = svg.getBoundingClientRect();
    
    // Convert client coordinates to SVG coordinate system
    const pt = svg.createSVGPoint();
    pt.x = clientX - svgRect.left;
    pt.y = clientY - svgRect.top;
    
    // Apply inverse transformation to convert to viewBox coordinates
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) {
      console.warn('Could not get screen CTM');
      return;
    }
    
    const svgPt = pt.matrixTransform(screenCTM.inverse());
    
    // Get viewBox dimensions
    const viewBox = svg.viewBox.baseVal;
    const viewBoxWidth = viewBox.width;
    const viewBoxHeight = viewBox.height;
    
    // Normalize to [0, 1]
    // Note: The viewBox might have an offset, so we subtract the viewBox origin
    const nx = (svgPt.x - viewBox.x) / viewBoxWidth;
    let ny = (svgPt.y - viewBox.y) / viewBoxHeight;
    
    // Compensate for circle radius (6 pixels in 100-unit viewBox = 0.06)
    // The touch point is at the bottom edge of the circle, add radius to get center
    const circleRadiusNormalized = 6 / viewBoxHeight;
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
