/**
 * For each cell of a chess board, represent all the valid move targets for a king on that cell.
 * The K represents the position of the king for visual QoL only. It'll end up as a zero in the bitboard.
 * The ones represent valid move targets for a king, notwithstanding actual board state rules.
 * @type {BigInt[]}
 */
export const kingMoves = [
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000011
    0000001K
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000111
    000001K1
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00001110
    00001K10
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00011100
    0001K100
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00111000
    001K1000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    01110000
    01K10000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    11100000
    1K100000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
    11000000
    K1000000
  `,

  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000011
    0000001K
    00000011
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00000111
    000001K1
    00000111
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00001110
    00001K10
    00001110
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00011100
    0001K100
    00011100
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    00111000
    001K1000
    00111000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    01110000
    01K10000
    01110000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    11100000
    1K100000
    11100000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000000
    11000000
    K1000000
    11000000
  `,

  `
    00000000
    00000000
    00000000
    00000000
    00000011
    0000001K
    00000011
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00000111
    000001K1
    00000111
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00001110
    00001K10
    00001110
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00011100
    0001K100
    00011100
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    00111000
    001K1000
    00111000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    01110000
    01K10000
    01110000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    11100000
    1K100000
    11100000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000000
    11000000
    K1000000
    11000000
    00000000
  `,

  `
    00000000
    00000000
    00000000
    00000011
    0000001K
    00000011
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00000111
    000001K1
    00000111
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00001110
    00001K10
    00001110
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00011100
    0001K100
    00011100
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    00111000
    001K1000
    00111000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    01110000
    01K10000
    01110000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    11100000
    1K100000
    11100000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000000
    11000000
    K1000000
    11000000
    00000000
    00000000
  `,

  `
    00000000
    00000000
    00000011
    0000001K
    00000011
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00000111
    000001K1
    00000111
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00001110
    00001K10
    00001110
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00011100
    0001K100
    00011100
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    00111000
    001K1000
    00111000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    01110000
    01K10000
    01110000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    11100000
    1K100000
    11100000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000000
    11000000
    K1000000
    11000000
    00000000
    00000000
    00000000
  `,

  `
    00000000
    00000011
    0000001K
    00000011
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00000111
    000001K1
    00000111
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00001110
    00001K10
    00001110
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00011100
    0001K100
    00011100
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    00111000
    001K1000
    00111000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    01110000
    01K10000
    01110000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    11100000
    1K100000
    11100000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000000
    11000000
    K1000000
    11000000
    00000000
    00000000
    00000000
    00000000
  `,

  `
    00000011
    0000001K
    00000011
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00000111
    000001K1
    00000111
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00001110
    00001K10
    00001110
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00011100
    0001K100
    00011100
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00111000
    001K1000
    00111000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    01110000
    01K10000
    01110000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    11100000
    1K100000
    11100000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    11000000
    K1000000
    11000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,

  `
    0000001K
    00000011
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    000001K1
    00000111
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    00001K10
    00001110
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    0001K100
    00011100
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    001K1000
    00111000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    01K10000
    01110000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    1K100000
    11100000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
  `
    K1000000
    11000000
    00000000
    00000000
    00000000
    00000000
    00000000
    00000000
  `,
].map(s => BigInt(`0b${s.replace('K', '0').replace(/\s/g, '')}`));

/**
 * For each index, representing a cell index, list an array of cell indices where this
 * king could potentially move to from that cell (provided the board state allows it)
 *
 * Generated through:
 *   for (let n=0n; n<64n; ++n) {
 *     kingCellToMoveCells[n] = [];
 *     for (let i=0n; i<64n; ++i) {
 *       if (kingMoves[n] & (1n << i)) kingCellToMoveCells[n].push(i);
 *     }
 *   }
 *
 * @type {BigInt[][]}
 */
