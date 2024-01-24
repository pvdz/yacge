import {getFenString, getPieceIconAt} from "./serialize.js"

/**
 * Serialize a bitboard to a string with newlines
 *
 * @param bitboard {BigInt}
 * @param leadingNewline {boolean?}
 * @returns {string}
 */
export function $(bitboard, leadingNewline = false) {
  if (bitboard === undefined) return '$: bitboard is undefined';
  return (leadingNewline ? '\n' : '') + BigInt.asUintN(64, bitboard).toString(2).padStart(64, '0').match(/.{8}/g).join('\n')
}

/**
 * Serialize a bitboard to a string with newlines, including a preceeding newline
 *
 * @param bitboard {BigInt}
 * @returns {string}
 */
export function $$(bitboard) {
  return $(bitboard, true);
}

export function $$$(G, desc = '', preNewline = false) {
  const arr = [];
  for (let i=0n; i<64n; ++i) {
    arr.push(getPieceIconAt(G, 1n << i).icon);
  }

  let cellPadding = 1;
  return (preNewline ? '\n' : '') + [
    `/-${desc.padStart(Math.floor('abcdefgh'.length * cellPadding) / 2, '-').padEnd('abcdefgh'.length * cellPadding, '-')}-\\`,
    `| ${'abcdefgh'.split('').map(c => c.padStart(Math.floor(cellPadding / 2), ' ').padEnd(cellPadding, ' ')).join('')} |`,
    `|8${arr.slice(56,   ).reverse().map(n => (typeof n === 'string' ? n : `${n<0?'-':' '}${Math.abs(n)}`).padEnd(cellPadding, ' ')).join('')}8|`,
    `|7${arr.slice(48, 56).reverse().map(n => (typeof n === 'string' ? n : `${n<0?'-':' '}${Math.abs(n)}`).padEnd(cellPadding, ' ')).join('')}7|`,
    `|6${arr.slice(40, 48).reverse().map(n => (typeof n === 'string' ? n : `${n<0?'-':' '}${Math.abs(n)}`).padEnd(cellPadding, ' ')).join('')}6|`,
    `|5${arr.slice(32, 40).reverse().map(n => (typeof n === 'string' ? n : `${n<0?'-':' '}${Math.abs(n)}`).padEnd(cellPadding, ' ')).join('')}5|`,
    `|4${arr.slice(24, 32).reverse().map(n => (typeof n === 'string' ? n : `${n<0?'-':' '}${Math.abs(n)}`).padEnd(cellPadding, ' ')).join('')}4|`,
    `|3${arr.slice(16, 24).reverse().map(n => (typeof n === 'string' ? n : `${n<0?'-':' '}${Math.abs(n)}`).padEnd(cellPadding, ' ')).join('')}3|`,
    `|2${arr.slice( 8, 16).reverse().map(n => (typeof n === 'string' ? n : `${n<0?'-':' '}${Math.abs(n)}`).padEnd(cellPadding, ' ')).join('')}2|`,
    `|1${arr.slice( 0,  8).reverse().map(n => (typeof n === 'string' ? n : `${n<0?'-':' '}${Math.abs(n)}`).padEnd(cellPadding, ' ')).join('')}1|`,
    `| ${'abcdefgh'.split('').map(c => c.padStart(Math.floor(cellPadding / 2), ' ').padEnd(cellPadding, ' ')).join('')} |`,
    `\\-${'-'.repeat('abcdefgh'.length * cellPadding)}-/`,
  ].join('\n');

}

export function assert(a, b, desc) {
  if (a !== b) throw new Error(desc);
}

/**
 * @param {BigInt} bitboard
 * @param {boolean} [rev]
 * @returns {(0 | 1)[]}
 */
export function toBits(bitboard, rev = false) {
  const arr = [];
  for (let i=0n; i<64n; ++i) {
    arr.push(bitboard & (1n << i) ? 1 : 0);
  }
  if (rev) arr.reverse();
  return arr;
}

/**
 * @param {BigInt} bitboard
 * @returns {boolean[]}
 */
export function toBools(bitboard) {
  const arr = [];
  for (let i=0n; i<64n; ++i) {
    arr.push(Boolean(bitboard & (1n << i)));
  }
  return arr;
}

/**
 * @param {Game} G
 * @param {BigInt} i
 * @returns {number}
 */
function toCellPieceNetworkValue(G, i) {
  const n = 1n << i;
  if (!(G.white & G.black & n)) return 0;
  const piece = G.pawns & n ? 1 : G.rooks ? 2 : G.bishops ? 3 : G.knights ? 4 : G.kings ? 5 : G.queens ? 6 : invalid_game_state;
  // divide spaces into 13 regions (6 pieces, each color, and empty)
  const space = 1/13;
  return piece * space;
}

/**
 * Returns a list of numbers where each number represents the contents
 * of a cell of the board (one of the six pieces and its color, or empty)
 *
 * @param {Game} G
 * @returns {number[]}
 */
export function toCellBoard(G) {
  const arr = [];
  for (let i=0n; i<64n; ++i) {
    arr.push(toCellPieceNetworkValue(G, i));
  }
  return arr;
}
