import { Injectable } from '@angular/core';

export type ColorMode = 'fixed' | 'random';

@Injectable({
  providedIn: 'root',
})
export class ColorService {

  mode: ColorMode = 'fixed';

  fixedPalette: string[] = [
    '#E53935', '#D81B60', '#8E24AA', '#5E35B1',
    '#3949AB', '#1E88E5', '#039BE5', '#00ACC1',
    '#00897B', '#43A047', '#FDD835', '#FB8C00',
  ];

  private randomCache = new Map<number, string>();

  setMode(mode: ColorMode): void {
    this.mode = mode;
    this.randomCache.clear();
  }

  getColor(index: number, darkTheme: boolean): string {
    if (this.mode === 'fixed' && index < this.fixedPalette.length) {
      return this.fixedPalette[index];
    }

    return this.getRandomColor(index, darkTheme);
  }

  private getRandomColor(index: number, dark: boolean): string {
    if (this.randomCache.has(index)) {
      return this.randomCache.get(index)!;
    }

    const hue = (index * 137.508) % 360;
    const saturation = 70;
    const lightness = dark ? 65 : 40;

    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    this.randomCache.set(index, color);
    return color;
  }
}
