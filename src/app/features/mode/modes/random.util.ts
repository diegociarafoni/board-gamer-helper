/**
 * Shuffle in-place usando Fisher–Yates.
 * Usa crypto se disponibile per maggiore qualità.
 */
export function shuffleInPlace<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomInt(min: number, max: number): number {
  const range = max - min;

  // Web Crypto API (browser moderni / Capacitor)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return min + (buffer[0] % range);
  }

  // Fallback (non crittografico)
  return min + Math.floor(Math.random() * range);
}