export const kingCellToMoveCells = [
  [  1n,  8n,  9n ],
  [  0n,  2n,  8n,  9n, 10n ],
  [  1n,  3n,  9n, 10n, 11n ],
  [  2n,  4n, 10n, 11n, 12n ],
  [  3n,  5n, 11n, 12n, 13n ],
  [  4n,  6n, 12n, 13n, 14n ],
  [  5n,  7n, 13n, 14n, 15n ],
  [  6n, 14n, 15n ],
  [  0n,  1n,  9n, 16n, 17n ],
  [  0n,  1n,  2n,  8n, 10n, 16n, 17n, 18n ],
  [  1n,  2n,  3n,  9n, 11n, 17n, 18n, 19n ],
  [  2n,  3n,  4n, 10n, 12n, 18n, 19n, 20n ],
  [  3n,  4n,  5n, 11n, 13n, 19n, 20n, 21n ],
  [  4n,  5n,  6n, 12n, 14n, 20n, 21n, 22n ],
  [  5n,  6n,  7n, 13n, 15n, 21n, 22n, 23n ],
  [  6n,  7n, 14n, 22n, 23n ],
  [  8n,  9n, 17n, 24n, 25n ],
  [  8n,  9n, 10n, 16n, 18n, 24n, 25n, 26n ],
  [  9n, 10n, 11n, 17n, 19n, 25n, 26n, 27n ],
  [ 10n, 11n, 12n, 18n, 20n, 26n, 27n, 28n ],
  [ 11n, 12n, 13n, 19n, 21n, 27n, 28n, 29n ],
  [ 12n, 13n, 14n, 20n, 22n, 28n, 29n, 30n ],
  [ 13n, 14n, 15n, 21n, 23n, 29n, 30n, 31n ],
  [ 14n, 15n, 22n, 30n, 31n ],
  [ 16n, 17n, 25n, 32n, 33n ],
  [ 16n, 17n, 18n, 24n, 26n, 32n, 33n, 34n ],
  [ 17n, 18n, 19n, 25n, 27n, 33n, 34n, 35n ],
  [ 18n, 19n, 20n, 26n, 28n, 34n, 35n, 36n ],
  [ 19n, 20n, 21n, 27n, 29n, 35n, 36n, 37n ],
  [ 20n, 21n, 22n, 28n, 30n, 36n, 37n, 38n ],
  [ 21n, 22n, 23n, 29n, 31n, 37n, 38n, 39n ],
  [ 22n, 23n, 30n, 38n, 39n ],
  [ 24n, 25n, 33n, 40n, 41n ],
  [ 24n, 25n, 26n, 32n, 34n, 40n, 41n, 42n ],
  [ 25n, 26n, 27n, 33n, 35n, 41n, 42n, 43n ],
  [ 26n, 27n, 28n, 34n, 36n, 42n, 43n, 44n ],
  [ 27n, 28n, 29n, 35n, 37n, 43n, 44n, 45n ],
  [ 28n, 29n, 30n, 36n, 38n, 44n, 45n, 46n ],
  [ 29n, 30n, 31n, 37n, 39n, 45n, 46n, 47n ],
  [ 30n, 31n, 38n, 46n, 47n ],
  [ 32n, 33n, 41n, 48n, 49n ],
  [ 32n, 33n, 34n, 40n, 42n, 48n, 49n, 50n ],
  [ 33n, 34n, 35n, 41n, 43n, 49n, 50n, 51n ],
  [ 34n, 35n, 36n, 42n, 44n, 50n, 51n, 52n ],
  [ 35n, 36n, 37n, 43n, 45n, 51n, 52n, 53n ],
  [ 36n, 37n, 38n, 44n, 46n, 52n, 53n, 54n ],
  [ 37n, 38n, 39n, 45n, 47n, 53n, 54n, 55n ],
  [ 38n, 39n, 46n, 54n, 55n ],
  [ 40n, 41n, 49n, 56n, 57n ],
  [ 40n, 41n, 42n, 48n, 50n, 56n, 57n, 58n ],
  [ 41n, 42n, 43n, 49n, 51n, 57n, 58n, 59n ],
  [ 42n, 43n, 44n, 50n, 52n, 58n, 59n, 60n ],
  [ 43n, 44n, 45n, 51n, 53n, 59n, 60n, 61n ],
  [ 44n, 45n, 46n, 52n, 54n, 60n, 61n, 62n ],
  [ 45n, 46n, 47n, 53n, 55n, 61n, 62n, 63n ],
  [ 46n, 47n, 54n, 62n, 63n ],
  [ 48n, 49n, 57n ],
  [ 48n, 49n, 50n, 56n, 58n ],
  [ 49n, 50n, 51n, 57n, 59n ],
  [ 50n, 51n, 52n, 58n, 60n ],
  [ 51n, 52n, 53n, 59n, 61n ],
  [ 52n, 53n, 54n, 60n, 62n ],
  [ 53n, 54n, 55n, 61n, 63n ],
  [ 54n, 55n, 62n ]
];
