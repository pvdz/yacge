/**
 * For each cell of a chess board, represent all the positions from which that cell might be attacked by a white pawn.
 * The x represents the position of the attacked cell for visual QoL only. It'll end up as a zero in the bitboard.
 * The ones represent all the positions where an opponent pawn can capture a piece on this cell.
 * (There are two sets since pawn moves are color-dependent and we can't represent that in the bitboard)
 * @type {BigInt[]}
 */
export const whitePawnsThatCanCaptureOn = [
  // Bottom rows should not be possible in any way but whatever
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,

  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0000000x
    00000010
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    000000x0
    00000101
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000x00
    00001010
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0000x000
    00010100
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    000x0000
    00101000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00x00000
    01010000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0x000000
    10100000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    x0000000
    01000000
  `,

  `
    00000000
    00000000
    00000000
    00000000
    00000000
    0000000x
    00000010
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    000000x0
    00000101
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000x00
    00001010
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    0000x000
    00010100
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    000x0000
    00101000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00x00000
    01010000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    0x000000
    10100000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    x0000000
    01000000
    00000000
  `,

  `
    00000000
    00000000
    00000000
    00000000
    0000000x
    00000010
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    000000x0
    00000101
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000x00
    00001010
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    0000x000
    00010100
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    000x0000
    00101000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00x00000
    01010000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    0x000000
    10100000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    x0000000
    01000000
    00000000
    00000000
  `,

  `
    00000000
    00000000
    00000000
    0000000x
    00000010
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    000000x0
    00000101
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000x00
    00001010
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    0000x000
    00010100
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    000x0000
    00101000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00x00000
    01010000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    0x000000
    10100000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    x0000000
    01000000
    00000000
    00000000
    00000000
  `,

  `
    00000000
    00000000
    0000000x
    00000010
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    000000x0
    00000101
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000x00
    00001010
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    0000x000
    00010100
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    000x0000
    00101000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00x00000
    01010000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    0x000000
    10100000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    x0000000
    01000000
    00000000
    00000000
    00000000
    00000000
  `,

  `
    00000000
    0000000x
    00000010
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    000000x0
    00000101
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000x00
    00001010
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    0000x000
    00010100
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    000x0000
    00101000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00x00000
    01010000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    0x000000
    10100000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    x0000000
    01000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,

  `
    0000000x
    00000010
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    000000x0
    00000101
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000x00
    00001010
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    0000x000
    00010100
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    000x0000
    00101000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00x00000
    01010000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    0x000000
    10100000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    x0000000
    01000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
].map(s => BigInt(`0b${s.replace('x', '0').replace(/\s/g, '')}`));

// The pawn captures for black are the same but in a vertically mirrored position.
// To flip the board we can literally reverse the bits. We then have to reverse the array such that the index-to-pawn-on-index mapping matches.
// We'll do this in a hacky quick way here because why not.
export const blackPawnsThatCanCaptureOn = whitePawnsThatCanCaptureOn.map(n => BigInt('0b' +
  //   00000000    00000000
  //   00000000    00010100
  //   00000000    0000x000
  //   00000000 -> 00000000
  //   00000000    00000000
  //   00x00000    00000000
  //   01010000    00000000
  //   00000000    00000000
  n
  .toString(2)
  .padStart(64, '0')
  .split('')
  .reverse()
  .join('')
)).reverse();

/**
 * @type {BigInt[]}
 */
export const whitePawnsThatCanMoveTo = [
  // Bottom rows should not be possible in any way but whatever
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0000000x
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    000000x0
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000x00
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0000x000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    000x0000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00x00000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0x000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    x0000000
  `,

  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0000000x
    00000001
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    000000x0
    00000010
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000x00
    00000100
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0000x000
    00001000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    000x0000
    00010000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00x00000
    00100000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    0x000000
    01000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    x0000000
    10000000
  `,

  `
    00000000
    00000000
    00000000
    00000000
    00000000
    0000000x
    00000001
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    000000x0
    00000010
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000x00
    00000100
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    0000x000
    00001000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    000x0000
    00010000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00x00000
    00100000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    0x000000
    01000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    x0000000
    10000000
    00000000
  `,

  `
    00000000
    00000000
    00000000
    00000000
    0000000x
    00000001
    00000001
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    000000x0
    00000010
    00000010
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000x00
    00000100
    00000100
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    0000x000
    00001000
    00001000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    000x0000
    00010000
    00010000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00x00000
    00100000
    00100000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    0x000000
    01000000
    01000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    x0000000
    10000000
    10000000
    00000000
  `,

  `
    00000000
    00000000
    00000000
    0000000x
    00000001
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    000000x0
    00000010
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000x00
    00000100
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    0000x000
    00001000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    000x0000
    00010000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00x00000
    00100000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    0x000000
    01000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    x0000000
    10000000
    00000000
    00000000
    00000000
  `,

  `
    00000000
    00000000
    0000000x
    00000001
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    000000x0
    00000010
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000x00
    00000100
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    0000x000
    00001000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    000x0000
    00010000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00x00000
    00100000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    0x000000
    01000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    x0000000
    10000000
    00000000
    00000000
    00000000
    00000000
  `,

  `
    00000000
    0000000x
    00000001
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    000000x0
    00000010
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000x00
    00000100
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    0000x000
    00001000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    000x0000
    00010000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00x00000
    00100000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    0x000000
    01000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    x0000000
    10000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,

  `
    0000000x
    00000001
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    000000x0
    00000010
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000x00
    00000100
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    0000x000
    00001000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    000x0000
    00010000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00x00000
    00100000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    0x000000
    01000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    x0000000
    10000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
].map(s => BigInt(`0b${s.replace('x', '0').replace(/\s/g, '')}`));

/**
 * @type {BigInt[]}
 */
export const blackPawnsThatCanMoveTo = whitePawnsThatCanMoveTo.map(n => BigInt('0b' +
  //   00000000    00000000
  //   00000000    00011100
  //   00000000    0000x000
  //   00000000 -> 00000000
  //   00000000    00000000
  //   00x00000    00000000
  //   01110000    00000000
  //   00000000    00000000
  n
  .toString(2)
  .padStart(64, '0')
  .split('')
  .reverse()
  .join('')
)).reverse();

/**
 * For each index, representing a cell index, list an array of cell indices where this white pawn
 * could potentially move to or capture from that cell (provided the board state allows it).
 * Note: In a normal game it is not possible to have pawns on the last two ranks (closest to the player)
 * Note: array looks transposed (the first "top-left" cell in the array is h1 on the board)
 *
 * Generated through:
 *   for (let x=0; x<8; ++x) {
 *     for (let y=0; y<8; ++y) {
 *       const n = x + y*8;
 *       whitePawnCellToMoveCells[n] = [];
 *       if (y === 1) whitePawnCellToMoveCells[n].push(BigInt(x + (y+2) * 8));
 *       if (y < 7) {
 *         whitePawnCellToMoveCells[n].push(BigInt(x + (y+1) * 8));
 *         if (x > 0) whitePawnCellToMoveCells[n].push(BigInt((x-1) + (y+1) * 8));
 *         if (x < 7) whitePawnCellToMoveCells[n].push(BigInt((x+1) + (y+1) * 8));
 *       }
 *     }
 *   }
 *
 * @type {BigInt[][]}
 */
export const whitePawnCellToMoveCells = [
  [ 8n, 9n ],        [ 9n, 8n, 10n ],        [ 10n, 9n, 11n ],       [ 11n, 10n, 12n ],       [ 12n, 11n, 13n ],      [ 13n, 12n, 14n ],      [ 14n, 13n, 15n ],      [ 15n, 14n ],
  [ 24n, 16n, 17n ], [ 25n, 17n, 16n, 18n ], [ 26n, 18n, 17n, 19n ], [ 27n, 19n, 18n, 20n ],  [ 28n, 20n, 19n, 21n ], [ 29n, 21n, 20n, 22n ], [ 30n, 22n, 21n, 23n ], [ 31n, 23n, 22n ],
  [ 24n, 25n ],      [ 25n, 24n, 26n ],      [ 26n, 25n, 27n ],      [ 27n, 26n, 28n ],       [ 28n, 27n, 29n ],      [ 29n, 28n, 30n ],      [ 30n, 29n, 31n ],      [ 31n, 30n ],
  [ 32n, 33n ],      [ 33n, 32n, 34n ],      [ 34n, 33n, 35n ],      [ 35n, 34n, 36n ],       [ 36n, 35n, 37n ],      [ 37n, 36n, 38n ],      [ 38n, 37n, 39n ],      [ 39n, 38n ],
  [ 40n, 41n ],      [ 41n, 40n, 42n ],      [ 42n, 41n, 43n ],      [ 43n, 42n, 44n ],       [ 44n, 43n, 45n ],      [ 45n, 44n, 46n ],      [ 46n, 45n, 47n ],      [ 47n, 46n ],
  [ 48n, 49n ],      [ 49n, 48n, 50n ],      [ 50n, 49n, 51n ],      [ 51n, 50n, 52n ],       [ 52n, 51n, 53n ],      [ 53n, 52n, 54n ],      [ 54n, 53n, 55n ],      [ 55n, 54n ],
  [ 56n, 57n ],      [ 57n, 56n, 58n ],      [ 58n, 57n, 59n ],      [ 59n, 58n, 60n ],       [ 60n, 59n, 61n ],      [ 61n, 60n, 62n ],      [ 62n, 61n, 63n ],      [ 63n, 62n ],
  [],                [],                     [],                     [],                      [],                     [],                     [],                     [],
];

/**
 * For each index, representing a cell index, list an array of cell indices where this black pawn
 * could potentially move to or capture from that cell (provided the board state allows it).
 * Note: In a normal game it is not possible to have pawns on the last two ranks (closest to the player)
 * Note: array looks transposed (the first "top-left" cell in the array is h1 on the board)
 *
 * Generated through:
 *   for (let x=0; x<8; ++x) {
 *     for (let y=0; y<8; ++y) {
 *       const n = x + y*8;
 *       blackPawnCellToMoveCells[n] = [];
 *       if (y === 6) blackPawnCellToMoveCells[n].push(BigInt(x + (y-2) * 8));
 *       if (y > 0) {
 *         blackPawnCellToMoveCells[n].push(BigInt(x + (y-1) * 8));
 *         if (x > 0) blackPawnCellToMoveCells[n].push(BigInt((x-1) + (y-1) * 8));
 *         if (x < 7) blackPawnCellToMoveCells[n].push(BigInt((x+1) + (y-1) * 8));
 *       }
 *     }
 *   }
 *
 * @type {BigInt[][]}
 */
export const blackPawnCellToMoveCells = [
  [],                [],                     [],                     [],                     [],                     [],                     [],                     [],
  [ 0n, 1n ],        [ 1n, 0n, 2n ],         [ 2n, 1n, 3n ],         [ 3n, 2n, 4n ],         [ 4n, 3n, 5n ],         [ 5n, 4n, 6n ],         [ 6n, 5n, 7n ],         [ 7n, 6n ],
  [ 8n, 9n ],        [ 9n, 8n, 10n ],        [ 10n, 9n, 11n ],       [ 11n, 10n, 12n ],      [ 12n, 11n, 13n ],      [ 13n, 12n, 14n ],      [ 14n, 13n, 15n ],      [ 15n, 14n ],
  [ 16n, 17n ],      [ 17n, 16n, 18n ],      [ 18n, 17n, 19n ],      [ 19n, 18n, 20n ],      [ 20n, 19n, 21n ],      [ 21n, 20n, 22n ],      [ 22n, 21n, 23n ],      [ 23n, 22n ],
  [ 24n, 25n ],      [ 25n, 24n, 26n ],      [ 26n, 25n, 27n ],      [ 27n, 26n, 28n ],      [ 28n, 27n, 29n ],      [ 29n, 28n, 30n ],      [ 30n, 29n, 31n ],      [ 31n, 30n ],
  [ 32n, 33n ],      [ 33n, 32n, 34n ],      [ 34n, 33n, 35n ],      [ 35n, 34n, 36n ],      [ 36n, 35n, 37n ],      [ 37n, 36n, 38n ],      [ 38n, 37n, 39n ],      [ 39n, 38n ],
  [ 32n, 40n, 41n ], [ 33n, 41n, 40n, 42n ], [ 34n, 42n, 41n, 43n ], [ 35n, 43n, 42n, 44n ], [ 36n, 44n, 43n, 45n ], [ 37n, 45n, 44n, 46n ], [ 38n, 46n, 45n, 47n ], [ 39n, 47n, 46n ],
  [ 48n, 49n ],      [ 49n, 48n, 50n ],      [ 50n, 49n, 51n ],      [ 51n, 50n, 52n ],      [ 52n, 51n, 53n ],      [ 53n, 52n, 54n ],      [ 54n, 53n, 55n ],      [ 55n, 54n ],
];
