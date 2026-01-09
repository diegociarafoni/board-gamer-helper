import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private dark = true;

  isDark() { return this.dark; }

  toggle() {
    this.dark = !this.dark;
    document.body.classList.toggle('dark', this.dark);
  }
}
