/**
 * Convert a bitboard with at most one bit set to an index
 * @type {Map<BigInt, BigInt>}
 */
const singleBitToIndex = new Map;
for (let i=0n; i<64n; ++i) {
  singleBitToIndex.set(1n << i, i);
}
