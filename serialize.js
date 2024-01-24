import {
  NO_CELL_I,
  indexToId,
  whiteKing,
  whiteRook,
  blackRook,
  blackQueen,
  whiteKnight,
  whiteQueen,
  blackKing,
  blackKnight, whiteBishop, blackBishop, whitePawn, blackPawn
} from './constants.js';

/**
 * @param G {Game}
 * @param {BigInt} bitboardCellN
 * @returns {{color: 'black'|'white', icon: string}}
 */
export function getPieceIconAt(G, bitboardCellN) {
  if (G.kings & bitboardCellN) return (G.white & bitboardCellN) ? {color: 'white', icon: whiteKing} : {color: 'black', icon: blackKing};
  if (G.queens & bitboardCellN) return (G.white & bitboardCellN) ? {color: 'white', icon: whiteQueen} : {color: 'black', icon: blackQueen};
  if (G.rooks & bitboardCellN) return (G.white & bitboardCellN) ? {color: 'white', icon: whiteRook} : {color: 'black', icon: blackRook};
  if (G.knights & bitboardCellN) return (G.white & bitboardCellN) ? {color: 'white', icon: whiteKnight} : {color: 'black', icon: blackKnight};
  if (G.bishops & bitboardCellN) return (G.white & bitboardCellN) ? {color: 'white', icon: whiteBishop} : {color: 'black', icon: blackBishop};
  if (G.pawns & bitboardCellN) return (G.white & bitboardCellN) ? {color: 'white', icon: whitePawn} : {color: 'black', icon: blackPawn};
  return {color: 'white', icon: ''};
}

/**
 * @param G {Game}
 * @param {BigInt} bitboardCellN
 * @param {boolean} [p] Return P for pawns or empty string?
 * @returns {'P' | 'R' | 'N' | 'B' | 'Q' | 'K' | ''}
 */
export function getPieceCodeAt(G, bitboardCellN, p = true) {
  if (G.kings & bitboardCellN) return 'K';
  if (G.queens & bitboardCellN) return 'Q';
  if (G.rooks & bitboardCellN) return 'R';
  if (G.knights & bitboardCellN) return 'N';
  if (G.bishops & bitboardCellN) return 'B';
  if (G.pawns & bitboardCellN) return p ? 'P' : '';
  return '';
}

/**
 * @param {Game} G
 * @returns {{str: string, alnum: string, num: BigInt, hex: string, ascii: string, fenish: string}}
 */
function getBoardHash(G) {
  /**
   * @type {BigInt}
   */
  const num =
    (G.black << (7n * 64n)) |
    (G.white << (6n * 64n)) |
    (G.rooks << (5n * 64n)) |
    (G.bishops << (4n * 64n)) |
    (G.knights << (3n * 64n)) |
    (G.queens << (2n * 64n)) |
    (G.kings << (1n * 64n)) |
    (G.pawns << (0n * 64n))
  ;

  let alnum = '';
  let n = num;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const len = BigInt(chars.length);
  while (n > 0) {
    alnum += chars[n % len];
    n = n / len;
  }

  let ascii = '';
  let m = num;
  while (m > 0) {
    const wat = Number(m % 256n);
    ascii += String.fromCharCode(wat);
    m = m / 256n;
  }

  let fenish = getFenishString(G);

  return {
    num,
    hex: num.toString(36),
    alnum,
    ascii,
    fenish,
    str: `${G.black}:${G.white}:${G.rooks}:${G.bishops}:${G.knights}:${G.queens}:${G.kings}:${G.pawns}`
  };
}

/**
 * @param G {Game}
 * @returns {string}
 */
export function getFenishString(G) {
  // See getFenString for a regular FEN string

  let str = '';
  let b = 0; // buffer of empty cells
  for (let i=0n; i<64n; ++i) {
    const n = 1n << i;
    if (G.white & n) {
      if (b) {
        str += b;
        b = 0;
      }
      str +=
        (G.rooks & n) ? 'R'
        : (G.bishops & n) ? 'B'
        : (G.knights & n) ? 'N'
        : (G.queens & n) ? 'Q'
        : (G.kings & n) ? 'K'
        : 'P';
    } else if (G.black & n) {
      if (b) {
        str += b;
        b = 0;
      }
      str +=
        (G.rooks & n) ? 'r'
        : (G.bishops & n) ? 'b'
        : (G.knights & n) ? 'n'
        : (G.queens & n) ? 'q'
        : (G.kings & n) ? 'k'
        : 'p';
    } else {
      b += 1;
    }
  }
  // Drop any trailing empty squares. They are not relevant for the hash.
  // This means the string can not have trailing digits. We can use it to encode castling. There are 4 cases, 2^4=16 options.
  // Only the B is ambiguous with a bishop, but we can replace that with a Z or whatever.

  // Castling is part of the 50 move rule so we have to encode it.
  // (En-passant is too, but it's impossible to repeat an en passant position since pawns can't move backwards)
  const castle = (G.castleKingsideWhite ? 1 : 0) | (G.castleKingsideBlack ? 2 : 0) | (G.castleQueensideWhite ? 4 : 0) | (G.castleQueensideBlack ? 8 : 0);
  if (castle) str += castle;

  return str;
}

/**
 * @param G {Game}
 * @returns {string}
 */
export function getFenString(G) {
  let fenState = '';
  let fenRank = '';
  for (let i=0n; i<64n; ++i) {
    const n = 1n << i;
    const icon =
      (G.rooks & n)
      ? ((G.white & n) ? 'R' : 'r')
      : (G.bishops & n)
      ? ((G.white & n) ? 'B' : 'b')
      : (G.knights & n)
      ? ((G.white & n) ? 'N' : 'n')
      : (G.queens & n)
      ? ((G.white & n) ? 'Q' : 'q')
      : (G.kings & n)
      ? ((G.white & n) ? 'K' : 'k')
      : (G.pawns & n)
      ? ((G.white & n) ? 'P' : 'p')
      : ' ';
    if (i > 0 && i % 8n === 0n) {
      // Start of next rank after the first
      fenState = '/' + fenState;
    }
    fenState = icon + fenState;
  }
  fenState += fenRank;
  // TODO: improve this replace by just buffering the empty cells instead
  fenState = fenState.replace(/ +/g, (str) => String(str.length));
  fenState += ' ' + (G.turnWhite ? 'w' : 'b');
  fenState += ' ' + (((G.castleKingsideWhite ? 'K' : '') + (G.castleQueensideWhite ? 'Q' : '') + (G.castleKingsideBlack ? 'k' : '') + (G.castleQueensideBlack ? 'q' : '')) || '-');
  fenState += ' ' + (G.enpassant === NO_CELL_I ? '-' : indexToId[G.enpassant]);
  fenState += ' ' + String(G.fiftyTurnCounter);
  fenState += ' ' + String(G.fullTurnCounter);

  return fenState;
}
