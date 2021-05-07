/**
 * Modulo operation with positive result for negative numbers (as % in JavaScript can give negative results).
 *
 * @param n base number {@type number}
 * @param m dividing number {@type number}
 * @return n modulo m {@type number}
 * @category Utils
 * @public
 */
export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}