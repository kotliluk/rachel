/**
 * Modulo operation with positive result for negative numbers (as % in JavaScript can give negative results).
 * If m is non-positive or any given number is NaN, Infinity or -Infinity, returns NaN.
 *
 * @param n base number {@type number}
 * @param m dividing number {@type number}
 * @return n modulo m {@type number}
 * @category Utils
 * @public
 */
export function mod (n: number, m: number): number {
  if (m > 0) {
    return ((n % m) + m) % m
  }
  return NaN
}
