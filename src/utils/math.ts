/**
 * Modulo operation with positive result for negative numbers (as % in JavaScript can give negative results).
 *
 * @param n base number
 * @param m dividing number
 */
export function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}