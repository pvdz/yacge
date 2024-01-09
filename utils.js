/**
 * Serialize a bitboard to a string with newlines
 *
 * @param bitboard {BigInt}
 * @param leadingNewline {boolean?}
 * @returns {string}
 */
function $(bitboard, leadingNewline = false) {
  if (bitboard === undefined) return '$: bitboard is undefined';
  return (leadingNewline ? '\n' : '') + BigInt.asUintN(64, bitboard).toString(2).padStart(64, '0').match(/.{8}/g).join('\n')
}

/**
 * Serialize a bitboard to a string with newlines, including a preceeding newline
 *
 * @param bitboard {BigInt}
 * @returns {string}
 */
function $$(bitboard) {
  return $(bitboard, true);
}

function assert(a, b, desc) {
  if (a !== b) throw new Error(desc);
}

/**
 * @param {BigInt} bitboard
 * @returns {(0 | 1)[]}
 */
function toBits(bitboard) {
  const arr = [];
  for (let i=0n; i<64n; ++i) {
    arr.push(bitboard & (1n << i) ? 1 : 0);
  }
  return arr;
}

if (typeof module !== 'undefined' && module?.exports !== undefined) {
  module.exports.toBits = toBits;
}
