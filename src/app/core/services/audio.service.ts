import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  enabled = true;
  toggle() { this.enabled = !this.enabled; }
}
